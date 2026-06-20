import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Mic2, FileText, BookOpen } from 'lucide-react'

const activities = [
  {
    type: 'exam',
    label: 'Practice exam — Statistics',
    detail: '14/20 correct · 70%',
    time: '2 hours ago',
    icon: ClipboardList,
    badgeLabel: 'Exam',
    badgeVariant: 'secondary' as const,
    color: 'text-study-teal',
  },
  {
    type: 'oral',
    label: 'Oral simulation — Embedded Systems',
    detail: 'Feedback: Good depth on interrupts',
    time: 'Yesterday',
    icon: Mic2,
    badgeLabel: 'Oral',
    badgeVariant: 'secondary' as const,
    color: 'text-study-blue',
  },
  {
    type: 'upload',
    label: 'Uploaded: Lecture 7 — Macroeconomics',
    detail: 'PDF · 24 pages',
    time: '2 days ago',
    icon: FileText,
    badgeLabel: 'Upload',
    badgeVariant: 'secondary' as const,
    color: 'text-study-amber',
  },
  {
    type: 'exam',
    label: 'Practice exam — Economics',
    detail: '18/25 correct · 72%',
    time: '3 days ago',
    icon: ClipboardList,
    badgeLabel: 'Exam',
    badgeVariant: 'secondary' as const,
    color: 'text-study-teal',
  },
  {
    type: 'study',
    label: 'Group study session',
    detail: 'With Sofia and Marco · 45 min',
    time: '4 days ago',
    icon: BookOpen,
    badgeLabel: 'Group',
    badgeVariant: 'secondary' as const,
    color: 'text-study-rose',
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {activities.map((a, i) => {
          const Icon = a.icon
          return (
            <div
              key={i}
              className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
            >
              <div className={`mt-0.5 ${a.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={a.badgeVariant} className="text-xs px-1.5 py-0 h-5">
                  {a.badgeLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
