// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Provide reusable card UI components and subcomponent exports"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React and the cn utility for the card module"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React card component module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React and the cn className merge utility" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import * as React from "react"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Provide reusable card UI components and subcomponent exports'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:Card:component" type="component" identity="Card" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a styled card container with optional size variants"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the root card wrapper with merged classes and data attributes"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, size: 'default' | 'sm', ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Merges utility classes with the card className and renders a div with data-slot and data-size attributes" notable_decisions="Supports size variants and image-specific rounding via Tailwind CSS"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-lg bg-card py-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled card container with optional size variants'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:Card:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardHeader:component" type="component" identity="CardHeader" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card header container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the header area for the card"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a header container for the card" notable_decisions="Uses @container and grid layout with action/description conditional rows"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card header container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardTitle:component" type="component" identity="CardTitle" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card title element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the title text with consistent heading styles"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a styled card title element" notable_decisions="Uses font-heading for consistent typography"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card title element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardDescription:component" type="component" identity="CardDescription" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card description element"]
// CIL[DOC-RESPONSIBILITY responsibility="Render muted description text inside the card"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders muted description text" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card description element'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardDescription:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardAction:component" type="component" identity="CardAction" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card action slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an action element positioned in the card header"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Positions an action element in the card header grid" notable_decisions="Spans rows and self-aligns to the end"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card action slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardAction:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardContent:component" type="component" identity="CardContent" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card content area"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the main content area with horizontal padding"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders the main content area with horizontal padding" notable_decisions="Adjusts padding for small card size"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card content area'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:CardFooter:component" type="component" identity="CardFooter" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Render a card footer area"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the footer area with rounded bottom corners"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX div" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders the card footer area" notable_decisions="Rounds bottom corners and adjusts top border spacing"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-4 group-data-[size=sm]/card:px-3 [.border-t]:pt-4 group-data-[size=sm]/card:[.border-t]:pt-3",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a card footer area'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:CardFooter:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/card.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/card.tsx"]
// CIL[DOC-AUDIENCE audience="internal, frontend"]
// CIL[DOC-MACRO purpose="Re-export card subcomponents as named exports"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export card subcomponents for module consumers"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/card" layer="ui" related_files=".framework/src/components/ui/card.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of all card subcomponents" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-export card subcomponents as named exports'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/card.tsx:exports:variable"]
