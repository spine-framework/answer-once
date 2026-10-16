// CIL[BEGIN stable_id="~/.framework/src/hooks/useAppPath.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useAppPath.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-CONTEXT module="useAppPath" layer="hooks" related_files=".framework/src/contexts/AppContext.tsx"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="import the current-app context hook dependency"]
// CIL[DOC-MICRO logic_summary="imports useCurrentApp from AppContext" notable_decisions=""]
// CIL[DOC-RESPONSIBILITY responsibility="provide the app context dependency used by useAppPath"]
// CIL[DOC-STABILITY stable]


import { useCurrentApp } from '../contexts/AppContext'
// CIL[DOC-VECTOR type="context" content="purpose='import the current-app context hook dependency'; No verified external callers; imports: .framework/src/contexts/AppContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useAppPath.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useAppPath.ts:useAppPath:hook" type="hook" identity="useAppPath" parent="~/.framework/src/hooks/useAppPath.ts"]
// CIL[DOC-CONTEXT module="useAppPath" layer="hooks" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/hooks/useAppPath.ts"]
// CIL[DOC-CONTRACT inputs="path: string" outputs="string: prefixed and normalized path" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="return a path prefix function that applies the current app route prefix"]
// CIL[DOC-MICRO logic_summary="strips trailing slash from app.route_prefix; special-cases root '/'; otherwise ensures leading slash and concatenates" notable_decisions="treats '/' as special root path; only prefixes when a non-root route_prefix exists"]
// CIL[DOC-RESPONSIBILITY responsibility="produce an application-prefixed, slash-normalized path string"]
// CIL[DOC-STABILITY stable]
export function useAppPath(): (path: string) => string {
  const app = useCurrentApp()

  const prefix =
    !app.route_prefix || app.route_prefix === '/'
      ? ''
      : app.route_prefix.replace(/\/$/, '')

  return (path: string): string => {
    if (path === '/') return prefix || '/'
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${prefix}${normalized}`
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='return a path prefix function that applies the current app route prefix'; No verified external callers; imports: .framework/src/contexts/AppContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useAppPath.ts:useAppPath:hook"]