// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/native-select.tsx"]
// CIL[DOC-MACRO purpose="Import React and utilities for the native-select component"]
// CIL[DOC-RESPONSIBILITY responsibility="Set up module dependencies and shared icons"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, cn, ChevronDownIcon available for downstream chunks" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React, the cn utility, and ChevronDownIcon for the select control" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]
import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Import React and utilities for the native-select component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectprops:type" type="type" identity="nativeselectprops" parent="~/.framework/src/components/ui/native-select.tsx"]
// CIL[DOC-MACRO purpose="Define the props type for the NativeSelect component"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the accepted properties of NativeSelect including size variants"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/components/ui/native-select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="standard select attributes" outputs="NativeSelectProps type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Omit the native size attribute and add a sm/default size union" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props type for the NativeSelect component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectprops:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselect:function" type="function" identity="nativeselect" parent="~/.framework/src/components/ui/native-select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an accessible and styled native select wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a select control with size variants, styling, and a chevron icon"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/components/ui/native-select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, size (sm|default), ...selectProps" outputs="JSX select wrapper with icon" errors="none" side_effects="renders DOM elements"]
// CIL[DOC-MICRO logic_summary="Wrap a select in a relative div and apply Tailwind classes plus a chevron icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-7 w-full min-w-0 appearance-none rounded-md border border-input bg-input/20 py-0.5 pr-6 pl-2 text-xs/relaxed transition-colors outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=sm]:h-6 data-[size=sm]:text-[0.625rem] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground select-none group-data-[size=sm]/native-select:size-3 group-data-[size=sm]/native-select:-translate-y-[calc(--spacing(1.25))]" aria-hidden="true" data-slot="native-select-icon" />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accessible and styled native select wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselect:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectoption:function" type="function" identity="nativeselectoption" parent="~/.framework/src/components/ui/native-select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a styled option element for NativeSelect"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a single select option with theme-aware colors"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/components/ui/native-select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props: React option attributes" outputs="JSX option element" errors="none" side_effects="renders DOM option"]
// CIL[DOC-MICRO logic_summary="Return an option with Canvas/CanvasText classes and forwarded props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled option element for NativeSelect'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectoption:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectoptgroup:function" type="function" identity="nativeselectoptgroup" parent="~/.framework/src/components/ui/native-select.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a styled optgroup element for NativeSelect"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a grouped set of options with theme-aware colors"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/components/ui/native-select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props: React optgroup attributes" outputs="JSX optgroup element" errors="none" side_effects="renders DOM optgroup"]
// CIL[DOC-MICRO logic_summary="Return an optgroup with Canvas/CanvasText classes and forwarded props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a styled optgroup element for NativeSelect'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:nativeselectoptgroup:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/native-select.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/native-select.tsx"]
// CIL[DOC-MACRO purpose="Export the NativeSelect component and helper components"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of the native-select module"]
// CIL[DOC-CONTEXT module="native-select" layer="ui" related_files=".framework/src/components/ui/native-select.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="component symbols" outputs="named exports for consumers" errors="none" side_effects="registers public module API"]
// CIL[DOC-MICRO logic_summary="Re-export NativeSelect, NativeSelectOptGroup, and NativeSelectOption" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
// CIL[DOC-VECTOR type="context" content="purpose='Export the NativeSelect component and helper components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/native-select.tsx:module_exports:module_exports"]
