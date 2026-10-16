// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Top-level module header for the PageInstructions React component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare imports, exports, and the public surface of this module."]
// CIL[DOC-CONTEXT module="admin" layer="components" related_files=".framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aggregates imports and exports for the collapsible page instructions UI component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="module authors and consumers"]

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Card, CardContent } from '../ui/card'

// CIL[DOC-VECTOR type="context" content="purpose='Top-level module header for the PageInstructions React component.'; No verified external callers; imports: .framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:cleancilmarkers:function"]
// CIL[DOC-MACRO purpose="Remove CIL marker comments from rendered text nodes."]
// CIL[DOC-RESPONSIBILITY responsibility="Sanitize raw content before rendering so CIL tags do not leak into the UI."]
// CIL[DOC-CONTEXT module="admin" layer="components" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="content: React.ReactNode" outputs="React.ReactNode with CIL comment lines removed" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns non-string content unchanged; for strings, removes lines starting with // CIL[, collapses excess blank lines, and trims." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function cleanCilMarkers(content: React.ReactNode): React.ReactNode {
  if (typeof content !== 'string') return content
  return content
    .split('\n')
    .filter(line => !line.trim().startsWith('// CIL['))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// CIL[DOC-VECTOR type="context" content="purpose='Remove CIL marker comments from rendered text nodes.'; No verified external callers; imports: .framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:cleancilmarkers:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructionssection:interface"]
// CIL[DOC-MACRO purpose="Type contract for a single collapsible section inside PageInstructions."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the title and content shape expected by the PageInstructions component."]
// CIL[DOC-CONTEXT module="admin" layer="components" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a section with a string title and arbitrary React content." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export interface PageInstructionsSection {
  title: string
  content: React.ReactNode
}

// CIL[DOC-VECTOR type="context" content="purpose='Type contract for a single collapsible section inside PageInstructions.'; No verified external callers; imports: .framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructionssection:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructionsprops:interface"]
// CIL[DOC-MACRO purpose="Props interface for the PageInstructions component."]
// CIL[DOC-RESPONSIBILITY responsibility="Document the public configuration options accepted by PageInstructions."]
// CIL[DOC-CONTEXT module="admin" layer="components" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional title, description node, and an array of sections." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export interface PageInstructionsProps {
  title?: string
  description?: React.ReactNode
  sections?: PageInstructionsSection[]
}

// CIL[DOC-VECTOR type="context" content="purpose='Props interface for the PageInstructions component.'; No verified external callers; imports: .framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructionsprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructions:function"]
// CIL[DOC-MACRO purpose="Render a collapsible card containing optional description and instruction sections."]
// CIL[DOC-RESPONSIBILITY responsibility="Display page-level help or instructions in a collapsible UI widget."]
// CIL[DOC-CONTEXT module="admin" layer="components" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="props: PageInstructionsProps" outputs="JSX element or null" errors="none" side_effects="renders UI"]
// CIL[DOC-MICRO logic_summary="Returns null when no content is provided; otherwise renders a Card with a Collapsible trigger and filtered description/section content." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function PageInstructions({
  title = 'Page instructions',
  description,
  sections,
}: PageInstructionsProps) {
  if (!description && (!sections || sections.length === 0)) return null

  return (
    <Card>
      <CardContent className="p-4">
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-medium text-slate-700">
            <span>{title}</span>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {description && <div className="text-sm text-slate-600">{cleanCilMarkers(description)}</div>}
            {sections && sections.length > 0 && (
              <div className="space-y-3">
                {sections.map((section, i) => (
                  <div key={i}>
                    <div className="text-sm font-semibold text-slate-700">{section.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{cleanCilMarkers(section.content)}</div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Render a collapsible card containing optional description and instruction sections.'; No verified external callers; imports: .framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/card.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/PageInstructions.tsx:pageinstructions:function"]
