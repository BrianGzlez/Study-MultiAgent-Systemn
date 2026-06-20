import Link from 'next/link'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const results = [
  {
    question: 'What does the Central Limit Theorem state about the distribution of sample means?',
    selected: 'It approaches a normal distribution regardless of the population distribution',
    correct: 'It approaches a normal distribution regardless of the population distribution',
    isCorrect: true,
    explanation:
      'The CLT states that the sampling distribution of the mean approaches a normal distribution as the sample size increases, regardless of the shape of the population distribution.',
  },
  {
    question: 'In Embedded Systems, what is a "race condition"?',
    selected: 'A hardware fault caused by overclocking',
    correct: 'A situation where the output depends on the timing of events in an uncontrolled way',
    isCorrect: false,
    explanation:
      'A race condition occurs when the behavior of software depends on the relative timing of events, such as thread execution order. This can lead to unpredictable results.',
  },
  {
    question: 'What does GDP stand for in Macroeconomics?',
    selected: 'Gross Domestic Product',
    correct: 'Gross Domestic Product',
    isCorrect: true,
    explanation:
      'GDP (Gross Domestic Product) is the total monetary value of all goods and services produced within a country in a specific time period.',
  },
  {
    question: 'Which probability distribution is characterized by a fixed number of trials and two outcomes?',
    selected: 'Normal distribution',
    correct: 'Binomial distribution',
    isCorrect: false,
    explanation:
      'The Binomial distribution models the number of successes in a fixed number of independent trials, each with exactly two possible outcomes (success or failure).',
  },
  {
    question: 'What is an interrupt in the context of embedded systems?',
    selected: 'A signal that temporarily halts the CPU to handle an event',
    correct: 'A signal that temporarily halts the CPU to handle an event',
    isCorrect: true,
    explanation:
      'An interrupt is a signal sent to the CPU by hardware or software indicating an event that requires immediate attention, causing the CPU to pause and handle the event.',
  },
]

const score = results.filter((r) => r.isCorrect).length
const total = results.length
const pct = Math.round((score / total) * 100)

const weakTopics = ['Probability distributions', 'Race conditions in OS']

function ScoreBadge({ pct }: { pct: number }) {
  if (pct >= 80) return <span className="text-green-600 font-bold">Excellent</span>
  if (pct >= 60) return <span className="text-study-amber font-bold">Good effort</span>
  return <span className="text-study-rose font-bold">Needs work</span>
}

export default function ResultsPage() {
  return (
    <ShellLayout title="Exam Results" description="Statistics · 5 questions">
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Score card */}
        <Card className="border-2 border-primary/20 bg-study-amber-light/30">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="size-20 rounded-full bg-card border-4 border-primary flex items-center justify-center shadow-sm">
              <span className="text-2xl font-black text-primary">{pct}%</span>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {score} / {total} correct — <ScoreBadge pct={pct} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You finished in 18 minutes. Average answer time: 3.6 min/question.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="size-4" />
                <span className="text-sm font-semibold">{score} correct</span>
              </div>
              <div className="flex items-center gap-1.5 text-study-rose">
                <XCircle className="size-4" />
                <span className="text-sm font-semibold">{total - score} incorrect</span>
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
              <Link href="/practice?mode=weak">
                <Button size="sm" variant="outline" className="shrink-0 gap-1.5">
                  Practice
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Question review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Question review</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {results.map((r, i) => (
              <div key={i}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {r.isCorrect ? (
                      <CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <XCircle className="size-4 text-study-rose" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {i + 1}. {r.question}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div
                        className={cn(
                          'flex items-start gap-2 px-3 py-2 rounded-lg text-xs border',
                          r.isCorrect
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-study-rose-light border-study-rose/20 text-study-rose',
                        )}
                      >
                        <span className="font-semibold shrink-0">
                          {r.isCorrect ? 'Your answer' : 'You answered'}:
                        </span>
                        <span>{r.selected}</span>
                      </div>
                      {!r.isCorrect && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs bg-green-50 border border-green-200 text-green-700">
                          <span className="font-semibold shrink-0">Correct:</span>
                          <span>{r.correct}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                      <Lightbulb className="size-3.5 shrink-0 mt-0.5 text-study-amber" />
                      <span className="leading-relaxed">{r.explanation}</span>
                    </div>
                  </div>
                </div>
                {i < results.length - 1 && <Separator className="mt-4" />}
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
          <Link href="/practice?mode=weak" className="flex-1">
            <Button className="w-full gap-2">
              <BookOpen className="size-4" />
              Practice mistakes
            </Button>
          </Link>
        </div>
      </div>
    </ShellLayout>
  )
}
