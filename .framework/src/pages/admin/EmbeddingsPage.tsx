// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/EmbeddingsPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for inspecting public.embeddings records"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares this file as an admin list page for public.embeddings vector records"]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module scope" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Top-level file scope for the Embeddings admin page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers, admin ui maintainers"]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { PageInstructions } from '../../components/admin/PageInstructions'


// CIL[DOC-VECTOR type="context" content="purpose='Admin page for inspecting public.embeddings records'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:EmbeddingRecord:interface" type="interface" identity="EmbeddingRecord" parent="~/.framework/src/pages/admin/EmbeddingsPage.tsx"]
// CIL[DOC-MACRO purpose="TypeScript type for a public.embeddings row"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed shape of an embedding record"]
// CIL[DOC-CONTEXT module="admin" layer="types" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/EmbeddingsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="EmbeddingRecord interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Structured contract describing an embedding vector row" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface EmbeddingRecord {
  id: string
  account_id: string
  model_id: string
  document_id: string
  chunk_index: number
  content: string
  embedding: number[]
  metadata: Record<string, any> | null
  approved_at: string | null
  revoked_at: string | null
  content_hash: string
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript type for a public.embeddings row'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:EmbeddingRecord:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:EmbeddingsPage:component" type="component" identity="EmbeddingsPage" parent="~/.framework/src/pages/admin/EmbeddingsPage.tsx"]
// CIL[DOC-MACRO purpose="Render the admin embeddings list page with search, sorting, and status indicators"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display public.embeddings records; handle search, sort, and navigation to the detail view"]
// CIL[DOC-CONTEXT module="admin" layer="component" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/EmbeddingsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX admin list" errors="throws on fetch failure" side_effects="navigates to /spine-framework/admin/kb/embeddings/:id on row click; calls /api/embeddings?method=GET&action=list over the network"]
// CIL[DOC-MICRO logic_summary="Fetch records, filter by content/document/model, sort by selected key/direction, compute status badges, and render a table with PageInstructions" notable_decisions="['Searches content, document_id, and model_id via lowercase substring', 'Sort supports string and number fields', 'Status derived from revoked_at and approved_at', 'Row click navigates to the detail view']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function EmbeddingsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: records, loading, error, refetch } = useApi<EmbeddingRecord[]>(
    async () => {
      const response = await apiFetch('/api/embeddings?method=GET&action=list')
      if (!response.ok) throw new Error('Failed to fetch embeddings')
      const result = await response.json()
      return (result.data || result) as EmbeddingRecord[]
    },
    { immediate: true }
  )

  const filteredRecords = (records || []).filter((record) => {
    const term = searchTerm.toLowerCase()
    return (
      (record.content?.toLowerCase().includes(term) || false) ||
      (record.document_id?.toLowerCase().includes(term) || false) ||
      (record.model_id?.toLowerCase().includes(term) || false)
    )
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue: any = a[sortKey as keyof EmbeddingRecord]
    const bValue: any = b[sortKey as keyof EmbeddingRecord]

    if (aValue == null || bValue == null) return 0
    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    if (typeof aValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }
    return 0
  })

  const getStatus = (record: EmbeddingRecord) => {
    if (record.revoked_at) return { label: 'Revoked', color: 'bg-red-100 text-red-700' }
    if (record.approved_at) return { label: 'Approved', color: 'bg-green-100 text-green-700' }
    return { label: 'Pending', color: 'bg-slate-100 text-slate-600' }
  }

  const statsCards = [
    {
      title: 'Total Records',
      value: (records || []).length,
      icon: FileText,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Approved',
      value: (records || []).filter(r => r.approved_at && !r.revoked_at).length,
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    {
      title: 'Revoked',
      value: (records || []).filter(r => r.revoked_at).length,
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  ]

  return (
    <AdminListPage
      title="Embeddings"
      description="Inspect runtime vector records from the public.embeddings table"
      noPageInstructions
      statsCards={statsCards}
      searchPlaceholder="Search by content, document, or model..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyMessage="No embedding records found"
      emptyIcon={AlertCircle}
    >
      <PageInstructions
        title="About the embeddings table"
        description="These are runtime vector records stored in public.embeddings. Each record is a chunk of content with its embedding, model, document, and lifecycle metadata. This page is read-only."
        sections={[
          {
            title: 'Columns',
            content: 'Model ID, Document ID, chunk index, truncated content, approval status, content hash, and creation time.'
          },
          {
            title: 'Searching',
            content: 'Use the search field to filter by content text, document_id, or model_id.'
          },
          {
            title: 'Drilling down',
            content: 'Click any row to view the full record, including the full content, metadata JSON, and embedding vector.'
          }
        ]}
      />

      {sortedRecords.length === 0 ? (
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No embedding records found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Model ID"
                sortKey="model_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Document ID"
                sortKey="document_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Chunk Index"
                sortKey="chunk_index"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <SortableTableHeader
                title="Content Hash"
                sortKey="content_hash"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Created"
                sortKey="created_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedRecords.map((record) => {
              const status = getStatus(record)
              return (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/spine-framework/admin/kb/embeddings/${record.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.model_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.document_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{record.chunk_index}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    <div className="truncate">
                      {record.content?.slice(0, 80)}{record.content && record.content.length > 80 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">{record.content_hash}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDateTime(record.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </AdminListPage>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the admin embeddings list page with search, sorting, and status indicators'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingsPage.tsx:EmbeddingsPage:component"]
