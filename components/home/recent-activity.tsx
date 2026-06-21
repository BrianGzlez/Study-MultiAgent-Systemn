import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Mic2, FileText, BookOpen, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  type: string
  label: string
  detail: string
  created_at: string | null
}

const config: Record<string, { icon: typeof ClipboardList; color: string; bg: string; badge: string }> = {
  exam: { icon: ClipboardList, color: 'text-study-teal', bg: 'bg-study-teal-light', badge: 'Examen' },
  oral: { icon: Mic2, color: 'text-study-blue', bg: 'bg-study-blue-light', badge: 'Oral' },
  upload: { icon: FileText, color: 'text-study-amber', bg: 'bg-study-amber-light', badge: 'Subido' },
  study: { icon: BookOpen, color: 'text-study-rose', bg: 'bg-study-rose-light', badge: 'Estudio' },
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Ahora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return date.toLocaleDateString()
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Actividad reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <BookOpen className="size-5 opacity-40" />
            </div>
            <p className="text-sm font-medium">No hay actividad aún</p>
            <p className="text-xs mt-1">Sube un documento o toma un examen para empezar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {items.map((a, i) => {
          const c = config[a.type] || config.study
          const Icon = c.icon
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0"
            >
              <div className={cn('size-9 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                <Icon className={cn('size-4', c.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {c.badge}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
