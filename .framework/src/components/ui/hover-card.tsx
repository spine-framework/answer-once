// CIL[BEGIN stable_id="~/.framework/src/components/ui/hover-card.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~"]
// CIL[DOC-MACRO purpose="Import dependencies and configure the hover-card UI module."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the root, trigger and content primitives for a hover card component."]
// CIL[DOC-CONTEXT module="components/ui/hover-card" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imports and shared setup" errors="none" side_effects="imports radix-ui primitive and cn utility"]
// CIL[DOC-MICRO logic_summary="Sets up React, Radix UI and the cn utility for the subsequent component definitions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="component consumers and maintainers"]
import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and configure the hover-card UI module.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/hover-card.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercard:function" type="function" identity="hovercard" parent="~"]
// CIL[DOC-MACRO purpose="Render the root hover card container."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the Radix UI HoverCard.Root with a data-slot attribute."]
// CIL[DOC-CONTEXT module="components/ui/hover-card" layer="presentation" related_files=".framework/src/components/ui/hover-card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props (rest): forwarded to HoverCardPrimitive.Root" outputs="JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads all props onto the Radix root element and sets a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the root hover card container.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercard:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercardtrigger:function" type="function" identity="hovercardtrigger" parent="~"]
// CIL[DOC-MACRO purpose="Render the hover card trigger element."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the Radix UI HoverCard.Trigger with a data-slot attribute."]
// CIL[DOC-CONTEXT module="components/ui/hover-card" layer="presentation" related_files=".framework/src/components/ui/hover-card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props (rest): forwarded to HoverCardPrimitive.Trigger" outputs="JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads all props onto the Radix trigger element and sets a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the hover card trigger element.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercardtrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercardcontent:function" type="function" identity="hovercardcontent" parent="~"]
// CIL[DOC-MACRO purpose="Render the hover card content popover."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the Radix UI HoverCard.Content in a Portal and apply default styling."]
// CIL[DOC-CONTEXT module="components/ui/hover-card" layer="presentation" related_files=".framework/src/components/ui/hover-card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, align, sideOffset and Radix content props" outputs="JSX portal content" errors="none" side_effects="renders into a portal with Tailwind classes"]
// CIL[DOC-MICRO logic_summary="Uses cn() to merge default Tailwind classes with the provided className and sets alignment and offset defaults." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-hover-card-content-transform-origin) rounded-lg bg-popover p-2.5 text-xs/relaxed text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the hover card content popover.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/hover-card.tsx:hovercardcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/hover-card.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~"]
// CIL[DOC-MACRO purpose="Expose the hover card subcomponents to consumers."]
// CIL[DOC-RESPONSIBILITY responsibility="Named export of HoverCard, HoverCardTrigger and HoverCardContent."]
// CIL[DOC-CONTEXT module="components/ui/hover-card" layer="presentation" related_files=".framework/src/components/ui/hover-card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Single export statement for the three component functions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { HoverCard, HoverCardTrigger, HoverCardContent }
// CIL[DOC-VECTOR type="context" content="purpose='Expose the hover card subcomponents to consumers.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/hover-card.tsx:module_exports:module_exports"]
