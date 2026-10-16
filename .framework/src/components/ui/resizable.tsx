// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:use_client:directive" type="directive" identity="use_client" parent="module"]
// CIL[DOC-MACRO purpose="Marks the file as client-side only for Next.js rendering."]
// CIL[DOC-RESPONSIBILITY responsibility="Directive marker for client components."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/components/ui/resizable.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Next.js 'use client' directive." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks the file as client-side only for Next.js rendering.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:module_header:module_header" type="module_header" identity="module_header" parent="module"]
// CIL[DOC-MACRO purpose="Imports dependencies and sets up the resizable panel primitives module."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide module-level imports for resizable panel UI components."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ResizablePrimitive, cn" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports react-resizable-panels and the cn class merge utility." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Imports dependencies and sets up the resizable panel primitives module.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:resizablepanelgroup:function" type="function" identity="ResizablePanelGroup" parent="module"]
// CIL[DOC-MACRO purpose="Renders a resizable panel group wrapper with layout styles."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap ResizablePrimitive.Group and apply Tailwind flex classes and data-slot."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/components/ui/resizable.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a ResizablePrimitive.Group with aria orientation-aware flex classes and forwarded props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a resizable panel group wrapper with layout styles.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:resizablepanelgroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:resizablepanel:function" type="function" identity="ResizablePanel" parent="module"]
// CIL[DOC-MACRO purpose="Renders an individual resizable panel."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap ResizablePrimitive.Panel and forward props with a data-slot attribute."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/components/ui/resizable.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: ResizablePrimitive.PanelProps" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a ResizablePrimitive.Panel with data-slot attribute and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an individual resizable panel.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:resizablepanel:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:resizablehandle:function" type="function" identity="ResizableHandle" parent="module"]
// CIL[DOC-MACRO purpose="Renders a resizable handle with optional visible grip."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap ResizablePrimitive.Separator, applying orientation-aware styles and an optional handle element."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/components/ui/resizable.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="withHandle, className, ...props" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a styled separator that conditionally includes a grip div when withHandle is true." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      )}
    </ResizablePrimitive.Separator>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a resizable handle with optional visible grip.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:resizablehandle:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/resizable.tsx:module_exports:export" type="export" identity="module_exports" parent="module"]
// CIL[DOC-MACRO purpose="Re-exports the resizable panel primitives for consumers."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose ResizablePanelGroup, ResizablePanel and ResizableHandle as the module's public API."]
// CIL[DOC-CONTEXT module="components/ui/resizable" layer="presentation" related_files=".framework/src/components/ui/resizable.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ ResizableHandle, ResizablePanel, ResizablePanelGroup }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of the three resizable UI components." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the resizable panel primitives for consumers.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/resizable.tsx:module_exports:export"]
