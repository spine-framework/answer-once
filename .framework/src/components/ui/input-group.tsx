










// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Defines the InputGroup UI component module, importing dependencies and exporting all subcomponents."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shared UI primitives (InputGroup, Addon, Button, Text, Input, Textarea) and their styling variants for the design system."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React, cva, cn, Button, Input and Textarea; re-export the InputGroup subcomponents." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// CIL[DOC-VECTOR type="context" content="purpose='Defines the InputGroup UI component module, importing dependencies and exporting all subcomponents.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroup:function" type="function" identity="inputgroup" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an accessible InputGroup container with themed styles and focus/invalid state propagation."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap children in a flex group with data-slot and role=group, applying input-group styles and focus/invalid rings."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'div'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Build a <div> with data-slot, role=group, and combined Tailwind classes; spread remaining props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-7 w-full min-w-0 items-center rounded-md border border-input bg-input/20 transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-data-[align=block-end]:rounded-md has-data-[align=block-start]:rounded-md has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[textarea]:rounded-md has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accessible InputGroup container with themed styles and focus/invalid state propagation.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroup:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupaddonvariants:constant" type="constant" identity="inputgroupaddonvariants" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define Tailwind class variant authority (cva) styles for input group add-on alignment."]
// CIL[DOC-RESPONSIBILITY responsibility="Generate class strings for inline and block add-on alignment and disabled opacity."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="align: VariantProps['inputGroupAddonVariants']['align']" outputs="className string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Configure cva base classes and alignment variant classes; default to inline-start." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-1 py-2 text-xs/relaxed font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-[calc(var(--radius-sm)-2px)] **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1 **:data-[slot=kbd]:text-[0.625rem] [&>svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:ml-[-0.275rem] has-[>kbd]:ml-[-0.275rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:mr-[-0.275rem] has-[>kbd]:mr-[-0.275rem]",
        "block-start":
          "order-first w-full justify-start px-2 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define Tailwind class variant authority (cva) styles for input group add-on alignment.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupaddonvariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupaddon:function" type="function" identity="inputgroupaddon" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an interactive InputGroup add-on that focuses the input on click."]
// CIL[DOC-RESPONSIBILITY responsibility="Render an add-on wrapper with alignment variant classes and click-to-focus behavior."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, align: 'inline-start' | 'inline-end' | 'block-start' | 'block-end', props: React.ComponentProps<'div'>" outputs="JSX.Element" errors="none" side_effects="focuses sibling input element when the add-on is clicked and the click did not originate from a button"]
// CIL[DOC-MICRO logic_summary="Render a div with role=group, data-slot and data-align; on click, focus the nearest input unless a button was clicked." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }

        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an interactive InputGroup add-on that focuses the input on click.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupaddon:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupbuttonvariants:constant" type="constant" identity="inputgroupbuttonvariants" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define cva size variants for the InputGroupButton component."]
// CIL[DOC-RESPONSIBILITY responsibility="Generate class strings for button size and icon variants with correct sizing and spacing."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="size: 'xs' | 'sm' | 'icon-xs' | 'icon-sm'" outputs="className string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Configure cva with size variants including xs, sm, icon-xs, icon-sm and default xs." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-md text-xs/relaxed shadow-none",
  {
    variants: {
      size: {
        xs: "h-5 gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1 [&>svg:not([class*='size-'])]:size-3",
        sm: "gap-1",
        "icon-xs": "size-6 p-0 has-[>svg]:p-0",
        "icon-sm": "size-7 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Define cva size variants for the InputGroupButton component.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupbuttonvariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupbutton:function" type="function" identity="inputgroupbutton" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a small button suitable for placement inside an input group."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a Button with default ghost variant and xs size, merging input group button variant classes."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, type: 'button', variant: 'ghost', size: 'xs' | 'sm' | 'icon-xs' | 'icon-sm', props: Omit<React.ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>, VariantProps: VariantProps<typeof inputGroupButtonVariants>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render a Button with type, data-size, variant, and merged cva size classes; spread remaining props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Render a small button suitable for placement inside an input group.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupbutton:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgrouptext:function" type="function" identity="inputgrouptext" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render styled helper text or label content inside an input group."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a span with muted text styling and svg sizing utilities."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'span'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render a span with combined text-muted and svg size classes; spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-xs/relaxed text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render styled helper text or label content inside an input group.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgrouptext:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupinput:function" type="function" identity="inputgroupinput" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an input control styled for use inside an InputGroup."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a full-width Input with transparent background, no border, and no focus ring, marked as the group control."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'input'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render an Input with data-slot='input-group-control' and rounded-none, border-0, transparent, ring-0 classes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an input control styled for use inside an InputGroup.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgroupinput:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:inputgrouptextarea:function" type="function" identity="inputgrouptextarea" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a textarea control styled for use inside an InputGroup."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a Textarea with transparent background, resize-none, no border, and no focus ring."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'textarea'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render a Textarea with data-slot='input-group-control' and rounded-none, border-0, resize-none, transparent, ring-0 classes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a textarea control styled for use inside an InputGroup.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:inputgrouptextarea:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/input-group.tsx:export:export" type="export" identity="export" parent="~/.framework/src/components/ui/input-group.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Expose InputGroup subcomponents for consumers of the UI package."]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export the component and variant symbols from this module."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export list of all InputGroup subcomponents and their cva variants." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
// CIL[DOC-VECTOR type="context" content="purpose='Expose InputGroup subcomponents for consumers of the UI package.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/input-group.tsx:export:export"]
