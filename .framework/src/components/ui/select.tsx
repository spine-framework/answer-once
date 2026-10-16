// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:use_client:client_directive" type="client_directive" identity="use_client" parent="~/.framework/src/components/ui/select.tsx:file"]
// CIL[DOC-MACRO purpose="Next.js use client directive"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the chunk's functionality"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="client rendering directive" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Marks this module as a client component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Next.js use client directive'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:use_client:client_directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/select.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui Select component module built on Radix UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shadcn/ui Select primitives and their dependencies"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, SelectPrimitive, cn, and icon bindings available to the module" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix UI Select primitive, utility and icon dependencies" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]
import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Select component module built on Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:select:function" type="function" identity="select" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Radix Select root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the select select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof SelectPrimitive.Root>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto SelectPrimitive.Root with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Radix Select root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:select:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectgroup:function" type="function" identity="selectgroup" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Select group container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectgroup select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: SelectPrimitive.Group props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.Group with padding and scroll margin utilities" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Select group container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectgroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectvalue:function" type="function" identity="selectvalue" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the current select value placeholder"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectvalue select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: SelectPrimitive.Value props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.Value with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the current select value placeholder'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectvalue:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selecttrigger:function" type="function" identity="selecttrigger" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled select trigger button"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selecttrigger select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, size: 'sm' | 'default' (default), children, ...props: SelectPrimitive.Trigger props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Composes SelectPrimitive.Trigger with size-aware Tailwind styling and a chevron icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-3.5 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled select trigger button'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selecttrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectcontent:function" type="function" identity="selectcontent" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the select dropdown content panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectcontent select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, children, position: 'item-aligned' | 'popper' (default item-aligned), align, ...props: SelectPrimitive.Content props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Portals SelectPrimitive.Content with positioning, scroll buttons and animation data attributes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position ==="popper"&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the select dropdown content panel'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectlabel:function" type="function" identity="selectlabel" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled label for a select group"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectlabel select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: SelectPrimitive.Label props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.Label with muted-foreground text styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled label for a select group'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectlabel:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectitem:function" type="function" identity="selectitem" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled selectable item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectitem select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, children, value, ...props: SelectPrimitive.Item props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Composes SelectPrimitive.Item with focus/hover styles and an indicator checkmark" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled selectable item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectseparator:function" type="function" identity="selectseparator" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a visual separator between select items"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectseparator select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: SelectPrimitive.Separator props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.Separator with a horizontal border line" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-border/50",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a visual separator between select items'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectscrollupbutton:function" type="function" identity="selectscrollupbutton" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the scroll-up affordance for long select content"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectscrollupbutton select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: SelectPrimitive.ScrollUpButton props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.ScrollUpButton and renders a chevron-up icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the scroll-up affordance for long select content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectscrollupbutton:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:selectscrolldownbutton:function" type="function" identity="selectscrolldownbutton" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the scroll-down affordance for long select content"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the selectscrolldownbutton select subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: SelectPrimitive.ScrollDownButton props" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SelectPrimitive.ScrollDownButton and renders a chevron-down icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the scroll-down affordance for long select content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:selectscrolldownbutton:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/select.tsx:export_list:export_list" type="export_list" identity="export_list" parent="~/.framework/src/components/ui/select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Public exports of the select UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose named select subcomponents for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports of Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Re-exports all named Select subcomponents" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
// CIL[DOC-VECTOR type="context" content="purpose='Public exports of the select UI primitives'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/select.tsx:export_list:export_list"]
