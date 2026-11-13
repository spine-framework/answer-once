
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

