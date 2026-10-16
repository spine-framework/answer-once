// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="shadcn/ui Sheet component module built on Radix UI Dialog primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a styled shadcn/ui Sheet component built on Radix UI Dialog primitives"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies and re-exports the Sheet subcomponent API" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="frontend"]
// CIL[DOC-STABILITY stability="stable"]













import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Sheet component module built on Radix UI Dialog primitives'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:Sheet:component" type="component" identity="Sheet" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders a styled Radix Sheet root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the sheet root wrapper that controls the dialog open state"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof SheetPrimitive.Root>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto SheetPrimitive.Root with a data-slot attribute for styling hooks" notable_decisions="Uses React.ComponentProps to inherit the Radix Dialog root prop types"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Radix Sheet root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:Sheet:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetTrigger:component" type="component" identity="SheetTrigger" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the trigger that opens the sheet"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the trigger element that opens the sheet"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof SheetPrimitive.Trigger>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto SheetPrimitive.Trigger with a data-slot attribute for styling hooks" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the trigger that opens the sheet'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetClose:component" type="component" identity="SheetClose" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the close button that dismisses the sheet"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the close button that dismisses the sheet"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof SheetPrimitive.Close>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto SheetPrimitive.Close with a data-slot attribute for styling hooks" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the close button that dismisses the sheet'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetClose:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetPortal:component" type="component" identity="SheetPortal" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the portal that mounts sheet content in the document body"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the portal that mounts sheet content in the document body"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props: React.ComponentProps<typeof SheetPrimitive.Portal>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto SheetPrimitive.Portal with a data-slot attribute for styling hooks" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the portal that mounts sheet content in the document body'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetPortal:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetOverlay:component" type="component" identity="SheetOverlay" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the backdrop overlay behind the sheet"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the backdrop overlay behind the sheet"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof SheetPrimitive.Overlay>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SheetPrimitive.Overlay and applies a fixed black/80 backdrop with optional blur and open/close animations" notable_decisions="Uses cn to merge the provided className with Tailwind backdrop and animation utilities"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the backdrop overlay behind the sheet'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetOverlay:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetContent:component" type="component" identity="SheetContent" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the main sheet panel with side positioning and an optional close button"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the main sheet panel with side positioning and an optional close button"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, children: ReactNode, side?: 'top'|'right'|'bottom'|'left', showCloseButton?: boolean, ...props: React.ComponentProps<typeof SheetPrimitive.Content>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Composes SheetPortal and SheetOverlay then renders SheetPrimitive.Content with side-aware Tailwind classes and an internal close button" notable_decisions="Defaults side to right and showCloseButton to true; uses data-side and data-open/data-closed attributes for animation hooks"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-xs/relaxed text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the main sheet panel with side positioning and an optional close button'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetHeader:component" type="component" identity="SheetHeader" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the header area of a sheet panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the header area of a sheet panel"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<'div'>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with the sheet-header data slot and vertical flex gap padding" notable_decisions="Merges an optional className with base layout classes via cn"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the header area of a sheet panel'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetFooter:component" type="component" identity="SheetFooter" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the footer area of a sheet panel"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the footer area of a sheet panel"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<'div'>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Renders a div with the sheet-footer data slot and bottom auto-margin padding" notable_decisions="Merges an optional className with base layout classes via cn"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the footer area of a sheet panel'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetFooter:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetTitle:component" type="component" identity="SheetTitle" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the accessible title inside a sheet"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the accessible title inside a sheet"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof SheetPrimitive.Title>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SheetPrimitive.Title with a heading font and data-slot attribute" notable_decisions="Merges an optional className with base typography classes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-sm font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the accessible title inside a sheet'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:SheetDescription:component" type="component" identity="SheetDescription" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Renders the accessible description inside a sheet"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the accessible description inside a sheet"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, ...props: React.ComponentProps<typeof SheetPrimitive.Description>" outputs="JSX.Element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Wraps SheetPrimitive.Description with muted-foreground text styling" notable_decisions="Merges an optional className with base text classes"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the accessible description inside a sheet'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:SheetDescription:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/sheet.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/sheet.tsx"]
// CIL[DOC-MACRO purpose="Re-exports the Sheet subcomponents as the public API of the module"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-exports the Sheet subcomponents as the public API of the module"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Named export list exposing all sheet primitives" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the Sheet subcomponents as the public API of the module'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sheet.tsx:exports:variable"]