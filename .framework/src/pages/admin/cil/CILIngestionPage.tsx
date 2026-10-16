// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="module_header module_header"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements module_header."]
// CIL[DOC-CONTEXT module="admin/cil" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="default export CILIngestionPage" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="module_header module_header definition." notable_decisions="[]"]
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@core/components/ui/tooltip'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Progress } from '@core/components/ui/progress'
import {
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  RefreshCw,
  Play,
  FileCode2,
  MousePointerClick,
  Code2,
  BookOpen,
  Zap,
  GitGraph,
  Sparkles,
  Layers,
  Network,
  Info,
  Save,
  Settings2,
  Copy,
  Check,
} from 'lucide-react'



import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='module_header module_header'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:CilFileStatus:type" type="type" identity="CilFileStatus" parent="none"]
// CIL[DOC-MACRO purpose="CilFileStatus type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements CilFileStatus."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type alias" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="CilFileStatus type definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CilFileStatus =
  | '2-discovered'
  | '3-selected'
  | '4-chunked'
  | '5-documented'
  | '6-embedded'
  | '7-mapped'
  | '8-enriched'
  | '9-embedded'
  | '10-mapped'
// CIL[DOC-VECTOR type="context" content="purpose='CilFileStatus type'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:CilFileStatus:type"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:FileTreeNode:interface" type="interface" identity="FileTreeNode" parent="none"]
// CIL[DOC-MACRO purpose="FileTreeNode interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements FileTreeNode."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="FileTreeNode interface definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FileTreeNode {
  id?: string | null
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  status?: CilFileStatus
  children?: FileTreeNode[]
}
// CIL[DOC-VECTOR type="context" content="purpose='FileTreeNode interface'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:FileTreeNode:interface"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:Project:interface" type="interface" identity="Project" parent="none"]
// CIL[DOC-MACRO purpose="Project interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements Project."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="Project interface definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Project {
  id: string
  title: string
  data: {
    repo_path: string
    ingestion_status?: string
    file_count?: number
    chunk_count?: number
    total_ingestion_cost_usd?: number
    last_ingested_at?: string | null
    globs?: string[]
    exclude_globs?: string[]
    file_tree?: FileTreeNode
    selected_paths?: string[]
    file_statuses?: Record<string, string>
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Project interface'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:Project:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:ProjectConfig:interface" type="interface" identity="ProjectConfig" parent="none"]
// CIL[DOC-MACRO purpose="ProjectConfig interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements ProjectConfig."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="ProjectConfig interface definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ProjectConfig {
  repo_path: string
  globs: string
  exclude_globs: string
  force_reprocess: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='ProjectConfig interface'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:ProjectConfig:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PipelineProgress:interface" type="interface" identity="PipelineProgress" parent="none"]
// CIL[DOC-MACRO purpose="PipelineProgress interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements PipelineProgress."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="PipelineProgress interface definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineProgress {
  total_selected: number
  by_status: Record<string, number>
  total_chunks: number
}
// CIL[DOC-VECTOR type="context" content="purpose='PipelineProgress interface'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PipelineProgress:interface"]







// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:STATUS_COLOR:constant" type="constant" identity="STATUS_COLOR" parent="none"]
// CIL[DOC-MACRO purpose="STATUS_COLOR constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements STATUS_COLOR."]
// CIL[DOC-CONTEXT module="admin/cil" layer="constant" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="constant value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="STATUS_COLOR constant definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STATUS_COLOR: Record<CilFileStatus, string> = {
  '2-discovered': 'bg-gray-100 text-gray-600',
  '3-selected': 'bg-indigo-100 text-indigo-700',
  '4-chunked': 'bg-blue-100 text-blue-700',
  '5-documented': 'bg-purple-100 text-purple-700',
  '6-embedded': 'bg-green-100 text-green-700',
  '7-mapped': 'bg-teal-100 text-teal-700',
  '8-enriched': 'bg-violet-100 text-violet-700',
  '9-embedded': 'bg-emerald-100 text-emerald-700',
  '10-mapped': 'bg-amber-100 text-amber-700',
}
// CIL[DOC-VECTOR type="context" content="purpose='STATUS_COLOR constant'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:STATUS_COLOR:constant"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PipelineStep:interface" type="interface" identity="PipelineStep" parent="none"]
// CIL[DOC-MACRO purpose="PipelineStep interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements PipelineStep."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="type definition" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="PipelineStep interface definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineStep {
  number: number
  key: string
  label: string
  description: string
  icon: React.ElementType
  agentInstruction: string
  command?: string
  targetStatus: CilFileStatus
  sourceStatus?: CilFileStatus
}
// CIL[DOC-VECTOR type="context" content="purpose='PipelineStep interface'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PipelineStep:interface"]



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PIPELINE_STEPS:constant" type="constant" identity="PIPELINE_STEPS" parent="none"]
// CIL[DOC-MACRO purpose="PIPELINE_STEPS constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements PIPELINE_STEPS."]
// CIL[DOC-CONTEXT module="admin/cil" layer="constant" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="constant value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="PIPELINE_STEPS constant definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: 1,
    key: 'create',
    label: 'Create Project',
    description: 'Project and repo path configured',
    icon: FileCode2,
    agentInstruction: 'Create a new CIL project in the admin workspace with the repository path set.',
    targetStatus: '0-discovered',
  },
  {
    number: 2,
    key: 'build_tree',
    label: 'Build File Tree',
    description: 'Scan repository, build complete file structure',
    icon: Folder,
    agentInstruction: 'Run Pass 1 to walk the repository and discover all files. Use the "Run Pass 1" button or tell Devin: "Scan the repo and build the file tree."',
    targetStatus: '0-discovered',
  },
  {
    number: 3,
    key: 'select',
    label: 'Select Files',
    description: 'Choose which files to process',
    icon: MousePointerClick,
    agentInstruction: 'Select files in the tree on the right. Click individual files, directories, or use Devin: "Select all TypeScript files in .framework/cli/".',
    targetStatus: '3-selected',
    sourceStatus: '2-discovered',
  },
  {
    number: 4,
    key: 'chunk',
    label: 'Chunk',
    description: 'Strip comments, apply fresh CIL markers',
    icon: Code2,
    agentInstruction: 'Tell Devin: "Chunk the selected files." Devin will strip all existing comments, analyze the code structure, and apply clean CIL[BEGIN]/CIL[END] markers ensuring 100% line coverage.',
    command: '/cil-chunk',
    targetStatus: '4-chunked',
    sourceStatus: '3-selected',
  },
  {
    number: 5,
    key: 'document',
    label: 'Document',
    description: 'Generate single-file context documentation',
    icon: BookOpen,
    agentInstruction: 'Tell Devin: "Document the chunked files." Devin will generate standardized inline documentation for each chunk using only single-file context.',
    command: '/cil-document',
    targetStatus: '5-documented',
    sourceStatus: '4-chunked',
  },
  {
    number: 6,
    key: 'first_pass_embed',
    label: 'Embed (1st pass)',
    description: 'Generate 3 basic vectors per chunk',
    icon: Zap,
    agentInstruction: 'Run from the pipeline UI — this step is not Devin-triggered. Click the Run button on Step 6.',
    targetStatus: '6-embedded',
    sourceStatus: '5-documented',
  },
  {
    number: 7,
    key: 'first_pass_map',
    label: 'Map (1st pass)',
    description: 'Create basic relationship mappings',
    icon: GitGraph,
    agentInstruction: 'Run from the pipeline UI — this step is not Devin-triggered. Click the Run button on Step 7.',
    targetStatus: '7-mapped',
    sourceStatus: '6-embedded',
  },
  {
    number: 8,
    key: 'enrich',
    label: 'Enrich',
    description: 'RAG enrichment with multi-file context',
    icon: Sparkles,
    agentInstruction: 'Tell Devin: "Enrich the documented files." Devin will perform RAG queries to discover cross-file relationships and enrich documentation with multi-file context. Requires Steps 6 and 7 to be complete.',
    command: '/cil-enrich',
    targetStatus: '8-enriched',
    sourceStatus: '7-mapped',
  },
  {
    number: 9,
    key: 'second_pass_embed',
    label: 'Embed (2nd pass)',
    description: 'Generate 9 specialized vectors per chunk',
    icon: Layers,
    agentInstruction: 'Run from the pipeline UI — this step is not Devin-triggered. Click the Run button on Step 9.',
    targetStatus: '9-embedded',
    sourceStatus: '8-enriched',
  },
  {
    number: 10,
    key: 'second_pass_map',
    label: 'Map (2nd pass)',
    description: 'Enhanced relationship mapping',
    icon: Network,
    agentInstruction: 'Run from the pipeline UI — this step is not Devin-triggered. Click the Run button on Step 10.',
    targetStatus: '10-mapped',
    sourceStatus: '9-embedded',
  },
]





