import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Mic2, FileText, BookOpen } from 'lucide-react'

interface ActivityItem {
  type: string
  label: string
  detail: string
  created_at: string | null
}

const iconMap: Record<string, typeof ClipboardList> = {
  exam: ClipboardList,
  oral: Mic2,
  upload: FileText,
  study: BookOpen,
}

const colorMap: Record<string, string> = {
  exam: 'text-study-teal',
  oral: 'text-study-blue',
  upload: 'text-study-amber',
  study: 'text-study-rose',
}

const badgeMap: Record<string, string> = {
  exam: 'Exam',
  oral: 'Oral',
  upload: 'Upload',
  study: 'Study',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No activity yet. Upload a document or take an exam to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {items.map((a, i) => {
          const Icon = iconMap[a.type] || FileText
          const color = colorMap[a.type] || 'text-muted-foreground'
          const badge = badgeMap[a.type] || a.type

          return (
            <div
              key={i}
              className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
            >
              <div className={`mt-0.5 ${color}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {badge}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
