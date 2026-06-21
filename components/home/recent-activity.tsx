import { ClipboardList, Mic2, FileText, BookOpen } from 'lucide-react'
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
  if (seconds < 60) return 'ahora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return date.toLocaleDateString()
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">No hay actividad aún</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Actividad reciente</p>
      {items.map((a, i) => {
        const c = config[a.type] || config.study
        const Icon = c.icon
        return (
          <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-card transition-colors">
            <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
              <Icon className={cn('size-3.5', c.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{a.label}</p>
              <p className="text-[11px] text-muted-foreground">{a.detail}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-medium text-muted-foreground">{c.badge}</p>
              <p className="text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
