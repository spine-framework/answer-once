// CIL[BEGIN stable_id="~/.framework/src/hooks/use-mobile.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/use-mobile.ts"]
// CIL[DOC-MACRO purpose="React hook module: provides the useIsMobile hook and MOBILE_BREAKPOINT constant for responsive mobile detection"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React primitives and export the breakpoint constant and useIsMobile hook"]
// CIL[DOC-CONTEXT module="hooks/use-mobile" layer="ui/hook" related_files=".framework/src/hooks/use-mobile.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none at module level" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React; re-exports the mobile breakpoint constant and the useIsMobile hook for consumers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="UI component developers needing mobile viewport detection"]
import * as React from "react"
// CIL[DOC-VECTOR type="context" content="purpose='React hook module: provides the useIsMobile hook and MOBILE_BREAKPOINT constant for responsive mobile detection'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/use-mobile.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/hooks/use-mobile.ts:MOBILE_BREAKPOINT:constant" type="constant" identity="MOBILE_BREAKPOINT" parent="~/.framework/src/hooks/use-mobile.ts"]
// CIL[DOC-MACRO purpose="Define the screen width threshold used to identify mobile viewports"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a shared numeric breakpoint for mobile detection"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="hooks/use-mobile" layer="ui/hook" related_files=".framework/src/hooks/use-mobile.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="768" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant number 768 representing the maximum width in pixels for mobile layouts"]
const MOBILE_BREAKPOINT = 768
// CIL[END stable_id="~/.framework/src/hooks/use-mobile.ts:MOBILE_BREAKPOINT:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Define the screen width threshold used to identify mobile viewports'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/src/hooks/use-mobile.ts:useIsMobile:hook" type="hook" identity="useIsMobile" parent="~/.framework/src/hooks/use-mobile.ts"]
// CIL[DOC-MACRO purpose="React hook that tracks whether the viewport is narrower than the mobile breakpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="Subscribe to window resize media queries and return a boolean indicating mobile viewport state"]
// CIL[DOC-CONTEXT module="hooks/use-mobile" layer="ui/hook" related_files=".framework/src/hooks/use-mobile.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="boolean (true when viewport width is below the mobile breakpoint)" errors="SSR window undefined outside browser; none" side_effects="Adds and removes a window matchMedia change listener; updates React state on mount and media changes"]
// CIL[DOC-MICRO logic_summary="Initialize isMobile as undefined, create a matchMedia listener for (max-width: MOBILE_BREAKPOINT - 1px), update state on mount and on media change, remove listener on unmount, and coerce the result to a boolean"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
// CIL[DOC-VECTOR type="context" content="purpose='React hook that tracks whether the viewport is narrower than the mobile breakpoint'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/use-mobile.ts:useIsMobile:hook"]
