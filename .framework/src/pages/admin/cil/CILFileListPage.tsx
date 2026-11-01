// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * @module   CILFileListPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module represents the CIL File List Page in the admin section of the application, allowing users to view and manage files related to the CIL. It integrates with the API to fetch file data and provides a user interface for interaction.
 * INVARIANT: The user must have appropriate permissions to access this page.
 *
 * @seeAlso PageInstructions (provides instructional content for the admin interface).
 * @seeAlso apiFetch (handles API requests for fetching file data).
 *
 * @cil-generated
 */










import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Input } from '@core/components/ui/input'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:module_header:module_header"]
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




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFile:interface" type="interface" identity="CILFile" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * The CILFile interface defines the structure of a CIL file object, encapsulating its metadata and associated data attributes. It serves to standardize the representation of CIL files within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFile:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILChunk:interface" type="interface" identity="CILChunk" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * The CILChunk interface defines the structure of a chunk of code within a CIL (Common Intermediate Language) file, encapsulating metadata about the chunk for processing and analysis. It exists to facilitate the management and representation of code segments in the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILChunk:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:ValidationSummary:interface" type="interface" identity="ValidationSummary" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * The ValidationSummary interface defines the structure for summarizing validation results in the application, providing key metrics related to validation status. It includes totals and counts of detected issues to facilitate monitoring and reporting.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface ValidationSummary {
  total: number
  current: number
  drift_detected: number
  not_found: number
  trust_rating: number
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:ValidationSummary:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:FileValidation:interface" type="interface" identity="FileValidation" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * The FileValidation interface defines the structure for validating file uploads within the admin panel. It encapsulates the file's ID, validation summary, loading state, and any potential error messages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface FileValidation {
  fileId: string
  summary: ValidationSummary | null
  loading: boolean
  error: string | null
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:FileValidation:interface"]






















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:PassBadge:component" type="component" identity="PassBadge" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * PassBadge is a React component that visually represents the status of a pass based on its value. It provides feedback for various pass states, including not ingested, in progress, or complete.
 *
 * @macro       React component responsible for rendering pass status badges.
 * @micro       Utilizes conditional rendering to determine the appropriate badge style and message based on the pass value.
 * @inputSpec
 *   pass: number (required) — the number representing the pass status.
 * @outputSpec  JSX.Element — a badge element reflecting the pass status.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function PassBadge({ pass }: { pass: number }) {
  if (!pass || pass < 1) {
    return <Badge variant="outline" className="text-xs text-muted-foreground">Not ingested</Badge>
  }
  if (pass >= 2) {
    return <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">Pass {pass} complete</Badge>
  }
  return <Badge variant="secondary" className="text-xs">Pass {pass}</Badge>
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:PassBadge:component"]






















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:TrustBadge:component" type="component" identity="TrustBadge" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * The TrustBadge component displays a visual indicator of trustworthiness based on a validation summary. It provides feedback on trust ratings and drift detection to inform users of the current state of validation.
 *
 * @macro       UI component that renders trust status based on validation summary.
 * @micro       Utilizes conditional rendering to display different badge styles based on the presence of drift detection.
 * @inputSpec
 *   - summary: ValidationSummary | null (required) — the validation summary containing trust rating and drift detection information.
 * @outputSpec  JSX.Element | null — returns a Badge component or null if no summary is provided.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:TrustBadge:component"]






















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFileListPage:component" type="component" identity="CILFileListPage" parent="~/.framework/src/pages/admin/cil/CILFileListPage.tsx"]
/**
 * CILFileListPage is a React component that manages the display and validation of CIL files associated with a specific project. It fetches project and file data from an API and provides functionality to validate individual files or all visible files at once.
 *
 * @macro       React component for managing CIL file listings and validations.
 * @micro       Utilizes asynchronous API calls to fetch project and file data, and manages state with React hooks.
 * @outputSpec  JSX.Element
 * @sideEffects Makes external API calls to fetch project and file data, and to validate files.
 * @stability   internal
 * @calls       apiFetch
 * @errorHandling none
 * @cil-generated
 */
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

    const PAGE_SIZE = 500
    const fetchAllFiles = async (): Promise<CILFile[]> => {
      const all: CILFile[] = []
      let offset = 0
      while (true) {
        const res = await apiFetch(
          `/api/admin-data?action=list&entity=items&type_slug=cil_file&limit=${PAGE_SIZE}&offset=${offset}`
        )
        const json = await res.json()
        const batch: CILFile[] = json?.data || json?.items || []
        all.push(...batch)
        if (batch.length < PAGE_SIZE) break
        offset += PAGE_SIZE
      }
      return all
    }

    Promise.all([
      apiFetch(`/api/cil-project?action=get&id=${projectId}`).then(r => r.json()),
      fetchAllFiles(),
    ])
      .then(([projData, allFiles]) => {
        setProject(projData?.project || projData?.data || null)
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



/**
 * The constant 'd' stores the data from the 'file' object, defaulting to an empty object if no data is present. This ensures that subsequent operations can safely access 'd' without encountering undefined values.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
            const d = file.data || {}





/**
 * The constant 'filePath' holds the file path for a document, defaulting to the title of the file if no specific path is provided. It exists to ensure that a valid file path is always available for further processing.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
            const filePath: string = d.file_path || file.title





/**
 * The constant 'shortName' extracts the last segment of a file path, providing a simplified name for display purposes. It exists to facilitate user-friendly representations of file names in the admin interface.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
            const shortName = filePath.split('/').pop() || filePath





/**
 * The constant 'dirPath' extracts the directory path from a given file path if it contains a '/' character. It exists to facilitate operations that require the directory context of a file path.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
            const dirPath   = filePath.includes('/')
              ? filePath.split('/').slice(0, -1).join('/')
              : ''





/**
 * The constant 'val' retrieves validation rules associated with a specific file ID from the 'validations' object. It exists to provide the necessary validation logic for the file being processed.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
            const val = validations[file.id]





/**
 * The constant 'isValidating' determines if the loading state of a validation process is active. It is used to conditionally render UI elements based on the validation status.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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



/**
 * The constant 'fc' retrieves the file chunk associated with a specific file ID, providing a way to manage loading states and display appropriate messages based on the chunk's status. It exists to facilitate the rendering of file chunk information in the UI.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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




/**
 * CHUNK_TYPE_COLORS is a mapping of chunk types to their corresponding CSS class styles for visual representation in the UI. It provides consistent styling for different types of code chunks displayed in the admin interface.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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



/**
 * The constant 'typeClass' determines the CSS class to apply based on the chunk type, providing visual differentiation in the UI. It ensures that each chunk is styled appropriately according to its type, enhancing user experience.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileListPage.tsx:CILFileListPage:component"]








