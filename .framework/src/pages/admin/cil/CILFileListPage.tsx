// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="React admin page for listing and validating CIL files within a project"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the CIL file list UI, fetches project data, and exposes chunk status"]
// CIL[DOC-CONTEXT module="admin-cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aggregates CIL files, displays badges, supports search and chunk expansion" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Input } from '@core/components/ui/input'
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Search,
  Code2,
  GitGraph,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'



import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='React admin page for listing and validating CIL files within a project'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFile:interface" type="interface" identity="CILFile" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the CILFile record shape used by the file list"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the data model for an indexed CIL source file"]
// CIL[DOC-CONTEXT module="admin-cil" layer="data-model" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists metadata fields including chunk_count, ingestion_pass, and dead-code flags" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface CILFile {
  id: string
  title: string
  data: {
    file_path: string
    language: string
    project_id: string
    ingestion_pass: number
    chunk_count: number
    line_count: number
    stored_hash: string | null
    is_dead_code: boolean
    has_existing_markers: boolean
    existing_marker_count: number
    git_last_commit: string | null
  }
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the CILFile record shape used by the file list'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFile:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILChunk:interface" type="interface" identity="CILChunk" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the CILChunk record shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the data model for a CIL chunk"]
// CIL[DOC-CONTEXT module="admin-cil" layer="data-model" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exposes chunk_name, chunk_type, line range, and stability fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface CILChunk {
  id: string
  chunk_name: string
  chunk_type: string
  line_start: number
  line_end: number
  macro: string
  doc_confidence: string
  boundary_confidence: string
  stored_hash: string | null
  is_dead_code: boolean
  stability: string
  file_path: string
  project_id: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the CILChunk record shape'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILChunk:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:ValidationSummary:interface" type="interface" identity="ValidationSummary" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the validation summary shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes aggregate validation trust metrics"]
// CIL[DOC-CONTEXT module="admin-cil" layer="data-model" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains total, current, drift_detected, not_found, and trust_rating fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface ValidationSummary {
  total: number
  current: number
  drift_detected: number
  not_found: number
  trust_rating: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the validation summary shape'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:ValidationSummary:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:FileValidation:interface" type="interface" identity="FileValidation" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Defines per-file validation state"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the validation result for a single CIL file"]
// CIL[DOC-CONTEXT module="admin-cil" layer="data-model" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Includes summary, loading flag, and error message" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface FileValidation {
  fileId: string
  summary: ValidationSummary | null
  loading: boolean
  error: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines per-file validation state'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:FileValidation:interface"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:PassBadge:component" type="component" identity="PassBadge" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Badge component showing ingestion pass status"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a label for the current ingestion pass"]
