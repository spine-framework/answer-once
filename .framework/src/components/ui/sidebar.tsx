// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]
// CIL[DOC-MACRO purpose="Collects sidebar dependencies, shared configuration, context types, and exports the public sidebar API"]
// CIL[DOC-RESPONSIBILITY responsibility="Import shared dependencies and declare module-level sidebar constants and types"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none (side effects at module level)" errors="none" side_effects="creates React context and defines module constants"]
// CIL[DOC-MICRO logic_summary="Imports React, cva, radix-ui Slot, project hooks, local utilities, and sibling UI components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]































import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PanelLeftIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Collects sidebar dependencies, shared configuration, context types, and exports the public sidebar API'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:sidebar_config:config" type="config" identity="sidebar_config" parent="none"]
// CIL[DOC-MACRO purpose="Defines sidebar layout constants, cookie name, keyboard shortcut, and the React context type"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide reusable layout values and the typed sidebar context"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="constants, types, and context" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares cookie and width constants and a typed context for provider state" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}
const SidebarContext = React.createContext<SidebarContextProps | null>(null)
// CIL[DOC-VECTOR type="context" content="purpose='Defines sidebar layout constants, cookie name, keyboard shortcut, and the React context type'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:sidebar_config:config"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:useSidebar:hook" type="hook" identity="useSidebar" parent="none"]
// CIL[DOC-MACRO purpose="Provides the sidebar state hook used by consumers within a SidebarProvider"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the current sidebar context or throw if the provider is missing"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="SidebarContextProps object" errors="throws if called outside a SidebarProvider" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads context and throws when null" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides the sidebar state hook used by consumers within a SidebarProvider'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:useSidebar:hook"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarProvider:component" type="component" identity="SidebarProvider" parent="none"]
// CIL[DOC-MACRO purpose="Manages sidebar open state, mobile sheet state, cookie persistence, and keyboard toggle"]
// CIL[DOC-RESPONSIBILITY responsibility="Own sidebar state, cookie persistence, keyboard shortcut, and context value"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="defaultOpen, open, onOpenChange, className, style, children, props" outputs="JSX element" errors="none" side_effects="sets document.cookie and attaches a window keydown listener"]
// CIL[DOC-MICRO logic_summary="Initializes open state, syncs props, persists state to a cookie, and toggles via keyboard" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Manages sidebar open state, mobile sheet state, cookie persistence, and keyboard toggle'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarProvider:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:Sidebar:component" type="component" identity="Sidebar" parent="none"]
// CIL[DOC-MACRO purpose="Renders the main sidebar container with responsive offcanvas, floating, or inset variants"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the correct sidebar layout for desktop or mobile contexts"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="side, variant, collapsible, className, children, dir, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Chooses between a static container, a mobile Sheet, or a desktop peer layout based on props and screen" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }
  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the main sidebar container with responsive offcanvas, floating, or inset variants'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:Sidebar:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarTrigger:component" type="component" identity="SidebarTrigger" parent="none"]
// CIL[DOC-MACRO purpose="Renders a button that toggles the sidebar open/closed state"]
// CIL[DOC-RESPONSIBILITY responsibility="Toggle sidebar state when activated by user interaction"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, onClick, props" outputs="JSX element" errors="none" side_effects="calls toggleSidebar on click"]
// CIL[DOC-MICRO logic_summary="Wraps Button and calls toggleSidebar when clicked" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a button that toggles the sidebar open/closed state'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarRail:component" type="component" identity="SidebarRail" parent="none"]
// CIL[DOC-MACRO purpose="Renders a collapsible rail area that toggles the sidebar when clicked"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a clickable rail to collapse or expand the sidebar"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="calls toggleSidebar on click"]
// CIL[DOC-MICRO logic_summary="Renders an absolute hover/click rail to toggle the sidebar" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a collapsible rail area that toggles the sidebar when clicked'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarRail:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarInset:component" type="component" identity="SidebarInset" parent="none"]
// CIL[DOC-MACRO purpose="Renders the main content area that adapts to the sidebar variant"]
// CIL[DOC-RESPONSIBILITY responsibility="Display main page content with correct margins for the active sidebar variant"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders main content with inset-aware margins" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the main content area that adapts to the sidebar variant'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarInset:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarInput:component" type="component" identity="SidebarInput" parent="none"]
// CIL[DOC-MACRO purpose="Renders a compact input styled for use inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an input field visually adapted to the sidebar"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to Input with sidebar-specific styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "h-8 w-full border-input bg-muted/20 dark:bg-muted/30",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a compact input styled for use inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarInput:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarHeader:component" type="component" identity="SidebarHeader" parent="none"]
// CIL[DOC-MACRO purpose="Renders a header section inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Contain header-level children inside the sidebar layout"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a header section inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarFooter:component" type="component" identity="SidebarFooter" parent="none"]
// CIL[DOC-MACRO purpose="Renders a footer section inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Contain footer-level children inside the sidebar layout"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a footer section inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarFooter:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarSeparator:component" type="component" identity="SidebarSeparator" parent="none"]
// CIL[DOC-MACRO purpose="Renders a horizontal separator line inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Visually separate groups of sidebar items"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled Separator" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a horizontal separator line inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarSeparator:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarContent:component" type="component" identity="SidebarContent" parent="none"]
// CIL[DOC-MACRO purpose="Renders the scrollable content area of the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the scrollable primary content region of the sidebar"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a scrollable flex div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the scrollable content area of the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroup:component" type="component" identity="SidebarGroup" parent="none"]
// CIL[DOC-MACRO purpose="Renders a grouping container for sidebar menu items"]
// CIL[DOC-RESPONSIBILITY responsibility="Group related items and labels inside the sidebar"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col px-2 py-1",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a grouping container for sidebar menu items'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroup:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupLabel:component" type="component" identity="SidebarGroupLabel" parent="none"]
// CIL[DOC-MACRO purpose="Renders a label for a sidebar group with collapse behavior"]
// CIL[DOC-RESPONSIBILITY responsibility="Display the group heading and hide it in collapsed icon mode"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, asChild, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses Slot.Root or div and hides on icon-only sidebar" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a label for a sidebar group with collapse behavior'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupLabel:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupAction:component" type="component" identity="SidebarGroupAction" parent="none"]
// CIL[DOC-MACRO purpose="Renders an action button for a sidebar group"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a small action button on a group header"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, asChild, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses Slot.Root or button and positions absolutely in the group header" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an action button for a sidebar group'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupAction:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupContent:component" type="component" identity="SidebarGroupContent" parent="none"]
// CIL[DOC-MACRO purpose="Renders the content wrapper for a sidebar group"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap the children of a sidebar group"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-xs", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the content wrapper for a sidebar group'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarGroupContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenu:component" type="component" identity="SidebarMenu" parent="none"]
// CIL[DOC-MACRO purpose="Renders a menu list inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the unordered menu list of sidebar items"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled ul" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-px", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a menu list inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenu:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuItem:component" type="component" identity="SidebarMenuItem" parent="none"]
// CIL[DOC-MACRO purpose="Renders a menu item wrapper inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap a single entry in the sidebar menu"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled li" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a menu item wrapper inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuItem:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:sidebarMenuButtonVariants:constant" type="constant" identity="sidebarMenuButtonVariants" parent="none"]
// CIL[DOC-MACRO purpose="Defines the class-variance-authority variants for sidebar menu buttons"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute CSS class variants for menu button sizes and styles"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="cva variant function" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds cva variants for default and outline styles plus sizes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-[calc(var(--radius-sm)+2px)] p-2 text-left text-xs ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-xs",
        sm: "h-7 text-xs",
        lg: "h-12 text-xs group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
