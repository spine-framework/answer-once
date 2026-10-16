// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/RoleDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Provides module-level imports and context for the admin role detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Load React, routing, UI primitives, hooks, and utilities used by RoleDetailPage."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies for the role detail page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-frontend"]

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Provides module-level imports and context for the admin role detail page.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:Role:interface" type="interface" identity="Role" parent="~/.framework/src/pages/admin/RoleDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the TypeScript shape of a Role record used in the admin UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a typed contract for role data, permissions, and metadata."]
// CIL[DOC-CONTEXT module="admin" layer="domain" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/RoleDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Role type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the Role interface fields consumed by the detail page and API." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Role {
  id: string
  name: string
  slug: string
  description?: string
  permissions?: Record<string, any>
  is_system: boolean
  is_active: boolean
  app_id?: string
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the TypeScript shape of a Role record used in the admin UI.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:Role:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:RoleDetailPage:component" type="component" identity="RoleDetailPage" parent="~/.framework/src/pages/admin/RoleDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Renders a create/edit form for admin roles and their permissions."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch role data, manage form state, validate permissions JSON, submit to the API, and render the admin UI."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/RoleDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="URL id parameter ('new' or existing role), role data from /api/roles, user input" outputs="Rendered role form, navigation after save" errors="fetchError, save error, invalid permissions JSON" side_effects="Calls /api/roles (POST or PATCH) and navigates on success"]
// CIL[DOC-MICRO logic_summary="Initializes form from fetched role, parses permissions JSON, handles create/update submission, and renders instructions, alerts, and fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_system: false,
    is_active: true,
    permissions: {}
  })
  const [permissionsJson, setPermissionsJson] = useState('{}')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: role, loading, error: fetchError } = useApi<Role>(
    async () => {
      if (isCreateMode) return null
      const response = await apiFetch(`/api/roles?action=get&id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch role')
      const result = await response.json()
      return result.data
    },
    { immediate: !isCreateMode }
  )

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        slug: role.slug || '',
        description: role.description || '',
        is_system: role.is_system || false,
        is_active: role.is_active !== false,
        permissions: role.permissions || {}
      })
      setPermissionsJson(JSON.stringify(role.permissions || {}, null, 2))
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let parsedPermissions
      try {
        parsedPermissions = JSON.parse(permissionsJson)
      } catch (e) {
        throw new Error('Invalid JSON in permissions field')
      }

      const payload = {
        ...formData,
        permissions: parsedPermissions
      }

      const url = isCreateMode ? '/api/roles' : `/api/roles?id=${id}`
      const method = isCreateMode ? 'POST' : 'PATCH'

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save role')
      }

      const result = await response.json()
      navigate(`/spine-framework/admin/configs/roles/${result.id || id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to save role')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load role</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isCreateMode ? 'Create Role' : role?.name || 'Role Detail'}
        </h1>
      </div>

      <PageInstructions
        description="Define a role and set its permissions and metadata."
        sections={[
          { title: 'What this role controls', content: 'A role is a named permission set assigned to people. It controls which record types a person can create, read, update, delete, or admin, and whether the role can be assigned in the first place.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string, required. The display label such as Sales Manager. Empty name blocks save.</li>
            <li><strong>Slug</strong> — string, required. A unique URL-friendly identifier. Disabled after creation because permissions and references depend on it.</li>
            <li><strong>Description</strong> — string. Optional context for other admins.</li>
            <li><strong>System Role</strong> — checkbox, create-only. Marks a reserved role that cannot be deleted and is protected for core functions.</li>
            <li><strong>Active</strong> — checkbox. Inactive roles cannot be assigned to people.</li>
            <li><strong>Permissions (JSON)</strong> — JSON. Maps type slugs to arrays of allowed actions. Invalid JSON or wrong shape will cause save to fail.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Actions per type</strong>: typical values are create, read, update, delete, and admin. Use the array format with a type slug mapped to an array: type_slug: ["read", "write"].</li>
            <li><strong>System Role</strong>: can only be set during creation and prevents deletion later.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>People assigned to this role receive the effective permissions immediately after the role is saved.</li>
            <li>The admin-data API and runtime record UIs evaluate the role permissions for every create, read, update, and delete request.</li>
            <li>Missing or malformed permissions can lock people out of records or grant unintended access.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, enter Name and Slug, then set Active and optionally System. Existing roles cannot change the slug.</li>


            <li>Enter valid Permissions JSON mapping type slugs to action arrays.</li>
            <li>Click Create Role or Update Role. Save fails if the name/slug are empty, the slug is changed, or the permissions JSON cannot be parsed.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Writing permissions as a flat list instead of an object of arrays.</li>
            <li>Trying to change the slug after creation, which is disabled and will be ignored.</li>
            <li>Forgetting to mark a role Active, which prevents assignment.</li>
          </ul> },
        ]}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sales Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., sales_manager"
                  required
                  disabled={!isCreateMode}
                />
                {!isCreateMode && (
                  <p className="text-xs text-muted-foreground">Slug cannot be changed after creation</p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this role can do..."
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_system"
                  checked={formData.is_system}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_system: checked === true })}
                  disabled={!isCreateMode}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="is_system" className="text-sm">System Role</Label>
                  <p className="text-xs text-muted-foreground">Cannot be deleted, reserved for core functions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
                />
                <Label htmlFor="is_active" className="text-sm">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">


              Define permissions as a JSON object. Each key is a type slug, value is an array of allowed actions.
            </p>
            <Textarea
              value={permissionsJson}
              onChange={(e) => setPermissionsJson(e.target.value)}
              className="font-mono text-sm"
              placeholder={`{\n  "item": ["read", "write"],\n  "account": ["read"]\n}`}
              rows={10}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Example: <code className="bg-muted px-1 py-0.5 rounded">{`{"ticket": ["read", "write", "admin"]}`}</code>
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isCreateMode ? 'Create Role' : 'Update Role'}
          </Button>
        </div>
      </form>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a create/edit form for admin roles and their permissions.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RoleDetailPage.tsx:RoleDetailPage:component"]
