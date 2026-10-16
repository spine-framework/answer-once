// CIL[BEGIN stable_id="~/.framework/src/components/ui/spinner.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/spinner.tsx:file"]
// CIL[DOC-MACRO purpose="shadcn/ui loading spinner component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a reusable Spinner loading indicator built on lucide-react"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="cn, Loader2Icon, and Spinner component available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the cn utility and Loader2Icon icon for the Spinner component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]







import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='shadcn/ui loading spinner component module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/spinner.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/spinner.tsx:spinner:function" type="function" identity="spinner" parent="~/.framework/src/components/ui/spinner.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders an accessible loading spinner icon"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a spinning loading indicator with default styling"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/spinner.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, ...props: React.ComponentProps<'svg'>" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders Loader2Icon with role=status, aria-label=Loading, default size and animation classes, and spreads remaining props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an accessible loading spinner icon'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/spinner.tsx:spinner:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/spinner.tsx:spinner:export" type="export" identity="spinner" parent="~/.framework/src/components/ui/spinner.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the Spinner component from the module"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the Spinner component for external consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/spinner.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named Spinner export" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export for the Spinner component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export { Spinner }
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the Spinner component from the module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/spinner.tsx:spinner:export"]
