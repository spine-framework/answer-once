// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/navigation-menu.tsx"]
// CIL[DOC-MACRO purpose="Declare dependencies and set up the NavigationMenu UI module"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, class-variance-authority, Radix primitives, utilities, and icons"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="loads module dependencies"]
// CIL[DOC-MICRO logic_summary="Imports dependencies used by the NavigationMenu component set" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import * as React from "react"
import { cva } from "class-variance-authority"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Declare dependencies and set up the NavigationMenu UI module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenu:function" type="function" identity="navigationmenu" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a top-level navigation menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a Radix Root wrapper with an optional viewport"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, viewport, ...props" outputs="JSX navigation menu root" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders NavigationMenuPrimitive.Root, passes className and viewport flag, and conditionally renders the viewport" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a top-level navigation menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenu:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenulist:function" type="function" identity="navigationmenulist" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a list of navigation menu items"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap list items in a horizontally centered flex list"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX menu list" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders NavigationMenuPrimitive.List with flex, list-none, and gap utilities" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a list of navigation menu items'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenulist:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuitem:function" type="function" identity="navigationmenuitem" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a single navigation menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a relative-positioned Radix Item container"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX menu item" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders NavigationMenuPrimitive.Item with relative class and props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a single navigation menu item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenutriggerstyle:constant" type="constant" identity="navigationmenutriggerstyle" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provide the shared trigger style variant"]
// CIL[DOC-RESPONSIBILITY responsibility="Define cva classes for the navigation menu trigger button"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string class variant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls cva with a long tailwind class string for trigger styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-xs/relaxed font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted"
)
// CIL[DOC-VECTOR type="context" content="purpose='Provide the shared trigger style variant'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenutriggerstyle:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenutrigger:function" type="function" identity="navigationmenutrigger" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a trigger button for a navigation menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine the trigger style with a chevron icon"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, children, ...props" outputs="JSX trigger" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders Radix Trigger using navigationMenuTriggerStyle and a ChevronDownIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon className="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a trigger button for a navigation menu item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenutrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenucontent:function" type="function" identity="navigationmenucontent" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the dropdown content panel of a navigation menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply motion, position, and viewport-aware popover styles"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX content panel" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders Radix Content with complex data-state and viewport conditional classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1.5 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-md group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the dropdown content panel of a navigation menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenucontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuviewport:function" type="function" identity="navigationmenuviewport" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the viewport that positions menu content"]
// CIL[DOC-RESPONSIBILITY responsibility="Center and contain the Radix Viewport"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX viewport" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps Radix Viewport in a positioned div to center and size content" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 md:w-(--radix-navigation-menu-viewport-width) data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90",
          className
        )}
        {...props}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the viewport that positions menu content'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuviewport:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenulink:function" type="function" identity="navigationmenulink" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a navigation menu link"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled anchor for menu links"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX link" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders Radix Link with muted hover, focus, and active state classes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-1.5 rounded-lg p-2 text-xs/relaxed transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-[active=true]:bg-muted/50 data-[active=true]:hover:bg-muted data-[active=true]:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a navigation menu link'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenulink:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuindicator:function" type="function" identity="navigationmenuindicator" parent="~/.framework/src/components/ui/navigation-menu.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a small triangle indicator under the active menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Show a pointer indicator aligned with the selected item"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX indicator" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders Radix Indicator with a small rotated square and state animations" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small triangle indicator under the active menu'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:navigationmenuindicator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/navigation-menu.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/navigation-menu.tsx"]
// CIL[DOC-MACRO purpose="Export all NavigationMenu subcomponents and styles"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of the module"]
// CIL[DOC-CONTEXT module="NavigationMenu" layer="ui" related_files=".framework/src/components/ui/navigation-menu.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Collects and re-exports all functions and the trigger style" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
// CIL[DOC-VECTOR type="context" content="purpose='Export all NavigationMenu subcomponents and styles'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/navigation-menu.tsx:module_exports:module_exports"]
