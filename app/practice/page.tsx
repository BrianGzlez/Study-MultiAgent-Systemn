'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  FileText,
  Loader2,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  subject: string
  status: string
}

interface Exam {
  id: string
  title: string
  subject: string
  score: number | null
  question_count: number
  created_at: string
  status: string
}

const difficulties = ['easy', 'medium', 'hard', 'mixed']
const difficultyLabels: Record<string, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', mixed: 'Mixto' }

export default function PracticePage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentExams, setRecentExams] = useState<Exam[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [customSubject, setCustomSubject] = useState('')
  const [specificTopics, setSpecificTopics] = useState('')
  const [numQuestions, setNumQuestions] = useState([15])
  const [difficulty, setDifficulty] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch('/api/documents').then(r => r.json()).then(data => {
      const readyDocs = (data.documents || []).filter((d: Document) => d.status === 'ready')
      setDocuments(readyDocs)
      if (readyDocs.length > 0) {
        setSelectedDoc(readyDocs[0].id)
        setCustomSubject(readyDocs[0].subject)
      }
    }).catch(console.error)

    apiFetch('/api/exams').then(r => r.json()).then(data => {
      setRecentExams((data.exams || []).slice(0, 5))
    }).catch(console.error)
  }, [])

  const handleGenerate = async () => {
    if (!selectedDoc) { setError('Selecciona un documento primero'); return }
    if (!customSubject.trim()) { setError('Escribe el nombre de la materia'); return }

    setGenerating(true)
    setError(null)

    try {
      const res = await apiFetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: selectedDoc,
          subject: customSubject.trim(),
          num_questions: numQuestions[0],
          difficulty,
          topics: specificTopics.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to generate exam'); return }
      router.push(`/practice/exam?id=${data.exam.id}`)
    } catch { setError('Error generando examen. Intenta de nuevo.') }
    finally { setGenerating(false) }
  }

  return (
    <ShellLayout title="Practice Exam" description="Genera un examen personalizado">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-study-rose-light border border-study-rose/20 rounded-lg text-sm text-study-rose">
            {error}
            <button onClick={() => setError(null)} className="ml-auto font-semibold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Document selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Documento fuente</CardTitle>
                <CardDescription>Selecciona de qué documento generar las preguntas</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay documentos procesados aún.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDoc(doc.id); setCustomSubject(doc.subject) }}
                        className={cn(
                          'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                          selectedDoc === doc.id
                            ? 'border-primary bg-study-amber-light/60 shadow-sm'
                            : 'border-border bg-card hover:border-primary/40',
                        )}
                      >
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{doc.filename}</span>
                          <span className="text-xs text-muted-foreground">{doc.subject}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject — free text */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Materia</CardTitle>
                <CardDescription>Escribe la materia exacta (puedes cambiar la del documento)</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Ej: Microeconomía, Cálculo Integral, Redes de Computadoras..."
                />
              </CardContent>
            </Card>

            {/* Specific topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Temas específicos (opcional)</CardTitle>
                <CardDescription>Escribe los temas que quieres que salgan en el examen. Deja vacío para cubrir todo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={specificTopics}
                  onChange={(e) => setSpecificTopics(e.target.value)}
                  placeholder="Ej: Elasticidad precio de la demanda, Equilibrio de Nash, Modelo de Cournot..."
                  className="min-h-[80px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Separa los temas con comas. El examen se enfocará en estos temas.
                </p>
              </CardContent>
            </Card>

            {/* Questions + Difficulty */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preguntas: {numQuestions[0]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider min={5} max={30} step={5} value={numQuestions} onValueChange={setNumQuestions} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>5</span><span>30</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dificultad</CardTitle>
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
                          : 'border-border text-muted-foreground hover:border-primary/50',
                      )}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!selectedDoc || generating}>
              {generating ? (
                <><Loader2 className="size-4 mr-2 animate-spin" />Generando examen...</>
              ) : (
                <><Sparkles className="size-4 mr-2" />Generar examen</>
              )}
            </Button>
          </div>

          {/* Recent exams sidebar */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Exámenes anteriores</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {recentExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aún no has hecho exámenes.
                  </p>
                ) : (
                  recentExams.map((exam, i) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        if (exam.status === 'completed') router.push(`/practice/results?id=${exam.id}`)
                        else router.push(`/practice/exam?id=${exam.id}`)
                      }}
                      className="text-left hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{exam.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${exam.score || 0}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-12 text-right">
                          {exam.score !== null ? `${exam.score}%` : 'En curso'}
                        </span>
                      </div>
                      {i < recentExams.length - 1 && <Separator className="mt-2" />}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
