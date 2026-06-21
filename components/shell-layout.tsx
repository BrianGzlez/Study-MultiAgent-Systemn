'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface ShellLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export function ShellLayout({ children, title, description, actions }: ShellLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-background overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  )
}
