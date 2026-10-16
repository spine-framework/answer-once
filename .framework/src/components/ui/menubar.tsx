// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:use_client:directive" type="directive" identity="use_client" parent="~/.framework/src/components/ui/menubar.tsx:file"]
// CIL[DOC-MACRO purpose="Marks the module as client-only"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare that this module is intended for client-side execution"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="use client directive" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Next.js use client directive" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]



















"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks the module as client-only'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/menubar.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui Menubar component module built on radix-ui"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shadcn/ui Menubar primitives, cn utility, and icon bindings"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, MenubarPrimitive, cn, CheckIcon, and ChevronRightIcon available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, radix-ui Menubar primitive, cn utility, and icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]
import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Menubar component module built on radix-ui'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:Menubar:component" type="component" identity="Menubar" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the Menubar subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof MenubarPrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Root with data-slot and styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn("flex h-9 items-center rounded-lg border p-1", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:Menubar:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarMenu:component" type="component" identity="MenubarMenu" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a Menubar menu wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarMenu subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof MenubarPrimitive.Menu>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Menu with data-slot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a Menubar menu wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarMenu:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarGroup:component" type="component" identity="MenubarGroup" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a Menubar group wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarGroup subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof MenubarPrimitive.Group>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Group with data-slot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a Menubar group wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarPortal:component" type="component" identity="MenubarPortal" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a Menubar portal wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarPortal subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof MenubarPrimitive.Portal>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Portal with data-slot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a Menubar portal wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarPortal:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarRadioGroup:component" type="component" identity="MenubarRadioGroup" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a Menubar radio group wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarRadioGroup subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.RadioGroup with data-slot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a Menubar radio group wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarRadioGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarTrigger:component" type="component" identity="MenubarTrigger" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar trigger button"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarTrigger subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof MenubarPrimitive.Trigger>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Trigger with data-slot, hover/expanded states, and styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-[calc(var(--radius-md)-2px)] px-2 py-[calc(--spacing(0.85))] text-xs/relaxed font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar trigger button'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarContent:component" type="component" identity="MenubarContent" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar content popover"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarContent subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, align?: start, alignOffset?: number, sideOffset?: number, ...props: React.ComponentProps<typeof MenubarPrimitive.Content>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps MenubarPrimitive.Content in MenubarPortal and applies positioning and animation classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn("z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95", className )}
        {...props}
      />
    </MenubarPortal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar content popover'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarItem:component" type="component" identity="MenubarItem" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarItem subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, inset?: boolean, variant?: default | destructive, ...props: React.ComponentProps<typeof MenubarPrimitive.Item>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Item with data-slot, inset, variant styling, and focus states" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menubar-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarCheckboxItem:component" type="component" identity="MenubarCheckboxItem" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar checkbox item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarCheckboxItem subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, children?: ReactNode, checked?: boolean, inset?: boolean, ...props: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a checkbox item with an indicator icon, className, and inset support" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-7.5 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar checkbox item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarCheckboxItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarRadioItem:component" type="component" identity="MenubarRadioItem" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar radio item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarRadioItem subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, children?: ReactNode, inset?: boolean, ...props: React.ComponentProps<typeof MenubarPrimitive.RadioItem>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a radio item with an indicator icon, className, and inset support" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-7.5 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar radio item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarRadioItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarLabel:component" type="component" identity="MenubarLabel" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar label"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarLabel subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, inset?: boolean, ...props: React.ComponentProps<typeof MenubarPrimitive.Label>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a label with data-slot, inset, and muted styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar label'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarLabel:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSeparator:component" type="component" identity="MenubarSeparator" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a horizontal separator inside a Menubar"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarSeparator subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof MenubarPrimitive.Separator>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a separator with data-slot and background color" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a horizontal separator inside a Menubar'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSeparator:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarShortcut:component" type="component" identity="MenubarShortcut" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar shortcut hint"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarShortcut subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'span'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a span with small tracking-widest text and focus color" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar shortcut hint'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarShortcut:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSub:component" type="component" identity="MenubarSub" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a Menubar submenu wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarSub subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof MenubarPrimitive.Sub>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.Sub with data-slot" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a Menubar submenu wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSub:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSubTrigger:component" type="component" identity="MenubarSubTrigger" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Menubar sub menu trigger"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarSubTrigger subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, inset?: boolean, children?: ReactNode, ...props: React.ComponentProps<typeof MenubarPrimitive.SubTrigger>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a sub trigger with data-slot, inset, focus state, and a ChevronRight icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-none select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Menubar sub menu trigger'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSubTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSubContent:component" type="component" identity="MenubarSubContent" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders styled Menubar sub menu content"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the MenubarSubContent subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof MenubarPrimitive.SubContent>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto MenubarPrimitive.SubContent with data-slot and animation classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn("z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders styled Menubar sub menu content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:MenubarSubContent:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/menubar.tsx:export_list:export_list" type="export_list" identity="export_list" parent="~/.framework/src/components/ui/menubar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports all Menubar subcomponents from the module"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose Menubar subcomponents for external consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/menubar.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named Menubar exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export block for all Menubar subcomponents" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports all Menubar subcomponents from the module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/menubar.tsx:export_list:export_list"]
