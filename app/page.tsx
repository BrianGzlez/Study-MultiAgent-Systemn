import { ShellLayout } from '@/components/shell-layout'
import { QuickActionCards } from '@/components/home/quick-action-cards'
import { RecentActivity } from '@/components/home/recent-activity'
import { ExamReminders } from '@/components/home/exam-reminders'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Flame, BookOpen, Target } from 'lucide-react'

const stats = [
  { label: 'Study streak', value: '5 days', icon: Flame, color: 'text-study-rose' },
  { label: 'Exams done', value: '12', icon: BookOpen, color: 'text-study-teal' },
  { label: 'Avg. score', value: '74%', icon: Target, color: 'text-study-amber' },
  { label: 'Top subject', value: 'Statistics', icon: Trophy, color: 'text-study-blue' },
]

export default function HomePage() {
  return (
    <ShellLayout title="Study Room" description="Ready to study?">
      <div className="p-6 flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            Hey, welcome back!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You&apos;ve been on a 5-day streak. Keep it up!
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => {
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

        {/* Main content: activity + reminders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <ExamReminders />
          </div>
        </div>
      </div>
    </ShellLayout>
  )
}
