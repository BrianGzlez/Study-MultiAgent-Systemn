'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { RecentActivity } from '@/components/home/recent-activity'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy, BookOpen, Target, FileText, Upload,
  ClipboardList, Mic2, ArrowRight, Sparkles, TrendingUp, Brain, Zap,
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

const quickActions = [
  {
    label: 'Subir material',
    description: 'PDF, PPTX o DOCX de tus clases',
    icon: Upload,
    href: '/documents',
    iconColor: 'text-study-amber',
    iconBg: 'bg-study-amber-light',
    border: 'border-study-amber/20 hover:border-study-amber/40',
  },
  {
    label: 'Examen de práctica',
    description: 'Preguntas generadas por IA',
    icon: ClipboardList,
    href: '/practice',
    iconColor: 'text-study-teal',
    iconBg: 'bg-study-teal-light',
    border: 'border-study-teal/20 hover:border-study-teal/40',
  },
  {
    label: 'Simulación oral',
    description: 'Practica con tu profesor IA',
    icon: Mic2,
    href: '/oral',
    iconColor: 'text-study-blue',
    iconBg: 'bg-study-blue-light',
    border: 'border-study-blue/20 hover:border-study-blue/40',
  },
  {
    label: 'Progreso',
    description: 'Análisis de temas débiles',
    icon: TrendingUp,
    href: '/practice',
    iconColor: 'text-study-rose',
    iconBg: 'bg-study-rose-light',
    border: 'border-study-rose/20 hover:border-study-rose/40',
  },
]

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

  return (
    <ShellLayout title="Study Room" description="Ready to study?">
      <div className="p-6 flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="rounded-2xl bg-study-amber-light/60 border border-study-amber/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 rounded-full bg-study-teal-light/50 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 size-24 rounded-full bg-study-blue-light/40 blur-2xl translate-y-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">StudyRoom AI</span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
              ¡Bienvenido de vuelta! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-lg leading-relaxed">
              {stats && stats.exams_done > 0
                ? `Has completado ${stats.exams_done} examen${stats.exams_done !== 1 ? 'es' : ''} con un promedio de ${stats.avg_score}%. ¡Sigue así!`
                : 'Sube tu primer documento y comienza a practicar con IA. Tu profesor virtual te espera.'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Exámenes', value: stats?.exams_done ?? '—', icon: BookOpen, iconColor: 'text-study-teal', iconBg: 'bg-study-teal-light' },
            { label: 'Promedio', value: stats ? `${stats.avg_score}%` : '—', icon: Target, iconColor: 'text-study-amber', iconBg: 'bg-study-amber-light' },
            { label: 'Documentos', value: stats?.documents_count ?? '—', icon: FileText, iconColor: 'text-study-rose', iconBg: 'bg-study-rose-light' },
            { label: 'Top materia', value: stats?.top_subject || '—', icon: Trophy, iconColor: 'text-study-blue', iconBg: 'bg-study-blue-light' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label} className="shadow-sm border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', s.iconBg)}>
                    <Icon className={cn('size-5', s.iconColor)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-extrabold text-foreground leading-none truncate">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-study-amber" />
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href}>
                  <Card className={cn(
                    'group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                    action.border,
                  )}>
                    <CardContent className="p-5 flex flex-col gap-4">
                      <div className={cn('size-11 rounded-xl flex items-center justify-center', action.iconBg)}>
                        <Icon className={cn('size-5', action.iconColor)} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Ir <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Activity + AI Tip */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity items={activity} />
          </div>
          <div>
            <Card className="border-study-blue/20 bg-study-blue-light/30">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-study-blue flex items-center justify-center">
                    <Brain className="size-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-[11px] font-bold text-study-blue uppercase tracking-wide">AI Tip</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {stats && stats.avg_score > 0 && stats.avg_score < 70
                    ? 'Tu promedio está por debajo del 70%. Enfócate en tus temas débiles con sesiones cortas de 25 minutos.'
                    : stats && stats.avg_score >= 70
                    ? '¡Vas bien! Intenta la simulación oral para practicar explicar conceptos con tus propias palabras.'
                    : 'Empieza subiendo el material de tu próximo examen. La IA lo analiza y genera preguntas automáticamente.'}
                </p>
                <Link href={stats && stats.avg_score > 0 ? '/oral' : '/documents'} className="flex items-center gap-1.5 text-xs font-bold text-study-blue hover:underline mt-1">
                  {stats && stats.avg_score > 0 ? 'Iniciar sesión oral' : 'Subir documento'}
                  <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
