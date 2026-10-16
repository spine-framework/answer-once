// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Defines the UI item component family for list and detail surfaces"]
// CIL[DOC-RESPONSIBILITY responsibility="Serves as the module-level entry point and owner for the item component family"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies, defines style variants and exports the Item component family" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="frontend-app-shell"]


















import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
// CIL[DOC-VECTOR type="context" content="purpose='Defines the UI item component family for list and detail surfaces'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemGroup:component" type="component" identity="ItemGroup" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Container that wraps a list of item components with role=list and group styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a list group container for item siblings"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with role=list, applies cva spacing for size variants, forwards props and className" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Container that wraps a list of item components with role=list and group styling'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemSeparator:component" type="component" identity="ItemSeparator" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Horizontal separator for item groups"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a horizontal separator between item group entries"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="Separator JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps the Separator component and applies my-2 margins" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Horizontal separator for item groups'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemSeparator:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:itemVariants:constant" type="constant" identity="itemVariants" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="cva style recipe for the main Item wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a class-variance-authority style recipe for the main Item wrapper"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="cva variant object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines default, outline and muted variants plus default and sm/xs sizes" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-md border text-xs/relaxed transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2.5 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='cva style recipe for the main Item wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:itemVariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:Item:component" type="component" identity="Item" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Main item wrapper component with size, variant and asChild support"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the main item wrapper with variant, size and asChild support"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, variant, size, asChild, VariantProps, ...props" outputs="div or Slot.Root JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects Slot.Root or div based on asChild, applies itemVariants class and data attributes" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Main item wrapper component with size, variant and asChild support'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:Item:component"]



// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:itemMediaVariants:constant" type="constant" identity="itemMediaVariants" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="cva style recipe for item media (icon, image)"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a cva style recipe for item media (icon, image)"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="cva variant object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines default, icon and image media variants with size-aware rules" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-8 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='cva style recipe for item media (icon, image)'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:itemMediaVariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemMedia:component" type="component" identity="ItemMedia" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Renders media (icon, image) inside an item"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders media (icon, image) inside an item"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, variant, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with item-media slot and itemMediaVariants classes" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders media (icon, image) inside an item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemMedia:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemContent:component" type="component" identity="ItemContent" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Flexible content column for item main text"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the flexible content column for item main text"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a flex column with item-content slot, supports adjacent sibling layout" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0.5 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Flexible content column for item main text'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemTitle:component" type="component" identity="ItemTitle" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Title line for an item"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a clamped single-line title inside an item"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a clamped single-line title with underline offset styling" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-xs/relaxed leading-snug font-medium underline-offset-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Title line for an item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemDescription:component" type="component" identity="ItemDescription" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Secondary description text for an item"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders secondary description text for an item"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="p JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a clamped two-line muted paragraph with link hover styles" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-left text-xs/relaxed font-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Secondary description text for an item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemDescription:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemActions:component" type="component" identity="ItemActions" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Action buttons or controls attached to an item"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders action buttons or controls attached to an item"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a flex row with item-actions slot and gap-2 spacing" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Action buttons or controls attached to an item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemActions:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemHeader:component" type="component" identity="ItemHeader" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Header row that spans the full item width"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a header row that spans the full item width"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a basis-full row with item-header slot and justify-between" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Header row that spans the full item width'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:ItemFooter:component" type="component" identity="ItemFooter" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Footer row that spans the full item width"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a footer row that spans the full item width"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="div JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a basis-full row with item-footer slot and justify-between" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Footer row that spans the full item width'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:ItemFooter:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/item.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/item.tsx"]
// CIL[DOC-MACRO purpose="Named exports for the item component family"]
// CIL[DOC-RESPONSIBILITY responsibility="Exposes all public item subcomponents and style recipes"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/item" layer="ui" related_files=".framework/src/components/ui/item.tsx,.framework/src/components/ui/separator.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports all public item subcomponents and style recipes" notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
// CIL[DOC-VECTOR type="context" content="purpose='Named exports for the item component family'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/separator.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/item.tsx:exports:variable"]
