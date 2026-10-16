












// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:use_client:directive"]
// CIL[DOC-MACRO purpose="Declarative client-only directive for Next.js."]
// CIL[DOC-MICRO logic_summary="Emits the 'use client' directive at the top of the module." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Declarative client-only directive for Next.js.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:use_client:directive"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Dialog UI primitives built on Radix UI for the framework design system."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-AUDIENCE audience="framework"]
// CIL[DOC-STABILITY stability="stable"]
import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-VECTOR type="context" content="purpose='Dialog UI primitives built on Radix UI for the framework design system.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:Dialog:component" type="component" identity="Dialog" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Root Dialog component forwarding props to Radix Dialog.Root."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Root and applies a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Root Dialog component forwarding props to Radix Dialog.Root.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:Dialog:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogTrigger:component" type="component" identity="DialogTrigger" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Trigger element that opens the dialog."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Trigger and applies a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Trigger element that opens the dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogTrigger:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogPortal:component" type="component" identity="DialogPortal" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Portal that renders dialog content outside the DOM tree."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Portal and applies a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React portal" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Portal that renders dialog content outside the DOM tree.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogPortal:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogClose:component" type="component" identity="DialogClose" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Close control for the dialog."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Close and applies a data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Close control for the dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogClose:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogOverlay:component" type="component" identity="DialogOverlay" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Backdrop overlay behind the dialog content."]
// CIL[DOC-MICRO logic_summary="ForwardRef component rendering DialogPrimitive.Overlay with styling and animation classes." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}

    />
  )
})
DialogOverlay.displayName = "DialogOverlay"
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Backdrop overlay behind the dialog content.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogOverlay:component"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogContent:component" type="component" identity="DialogContent" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Main dialog content panel with optional close button."]
// CIL[DOC-MICRO logic_summary="ForwardRef component composing Portal, Overlay, and DialogPrimitive.Content with children and an optional X icon button." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
  }

>(({ className, children, showCloseButton = true, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-xs/relaxed text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}

      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Main dialog content panel with optional close button.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogHeader:component" type="component" identity="DialogHeader" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Header area for dialog content."]
// CIL[DOC-MICRO logic_summary="Renders a flex column div with the dialog-header data slot." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Header area for dialog content.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogFooter:component" type="component" identity="DialogFooter" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Footer area for dialog actions."]
// CIL[DOC-MICRO logic_summary="Renders a responsive action bar with optional close button." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Footer area for dialog actions.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogFooter:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogTitle:component" type="component" identity="DialogTitle" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Accessible title for the dialog."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Title with heading typography and data-slot marker." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Accessible title for the dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogTitle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:DialogDescription:component" type="component" identity="DialogDescription" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Description text for the dialog."]
// CIL[DOC-MICRO logic_summary="Wraps DialogPrimitive.Description with muted styling and link hover behavior." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="React node" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Description text for the dialog.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:DialogDescription:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/dialog.tsx:module_footer:module_footer" type="module_footer" identity="module_footer" parent="~/.framework/src/components/ui/dialog.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Named exports for all dialog primitives."]
// CIL[DOC-MICRO logic_summary="Re-exports the composed dialog components for consumers." notable_decisions="[]"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="[]" side_effects="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="dialog" layer="components" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Named exports for all dialog primitives.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/dialog.tsx:module_footer:module_footer"]
