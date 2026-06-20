'use client'

import { useState } from 'react'
import { ShellLayout } from '@/components/shell-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Globe2,
  BookOpen,
  Brain,
  Moon,
  X,
  Plus,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = ['English', 'Italian', 'Spanish', 'French', 'German']
const strictnessLevels = [
  {
    id: 'chill',
    label: 'Chill',
    description: 'Supportive and encouraging. Lots of hints.',
    color: 'border-study-teal/30 bg-study-teal-light/40',
    activeColor: 'border-study-teal bg-study-teal-light',
    textColor: 'text-study-teal',
  },
  {
    id: 'normal',
    label: 'Normal',
    description: 'Balanced feedback. Helpful but honest.',
    color: 'border-border bg-card',
    activeColor: 'border-primary bg-study-amber-light',
    textColor: 'text-study-amber',
  },
  {
    id: 'strict',
    label: 'Strict Professor',
    description: 'No hints. Demanding. Real exam pressure.',
    color: 'border-study-rose/30 bg-study-rose-light/40',
    activeColor: 'border-study-rose bg-study-rose-light',
    textColor: 'text-study-rose',
  },
]

const defaultSubjects = ['Statistics', 'Embedded Systems', 'Macroeconomics', 'Mathematics']

export default function SettingsPage() {
  const [name, setName] = useState('Your Name')
  const [language, setLanguage] = useState('English')
  const [strictness, setStrictness] = useState('normal')
  const [darkMode, setDarkMode] = useState(false)
  const [subjects, setSubjects] = useState(defaultSubjects)
  const [newSubject, setNewSubject] = useState('')

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects((prev) => [...prev, newSubject.trim()])
      setNewSubject('')
    }
  }

  const removeSubject = (s: string) => setSubjects((prev) => prev.filter((x) => x !== s))

  return (
    <ShellLayout title="Settings" description="Personalise your study experience">
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-4 text-study-amber" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base font-bold bg-primary text-primary-foreground">
                  {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{name || 'Your Name'}</p>
                <p className="text-xs text-muted-foreground">3rd year · Engineering</p>
                <Button variant="outline" size="sm" className="h-7 text-xs mt-1 w-fit">
                  Change avatar
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe2 className="size-4 text-study-blue" />
              Preferred language
            </CardTitle>
            <CardDescription>Used for AI-generated questions and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    language === lang
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-study-teal" />
              My subjects
            </CardTitle>
            <CardDescription>Used to filter documents, exams, and suggestions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1.5 pr-1.5 pl-2.5">
                  {s}
                  <button
                    onClick={() => removeSubject(s)}
                    className="rounded-full hover:bg-foreground/10 p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                placeholder="Add a subject..."
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addSubject} className="shrink-0">
                <Plus className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI strictness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="size-4 text-study-rose" />
              AI strictness
            </CardTitle>
            <CardDescription>How demanding should your AI professor be during oral simulations?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {strictnessLevels.map((s) => (
              <button
                key={s.id}
                onClick={() => setStrictness(s.id)}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                  strictness === s.id ? s.activeColor : s.color,
                )}
              >
                <div className={cn('w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0 transition-colors', strictness === s.id ? `border-current bg-current ${s.textColor}` : 'border-muted-foreground')} />
                <div>
                  <p className={cn('text-sm font-semibold', strictness === s.id ? s.textColor : 'text-foreground')}>
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="size-4 text-study-blue" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Button className="w-full" size="lg">
          <Save data-icon="inline-start" />
          Save changes
        </Button>
      </div>
    </ShellLayout>
  )
}
