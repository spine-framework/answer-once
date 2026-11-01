// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
/**
 * @module   CILSearchPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * CILSearchPage is a React component that facilitates searching within the CIL (Common Intermediate Language) context in the admin panel. It integrates various UI components to provide a user-friendly interface for inputting search criteria and displaying results.
 * INVARIANT: The component relies on the correct configuration of API endpoints for fetching data.
 *
 * @seeAlso apiFetch (used for making API calls).
 * @seeAlso PageInstructions (provides contextual guidance for users).
 *
 * @cil-generated
 */










import { useState, useRef, useMemo, useEffect } from 'react'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:module_header:module_header"]
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





















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SearchResult:interface" type="interface" identity="SearchResult" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
/**
 * The SearchResult interface defines the structure of search results returned from a search operation, encapsulating essential metadata about each result. It exists to standardize the representation of search results across the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SearchResult:interface"]

























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CHUNK_TYPE_COLORS:constant" type="constant" identity="CHUNK_TYPE_COLORS" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
/**
 * CHUNK_TYPE_COLORS is a constant that maps various chunk types to their corresponding CSS class strings for styling purposes. It provides a centralized way to manage the visual representation of different code elements in the admin interface.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CHUNK_TYPE_COLORS:constant"]



























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DOC_CONFIDENCE_LABEL:constant" type="constant" identity="DOC_CONFIDENCE_LABEL" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
/**
 * DOC_CONFIDENCE_LABEL is a constant that maps document confidence statuses to their corresponding labels and CSS class names for styling. It provides a standardized way to display the confidence level of documents in the user interface.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const DOC_CONFIDENCE_LABEL: Record<string, { label: string; className: string }> = {
  human_verified: { label: 'Verified', className: 'bg-green-100 text-green-700 border-green-200' },
  ai_generated:   { label: 'AI Docs',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  unverified_legacy: { label: 'No Docs', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DOC_CONFIDENCE_LABEL:constant"]
























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SimilarityBar:component" type="component" identity="SimilarityBar" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
/**
 * The SimilarityBar component visually represents a similarity score as a percentage bar, enhancing user experience in the CIL search page. It provides a quick visual indication of similarity.
 *
 * @macro       UI component for displaying similarity scores.
 * @micro       Calculates the percentage from a score and renders a progress bar accordingly.
 * @inputSpec
 *   score: number | null — the similarity score to be displayed, or null to indicate no score.
 * @outputSpec  JSX.Element | null — returns a visual representation of the score or null if the score is null.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SimilarityBar:component"]

















function ResultCard({ result, projectId }: { result: SearchResult; projectId: string }) {



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:appPath:function" type="function" identity="appPath" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ResultCard:component"]
/**
 * The appPath function constructs a complete application path by appending a given path to a base URL. It ensures that the resulting path is correctly formatted with a leading slash if necessary.
 *
 * @inputSpec
 *   path: string (required) — the path to append to the base URL.
 * @outputSpec  string — the complete application path.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:appPath:function"]






// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:typeClass:constant" type="constant" identity="typeClass" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ResultCard:component"]
/**
 * The constant 'typeClass' determines the color associated with a specific chunk type from the CHUNK_TYPE_COLORS mapping. It provides a default color for configuration chunks when the result's chunk type is not found in the mapping.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
  const typeClass = CHUNK_TYPE_COLORS[result.chunk_type] || CHUNK_TYPE_COLORS.config
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:typeClass:constant"]







// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:docCfg:constant" type="constant" identity="docCfg" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ResultCard:component"]
/**
 * The constant 'docCfg' retrieves the configuration for document confidence based on the result's confidence level, providing a fallback to an unverified legacy label if the confidence level is not defined.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
  const docCfg = DOC_CONFIDENCE_LABEL[result.doc_confidence] || DOC_CONFIDENCE_LABEL.unverified_legacy
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:docCfg:constant"]



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

























// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SortBy:type" type="type" identity="SortBy" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
type SortBy = 'relevance' | 'name' | 'file' | 'doc_confidence'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:SortBy:type"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ChunkTypeFilter:type" type="type" identity="ChunkTypeFilter" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
type ChunkTypeFilter = 'all' | 'function' | 'class' | 'interface' | 'type' | 'component' | 'hook' | 'route' | 'config'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:ChunkTypeFilter:type"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DocConfidenceFilter:type" type="type" identity="DocConfidenceFilter" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
type DocConfidenceFilter = 'all' | 'human_verified' | 'ai_generated' | 'unverified_legacy'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:DocConfidenceFilter:type"]

















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CILSearchPage:component" type="component" identity="CILSearchPage" parent="~/.framework/src/pages/admin/cil/CILSearchPage.tsx"]
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
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch('/api/cil-project?action=list')
      .then(r => r.json())
      .then(data => setProjects(data?.projects || []))
      .catch(() => {})
  }, [])

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
            <Label className="text-xs text-muted-foreground">Project</Label>
            <Select value={projectId || 'all'} onValueChange={v => setProjectId(v === 'all' ? '' : v)}>
              <SelectTrigger className="h-7 w-48 text-xs">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title || p.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSearchPage.tsx:CILSearchPage:component"]







