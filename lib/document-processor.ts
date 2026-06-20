import mammoth from 'mammoth'

/**
 * Extract text content from uploaded files based on file type
 */
export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return extractFromPDF(buffer)
    case 'docx':
      return extractFromDOCX(buffer)
    case 'pptx':
      return extractFromPPTX(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return data.text
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractFromPPTX(buffer: Buffer): Promise<string> {
  // PPTX files are ZIP archives containing XML files
  // We'll use a simple approach: extract text from the XML content
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buffer)

  const slideTexts: string[] = []
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort()

  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('string')
    // Extract text from XML tags <a:t>...</a:t>
    const textMatches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g)
    if (textMatches) {
      const slideText = textMatches
        .map((match) => match.replace(/<[^>]+>/g, ''))
        .join(' ')
      slideTexts.push(slideText)
    }
  }

  return slideTexts.join('\n\n')
}

/**
 * Split text into chunks for embedding
 */
export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  const sentences = text.split(/(?<=[.!?])\s+/)

  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      // Keep overlap from the end of the current chunk
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.ceil(overlap / 5))
      currentChunk = overlapWords.join(' ') + ' ' + sentence
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter((chunk) => chunk.length > 50) // Filter out very small chunks
}
