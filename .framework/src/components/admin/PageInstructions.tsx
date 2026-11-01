// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
import * as React from 'react'
import { BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:instructionModules:constant" type="constant" identity="instructionModules" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
const instructionModules = import.meta.glob('../../instructions/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:instructionModules:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:instructionDocs:constant" type="constant" identity="instructionDocs" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
const instructionDocs: Record<string, string> = {}
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:instructionDocs:constant"]
for (const [path, content] of Object.entries(instructionModules)) {
// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:key:constant" type="constant" identity="key" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
  const key = path.replace(/^.*instructions\//, '').replace(/\.md$/, '')
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:key:constant"]
  if (key) instructionDocs[key] = content
}

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PAGE_TITLES:constant" type="constant" identity="PAGE_TITLES" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
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
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PAGE_TITLES:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:displayTitle:function" type="function" identity="displayTitle" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
function displayTitle(pageKey: string): string {
  return (
    PAGE_TITLES[pageKey] ??
    pageKey
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:displayTitle:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:cleanMarkdown:function" type="function" identity="cleanMarkdown" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
function cleanMarkdown(markdown: string): string {
  return markdown
    .split('\n')
    .filter((line) => !line.trim().startsWith('// CIL['))
    .join('\n')
    .trim()
}
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:cleanMarkdown:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PageInstructionsProps:interface" type="interface" identity="PageInstructionsProps" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
export interface PageInstructionsProps {
  pageKey: string
  title?: string
}
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PageInstructionsProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PageInstructions:component" type="component" identity="PageInstructions" parent="~/.framework/src/components/admin/PageInstructions.tsx"]
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
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:PageInstructions:component"]
