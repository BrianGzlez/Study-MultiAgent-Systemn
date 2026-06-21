'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Upload,
  Clock,
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  subject: string
  file_type: string
  page_count: number | null
  file_size: number
  status: string
  created_at: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

export default function DocumentsPage() {
  const [activeSubject, setActiveSubject] = useState('All')
  const [isDragging, setIsDragging] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSubject, setUploadSubject] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Dynamic subjects from actual documents
  const allSubjects = ['All', ...Array.from(new Set(documents.map(d => d.subject)))]

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await apiFetch('/api/documents')
      const data = await res.json()
      if (data.documents) setDocuments(data.documents)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const handleUpload = async (file: File) => {
    if (!uploadSubject.trim()) {
      setError('Escribe el nombre de la materia antes de subir el archivo')
      return
    }
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', uploadSubject.trim())

    try {
      const res = await apiFetch('/api/documents/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      await fetchDocuments()
      setUploadSubject('')
    } catch { setError('Upload failed. Please try again.') }
    finally { setUploading(false) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const filtered = activeSubject === 'All' ? documents : documents.filter(d => d.subject === activeSubject)

  return (
    <ShellLayout title="Documents" description="Your uploaded class materials">
      <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-study-rose-light border border-study-rose/20 rounded-lg text-sm text-study-rose">
            <AlertCircle className="size-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto font-semibold">✕</button>
          </div>
        )}

        {/* Upload zone */}
        <div className="flex flex-col gap-3">
          {/* Subject input */}
          <div className="flex items-center gap-3">
            <Input
              value={uploadSubject}
              onChange={(e) => setUploadSubject(e.target.value)}
              placeholder="Nombre de la materia (ej: Economía, Cálculo II, Redes...)"
              className="flex-1"
            />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer',
              isDragging ? 'border-primary bg-study-amber-light/60' : 'border-border bg-muted/30 hover:border-primary/50',
              uploading && 'opacity-50 pointer-events-none',
            )}
          >
            <div className="size-12 rounded-2xl bg-study-amber-light flex items-center justify-center">
              {uploading ? <Loader2 className="size-5 text-study-amber animate-spin" /> : <Upload className="size-5 text-study-amber" />}
            </div>
            <div className="text-center">
              {uploading ? (
                <p className="text-sm font-semibold text-foreground">Procesando documento...</p>
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  Arrastra tu archivo aquí o{' '}
                  <label htmlFor="file-upload" className="text-primary underline cursor-pointer">selecciona</label>
                </p>
              )}
              <input id="file-upload" type="file" accept=".pdf,.docx,.pptx" className="hidden" onChange={handleFileSelect} />
              <p className="text-xs text-muted-foreground mt-1">PDF, PPTX, DOCX — hasta 50 MB</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {['PDF', 'PPTX', 'DOCX'].map((ext) => (
                <Badge key={ext} variant="secondary" className="text-xs">{ext}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Subject filter — dynamic from real data */}
        {allSubjects.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            {allSubjects.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  activeSubject === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <Separator />

        {/* Documents list */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {loading ? 'Loading...' : `${filtered.length} document${filtered.length !== 1 ? 's' : ''}`}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents yet. Upload your first file above.</p>
            </div>
          ) : (
            filtered.map((doc) => (
              <Card key={doc.id} className="border hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.filename}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-secondary text-secondary-foreground">
                        {doc.subject}
                      </span>
                      {doc.page_count && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="size-3" />{doc.page_count} pages
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3" />{doc.file_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />{timeAgo(doc.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {doc.status === 'ready' ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="size-3.5" />Ready
                      </span>
                    ) : doc.status === 'processing' ? (
                      <span className="flex items-center gap-1 text-xs text-study-amber font-medium">
                        <Loader2 className="size-3.5 animate-spin" />Processing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-study-rose font-medium">
                        <AlertCircle className="size-3.5" />Error
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ShellLayout>
  )
}
