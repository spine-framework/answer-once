// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/context-menu.tsx"]
// CIL[DOC-MACRO purpose="Define the context-menu component module and its styled Radix UI subcomponents"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and provide composable, accessible context menu building blocks for the UI layer"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix UI ContextMenu primitives, utility helpers and icons; prepares re-exported subcomponents" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]
import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Define the context-menu component module and its styled Radix UI subcomponents'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenu:function" type="function" identity="contextmenu" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Root and forward props"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Root with data-slot and spread props" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenu:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenutrigger:function" type="function" identity="contextmenutrigger" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu trigger subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Trigger with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Trigger with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu trigger subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenutrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenugroup:function" type="function" identity="contextmenugroup" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu group subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Group with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.Group>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Group with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu group subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenugroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuportal:function" type="function" identity="contextmenuportal" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu portal subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Portal with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Portal with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu portal subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuportal:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusub:function" type="function" identity="contextmenusub" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu sub subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Sub with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Sub with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu sub subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusub:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuradiogroup:function" type="function" identity="contextmenuradiogroup" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu radiogroup subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.RadioGroup with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.RadioGroup with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu radiogroup subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuradiogroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenucontent:function" type="function" identity="contextmenucontent" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu content container"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Content in a Portal with positioning and animation styles"]
// CIL[DOC-CONTRACT inputs="className: string, side: Side, ...props: React.ComponentProps<typeof ContextMenuPrimitive.Content>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps Content in a Portal and applies positioning, animation and side-aware data attributes" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn("z-50 max-h-(--radix-context-menu-content-available-height) min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu content container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenucontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuitem:function" type="function" identity="contextmenuitem" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a context menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Item with variant/inset support and styling"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof ContextMenuPrimitive.Item> with optional inset and variant" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns Item with variant/inset handling, data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/context-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a context menu item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusubtrigger:function" type="function" identity="contextmenusubtrigger" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a sub-menu trigger"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.SubTrigger with chevron and inset support"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, inset: boolean, ...props: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns SubTrigger with ChevronRight icon, data-inset and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a sub-menu trigger'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusubtrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusubcontent:function" type="function" identity="contextmenusubcontent" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu subcontent subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.SubContent with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.SubContent with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn("z-50 min-w-32 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu subcontent subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenusubcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenucheckboxitem:function" type="function" identity="contextmenucheckboxitem" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a context menu checkbox item"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.CheckboxItem with checked state and icon indicator"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, checked: boolean, inset: boolean, ...props: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns CheckboxItem with ItemIndicator for CheckIcon, data-inset and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a context menu checkbox item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenucheckboxitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuradioitem:function" type="function" identity="contextmenuradioitem" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a context menu radio item"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.RadioItem with selection indicator"]
// CIL[DOC-CONTRACT inputs="className: string, children: React.ReactNode, inset: boolean, ...props: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns RadioItem with ItemIndicator for CheckIcon, data-inset and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a context menu radio item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuradioitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenulabel:function" type="function" identity="contextmenulabel" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu label subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Label with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="className: string, inset: boolean, ...props: React.ComponentProps<typeof ContextMenuPrimitive.Label>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Label with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu label subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenulabel:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuseparator:function" type="function" identity="contextmenuseparator" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu separator subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix ContextMenuPrimitive.Separator with project styling and forward props"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof ContextMenuPrimitive.Separator>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns ContextMenuPrimitive.Separator with data-slot and merged className" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu separator subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenuseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenushortcut:function" type="function" identity="contextmenushortcut" parent="~/.framework/src/components/ui/context-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the context menu shortcut text"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled span for keyboard shortcut text with focus-aware coloring"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps for span element" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a span with data-slot, merged className and accent-foreground focus styling" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the context menu shortcut text'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:contextmenushortcut:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/context-menu.tsx:module_footer:module_footer" type="module_footer" identity="module_footer" parent="~/.framework/src/components/ui/context-menu.tsx"]
// CIL[DOC-MACRO purpose="Re-export context menu subcomponents from the module"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the defined context menu subcomponents as named exports for consumers"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists all context menu subcomponents in the export block" notable_decisions="[]"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/context-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-export context menu subcomponents from the module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/context-menu.tsx:module_footer:module_footer"]
