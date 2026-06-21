'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { RecentActivity } from '@/components/home/recent-activity'
import {
  Trophy, BookOpen, Target, FileText, Upload,
  ClipboardList, Mic2, ArrowRight, TrendingUp, Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  exams_done: number
  avg_score: number
  documents_count: number
  oral_sessions: number
  top_subject: string
}

interface ActivityItem {
  type: string
  label: string
  detail: string
  created_at: string | null
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    apiFetch('/api/stats/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats)
        if (data.activity) setActivity(data.activity)
      })
      .catch(console.error)
  }, [])

  const statCards = [
    { label: 'Exámenes realizados', value: stats?.exams_done ?? 0, icon: BookOpen, color: 'text-study-teal', bg: 'bg-study-teal-light' },
    { label: 'Promedio general', value: stats ? `${stats.avg_score}%` : '0%', icon: Target, color: 'text-study-amber', bg: 'bg-study-amber-light' },
    { label: 'Documentos', value: stats?.documents_count ?? 0, icon: FileText, color: 'text-study-rose', bg: 'bg-study-rose-light' },
    { label: 'Mejor materia', value: stats?.top_subject || '—', icon: Trophy, color: 'text-study-blue', bg: 'bg-study-blue-light', small: true },
  ]

  const actions = [
    { label: 'Subir material', desc: 'PDF, PPTX o DOCX', icon: Upload, href: '/documents', color: 'text-study-amber', bg: 'bg-study-amber-light' },
    { label: 'Examen de práctica', desc: 'Preguntas con IA', icon: ClipboardList, href: '/practice', color: 'text-study-teal', bg: 'bg-study-teal-light' },
    { label: 'Simulación oral', desc: 'Profesor virtual', icon: Mic2, href: '/oral', color: 'text-study-blue', bg: 'bg-study-blue-light' },
    { label: 'Mi progreso', desc: 'Temas débiles', icon: TrendingUp, href: '/practice', color: 'text-study-rose', bg: 'bg-study-rose-light' },
  ]

  return (
    <ShellLayout title="Study Room" description="Tu panel de estudio">
      <div className="p-8 flex flex-col gap-8 max-w-6xl mx-auto w-full">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            ¡Hola de nuevo!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats && stats.exams_done > 0
              ? `Llevas ${stats.exams_done} examen${stats.exams_done !== 1 ? 'es' : ''} con un promedio de ${stats.avg_score}%.`
              : 'Sube tu primer documento y comienza a practicar.'}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="flex items-center gap-3.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/40"
              >
                <div className={cn('size-11 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                  <Icon className={cn('size-5', s.color)} />
                </div>
                <div className="min-w-0">
                  <p className={cn('font-bold text-foreground leading-tight tracking-tight truncate', s.small ? 'text-base' : 'text-xl')}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main grid: actions + side */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Quick actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-foreground">Acciones rápidas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {actions.map((a) => {
                const Icon = a.icon
                return (
                  <Link key={a.label} href={a.href} className="group">
                    <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/40 transition-all hover:shadow-md hover:ring-primary/30">
                      <div className={cn('size-11 rounded-xl flex items-center justify-center shrink-0', a.bg)}>
                        <Icon className={cn('size-5', a.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{a.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Side: AI tip */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-foreground">Recomendación</h2>
            <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/40 flex flex-col gap-3 h-full">
              <div className="size-9 rounded-lg bg-study-blue-light flex items-center justify-center">
                <Brain className="size-4 text-study-blue" />
              </div>
              <p className="text-sm text-foreground leading-relaxed flex-1">
                {stats && stats.avg_score > 0 && stats.avg_score < 70
                  ? 'Tu promedio está por debajo del 70%. Te recomiendo sesiones cortas de 25 minutos enfocadas en tus temas más débiles.'
                  : stats && stats.avg_score >= 70
                  ? 'Vas por buen camino. Prueba la simulación oral para practicar explicar conceptos con tus propias palabras.'
                  : 'Empieza subiendo el material de tu próximo examen. La IA lo analiza y genera preguntas automáticamente.'}
              </p>
              <Link
                href={stats && stats.avg_score > 0 ? '/oral' : '/documents'}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
              >
                {stats && stats.avg_score > 0 ? 'Iniciar sesión oral' : 'Subir documento'}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/40">
          <RecentActivity items={activity} />
        </div>
      </div>
    </ShellLayout>
  )
}
