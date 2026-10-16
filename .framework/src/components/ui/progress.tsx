// CIL[BEGIN stable_id="~/.framework/src/components/ui/progress.tsx:use_client:directive" type="directive" identity="use_client" parent="~/.framework/src/components/ui/progress.tsx"]
// CIL[DOC-MACRO purpose="Declares this file as client-side only for the Next.js runtime."]
// CIL[DOC-RESPONSIBILITY responsibility="Instructs the bundler to execute this module in the browser, not on the server."]
// CIL[DOC-CONTEXT module="ui/progress" layer="component" related_files=".framework/src/components/ui/progress.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="Sets module bundler runtime context."]
// CIL[DOC-MICRO logic_summary="'use client' directive only." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Declares this file as client-side only for the Next.js runtime.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/progress.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/progress.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/progress.tsx"]
// CIL[DOC-MACRO purpose="Imports dependencies for the Progress UI component."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, Radix UI Progress primitive, and utility imports for the component."]
// CIL[DOC-CONTEXT module="ui/progress" layer="component" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="Loads external modules."]
// CIL[DOC-MICRO logic_summary="Imports React, radix-ui Progress, and cn class-merging utility." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Imports dependencies for the Progress UI component.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/progress.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/progress.tsx:Progress:component" type="component" identity="Progress" parent="~/.framework/src/components/ui/progress.tsx"]
// CIL[DOC-MACRO purpose="Renders a linear progress bar using Radix UI primitives."]
// CIL[DOC-RESPONSIBILITY responsibility="Display a percentage-based progress indicator styled with Tailwind."]
// CIL[DOC-CONTEXT module="ui/progress" layer="component" related_files=".framework/src/components/ui/progress.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, value: number, props: React.ComponentProps<typeof ProgressPrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-PARAM name="className" type="string" description="Optional string for extra Tailwind classes."]
// CIL[DOC-PARAM name="value" type="number" description="Optional number between 0 and 100 representing completion percentage."]
// CIL[DOC-PARAM name="props" type="React.ComponentProps<typeof ProgressPrimitive.Root>" description="Optional remaining props forwarded to ProgressPrimitive.Root."]
// CIL[DOC-MICRO logic_summary="Wraps ProgressPrimitive.Root, applies theme classes, and positions ProgressPrimitive.Indicator via translateX." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

// CIL[DOC-VECTOR type="context" content="purpose='Renders a linear progress bar using Radix UI primitives.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/progress.tsx:Progress:component"]
