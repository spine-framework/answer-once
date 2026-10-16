// CIL[BEGIN stable_id="~/.framework/src/components/ui/direction.tsx:use_client:directive" type="directive" identity="use_client" parent="none"]
// CIL[DOC-MACRO purpose="Declares this module as a client-side React component."]
// CIL[DOC-RESPONSIBILITY responsibility="Instructs the bundler to treat the file as client-rendered code."]
// CIL[DOC-CONTEXT module="direction" layer="ui" related_files=".framework/src/components/ui/direction.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="client directive" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Emits the 'use client' string directive." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Declares this module as a client-side React component.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/direction.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/direction.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Imports dependencies for a Radix UI direction wrapper."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides React and Radix Direction primitives for the module."]
// CIL[DOC-CONTEXT module="direction" layer="ui" related_files=".framework/src/components/ui/direction.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported modules and types" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React and the Radix Direction namespace." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers importing direction utilities"]
import * as React from "react"
import { Direction } from "radix-ui"
// CIL[DOC-VECTOR type="context" content="purpose='Imports dependencies for a Radix UI direction wrapper.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/direction.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/direction.tsx:directionprovider:function" type="function" identity="DirectionProvider" parent="none"]
// CIL[DOC-MACRO purpose="Wraps Radix DirectionProvider and allows both dir and direction props."]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a bidirectional text-direction provider for child components."]
// CIL[DOC-CONTEXT module="direction" layer="ui" related_files=".framework/src/components/ui/direction.tsx"]
// CIL[DOC-CONTRACT inputs="{ dir?, direction?, children }" outputs="JSX DirectionProvider" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders the Radix provider using direction if provided, otherwise dir." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps Radix DirectionProvider and allows both dir and direction props.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/direction.tsx:directionprovider:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/direction.tsx:usedirection:constant" type="constant" identity="useDirection" parent="none"]
// CIL[DOC-MACRO purpose="Re-exports the Radix useDirection hook under a module-local name."]
// CIL[DOC-RESPONSIBILITY responsibility="Exposes a hook for consuming the current text direction."]
// CIL[DOC-CONTEXT module="direction" layer="ui" related_files=".framework/src/components/ui/direction.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="React hook" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assigns Direction.useDirection to the useDirection constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const useDirection = Direction.useDirection
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the Radix useDirection hook under a module-local name.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/direction.tsx:usedirection:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/direction.tsx:direction_exports:reexport" type="reexport" identity="direction_exports" parent="none"]
// CIL[DOC-MACRO purpose="Exposes DirectionProvider and useDirection as the module's public API."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines named exports available to consumers of the direction component."]
// CIL[DOC-CONTEXT module="direction" layer="ui" related_files=".framework/src/components/ui/direction.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports the provider component and hook." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { DirectionProvider, useDirection }
// CIL[DOC-VECTOR type="context" content="purpose='Exposes DirectionProvider and useDirection as the module's public API.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/direction.tsx:direction_exports:reexport"]
