// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:use_client:directive" type="directive" identity="use_client" parent="none"]
// CIL[DOC-MACRO purpose="Marks this module for client-side rendering in Next.js"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the use client directive at the top of the file"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="client rendering directive" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains the 'use client' string required by Next.js for client components." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]




















"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Marks this module for client-side rendering in Next.js'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:use_client:directive"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provides the Combobox UI components built on Base UI for the shadcn/ui design system"]
// CIL[DOC-RESPONSIBILITY responsibility="Import combobox dependencies and re-export the public Combobox component surface"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imports and component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up React, Base UI Combobox, utility, Button, InputGroup, and icon imports used by all combobox subcomponents." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]
import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Provides the Combobox UI components built on Base UI for the shadcn/ui design system'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:combobox:constant" type="constant" identity="combobox" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Assigns ComboboxPrimitive.Root to a local Combobox constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the root Combobox component under a concise local alias"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Combobox constant alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aliases ComboboxPrimitive.Root as Combobox for the public API." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const Combobox = ComboboxPrimitive.Root
// CIL[DOC-VECTOR type="context" content="purpose='Assigns ComboboxPrimitive.Root to a local Combobox constant'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:combobox:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxValue:component" type="component" identity="ComboboxValue" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the selected value display inside a combobox"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a styled ComboboxPrimitive.Value wrapper"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props from ComboboxPrimitive.Value.Props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto ComboboxPrimitive.Value with a data-slot attribute." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

// CIL[DOC-VECTOR type="context" content="purpose='Renders the selected value display inside a combobox'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxValue:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxTrigger:component" type="component" identity="ComboboxTrigger" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the combobox trigger button with a chevron icon"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a trigger element that opens the combobox popup"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, ...props and trigger props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps ComboboxPrimitive.Trigger with cn utilities and appends a ChevronDownIcon." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-3.5 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the combobox trigger button with a chevron icon'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxClear:component" type="component" identity="ComboboxClear" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a clear button for the combobox selection"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an accessible clear control as an InputGroupButton"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and clear props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders ComboboxPrimitive.Clear using an icon ghost button and an XIcon." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a clear button for the combobox selection'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxClear:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxInput:component" type="component" identity="ComboboxInput" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the combobox text input with optional trigger and clear controls"]
// CIL[DOC-RESPONSIBILITY responsibility="Compose an InputGroup with the primitive input, trigger and clear addons"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, disabled, showTrigger, showClear and input props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assembles an InputGroup around ComboboxPrimitive.Input and conditionally renders a ComboboxTrigger and ComboboxClear." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the combobox text input with optional trigger and clear controls'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxInput:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxContent:component" type="component" identity="ComboboxContent" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the combobox popup content with positioning"]
// CIL[DOC-RESPONSIBILITY responsibility="Portal and position the popup surface for the combobox list"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, side, sideOffset, align, alignOffset, anchor, ...props, Pick positioner props and popup props" outputs="React element" errors="none" side_effects="DOM portal"]
// CIL[DOC-MICRO logic_summary="Uses ComboboxPrimitive.Portal and Positioner to render a themed Popup with animation and data attributes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn("group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-7 *:data-[slot=input-group]:border-none *:data-[slot=input-group]:bg-input/20 *:data-[slot=input-group]:shadow-none dark:bg-popover data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the combobox popup content with positioning'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxList:component" type="component" identity="ComboboxList" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the scrollable list container for combobox items"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled ComboboxPrimitive.List with overflow and empty state support"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and list props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies a themed className with no-scrollbar, scroll padding and empty-state styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the scrollable list container for combobox items'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxList:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxItem:component" type="component" identity="ComboboxItem" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a selectable item inside the combobox list"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a list item with highlighting, disabled and checked indicator states"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, ...props and item props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps ComboboxPrimitive.Item and renders a CheckIcon indicator when selected." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a selectable item inside the combobox list'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxGroup:component" type="component" identity="ComboboxGroup" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Groups related combobox items under a common wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a ComboboxPrimitive.Group with className merging"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and group props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards props to ComboboxPrimitive.Group and applies className via cn." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Groups related combobox items under a common wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxLabel:component" type="component" identity="ComboboxLabel" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a label for a combobox group"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a muted group label using ComboboxPrimitive.GroupLabel"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and label props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies muted typography and padding to a ComboboxPrimitive.GroupLabel." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a label for a combobox group'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxLabel:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxCollection:component" type="component" identity="ComboboxCollection" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provides the collection wrapper for combobox options"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a ComboboxPrimitive.Collection with a data-slot attribute"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props as collection props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards props to ComboboxPrimitive.Collection and adds a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides the collection wrapper for combobox options'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxCollection:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxEmpty:component" type="component" identity="ComboboxEmpty" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the empty state when no combobox items match"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a centered empty message when the list has no matches"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and empty props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses a group-data-empty selector to show the message only when the list is empty." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-xs/relaxed text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the empty state when no combobox items match'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxEmpty:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxSeparator:component" type="component" identity="ComboboxSeparator" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a visual divider between combobox groups"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a horizontal separator between list groups"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and separator props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards props to ComboboxPrimitive.Separator and applies a border line style." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a visual divider between combobox groups'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxSeparator:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChips:component" type="component" identity="ComboboxChips" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the chip container for a multi-select combobox"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flex-wrapped chip list with focus and invalid states"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props, ComboboxPrimitive chips type and component props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps ComboboxPrimitive.Chips with a styled input-like container and focus ring." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-7 flex-wrap items-center gap-1 rounded-md border border-input bg-input/20 bg-clip-padding px-2 py-0.5 text-xs/relaxed transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 has-aria-invalid:border-destructive has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the chip container for a multi-select combobox'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChips:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChip:component" type="component" identity="ComboboxChip" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders an individual selected chip with optional remove button"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a chip label and conditionally a remove button"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, showRemove, ...props and chip props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders ComboboxPrimitive.Chip and conditionally a ChipRemove button using Button." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] bg-muted-foreground/10 px-1.5 text-xs/relaxed font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an individual selected chip with optional remove button'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChip:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChipsInput:component" type="component" identity="ComboboxChipsInput" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the inline text input inside the chip container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flexible text input for typing within chips"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props and input props" outputs="React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards props to ComboboxPrimitive.Input and applies a small outline-none className." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the inline text input inside the chip container'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:ComboboxChipsInput:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:useComboboxAnchor:hook" type="hook" identity="useComboboxAnchor" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provides a ref for anchoring the combobox popup"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a ref that can be attached to an anchor element"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React ref to HTMLDivElement" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a React ref typed to HTMLDivElement for anchoring." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides a ref for anchoring the combobox popup'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:useComboboxAnchor:hook"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/combobox.tsx:combobox:exports" type="export" identity="combobox" parent="~/.framework/src/components/ui/combobox.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the public Combobox component surface"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose all combobox subcomponents and the anchor hook"]
// CIL[DOC-CONTEXT module="combobox" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/combobox.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists all named component and hook exports for consumers." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the public Combobox component surface'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/combobox.tsx:combobox:exports"]