// CIL[DOC-CONTEXT module="admin-cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="pass: number" outputs="Badge React element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Shows Not ingested, Pass n, or Pass n complete variants" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function PassBadge({ pass }: { pass: number }) {
  if (!pass || pass < 1) {
    return <Badge variant="outline" className="text-xs text-muted-foreground">Not ingested</Badge>
  }
  if (pass >= 2) {
    return <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">Pass {pass} complete</Badge>
  }
  return <Badge variant="secondary" className="text-xs">Pass {pass}</Badge>
}
// CIL[DOC-VECTOR type="context" content="purpose='Badge component showing ingestion pass status'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:PassBadge:component"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:TrustBadge:component" type="component" identity="TrustBadge" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Badge component showing validation trust"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a trust rating and drift count badge"]
// CIL[DOC-CONTEXT module="admin-cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="summary: ValidationSummary | null" outputs="Badge or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Displays destructive badge when drift detected, otherwise trusted percentage" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function TrustBadge({ summary }: { summary: ValidationSummary | null }) {
  if (!summary) return null
  const { trust_rating, drift_detected } = summary
  if (drift_detected > 0) {
    return (
      <Badge variant="destructive" className="text-xs flex items-center gap-1">
        <ShieldAlert className="h-3 w-3" />
        {trust_rating}% ({drift_detected} drift)
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1 border-emerald-500 text-emerald-600">
      <ShieldCheck className="h-3 w-3" />
      {trust_rating}% trusted
    </Badge>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Badge component showing validation trust'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:TrustBadge:component"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFileListPage:component" type="component" identity="CILFileListPage" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-MACRO purpose="Main page component for the CIL file list"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches and renders CIL files for a project"]
// CIL[DOC-CONTEXT module="admin-cil" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileListPage.tsx"]
// CIL[DOC-CONTRACT inputs="projectId from useParams" outputs="React page JSX" errors="Error messages displayed via validations" side_effects="Fetches project and files, manages React state, navigates"]
// CIL[DOC-MICRO logic_summary="Implements search, summary cards, file chunk expansion, and validation actions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export default function CILFileListPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)

  const [project, setProject] = useState<{ id: string; title: string; data: any } | null>(null)
  const [files, setFiles] = useState<CILFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [validations, setValidations] = useState<Record<string, FileValidation>>({})
  const [validatingAll, setValidatingAll] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [fileChunks, setFileChunks] = useState<Record<string, { chunks: CILChunk[]; loading: boolean; loaded: boolean }>>({})

  
  const fetchData = useCallback(() => {
    if (!projectId) return
    setLoading(true)

    Promise.all([
      apiFetch(`/api/cil-project?action=get&id=${projectId}`).then(r => r.json()),
      apiFetch(`/api/admin-data?action=list&entity=items&type_slug=cil_file&limit=500`)
        .then(r => r.json()),
    ])
      .then(([projData, filesData]) => {
        setProject(projData?.project || projData?.data || null)
        const allFiles: CILFile[] = filesData?.data || filesData?.items || []
        setFiles(allFiles.filter(f => f.data?.project_id === projectId))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => { fetchData() }, [fetchData])

  
  const validateFile = useCallback(async (fileId: string) => {
    setValidations(prev => ({
      ...prev,
      [fileId]: { fileId, summary: null, loading: true, error: null },
    }))
    try {
      const res = await apiFetch(
        `/api/cil-validate?action=validate_file&file_id=${fileId}`
      )
      const data = await res.json()
      setValidations(prev => ({
        ...prev,
        [fileId]: {
          fileId,
          summary: data?.summary || null,
          loading: false,
          error: data?.error || null,
        },
      }))
    } catch (err) {
      setValidations(prev => ({
        ...prev,
        [fileId]: {
          fileId,
          summary: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Validation failed',
        },
      }))
    }
  }, [])

  
  const validateAll = useCallback(async () => {
    const visible = filteredFiles
    setValidatingAll(true)
    for (const f of visible) {
      await validateFile(f.id)
    }
    setValidatingAll(false)
  }, [files, search]) 

  
  const toggleFileChunks = useCallback(async (fileId: string) => {
    const alreadyExpanded = expandedFiles.has(fileId)
    setExpandedFiles(prev => {
      const next = new Set(prev)
      alreadyExpanded ? next.delete(fileId) : next.add(fileId)
      return next
    })
    if (alreadyExpanded) return 

    
    if (fileChunks[fileId]?.loaded) return

    setFileChunks(prev => ({ ...prev, [fileId]: { chunks: [], loading: true, loaded: false } }))
    try {
      const res = await apiFetch(`/api/cil-graph?action=get_file_chunks&file_id=${fileId}`)
      const data = await res.json()
      const chunks: CILChunk[] = data?.chunks || data?.data?.chunks || []
      setFileChunks(prev => ({ ...prev, [fileId]: { chunks, loading: false, loaded: true } }))
    } catch {
      setFileChunks(prev => ({ ...prev, [fileId]: { chunks: [], loading: false, loaded: true } }))
    }
  }, [expandedFiles, fileChunks])

  
  const filteredFiles = files.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (f.data?.file_path || '').toLowerCase().includes(q) ||
      (f.data?.language || '').toLowerCase().includes(q)
    )
  })

  
  const totalChunks = files.reduce((sum, f) => sum + (f.data?.chunk_count || 0), 0)
  const fullyIngested = files.filter(f => (f.data?.ingestion_pass || 0) >= 2).length
  const deadCodeFiles = files.filter(f => f.data?.is_dead_code).length
  const validatedCount = Object.keys(validations).length
  const driftCount = Object.values(validations).filter(v => (v.summary?.drift_detected || 0) > 0).length

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(appPath(`/cil/${projectId}`))}
            className="flex items-center gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-500" />
              File List
              {project && (
                <span className="text-muted-foreground font-normal text-base">— {project.title}</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {files.length} files · {totalChunks} total chunks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={validateAll}
            disabled={validatingAll || filteredFiles.length === 0}
          >
            <ShieldCheck className="h-4 w-4 mr-1" />
            {validatingAll ? 'Validating…' : `Validate All (${filteredFiles.length})`}
          </Button>
        </div>
      </div>

      <PageInstructions
        description="Browse indexed files and their chunks for a project."
        sections={[
          { title: 'What this page is for', content: 'This page lists all files discovered for a CIL project and shows their ingestion, drift, and dead-code status.' },
          { title: 'How to read this page', content: 'The summary cards show Total Files, Fully Ingested, Dead Code, and Files with Drift. Each file card displays the path, language, chunk count, and status badges.' },
          { title: 'How to use this page', content: 'Use the search box to filter by path or language. Click a file to view its chunks. Click Validate All to re-check hashes and drift for the filtered files.' },
          { title: 'Important notes', content: 'Drift means the file changed since the last ingestion and stored hashes no longer match. Dead-code files are not called or imported by any other indexed file.' },
        ]}
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Files',        value: files.length,        icon: FileCode2,   color: 'text-violet-500' },
          { label: 'Fully Ingested',     value: fullyIngested,       icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Dead Code',          value: deadCodeFiles,       icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Files w/ Drift',     value: driftCount,          icon: ShieldAlert, color: 'text-red-500' },
        ].map(stat => (
          <Card key={stat.label} className="p-3">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter by path or language…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {}
      {validatedCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Validated {validatedCount} / {filteredFiles.length} files
          {driftCount > 0 && (
            <span className="ml-2 text-red-500 font-medium">· {driftCount} with drift</span>
          )}
        </div>
      )}

      {}
      {filteredFiles.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {files.length === 0
            ? 'No files ingested yet. Run Pass 1 from the Ingestion tab.'
            : 'No files match the current filter.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => {


            const d = file.data || {}



            const filePath: string = d.file_path || file.title



            const shortName = filePath.split('/').pop() || filePath



            const dirPath   = filePath.includes('/')
              ? filePath.split('/').slice(0, -1).join('/')
              : ''



            const val = validations[file.id]



            const isValidating = val?.loading === true


            return (
              <Card key={file.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">

                    {}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <FileCode2 className="h-4 w-4 mt-0.5 shrink-0 text-violet-400" />
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-medium truncate">{shortName}</div>
                        {dirPath && (
                          <div className="text-xs text-muted-foreground font-mono truncate">{dirPath}/</div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <Badge variant="outline" className="text-xs font-mono">{d.language || 'unknown'}</Badge>
                          <PassBadge pass={d.ingestion_pass || 0} />
                          {d.chunk_count > 0 && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Code2 className="h-2.5 w-2.5" />
                              {d.chunk_count} chunks
                            </Badge>
                          )}
                          {d.line_count > 0 && (
                            <span className="text-xs text-muted-foreground">{d.line_count} lines</span>
                          )}
                          {d.is_dead_code && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                              Dead code
                            </Badge>
                          )}
                          {d.has_existing_markers && d.existing_marker_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {d.existing_marker_count} prior markers
                            </span>
                          )}
                          {}
                          {val && !val.loading && val.summary && (
                            <TrustBadge summary={val.summary} />
                          )}
                          {val && !val.loading && val.error && (
                            <Badge variant="destructive" className="text-xs">Validate error</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {}
                      {(d.chunk_count || 0) > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2 h-8 text-xs"
                          onClick={() => toggleFileChunks(file.id)}
                          title={expandedFiles.has(file.id) ? 'Collapse chunks' : 'Show chunks'}
                        >
                          {expandedFiles.has(file.id)
                            ? <ChevronDown className="h-3.5 w-3.5" />
                            : <ChevronRight className="h-3.5 w-3.5" />
                          }






                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 h-8 text-xs"
                        disabled={isValidating}
                        onClick={() => validateFile(file.id)}
                        title="Validate file hashes from disk"
                      >
                        {isValidating ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2 h-8"
                        onClick={() => navigate(appPath(`/cil/${projectId}/graph`))}
                        title="View call graph"
                      >
                        <GitGraph className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {}
                  {val && !val.loading && val.summary && val.summary.drift_detected > 0 && (
                    <div className="mt-3 p-2.5 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs space-y-1">
                      <div className="font-medium text-red-700 dark:text-red-400 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        {val.summary.drift_detected} chunk{val.summary.drift_detected !== 1 ? 's' : ''} have drifted since last ingestion
                      </div>
                      <div className="text-muted-foreground">
                        Run <code className="font-mono bg-muted px-1 rounded">reindex_chunk</code> or re-run Pass 2 with <code className="font-mono bg-muted px-1 rounded">force_reprocess: true</code> to update stored hashes.
                      </div>
                    </div>
                  )}

                  {}
                  {expandedFiles.has(file.id) && (() => {


                    const fc = fileChunks[file.id]

                    if (!fc || fc.loading) return (
                      <div className="mt-3 pt-3 border-t space-y-1.5">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-6 rounded bg-muted animate-pulse" />
                        ))}
                      </div>
                    )
                    if (!fc.chunks.length) return (
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">No chunks indexed for this file.</div>
                    )



                    const CHUNK_TYPE_COLORS: Record<string, string> = {
                      function: 'bg-indigo-100 text-indigo-700',
                      class: 'bg-violet-100 text-violet-700',
                      interface: 'bg-emerald-100 text-emerald-700',
                      type: 'bg-cyan-100 text-cyan-700',
                      component: 'bg-amber-100 text-amber-700',
                      hook: 'bg-pink-100 text-pink-700',
                      route: 'bg-red-100 text-red-700',
                    }




                    return (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {fc.chunks.map(chunk => {


                          const typeClass = CHUNK_TYPE_COLORS[chunk.chunk_type] || 'bg-slate-100 text-slate-600'

                          return (
                            <a
                              key={chunk.id}
                              href={appPath(`/cil/${projectId}/chunks/${chunk.id}`)}
                              className="flex items-center gap-2 group rounded px-1.5 py-1 hover:bg-muted/60 transition-colors text-xs"
                            >
                              <Code2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="font-mono font-medium group-hover:text-indigo-600 transition-colors truncate flex-1">
                                {chunk.chunk_name}
                              </span>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs ${typeClass}`}>
                                {chunk.chunk_type}
                              </span>
                              <span className="shrink-0 text-muted-foreground font-mono">
                                L{chunk.line_start}–{chunk.line_end}
                              </span>
                              {chunk.is_dead_code && (
                                <span className="shrink-0 text-amber-500 text-xs">dead</span>
                              )}
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          )
                        })}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Main page component for the CIL file list'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFileListPage:component"]

