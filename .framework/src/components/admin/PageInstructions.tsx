import * as React from 'react'
import { BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const instructionModules = import.meta.glob('../../instructions/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const instructionDocs: Record<string, string> = {}
for (const [path, content] of Object.entries(instructionModules)) {
  const key = path.replace(/^.*instructions\//, '').replace(/\.md$/, '')
  if (key) instructionDocs[key] = content
}

const PAGE_TITLES: Record<string, string> = {
  types: 'Types',
  apps: 'Apps',
  pipelines: 'Pipelines',
  triggers: 'Triggers',
  'ai-agents': 'AI Agents',
  timers: 'Timers',
  integrations: 'Integrations',
  roles: 'Roles',
  prompts: 'Prompt Configs',
  'api-keys': 'API Keys',
  deliveries: 'Deliveries',
  'runtime-list': 'Records',
  'runtime-detail': 'Record',
}

function displayTitle(pageKey: string): string {
  return (
    PAGE_TITLES[pageKey] ??
    pageKey
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}

function cleanMarkdown(markdown: string): string {
  return markdown
    .split('\n')
    .join('\n')
    .trim()
}

export interface PageInstructionsProps {
  pageKey: string
  title?: string
}

export function PageInstructions({ pageKey, title }: PageInstructionsProps) {
  const markdown = instructionDocs[pageKey]
  if (!markdown) return null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Instructions
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{title ?? displayTitle(pageKey)}</SheetTitle>
          <SheetDescription className="sr-only">
            Instructions and reference for this page
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown(markdown)}</ReactMarkdown>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
