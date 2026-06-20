'use client'

import { useState } from 'react'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Upload,
  Cpu,
  BarChart2,
  TrendingUp,
  BookOpen,
  MoreHorizontal,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const subjects = ['All', 'Statistics', 'Embedded Systems', 'Economics', 'Mathematics']

const documents = [
  {
    name: 'Lecture 7 — Macroeconomics',
    subject: 'Economics',
    type: 'PDF',
    pages: 24,
    uploaded: '2 days ago',
    processed: true,
    icon: TrendingUp,
    iconColor: 'text-study-teal',
    iconBg: 'bg-study-teal-light',
  },
  {
    name: 'Statistics — Probability Distributions',
    subject: 'Statistics',
    type: 'PDF',
    pages: 40,
    uploaded: '4 days ago',
    processed: true,
    icon: BarChart2,
    iconColor: 'text-study-amber',
    iconBg: 'bg-study-amber-light',
  },
  {
    name: 'Embedded Systems Slides Week 5',
    subject: 'Embedded Systems',
    type: 'PPTX',
    pages: 32,
    uploaded: '5 days ago',
    processed: true,
    icon: Cpu,
    iconColor: 'text-study-blue',
    iconBg: 'bg-study-blue-light',
  },
  {
    name: 'Linear Algebra — Eigenvalues',
    subject: 'Mathematics',
    type: 'PDF',
    pages: 18,
    uploaded: '1 week ago',
    processed: false,
    icon: BookOpen,
    iconColor: 'text-study-rose',
    iconBg: 'bg-study-rose-light',
  },
  {
    name: 'Statistics — Regression Analysis',
    subject: 'Statistics',
    type: 'DOCX',
    pages: 15,
    uploaded: '1 week ago',
    processed: true,
    icon: BarChart2,
    iconColor: 'text-study-amber',
    iconBg: 'bg-study-amber-light',
  },
]

const subjectColors: Record<string, string> = {
  Statistics: 'bg-study-amber-light text-study-amber border-study-amber/20',
  'Embedded Systems': 'bg-study-blue-light text-study-blue border-study-blue/20',
  Economics: 'bg-study-teal-light text-study-teal border-study-teal/20',
  Mathematics: 'bg-study-rose-light text-study-rose border-study-rose/20',
}

export default function DocumentsPage() {
  const [activeSubject, setActiveSubject] = useState('All')
  const [isDragging, setIsDragging] = useState(false)

  const filtered =
    activeSubject === 'All'
      ? documents
      : documents.filter((d) => d.subject === activeSubject)

  return (
    <ShellLayout
      title="Documents"
      description="Your uploaded class materials"
      actions={
        <Button size="sm">
          <Upload data-icon="inline-start" />
          Upload
        </Button>
      }
    >
      <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
          className={cn(
            'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-study-amber-light/60'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/60',
          )}
        >
          <div className="size-12 rounded-2xl bg-study-amber-light flex items-center justify-center">
            <Upload className="size-5 text-study-amber" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Drop your files here, or{' '}
              <span className="text-primary underline underline-offset-2">browse</span>
            </p>
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
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((doc) => {
            const Icon = doc.icon
            return (
              <Card
                key={doc.name}
                className="border hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', doc.iconBg)}>
                    <Icon className={cn('size-5', doc.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', subjectColors[doc.subject])}>
                        {doc.subject}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Layers className="size-3" />
                        {doc.pages} pages
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="size-3" />
                        {doc.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {doc.uploaded}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.processed ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="size-3.5" />
                        Processed
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <Sparkles className="size-3" />
                        Process notes
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </ShellLayout>
  )
}
