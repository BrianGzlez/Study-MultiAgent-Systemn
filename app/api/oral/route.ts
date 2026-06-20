import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 30

// POST: Create new oral session or continue existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, subject, document_id, difficulty = 'normal', user_message } = body

    // If starting new session
    if (!session_id) {
      if (!subject) {
        return NextResponse.json({ error: 'subject is required' }, { status: 400 })
      }

      // Get context from document if provided
      let context = ''
      if (document_id) {
        const { data: chunks } = await supabaseAdmin
          .from('document_chunks')
          .select('content')
          .eq('document_id', document_id)
          .order('chunk_index')
          .limit(8)

        if (chunks) {
          context = chunks.map((c) => c.content).join('\n\n')
        }
      }

      // Generate initial question
      const strictnessPrompt = getStrictnessPrompt(difficulty)
      const systemPrompt = `You are Professor AI, conducting an oral exam simulation for a university student.
Subject: ${subject}
Style: ${strictnessPrompt}

${context ? `Use this study material as reference:\n${context}\n` : ''}

Your role:
1. Ask one question at a time related to the subject
2. After the student answers, provide structured feedback
3. Be conversational but academic

Start by greeting the student and asking your first question about ${subject}.

IMPORTANT: Respond with valid JSON only:
{
  "message": "Your question or response text",
  "feedback": null
}

For the first message, feedback should be null. For subsequent responses after a student answer, include:
{
  "message": "Your follow-up question or comment",
  "feedback": {
    "good": "What was good about their answer",
    "missing": "What was missing or could be improved",
    "better": "A more complete answer would be...",
    "followUp": "A follow-up question"
  }
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Start the oral exam session.' },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      let parsed = parseAIResponse(response.choices[0].message.content || '')

      // Create session
      const newSessionId = uuidv4()
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: response.choices[0].message.content },
      ]

      await supabaseAdmin.from('oral_sessions').insert({
        id: newSessionId,
        subject,
        document_id: document_id || null,
        difficulty,
        messages,
        questions_asked: 1,
      })

      return NextResponse.json({
        session_id: newSessionId,
        message: parsed.message,
        feedback: null,
      })
    }

    // Continue existing session
    if (!user_message) {
      return NextResponse.json({ error: 'user_message is required' }, { status: 400 })
    }

    // Get existing session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('oral_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Build messages array for context
    const existingMessages = (session.messages as Array<{ role: string; content: string }>) || []
    const newMessages = [
      ...existingMessages,
      { role: 'user', content: user_message },
    ]

    // Add instruction for response format
    const formatInstruction = {
      role: 'user' as const,
      content: `The student just answered: "${user_message}"

Evaluate their answer and provide feedback, then ask a follow-up question. Respond with valid JSON only:
{
  "message": "Your follow-up response and next question",
  "feedback": {
    "good": "What was good about their answer",
    "missing": "What was missing",
    "better": "A better answer would include...",
    "followUp": "Your next question for the student"
  }
}`,
    }

    const apiMessages = [
      ...existingMessages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: user_message },
      formatInstruction,
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 600,
    })

    const aiContent = response.choices[0].message.content || ''
    const parsed = parseAIResponse(aiContent)

    // Update session
    newMessages.push({ role: 'assistant', content: aiContent })

    await supabaseAdmin
      .from('oral_sessions')
      .update({
        messages: newMessages,
        questions_asked: (session.questions_asked || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id)

    return NextResponse.json({
      session_id,
      message: parsed.message,
      feedback: parsed.feedback,
    })
  } catch (error: unknown) {
    console.error('Oral API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process oral session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getStrictnessPrompt(difficulty: string): string {
  switch (difficulty) {
    case 'chill':
      return 'Be supportive and encouraging. Give hints when the student struggles. Be patient and kind.'
    case 'strict':
      return 'Be demanding like a strict professor. No hints. Expect precise, complete answers. Challenge everything.'
    default:
      return 'Be balanced. Helpful but honest. Point out mistakes directly but encourage improvement.'
  }
}

function parseAIResponse(content: string): { message: string; feedback: unknown } {
  try {
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    const parsed = JSON.parse(jsonStr)
    return {
      message: parsed.message || content,
      feedback: parsed.feedback || null,
    }
  } catch {
    // If JSON parsing fails, return raw text
    return { message: content, feedback: null }
  }
}
