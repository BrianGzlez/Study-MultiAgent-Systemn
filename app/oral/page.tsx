'use client'

import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
  Loader2,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feedback {
  good: string
  missing: string
  better: string
  followUp: string
}

interface Message {
  role: 'professor' | 'student'
  text: string
  feedback?: Feedback | null
}

interface Document {
  id: string
  filename: string
  subject: string
  status: string
}

export default function OralPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [activeFeedback, setActiveFeedback] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [specificTopics, setSpecificTopics] = useState('')
  const [difficulty, setDifficulty] = useState('normal')
  const [started, setStarted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        const readyDocs = (data.documents || []).filter((d: Document) => d.status === 'ready')
        setDocuments(readyDocs)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const startSession = async () => {
    if (!subject.trim()) return
    setLoading(true)
    try {
      const res = await apiFetch('/api/oral/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          document_id: selectedDoc || undefined,
          difficulty,
          topics: specificTopics.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (data.session_id) {
        setSessionId(data.session_id)
        setMessages([{ role: 'professor', text: data.message, feedback: null }])
        setStarted(true)
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'student', text: userMessage }])
    setLoading(true)

    try {
      const res = await apiFetch('/api/oral/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: userMessage,
        }),
      })

      const data = await res.json()
      if (data.message) {
        const newMsg: Message = {
          role: 'professor',
          text: data.message,
          feedback: data.feedback || null,
        }
        setMessages((prev) => [...prev, newMsg])
        if (data.feedback) {
          setActiveFeedback(messages.length + 1) // Index of the new professor message
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'professor', text: 'Sorry, I had a technical issue. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const activeFeedbackData = activeFeedback !== null ? messages[activeFeedback]?.feedback : null

  // Session setup screen
  if (!started) {
    return (
      <ShellLayout title="Oral Simulation" description="Chat with your AI professor">
        <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configura tu sesión oral</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Materia</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Microeconomía, Estadística, Redes..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Temas específicos (opcional)</label>
                <Textarea
                  value={specificTopics}
                  onChange={(e) => setSpecificTopics(e.target.value)}
                  placeholder="Ej: Equilibrio de Nash, Modelo de Cournot, Elasticidad..."
                  className="min-h-[60px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  El profesor se enfocará en estos temas. Deja vacío para preguntas generales.
                </p>
              </div>

              {documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Documento fuente (opcional)
                  </label>
                  <select
                    value={selectedDoc}
                    onChange={(e) => {
                      setSelectedDoc(e.target.value)
                      const doc = documents.find(d => d.id === e.target.value)
                      if (doc && !subject) setSubject(doc.subject)
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-card"
                  >
                    <option value="">Conocimiento general</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.filename} ({doc.subject})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Estilo del profesor</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'chill', label: 'Relajado', desc: 'Paciente, da pistas, te anima' },
                    { id: 'normal', label: 'Normal', desc: 'Equilibrado, directo pero justo' },
                    { id: 'strict', label: 'Estricto', desc: 'Exigente, sin pistas, presión real' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                        difficulty === d.id
                          ? 'border-primary bg-study-amber-light/60'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full border-2',
                        difficulty === d.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={startSession} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Starting session...
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Start oral exam
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ShellLayout>
    )
  }

  return (
    <ShellLayout
      title="Oral Simulation"
      description="Chat with your AI professor"
      actions={
        <Badge variant="secondary" className="gap-1.5">
          <div className="size-1.5 rounded-full bg-green-500" />
          {subject} session
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
                    <div className={cn('flex items-start gap-3', msg.role === 'student' && 'flex-row-reverse')}>
                      <div className={cn(
                        'size-8 rounded-full flex items-center justify-center shrink-0',
                        msg.role === 'professor' ? 'bg-study-blue-light' : 'bg-study-amber-light',
                      )}>
                        {msg.role === 'professor' ? (
                          <GraduationCap className="size-4 text-study-blue" />
                        ) : (
                          <User className="size-4 text-study-amber" />
                        )}
                      </div>
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        msg.role === 'professor'
                          ? 'bg-muted text-foreground rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm',
                      )}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                    {msg.feedback && (
                      <div className="ml-11">
                        <button
                          onClick={() => setActiveFeedback(activeFeedback === i ? null : i)}
                          className="flex items-center gap-1 text-xs text-study-teal hover:underline"
                        >
                          <Lightbulb className="size-3" />
                          {activeFeedback === i ? 'Hide feedback' : 'View feedback'}
                          <ChevronRight className={cn('size-3 transition-transform', activeFeedback === i && 'rotate-90')} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full flex items-center justify-center bg-study-blue-light">
                      <GraduationCap className="size-4 text-study-blue" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
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
                disabled={loading}
              />
              <div className="flex items-center justify-end">
                <Button onClick={handleSend} disabled={!input.trim() || loading} size="sm">
                  Send answer
                  <Send className="size-4 ml-1" />
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
                    Click &quot;View feedback&quot; on a professor message to see detailed feedback.
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
                    <span className="text-foreground font-medium">{subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty</span>
                    <span className="text-foreground font-medium capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions asked</span>
                    <span className="text-foreground font-medium">
                      {messages.filter((m) => m.role === 'professor').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your answers</span>
                    <span className="text-foreground font-medium">
                      {messages.filter((m) => m.role === 'student').length}
                    </span>
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
