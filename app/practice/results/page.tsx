'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  Target,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamQuestion {
  id: string
  question_text: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  difficulty: string
  topic: string
  user_answer: string | null
  is_correct: boolean | null
}

interface Exam {
  id: string
  title: string
  subject: string
  score: number | null
  question_count: number
  total_time_seconds: number | null
  completed_at: string | null
}

function ScoreBadge({ pct }: { pct: number }) {
  if (pct >= 80) return <span className="text-green-600 font-bold">Excellent</span>
  if (pct >= 60) return <span className="text-study-amber font-bold">Good effort</span>
  return <span className="text-study-rose font-bold">Needs work</span>
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const examId = searchParams.get('id')

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showExplanations, setShowExplanations] = useState(false)

  useEffect(() => {
    if (!examId) return

    apiFetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exam) setExam(data.exam)
        if (data.questions) setQuestions(data.questions)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [examId])

  if (loading) {
    return (
      <ShellLayout title="Exam Results" description="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </ShellLayout>
    )
  }

  if (!exam) {
    return (
      <ShellLayout title="Exam Results" description="Not found">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Exam results not found.</p>
          <Link href="/practice">
            <Button>Back to Practice</Button>
          </Link>
        </div>
      </ShellLayout>
    )
  }

  const score = exam.score || 0
  const correctCount = questions.filter((q) => q.is_correct).length
  const totalTime = exam.total_time_seconds || 0
  const avgTime = questions.length > 0 ? (totalTime / questions.length / 60).toFixed(1) : '0'
  const weakTopics = [...new Set(
    questions.filter((q) => !q.is_correct).map((q) => q.topic)
  )]

  return (
    <ShellLayout title="Exam Results" description={`${exam.subject} · ${questions.length} questions`}>
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Score card */}
        <Card className="border-2 border-primary/20 bg-study-amber-light/30">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="size-20 rounded-full bg-card border-4 border-primary flex items-center justify-center shadow-sm">
              <span className="text-2xl font-black text-primary">{score}%</span>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {correctCount} / {questions.length} correct — <ScoreBadge pct={score} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Finished in {Math.floor(totalTime / 60)} minutes. Average: {avgTime} min/question.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="size-4" />
                <span className="text-sm font-semibold">{correctCount} correct</span>
              </div>
              <div className="flex items-center gap-1.5 text-study-rose">
                <XCircle className="size-4" />
                <span className="text-sm font-semibold">{questions.length - correctCount} incorrect</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <Card className="border-study-rose/20 bg-study-rose-light/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Target className="size-4 text-study-rose mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Weak topics to review</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weakTopics.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show/hide explanations toggle */}
        <Button
          variant="outline"
          onClick={() => setShowExplanations(!showExplanations)}
          className="w-full"
        >
          <Lightbulb className="size-4 mr-2" />
          {showExplanations ? 'Hide explanations' : 'Show all explanations'}
        </Button>

        {/* Question review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Question review</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {questions.map((q, i) => (
              <div key={q.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {q.is_correct ? (
                      <CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <XCircle className="size-4 text-study-rose" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {i + 1}. {q.question_text}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div
                        className={cn(
                          'flex items-start gap-2 px-3 py-2 rounded-lg text-xs border',
                          q.is_correct
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-study-rose-light border-study-rose/20 text-study-rose',
                        )}
                      >
                        <span className="font-semibold shrink-0">
                          {q.is_correct ? 'Your answer' : 'You answered'}:
                        </span>
                        <span>{q.user_answer ? q.options[q.user_answer] || q.user_answer : 'Not answered'}</span>
                      </div>
                      {!q.is_correct && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs bg-green-50 border border-green-200 text-green-700">
                          <span className="font-semibold shrink-0">Correct:</span>
                          <span>{q.options[q.correct_answer]}</span>
                        </div>
                      )}
                    </div>
                    {showExplanations && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        <Lightbulb className="size-3.5 shrink-0 mt-0.5 text-study-amber" />
                        <span className="leading-relaxed">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
                {i < questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/practice" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <RotateCcw className="size-4" />
              New exam
            </Button>
          </Link>
          <Link href="/documents" className="flex-1">
            <Button className="w-full gap-2">
              <BookOpen className="size-4" />
              Study documents
            </Button>
          </Link>
        </div>
      </div>
    </ShellLayout>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <ShellLayout title="Exam Results" description="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </ShellLayout>
    }>
      <ResultsContent />
    </Suspense>
  )
}
