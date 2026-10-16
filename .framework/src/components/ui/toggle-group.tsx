// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_directive:directive" type="directive" identity="module_directive" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Indicates this file is a client-side React component."]
// CIL[DOC-RESPONSIBILITY responsibility="Mark the module as a client component."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle-group.tsx,.framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="client-boundary marker" errors="none" side_effects="marks file for client execution"]
// CIL[DOC-MICRO logic_summary="Declares the file as a client component for Next.js." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Indicates this file is a client-side React component.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_directive:directive"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Declares imports for the toggle group component module."]
// CIL[DOC-RESPONSIBILITY responsibility="Assemble required dependencies for toggle group implementation."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported dependencies" errors="resolution failure" side_effects="module dependency setup"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix UI, and shared utilities for the toggle group component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-consumers"]

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"
// CIL[DOC-VECTOR type="context" content="purpose='Declares imports for the toggle group component module.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroupcontext:constant" type="constant" identity="togglegroupcontext" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Provides React context for toggle group styling state."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold and distribute default variant, size, spacing, and orientation."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle-group.tsx,.framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React context object" errors="none" side_effects="provides default variant, size, spacing, and orientation"]
// CIL[DOC-MICRO logic_summary="Creates a context for sharing variant, size, spacing, and orientation to child toggle items." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
})

// CIL[DOC-VECTOR type="context" content="purpose='Provides React context for toggle group styling state.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroupcontext:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroup:function" type="function" identity="togglegroup" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Renders a styled, configurable toggle group container."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the root toggle group and provide context."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle-group.tsx,.framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, variant, size, spacing, orientation, children, VariantProps, props" outputs="JSX for group wrapper" errors="none" side_effects="renders Root, sets CSS custom property"]
// CIL[DOC-MICRO logic_summary="Renders a Radix Root wrapper with CSS gap variable, orientation support, and a context provider." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="VariantProps" type="VariantProps<typeof toggleVariants>" description="Style variant props inherited from toggleVariants for size and variant."]
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-[size=sm]:rounded-[min(var(--radius-md),8px)] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled, configurable toggle group container.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroupitem:function" type="function" identity="togglegroupitem" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Renders an individual toggle item within a toggle group."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a single toggle item with context-driven styles."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle-group.tsx,.framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, variant, size, VariantProps, props" outputs="JSX for toggle item" errors="none" side_effects="consumes context, applies variant and size"]
// CIL[DOC-MICRO logic_summary="Renders a Radix Item that inherits context variants and applies toggle styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-PARAM name="VariantProps" type="VariantProps<typeof toggleVariants>" description="Style variant props inherited from toggleVariants for size and variant."]
function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an individual toggle item within a toggle group.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:togglegroupitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_exports:exports" type="exports" identity="module_exports" parent="~/.framework/src/components/ui/toggle-group.tsx"]
// CIL[DOC-MACRO purpose="Exports the toggle group public API."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose ToggleGroup and ToggleGroupItem to consumers."]
// CIL[DOC-CONTEXT module="components/ui/toggle-group" layer="ui" related_files=".framework/src/components/ui/toggle-group.tsx,.framework/src/components/ui/toggle.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ToggleGroup and ToggleGroupItem exports" errors="none" side_effects="exposes public API"]
// CIL[DOC-MICRO logic_summary="Re-exports the group and item as the public API." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { ToggleGroup, ToggleGroupItem }
// CIL[DOC-VECTOR type="context" content="purpose='Exports the toggle group public API.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/toggle.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/toggle-group.tsx:module_exports:exports"]
