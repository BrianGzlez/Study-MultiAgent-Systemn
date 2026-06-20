import Link from 'next/link'
import { Upload, ClipboardList, Mic2, Target, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const actions = [
  {
    label: 'Upload material',
    description: 'Add PDFs, slides, or notes',
    icon: Upload,
    href: '/documents',
    color: 'bg-study-amber-light text-study-amber',
    border: 'border-study-amber/20',
  },
  {
    label: 'Practice exam',
    description: 'Generate questions from your docs',
    icon: ClipboardList,
    href: '/practice',
    color: 'bg-study-teal-light text-study-teal',
    border: 'border-study-teal/20',
  },
  {
    label: 'Oral simulation',
    description: 'Chat with your AI professor',
    icon: Mic2,
    href: '/oral',
    color: 'bg-study-blue-light text-study-blue',
    border: 'border-study-blue/20',
  },
  {
    label: 'Weak topics',
    description: 'Review where you struggled',
    icon: Target,
    href: '/practice?mode=weak',
    color: 'bg-study-rose-light text-study-rose',
    border: 'border-study-rose/20',
  },
]

export function QuickActionCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.label} href={action.href}>
            <Card
              className={cn(
                'group cursor-pointer border transition-all hover:shadow-md hover:-translate-y-0.5',
                action.border,
              )}
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={cn('size-10 rounded-xl flex items-center justify-center', action.color)}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
