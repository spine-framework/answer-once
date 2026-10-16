// CIL[BEGIN stable_id="~/.framework/src/components/ui/slider.tsx:use_client:module_directive" type="module_directive" identity="use_client" parent="~/.framework/src/components/ui/slider.tsx"]
// CIL[DOC-MACRO purpose="Declare this module as a client component for Next.js"]
// CIL[DOC-RESPONSIBILITY responsibility="Mark this module for client-side rendering"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/slider.tsx" layer="ui" related_files=".framework/src/components/ui/slider.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="use client directive applied to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Emits the use client directive at the top of the module" notable_decisions="Required for React client components in Next.js"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Declare this module as a client component for Next.js'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/slider.tsx:use_client:module_directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/slider.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/slider.tsx"]
// CIL[DOC-MACRO purpose="Import dependencies for the Slider component"]
// CIL[DOC-RESPONSIBILITY responsibility="Load React, the Radix UI Slider primitive, and the cn class merge utility"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/slider.tsx" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Imported React, SliderPrimitive, and cn bindings available to the module" errors="Module load fails if a peer dependency is missing" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, the Slider primitive from radix-ui, and the cn Tailwind class merge utility" notable_decisions="Uses the @/lib/utils alias for cn"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies for the Slider component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/slider.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/slider.tsx:slider:function" type="function" identity="Slider" parent="~/.framework/src/components/ui/slider.tsx"]
// CIL[DOC-MACRO purpose="Render an accessible range slider using Radix UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a styled slider with track, range, and thumb elements"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/slider.tsx" layer="ui" related_files=".framework/src/components/ui/slider.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, defaultValue, value, min, max, and Radix SliderPrimitive.Root props" outputs="React element implementing a horizontal or vertical range slider" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the value array from props, then renders a Radix SliderPrimitive.Root with track, range, and thumb children" notable_decisions="Defaults min to 0 and max to 100; coerces a single value into a [min, max] range"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-md bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-md border border-ring bg-white ring-ring/30 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:ring-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an accessible range slider using Radix UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/slider.tsx:slider:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/slider.tsx:export:export" type="export" identity="export" parent="~/.framework/src/components/ui/slider.tsx"]
// CIL[DOC-MACRO purpose="Export the Slider component for consumers"]
// CIL[DOC-RESPONSIBILITY responsibility="Make the Slider component available to other modules"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui/slider.tsx" layer="ui" related_files=".framework/src/components/ui/slider.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named export of the Slider component" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports the Slider function from this module" notable_decisions="Named export enables tree-shaking and explicit imports"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="[]"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="component developers"]
export { Slider }
// CIL[DOC-VECTOR type="context" content="purpose='Export the Slider component for consumers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/slider.tsx:export:export"]
