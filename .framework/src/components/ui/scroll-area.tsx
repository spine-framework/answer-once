// CIL[BEGIN stable_id="~/.framework/src/components/ui/scroll-area.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides a styled scroll-area UI component wrapper around Radix UI primitives for use in the framework."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and export the ScrollArea and ScrollBar subcomponents."]
// CIL[DOC-CONTEXT module="scroll-area" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ScrollArea and ScrollBar React components" errors="Throws at runtime if Radix UI primitives fail to render" side_effects="Renders DOM elements"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix ScrollArea, and a className utility; exports ScrollArea and ScrollBar." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework UI consumers and component library users"]
import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Provides a styled scroll-area UI component wrapper around Radix UI primitives for use in the framework.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/scroll-area.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/scroll-area.tsx:scrollarea:function" type="function" identity="scrollarea" parent="~/.framework/src/components/ui/scroll-area.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a scrollable viewport container with an attached scrollbar and corner."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ScrollAreaPrimitive.Root and children in a relative container with className support."]
// CIL[DOC-CONTEXT module="scroll-area" layer="ui" related_files=".framework/src/components/ui/scroll-area.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, props: React.ComponentProps<typeof ScrollAreaPrimitive.Root>" outputs="JSX element tree" errors="None beyond React rendering" side_effects="Renders DOM nodes with data-slot attributes"]
// CIL[DOC-MICRO logic_summary="Returns a Root containing a Viewport, ScrollBar, and Corner, applying cn utility for className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a scrollable viewport container with an attached scrollbar and corner.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/scroll-area.tsx:scrollarea:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/scroll-area.tsx:scrollbar:function" type="function" identity="scrollbar" parent="~/.framework/src/components/ui/scroll-area.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a directional scrollbar thumb using Radix UI primitives."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled ScrollAreaScrollbar with orientation support and a rounded thumb."]
// CIL[DOC-CONTEXT module="scroll-area" layer="ui" related_files=".framework/src/components/ui/scroll-area.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, orientation: 'vertical' | 'horizontal', props: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>" outputs="JSX scrollbar element" errors="None beyond React rendering" side_effects="Renders DOM nodes with data-orientation and data-slot attributes"]
// CIL[DOC-MICRO logic_summary="Returns a ScrollAreaScrollbar with conditional vertical/horizontal styling and a rounded thumb." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a directional scrollbar thumb using Radix UI primitives.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/scroll-area.tsx:scrollbar:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/scroll-area.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/scroll-area.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Expose ScrollArea and ScrollBar components to consumers."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide named exports for ScrollArea and ScrollBar."]
// CIL[DOC-CONTEXT module="scroll-area" layer="ui" related_files=".framework/src/components/ui/scroll-area.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ScrollArea and ScrollBar named exports" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Re-exports the local ScrollArea and ScrollBar functions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { ScrollArea, ScrollBar }
// CIL[DOC-VECTOR type="context" content="purpose='Expose ScrollArea and ScrollBar components to consumers.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/scroll-area.tsx:module_exports:module_exports"]
