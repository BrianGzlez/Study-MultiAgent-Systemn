'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { ShellLayout } from '@/components/shell-layout'
import { QuickActionCards } from '@/components/home/quick-action-cards'
import { RecentActivity } from '@/components/home/recent-activity'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Flame, BookOpen, Target, FileText } from 'lucide-react'

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
    { label: 'Exams done', value: stats ? String(stats.exams_done) : '—', icon: BookOpen, color: 'text-study-teal' },
    { label: 'Avg. score', value: stats ? `${stats.avg_score}%` : '—', icon: Target, color: 'text-study-amber' },
    { label: 'Documents', value: stats ? String(stats.documents_count) : '—', icon: FileText, color: 'text-study-rose' },
    { label: 'Top subject', value: stats?.top_subject || '—', icon: Trophy, color: 'text-study-blue' },
  ]

  return (
    <ShellLayout title="Study Room" description="Ready to study?">
      <div className="p-6 flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            Hey, welcome back!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {stats && stats.exams_done > 0
              ? `You've completed ${stats.exams_done} exam${stats.exams_done !== 1 ? 's' : ''}. Keep it up!`
              : 'Upload a document and start practicing!'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`size-5 shrink-0 ${s.color}`} />
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
          <QuickActionCards />
        </div>

        {/* Recent activity */}
        <div>
          <RecentActivity items={activity} />
        </div>
      </div>
    </ShellLayout>
  )
}
