








// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:use_client:constant" type="constant" identity="use_client" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Next.js use client directive"]
// CIL[DOC-MICRO logic_summary="Marks this module as a client component"]
// CIL[DOC-CONTRACT inputs="none" outputs="client rendering directive" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Next.js use client directive'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:use_client:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-MACRO purpose="shadcn/ui Tabs component module built on Radix UI"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="frontend"]
// CIL[DOC-STABILITY stability="stable"]
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Tabs component module built on Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:Tabs:component" type="component" identity="Tabs" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Renders a styled Radix Tabs root wrapper"]
// CIL[DOC-MICRO logic_summary="Spreads props onto TabsPrimitive.Root with default horizontal orientation and cn styling"]
// CIL[DOC-CONTRACT inputs="className: string, orientation: 'horizontal'|'vertical', ...props: TabsPrimitive.Root props" outputs="JSX.Element" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Radix Tabs root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:Tabs:component"]



// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:tabsListVariants:constant" type="constant" identity="tabsListVariants" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="CVA style variants for the tabs list container"]
// CIL[DOC-MICRO logic_summary="Defines default and line variants with rounded styling"]
// CIL[DOC-CONTRACT inputs="variant: 'default'|'line'" outputs="merged className string" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='CVA style variants for the tabs list container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:tabsListVariants:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:TabsList:component" type="component" identity="TabsList" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Renders the list of tab triggers"]
// CIL[DOC-MICRO logic_summary="Composes the radix list with the tabsListVariants CVA output and optional className"]
// CIL[DOC-CONTRACT inputs="className: string, variant: 'default'|'line', VariantProps, ...props" outputs="JSX.Element" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the list of tab triggers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:TabsList:component"]



// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:TabsTrigger:component" type="component" identity="TabsTrigger" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Renders an individual tab trigger button"]
// CIL[DOC-MICRO logic_summary="Applies focus, hover, active and disabled styles to a radix trigger"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: TabsPrimitive.Trigger props" outputs="JSX.Element" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-[[data-icon=inline-end]]:pr-1 has-[[data-icon=inline-start]]:pl-1 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an individual tab trigger button'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:TabsTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:TabsContent:component" type="component" identity="TabsContent" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Renders the panel shown for the active tab"]
// CIL[DOC-MICRO logic_summary="Wraps TabsPrimitive.Content with a flexible outline style; data-[state=inactive]:hidden guarantees inactive panels are display:none even when callers add display utilities — the Radix `hidden` attribute alone loses specificity to classes like `flex`" notable_decisions="hide-by-data-state rather than relying on the hidden attribute so display utilities on panel content never leak inactive tabs"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: TabsPrimitive.Content props" outputs="JSX.Element" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none data-[state=inactive]:hidden", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the panel shown for the active tab'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:TabsContent:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/tabs.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/tabs.tsx"]
// CIL[DOC-CONTEXT module="components/ui/tabs" layer="ui" related_files=".framework/src/components/ui/tabs.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="Public exports of the tabs UI primitives"]
// CIL[DOC-MICRO logic_summary="Re-exports Tabs, TabsList, TabsTrigger, TabsContent and tabsListVariants"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" side_effects="none" errors=""]
// CIL[DOC-STABILITY stability="stable"]
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
// CIL[DOC-VECTOR type="context" content="purpose='Public exports of the tabs UI primitives'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/tabs.tsx:exports:variable"]