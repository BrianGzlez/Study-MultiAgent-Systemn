'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
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
  FileText,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  subject: string
  file_type: string
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

const subjectIcons: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  Statistics: { icon: BarChart2, color: 'text-study-amber', bg: 'bg-study-amber-light' },
  'Embedded Systems': { icon: Cpu, color: 'text-study-blue', bg: 'bg-study-blue-light' },
  Economics: { icon: TrendingUp, color: 'text-study-teal', bg: 'bg-study-teal-light' },
  Mathematics: { icon: BookOpen, color: 'text-study-rose', bg: 'bg-study-rose-light' },
}

const difficulties = ['easy', 'medium', 'hard', 'mixed']
const difficultyLabels: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  mixed: 'Mixed',
}

export default function PracticePage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentExams, setRecentExams] = useState<Exam[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [numQuestions, setNumQuestions] = useState([15])
  const [difficulty, setDifficulty] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch ready documents
    apiFetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        const readyDocs = (data.documents || []).filter((d: Document) => d.status === 'ready')
        setDocuments(readyDocs)
        if (readyDocs.length > 0) setSelectedDoc(readyDocs[0].id)
      })
      .catch(console.error)

    // Fetch recent exams
    apiFetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        setRecentExams((data.exams || []).slice(0, 5))
      })
      .catch(console.error)
  }, [])

  const handleGenerate = async () => {
    if (!selectedDoc) return
    setGenerating(true)
    setError(null)

    const doc = documents.find((d) => d.id === selectedDoc)

    try {
      const res = await apiFetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: selectedDoc,
          subject: doc?.subject || 'General',
          num_questions: numQuestions[0],
          difficulty,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate exam')
        return
      }

      // Navigate to the exam
      router.push(`/practice/exam?id=${data.exam.id}`)
    } catch {
      setError('Failed to generate exam. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <ShellLayout title="Practice Exam" description="Generate a custom exam from your materials">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-study-rose-light border border-study-rose/20 rounded-lg text-sm text-study-rose">
            {error}
            <button onClick={() => setError(null)} className="ml-auto font-semibold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Config panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choose source document</CardTitle>
                <CardDescription>Pick a processed document to generate questions from</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No processed documents yet.</p>
                    <p className="text-xs mt-1">Upload and process documents first.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {documents.map((doc) => {
                      const iconInfo = subjectIcons[doc.subject] || { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' }
                      const Icon = iconInfo.icon
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc.id)}
                          className={cn(
                            'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                            selectedDoc === doc.id
                              ? 'border-primary bg-study-amber-light/60 shadow-sm'
                              : 'border-border bg-card hover:border-primary/40',
                          )}
                        >
                          <div className={cn('size-8 rounded-lg flex items-center justify-center', iconInfo.bg)}>
                            <Icon className={cn('size-4', iconInfo.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate block">{doc.filename}</span>
                            <span className="text-xs text-muted-foreground">{doc.subject}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
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
                  max={30}
                  step={5}
                  value={numQuestions}
                  onValueChange={setNumQuestions}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5</span>
                  <span>30</span>
                </div>
              </CardContent>
            </Card>

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
                    {difficultyLabels[d]}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedDoc || generating}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating exam...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Create practice exam
                </>
              )}
            </Button>
          </div>

          {/* Recent exams sidebar */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent exams</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {recentExams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No exams yet. Generate your first one!
                  </p>
                ) : (
                  recentExams.map((exam, i) => (
                    <div key={exam.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{exam.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${exam.score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-12 text-right">
                          {exam.score !== null ? `${exam.score}%` : '—'}
                        </span>
                      </div>
                      {i < recentExams.length - 1 && <Separator className="mt-1" />}
                    </div>
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
