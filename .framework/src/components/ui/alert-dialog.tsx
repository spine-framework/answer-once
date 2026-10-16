














// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides a styled alert-dialog UI component library wrapping Radix UI primitives for use in the framework."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and export the alert dialog subcomponents."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named exports for alert dialog subcomponents" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Imports React, Radix AlertDialog primitives, the cn utility, and the local Button component; re-exports subcomponents." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework UI consumers and component library users"]
import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// CIL[DOC-VECTOR type="context" content="purpose='Provides a styled alert-dialog UI component library wrapping Radix UI primitives for use in the framework.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialog:function" type="function" identity="alertdialog" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the root AlertDialog wrapper that provides context for trigger, content, and action subcomponents."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Root and forward props and children."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof AlertDialogPrimitive.Root>" outputs="JSX root element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns AlertDialogPrimitive.Root with data-slot and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the root AlertDialog wrapper that provides context for trigger, content, and action subcomponents.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialog:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogtrigger:function" type="function" identity="alertdialogtrigger" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the trigger element that opens the alert dialog."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Trigger and forward props."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>" outputs="JSX trigger element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns AlertDialogPrimitive.Trigger with data-slot and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the trigger element that opens the alert dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogtrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogportal:function" type="function" identity="alertdialogportal" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the portal that teleports alert dialog content into the document body."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Portal and forward children and props."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>" outputs="JSX portal element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns AlertDialogPrimitive.Portal with data-slot and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the portal that teleports alert dialog content into the document body.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogportal:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogoverlay:function" type="function" identity="alertdialogoverlay" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the modal overlay behind the alert dialog content."]
// CIL[DOC-RESPONSIBILITY responsibility="Style and render AlertDialogPrimitive.Overlay with a fixed full-screen backdrop and animation classes."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>" outputs="JSX overlay element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a fixed full-screen overlay with cn merging base classes and className." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the modal overlay behind the alert dialog content.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogoverlay:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogcontent:function" type="function" identity="alertdialogcontent" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the alert dialog content panel positioned over the overlay."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap AlertDialogPortal, AlertDialogOverlay and AlertDialogPrimitive.Content; apply size and styling classes."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, size: 'default' | 'sm', props: React.ComponentProps<typeof AlertDialogPrimitive.Content>" outputs="JSX content panel" errors="None beyond React rendering" side_effects="Renders DOM nodes with data-slot and data-size attributes"]
// CIL[DOC-MICRO logic_summary="Returns a Portal containing Overlay and a styled Content with size support and className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-3 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-64 data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the alert dialog content panel positioned over the overlay.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogheader:function" type="function" identity="alertdialogheader" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a centered header layout for alert dialog content."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a div with grid-based layout and media slot handling for the alert dialog title and media."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'div'>" outputs="JSX header element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a styled grid div with conditional media slot layout and responsive alignment." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a centered header layout for alert dialog content.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogheader:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogfooter:function" type="function" identity="alertdialogfooter" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the footer area containing alert dialog actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a flex footer with responsive button layout and size-aware grid for sm variants."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'div'>" outputs="JSX footer element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a flex grid div with reversed mobile and sm row layouts." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the footer area containing alert dialog actions.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogfooter:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogmedia:function" type="function" identity="alertdialogmedia" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a small media/icon slot inside the alert dialog header."]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled inline-flex container for alert dialog media with muted background."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<'div'>" outputs="JSX media element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a styled inline-flex rounded div with svg icon sizing." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-8 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small media/icon slot inside the alert dialog header.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogmedia:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogtitle:function" type="function" identity="alertdialogtitle" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the alert dialog title with heading typography."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Title and apply font-heading styles."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<typeof AlertDialogPrimitive.Title>" outputs="JSX title element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns AlertDialogPrimitive.Title with data-slot and className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-heading text-sm font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the alert dialog title with heading typography.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogtitle:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogdescription:function" type="function" identity="alertdialogdescription" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the alert dialog description with muted text and link styling."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Description and apply muted-foreground and link styles."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, props: React.ComponentProps<typeof AlertDialogPrimitive.Description>" outputs="JSX description element" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns AlertDialogPrimitive.Description with data-slot and className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the alert dialog description with muted text and link styling.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogdescription:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogaction:function" type="function" identity="alertdialogaction" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the confirmation action button for the alert dialog."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Action in a local Button with configurable variant and size."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>, props: React.ComponentProps<typeof AlertDialogPrimitive.Action>" outputs="JSX action button" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a Button asChild wrapping AlertDialogPrimitive.Action with variant/size and className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the confirmation action button for the alert dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogaction:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogcancel:function" type="function" identity="alertdialogcancel" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the cancel/close button for the alert dialog."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap Radix AlertDialogPrimitive.Cancel in a local Button with outline variant by default."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: string, Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>, props: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>" outputs="JSX cancel button" errors="None beyond React rendering" side_effects="Renders DOM node with data-slot attribute"]
// CIL[DOC-MICRO logic_summary="Returns a Button asChild wrapping AlertDialogPrimitive.Cancel with default outline variant/size and className merging." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the cancel/close button for the alert dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:alertdialogcancel:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/alert-dialog.tsx:export_list:export_list" type="module_exports" identity="export_list" parent="~/.framework/src/components/ui/alert-dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Expose all alert dialog subcomponents to consumers."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide named exports for the alert dialog subcomponents."]
// CIL[DOC-CONTEXT module="alert-dialog" layer="ui" related_files=".framework/src/components/ui/alert-dialog.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named exports for all alert dialog subcomponents" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Re-exports the local alert dialog functions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
// CIL[DOC-VECTOR type="context" content="purpose='Expose all alert dialog subcomponents to consumers.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/alert-dialog.tsx:export_list:export_list"]