'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Upload,
  Cpu,
  BarChart2,
  TrendingUp,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
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

const subjects = ['All', 'Statistics', 'Embedded Systems', 'Economics', 'Mathematics', 'Other']

const subjectIcons: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  Statistics: { icon: BarChart2, color: 'text-study-amber', bg: 'bg-study-amber-light' },
  'Embedded Systems': { icon: Cpu, color: 'text-study-blue', bg: 'bg-study-blue-light' },
  Economics: { icon: TrendingUp, color: 'text-study-teal', bg: 'bg-study-teal-light' },
  Mathematics: { icon: BookOpen, color: 'text-study-rose', bg: 'bg-study-rose-light' },
}

const subjectColors: Record<string, string> = {
  Statistics: 'bg-study-amber-light text-study-amber border-study-amber/20',
  'Embedded Systems': 'bg-study-blue-light text-study-blue border-study-blue/20',
  Economics: 'bg-study-teal-light text-study-teal border-study-teal/20',
  Mathematics: 'bg-study-rose-light text-study-rose border-study-rose/20',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [uploadSubject, setUploadSubject] = useState('Statistics')
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch {
      console.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', uploadSubject)

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      // Refresh documents list
      await fetchDocuments()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
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

  const filtered =
    activeSubject === 'All'
      ? documents
      : documents.filter((d) => d.subject === activeSubject)

  return (
    <ShellLayout
      title="Documents"
      description="Your uploaded class materials"
      actions={
        <label htmlFor="file-upload-btn">
          <Button size="sm" asChild>
            <span>
              <Upload className="size-4 mr-1.5" />
              Upload
            </span>
          </Button>
          <input
            id="file-upload-btn"
            type="file"
            accept=".pdf,.docx,.pptx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      }
    >
      <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-study-rose-light border border-study-rose/20 rounded-lg text-sm text-study-rose">
            <AlertCircle className="size-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto font-semibold">✕</button>
          </div>
        )}

        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-study-amber-light/60'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/60',
            uploading && 'opacity-50 pointer-events-none',
          )}
        >
          <div className="size-12 rounded-2xl bg-study-amber-light flex items-center justify-center">
            {uploading ? (
              <Loader2 className="size-5 text-study-amber animate-spin" />
            ) : (
              <Upload className="size-5 text-study-amber" />
            )}
          </div>
          <div className="text-center">
            {uploading ? (
              <p className="text-sm font-semibold text-foreground">Processing document...</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Drop your files here, or{' '}
                  <label htmlFor="file-upload" className="text-primary underline underline-offset-2 cursor-pointer">
                    browse
                  </label>
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, PPTX, DOCX — up to 50 MB each
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {['PDF', 'PPTX', 'DOCX'].map((ext) => (
              <Badge key={ext} variant="secondary" className="text-xs">
                {ext}
              </Badge>
            ))}
          </div>

          {/* Subject selector for upload */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Subject:</span>
            <select
              value={uploadSubject}
              onChange={(e) => setUploadSubject(e.target.value)}
              className="text-xs border rounded-md px-2 py-1 bg-card"
            >
              {subjects.filter(s => s !== 'All').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {subjects.map((s) => (
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
            filtered.map((doc) => {
              const iconInfo = subjectIcons[doc.subject] || { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' }
              const Icon = iconInfo.icon
              return (
                <Card key={doc.id} className="border hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', iconInfo.bg)}>
                      <Icon className={cn('size-5', iconInfo.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.filename}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', subjectColors[doc.subject] || 'bg-muted text-muted-foreground border-border')}>
                          {doc.subject}
                        </span>
                        {doc.page_count && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Layers className="size-3" />
                            {doc.page_count} pages
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="size-3" />
                          {doc.file_type}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {timeAgo(doc.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === 'ready' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="size-3.5" />
                          Ready
                        </span>
                      ) : doc.status === 'processing' ? (
                        <span className="flex items-center gap-1 text-xs text-study-amber font-medium">
                          <Loader2 className="size-3.5 animate-spin" />
                          Processing
                        </span>
                      ) : doc.status === 'error' ? (
                        <span className="flex items-center gap-1 text-xs text-study-rose font-medium">
                          <AlertCircle className="size-3.5" />
                          Error
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <Sparkles className="size-3" />
                          Process
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </ShellLayout>
  )
}
