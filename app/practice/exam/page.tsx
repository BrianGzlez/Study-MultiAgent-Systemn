'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Timer, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

const questions = [
  {
    question: 'What does the Central Limit Theorem state about the distribution of sample means as sample size increases?',
    options: [
      'It approaches a normal distribution regardless of the population distribution',
      'It follows a Poisson distribution for large samples',
      'It depends only on the variance of the original distribution',
      'It is always right-skewed for small samples',
    ],
    correct: 0,
  },
  {
    question: 'In Embedded Systems, what is a "race condition"?',
    options: [
      'A condition where the CPU runs faster than expected',
      'A situation where the output depends on the timing of events in an uncontrolled way',
      'A hardware fault caused by overclocking',
      'A software pattern for optimizing parallel tasks',
    ],
    correct: 1,
  },
  {
    question: 'What does GDP stand for in Macroeconomics?',
    options: [
      'Gross Domestic Product',
      'General Demand Projection',
      'Government Deficit Plan',
      'Gross Depreciation Percentage',
    ],
    correct: 0,
  },
  {
    question: 'Which probability distribution is characterized by a fixed number of trials and two outcomes?',
    options: [
      'Normal distribution',
      'Poisson distribution',
      'Binomial distribution',
      'Exponential distribution',
    ],
    correct: 2,
  },
  {
    question: 'What is an interrupt in the context of embedded systems?',
    options: [
      'A delay in CPU processing',
      'A signal that temporarily halts the CPU to handle an event',
      'A type of memory overflow error',
      'A method for increasing clock speed',
    ],
    correct: 1,
  },
]

export default function ExamPage() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [seconds, setSeconds] = useState(25 * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isLow = seconds < 5 * 60

  const answered = Object.keys(selected).length
  const progress = ((current + 1) / questions.length) * 100

  const q = questions[current]

  return (
    <ShellLayout
      title="Practice Exam"
      description="Statistics · 5 questions"
      actions={
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border', isLow ? 'bg-study-rose-light text-study-rose border-study-rose/30' : 'bg-muted text-foreground border-border')}>
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
                    : selected[i] !== undefined
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
              <p className="text-base font-semibold text-foreground leading-relaxed text-balance">
                {q.question}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected[current] === i
                return (
                  <button
                    key={i}
                    onClick={() => setSelected((prev) => ({ ...prev, [current]: i }))}
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
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={cn('text-sm leading-relaxed', isSelected ? 'text-foreground font-medium' : 'text-foreground')}>
                      {opt}
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
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <Flag className="size-3.5" />
              Flag
            </Button>

            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            ) : (
              <Link href="/practice/results">
                <Button className="bg-study-teal text-primary-foreground hover:bg-study-teal/90">
                  Submit exam
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
