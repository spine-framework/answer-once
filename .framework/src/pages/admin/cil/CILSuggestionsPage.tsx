// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for reviewing and managing CIL redesign suggestions"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders the CIL suggestions management UI and orchestrates suggestion CRUD actions"]
// CIL[DOC-CONTEXT module="admin/cil" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Rendered admin page for CIL suggestions" errors="Network/API failures are caught and ignored" side_effects="Fetches and mutates cil_suggestion records via /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Imports dependencies, defines local state and handlers, renders a suggestion list and creation form" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin"]

import { useEffect, useState } from 'react'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import { Textarea } from '@core/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@core/components/ui/native-select'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:module_header:module_header"]
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@core/components/ui/table'
import { Lightbulb, Plus } from 'lucide-react'


// CIL[DOC-VECTOR type="context" content="purpose='Admin page for reviewing and managing CIL redesign suggestions'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Project ID for the CIL redesign scope used to filter suggestions"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a constant project identifier for runtime record queries"]
// CIL[DOC-CONTEXT module="admin/cil" layer="constant" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="PROJECT_ID string" errors="N/A" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Declares the UUID string for the CIL redesign project" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:PROJECT_ID:constant" type="constant" identity="PROJECT_ID" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
const PROJECT_ID = '24d2bb67-24be-4cdf-a633-108588d37f00'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:PROJECT_ID:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Project ID for the CIL redesign scope used to filter suggestions'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Allowed suggestion type values for the creation form"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the selectable suggestion categories"]
// CIL[DOC-CONTEXT module="admin/cil" layer="constant" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="SUGGESTION_TYPES string array" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Lists valid suggestion types: refactor, add_doc, rename, remove, other" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:SUGGESTION_TYPES:constant" type="constant" identity="SUGGESTION_TYPES" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
const SUGGESTION_TYPES = ['refactor', 'add_doc', 'rename', 'remove', 'other']
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:SUGGESTION_TYPES:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Allowed suggestion type values for the creation form'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]



// CIL[DOC-MACRO purpose="TypeScript type for a CIL suggestion record returned from the API"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of cil_suggestion items"]
// CIL[DOC-CONTEXT module="admin/cil" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Typed CILSuggestion shape for consumers" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Defines id, title, nested data fields, and created_at" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:CILSuggestion:interface" type="interface" identity="CILSuggestion" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
interface CILSuggestion {
  id: string
  title: string
  data: {
    project_id?: string
    suggestion_type?: string
    content?: string
    target_stable_id?: string
    status?: string
    confidence?: number
    proposed_by?: string
  }
  created_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:CILSuggestion:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript type for a CIL suggestion record returned from the API'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[DOC-MACRO purpose="Badge variant mapping for suggestion status values"]
// CIL[DOC-RESPONSIBILITY responsibility="Maps suggestion status strings to shadcn Badge variants"]
// CIL[DOC-CONTEXT module="admin/cil" layer="constant" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="status string" outputs="Badge variant key" errors="Unknown statuses fall back to secondary" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Record mapping accepted/default, proposed/secondary, rejected/destructive" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:STATUS_VARIANT:constant" type="constant" identity="STATUS_VARIANT" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  accepted: 'default',
  proposed: 'secondary',
  rejected: 'destructive',
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:STATUS_VARIANT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Badge variant mapping for suggestion status values'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]







// CIL[DOC-MACRO purpose="Renders the CIL suggestions management page and handles creation/accept/reject"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches, filters, displays, and updates CIL suggestions for the redesign project"]
// CIL[DOC-CONTEXT module="admin/cil" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/native-select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="None (route page)" outputs="JSX for CIL Suggestions admin page" errors="API call failures are swallowed and fall back to empty list" side_effects="Reads and writes cil_suggestion items via /api/admin-data; updates local React state"]
// CIL[DOC-MICRO logic_summary="Loads suggestions, provides form handlers, renders table with accept/reject and create form" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:CILSuggestionsPage:component" type="component" identity="CILSuggestionsPage" parent="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx"]
export default function CILSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<CILSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    content: '',
    suggestion_type: SUGGESTION_TYPES[0],
    target_stable_id: '',
  })

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(
        `/api/admin-data?action=list&entity=items&type_slug=cil_suggestion&limit=500`
      )
      const data = await res.json().catch(() => ({}))
      const items: CILSuggestion[] = data?.data || data?.items || []
      setSuggestions(items.filter(s => s.data?.project_id === PROJECT_ID))
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuggestions() }, [])

  const updateSuggestionStatus = async (id: string, status: string) => {
    setActing(id)
    try {
      await apiFetch(`/api/admin-data?action=update&entity=items&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'cil_suggestion',
          data: { status },
        }),
      })
    } catch {
      // silent
    } finally {
      setActing(null)
      fetchSuggestions()
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setCreating(true)
    try {
      await apiFetch('/api/admin-data?action=create&entity=items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'cil_suggestion',
          title: `${form.suggestion_type}: ${form.target_stable_id || 'general'}`,
          data: {
            project_id: PROJECT_ID,
            suggestion_type: form.suggestion_type,
            content: form.content.trim(),
            target_stable_id: form.target_stable_id.trim() || null,
            status: 'proposed',
            confidence: 0.5,
            proposed_by: 'admin',
          },
        }),
      })
      setForm({ content: '', suggestion_type: SUGGESTION_TYPES[0], target_stable_id: '' })
      fetchSuggestions()
    } catch {
      // silent
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            CIL Suggestions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review, accept, reject, and create suggestions for the CIL redesign project.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="suggestion_type" className="text-sm">Suggestion Type</Label>
                <NativeSelect
                  id="suggestion_type"
                  value={form.suggestion_type}
                  onChange={e => setForm({ ...form, suggestion_type: e.target.value })}
                  className="w-full"
                >
                  {SUGGESTION_TYPES.map(t => (
                    <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="target_stable_id" className="text-sm">Target Stable ID</Label>
                <Input
                  id="target_stable_id"
                  value={form.target_stable_id}
                  onChange={e => setForm({ ...form, target_stable_id: e.target.value })}
                  placeholder="stable_id"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating || !form.content.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="content" className="text-sm">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Describe the suggestion..."
                rows={3}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No suggestions found for this project.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Proposed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map(s => {




                  const status = s.data?.status || 'proposed'

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="outline">{s.data?.suggestion_type || '—'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={s.data?.content}>
                        {s.data?.content || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.data?.target_stable_id || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[status] || 'secondary'}>{status}</Badge>
                      </TableCell>
                      <TableCell>{(s.data?.confidence ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{s.data?.proposed_by || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acting === s.id}
                            onClick={() => updateSuggestionStatus(s.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={acting === s.id}
                            onClick={() => updateSuggestionStatus(s.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILSuggestionsPage.tsx:CILSuggestionsPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Renders the CIL suggestions management page and handles creation/accept/reject'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
