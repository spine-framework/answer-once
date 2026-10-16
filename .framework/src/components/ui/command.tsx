// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/command.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui Command component module built on cmdk"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shadcn/ui Command primitives and their dependencies"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, CommandPrimitive, cn, Dialog, InputGroup, and icon bindings available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, cmdk Command primitive, utility, icon, dialog and input group dependencies" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]













import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui Command component module built on cmdk'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:command:function" type="function" identity="command" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled cmdk Command root wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the Command command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads props onto CommandPrimitive with a data-slot attribute and styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled cmdk Command root wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:command:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commanddialog:function" type="function" identity="commanddialog" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a command palette dialog"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandDialog command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="title?: string, description?: string, children?: ReactNode, className?: string, showCloseButton?: boolean, ...props: React.ComponentProps<typeof Dialog>" outputs="JSX.Element" errors="none" side_effects="renders a Dialog with hidden header"]
// CIL[DOC-MICRO logic_summary="Renders a Dialog wrapping children with screen-reader-only header metadata" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a command palette dialog'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commanddialog:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandinput:function" type="function" identity="commandinput" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Command input with a search icon"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandInput command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive.Input>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps CommandPrimitive.Input in an InputGroup with a SearchIcon addon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! bg-input/20 dark:bg-input/30">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-xs/relaxed outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-3.5 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Command input with a search icon'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandinput:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandlist:function" type="function" identity="commandlist" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a scrollable Command list"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandList command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive.List>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders CommandPrimitive.List with overflow and scroll styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a scrollable Command list'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandlist:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandempty:function" type="function" identity="commandempty" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders an empty state message for the Command list"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandEmpty command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive.Empty>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders CommandPrimitive.Empty with centered padding and text styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-xs/relaxed", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an empty state message for the Command list'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandempty:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandgroup:function" type="function" identity="commandgroup" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled Command group container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandGroup command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive.Group>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders CommandPrimitive.Group with data-slot and heading styles" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled Command group container'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandgroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandseparator:function" type="function" identity="commandseparator" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a horizontal separator between Command items"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandSeparator command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<typeof CommandPrimitive.Separator>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders CommandPrimitive.Separator as a styled horizontal rule" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a horizontal separator between Command items'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commanditem:function" type="function" identity="commanditem" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a styled selectable Command item with a check icon"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandItem command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, children?: ReactNode, ...props: React.ComponentProps<typeof CommandPrimitive.Item>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders CommandPrimitive.Item with data-slot, group selection, and a trailing CheckIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled selectable Command item with a check icon'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commanditem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:commandshortcut:function" type="function" identity="commandshortcut" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders keyboard shortcut text in a Command item"]
// CIL[DOC-RESPONSIBILITY responsibility="Render and style the CommandShortcut command subcomponent"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'span'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a span with data-slot and muted-foreground styling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders keyboard shortcut text in a Command item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:commandshortcut:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/command.tsx:command_exports:exports" type="exports" identity="command_exports" parent="~/.framework/src/components/ui/command.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the command component public API"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the command component exports"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/command.tsx,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports for Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports named component bindings" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the command component public API'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/dialog.tsx,.framework/src/components/ui/input-group.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/command.tsx:command_exports:exports"]
