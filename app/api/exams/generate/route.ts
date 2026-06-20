import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { openai, generateEmbedding } from '@/lib/openai'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 60

interface GenerateExamRequest {
  document_id: string
  subject: string
  num_questions: number
  difficulty: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateExamRequest = await request.json()
    const { document_id, subject, num_questions = 20, difficulty = 'medium' } = body

    if (!document_id || !subject) {
      return NextResponse.json(
        { error: 'document_id and subject are required' },
        { status: 400 }
      )
    }

    // Get relevant chunks from the document
    // First, create a query embedding based on the subject
    const queryEmbedding = await generateEmbedding(
      `Key concepts, definitions, and important topics in ${subject}`
    )

    // Use vector similarity to get the most relevant chunks
    const { data: chunks, error: chunksError } = await supabaseAdmin.rpc(
      'match_document_chunks',
      {
        query_embedding: queryEmbedding,
        match_document_id: document_id,
        match_count: 10,
      }
    )

    if (chunksError || !chunks || chunks.length === 0) {
      // Fallback: get all chunks directly
      const { data: fallbackChunks } = await supabaseAdmin
        .from('document_chunks')
        .select('content')
        .eq('document_id', document_id)
        .order('chunk_index')
        .limit(10)

      if (!fallbackChunks || fallbackChunks.length === 0) {
        return NextResponse.json(
          { error: 'No content found for this document' },
          { status: 404 }
        )
      }

      var contextText = fallbackChunks.map((c) => c.content).join('\n\n')
    } else {
      var contextText = chunks.map((c: { content: string }) => c.content).join('\n\n')
    }

    // Generate exam questions using OpenAI
    const difficultyMap: Record<string, string> = {
      easy: 'easy (basic concepts and definitions)',
      medium: 'medium (comprehension and application)',
      hard: 'hard (analysis, synthesis, and complex cases)',
      mixed: 'mixed (varying difficulty levels)',
    }

    const prompt = `Based on the following study material, generate exactly ${num_questions} multiple-choice exam questions.

STUDY MATERIAL:
${contextText}

REQUIREMENTS:
- Generate exactly ${num_questions} questions
- Difficulty level: ${difficultyMap[difficulty] || difficultyMap.medium}
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Options should be plausible but clearly distinguishable for someone who studied
- Include a brief explanation for each correct answer
- Assign a specific topic/subtopic to each question
- Cover different aspects of the material

Respond with a valid JSON array (no markdown, no backticks):
[
  {
    "question_text": "Question text here?",
    "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
    "correct_answer": "A",
    "explanation": "Brief explanation why A is correct",
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic name"
  }
]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert professor creating exam questions. Always respond with valid JSON arrays only. No markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    })

    let questionsJson = response.choices[0].message.content?.trim() || '[]'
    // Clean potential markdown
    if (questionsJson.startsWith('```')) {
      questionsJson = questionsJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const questions = JSON.parse(questionsJson)

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate valid questions' }, { status: 500 })
    }

    // Create exam record
    const examId = uuidv4()
    const { error: examError } = await supabaseAdmin.from('exams').insert({
      id: examId,
      title: `${subject} — Practice Exam`,
      subject,
      document_id,
      difficulty,
      question_count: questions.length,
      status: 'generated',
    })

    if (examError) {
      console.error('Exam insert error:', examError)
      return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
    }

    // Insert questions
    const questionInserts = questions.map((q: Record<string, unknown>) => ({
      exam_id: examId,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      topic: q.topic || subject,
    }))

    const { error: questionsError } = await supabaseAdmin
      .from('exam_questions')
      .insert(questionInserts)

    if (questionsError) {
      console.error('Questions insert error:', questionsError)
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: examId,
        title: `${subject} — Practice Exam`,
        question_count: questions.length,
        difficulty,
      },
    })
  } catch (error: unknown) {
    console.error('Generate exam error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate exam'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
