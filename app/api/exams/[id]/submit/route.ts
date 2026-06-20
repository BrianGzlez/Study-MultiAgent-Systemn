import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface SubmitAnswer {
  question_id: string
  user_answer: string
}

interface SubmitExamRequest {
  answers: SubmitAnswer[]
  total_time_seconds: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: examId } = await params
    const body: SubmitExamRequest = await request.json()
    const { answers, total_time_seconds } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers array is required' }, { status: 400 })
    }

    // Get exam questions to check answers
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('exam_questions')
      .select('id, correct_answer')
      .eq('exam_id', examId)

    if (questionsError || !questions) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Grade each answer
    let correctCount = 0
    const updates = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.question_id)
      const isCorrect = question?.correct_answer === answer.user_answer
      if (isCorrect) correctCount++

      return {
        id: answer.question_id,
        user_answer: answer.user_answer,
        is_correct: isCorrect,
      }
    })

    // Update each question with user's answer
    for (const update of updates) {
      await supabaseAdmin
        .from('exam_questions')
        .update({
          user_answer: update.user_answer,
          is_correct: update.is_correct,
        })
        .eq('id', update.id)
    }

    // Calculate score and update exam
    const score = Math.round((correctCount / questions.length) * 100)

    await supabaseAdmin
      .from('exams')
      .update({
        status: 'completed',
        score,
        total_time_seconds,
        completed_at: new Date().toISOString(),
      })
      .eq('id', examId)

    // Determine weak topics
    const { data: incorrectQuestions } = await supabaseAdmin
      .from('exam_questions')
      .select('topic')
      .eq('exam_id', examId)
      .eq('is_correct', false)

    const weakTopics = [...new Set(incorrectQuestions?.map((q) => q.topic) || [])]

    return NextResponse.json({
      success: true,
      results: {
        score,
        correct_count: correctCount,
        total_questions: questions.length,
        total_time_seconds,
        weak_topics: weakTopics,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit exam'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