// CIL[DOC-VECTOR type="context" content="purpose='Defines the class-variance-authority variants for sidebar menu buttons'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:sidebarMenuButtonVariants:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuButton:component" type="component" identity="SidebarMenuButton" parent="none"]
// CIL[DOC-MACRO purpose="Renders an interactive sidebar menu button with optional tooltip"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the interactive menu button and optional collapsed tooltip"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="asChild, isActive, variant, size, tooltip, className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders the cva-styled button and wraps with tooltip when collapsed" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an interactive sidebar menu button with optional tooltip'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuButton:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuAction:component" type="component" identity="SidebarMenuAction" parent="none"]
// CIL[DOC-MACRO purpose="Renders an action button attached to a sidebar menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a small action attached to a menu item, with hover reveal"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, asChild, showOnHover, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders an optional child or button and reveals on hover" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-[calc(var(--radius-sm)-2px)] p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an action button attached to a sidebar menu item'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuAction:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuBadge:component" type="component" identity="SidebarMenuBadge" parent="none"]
// CIL[DOC-MACRO purpose="Renders a badge indicator for a sidebar menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a numeric or status badge next to a menu item"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a small badge with dynamic hover colors" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-[calc(var(--radius-sm)-2px)] px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a badge indicator for a sidebar menu item'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuBadge:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSkeleton:component" type="component" identity="SidebarMenuSkeleton" parent="none"]
// CIL[DOC-MACRO purpose="Renders a placeholder skeleton loading row for sidebar menu items"]
// CIL[DOC-RESPONSIBILITY responsibility="Show a loading placeholder for a menu item"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, showIcon, props" outputs="JSX element" errors="none" side_effects="uses Math.random to pick a skeleton width on mount"]
// CIL[DOC-MICRO logic_summary="Renders icon and text skeletons with a randomized width" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a placeholder skeleton loading row for sidebar menu items'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSkeleton:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSub:component" type="component" identity="SidebarMenuSub" parent="none"]
// CIL[DOC-MACRO purpose="Renders a collapsible sub-menu list inside the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an indented sub-menu list"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders an indented bordered sub-list" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a collapsible sub-menu list inside the sidebar'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSub:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSubItem:component" type="component" identity="SidebarMenuSubItem" parent="none"]
// CIL[DOC-MACRO purpose="Renders a sub-menu item wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap a single sub-menu entry"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forwards to a styled li" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a sub-menu item wrapper'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSubItem:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSubButton:component" type="component" identity="SidebarMenuSubButton" parent="none"]
// CIL[DOC-MACRO purpose="Renders a button for a sub-menu item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an anchor-like sub-menu button"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="asChild, size, isActive, className, props" outputs="JSX element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders an anchor or child with size/active states" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-xs data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a button for a sub-menu item'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:SidebarMenuSubButton:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/sidebar.tsx:module_exports:export" type="export" identity="module_exports" parent="none"]
// CIL[DOC-MACRO purpose="Re-exports all public sidebar components, hooks, and helpers"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose all public sidebar symbols to consumers"]
// CIL[DOC-CONTEXT module="sidebar" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sheet.tsx,.framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none (module re-exports)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists every public component and hook in a single export block" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports all public sidebar components, hooks, and helpers'; No verified external callers; imports: .framework/src/hooks/use-mobile.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/sidebar.tsx:module_exports:export"]
