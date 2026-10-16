// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provides module-level imports for the Vaul-based drawer UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, Vaul DrawerPrimitive, and the cn class-merging utility"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the dependencies used by all drawer subcomponents in this module" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-ui"]
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Provides module-level imports for the Vaul-based drawer UI primitives'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:Drawer:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Root and sets the drawer data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the root drawer container with a consistent data-slot attribute"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: ComponentProps of DrawerPrimitive.Root" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Root and applies data-slot drawer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Root and sets the drawer data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:Drawer:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerTrigger:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Trigger and sets the drawer-trigger data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a trigger element that opens or closes the drawer"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: ComponentProps of DrawerPrimitive.Trigger" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Trigger and applies data-slot drawer-trigger" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Trigger and sets the drawer-trigger data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerTrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerPortal:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Portal and sets the drawer-portal data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a portal that teleports drawer content into the document body"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: ComponentProps of DrawerPrimitive.Portal" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Portal and applies data-slot drawer-portal" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Portal and sets the drawer-portal data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerPortal:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerClose:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Close and sets the drawer-close data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a button or element that closes the drawer"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: ComponentProps of DrawerPrimitive.Close" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Close and applies data-slot drawer-close" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Close and sets the drawer-close data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerClose:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerOverlay:function"]
// CIL[DOC-MACRO purpose="Renders a fixed backdrop overlay behind the drawer content"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a darkened, optionally blurred overlay with open and close animations"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: ComponentProps of DrawerPrimitive.Overlay" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses cn to merge a fixed inset-0 black/80 backdrop class with any supplied className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a fixed backdrop overlay behind the drawer content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerOverlay:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerContent:function"]
// CIL[DOC-MACRO purpose="Composes the portal, overlay, and content for the drawer"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the drawer content surface with direction-aware positioning and a drag handle"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, children: optional ReactNode, props: ComponentProps of DrawerPrimitive.Content" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps DrawerPortal and DrawerOverlay, then renders a styled Vaul content panel with responsive width and a centered drag handle" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-transparent p-2 text-xs/relaxed text-popover-foreground before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border before:border-border before:bg-popover data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Composes the portal, overlay, and content for the drawer'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerContent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerHeader:function"]
// CIL[DOC-MACRO purpose="Provides a titled header area inside a drawer"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flex column header with direction-aware text alignment"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: ComponentProps of div" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses cn to merge flex column padding classes, centering text for top and bottom directions on small screens" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-1 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:text-left",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides a titled header area inside a drawer'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerHeader:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerFooter:function"]
// CIL[DOC-MACRO purpose="Provides a footer area at the bottom of a drawer"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flex column footer with auto top margin and padding"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: ComponentProps of div" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses cn to merge auto top margin, flex column, and padding classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides a footer area at the bottom of a drawer'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerFooter:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerTitle:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Title and sets the drawer-title data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the accessible title element for the drawer"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: ComponentProps of DrawerPrimitive.Title" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Title and applies font-heading styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-sm font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Title and sets the drawer-title data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerTitle:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerDescription:function"]
// CIL[DOC-MACRO purpose="Wraps Vaul DrawerPrimitive.Description and sets the drawer-description data-slot"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the accessible description element for the drawer"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: ComponentProps of DrawerPrimitive.Description" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards all props to DrawerPrimitive.Description and applies muted-foreground styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Vaul DrawerPrimitive.Description and sets the drawer-description data-slot'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:DrawerDescription:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/drawer.tsx:module_exports:module_exports"]
// CIL[DOC-MACRO purpose="Re-exports all drawer UI subcomponents from this module"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of drawer primitives for consumption by other modules"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/drawer.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named exports of all wrapper functions in this file" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports all drawer UI subcomponents from this module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/drawer.tsx:module_exports:module_exports"]
