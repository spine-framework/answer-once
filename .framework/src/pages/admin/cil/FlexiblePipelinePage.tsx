// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="React admin page for visualizing and controlling the CIL flexible pipeline for a project."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies, set up the admin page module, and render the root page instructions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="default page export and side-effecting imports" errors="none" side_effects="imports modules for page assembly"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, router, API client, UI primitives, icons, and the PageInstructions component used in this page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainers"]

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Progress } from '@core/components/ui/progress'
import { Alert, AlertDescription } from '@core/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core/components/ui/tabs'
import {
  CheckCircle2,
  RefreshCw,
  Play,
  AlertTriangle,
  TrendingUp,
  GitBranch,
  Clock,
  FileText,
  Zap,
  Sparkles,
  Info,
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode2,
} from 'lucide-react'

import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='React admin page for visualizing and controlling the CIL flexible pipeline for a project.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:filepipelinestate:interface" type="interface" identity="FilePipelineState" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface describing the shape of FilePipelineState."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the data contract for FilePipelineState."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="typed contract for consumers" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the per-file state including path, current status, completed/ready/blocked steps, and progress percentage." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FilePipelineState {
  file_path: string
  current_status: string
  completed_steps: number[]
  ready_for: number[]
  blocked_by: number[]
  progress_percentage: number
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing the shape of FilePipelineState.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:filepipelinestate:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:pipelinestatus:interface" type="interface" identity="PipelineStatus" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface describing the shape of PipelineStatus."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the data contract for PipelineStatus."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="typed contract for consumers" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the overall pipeline status for a project, including all files and a step summary." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineStatus {
  project_id: string
  files: FilePipelineState[]
  step_summary: Record<number, { completed: number; pending: number; in_progress: number }>
  overall_progress: number
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing the shape of PipelineStatus.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:pipelinestatus:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:filesreadyforstep:interface" type="interface" identity="FilesReadyForStep" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface describing the shape of FilesReadyForStep."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the data contract for FilesReadyForStep."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="typed contract for consumers" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the response for files that are ready to be processed for a specific step, including blocking info." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FilesReadyForStep {
  ok: boolean
  project_id: string
  step: number
  step_name: string
  prerequisites: number[]
  target_status: string
  file_count: number
  files: Array<{
    file_path: string
    status: string
    chunk_count: number
    completed_steps: number[]
    ready_for: number[]
    blocked_by: number[]
    can_proceed: boolean
    blocking_reasons: string[]
  }>
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing the shape of FilesReadyForStep.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:filesreadyforstep:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:bottleneckanalysis:interface" type="interface" identity="BottleneckAnalysis" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface describing the shape of BottleneckAnalysis."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the data contract for BottleneckAnalysis."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (type definition)" outputs="typed contract for consumers" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the bottleneck analysis result with bottlenecks, recommendations, and optimal processing order." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface BottleneckAnalysis {
  project_id: string
  bottlenecks: Array<{
    step: number
    step_name: string
    ready: number
    blocked: number
    blocking_reasons: string[]
  }>
  recommendations: Array<{
    step: number
    action: string
    priority: 'high' | 'medium' | 'low'
  }>
  optimal_processing_order: Array<{
    file_path: string
    suggested_next_step: number | null
  }>
  summary: {
    total_files: number
    bottleneck_count: number
    ready_for_processing: number
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing the shape of BottleneckAnalysis.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:bottleneckanalysis:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:step_labels:constant" type="constant" identity="STEP_LABELS" parent="none"]
// CIL[DOC-MACRO purpose="Named constant mapping used across the pipeline UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a lookup table for STEP_LABELS."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (static map)" outputs="named lookup record" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps each pipeline step index to a human-readable label." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STEP_LABELS: Record<number, string> = {
  0: 'Discover Files',
  1: 'Select Files',
  2: 'Chunk',
  3: 'First-Pass Docs',
  4: 'Validate Chunks',
  5: 'Validate Docs',
  6: 'Enrich',
  7: 'Embed & Map',
  8: 'Publish',
}
// CIL[DOC-VECTOR type="context" content="purpose='Named constant mapping used across the pipeline UI.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:step_labels:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:step_colors:constant" type="constant" identity="STEP_COLORS" parent="none"]
// CIL[DOC-MACRO purpose="Named constant mapping used across the pipeline UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a lookup table for STEP_COLORS."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (static map)" outputs="named lookup record" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps each pipeline step index to a Tailwind color class string for badges and progress." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STEP_COLORS: Record<number, string> = {
  0: 'bg-slate-100 text-slate-700',
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-green-100 text-green-700',
  5: 'bg-amber-100 text-amber-700',
  6: 'bg-pink-100 text-pink-700',
  7: 'bg-indigo-100 text-indigo-700',
  8: 'bg-violet-100 text-violet-700',
}
// CIL[DOC-VECTOR type="context" content="purpose='Named constant mapping used across the pipeline UI.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:step_colors:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:priority_colors:constant" type="constant" identity="PRIORITY_COLORS" parent="none"]
// CIL[DOC-MACRO purpose="Named constant mapping used across the pipeline UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a lookup table for PRIORITY_COLORS."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none (static map)" outputs="named lookup record" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps priority levels to Tailwind color class strings." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700',
}
// CIL[DOC-VECTOR type="context" content="purpose='Named constant mapping used across the pipeline UI.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:priority_colors:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:fileprogresscard:function" type="function" identity="FileProgressCard" parent="none"]
// CIL[DOC-MACRO purpose="React/TypeScript function for rendering FileProgressCard."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the FileProgressCard UI and handle user interactions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="file, onProcess" outputs="JSX element or fragment" errors="none" side_effects="emits callback to parent on user action"]
// CIL[DOC-MICRO logic_summary="Shows a single file's progress, completed/ready/blocked steps, and a button to process the next available step." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function FileProgressCard({ file, onProcess }: { 
  file: FilePipelineState
  onProcess: (filePath: string, step: number) => void 
}) {
  const nextStep = file.ready_for[0]
  const canProceed = nextStep !== undefined

  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium font-mono">{file.file_path}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {file.current_status}
            </Badge>
            <Badge className="text-xs bg-blue-100 text-blue-700">
              {Math.round(file.progress_percentage)}%
            </Badge>
          </div>
        </div>

        <Progress value={file.progress_percentage} className="mb-3 h-2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Completed: {file.completed_steps.join(', ') || 'None'}</span>
            {file.ready_for.length > 0 && (
              <span>• Ready for: {file.ready_for.join(', ')}</span>
            )}
            {file.blocked_by.length > 0 && (
              <span>• Blocked by: {file.blocked_by.join(', ')}</span>
            )}
          </div>
          
          {canProceed && (
            <Button 
              size="sm" 
              onClick={() => onProcess(file.file_path, nextStep)}
              className="h-6 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              {STEP_LABELS[nextStep]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='React/TypeScript function for rendering FileProgressCard.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:fileprogresscard:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:stepsummarycard:function" type="function" identity="StepSummaryCard" parent="none"]
// CIL[DOC-MACRO purpose="React/TypeScript function for rendering StepSummaryCard."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the StepSummaryCard UI and handle user interactions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="step, summary, onProcess" outputs="JSX element or fragment" errors="none" side_effects="emits callback to parent on user action"]
// CIL[DOC-MICRO logic_summary="Renders a step summary with completion stats, a progress bar, and a button to process all ready files in that step." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function StepSummaryCard({ step, summary, onProcess }: {
  step: number
  summary: { completed: number; pending: number; in_progress: number }
  onProcess: (step: number) => void
}) {
  const total = summary.completed + summary.pending + summary.in_progress
  const progress = total > 0 ? (summary.completed / total) * 100 : 0

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${STEP_COLORS[step]}`}>
              {step}
            </div>
            <div>
              <h4 className="text-sm font-medium">{STEP_LABELS[step]}</h4>
              <p className="text-xs text-muted-foreground">
                {summary.completed} completed, {summary.pending} ready, {summary.in_progress} in progress
              </p>
            </div>
          </div>
          <Badge className={STEP_COLORS[step]}>
            {Math.round(progress)}%
          </Badge>
        </div>

        <Progress value={progress} className="mb-3 h-2" />

        {summary.pending > 0 && (
          <Button 
            size="sm" 
            onClick={() => onProcess(step)}
            className="w-full"
            variant="outline"
          >
            <Play className="h-3 w-3 mr-1" />
            Process {summary.pending} ready files
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='React/TypeScript function for rendering StepSummaryCard.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:stepsummarycard:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:bottleneckalert:function" type="function" identity="BottleneckAlert" parent="none"]
// CIL[DOC-MACRO purpose="React/TypeScript function for rendering BottleneckAlert."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the BottleneckAlert UI and handle user interactions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="bottleneck" outputs="JSX element or fragment" errors="none" side_effects="emits callback to parent on user action"]
// CIL[DOC-MICRO logic_summary="Displays a bottleneck step with ready/blocked counts and a list of blocking reasons." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BottleneckAlert({ bottleneck }: { bottleneck: BottleneckAnalysis['bottlenecks'][0] }) {
  return (
    <Alert className="mb-3">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{bottleneck.step_name}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {bottleneck.ready} ready, {bottleneck.blocked} blocked
            </span>
          </div>
          <Badge className={PRIORITY_COLORS.high}>
            High Priority
          </Badge>
        </div>
        {bottleneck.blocking_reasons.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Blocking issues:</strong>
            <ul className="list-disc list-inside mt-1">
              {bottleneck.blocking_reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='React/TypeScript function for rendering BottleneckAlert.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:bottleneckalert:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:recommendationcard:function" type="function" identity="RecommendationCard" parent="none"]
// CIL[DOC-MACRO purpose="React/TypeScript function for rendering RecommendationCard."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the RecommendationCard UI and handle user interactions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="recommendation" outputs="JSX element or fragment" errors="none" side_effects="emits callback to parent on user action"]
// CIL[DOC-MICRO logic_summary="Renders a single recommendation with a priority badge." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function RecommendationCard({ recommendation }: { recommendation: BottleneckAnalysis['recommendations'][0] }) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Step {recommendation.step}</span>
            <span className="text-sm text-muted-foreground">{recommendation.action}</span>
          </div>
          <Badge className={PRIORITY_COLORS[recommendation.priority]}>
            {recommendation.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='React/TypeScript function for rendering RecommendationCard.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:recommendationcard:function"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:flexiblepipelinepage:function" type="function" identity="FlexiblePipelinePage" parent="none"]
// CIL[DOC-MACRO purpose="React/TypeScript function for rendering FlexiblePipelinePage."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the FlexiblePipelinePage UI and handle user interactions."]
// CIL[DOC-CONTEXT module="pages.admin.cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element or fragment" errors="none" side_effects="calls apiFetch and sets React state"]
// CIL[DOC-MICRO logic_summary="Fetches pipeline status, files ready per step, and bottleneck analysis; renders tabbed dashboard with overview, files, steps, and bottlenecks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default function FlexiblePipelinePage() {
  const { id: projectId } = useParams<{ id: string }>()
  
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null)
  const [readyFiles, setReadyFiles] = useState<Record<number, FilesReadyForStep>>({})
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const loadPipelineStatus = useCallback(async () => {
    if (!projectId) return
    
    try {
      const response = await apiFetch(`/api/cil-pipeline?action=get_pipeline_status`, {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId })
      })
      const result = await response.json()
      setPipelineStatus(result.data ?? result)
    } catch (error) {
      console.error('Failed to load pipeline status:', error)
    }
  }, [projectId])

  const loadReadyFiles = useCallback(async () => {
    if (!projectId) return
    
    const steps = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const results: Record<number, FilesReadyForStep> = {}
    
    for (const step of steps) {
      try {
        const response = await apiFetch(`/api/cil-pipeline?action=get_files_ready_for_step`, {
          method: 'POST',
          body: JSON.stringify({ project_id: projectId, step, include_blocking_info: true })
        })
        const result = await response.json()
        results[step] = result.data ?? result
      } catch (error) {
        console.error(`Failed to load ready files for step ${step}:`, error)
      }
    }
    
    setReadyFiles(results)
  }, [projectId])

  const loadBottlenecks = useCallback(async () => {
    if (!projectId) return
    
    try {
      const response = await apiFetch(`/api/cil-pipeline?action=get_pipeline_bottlenecks`, {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId })
      })
      const result = await response.json()
      setBottlenecks(result.data ?? result)
    } catch (error) {
      console.error('Failed to load bottlenecks:', error)
    }
  }, [projectId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        loadPipelineStatus(),
        loadReadyFiles(),
        loadBottlenecks()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [loadPipelineStatus, loadReadyFiles, loadBottlenecks])

  const handleProcessFile = useCallback(async (filePath: string, step: number) => {
    console.log(`Processing ${filePath} for step ${step}`)

  }, [])

  const handleProcessStep = useCallback(async (step: number) => {
    const files = readyFiles[step]?.files || []
    console.log(`Processing ${files.length} files for step ${step}`)

  }, [readyFiles])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!pipelineStatus) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pipeline status. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  const files = pipelineStatus.files || []
  const stepSummary = pipelineStatus.step_summary || {}
  const overallProgress = pipelineStatus.overall_progress ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flexible Pipeline</h1>
          <p className="text-muted-foreground">
            True iterative processing with dependency-aware file selection
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <PageInstructions
        description="View the flexible pipeline status and identify bottlenecks."
        sections={[
          { title: 'What this page is for', content: 'This page shows the dependency-aware file processing pipeline for the selected CIL project, including overall progress and per-step status.' },
          { title: 'How to read this page', content: 'The Overall Progress card shows the completion percentage and counts for total, complete, and in-progress files. Tabs provide Overview, Files, Steps, and Bottlenecks views.' },
          { title: 'How to use this page', content: 'Switch tabs to inspect step summaries, individual file progress, and which files are ready for the next step. Use the Process buttons to advance selected files.' },
          { title: 'Important notes', content: 'Bottlenecks are files that cannot proceed until another step completes. Refresh the page to see live progress during ingestion.' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pipeline Completion</span>
              <Badge className="bg-green-100 text-green-700">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{files.length} files total</span>
              <span>•</span>
              <span>{files.filter(f => f.progress_percentage === 100).length} complete</span>
              <span>•</span>
              <span>{files.filter(f => f.progress_percentage < 100).length} in progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stepSummary).map(([step, summary]) => (
              <StepSummaryCard
                key={step}
                step={parseInt(step)}
                summary={summary}
                onProcess={handleProcessStep}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="space-y-2">
            {files.map((file) => (
              <FileProgressCard
                key={file.file_path}
                file={file}
                onProcess={handleProcessFile}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          {Object.entries(readyFiles).map(([step, data]) => (
            <Card key={step}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${STEP_COLORS[parseInt(step)]}`}>
                    {step}
                  </div>
                  {STEP_LABELS[parseInt(step)]}
                  <Badge variant="outline">
                    {data.file_count} files ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.files.map((file) => (
                    <div key={file.file_path} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{file.file_path}</span>
                        {file.can_proceed ? (
                          <Badge className="bg-green-100 text-green-700">Ready</Badge>
                        ) : (
                          <Badge variant="outline">Blocked</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleProcessFile(file.file_path, parseInt(step))}
                        disabled={!file.can_proceed}
                        className="h-6 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Process
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          {bottlenecks?.bottlenecks.map((bottleneck) => (
            <BottleneckAlert key={bottleneck.step} bottleneck={bottleneck} />
          ))}
          
          {bottlenecks?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bottlenecks.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} recommendation={rec} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='React/TypeScript function for rendering FlexiblePipelinePage.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/FlexiblePipelinePage.tsx:flexiblepipelinepage:function"]
