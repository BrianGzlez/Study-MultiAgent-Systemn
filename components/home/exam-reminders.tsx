import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const exams = [
  {
    subject: 'Statistics',
    date: 'June 28',
    daysLeft: 7,
    color: 'border-study-amber/30 bg-study-amber-light/40',
    badgeColor: 'bg-study-amber text-primary-foreground',
  },
  {
    subject: 'Embedded Systems',
    date: 'July 5',
    daysLeft: 14,
    color: 'border-study-teal/30 bg-study-teal-light/40',
    badgeColor: 'bg-study-teal text-primary-foreground',
  },
  {
    subject: 'Macroeconomics',
    date: 'July 12',
    daysLeft: 21,
    color: 'border-study-blue/30 bg-study-blue-light/40',
    badgeColor: 'bg-study-blue text-primary-foreground',
  },
]

export function ExamReminders() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-foreground">Upcoming exams</h2>
      <div className="flex flex-col gap-2">
        {exams.map((exam) => (
          <Card key={exam.subject} className={cn('border', exam.color)}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{exam.subject}</p>
                  <p className="text-xs text-muted-foreground">{exam.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    exam.badgeColor,
                  )}
                >
                  {exam.daysLeft}d left
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
