'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Timer, Flag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question_text: string
  options: Record<string, string>
  difficulty: string
  topic: string
}

interface Exam {
  id: string
  title: string
  subject: string
  question_count: number
}

function ExamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get('id')

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!examId) return

    fetch(`/api/exams/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exam && data.questions) {
          setExam(data.exam)
          setQuestions(data.questions)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [examId])

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const handleSubmit = async () => {
    if (!examId) return
    setSubmitting(true)

    const answers = Object.entries(selected).map(([question_id, user_answer]) => ({
      question_id,
      user_answer,
    }))

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          total_time_seconds: seconds,
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/practice/results?id=${examId}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ShellLayout title="Practice Exam" description="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </ShellLayout>
    )
  }

  if (!exam || questions.length === 0) {
    return (
      <ShellLayout title="Practice Exam" description="Error">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Exam not found or has no questions.</p>
          <Button onClick={() => router.push('/practice')}>Back to Practice</Button>
        </div>
      </ShellLayout>
    )
  }

  const q = questions[current]
  const answered = Object.keys(selected).length
  const progress = ((current + 1) / questions.length) * 100

  return (
    <ShellLayout
      title={exam.title}
      description={`${exam.subject} · ${questions.length} questions`}
      actions={
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border bg-muted text-foreground border-border">
          <Timer className="size-4" />
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      }
    >
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{answered} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-colors',
                  i === current
                    ? 'bg-primary'
                    : selected[questions[i].id] !== undefined
                    ? 'bg-primary/40'
                    : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <Card className="border-2 border-border">
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="shrink-0 mt-0.5">
                Q{current + 1}
              </Badge>
              <div>
                <p className="text-base font-semibold text-foreground leading-relaxed">
                  {q.question_text}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                  <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {Object.entries(q.options).map(([letter, text]) => {
                const isSelected = selected[q.id] === letter
                return (
                  <button
                    key={letter}
                    onClick={() => setSelected((prev) => ({ ...prev, [q.id]: letter }))}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'border-primary bg-study-amber-light shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
                    )}
                  >
                    <span
                      className={cn(
                        'size-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {letter}
                    </span>
                    <span className={cn('text-sm leading-relaxed', isSelected ? 'text-foreground font-medium' : 'text-foreground')}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-study-teal text-primary-foreground hover:bg-study-teal/90"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit exam'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <ShellLayout title="Practice Exam" description="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </ShellLayout>
    }>
      <ExamContent />
    </Suspense>
  )
}
