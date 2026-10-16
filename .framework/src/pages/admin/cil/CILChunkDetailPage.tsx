// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Imports and page scaffolding for the CIL chunk detail admin page"]
// CIL[DOC-RESPONSIBILITY responsibility="Set up dependencies and shared UI primitives for CILChunkDetailPage"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aggregates React hooks, router, API, UI components, icons, and PageInstructions for the page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine maintainers and CIL UI developers"]

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Textarea } from '@core/components/ui/textarea'
import { Label } from '@core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@core/components/ui/tabs'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Save,
  Zap,
  FileCode2,
  Hash,
  TestTube2,
} from 'lucide-react'



import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Imports and page scaffolding for the CIL chunk detail admin page'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ChunkContract:interface" type="interface" identity="ChunkContract" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the data contract for a CIL chunk record"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a TypeScript shape for chunk contract fields"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="domain" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface declaration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps all chunk contract fields including identifiers, doc status, tests, call lists, and hashes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ChunkContract {
  id: string
  chunk_name: string
  file_path: string
  line_start: number
  line_end: number
  chunk_type: string
  macro: string
  micro: string
  input_spec: string
  output_spec: string
  side_effects: string
  stability: string
  test_unit_path: string | null
  test_e2e_path: string | null
  doc_confidence: string
  boundary_confidence: string
  stored_hash: string | null
  hash_status: string
  content_hash: string | null
  version_id: string | null
  is_dead_code: boolean
  callers: { chunk_id: string; chunk_name: string; file_path: string }[]
  callees: { chunk_id: string; chunk_name: string; file_path: string }[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the data contract for a CIL chunk record'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ChunkContract:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:EmbeddingStatus:interface" type="interface" identity="EmbeddingStatus" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Tracks vector embedding coverage for a project"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shape of embedding coverage metrics"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="domain" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface declaration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines coverage_pct, embedded_chunks, and total_chunks fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface EmbeddingStatus {
  coverage_pct: number
  embedded_chunks: number
  total_chunks: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Tracks vector embedding coverage for a project'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:EmbeddingStatus:interface"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:doc_and_stability:constant" type="constant" identity="doc_and_stability" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Provides badge configuration for documentation confidence and stability labels"]
// CIL[DOC-RESPONSIBILITY responsibility="Map doc_confidence and stability enum values to UI labels, colors, and badge variants"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record objects keyed by doc confidence and stability strings" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines DOC_CONFIDENCE_CONFIG with label, color, and icon; STABILITY_BADGE maps stability to Badge variant strings" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DOC_CONFIDENCE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  human_verified: { label: 'Human Verified', color: 'text-green-600', icon: CheckCircle2 },
  ai_generated: { label: 'AI Generated', color: 'text-blue-600', icon: Zap },
  unverified_legacy: { label: 'Unverified', color: 'text-amber-600', icon: AlertTriangle },
}





const STABILITY_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  stable: 'default',
  internal: 'secondary',
  experimental: 'outline',
}




// CIL[DOC-VECTOR type="context" content="purpose='Provides badge configuration for documentation confidence and stability labels'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:doc_and_stability:constant"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:HashStatusBadge:component" type="component" identity="HashStatusBadge" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Render a Badge indicating the current hash status of a CIL chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Display current, drift_detected, or unknown hash status with an icon"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="status: string — hash status to display (current, drift_detected, unknown)" outputs="JSX Badge element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Branches on status string and returns a Badge variant with matching icon and label" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function HashStatusBadge({ status }: { status: string }) {
  if (status === 'current') return (
    <Badge variant="default" className="bg-green-600 text-white gap-1">
      <CheckCircle2 className="h-3 w-3" /> Current
    </Badge>
  )
  if (status === 'drift_detected') return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Drift Detected
    </Badge>
  )
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Hash className="h-3 w-3" /> Unknown
    </Badge>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a Badge indicating the current hash status of a CIL chunk'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:HashStatusBadge:component"]



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ChunkLinkCard:component" type="component" identity="ChunkLinkCard" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Render a clickable card linking to another CIL chunk"]
// CIL[DOC-RESPONSIBILITY responsibility="Format chunk reference as a compact link card"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="chunk, label, projectId strings" outputs="JSX anchor element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds admin path, renders file icon, name, path, and hover arrow" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ChunkLinkCard({
  chunk,
  label,
  projectId,
}: {
  chunk: { chunk_id: string; chunk_name: string; file_path: string }
  label: string
  projectId: string
}) {

  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  return (
    <a
      href={appPath(`/cil/${projectId}/chunks/${chunk.chunk_id}`)}
      className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 transition-colors group text-sm"
    >
      <FileCode2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-mono font-medium truncate">{chunk.chunk_name}</div>
        <div className="text-xs text-muted-foreground truncate">{chunk.file_path}</div>
      </div>
      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </a>
  )
}



