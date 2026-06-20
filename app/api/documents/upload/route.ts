import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { extractText, chunkText } from '@/lib/document-processor'
import { generateEmbedding } from '@/lib/openai'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 60 // Allow up to 60s for processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const subject = formData.get('subject') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (!extension || !['pdf', 'docx', 'pptx'].includes(extension)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PDF, DOCX, or PPTX.' },
        { status: 400 }
      )
    }

    // Create document record
    const documentId = uuidv4()
    const { error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        id: documentId,
        filename: fileName,
        subject,
        file_type: extension.toUpperCase(),
        file_size: file.size,
        status: 'processing',
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Process document in background-like fashion
    // (In production, use a queue. Here we process synchronously.)
    try {
      const buffer = Buffer.from(await file.arrayBuffer())

      // Extract text
      const text = await extractText(buffer, extension)

      if (!text || text.trim().length < 50) {
        await supabaseAdmin
          .from('documents')
          .update({ status: 'error' })
          .eq('id', documentId)
        return NextResponse.json(
          { error: 'Could not extract enough text from the document' },
          { status: 400 }
        )
      }

      // Estimate page count
      const pageCount = extension === 'pdf'
        ? Math.ceil(text.length / 3000)
        : Math.ceil(text.length / 2500)

      // Chunk text
      const chunks = chunkText(text)

      // Generate embeddings and store chunks
      const chunkInserts = []
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i])
        chunkInserts.push({
          document_id: documentId,
          content: chunks[i],
          chunk_index: i,
          embedding,
        })
      }

      // Batch insert chunks
      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkInserts)

      if (chunkError) {
        console.error('Chunk insert error:', chunkError)
        await supabaseAdmin
          .from('documents')
          .update({ status: 'error' })
          .eq('id', documentId)
        return NextResponse.json({ error: 'Failed to store document chunks' }, { status: 500 })
      }

      // Update document status
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'ready',
          page_count: pageCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)

      return NextResponse.json({
        success: true,
        document: {
          id: documentId,
          filename: fileName,
          subject,
          file_type: extension.toUpperCase(),
          chunks_count: chunks.length,
          status: 'ready',
        },
      })
    } catch (processError: unknown) {
      console.error('Processing error:', processError)
      await supabaseAdmin
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId)
      const message = processError instanceof Error ? processError.message : 'Processing failed'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
