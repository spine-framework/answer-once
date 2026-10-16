// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Defines the CustomAppLoader component module imports and public entry point for lazy-loading custom and core apps."]
// CIL[DOC-RESPONSIBILITY responsibility="Import runtime dependencies and expose the lazy application loader."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="React, lazy, Suspense, Component, ReactNode, and LoadingSpinner imports are gathered at the top of the module." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-developer"]
import React, { lazy, Suspense, Component } from 'react'
import type { ReactNode } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the CustomAppLoader component module imports and public entry point for lazy-loading custom and core apps.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:errorboundaryprops:interface" type="interface" identity="errorboundaryprops" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props contract for the AppErrorBoundary React class component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the error boundary's expected inputs: slug and children."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string, children: ReactNode" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface describing the properties consumed by the error boundary." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ErrorBoundaryProps {
  slug: string
  children: ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the AppErrorBoundary React class component.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:errorboundaryprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:errorboundarystate:interface" type="interface" identity="errorboundarystate" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="State contract for the AppErrorBoundary component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the single error field maintained by the error boundary."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines the error state shape used by the class component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ErrorBoundaryState {
  error: Error | null
}
// CIL[DOC-VECTOR type="context" content="purpose='State contract for the AppErrorBoundary component.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:errorboundarystate:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:apperrorboundary:class" type="class" identity="apperrorboundary" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="React error boundary that renders a friendly error screen when a lazily loaded app fails."]
// CIL[DOC-RESPONSIBILITY responsibility="Catch runtime errors in child subtrees and display the app slug and error message."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string, children: ReactNode (via props)" outputs="JSX.Element | ReactNode" errors="none" side_effects="Renders a fallback error UI."]
// CIL[DOC-MICRO logic_summary="Stores error in state, derives fallback JSX from error.message and slug, otherwise renders children." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 max-w-lg">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">App Load Error</h1>
            <p className="text-slate-600 mb-4">
              Failed to load the <strong>{this.props.slug}</strong> app.
            </p>
            <pre className="bg-slate-100 rounded-lg p-4 text-left text-sm text-red-600 overflow-auto mb-4">
              {this.state.error.message}
            </pre>
            <p className="text-sm text-slate-500">
              Check that <code>apps/{this.props.slug}/index.tsx</code> exists and exports a default component.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='React error boundary that renders a friendly error screen when a lazily loaded app fails.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:apperrorboundary:class"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:customappmodules:constant" type="constant" identity="customappmodules" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Glob mapping for custom application entry points."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose Vite import.meta.glob imports for custom apps."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, () => Promise<{ default: React.ComponentType }>>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines a Vite glob pattern that resolves to available custom app modules." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const customAppModules = import.meta.glob('../../../custom/apps/*/index.tsx')
// CIL[DOC-VECTOR type="context" content="purpose='Glob mapping for custom application entry points.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:customappmodules:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:coreappmodules:constant" type="constant" identity="coreappmodules" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Glob mapping for core framework application entry points."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose Vite import.meta.glob imports for core apps."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, () => Promise<{ default: React.ComponentType }>>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines a Vite glob pattern that resolves to available core app modules." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const coreAppModules   = import.meta.glob('../apps/*/index.tsx')
// CIL[DOC-VECTOR type="context" content="purpose='Glob mapping for core framework application entry points.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:coreappmodules:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:appmodulecache:constant" type="constant" identity="appmodulecache" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Memoization cache for lazy-loaded app components keyed by slug."]
// CIL[DOC-RESPONSIBILITY responsibility="Avoid recreating lazy components for the same slug."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug string key" outputs="React.LazyExoticComponent<React.ComponentType>" errors="none" side_effects="Mutates the Map to cache lazy components."]
// CIL[DOC-MICRO logic_summary="Holds previously constructed lazy components in a module-scoped Map." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const appModuleCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>()
// CIL[DOC-VECTOR type="context" content="purpose='Memoization cache for lazy-loaded app components keyed by slug.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:appmodulecache:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:resolveapploader:function" type="function" identity="resolveapploader" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Resolve the dynamic import loader for a given app slug."]
// CIL[DOC-RESPONSIBILITY responsibility="Select the custom or core app glob entry for a slug and return its loader."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="(() => Promise<{ default: React.ComponentType }>) | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks the custom app glob, then the core app glob, and returns the matching loader or null." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function resolveAppLoader(slug: string): (() => Promise<{ default: React.ComponentType }>) | null {
  const customKey = `../../../custom/apps/${slug}/index.tsx`
  if (customAppModules[customKey]) {
    return customAppModules[customKey] as () => Promise<{ default: React.ComponentType }>
  }

  const coreKey = `../apps/${slug}/index.tsx`
  if (coreAppModules[coreKey]) {
    return coreAppModules[coreKey] as () => Promise<{ default: React.ComponentType }>
  }
  return null
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the dynamic import loader for a given app slug.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:resolveapploader:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:getappcomponent:function" type="function" identity="getappcomponent" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Return (or create) a cached lazy component for a given app slug."]
// CIL[DOC-RESPONSIBILITY responsibility="Look up the loader, build a React.lazy component, cache it, and return it."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="React.LazyExoticComponent<React.ComponentType>" errors="Throws if no loader found (via lazy rejection)" side_effects="Reads and writes appModuleCache."]
// CIL[DOC-MICRO logic_summary="Uses resolveAppLoader; creates a lazy component with a reject fallback when the app is not found; caches by slug." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getAppComponent(slug: string): React.LazyExoticComponent<React.ComponentType> {
  if (!appModuleCache.has(slug)) {
    const loader = resolveAppLoader(slug)
    const LazyComponent = lazy(
      loader
        ? loader
        : () => Promise.reject(new Error(`App "${slug}" not found. Expected apps/${slug}/index.tsx in custom/apps or .framework/src/apps.`))
    )
    appModuleCache.set(slug, LazyComponent)
  }
  return appModuleCache.get(slug)!
}
// CIL[DOC-VECTOR type="context" content="purpose='Return (or create) a cached lazy component for a given app slug.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:getappcomponent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:customapploaderprops:interface" type="interface" identity="customapploaderprops" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props contract for the CustomAppLoader component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the slug input used to select which app to render."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines the single prop consumed by the CustomAppLoader component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface CustomAppLoaderProps {
  slug: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the CustomAppLoader component.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:customapploaderprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/CustomAppLoader.tsx:customapploader:function" type="function" identity="customapploader" parent="~/.framework/src/components/CustomAppLoader.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Public component that lazily renders the app identified by slug with error and loading boundaries."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap a lazy app component in an error boundary and a loading spinner."]
// CIL[DOC-CONTEXT module=".framework/src/components/CustomAppLoader" layer="component" related_files=".framework/src/components/CustomAppLoader.tsx,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-CONTRACT inputs="slug: string (destructured from props)" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Retrieves the lazy component for the slug and renders it inside AppErrorBoundary and Suspense with a loading fallback." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function CustomAppLoader({ slug }: CustomAppLoaderProps) {
  const AppComponent = getAppComponent(slug)

  return (
    <AppErrorBoundary slug={slug}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <AppComponent />
      </Suspense>
    </AppErrorBoundary>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Public component that lazily renders the app identified by slug with error and loading boundaries.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/CustomAppLoader.tsx:customapploader:function"]
