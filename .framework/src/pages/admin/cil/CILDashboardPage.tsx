// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Admin CIL project dashboard page root module: imports dependencies and composes the CILDashboardPage component."]
// CIL[DOC-RESPONSIBILITY responsibility="Bootstraps the admin CIL dashboard page and wires UI primitives, icons, and the local PageInstructions component."]
// CIL[DOC-CONTEXT module="admin/cil" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="default export CILDashboardPage" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, router, API, UI components, icons, and PageInstructions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers maintaining the CIL admin UI"]

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Progress } from '@core/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  RefreshCw,
  FileCode2,
  Layers,
  Zap,
  Sparkles,
  GitGraph,
  Hash,
  DollarSign,
  Bot,
  Search,
  Play,
  Settings2,
} from 'lucide-react'

import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Admin CIL project dashboard page root module: imports dependencies and composes the CILDashboardPage component.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:projectstats:interface" type="interface" identity="ProjectStats" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL project ingestion statistics."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a typed contract for project-level stats returned from the ingestion pipeline."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface ProjectStats" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: file_count, chunk_count, proposal_count, approved_count, pending_review_count, total_ingestion_cost_usd, last_ingested_at." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ProjectStats {
  file_count: number
  chunk_count: number
  proposal_count: number
  approved_count: number
  pending_review_count: number
  total_ingestion_cost_usd: number
  last_ingested_at: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL project ingestion statistics.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:projectstats:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:embedstatus:interface" type="interface" identity="EmbedStatus" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL embedding coverage status."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the embedding completeness counts for a project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface EmbedStatus" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: total_chunks, embedded_chunks, coverage_pct, unembedded_chunks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface EmbedStatus {
  total_chunks: number
  embedded_chunks: number
  coverage_pct: number
  unembedded_chunks: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL embedding coverage status.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:embedstatus:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:docstatus:interface" type="interface" identity="DocStatus" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL documentation coverage status."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the documentation coverage counts for a project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface DocStatus" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: total_chunks, documented_count, undocumented_count, ai_generated_count, human_verified_count, coverage_pct." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DocStatus {
  total_chunks: number
  documented_count: number
  undocumented_count: number
  ai_generated_count: number
  human_verified_count: number
  coverage_pct: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL documentation coverage status.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:docstatus:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:callmapstatus:interface" type="interface" identity="CallmapStatus" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL call-map link counts."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the call-map and import link counts for a project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface CallmapStatus" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: import_links, call_links, export_links, total_links, tested_by_links." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface CallmapStatus {
  import_links: number
  call_links: number
  export_links: number
  total_links: number
  tested_by_links?: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL call-map link counts.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:callmapstatus:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:configstatus:interface" type="interface" identity="ConfigStatus" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL configuration graph status."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the configuration graph item counts for a project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface ConfigStatus" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: config_items, configures_links." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ConfigStatus {
  config_items: number
  configures_links: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL configuration graph status.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:configstatus:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:pipelineprogress:interface" type="interface" identity="PipelineProgress" parent="none"]
// CIL[DOC-MACRO purpose="Defines the shape of CIL pipeline progress aggregation."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the pipeline progress counts and per-file status for a project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface PipelineProgress" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: total_selected, total_chunks, by_status, file_statuses." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineProgress {
  total_selected: number
  total_chunks: number
  by_status: Record<string, number>
  file_statuses: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of CIL pipeline progress aggregation.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:pipelineprogress:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:dashboarddata:interface" type="interface" identity="DashboardData" parent="none"]
// CIL[DOC-MACRO purpose="Defines the aggregate dashboard data type used by CILDashboardPage."]
// CIL[DOC-RESPONSIBILITY responsibility="Types the unified dashboard data object fetched from multiple endpoints."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="interface DashboardData" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Fields: project, embed, doc, callmap, config." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DashboardData {
  project: { id: string; title: string; data: ProjectStats } | null
  embed: EmbedStatus | null
  doc: DocStatus | null
  callmap: CallmapStatus | null
  config: ConfigStatus | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the aggregate dashboard data type used by CILDashboardPage.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:dashboarddata:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:passcard:function" type="function" identity="PassCard" parent="none"]
// CIL[DOC-MACRO purpose="Renders a single pipeline pass card with status, icon, metric, and optional link."]
// CIL[DOC-RESPONSIBILITY responsibility="Visualizes the state of one CIL pipeline stage."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="PassCard props: number, label, icon, description, status, metric, href?, skill?" outputs="JSX card element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects status color, background, and icon from statusConfig and renders a compact linked card." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PassCard({
  number,
  label,
  icon: Icon,
  description,
  status,
  metric,
  href,
  skill,
}: {
  number: string
  label: string
  icon: React.ElementType
  description: string
  status: 'complete' | 'partial' | 'empty' | 'unknown'
  metric: string
  href?: string
  skill?: string
}) {
  const statusConfig = {
    complete: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', icon: CheckCircle2 },
    partial:  { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-500',  icon: AlertTriangle },
    empty:    { color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200',  dot: 'bg-slate-300',  icon: Clock },
    unknown:  { color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200',  dot: 'bg-slate-300',  icon: Clock },
  }[status]

  const StatusIcon = statusConfig.icon

  return (
    <div className={`rounded-lg border p-3 ${statusConfig.bg} flex items-start gap-3`}>
      <div className={`mt-0.5 h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${status === 'complete' ? 'bg-green-100' : status === 'partial' ? 'bg-amber-100' : 'bg-slate-100'}`}>
        <Icon className={`h-4 w-4 ${statusConfig.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-muted-foreground">Pass {number}</span>
          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
          {skill && <span className="text-[10px] font-mono text-muted-foreground/80 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{skill}</span>}
        </div>
        <div className="text-sm font-medium truncate">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
        <div className={`text-xs font-mono mt-1 font-semibold ${statusConfig.color}`}>{metric}</div>
      </div>
      {href && (
        <a href={href} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a single pipeline pass card with status, icon, metric, and optional link.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:passcard:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:stattile:function" type="function" identity="StatTile" parent="none"]
// CIL[DOC-MACRO purpose="Renders a numeric stat tile with optional sub-label and accent styling."]
// CIL[DOC-RESPONSIBILITY responsibility="Displays a single dashboard metric."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="StatTile props: label, value, sub?, icon, accent?" outputs="JSX card" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a Card with value, label, optional sub, and an icon." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <Card className={accent ? 'border-indigo-200 bg-indigo-50/50' : ''}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-2xl font-bold tabular-nums ${accent ? 'text-indigo-700' : ''}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
          </div>
          <Icon className={`h-5 w-5 mt-1 ${accent ? 'text-indigo-400' : 'text-muted-foreground/50'}`} />
        </div>
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a numeric stat tile with optional sub-label and accent styling.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:stattile:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:coveragebar:function" type="function" identity="CoverageBar" parent="none"]
// CIL[DOC-MACRO purpose="Renders a labeled progress bar showing a percentage."]
// CIL[DOC-RESPONSIBILITY responsibility="Visualizes embedding or documentation coverage as a progress bar."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="label, pct, color?" outputs="JSX progress bar" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Shows a label, percentage, and Progress component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CoverageBar({ label, pct, color = 'bg-indigo-500' }: { label: string; pct: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a labeled progress bar showing a percentage.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:coveragebar:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:step_details:constant" type="constant" identity="STEP_DETAILS" parent="none"]
// CIL[DOC-MACRO purpose="Maps CIL pipeline step slugs to labels, icons, descriptions, and skill tags."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the metadata that drives the PassCard rendering for each pipeline stage."]
// CIL[DOC-CONTEXT module="admin/cil" layer="data" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="const STEP_DETAILS" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of step slugs to display metadata for the nine CIL pipeline stages." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STEP_DETAILS: Record<string, { label: string; icon: React.ElementType; description: string; skill?: string }> = {
  '0-discovered': { label: 'Discover Files', icon: FileCode2, description: 'Walk repo and register source files' },
  '1-selected': { label: 'Select Files', icon: Search, description: 'Files matched by selected paths/globs' },
  '2-chunked': { label: 'Chunk', icon: Layers, description: 'Parse files and write stable-ID markers', skill: 'cil-3' },
  '3-documented': { label: 'Document', icon: Sparkles, description: 'Generate macro / micro / contract fields', skill: 'cil-4' },
  '4-chunk-validated': { label: 'Validate Chunks', icon: CheckCircle2, description: 'Check coverage, overlap, stable IDs, and JSX leakage', skill: 'cil-5' },
  '5-doc-validated': { label: 'Validate Docs', icon: CheckCircle2, description: 'Confirm required CIL[DOC-*] fields are present', skill: 'cil-6' },
  '6-enriched': { label: 'Enrich', icon: Settings2, description: 'Add RAG context, blast radius, and learning notes', skill: 'cil-7' },
  '7-embedded-mapped': { label: 'Embed & Map', icon: Zap, description: 'Generate embeddings and import/call/test edges', skill: 'cil-8' },
  '8-published': { label: 'Publish', icon: CheckCircle2, description: 'Final validation and currentness check' },
}
// CIL[DOC-VECTOR type="context" content="purpose='Maps CIL pipeline step slugs to labels, icons, descriptions, and skill tags.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:step_details:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:driftalertcard:function" type="function" identity="DriftAlertCard" parent="none"]
// CIL[DOC-MACRO purpose="Renders a card that detects and displays CIL chunk hash drift for a project."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches stored chunks, validates hashes, and surfaces drifted chunks with navigation links."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="projectId, appPath" outputs="JSX card" errors="API or network errors swallowed" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls admin-data and cil-validate APIs, compares hash status, and lists up to 5 drifted chunks with a count." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function DriftAlertCard({ projectId, appPath }: { projectId: string; appPath: (p: string) => string }) {
  const [driftChunks, setDriftChunks] = useState<any[] | null>(null)
  const [checking, setChecking] = useState(false)

  const checkDrift = async () => {
    setChecking(true)
    try {
      
      const res = await apiFetch(`/api/admin-data?action=list&entity=items&type_slug=cil_chunk&limit=200`)
      const data = await res.json()
      const chunks = (data?.data || data || []).filter(
        (c: any) => c.data?.project_id === projectId && c.data?.stored_hash
      )

      if (!chunks.length) { setDriftChunks([]); return }

      const validateRes = await apiFetch('/api/cil-validate?action=validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunks: chunks.slice(0, 50).map((c: any) => ({
            chunk_id: c.id,
            chunk_name: c.data?.chunk_name || '',
            content: c.data?.code_content || '',
          })),
        }),
      })
      const vData = await validateRes.json()
      const results = vData?.results || vData?.data?.results || []
      setDriftChunks(results.filter((r: any) => r.status === 'drift_detected'))
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Hash className="h-4 w-4" /> Hash Drift
          </CardTitle>
          <Button size="sm" variant="outline" onClick={checkDrift} disabled={checking} className="h-7 text-xs">
            {checking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Hash className="h-3 w-3" />}
            {checking ? 'Checking…' : 'Check Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {driftChunks === null && (
          <p className="text-xs text-muted-foreground">Click "Check Now" to validate all stored hashes against current code_content.</p>
        )}
        {driftChunks?.length === 0 && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> All hashes current
          </div>
        )}
        {driftChunks && driftChunks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-red-600 mb-2">
              <XCircle className="h-4 w-4" /> {driftChunks.length} chunk{driftChunks.length !== 1 ? 's' : ''} with drift
            </div>
            {driftChunks.slice(0, 5).map((r: any) => (
              <a
                key={r.chunk_id}
                href={appPath(`/cil/${projectId}/chunks/${r.chunk_id}`)}
                className="flex items-center gap-2 text-xs hover:bg-red-50 rounded p-1 group"
              >
                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                <span className="font-mono truncate">{r.chunk_name}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto" />
              </a>
            ))}
            {driftChunks.length > 5 && (
              <p className="text-xs text-muted-foreground">…and {driftChunks.length - 5} more</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a card that detects and displays CIL chunk hash drift for a project.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:driftalertcard:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:cildashboardpage:function" type="function" identity="CILDashboardPage" parent="none"]
// CIL[DOC-MACRO purpose="Main admin page for reviewing CIL project health, coverage, pipeline status, graph links, and drift."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches and aggregates project stats, coverage, pipeline progress, callmap, and config; renders the dashboard layout."]
// CIL[DOC-CONTEXT module="admin/cil" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="route param id" outputs="JSX dashboard" errors="API errors fall back to null or empty values" side_effects="loads data on mount and on projectId change"]
// CIL[DOC-MICRO logic_summary="Fetches six endpoints in parallel, computes stats, renders PassCards for each pipeline step, and embeds DriftAlertCard." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default function CILDashboardPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [data, setData] = useState<DashboardData>({ project: null, embed: null, doc: null, callmap: null, config: null })
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [projectRes, progressRes, embedRes, docRes, callmapRes, configRes] = await Promise.allSettled([
        apiFetch(`/api/cil-project?action=get&id=${projectId}`).then(r => r.json()),
        apiFetch(`/api/cil-project?action=pipeline_progress&id=${projectId}`).then(r => r.json()),
        apiFetch(`/api/cil-embeddings?action=status&project_id=${projectId}`).then(r => r.json()),
        apiFetch(`/api/cil-doc?action=gap_report&project_id=${projectId}`).then(r => r.json()),
        apiFetch(`/api/cil-callmap?action=status&project_id=${projectId}`).then(r => r.json()),
        apiFetch(`/api/cil-config?action=status&project_id=${projectId}`).then(r => r.json()),
      ])

      setData({
        project: projectRes.status === 'fulfilled' ? (projectRes.value?.project || projectRes.value?.data?.project) : null,
        embed:   embedRes.status === 'fulfilled'   ? (embedRes.value?.data   || embedRes.value)   : null,
        doc:     docRes.status === 'fulfilled'     ? (docRes.value?.data     || docRes.value)     : null,
        callmap: callmapRes.status === 'fulfilled' ? (callmapRes.value?.data || callmapRes.value) : null,
        config:  configRes.status === 'fulfilled'  ? (configRes.value?.data  || configRes.value)  : null,
      })
      const progressData = progressRes.status === 'fulfilled' ? (progressRes.value?.data || progressRes.value) : null
      setPipelineProgress(progressData?.progress || null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const project = data.project

  const handleDiscover = useCallback(async () => {
    if (!projectId) return
    setDiscovering(true)
    try {
      await apiFetch('/api/cil-ingest?action=discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
    } finally {
      setDiscovering(false)
      load()
    }
  }, [projectId, load])



  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    )
  }

  const stats: ProjectStats = project?.data || { file_count: 0, chunk_count: 0, proposal_count: 0, approved_count: 0, pending_review_count: 0, total_ingestion_cost_usd: 0, last_ingested_at: null }
  const embed   = data.embed   || { total_chunks: 0, embedded_chunks: 0, coverage_pct: 0, unembedded_chunks: 0 }
  const doc     = data.doc     || { total_chunks: 0, documented_count: 0, undocumented_count: 0, ai_generated_count: 0, human_verified_count: 0, coverage_pct: 0 }
  const callmap = data.callmap || { import_links: 0, call_links: 0, export_links: 0, total_links: 0, tested_by_links: 0 }
  const config  = data.config  || { config_items: 0, configures_links: 0 }

  const pp = pipelineProgress || { total_selected: 0, total_chunks: 0, by_status: {}, file_statuses: {} }
  const selectedFiles = pp.total_selected
  const selectedChunks = pp.total_chunks
  const totalTracked = Object.values(pp.by_status).reduce((a, b) => a + (b || 0), 0)

  const PIPELINE_ORDER = [
    '0-discovered', '1-selected', '2-chunked', '3-documented', '4-chunk-validated',
    '5-doc-validated', '6-enriched', '7-embedded-mapped', '8-published',
  ]

  const embedPct = selectedChunks > 0 ? Math.round((embed.embedded_chunks / selectedChunks) * 100) : 0
  const docPct = selectedChunks > 0 ? Math.round((doc.documented_count / selectedChunks) * 100) : 0

  const lastIngested = stats.last_ingested_at
    ? new Date(stats.last_ingested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never'

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href={appPath('/cil')} className="hover:underline">Code Intelligence</a>
        <ChevronRight className="h-3 w-3" />
        <span>{project?.title || 'Project'}</span>
        <ChevronRight className="h-3 w-3" />
        <span>Dashboard</span>
      </div>

      {}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project?.title || 'Project Dashboard'}</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Last ingested: {lastIngested}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={load} className="h-8 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={handleDiscover} disabled={discovering} className="h-8 text-xs">
            {discovering ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <FileCode2 className="h-3 w-3 mr-1" />}
            Discover
          </Button>
          <Button size="sm" variant="outline" asChild className="h-8 text-xs">
            <a href={appPath(`/cil/${projectId}/select`)}>
              <Search className="h-3 w-3 mr-1" />
              Select Files
            </a>
          </Button>
          <Button size="sm" asChild className="h-8 text-xs">
            <a href={appPath(`/cil/${projectId}/ingest`)}>
              <Play className="h-3 w-3 mr-1" /> Run Pipeline
            </a>
          </Button>
        </div>
      </div>

      <PageInstructions
        description="Review CIL project health and ingestion coverage."
        sections={[
          { title: 'What this page is for', content: 'This page is the project-level overview for a CIL project. It displays stats, coverage, pipeline status, graph links, and drift alerts.' },
          { title: 'How to read the cards', content: 'The top tiles show Files, Chunks, Pending Review, and cumulative LLM Cost. The Coverage card shows embedding and documentation coverage plus AI-generated, human-verified, and undocumented counts.' },
          { title: 'How to read the pipeline', content: 'Pass cards summarize Discover Files, Select Files, Chunk, Document, Validate Chunks, Validate Docs, Enrich, Embed & Map, and Publish. Each card shows status, counts, and a link to the relevant step.' },
          { title: 'Important notes', content: 'Use Refresh to reload the dashboard and Run Pipeline to start or continue ingestion. A drift alert appears when stored hashes differ from current code.' },
        ]}
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile label="Files" value={selectedFiles.toLocaleString()} sub={`${stats.file_count.toLocaleString()} discovered`} icon={FileCode2} />
        <StatTile label="Chunks" value={selectedChunks.toLocaleString()} sub={`${stats.chunk_count.toLocaleString()} discovered`} icon={Layers} accent />
        <StatTile
          label="Pending Review"
          value={stats.pending_review_count}
          icon={AlertTriangle}
        />
        <StatTile
          label="LLM Cost"
          value={`$${(stats.total_ingestion_cost_usd ?? 0).toFixed(4)}`}
          sub="cumulative"
          icon={DollarSign}
        />
      </div>

      {}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CoverageBar label={`Embeddings — ${embed.embedded_chunks} / ${embed.total_chunks} chunks`} pct={embed.coverage_pct} color="bg-indigo-500" />
          <CoverageBar label={`Documentation — ${doc.documented_count} / ${doc.total_chunks} chunks`} pct={doc.coverage_pct} color="bg-emerald-500" />
          <div className="pt-1 grid grid-cols-3 gap-3 text-xs text-center text-muted-foreground">
            <div>
              <div className="font-semibold text-blue-600">{doc.ai_generated_count}</div>
              <div>AI Generated</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{doc.human_verified_count}</div>
              <div>Human Verified</div>
            </div>
            <div>
              <div className="font-semibold text-slate-500">{doc.undocumented_count}</div>
              <div>Undocumented</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Pipeline Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(() => {
            const outByIdx = PIPELINE_ORDER.map((_, i) =>
              PIPELINE_ORDER.slice(i === 0 ? 1 : i).reduce((sum, s) => sum + (pp.by_status[s] || 0), 0)
            )

            return PIPELINE_ORDER.map((status, idx) => {

              const detail = STEP_DETAILS[status]

              const inCount = idx === 0 ? totalTracked : outByIdx[idx - 1]
              const outCount = outByIdx[idx]

              const stageStatus = inCount === 0
                ? 'empty'
                : inCount > 0 && outCount === inCount
                  ? 'complete'
                  : 'partial'

              const metric = selectedFiles > 0
                ? `${inCount.toLocaleString()} / ${outCount.toLocaleString()} files`
                : 'No files selected'

              return (
                <PassCard
                  key={status}
                  number={`${idx + 1}`}
                  label={detail?.label || status}
                  icon={detail?.icon || Clock}
                  description={detail?.description || ''}
                  status={stageStatus as 'complete' | 'partial' | 'empty' | 'unknown'}
                  metric={metric}
                  href={appPath(`/cil/${projectId}/ingest`)}
                  skill={detail?.skill}
                />
              )
            })
          })()}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <GitGraph className="h-4 w-4" /> Graph Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Import links (file→file)', value: callmap.import_links },
              { label: 'Call links (chunk→chunk)', value: callmap.call_links },
              { label: 'Export links', value: callmap.export_links },
              { label: 'Tested-by links', value: callmap.tested_by_links ?? 0 },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-2 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" asChild>
                <a href={appPath(`/cil/${projectId}/graph`)}>
                  <GitGraph className="h-3 w-3 mr-1" /> View Graph
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {}
        <DriftAlertCard projectId={projectId!} appPath={appPath} />
      </div>

      {}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={appPath(`/cil/search`)}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Search Chunks
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={appPath(`/cil/${projectId}/agent`)}>
              <Bot className="h-3.5 w-3.5 mr-1.5" /> Ask CIL Agent
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={appPath(`/cil/${projectId}/files`)}>
              <Layers className="h-3.5 w-3.5 mr-1.5" /> Browse Files
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={appPath(`/cil/${projectId}/ingest`)}>
              <Play className="h-3.5 w-3.5 mr-1.5" /> Run Ingestion
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Main admin page for reviewing CIL project health, coverage, pipeline status, graph links, and drift.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILDashboardPage.tsx:cildashboardpage:function"]
