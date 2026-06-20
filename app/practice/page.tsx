'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardList,
  Sparkles,
  BarChart2,
  Cpu,
  TrendingUp,
  BookOpen,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sources = [
  { id: 'stats', label: 'Statistics', icon: BarChart2, color: 'text-study-amber', bg: 'bg-study-amber-light' },
  { id: 'embedded', label: 'Embedded Systems', icon: Cpu, color: 'text-study-blue', bg: 'bg-study-blue-light' },
  { id: 'econ', label: 'Macroeconomics', icon: TrendingUp, color: 'text-study-teal', bg: 'bg-study-teal-light' },
  { id: 'math', label: 'Mathematics', icon: BookOpen, color: 'text-study-rose', bg: 'bg-study-rose-light' },
]

const difficulties = ['Easy', 'Medium', 'Hard', 'Mixed']
const questionTypes = ['Multiple Choice', 'True / False', 'Mixed']

const recentExams = [
  { subject: 'Statistics', score: '14/20', pct: 70, date: '2 hours ago' },
  { subject: 'Embedded Systems', score: '9/15', pct: 60, date: 'Yesterday' },
  { subject: 'Macroeconomics', score: '18/25', pct: 72, date: '3 days ago' },
]

export default function PracticePage() {
  const [selectedSource, setSelectedSource] = useState('stats')
  const [numQuestions, setNumQuestions] = useState([15])
  const [difficulty, setDifficulty] = useState('Mixed')
  const [questionType, setQuestionType] = useState('Multiple Choice')

  return (
    <ShellLayout title="Practice Exam" description="Generate a custom exam from your materials">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Config panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choose source</CardTitle>
                <CardDescription>Pick a subject or document to generate from</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {sources.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSource(s.id)}
                      className={cn(
                        'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                        selectedSource === s.id
                          ? 'border-primary bg-study-amber-light/60 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <div className={cn('size-8 rounded-lg flex items-center justify-center', s.bg)}>
                        <Icon className={cn('size-4', s.color)} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Number of questions</CardTitle>
                <CardDescription>{numQuestions[0]} questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Slider
                  min={5}
                  max={40}
                  step={5}
                  value={numQuestions}
                  onValueChange={setNumQuestions}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5</span>
                  <span>40</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                        difficulty === d
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Question type</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {questionTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuestionType(t)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                        questionType === t
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Link href="/practice/exam">
              <Button className="w-full" size="lg">
                <Sparkles data-icon="inline-start" />
                Create practice exam
              </Button>
            </Link>
          </div>

          {/* Recent exams sidebar */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent exams</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {recentExams.map((e, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{e.subject}</span>
                      <span className="text-xs text-muted-foreground">{e.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${e.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-10 text-right">
                        {e.score}
                      </span>
                    </div>
                    {i < recentExams.length - 1 && <Separator className="mt-1" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preview question card */}
            <Card className="border-study-teal/20 bg-study-teal-light/20">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="size-3.5 text-study-teal" />
                  <span className="text-xs font-semibold text-study-teal uppercase tracking-wide">
                    Sample question
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  What does the Central Limit Theorem state about the distribution of sample means?
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  {[
                    'It approaches a normal distribution',
                    'It follows a Poisson distribution',
                    'It depends on sample size only',
                    'It is always skewed right',
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border',
                        i === 0
                          ? 'bg-study-teal-light border-study-teal/30 text-study-teal font-medium'
                          : 'bg-card border-border text-muted-foreground',
                      )}
                    >
                      <span className="size-4 rounded-full border flex items-center justify-center shrink-0 text-[10px]">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Link href="/practice/exam">
              <Button variant="outline" className="w-full gap-1.5" size="sm">
                Preview questions
                <ChevronRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
