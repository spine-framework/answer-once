// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:use_client:module_directive" type="module_directive" identity="use_client" parent="~/.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-MACRO purpose="Mark this module for client-side execution in Next.js."]
// CIL[DOC-RESPONSIBILITY responsibility="Signal to the bundler that the file must run in the browser."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Next.js 'use client' directive." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Mark this module for client-side execution in Next.js.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:use_client:module_directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Import the Collapsible primitive from radix-ui for the design system."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the Radix UI dependency used by the collapsible subcomponents."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import Collapsible as CollapsiblePrimitive from radix-ui." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
// CIL[DOC-VECTOR type="context" content="purpose='Import the Collapsible primitive from radix-ui for the design system.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsible:function" type="function" identity="collapsible" parent="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a collapsible container that wraps the Radix UI root primitive."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a styled, data-slotted Collapsible wrapper."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof CollapsiblePrimitive.Root>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render CollapsiblePrimitive.Root with data-slot='collapsible' and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a collapsible container that wraps the Radix UI root primitive.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsible:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsibletrigger:function" type="function" identity="collapsibletrigger" parent="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the trigger button for a collapsible region."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap and style the Radix UI CollapsibleTrigger with a data-slot attribute."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render CollapsiblePrimitive.CollapsibleTrigger with data-slot='collapsible-trigger' and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the trigger button for a collapsible region.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsibletrigger:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsiblecontent:function" type="function" identity="collapsiblecontent" parent="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the content area that expands and collapses."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap and style the Radix UI CollapsibleContent with a data-slot attribute."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Render CollapsiblePrimitive.CollapsibleContent with data-slot='collapsible-content' and spread props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the content area that expands and collapses.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:collapsiblecontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/collapsible.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/collapsible.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Export the Collapsible, CollapsibleTrigger, and CollapsibleContent components."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the public API of the collapsible UI module."]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="the three public components" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export of Collapsible, CollapsibleTrigger, and CollapsibleContent." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Collapsible, CollapsibleTrigger, CollapsibleContent }
// CIL[DOC-VECTOR type="context" content="purpose='Export the Collapsible, CollapsibleTrigger, and CollapsibleContent components.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/collapsible.tsx:module_exports:module_exports"]
