// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:use_client:directive"]
// CIL[DOC-MACRO purpose="Marks this module as client-side only"]
// CIL[DOC-RESPONSIBILITY responsibility="Instructs the bundler to treat this file as a client component"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="use client directive" errors="none" side_effects="Excludes module from server rendering"]
// CIL[DOC-MICRO logic_summary="Single use client directive" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]


















"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks this module as client-side only'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:use_client:directive"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Imports dependencies for the dropdown menu UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Set up React, Radix UI, utility and icon imports used by the components below"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported symbols" errors="none" side_effects="Registers module dependencies"]
// CIL[DOC-MICRO logic_summary="Import statements for React, Radix primitives, cn and icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]
import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Imports dependencies for the dropdown menu UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenu:component"]
// CIL[DOC-MACRO purpose="Root dropdown menu component wrapping Radix DropdownMenuPrimitive.Root"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the top-level dropdown menu container"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix root with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Root dropdown menu component wrapping Radix DropdownMenuPrimitive.Root'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenu:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuPortal:component"]
// CIL[DOC-MACRO purpose="Portal wrapper for dropdown menu content"]
// CIL[DOC-RESPONSIBILITY responsibility="Render dropdown content outside the normal DOM hierarchy"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="Renders content outside parent DOM"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix portal with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Portal wrapper for dropdown menu content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuPortal:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuTrigger:component"]
// CIL[DOC-MACRO purpose="Trigger element for opening a dropdown menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the button or element that toggles the dropdown"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix trigger with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Trigger element for opening a dropdown menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuContent:component"]
// CIL[DOC-MACRO purpose="Dropdown menu content panel with positioning and styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render styled, positioned dropdown content with animations and overflow handling"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, align, sideOffset, Radix content props" outputs="JSX element" errors="None" side_effects="Renders dropdown content into a portal"]
// CIL[DOC-MICRO logic_summary="Wraps Radix Portal and Content with default alignment, side offset and a Tailwind class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn("z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Dropdown menu content panel with positioning and styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuGroup:component"]
// CIL[DOC-MACRO purpose="Group container for dropdown menu items"]
// CIL[DOC-RESPONSIBILITY responsibility="Group related dropdown items visually and semantically"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix group with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Group container for dropdown menu items'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuItem:component"]
// CIL[DOC-MACRO purpose="Selectable item inside a dropdown menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled dropdown item supporting default and destructive variants and inset padding"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, inset, variant, Radix item props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix Item with data-slot, data-inset, data-variant and a compound Tailwind class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Selectable item inside a dropdown menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuCheckboxItem:component"]
// CIL[DOC-MACRO purpose="Checkbox item in a dropdown menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a checkbox item with checked state, inset support and an indicator"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, checked, inset, ...props" outputs="JSX element" errors="None" side_effects="Displays check icon when checked"]
// CIL[DOC-MICRO logic_summary="Wraps Radix CheckboxItem with data attributes and renders a right-aligned check icon indicator" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Checkbox item in a dropdown menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuCheckboxItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuRadioGroup:component"]
// CIL[DOC-MACRO purpose="Radio group container for dropdown menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Group related radio items"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix radio group with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Radio group container for dropdown menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuRadioGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuRadioItem:component"]
// CIL[DOC-MACRO purpose="Radio item in a dropdown menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a radio item with an indicator and inset support"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, inset, ...props" outputs="JSX element" errors="None" side_effects="Displays selection indicator when selected"]
// CIL[DOC-MICRO logic_summary="Wraps Radix RadioItem with data attributes and renders a check icon as the selection indicator" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Radio item in a dropdown menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuRadioItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuLabel:component"]
// CIL[DOC-MACRO purpose="Label for grouping or describing dropdown menu items"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled dropdown label with optional inset padding"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, inset, ...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix label with data-slot, data-inset and a muted text class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Label for grouping or describing dropdown menu items'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuLabel:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSeparator:component"]
// CIL[DOC-MACRO purpose="Horizontal separator between dropdown menu sections"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled horizontal divider"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix separator with data-slot and a border class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Horizontal separator between dropdown menu sections'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSeparator:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuShortcut:component"]
// CIL[DOC-MACRO purpose="Keyboard shortcut text inside a dropdown menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render small muted shortcut text that responds to focus state"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Renders a span with data-slot and a small muted text class string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Keyboard shortcut text inside a dropdown menu item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuShortcut:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSub:component"]
// CIL[DOC-MACRO purpose="Submenu root for nested dropdown menus"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a nested dropdown menu container"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix sub with a data-slot attribute" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Submenu root for nested dropdown menus'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSub:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSubTrigger:component"]
// CIL[DOC-MACRO purpose="Trigger for a nested dropdown submenu"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a trigger with an inset option and a chevron icon"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, inset, children, ...props" outputs="JSX element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix sub trigger with data attributes and appends a ChevronRightIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Trigger for a nested dropdown submenu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSubTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSubContent:component"]
// CIL[DOC-MACRO purpose="Nested dropdown submenu content panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Render styled nested submenu content with animations"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX element" errors="None" side_effects="Renders nested submenu content"]
// CIL[DOC-MICRO logic_summary="Forwards props to Radix SubContent with data-slot and a Tailwind class string for nested menus" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn("z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Nested dropdown submenu content panel'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:DropdownMenuSubContent:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:export_block:export_block"]
// CIL[DOC-MACRO purpose="Export all dropdown menu component symbols"]
// CIL[DOC-RESPONSIBILITY responsibility="Make dropdown menu components available for import by consumers"]
// CIL[DOC-CONTEXT module="components/ui/dropdown-menu" layer="ui" related_files=".framework/src/components/ui/dropdown-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="All component definitions in this module" outputs="Named exports" errors="None" side_effects="Exposes module public API"]
// CIL[DOC-MICRO logic_summary="Named export block listing every dropdown menu component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
// CIL[DOC-VECTOR type="context" content="purpose='Export all dropdown menu component symbols'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dropdown-menu.tsx:export_block:export_block"]