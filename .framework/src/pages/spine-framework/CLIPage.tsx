// CIL[BEGIN stable_id="~/.framework/src/pages/spine-framework/CLIPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-MACRO purpose="Provides the module-level header for the spine-framework CLI documentation page."]
// CIL[DOC-RESPONSIBILITY responsibility="File-level documentation and component entry point for the Framework CLI page."]
// CIL[DOC-CONTEXT module="spine-framework" layer="page" related_files=".framework/src/components/layout/Layout.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains a single React component that renders the CLI documentation page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import { Layout } from '../../components/layout/Layout'



// CIL[DOC-VECTOR type="context" content="purpose='Provides the module-level header for the spine-framework CLI documentation page.'; No verified external callers; imports: .framework/src/components/layout/Layout.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/spine-framework/CLIPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/spine-framework/CLIPage.tsx:CLIPage:component" type="component" identity="CLIPage" parent="~/.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-MACRO purpose="Renders the Framework CLI documentation page with usage examples."]
// CIL[DOC-RESPONSIBILITY responsibility="Displays the CLI command reference and notes about future documentation."]
// CIL[DOC-CONTEXT module="spine-framework" layer="page" related_files=".framework/src/components/layout/Layout.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX rendering of CLI page" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a JSX layout showing the CLI title, description, sample commands, and a placeholder for full reference docs." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function CLIPage() {
  return (
    <Layout>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Framework CLI</h1>
        <p className="text-slate-500 mb-6">
          The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">spine-framework</code> CLI runs locally in your terminal or agentic IDE.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm text-slate-700 space-y-1 mb-4">
          <div><span className="text-slate-400">$</span> npx spine-framework --help</div>
          <div><span className="text-slate-400">$</span> npx spine-framework auth whoami</div>
          <div><span className="text-slate-400">$</span> npx spine-framework migrations list</div>
          <div><span className="text-slate-400">$</span> npx spine-framework pipelines run &lt;id&gt;</div>
          <div><span className="text-slate-400">$</span> npx spine-framework items list --type &lt;type_slug&gt;</div>
          <div><span className="text-slate-400">$</span> npx spine-framework doctor</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Full CLI reference documentation coming soon.
        </div>
      </div>
    </Layout>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the Framework CLI documentation page with usage examples.'; No verified external callers; imports: .framework/src/components/layout/Layout.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/spine-framework/CLIPage.tsx:CLIPage:component"]