// CIL[DOC-VECTOR type="context" content="purpose='PIPELINE_STEPS constant'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:PIPELINE_STEPS:constant"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:collectAllDirPaths:function" type="function" identity="collectAllDirPaths" parent="none"]
// CIL[DOC-MACRO purpose="collectAllDirPaths function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements collectAllDirPaths."]
// CIL[DOC-CONTEXT module="admin/cil" layer="logic" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="return value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="collectAllDirPaths function definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function collectAllDirPaths(node: FileTreeNode): string[] {
  const paths: string[] = node.type === 'directory' ? [node.path] : []
  if (node.children) {
    for (const child of node.children) paths.push(...collectAllDirPaths(child))
  }

  return paths
}
// CIL[DOC-VECTOR type="context" content="purpose='collectAllDirPaths function'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:collectAllDirPaths:function"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countFilesInTree:function" type="function" identity="countFilesInTree" parent="none"]
// CIL[DOC-MACRO purpose="countFilesInTree function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements countFilesInTree."]
// CIL[DOC-CONTEXT module="admin/cil" layer="logic" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="return value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="countFilesInTree function definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function countFilesInTree(node: FileTreeNode): number {
  if (node.type === 'file') return 1
  return (node.children || []).reduce((acc, c) => acc + countFilesInTree(c), 0)
}
// CIL[DOC-VECTOR type="context" content="purpose='countFilesInTree function'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countFilesInTree:function"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:getFileStatus:function" type="function" identity="getFileStatus" parent="none"]
// CIL[DOC-MACRO purpose="getFileStatus function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements getFileStatus."]
// CIL[DOC-CONTEXT module="admin/cil" layer="logic" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="return value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="getFileStatus function definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getFileStatus(path: string, fileStatuses: Record<string, string>, selectedPaths: string[]): CilFileStatus {
  const explicit = fileStatuses[path] as CilFileStatus | undefined
  if (explicit) return explicit
  
  if (selectedPaths.includes(path)) return '3-selected'
  return '2-discovered'
}
// CIL[DOC-VECTOR type="context" content="purpose='getFileStatus function'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:getFileStatus:function"]



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countSelectedLeaves:function" type="function" identity="countSelectedLeaves" parent="none"]
// CIL[DOC-MACRO purpose="countSelectedLeaves function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements countSelectedLeaves."]
// CIL[DOC-CONTEXT module="admin/cil" layer="logic" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="return value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="countSelectedLeaves function definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function countSelectedLeaves(node: FileTreeNode, selectedPaths: string[]): number {
  if (node.type === 'file') return selectedPaths.includes(node.path) ? 1 : 0
  return (node.children || []).reduce((sum, c) => sum + countSelectedLeaves(c, selectedPaths), 0)
}
// CIL[DOC-VECTOR type="context" content="purpose='countSelectedLeaves function'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countSelectedLeaves:function"]



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countLeaves:function" type="function" identity="countLeaves" parent="none"]
// CIL[DOC-MACRO purpose="countLeaves function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements countLeaves."]
// CIL[DOC-CONTEXT module="admin/cil" layer="logic" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="return value" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="countLeaves function definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function countLeaves(node: FileTreeNode): number {
  if (node.type === 'file') return 1
  return (node.children || []).reduce((sum, c) => sum + countLeaves(c), 0)
}
// CIL[DOC-VECTOR type="context" content="purpose='countLeaves function'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:countLeaves:function"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:TreeNode:component" type="component" identity="TreeNode" parent="none"]
// CIL[DOC-MACRO purpose="TreeNode component"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements TreeNode."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="TreeNode component definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TreeNode({
  node,
  selectedPaths,
  expandedPaths,
  fileStatuses,
  onToggleSelect,
  onToggleExpand,
  depth = 0,
}: {
  node: FileTreeNode
  selectedPaths: string[]
  expandedPaths: Set<string>
  fileStatuses: Record<string, string>
  onToggleSelect: (path: string, isDir: boolean, children?: FileTreeNode[]) => void
  onToggleExpand: (path: string) => void
  depth?: number
}) {
  const isDir = node.type === 'directory'
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedPaths.includes(node.path)
  const hasChildren = isDir && (node.children?.length || 0) > 0

  
  const selectedLeafCount = isDir ? countSelectedLeaves(node, selectedPaths) : 0
  const totalLeafCount = isDir ? countLeaves(node) : 0
  const isIndeterminate = isDir && !isSelected && selectedLeafCount > 0 && selectedLeafCount < totalLeafCount
  const isAllSelected = isDir && !isSelected && totalLeafCount > 0 && selectedLeafCount === totalLeafCount

  const fileStatus = !isDir ? getFileStatus(node.path, fileStatuses, selectedPaths) : undefined
  const statusLabel = fileStatus && fileStatus !== '2-discovered' ? fileStatus : undefined
  const statusColor = fileStatus ? STATUS_COLOR[fileStatus] : undefined

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-muted/50"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {}
        {hasChildren ? (
          <button
            onClick={e => { e.stopPropagation(); onToggleExpand(node.path) }}
            className="p-0.5 rounded hover:bg-muted shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {}
        <div
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onToggleSelect(node.path, isDir, node.children)}
        >
          {}
          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
            isSelected || isAllSelected
              ? 'bg-indigo-500 border-indigo-500'
              : isIndeterminate
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-muted-foreground'
          }`}>
            {(isSelected || isAllSelected) && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
            {isIndeterminate && <div className="h-1.5 w-1.5 bg-indigo-500 rounded-sm" />}
          </div>

          {}
          {isDir
            ? isExpanded
              ? <FolderOpen className={`h-3.5 w-3.5 shrink-0 ${isSelected || isAllSelected || isIndeterminate ? 'text-indigo-500' : 'text-amber-500'}`} />
              : <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected || isAllSelected || isIndeterminate ? 'text-indigo-500' : 'text-amber-500'}`} />
            : <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          }


          {}
          <span className={`text-xs truncate ${isSelected || isAllSelected || isIndeterminate ? 'text-indigo-700 dark:text-indigo-300 font-medium' : ''}`}>
            {node.name}
          </span>

          {}
          {statusLabel && statusColor && (
            <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {isExpanded && node.children?.map(child => (
        <TreeNode
          key={child.path}
          node={child}
          selectedPaths={selectedPaths}
          expandedPaths={expandedPaths}
          fileStatuses={fileStatuses}
          onToggleSelect={onToggleSelect}
          onToggleExpand={onToggleExpand}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='TreeNode component'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:TreeNode:component"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:StepRow:component" type="component" identity="StepRow" parent="none"]
// CIL[DOC-MACRO purpose="StepRow component"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements StepRow."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="StepRow component definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function StepRow({
  step,
  fileCount,
  activeCount,
  isActive,
  done,
  onRun,
  running,
  byStatus,
  totalChunks,
}: {
  step: PipelineStep
  fileCount: number
  activeCount: number
  isActive: boolean
  done?: boolean
  onRun?: () => void
  running: boolean
  byStatus?: Record<string, number>
  totalChunks?: number
}) {
  const Icon = step.icon
  const [copied, setCopied] = useState(false)
  
  const stepDone = done !== undefined ? done : (activeCount >= fileCount && fileCount > 0)
  const partial = activeCount > 0 && activeCount < fileCount

  const handleCopy = () => {
    if (!step.command) return
    navigator.clipboard.writeText(step.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      isActive
        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800'
        : stepDone
          ? 'bg-green-50/50 border-green-100'
          : 'border-border bg-card'
    }`}>
      {}
      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
        stepDone
          ? 'bg-green-100 text-green-700'
          : isActive
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-muted text-muted-foreground'
      }`}>
        {stepDone ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : step.number}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${done ? 'text-green-600' : isActive ? 'text-indigo-600' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {step.label.includes('(')
              ? <>{step.label.split('(')[0]}<span className="text-xs font-normal text-muted-foreground">({step.label.split('(')[1]}</span></>
              : step.label}
          </span>
          {(isActive || partial || done) && fileCount > 0 && !(step.number === 2) && (
            <Badge variant={partial ? "secondary" : done ? "secondary" : "outline"} className="text-[10px] h-4 px-1.5">
              {partial
                ? `${activeCount}/${fileCount}`
                : step.number === 3
                  ? `${fileCount}`
                  : (step.number === 4 || step.number === 5)
                    ? `${totalChunks || 0} chunks`
                    : (step.number === 6 || step.number === 9)
                      ? `${(totalChunks || 0) * 3} vectors`
                      : `${fileCount} done`}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
        {step.command && (
          <button
            onClick={handleCopy}
            className="mt-1.5 flex items-center gap-1.5 w-fit rounded px-2 py-0.5 bg-muted hover:bg-muted/80 transition-colors group"
          >
            <code className="text-[10px] font-mono text-foreground/70">{step.command}</code>
            {copied
              ? <Check className="h-3 w-3 text-green-600 shrink-0" />
              : <Copy className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            }

          </button>
        )}
      </div>

      {}
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 rounded hover:bg-muted">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs text-xs">
            <p className="font-semibold mb-1">Devin instruction:</p>
            <p>{step.agentInstruction}</p>
          </TooltipContent>
        </Tooltip>
        {onRun && (
          <Button size="sm" variant={isActive ? 'default' : 'outline'} onClick={onRun} disabled={running} className="h-7 text-xs">
            {running ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='StepRow component'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:StepRow:component"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:CILIngestionPage:component" type="component" identity="CILIngestionPage" parent="none"]
// CIL[DOC-MACRO purpose="CILIngestionPage component"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements CILIngestionPage."]
// CIL[DOC-CONTEXT module="admin/cil" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/progress.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tooltip.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILIngestionPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element" side_effects="none" errors="none"]
// CIL[DOC-MICRO logic_summary="CILIngestionPage component definition." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default function CILIngestionPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)

  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)

  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    repo_path: '',
    globs: '**/*.ts,**/*.tsx,**/*.sql',
    exclude_globs: 'node_modules/**,.git/**,dist/**,build/**,.netlify/**,**/*.min.js,**/*.d.ts',
    force_reprocess: false,
  })
  const [configOpen, setConfigOpen] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  const [fileTree, setFileTree] = useState<FileTreeNode | null>(null)
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({})
  const [savingSelection, setSavingSelection] = useState(false)

  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [runningPass, setRunningPass] = useState<string | null>(null)

  
  useEffect(() => {
    if (!projectId) return
    setLoadingProject(true)
    apiFetch(`/api/cil-project?action=get&id=${projectId}`)
      .then(r => r.json())
      .then(data => {
        const p: Project = data?.project || data?.data?.project || null
        setProject(p)
        if (p?.data?.file_tree) {
          setFileTree(p.data.file_tree)
          setExpandedPaths(new Set(collectAllDirPaths(p.data.file_tree)))
        }
        setSelectedPaths(p?.data?.selected_paths || [])
        setFileStatuses(p?.data?.file_statuses || {})
        
        if (p?.data) {
          setProjectConfig(c => ({
            ...c,
            repo_path: p.data.repo_path || '',
            globs: p.data.globs?.join(',') || c.globs,
            exclude_globs: p.data.exclude_globs?.join(',') || c.exclude_globs,
          }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProject(false))
  }, [projectId])

  
  const fetchProgress = useCallback(() => {
    if (!projectId) return
    setLoadingProgress(true)
    apiFetch(`/api/cil-project?action=pipeline_progress&id=${projectId}`)
      .then(r => r.json())
      .then(data => {
        const d = data?.data || data
        const progress = d?.progress || null
        setPipelineProgress(progress)
        
        if (progress?.file_statuses) setFileStatuses(progress.file_statuses)
        
        return apiFetch(`/api/cil-project?action=get&id=${projectId}`)
      })
      .then(r => r.json())
      .then(projectData => {
        const p = projectData?.project || projectData?.data?.project || null
        if (p?.data?.file_statuses) {
          setFileStatuses(p.data.file_statuses)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProgress(false))
  }, [projectId])

  useEffect(() => { fetchProgress() }, [fetchProgress])

  
  const saveSelection = useCallback(async (paths: string[]) => {
    if (!projectId) return
    setSavingSelection(true)
    try {
      
      
      
      const updatedStatuses = { ...fileStatuses }
      for (const p of paths) {
        if (!updatedStatuses[p]) updatedStatuses[p] = '3-selected'
      }
      for (const p of Object.keys(updatedStatuses)) {
        if (!paths.includes(p) && updatedStatuses[p] === '3-selected') {
          delete updatedStatuses[p]
        }
      }
      await apiFetch(`/api/cil-project?action=update&id=${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, data: { selected_paths: paths, file_statuses: updatedStatuses } }),
      })
      setFileStatuses(updatedStatuses)
      setProject(p => p ? { ...p, data: { ...p.data, selected_paths: paths, file_statuses: updatedStatuses } } : p)
    } catch {
      
    } finally {
      setSavingSelection(false)
    }
  }, [projectId, fileStatuses])

  
  const saveConfig = useCallback(async () => {
    if (!projectId) return
    setSavingConfig(true)
    setConfigSaved(false)
    try {
      await apiFetch(`/api/cil-project?action=update&id=${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          data: {
            repo_path: projectConfig.repo_path,
            globs: projectConfig.globs.split(',').map(s => s.trim()).filter(Boolean),
            exclude_globs: projectConfig.exclude_globs.split(',').map(s => s.trim()).filter(Boolean),
          },
        }),
      })
      setProject(p => p ? {
        ...p,
        data: {
          ...p.data,
          repo_path: projectConfig.repo_path,
          globs: projectConfig.globs.split(',').map(s => s.trim()).filter(Boolean),
          exclude_globs: projectConfig.exclude_globs.split(',').map(s => s.trim()).filter(Boolean),
        },
      } : p)
      setConfigSaved(true)
      setTimeout(() => setConfigSaved(false), 2000)
    } catch {
      
    } finally {
      setSavingConfig(false)
    }
  }, [projectId, projectConfig])

  
  const togglePath = useCallback((path: string, isDir: boolean, children?: FileTreeNode[]) => {
    setSelectedPaths(prev => {
      let next: string[]
      if (isDir && children) {
        
        const childPaths = children.map(c => c.path)
        const allSelected = childPaths.every(cp => prev.includes(cp))
        if (allSelected) {
          next = prev.filter(p => !childPaths.includes(p))
        } else {
          next = [...new Set([...prev, ...childPaths])]
        }
      } else {
        next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
      }
      saveSelection(next)
      return next
    })
  }, [saveSelection])

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) { next.delete(path) } else { next.add(path) }
      return next
    })
  }

  
  const runPass1 = async () => {
    if (!projectId) return
    setRunningPass('build_tree')
    try {
      const res = await apiFetch('/api/cil-ingest?action=pass1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          globs: projectConfig.globs.split(',').map(s => s.trim()).filter(Boolean),
          exclude_globs: projectConfig.exclude_globs.split(',').map(s => s.trim()).filter(Boolean),
          force_reprocess: projectConfig.force_reprocess,
        }),
      })
      const data = await res.json()
      const d = data?.data || data
      if (d?.file_tree) {
        setFileTree(d.file_tree)
        setExpandedPaths(new Set(collectAllDirPaths(d.file_tree)))
        setProject(p => p ? { ...p, data: { ...p.data, file_tree: d.file_tree } } : p)
      }
      fetchProgress()
    } catch {
      
    } finally {
      setRunningPass(null)
    }
  }

  
  const runEmbedFirstPass = async () => {
    if (!projectId) return
    setRunningPass('first_pass_embed')
    try {
      let offset: number | null = 0
      while (offset !== null) {
        const res = await apiFetch('/api/cil-embeddings?action=embed_project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            force_regenerate: projectConfig.force_reprocess,
            offset,
          }),
        })
        const data = await res.json()
        const d = data?.data || data
        offset = d?.next_offset ?? null
        await fetchProgress()
      }
    } catch {
      
    } finally {
      setRunningPass(null)
    }
  }

  
  const runMapFirstPass = async () => {
    if (!projectId) return
    setRunningPass('first_pass_map')
    try {
      let offset: number | null = 0
      while (offset !== null) {
        const res = await apiFetch('/api/cil-callmap?action=map_project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            force_regenerate: projectConfig.force_reprocess,
            offset,
          }),
        })
        const data = await res.json()
        const d = data?.data || data
        offset = d?.next_offset ?? null
        await fetchProgress()
      }
    } catch {
      
    } finally {
      setRunningPass(null)
    }
  }

  
  const runEmbedSecondPass = async () => {
    if (!projectId) return
    setRunningPass('second_pass_embed')
    try {
      let offset: number | null = 0
      while (offset !== null) {
        const res = await apiFetch('/api/cil-embeddings?action=embed_project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            force_regenerate: projectConfig.force_reprocess,
            second_pass: true,
            offset,
          }),
        })
        const data = await res.json()
        const d = data?.data || data
        offset = d?.next_offset ?? null
        await fetchProgress()
      }
    } catch {
      
    } finally {
      setRunningPass(null)
    }
  }

  
  const runMapSecondPass = async () => {
    if (!projectId) return
    setRunningPass('second_pass_map')
    try {
      let offset: number | null = 0
      while (offset !== null) {
        const res = await apiFetch('/api/cil-callmap?action=map_project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            force_regenerate: projectConfig.force_reprocess,
            second_pass: true,
            offset,
          }),
        })
        const data = await res.json()
        const d = data?.data || data
        offset = d?.next_offset ?? null
        await fetchProgress()
      }
    } catch {
      
    } finally {
      setRunningPass(null)
    }
  }

  
  const totalFiles = fileTree ? countFilesInTree(fileTree) : 0
  const selectedCount = selectedPaths.length
  const byStatus = pipelineProgress?.by_status || {}
  const totalChunks = pipelineProgress?.total_chunks || 0

  
  
  
  const statusOrder = ['3-selected','4-chunked','5-documented','6-embedded','7-mapped','8-enriched','9-embedded','10-mapped']
  const filesAtOrPast = (minStatus: string) => {
    const minIdx = statusOrder.indexOf(minStatus)
    return statusOrder.slice(minIdx).reduce((sum, s) => sum + (byStatus[s] || 0), 0)
  }

  const activeStep = (() => {
    
    if (!project?.data?.repo_path) return 1
    
    
    if (!fileTree) return 2
    
    
    if (selectedCount === 0) return 3
    
    
    if (filesAtOrPast('4-chunked') < selectedCount) return 4
    
    
    if (filesAtOrPast('5-documented') < selectedCount) return 5
    
    
    if (filesAtOrPast('6-embedded') < selectedCount) return 6
    
    
    if (filesAtOrPast('7-mapped') < selectedCount) return 7
    
    
    if (filesAtOrPast('8-enriched') < selectedCount) return 8
    
    
    if (filesAtOrPast('9-embedded') < selectedCount) return 9
    
    
    if (filesAtOrPast('10-mapped') < selectedCount) return 10
    
    return 10 
  })()

  if (loadingProject) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px] col-span-2" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">

      {}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <a href={appPath('/cil')} className="hover:text-foreground">CIL</a>
            <ChevronRight className="h-3 w-3" />
            <a href={appPath(`/cil/${projectId}/dashboard`)} className="hover:text-foreground">{project.title}</a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Pipeline</span>
          </div>
          <h1 className="text-xl font-bold">{project.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{project.data.repo_path}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchProgress} disabled={loadingProgress} className="h-8">
            <RefreshCw className={`h-3.5 w-3.5 ${loadingProgress ? 'animate-spin' : ''}`} />
          </Button>
          <a href={appPath(`/cil/${projectId}/dashboard`)}>
            <Button size="sm" variant="outline" className="h-8 text-xs">Dashboard</Button>
          </a>
          <a href={appPath(`/cil/${projectId}/agent`)}>
            <Button size="sm" className="h-8 text-xs">Open Agent</Button>
          </a>
        </div>
      </div>

      <PageInstructions
        description="Run and monitor the CIL ingestion pipeline for a project."
        sections={[
          { title: 'What this page is for', content: 'This page controls the multi-pass ingestion process that discovers files, chunks code, generates embeddings, documents contracts, maps calls, and extracts config.' },
          { title: 'How to read this page', content: 'The top cards show files discovered, files selected, first-pass complete, and fully ingested counts. The steps list shows which pass is active and how many files are done.' },
          { title: 'How to use this page', content: 'Expand Project Settings to set the repository path, include globs, exclude globs, and Force Reprocess. Save settings, then run the pipeline steps in order. Refresh the progress bar to track status.' },
          { title: 'Important notes', content: 'Ingestion can be expensive because it uses LLMs. Excluding node_modules, .git, and dist is strongly recommended. Force Reprocess re-runs passes even on already-processed files.' },
        ]}
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold tabular-nums">{totalFiles}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Files discovered</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold tabular-nums text-indigo-700">{selectedCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Files selected</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold tabular-nums text-green-700">
            {byStatus['7-mapped'] || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">First pass complete</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold tabular-nums text-amber-700">
            {byStatus['10-mapped'] || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Fully ingested</div>
        </div>
      </div>

      {}
      <div className="rounded-lg border bg-card overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
          onClick={() => setConfigOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Project Settings</span>
            <span className="text-xs text-muted-foreground">— repo path, globs, exclusions</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${configOpen ? 'rotate-180' : ''}`} />
        </button>

        {configOpen && (
          <div className="px-4 pb-4 border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Repository Path</Label>
                <Input
                  value={projectConfig.repo_path}
                  onChange={e => setProjectConfig(c => ({ ...c, repo_path: e.target.value }))}
                  placeholder="/path/to/repo"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Absolute path to the repository root on disk.</p>
              </div>

              {}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Include Globs</Label>
                <Input
                  value={projectConfig.globs}
                  onChange={e => setProjectConfig(c => ({ ...c, globs: e.target.value }))}
                  placeholder="**/*.ts,**/*.tsx,**/*.sql"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Comma-separated glob patterns for files to include.</p>
              </div>

              {}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Exclude Globs</Label>
                <Input
                  value={projectConfig.exclude_globs}
                  onChange={e => setProjectConfig(c => ({ ...c, exclude_globs: e.target.value }))}
                  placeholder="node_modules/**,.git/**,dist/**"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Comma-separated patterns to exclude from all passes.</p>
              </div>
            </div>

            {}
            <div className="flex items-center justify-between gap-4 pt-3 border-t">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="force-reprocess"
                  checked={projectConfig.force_reprocess}
                  onChange={e => setProjectConfig(c => ({ ...c, force_reprocess: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="force-reprocess" className="cursor-pointer select-none">
                  <p className="text-xs font-semibold">Force Reprocess</p>
                  <p className="text-xs text-muted-foreground">Re-run passes even if files are already processed.</p>
                </label>
              </div>
              <Button size="sm" onClick={saveConfig} disabled={savingConfig} className="h-8 text-xs shrink-0">
                {savingConfig
                  ? <><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />Saving…</>
                  : configSaved
                    ? <><CheckCircle2 className="h-3 w-3 mr-1.5 text-green-600" />Saved</>
                    : <><Save className="h-3 w-3 mr-1.5" />Save Settings</>
                }

              </Button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="grid grid-cols-3 gap-4">

        {}
        <div className="col-span-1 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold">Pipeline Steps</h2>
            <Badge variant="outline" className="text-xs">
              Step {activeStep} active
            </Badge>
          </div>

          {PIPELINE_STEPS.map(step => {


            const isActive = step.number === activeStep



            let activeCount = 0



            let fileCount = selectedCount



            let done = false


            
            if (step.number === 1) {
              done = !!(project?.data?.repo_path)
              activeCount = done ? 1 : 0
              fileCount = 1
            }




            
            else if (step.number === 2) {
              done = !!fileTree
              activeCount = done ? 1 : 0
              fileCount = 1
            }
            
            else if (step.number === 3) {
              done = selectedCount > 0
              activeCount = selectedCount
              fileCount = totalFiles
            }
            
            
            else if (step.targetStatus) {
              activeCount = filesAtOrPast(step.targetStatus)
              fileCount = selectedCount
              done = activeCount >= fileCount && fileCount > 0
            }

            


            let onRun: (() => void) | undefined

            if (step.number === 2) onRun = runPass1
            else if (step.number === 6) onRun = runEmbedFirstPass
            else if (step.number === 7) onRun = runMapFirstPass
            else if (step.number === 9) onRun = runEmbedSecondPass
            else if (step.number === 10) onRun = runMapSecondPass

            return (
              <StepRow
                key={step.key}
                step={step}
                fileCount={fileCount}
                activeCount={activeCount}
                isActive={isActive}
                done={done}
                onRun={onRun}
                running={runningPass === step.key}
                byStatus={byStatus}
                totalChunks={totalChunks}
              />
            )
          })}
        </div>

        {}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">File Tree</CardTitle>
                <div className="flex items-center gap-2">
                  {savingSelection && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Save className="h-3 w-3 animate-pulse" /> Saving…
                    </span>
                  )}
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCount} selected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              {!fileTree ? (
                <div className="py-8 text-center">
                  <Folder className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No file tree yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Run Step 2 to scan the repository.</p>
                  <Button size="sm" className="mt-3" onClick={runPass1} disabled={runningPass === 'build_tree'}>
                    {runningPass === 'build_tree'
                      ? <><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />Scanning…</>
                      : <><Play className="h-3 w-3 mr-1.5" />Scan Repository</>
                    }

                  </Button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-340px)]">
                  <TreeNode
                    node={fileTree}
                    selectedPaths={selectedPaths}
                    expandedPaths={expandedPaths}
                    fileStatuses={fileStatuses}
                    onToggleSelect={togglePath}
                    onToggleExpand={toggleExpand}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='CILIngestionPage component'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILIngestionPage.tsx:CILIngestionPage:component"]
