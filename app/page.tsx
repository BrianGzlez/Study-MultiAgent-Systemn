'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { RecentActivity } from '@/components/home/recent-activity'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy, BookOpen, Target, FileText, Upload,
  ClipboardList, Mic2, ArrowRight, Sparkles, TrendingUp,
  Brain, Zap,
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
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  {
    label: 'Examen de práctica',
    description: 'Preguntas generadas por IA',
    icon: ClipboardList,
    href: '/practice',
    gradient: 'from-teal-500/10 to-emerald-500/10',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
  },
  {
    label: 'Simulación oral',
    description: 'Practica con tu profesor IA',
    icon: Mic2,
    href: '/oral',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
  },
  {
    label: 'Progreso',
    description: 'Análisis de temas débiles',
    icon: TrendingUp,
    href: '/practice',
    gradient: 'from-rose-500/10 to-pink-500/10',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
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
        {/* Hero greeting */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-study-amber-light/50 to-study-teal-light/30 border border-primary/10 p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="size-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">StudyRoom AI</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              ¡Bienvenido de vuelta! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-md">
              {stats && stats.exams_done > 0
                ? `Has completado ${stats.exams_done} examen${stats.exams_done !== 1 ? 'es' : ''}${stats.avg_score > 0 ? ` con un promedio de ${stats.avg_score}%` : ''}. ¡Sigue así!`
                : 'Sube tu primer documento y comienza a practicar con IA.'}
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 size-24 rounded-full bg-study-teal/5 blur-xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Exámenes', value: stats?.exams_done ?? '—', icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Promedio', value: stats ? `${stats.avg_score}%` : '—', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Documentos', value: stats?.documents_count ?? '—', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'Top materia', value: stats?.top_subject || '—', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label} className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn('size-10 rounded-xl flex items-center justify-center', s.bg)}>
                    <Icon className={cn('size-5', s.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Acciones rápidas
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <CardContent className={cn('p-5 flex flex-col gap-4 bg-gradient-to-br', action.gradient)}>
                      <div className={cn('size-11 rounded-xl flex items-center justify-center shadow-sm', action.iconBg)}>
                        <Icon className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ir</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* AI tip + Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity items={activity} />
          </div>
          <div>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-study-blue-light/30">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Tip</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {stats && stats.avg_score > 0 && stats.avg_score < 70
                    ? 'Tu promedio está por debajo del 70%. Enfócate en tus temas débiles con sesiones cortas de 25 minutos.'
                    : stats && stats.avg_score >= 70
                    ? '¡Vas bien! Intenta la simulación oral para practicar explicar conceptos con tus propias palabras.'
                    : 'Empieza subiendo el material de tu próximo examen. El IA lo analiza y genera preguntas automáticamente.'}
                </p>
                <Link href={stats && stats.avg_score > 0 ? '/oral' : '/documents'} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-1">
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
