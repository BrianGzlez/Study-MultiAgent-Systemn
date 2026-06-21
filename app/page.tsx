'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { RecentActivity } from '@/components/home/recent-activity'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy, BookOpen, Target, FileText, Upload,
  ClipboardList, Mic2, ArrowRight, TrendingUp, Brain, Zap,
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

  return (
    <ShellLayout title="Study Room" description="">
      <div className="p-5 flex flex-col gap-5 max-w-5xl mx-auto">
        {/* Greeting — compact */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              ¡Hola de nuevo! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              {stats && stats.exams_done > 0
                ? `${stats.exams_done} examen${stats.exams_done !== 1 ? 'es' : ''} · Promedio ${stats.avg_score}%`
                : 'Sube un documento para empezar'}
            </p>
          </div>
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="size-4 text-primary-foreground" />
          </div>
        </div>

        {/* Stats — inline compact */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Exámenes', value: stats?.exams_done ?? '—', icon: BookOpen, iconColor: 'text-study-teal', iconBg: 'bg-study-teal-light' },
            { label: 'Promedio', value: stats ? `${stats.avg_score}%` : '—', icon: Target, iconColor: 'text-study-amber', iconBg: 'bg-study-amber-light' },
            { label: 'Docs', value: stats?.documents_count ?? '—', icon: FileText, iconColor: 'text-study-rose', iconBg: 'bg-study-rose-light' },
            { label: 'Top', value: stats?.top_subject || '—', icon: Trophy, iconColor: 'text-study-blue', iconBg: 'bg-study-blue-light' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex flex-col items-center text-center p-3 rounded-xl bg-card shadow-sm">
                <div className={cn('size-8 rounded-lg flex items-center justify-center mb-1.5', s.iconBg)}>
                  <Icon className={cn('size-4', s.iconColor)} />
                </div>
                <p className="text-base font-bold text-foreground leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick actions — horizontal, compact */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Subir', icon: Upload, href: '/documents', iconColor: 'text-study-amber', iconBg: 'bg-study-amber-light' },
            { label: 'Examen', icon: ClipboardList, href: '/practice', iconColor: 'text-study-teal', iconBg: 'bg-study-teal-light' },
            { label: 'Oral', icon: Mic2, href: '/oral', iconColor: 'text-study-blue', iconBg: 'bg-study-blue-light' },
            { label: 'Progreso', icon: TrendingUp, href: '/practice', iconColor: 'text-study-rose', iconBg: 'bg-study-rose-light' },
          ].map((a) => {
            const Icon = a.icon
            return (
              <Link key={a.label} href={a.href}>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className={cn('size-9 rounded-xl flex items-center justify-center', a.iconBg)}>
                    <Icon className={cn('size-4.5', a.iconColor)} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{a.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* AI Tip — inline banner, not a card */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-study-blue-light/50">
          <div className="size-7 rounded-md bg-study-blue flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="size-3.5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground leading-relaxed">
              {stats && stats.avg_score > 0 && stats.avg_score < 70
                ? 'Tu promedio está bajo 70%. Haz sesiones cortas enfocadas en temas débiles.'
                : stats && stats.avg_score >= 70
                ? 'Vas bien. Prueba la simulación oral para consolidar lo que sabes.'
                : 'Sube el material de tu próximo examen y genera preguntas al instante.'}
            </p>
          </div>
          <Link href={stats && stats.avg_score > 0 ? '/oral' : '/documents'} className="text-xs font-bold text-study-blue shrink-0 flex items-center gap-0.5 hover:underline">
            Ir <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Activity */}
        <RecentActivity items={activity} />
      </div>
    </ShellLayout>
  )
}
