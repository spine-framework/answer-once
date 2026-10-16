// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-MACRO purpose="Declares module-level imports and dependencies for the CIL versions admin page."]
// CIL[DOC-RESPONSIBILITY responsibility="Import React hooks, shared UI components, icons, and the PageInstructions helper."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="available module imports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Groups all external and internal imports required by CILVersionsPage." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin UI developers"]

import { useEffect, useState } from 'react'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Input } from '@core/components/ui/input'
import { Label } from '@core/components/ui/label'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@core/components/ui/table'
import { GitBranch, Plus } from 'lucide-react'

import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Declares module-level imports and dependencies for the CIL versions admin page.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:project_id:constant" type="constant" identity="project_id" parent="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-MACRO purpose="Provides the fixed CIL redesign project UUID used to filter and create versions."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the project identifier constant referenced by fetch and create operations."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="PROJECT_ID string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Hard-codes the CIL redesign project UUID for record scoping." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const PROJECT_ID = '24d2bb67-24be-4cdf-a633-108588d37f00'
// CIL[DOC-VECTOR type="context" content="purpose='Provides the fixed CIL redesign project UUID used to filter and create versions.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:project_id:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:CILVersion:interface" type="interface" identity="CILVersion" parent="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the TypeScript shape for CIL version records returned by admin-data."]
// CIL[DOC-RESPONSIBILITY responsibility="Type the version object consumed and rendered by CILVersionsPage."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="CILVersion type contract" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the nested data fields and metadata of a CIL version record." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface CILVersion {
  id: string
  title: string
  data: {
    version?: string
    status?: string
    is_iteration?: boolean
    published_version_id?: string | null
    project_id?: string
  }
  created_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the TypeScript shape for CIL version records returned by admin-data.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:CILVersion:interface"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:status_variant:constant" type="constant" identity="status_variant" parent="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-MACRO purpose="Maps CIL version status values to Badge component variants."]
// CIL[DOC-RESPONSIBILITY responsibility="Supply the correct visual variant for active, inactive, and archived version statuses."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="status string" outputs="Badge variant name" errors="unknown status falls back to 'secondary'" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record lookup that maps status to one of the Badge variant options." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  archived: 'outline',
}
// CIL[DOC-VECTOR type="context" content="purpose='Maps CIL version status values to Badge component variants.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:status_variant:constant"]






// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:CILVersionsPage:component" type="component" identity="CILVersionsPage" parent="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-MACRO purpose="Renders and manages CIL project versions: list, create, publish, deactivate, and archive."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch, display, create, and transition CIL version statuses through the admin-data API."]
// CIL[DOC-CONTEXT module="admin/cil" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILVersionsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="silent on network or parse failures" side_effects="GET/POST/PATCH /api/admin-data, React state updates"]
// CIL[DOC-MICRO logic_summary="Uses useState/useEffect; fetches versions filtered by PROJECT_ID; supports creating new versions and transitioning statuses; renders a table of versions with action buttons." notable_decisions="['Status transitions are performed via PATCH with the full status value', 'Unknown statuses render with a secondary Badge variant']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export default function CILVersionsPage() {
  const [versions, setVersions] = useState<CILVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [newVersion, setNewVersion] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(
        `/api/admin-data?action=list&entity=items&type_slug=cil_version&limit=500`
      )
      const data = await res.json().catch(() => ({}))
      const items: CILVersion[] = data?.data || data?.items || []
      setVersions(items.filter(v => v.data?.project_id === PROJECT_ID))
    } catch {
      setVersions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVersions() }, [])

  const updateVersionStatus = async (id: string, status: string) => {
    setActing(id)
    try {
      await apiFetch(`/api/admin-data?action=update&entity=items&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'cil_version',
          data: { status },
        }),
      })
    } catch {
      // silent
    } finally {
      setActing(null)
      fetchVersions()
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVersion.trim()) return
    setCreating(true)
    try {
      await apiFetch('/api/admin-data?action=create&entity=items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'cil_version',
          title: newVersion.trim(),
          data: {
            project_id: PROJECT_ID,
            version: newVersion.trim(),
            status: 'inactive',
            is_iteration: false,
            published_version_id: null,
          },
        }),
      })
      setNewVersion('')
      fetchVersions()
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
            <GitBranch className="h-6 w-6 text-indigo-500" />
            CIL Versions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage published, inactive, and archived versions for the CIL redesign project.
          </p>
        </div>
      </div>

      <PageInstructions
        description="Create and manage CIL project versions."
        sections={[
          { title: 'What this page is for', content: 'Versions represent distinct snapshots or iterations of a CIL project. Use this page to publish, deactivate, and archive versions.' },
          { title: 'How to create a version', content: 'Enter a version string (e.g., 1.0.0) and click Create.' },
          { title: 'Actions', content: 'Publish makes an inactive version active. Deactivate sets a version back to inactive. Archive marks it as archived.' },
        ]}
      />

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <Label htmlFor="version" className="text-sm">New version</Label>
              <Input
                id="version"
                value={newVersion}
                onChange={e => setNewVersion(e.target.value)}
                placeholder="e.g. 1.0.0"
                disabled={creating}
              />
            </div>
            <Button type="submit" disabled={creating || !newVersion.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No versions found for this project.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Is Iteration</TableHead>
                  <TableHead>Published Version ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map(v => {




                  const status = v.data?.status || 'inactive'

                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.data?.version || v.title}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[status] || 'secondary'}>{status}</Badge>
                      </TableCell>
                      <TableCell>{v.data?.is_iteration ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="font-mono text-xs">{v.data?.published_version_id || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {v.created_at ? new Date(v.created_at).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {status === 'inactive' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={acting === v.id}
                              onClick={() => updateVersionStatus(v.id, 'active')}
                            >
                              Publish
                            </Button>
                          )}
                          {status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={acting === v.id}
                              onClick={() => updateVersionStatus(v.id, 'inactive')}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={acting === v.id}
                            onClick={() => updateVersionStatus(v.id, 'archived')}
                          >
                            Archive
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders and manages CIL project versions: list, create, publish, deactivate, and archive.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILVersionsPage.tsx:CILVersionsPage:component"]



