// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-MACRO purpose="Admin test suite dashboard page module header"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare page imports and component overview for the testing dashboard"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines React imports, hooks, utilities, and components used by TestingDashboard" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="all"]













import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { AgentView } from '../../components/shared/AgentView'
import { FlaskConical, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatDateTime } from '../../lib/utils'
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:module_header:module_header"]

// CIL[DOC-VECTOR type="context" content="purpose='Admin test suite dashboard page module header'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Type definition for suite statistics"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of aggregated test suite stats"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="types" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of suite, total_runs, last status, counts, and timestamps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SuiteStat:interface" type="interface" identity="SuiteStat" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
interface SuiteStat {
  suite:        string
  total_runs:   number
  last_status:  string | null
  last_run_at:  string | null
  last_passed:  number | null
  last_failed:  number | null
  last_total:   number | null
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SuiteStat:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for suite statistics'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Type definition for a test run record"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of an individual test run"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="types" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of id, suite, status, timing, counts, and trigger" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:TestRun:interface" type="interface" identity="TestRun" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
interface TestRun {
  id:           string
  suite:        string
  status:       string
  started_at:   string
  finished_at:  string | null
  duration_ms:  number | null
  total:        number | null
  passed:       number | null
  failed:       number | null
  skipped:      number | null
  triggered_by: string | null
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:TestRun:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for a test run record'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Human readable labels for test suite names"]
// CIL[DOC-RESPONSIBILITY responsibility="Map suite slugs to display labels"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="constants" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Mapping of unit, integration, api, ui to display names" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SUITE_LABELS:constant" type="constant" identity="SUITE_LABELS" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
const SUITE_LABELS: Record<string, string> = {
  unit:        'Unit',
  integration: 'Integration',
  api:         'API',
  ui:          'UI',
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SUITE_LABELS:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Human readable labels for test suite names'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]






// CIL[DOC-MACRO purpose="Render a colored status badge"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a status string as a styled badge"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="status: string | null" outputs="JSX span" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects Tailwind color classes based on status and renders text" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:StatusBadge:component" type="component" identity="StatusBadge" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>
  const color =
    status === 'passed'  ? 'bg-green-100 text-green-800' :
    status === 'failed'  ? 'bg-red-100 text-red-800'    :
    status === 'running' ? 'bg-blue-100 text-blue-800'  :
                           'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:StatusBadge:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render a colored status badge'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Format a duration in milliseconds as a readable string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert millisecond duration to ms or seconds display"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="ms: number | null" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns '—' for null, 'ms' for sub-second, or formatted seconds" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:durationLabel:function" type="function" identity="durationLabel" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
function durationLabel(ms: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:durationLabel:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Format a duration in milliseconds as a readable string'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Render a test suite summary card"]
// CIL[DOC-RESPONSIBILITY responsibility="Show label, status, last run, pass/fail counts, and pass rate"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="stat: SuiteStat" outputs="JSX card" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes pass rate and displays suite health in a card" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SuiteCard:component" type="component" identity="SuiteCard" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
function SuiteCard({ stat }: { stat: SuiteStat }) {
  const label = SUITE_LABELS[stat.suite] ?? stat.suite
  const passRate = stat.last_total
    ? Math.round(((stat.last_passed ?? 0) / stat.last_total) * 100)
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <StatusBadge status={stat.last_status} />
      </div>
      {stat.last_run_at ? (
        <>
          <div className="text-xs text-gray-500">
            Last run {formatDateTime(stat.last_run_at)}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600 font-medium">{stat.last_passed ?? 0}✓</span>
            <span className="text-red-500 font-medium">{stat.last_failed ?? 0}✗</span>
            {passRate !== null && (
              <span className="text-gray-500">{passRate}% pass</span>
            )}
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-400">No runs yet</div>
      )}
      <div className="text-xs text-gray-400">{stat.total_runs} total run{stat.total_runs !== 1 ? 's' : ''}</div>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:SuiteCard:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render a test suite summary card'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Admin page for viewing test suite health and run history"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch stats and recent runs, render suite cards and run table"]
// CIL[DOC-CONTEXT module="TestingDashboard" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/shared/AgentView.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TestingDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="none" side_effects="Triggers API fetch on load and refresh"]
// CIL[DOC-MICRO logic_summary="Loads suite stats and recent runs, renders cards, table, and agent view" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:TestingDashboard:component" type="component" identity="TestingDashboard" parent="~/.framework/src/pages/admin/TestingDashboard.tsx"]
export default function TestingDashboard() {
  const navigate = useNavigate()

  const { data: statsData, loading: statsLoading, execute: refreshStats } = useApi(
    () => apiFetch('/.netlify/functions/tests?action=stats').then(r => r.json()),
    { immediate: true }
  )

  const { data: runsData, loading: runsLoading, execute: refreshRuns } = useApi(
    () => apiFetch('/.netlify/functions/tests?action=list&limit=20').then(r => r.json()),
    { immediate: true }
  )

  const loading = statsLoading || runsLoading

  function handleRefresh() {
    refreshStats()
    refreshRuns()
  }

  const stats: SuiteStat[] = (statsData as any)?.data?.data ?? []
  const runs: TestRun[]    = (runsData as any)?.data?.data  ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-gray-500" />
          <h1 className="text-xl font-semibold text-gray-900">Testing</h1>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {/* Suite health cards */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['unit', 'integration', 'api', 'ui'].map(suite => {
            const stat = stats.find(s => s.suite === suite) ?? {
              suite, total_runs: 0, last_status: null, last_run_at: null,
              last_passed: null, last_failed: null, last_total: null
            }
            return <SuiteCard key={suite} stat={stat} />
          })}
        </div>
      )}

      {/* Recent runs table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Recent Runs</span>
        </div>

        {runsLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : runs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No test runs yet. Trigger a test suite from the IDE.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left">Suite</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Started</th>
                <th className="px-4 py-2 text-right">Pass</th>
                <th className="px-4 py-2 text-right">Fail</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {runs.map(run => (
                <tr
                  key={run.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/spine-framework/admin/testing/${run.id}`)}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-gray-700">
                      {SUITE_LABELS[run.suite] ?? run.suite}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {formatDateTime(run.started_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-green-600 font-medium">
                    {run.passed ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-500 font-medium">
                    {run.failed ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {run.total ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400">
                    {durationLabel(run.duration_ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Empty state hint */}
      {!loading && runs.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Click any row to view individual test case results
        </p>
      )}

      {/* Agent View — for developers and agentic IDEs */}
      {!loading && stats.length > 0 && runs.length > 0 && (
        <AgentView
          data={{ suite_stats: stats, recent_runs: runs.slice(0, 5) }}
          endpoint="/.netlify/functions/tests"
          method="GET"
          query={{ action: 'stats' }}
          title="Agent View — Test Data API"
        />
      )}
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/TestingDashboard.tsx:TestingDashboard:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Admin page for viewing test suite health and run history'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]