// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Provides the React page for searching indexed CIL code chunks across projects with hybrid, semantic, or text modes."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies, define shared types and helper components, and export the default CILSearchPage component."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="default export CILSearchPage React component" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up the CIL search UI layout, search controls, result list and filters." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin UI developers maintaining the CIL search interface"]

import { useState, useRef, useMemo } from 'react'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import {
  Search,
  Zap,
  FileCode2,
  ChevronRight,
  Code2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'



import { PageInstructions } from '../../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Provides the React page for searching indexed CIL code chunks across projects with hybrid, semantic, or text modes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SearchResult:interface" type="interface" identity="SearchResult" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the shape of a CIL search result returned by the code intelligence search API."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the data contract for search result objects including metadata and similarity scores."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="SearchResult interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Specifies fields: id, chunk_name, file_path, macro, micro, chunk_type, doc_confidence, similarity, match_type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface SearchResult {
  id: string
  chunk_name: string
  file_path: string
  macro: string
  micro?: string
  chunk_type: string
  doc_confidence: string
  similarity: number | null
  match_type: 'semantic' | 'text'
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of a CIL search result returned by the code intelligence search API.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SearchResult:interface"]







// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CHUNK_TYPE_COLORS:constant" type="constant" identity="CHUNK_TYPE_COLORS" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Maps chunk type names to Tailwind CSS color class strings used in result badges."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide visual styling classes for chunk type badges in search results."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="chunk_type: string" outputs="Tailwind class string" errors="unknown type falls back to config style" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of style classes keyed by chunk type for consistent badge rendering." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const CHUNK_TYPE_COLORS: Record<string, string> = {
  function:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  class:     'bg-violet-100 text-violet-700 border-violet-200',
  interface: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  type:      'bg-cyan-100 text-cyan-700 border-cyan-200',
  component: 'bg-amber-100 text-amber-700 border-amber-200',
  hook:      'bg-pink-100 text-pink-700 border-pink-200',
  route:     'bg-red-100 text-red-700 border-red-200',
  config:    'bg-slate-100 text-slate-700 border-slate-200',
}
// CIL[DOC-VECTOR type="context" content="purpose='Maps chunk type names to Tailwind CSS color class strings used in result badges.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CHUNK_TYPE_COLORS:constant"]









// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DOC_CONFIDENCE_LABEL:constant" type="constant" identity="DOC_CONFIDENCE_LABEL" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Maps documentation confidence levels to badge labels and Tailwind CSS classes."]
// CIL[DOC-RESPONSIBILITY responsibility="Render confidence badges in search result cards."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="doc_confidence: string" outputs="{ label: string; className: string }" errors="unknown key falls back to unverified_legacy style" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of display labels and styling classes for each documentation confidence tier." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const DOC_CONFIDENCE_LABEL: Record<string, { label: string; className: string }> = {
  human_verified: { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200' },
  ai_generated:   { label: 'AI Docs',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  unverified_legacy: { label: 'No Docs', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}
// CIL[DOC-VECTOR type="context" content="purpose='Maps documentation confidence levels to badge labels and Tailwind CSS classes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DOC_CONFIDENCE_LABEL:constant"]






// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SimilarityBar:component" type="component" identity="SimilarityBar" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Render a small progress bar showing the semantic search similarity score percentage."]
// CIL[DOC-RESPONSIBILITY responsibility="Display a visual percentage bar for a single result score."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="score: number | null" outputs="JSX progress bar or null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts score to percentage and renders a fixed-width bar with an inline numeric label." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function SimilarityBar({ score }: { score: number | null }) {
  if (score === null) return null
  const pct = Math.round(score * 100)
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a small progress bar showing the semantic search similarity score percentage.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SimilarityBar:component"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ResultCard:component" type="component" identity="ResultCard" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Display a single CIL search result as a clickable card with metadata and similarity score."]
// CIL[DOC-RESPONSIBILITY responsibility="Render chunk name, type, confidence, file path, macro preview, and link to chunk detail."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="result: SearchResult, projectId: string" outputs="JSX clickable card" errors="none" side_effects="navigates on click to chunk detail"]
// CIL[DOC-MICRO logic_summary="Builds an app path, selects style classes, and returns a Card linking to the chunk detail view." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function ResultCard({ result, projectId }: { result: SearchResult; projectId: string }) {


  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)




  const typeClass = CHUNK_TYPE_COLORS[result.chunk_type] || CHUNK_TYPE_COLORS.config





  const docCfg = DOC_CONFIDENCE_LABEL[result.doc_confidence] || DOC_CONFIDENCE_LABEL.unverified_legacy


  return (
    <a
      href={appPath(`/cil/${projectId}/chunks/${result.id}`)}
      className="block group"
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer group-hover:border-indigo-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-3">
            <Code2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold text-sm group-hover:text-indigo-600 transition-colors">
                  {result.chunk_name}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${typeClass}`}>
                  {result.chunk_type}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${docCfg.className}`}>
                  {docCfg.label}
                </span>
                {result.match_type === 'semantic' && (
                  <span className="flex items-center gap-0.5 text-xs text-indigo-500">
                    <Zap className="h-3 w-3" /> semantic
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <FileCode2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{result.file_path}</span>
              </div>
              {result.macro && (
                <p className="text-xs text-muted-foreground line-clamp-2">{result.macro}</p>
              )}
            </div>
            <SimilarityBar score={result.similarity} />
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Display a single CIL search result as a clickable card with metadata and similarity score.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ResultCard:component"]









// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SortBy:type" type="type" identity="SortBy" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Declare union types for search result sorting, type filtering, and documentation confidence filtering."]
// CIL[DOC-RESPONSIBILITY responsibility="Constrain filter and sort state values to allowed string literals."]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="SortBy, ChunkTypeFilter, DocConfidenceFilter type aliases" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines union type literals for sort keys, chunk type and documentation confidence filters." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

type SortBy = 'relevance' | 'name' | 'file' | 'doc_confidence'
type ChunkTypeFilter = 'all' | 'function' | 'class' | 'interface' | 'type' | 'component' | 'hook' | 'route' | 'config'
type DocConfidenceFilter = 'all' | 'human_verified' | 'ai_generated' | 'unverified_legacy'
// CIL[DOC-VECTOR type="context" content="purpose='Declare union types for search result sorting, type filtering, and documentation confidence filtering.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SortBy:type"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CILSearchPage:component" type="component" identity="CILSearchPage" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-MACRO purpose="Render the full CIL chunk search page with query controls, filters, and result list."]
// CIL[DOC-RESPONSIBILITY responsibility="Manage search state, fetch results, apply client-side filters and sorting, and render the UI."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSearchPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX search page" errors="Sets error state on API failure" side_effects="Calls /api/cil-graph search endpoint"]
// CIL[DOC-MICRO logic_summary="Maintains query, project, mode, filters and sort state; performs apiFetch to /api/cil-graph; filters and sorts results; renders suggestions and result cards." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export default function CILSearchPage() {
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [query, setQuery] = useState('')
  const [projectId, setProjectId] = useState('')
  const [mode, setMode] = useState<'hybrid' | 'semantic' | 'text'>('hybrid')
  const [limit, setLimit] = useState('20')
  const [chunkTypeFilter, setChunkTypeFilter] = useState<ChunkTypeFilter>('all')
  const [docConfidenceFilter, setDocConfidenceFilter] = useState<DocConfidenceFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const params = new URLSearchParams({
        action: 'search',
        q: query.trim(),
        mode,
        limit,
      })
      if (projectId) params.set('project_id', projectId)

      const res = await apiFetch(`/api/cil-graph?${params.toString()}`)
      const data = await res.json()
      setResults(data?.results || data?.data?.results || [])
    } catch (err) {
      setError(String(err))
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  
  const displayResults = useMemo(() => {
    let r = [...results]
    if (chunkTypeFilter !== 'all') r = r.filter(x => x.chunk_type === chunkTypeFilter)
    if (docConfidenceFilter !== 'all') r = r.filter(x => x.doc_confidence === docConfidenceFilter)
    if (sortBy === 'name') r.sort((a, b) => a.chunk_name.localeCompare(b.chunk_name))
    else if (sortBy === 'file') r.sort((a, b) => a.file_path.localeCompare(b.file_path))
    else if (sortBy === 'doc_confidence') {
      const order: Record<string, number> = { human_verified: 0, ai_generated: 1, unverified_legacy: 2 }
      r.sort((a, b) => (order[a.doc_confidence] ?? 3) - (order[b.doc_confidence] ?? 3))
    }
    
    return r
  }, [results, chunkTypeFilter, docConfidenceFilter, sortBy])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href={appPath('/cil')} className="hover:underline">Code Intelligence</a>
        <ChevronRight className="h-3 w-3" />
        <span>Search</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-indigo-500" />
          Chunk Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semantic + text search across all indexed code chunks
        </p>
      </div>

      <PageInstructions
        description="Search the Code Intelligence Layer index by meaning or text."
        sections={[
          { title: 'What this page is for', content: 'This page lets you find indexed code chunks across projects using hybrid, semantic, or text search.' },
          { title: 'How to use this page', content: 'Enter a query, choose a mode, and click the search button or press Enter. Use the Project ID, Type, Docs, and Sort filters to narrow results.' },
          { title: 'How to read the results', content: 'Each result shows the chunk name, file, type, documentation confidence, and a relevance score. Semantic mode ranks by vector similarity; text mode matches literal terms.' },
          { title: 'Important notes', content: 'Hybrid mode combines vector and text ranking. Filters can exclude results, and the count line indicates how many of the total results are displayed after filtering.' },
        ]}
      />

      {}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Describe what you're looking for, e.g. 'authenticate user and check roles'"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <Select value={mode} onValueChange={v => setMode(v as typeof mode)}>
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Project ID</Label>
            <Input
              placeholder="(all projects)"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="h-7 w-48 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Limit</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={chunkTypeFilter} onValueChange={v => setChunkTypeFilter(v as ChunkTypeFilter)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="function">Function</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="interface">Interface</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="component">Component</SelectItem>
                <SelectItem value="hook">Hook</SelectItem>
                <SelectItem value="route">Route</SelectItem>
                <SelectItem value="config">Config</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Docs</Label>
            <Select value={docConfidenceFilter} onValueChange={v => setDocConfidenceFilter(v as DocConfidenceFilter)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All docs</SelectItem>
                <SelectItem value="human_verified">Verified</SelectItem>
                <SelectItem value="ai_generated">AI Docs</SelectItem>
                <SelectItem value="unverified_legacy">No Docs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Sort</Label>
            <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="file">File A–Z</SelectItem>
                <SelectItem value="doc_confidence">Doc quality</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(chunkTypeFilter !== 'all' || docConfidenceFilter !== 'all' || sortBy !== 'relevance') && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              onClick={() => { setChunkTypeFilter('all'); setDocConfidenceFilter('all'); setSortBy('relevance') }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {searched && !loading && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {displayResults.length === 0
                ? (results.length > 0 ? `0 of ${results.length} results match filters` : 'No results found')
                : `${displayResults.length}${displayResults.length !== results.length ? ` of ${results.length}` : ''} result${displayResults.length !== 1 ? 's' : ''}`}
              {results.length > 0 && mode !== 'text' && (
                <span className="ml-2 text-xs text-indigo-500 inline-flex items-center gap-0.5">
                  <Zap className="h-3 w-3" /> semantic ranking active
                </span>
              )}
            </p>
            {results.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => { setResults([]); setSearched(false); setQuery(''); inputRef.current?.focus() }}
              >
                Clear
              </Button>
            )}
          </div>

          {displayResults.length === 0 && (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Search className="h-10 w-10 mx-auto opacity-20" />
              <p className="text-sm">No chunks match your query.</p>
              {mode === 'semantic' && (
                <p className="text-xs">Try switching to Hybrid mode to also search chunk names.</p>
              )}
              {mode !== 'semantic' && (
                <p className="text-xs">Try a different query or run Pass 3 to generate embeddings first.</p>
              )}
            </div>
          )}

          {displayResults.map(result => (
            <ResultCard key={result.id} result={result} projectId={projectId || result.id} />
          ))}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 text-muted-foreground space-y-3">
          <Search className="h-12 w-12 mx-auto opacity-15" />
          <p className="text-sm">Search across all code chunks by purpose, inputs, or behaviour</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'handle authentication middleware',
              'send email notification',
              'validate JWT token',
              'write embeddings to database',
              'resolve type ID by slug',
            ].map(suggestion => (
              <button
                key={suggestion}
                className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                onClick={() => { setQuery(suggestion); setTimeout(handleSearch, 10) }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the full CIL chunk search page with query controls, filters, and result list.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CILSearchPage:component"]