// CIL[DOC-VECTOR type="context" content="purpose='Render a clickable card linking to another CIL chunk'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ChunkLinkCard:component"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ContractEditor:component" type="component" identity="ContractEditor" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Edit and persist a CIL chunk contract"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a controlled form for macro, micro, I/O, side effects, stability, tests, and confidence"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="contract: ChunkContract, projectId: string, onSave callback" outputs="JSX form; PATCH updates to admin-data" errors="API failures swallowed in try/finally" side_effects="PATCH /api/admin-data, calls onSave"]
// CIL[DOC-MICRO logic_summary="Maintains local form state, renders labeled Textareas and Selects, submits a PATCH when user clicks Save" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ContractEditor({
  contract,
  projectId,
  onSave,
}: {
  contract: ChunkContract
  projectId: string
  onSave: (updated: Partial<ChunkContract>) => void
}) {
  const [form, setForm] = useState({
    macro: contract.macro || '',
    micro: contract.micro || '',
    input_spec: contract.input_spec || '',
    output_spec: contract.output_spec || '',
    side_effects: contract.side_effects || '',
    stability: contract.stability || 'internal',
    test_unit_path: contract.test_unit_path || '',
    test_e2e_path: contract.test_e2e_path || '',
    doc_confidence: contract.doc_confidence || 'unverified_legacy',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await apiFetch(`/api/admin-data?id=${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          data: {
            ...form,
            test_unit_path: form.test_unit_path || null,
            test_e2e_path: form.test_e2e_path || null,
          },
        }),
      })
      if (res.ok) {
        setSaved(true)
        onSave(form)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    rows = 2
  ) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      <Textarea
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        rows={rows}
        className="text-sm font-mono resize-none"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      {field('macro', 'Macro (Purpose — one sentence)', 'What this chunk IS and its primary responsibility', 2)}
      {field('micro', 'Micro (Implementation detail)', 'How it does it — key algorithm, pattern, or approach', 2)}
      {field('input_spec', 'Inputs', 'Parameter names, types, constraints (one per line)', 3)}
      {field('output_spec', 'Returns', 'Return type and shape description', 2)}
      {field('side_effects', 'Side Effects', 'DB writes, API calls, file I/O, mutations, thrown errors', 2)}
      {field('test_unit_path', 'Unit Test Path', 'Relative path to unit test file (e.g. src/__tests__/foo.test.ts)', 1)}
      {field('test_e2e_path', 'E2E Test Path', 'Relative path to e2e test file', 1)}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Stability</Label>
          <Select value={form.stability} onValueChange={v => setForm(f => ({ ...f, stability: v }))}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="experimental">Experimental</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Doc Confidence</Label>
          <Select value={form.doc_confidence} onValueChange={v => setForm(f => ({ ...f, doc_confidence: v }))}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="human_verified">Human Verified</SelectItem>
              <SelectItem value="ai_generated">AI Generated</SelectItem>
              <SelectItem value="unverified_legacy">Unverified Legacy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <><RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="h-3 w-3 mr-2 text-green-400" /> Saved</>
        ) : (
          <><Save className="h-3 w-3 mr-2" /> Save Contract</>
        )}
      </Button>
    </div>
  )
}



// CIL[DOC-VECTOR type="context" content="purpose='Edit and persist a CIL chunk contract'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:ContractEditor:component"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:CILChunkDetailPage:component" type="component" identity="CILChunkDetailPage" parent="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for inspecting a single CIL chunk contract, code, callers, and blast radius"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display chunk contract, validate hash, embed chunk, render graph and blast radius"]
// CIL[DOC-CONTEXT module="CIL admin UI" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/tabs.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILChunkDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="React Router params projectId and chunkId" outputs="JSX admin page" errors="Network/API errors silently handled" side_effects="GET and POST apiFetch calls to CIL endpoints, updates local state"]
// CIL[DOC-MICRO logic_summary="Loads chunk contract and code, renders hash actions, tabs for contract/graph/code/blast, and link cards for callers/callees" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default function CILChunkDetailPage() {
  const { id: projectId, chunkId } = useParams<{ id: string; chunkId: string }>()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [contract, setContract] = useState<ChunkContract | null>(null)
  const [codeContent, setCodeContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [hashStatus, setHashStatus] = useState<string>('unknown')
  const [embedding, setEmbedding] = useState(false)
  const [embedResult, setEmbedResult] = useState<string | null>(null)
  const [blastRadius, setBlastRadius] = useState<any[] | null>(null)
  const [loadingBlast, setLoadingBlast] = useState(false)

  const loadChunk = useCallback(async () => {
    if (!chunkId) return
    setLoading(true)
    try {
      const res = await apiFetch(`/api/cil-graph?action=get_chunk_contract&chunk_id=${chunkId}`)
      const data = await res.json()
      const c = data?.contract || data?.data?.contract
      if (c) {
        setContract(c)
        setHashStatus(c.hash_status || 'unknown')
      }

      
      const itemRes = await apiFetch(`/api/admin-data?action=get&entity=items&id=${c.id}`)
      const itemData = await itemRes.json()
      const item = itemData?.data || itemData
      setCodeContent(item?.data?.code_content || '')
    } catch {
    } finally {
      setLoading(false)
    }
  }, [chunkId])

  useEffect(() => { loadChunk() }, [loadChunk])

  const handleValidate = async () => {
    if (!chunkId || !contract || !codeContent) return
    setValidating(true)
    try {
      const res = await apiFetch('/api/cil-validate?action=validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunks: [{ chunk_id: contract.id, chunk_name: contract.chunk_name, content: codeContent }],
        }),
      })
      const data = await res.json()
      const result = (data?.results || data?.data?.results)?.[0]
      if (result) setHashStatus(result.status)
    } finally {
      setValidating(false)
    }
  }

  const handleEmbed = async () => {
    if (!chunkId) return
    setEmbedding(true)
    setEmbedResult(null)
    try {
      const res = await apiFetch('/api/cil-embeddings?action=embed_chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunk_id: contract?.id || chunkId, force_regenerate: false }),
      })
      const data = await res.json()
      const r = data?.data || data
      if (r?.created?.length) {
        setEmbedResult(`Generated ${r.created.length} vector(s): ${r.created.join(', ')}`)
      } else if (r?.skipped?.length) {
        setEmbedResult(`Already current — ${r.skipped.length} vector(s) unchanged`)
      } else {
        setEmbedResult('Embedding complete')
      }
    } catch (err) {
      setEmbedResult(`Error: ${err}`)
    } finally {
      setEmbedding(false)
    }
  }

  const handleBlastRadius = async () => {
    if (!chunkId) return
    setLoadingBlast(true)
    try {
      const res = await apiFetch(`/api/cil-graph?action=get_blast_radius&chunk_id=${contract?.id || chunkId}&max_depth=3`)
      const data = await res.json()
      setBlastRadius((data?.affected || data?.data?.affected) ?? [])
    } finally {
      setLoadingBlast(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-96" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return <div className="p-6 text-muted-foreground text-center">Chunk not found.</div>
  }

  const docCfg = DOC_CONFIDENCE_CONFIG[contract.doc_confidence] || DOC_CONFIDENCE_CONFIG.unverified_legacy
  const DocIcon = docCfg.icon

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <a href={appPath('/cil')} className="hover:underline">Code Intelligence</a>
        <ChevronRight className="h-3 w-3" />
        <a href={appPath(`/cil/${projectId}/ingest`)} className="hover:underline">Project</a>
        <ChevronRight className="h-3 w-3" />
        <span className="font-mono">{contract.chunk_name}</span>
      </div>

      {}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-mono">{contract.chunk_name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {contract.file_path} · L{contract.line_start}–{contract.line_end}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STABILITY_BADGE[contract.stability] || 'outline'}>
            {contract.stability}
          </Badge>
          <Badge variant="secondary">{contract.chunk_type}</Badge>
          <Badge variant={contract.is_dead_code ? 'destructive' : 'outline'}>
            {contract.is_dead_code ? 'Dead Code' : 'Active'}
          </Badge>
          <span className={`flex items-center gap-1 text-xs ${docCfg.color}`}>
            <DocIcon className="h-3.5 w-3.5" />
            {docCfg.label}
          </span>
        </div>
      </div>

      <PageInstructions
        description="Inspect a single CIL chunk, its contract, and its relationships."
        sections={[
          { title: 'What this page is for', content: 'This page displays one indexed code chunk, including its contract, code, call graph, and hash/embed status.' },
          { title: 'How to read this page', content: 'The Contract tab shows macro and micro summaries plus documentation status. The Graph tab lists callers and callees. The Code tab shows the source. Blast Radius appears after calculation.' },
          { title: 'How to use this page', content: 'Click Validate Hash to confirm the stored hash matches the current file contents. Click Embed Chunk to regenerate its vector embeddings. Click Blast Radius to see impacted chunks.' },
          { title: 'Important notes', content: 'Dead-code chunks are marked with a destructive badge. Documentation coverage is shown as AI-generated, human-verified, or undocumented.' },
        ]}
      />

      {}
      <div className="flex items-center gap-3 flex-wrap">
        <HashStatusBadge status={hashStatus} />
        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
          <span>content_hash: <span className="font-mono">{contract.content_hash ?? '—'}</span></span>
          <span>version_id: <span className="font-mono">{contract.version_id ?? '—'}</span></span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleValidate}
          disabled={validating || !codeContent}
          className="h-7 text-xs"
        >
          {validating ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Hash className="h-3 w-3 mr-1" />}
          Validate Hash
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleEmbed}
          disabled={embedding}
          className="h-7 text-xs"
        >
          {embedding ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
          Embed Chunk
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleBlastRadius}
          disabled={loadingBlast}
          className="h-7 text-xs"
        >
          {loadingBlast ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
          Blast Radius
        </Button>
        {embedResult && (
          <span className="text-xs text-muted-foreground">{embedResult}</span>
        )}
      </div>

      <Tabs defaultValue="contract">
        <TabsList>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="graph">
            Graph
            {(contract.callers.length + contract.callees.length) > 0 && (
              <span className="ml-1.5 bg-primary/15 text-primary text-xs rounded-full px-1.5 py-0.5 leading-none">
                {contract.callers.length + contract.callees.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          {blastRadius !== null && (
            <TabsTrigger value="blast">
              Blast Radius
              {blastRadius.length > 0 && (
                <span className="ml-1.5 bg-red-100 text-red-700 text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {blastRadius.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {}
        <TabsContent value="contract" className="mt-4 space-y-4">
          {}
          {(contract.macro || contract.micro) && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                {contract.macro && (
                  <p className="text-sm"><span className="font-medium text-muted-foreground">Purpose: </span>{contract.macro}</p>
                )}
                {contract.micro && (
                  <p className="text-sm"><span className="font-medium text-muted-foreground">Detail: </span>{contract.micro}</p>
                )}
              </CardContent>
            </Card>
          )}

          {}
          {(contract.input_spec || contract.output_spec || contract.side_effects) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contract.input_spec && (
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{contract.input_spec}</pre>
                  </CardContent>
                </Card>
              )}
              {contract.output_spec && (
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Returns</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{contract.output_spec}</pre>
                  </CardContent>
                </Card>
              )}
              {contract.side_effects && (
                <Card>
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Side Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{contract.side_effects}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {}
          {(contract.test_unit_path || contract.test_e2e_path) && (
            <Card>
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <TestTube2 className="h-3 w-3" /> Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 space-y-1">
                {contract.test_unit_path && (
                  <p className="text-xs font-mono">Unit: {contract.test_unit_path}</p>
                )}
                {contract.test_e2e_path && (
                  <p className="text-xs font-mono">E2E: {contract.test_e2e_path}</p>
                )}
              </CardContent>
            </Card>
          )}

          {}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Edit Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractEditor
                contract={contract}
                projectId={projectId!}
                onSave={updated => setContract(c => c ? { ...c, ...updated } : c)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="graph" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Called By ({contract.callers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {contract.callers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No callers recorded — may be an entrypoint or dead code</p>
                ) : (
                  contract.callers.map(c => (
                    <ChunkLinkCard key={c.chunk_id} chunk={c} label="caller" projectId={projectId!} />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Calls ({contract.callees.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {contract.callees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No outgoing calls recorded</p>
                ) : (
                  contract.callees.map(c => (
                    <ChunkLinkCard key={c.chunk_id} chunk={c} label="callee" projectId={projectId!} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {}
        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">{contract.chunk_name}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  L{contract.line_start}–{contract.line_end} · {contract.chunk_type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {codeContent ? (
                <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-auto max-h-[60vh] whitespace-pre">
                  {codeContent}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Code content not stored — run Pass 2 ingestion to capture chunk source.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {}
        {blastRadius !== null && (
          <TabsContent value="blast" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Blast Radius — {blastRadius.length} chunk{blastRadius.length !== 1 ? 's' : ''} affected
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blastRadius.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No callers — change to this chunk has no upstream blast radius</p>
                ) : (
                  <div className="space-y-1.5">
                    {blastRadius.map((item: any) => (
                      <div key={item.chunk_id} className="flex items-center gap-2 text-sm">
                        <span className="text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5 font-mono shrink-0">
                          depth {item.depth}
                        </span>
                        <ChunkLinkCard chunk={item} label="affected" projectId={projectId!} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Admin page for inspecting a single CIL chunk contract, code, callers, and blast radius'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILChunkDetailPage.tsx:CILChunkDetailPage:component"]

