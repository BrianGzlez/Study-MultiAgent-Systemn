'use client'

import { useState, useRef, useEffect } from 'react'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Mic2,
  Send,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  role: 'professor' | 'student'
  text: string
  feedback?: {
    good: string
    missing: string
    better: string
    followUp: string
  }
}

const initialMessages: Message[] = [
  {
    role: 'professor',
    text: "Good morning! I'm Professor AI, and today we'll be covering Statistics. Let's start with something fundamental: Can you explain to me what the Central Limit Theorem is and why it's important in statistics?",
  },
  {
    role: 'student',
    text: "The Central Limit Theorem says that if you take enough samples from a population, the average of those samples will follow a normal distribution, no matter how the original population is distributed. It's important because it lets us use normal distribution formulas even when the underlying data isn't normally distributed.",
  },
  {
    role: 'professor',
    text: 'Good answer! You touched on the core idea. Now let me push a bit further — what sample size is generally considered "large enough" for the CLT to apply, and are there any exceptions?',
    feedback: {
      good: 'You correctly identified the key idea: the distribution of sample means approaches normal regardless of the population shape.',
      missing: 'You did not mention the typical threshold (n ≥ 30), nor did you address exceptions for heavy-tailed or highly skewed distributions.',
      better: 'For a complete answer, mention n ≥ 30 as the common rule of thumb, note that skewed or heavy-tailed distributions may require larger samples, and explain why this theorem enables inference on non-normal populations.',
      followUp: 'What happens when the original population is very skewed — does the CLT still hold with n = 30?',
    },
  },
]

export default function OralPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [activeFeedback, setActiveFeedback] = useState<number | null>(2)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const studentMsg: Message = { role: 'student', text: input }
    const profReply: Message = {
      role: 'professor',
      text: "That's a thoughtful answer. You're right that heavily skewed distributions require a larger sample size. Let's move on — can you describe how you would set up a hypothesis test for comparing two population means?",
      feedback: {
        good: 'You correctly addressed the exception for skewed distributions.',
        missing: 'You could mention the concept of kurtosis and its effect on convergence speed.',
        better: 'Include the role of kurtosis: heavy-tailed (high kurtosis) distributions converge more slowly to normality.',
        followUp: 'How does the choice of significance level α affect the risk of Type I errors?',
      },
    }
    setMessages((prev) => [...prev, studentMsg, profReply])
    setActiveFeedback(messages.length + 1)
    setInput('')
  }

  const activeFeedbackData = activeFeedback !== null ? messages[activeFeedback]?.feedback : null

  return (
    <ShellLayout
      title="Oral Simulation"
      description="Chat with your AI professor"
      actions={
        <Badge variant="secondary" className="gap-1.5">
          <div className="size-1.5 rounded-full bg-green-500" />
          Statistics session
        </Badge>
      }
    >
      <div className="p-6 max-w-6xl mx-auto flex flex-col gap-4 h-[calc(100vh-73px)]">
        <div className="flex-1 grid grid-cols-1 gap-4 lg:grid-cols-3 min-h-0">
          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <ScrollArea className="flex-1 rounded-xl border border-border bg-card" ref={scrollRef as React.RefObject<HTMLDivElement>}>
              <div className="flex flex-col gap-4 p-4">
                {messages.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div
                      className={cn(
                        'flex items-start gap-3',
                        msg.role === 'student' && 'flex-row-reverse',
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'size-8 rounded-full flex items-center justify-center shrink-0',
                          msg.role === 'professor'
                            ? 'bg-study-blue-light'
                            : 'bg-study-amber-light',
                        )}
                      >
                        {msg.role === 'professor' ? (
                          <GraduationCap className="size-4 text-study-blue" />
                        ) : (
                          <User className="size-4 text-study-amber" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3',
                          msg.role === 'professor'
                            ? 'bg-muted text-foreground rounded-tl-sm'
                            : 'bg-primary text-primary-foreground rounded-tr-sm',
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>

                    {/* Feedback toggle */}
                    {msg.feedback && (
                      <div className="ml-11">
                        <button
                          onClick={() => setActiveFeedback(activeFeedback === i ? null : i)}
                          className="flex items-center gap-1 text-xs text-study-teal hover:underline"
                        >
                          <Lightbulb className="size-3" />
                          {activeFeedback === i ? 'Hide feedback' : 'View feedback on your last answer'}
                          <ChevronRight className={cn('size-3 transition-transform', activeFeedback === i && 'rotate-90')} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex flex-col gap-2 mt-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                className="resize-none min-h-[80px] bg-card"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Mic2 className="size-4" />
                  Record voice
                </Button>
                <Button onClick={handleSend} disabled={!input.trim()} size="sm">
                  Send answer
                  <Send data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback panel */}
          <div className="flex flex-col gap-3 overflow-auto">
            {activeFeedbackData ? (
              <Card className="border-study-teal/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Lightbulb className="size-4 text-study-amber" />
                    Answer feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      What was good
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-5">
                      {activeFeedbackData.good}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-study-rose font-semibold">
                      <AlertCircle className="size-3.5" />
                      What was missing
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-5">
                      {activeFeedbackData.missing}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-study-blue font-semibold">
                      <Lightbulb className="size-3.5" />
                      Better answer
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-xs pl-5">
                      {activeFeedbackData.better}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-study-amber font-semibold">
                      <ArrowRight className="size-3.5" />
                      Follow-up question
                    </div>
                    <div className="bg-study-amber-light/50 border border-study-amber/20 rounded-lg px-3 py-2 text-xs text-foreground leading-relaxed">
                      {activeFeedbackData.followUp}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <Lightbulb className="size-6 text-study-amber/60" />
                  <p className="text-sm">
                    Click &quot;View feedback&quot; on a professor message to see detailed feedback on your answer.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Session info */}
            <Card>
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Session info</p>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subject</span>
                    <span className="text-foreground font-medium">Statistics</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty</span>
                    <span className="text-foreground font-medium">Normal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions asked</span>
                    <span className="text-foreground font-medium">{messages.filter((m) => m.role === 'professor').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your answers</span>
                    <span className="text-foreground font-medium">{messages.filter((m) => m.role === 'student').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
