// CIL[BEGIN stable_id="~/.framework/src/components/ui/kbd.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/kbd.tsx"]
// CIL[DOC-MACRO purpose="Exports keyboard UI components (Kbd, KbdGroup) for the framework design system."]
// CIL[DOC-RESPONSIBILITY responsibility="Define and re-export styled keyboard and key-group components used across the UI."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Kbd, KbdGroup React components" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the cn utility and declares two functional components for keyboard and key-group rendering." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework UI consumers and developers using the design system"]



import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Exports keyboard UI components (Kbd, KbdGroup) for the framework design system.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/kbd.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/kbd.tsx:Kbd:component" type="component" identity="Kbd" parent="~/.framework/src/components/ui/kbd.tsx"]
// CIL[DOC-MACRO purpose="Renders a single keyboard key element with consistent muted styling and tooltip integration."]
// CIL[DOC-RESPONSIBILITY responsibility="Render an inline <kbd> element, merging an optional className with a default muted/select-none style."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/kbd.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: object" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a <kbd> tag using cn() to combine default style classes with any provided className, forwarding props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs bg-muted px-1 font-sans text-[0.625rem] font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a single keyboard key element with consistent muted styling and tooltip integration.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/kbd.tsx:Kbd:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/kbd.tsx:KbdGroup:component" type="component" identity="KbdGroup" parent="~/.framework/src/components/ui/kbd.tsx"]
// CIL[DOC-MACRO purpose="Groups multiple keyboard key elements inline with a small gap."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flex <kbd> wrapper for grouped key components, merging an optional className."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/kbd.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: object" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a <kbd> element styled as an inline-flex row with a one-key gap, combining default className with any provided value." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}
// CIL[END stable_id="~/.framework/src/components/ui/kbd.tsx:KbdGroup:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/kbd.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/kbd.tsx"]
// CIL[DOC-MACRO purpose="Re-exports Kbd and KbdGroup so other modules can import them from this component entry."]
// CIL[DOC-VECTOR type="context" content="purpose='Groups multiple keyboard key elements inline with a small gap.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the Kbd and KbdGroup component symbols as named exports."]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/kbd.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports { Kbd, KbdGroup }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Emits an export statement making the local Kbd and KbdGroup components available to importers." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Kbd, KbdGroup }
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports Kbd and KbdGroup so other modules can import them from this component entry.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/kbd.tsx:exports:variable"]
