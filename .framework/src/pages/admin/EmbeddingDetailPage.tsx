// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for viewing a single embedding record and its vector."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides React imports, type definitions, and the EmbeddingDetailPage component for the admin knowledge base."]
// CIL[DOC-CONTEXT module="admin/kb/embeddings" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="EmbeddingDetailPage component and EmbeddingRecord interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module header imports dependencies for the embedding detail page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible'
import { ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'


// CIL[DOC-VECTOR type="context" content="purpose='Admin page for viewing a single embedding record and its vector.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:EmbeddingRecord:interface" type="interface" identity="EmbeddingRecord" parent="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx"]
// CIL[DOC-MACRO purpose="TypeScript interface describing a single embedding row."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of public.embeddings records consumed by the detail page."]
// CIL[DOC-CONTEXT module="admin/kb/embeddings" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/EmbeddingDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="database embedding row fields" outputs="EmbeddingRecord interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="EmbeddingRecord fields: id, account_id, model_id, document_id, chunk_index, content, embedding array, metadata, lifecycle timestamps, content hash, created/updated." notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing a single embedding row.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:EmbeddingRecord:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:EmbeddingDetailPage:component" type="component" identity="EmbeddingDetailPage" parent="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Render a read-only admin detail page for a single embedding record."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch embedding by id, display metadata, status, content, metadata JSON, and the stored vector, with loading, error, and missing-id states."]
// CIL[DOC-CONTEXT module="admin/kb/embeddings" layer="presentation" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/EmbeddingDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="React Router id parameter" outputs="JSX detail page" errors="Fetch errors, missing or invalid id" side_effects="navigates on user actions; triggers embedding fetch via useApi"]
// CIL[DOC-MICRO logic_summary="Conditionally renders not-found, loading, error, and record views; computes status from revoked_at/approved_at; exposes a collapsible vector section." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function EmbeddingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showVector, setShowVector] = useState(false)

  const { data: record, loading, error, refetch } = useApi<EmbeddingRecord>(
    async () => {
      const response = await apiFetch(`/api/embeddings?method=GET&action=get&id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch embedding record')
      const result = await response.json()
      return (result.data || result) as EmbeddingRecord
    },
    { immediate: !!id && id !== 'new' }
  )

  if (!id || id === 'new') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <h1 className="mt-4 text-lg font-medium">Not Found</h1>
            <p className="text-sm text-slate-500 mt-2">No embedding ID was provided.</p>
            <Button className="mt-4" onClick={() => navigate('/spine-framework/admin/kb/embeddings')}>
              Back to Embeddings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" className="ml-2" onClick={() => navigate('/spine-framework/admin/kb/embeddings')}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <h1 className="mt-4 text-lg font-medium">Record not found</h1>
            <Button className="mt-4" onClick={() => navigate('/spine-framework/admin/kb/embeddings')}>
              Back to Embeddings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }





  const status = record.revoked_at
    ? { label: 'Revoked', color: 'bg-red-100 text-red-700' }
    : record.approved_at
    ? { label: 'Approved', color: 'bg-green-100 text-green-700' }
    : { label: 'Pending', color: 'bg-slate-100 text-slate-600' }


  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Embedding Record</h1>
          <p className="text-sm text-muted-foreground">{record.id}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/spine-framework/admin/kb/embeddings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <PageInstructions
        title="Embedding record inspector"
        description="Read-only view of a single public.embeddings row. It shows the model, document, chunk index, content, content hash, lifecycle timestamps, metadata JSON, and the stored 1536-dimensional embedding vector."
        sections={[
          {
            title: 'Lifecycle',
            content: 'approved_at marks when the chunk was accepted for use; revoked_at marks when it was removed. A record without approved_at is still pending.'
          },
          {
            title: 'Vector',
            content: 'The embedding array is hidden by default; expand the section to inspect all 1536 numeric values.'
          }

        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Model ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900 break-all">{record.model_id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Document ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900 break-all">{record.document_id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Chunk Index</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900">{record.chunk_index}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Content Hash</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono break-all">{record.content_hash}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Created / Updated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-slate-900">Created: {formatDateTime(record.created_at)}</p>
            <p className="text-sm text-slate-900">Updated: {formatDateTime(record.updated_at)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Approved At</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900">{record.approved_at ? formatDateTime(record.approved_at) : '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Revoked At</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-900">{record.revoked_at ? formatDateTime(record.revoked_at) : '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap break-words max-h-96 overflow-auto rounded bg-slate-50 p-3 text-sm font-mono border border-slate-200">
            {record.content || '—'}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap break-words max-h-80 overflow-auto rounded bg-slate-50 p-3 text-xs font-mono border border-slate-200">
            {JSON.stringify(record.metadata, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <Collapsible open={showVector} onOpenChange={setShowVector}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-6 py-4 h-auto font-medium text-sm text-slate-500 hover:text-slate-900 group"
            >
              <span>Embedding vector ({record.embedding?.length ?? 0} dimensions)</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <pre className="whitespace-pre-wrap break-words max-h-96 overflow-auto rounded bg-slate-50 p-3 text-xs font-mono border border-slate-200">
                {JSON.stringify(record.embedding, null, 2)}
              </pre>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a read-only admin detail page for a single embedding record.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/EmbeddingDetailPage.tsx:EmbeddingDetailPage:component"]

