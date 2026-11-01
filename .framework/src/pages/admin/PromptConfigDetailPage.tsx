// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
/**
 * @module   PromptConfigDetailPage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module represents the Prompt Configuration Detail page in the admin section of the application, allowing users to view and edit prompt configurations. It integrates various UI components and hooks to manage state and API interactions. INVARIANT: The user must have appropriate permissions to access this page.
 *
 * @seeAlso EntitySelect (provides entity selection functionality).
 * @seeAlso useApi (custom hook for API interactions).
 * @seeAlso PageInstructions (displays instructions for the page).
 *
 * @cil-generated
 */
















import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { AppSelect } from '../../components/admin/EntitySelect'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfig:interface" type="interface" identity="PromptConfig" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
/**
 * The PromptConfig interface defines the structure for configuration settings related to prompts in the application. It encapsulates various properties that control the behavior and characteristics of prompts used in the system.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface PromptConfig {
  id: string
  name: string
  slug: string
  description?: string | null
  app_id?: string | null
  account_id?: string
  type_id?: string | null
  system_prompt?: string | null
  context_template?: string | null
  model: string
  temperature: number
  max_tokens: number
  is_multi_turn: boolean
  max_history_messages: number
  confidence_threshold?: number | null
  escalation_action?: string | null
  escalation_target?: string | null
  output_mode?: string | null
  output_field?: string | null
  requires_review: boolean
  knowledge_sources: any[]
  available_tools: any[]
  tool_constraints: Record<string, any>
  metadata: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfig:interface"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfigDetailPage:component" type="component" identity="PromptConfigDetailPage" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
/**
 * The PromptConfigDetailPage component manages the creation and editing of prompt configurations in an admin interface. It fetches existing configurations or initializes a new one based on the provided ID.
 *
 * @macro       Component for managing prompt configuration details in an admin panel.
 * @micro       Uses React hooks to manage state and side effects for form handling and API interactions.
 * @outputSpec  JSX.Element
 * @throws      Error — if the API fetch fails
 * @sideEffects Makes API calls to fetch and submit prompt configurations.
 * @stability   stable
 * @calls       useParams, useNavigate, useApi, apiFetch
 * @errorHandling throws an error if the API fetch fails
 * @cil-generated
 */
export function PromptConfigDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    app_id: '',
    system_prompt: '',
    context_template: '',
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 4000,
    is_multi_turn: true,
    max_history_messages: 20,
    confidence_threshold: '' as number | string,
    escalation_action: '',
    escalation_target: '',
    output_mode: '',
    output_field: '',
    requires_review: false,
    knowledge_sources: JSON.stringify([], null, 2),
    available_tools: JSON.stringify([], null, 2),
    tool_constraints: JSON.stringify({}, null, 2),
    metadata: JSON.stringify({}, null, 2),
    is_active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: config, loading, error } = useApi<PromptConfig>(
    async () => {
      if (isCreateMode) return null
      const response = await apiFetch(`/api/prompt-configs?action=get&id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      return result.data || result
    },
    { immediate: !isCreateMode }
  )

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name || '',
        slug: config.slug || '',
        description: config.description || '',
        app_id: config.app_id || '',
        system_prompt: config.system_prompt || '',
        context_template: config.context_template || '',
        model: config.model || 'gpt-4o',
        temperature: config.temperature ?? 0.7,
        max_tokens: config.max_tokens ?? 4000,
        is_multi_turn: config.is_multi_turn ?? true,
        max_history_messages: config.max_history_messages ?? 20,
        confidence_threshold: config.confidence_threshold ?? '',
        escalation_action: config.escalation_action || '',
        escalation_target: config.escalation_target || '',
        output_mode: config.output_mode || '',
        output_field: config.output_field || '',
        requires_review: config.requires_review ?? false,
        knowledge_sources: JSON.stringify(config.knowledge_sources || [], null, 2),
        available_tools: JSON.stringify(config.available_tools || [], null, 2),
        tool_constraints: JSON.stringify(config.tool_constraints || {}, null, 2),
        metadata: JSON.stringify(config.metadata || {}, null, 2),
        is_active: config.is_active ?? true
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    try {
      let parsedKnowledgeSources: any[]
      let parsedAvailableTools: any[]
      let parsedToolConstraints: Record<string, any>
      let parsedMetadata: Record<string, any>
      try {
        parsedKnowledgeSources = JSON.parse(formData.knowledge_sources)
        parsedAvailableTools = JSON.parse(formData.available_tools)
        parsedToolConstraints = JSON.parse(formData.tool_constraints)
        parsedMetadata = JSON.parse(formData.metadata)
      } catch (err: any) {
        throw new Error('Invalid JSON in one of the JSON fields: ' + err.message)
      }

      const body: Record<string, any> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        app_id: formData.app_id || undefined,
        system_prompt: formData.system_prompt || undefined,
        context_template: formData.context_template || undefined,
        model: formData.model || 'gpt-4o',
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        is_multi_turn: formData.is_multi_turn,
        max_history_messages: formData.max_history_messages,
        confidence_threshold: formData.confidence_threshold === '' ? undefined : Number(formData.confidence_threshold),
        escalation_action: formData.escalation_action || undefined,
        escalation_target: formData.escalation_target || undefined,
        output_mode: formData.output_mode || undefined,
        output_field: formData.output_field || undefined,
        requires_review: formData.requires_review,
        knowledge_sources: parsedKnowledgeSources,
        available_tools: parsedAvailableTools,
        tool_constraints: parsedToolConstraints,
        metadata: parsedMetadata,
        is_active: formData.is_active
      }

      const url = isCreateMode ? '/api/prompt-configs' : `/api/prompt-configs?id=${id}`
      const response = await apiFetch(url, {
        method: isCreateMode ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      if (isCreateMode) { navigate(`/spine-framework/admin/configs/prompts/${result.config_id || result.id}`) } else { navigate(-1) }
    } catch (err: any) {
      setFormError(err.message)
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load</AlertTitle>
        <AlertDescription>{String(error)}</AlertDescription>
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
          {isCreateMode ? 'Create Prompt Config' : config?.name || 'Prompt Config'}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              {isCreateMode && (
                <div className="space-y-2">
                  <Label>App</Label>
                  <AppSelect
                    value={formData.app_id}
                    onChange={(v) => setFormData({ ...formData, app_id: v })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="gpt-4o"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prompting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                className="font-mono text-sm"
                rows={6}
                placeholder="Enter optional system instructions"
              />
            </div>
            <div className="space-y-2">
              <Label>Context Template</Label>
              <Textarea
                value={formData.context_template}
                onChange={(e) => setFormData({ ...formData, context_template: e.target.value })}
                className="font-mono text-sm"
                rows={10}
                placeholder="Enter the prompt body with {{variable}} placeholders"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({ ...formData, max_tokens: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confidence Threshold</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.confidence_threshold}
                  onChange={(e) => {




/**
 * The constant 'v' captures the value from an event target, typically from a user input field, to facilitate the handling of user input in the component's state management.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
                    const v = e.target.value

                    setFormData({ ...formData, confidence_threshold: v === '' ? '' : Number(v) })
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation &amp; Escalation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max History Messages</Label>
                <Input
                  type="number"
                  value={formData.max_history_messages}
                  onChange={(e) => setFormData({ ...formData, max_history_messages: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Escalation Action</Label>
                <Input
                  value={formData.escalation_action}
                  onChange={(e) => setFormData({ ...formData, escalation_action: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Escalation Target</Label>
                <Input
                  value={formData.escalation_target}
                  onChange={(e) => setFormData({ ...formData, escalation_target: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Output Mode</Label>
                <Input
                  value={formData.output_mode}
                  onChange={(e) => setFormData({ ...formData, output_mode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Output Field</Label>
                <Input
                  value={formData.output_field}
                  onChange={(e) => setFormData({ ...formData, output_field: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Knowledge Sources (JSON array)</Label>
              <Textarea
                value={formData.knowledge_sources}
                onChange={(e) => setFormData({ ...formData, knowledge_sources: e.target.value })}
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Available Tools (JSON array)</Label>
              <Textarea
                value={formData.available_tools}
                onChange={(e) => setFormData({ ...formData, available_tools: e.target.value })}
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Tool Constraints (JSON object)</Label>
              <Textarea
                value={formData.tool_constraints}
                onChange={(e) => setFormData({ ...formData, tool_constraints: e.target.value })}
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Metadata (JSON object)</Label>
              <Textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_multi_turn"
                  checked={formData.is_multi_turn}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_multi_turn: checked === true })}
                />
                <Label htmlFor="is_multi_turn" className="text-sm">Is Multi Turn</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_review"
                  checked={formData.requires_review}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_review: checked === true })}
                />
                <Label htmlFor="requires_review" className="text-sm">Requires Review</Label>
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

        {!isCreateMode && config && (
          <Card>
            <CardHeader>
              <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><dt className="text-muted-foreground">ID</dt><dd className="break-all">{config.id}</dd></div>
                <div><dt className="text-muted-foreground">App ID</dt><dd className="break-all">{config.app_id || '-'}</dd></div>
                <div><dt className="text-muted-foreground">Account ID</dt><dd className="break-all">{config.account_id || '-'}</dd></div>
                <div><dt className="text-muted-foreground">Type ID</dt><dd className="break-all">{config.type_id || '-'}</dd></div>
                <div><dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(config.created_at)}</dd></div>
                <div><dt className="text-muted-foreground">Updated</dt><dd>{formatDateTime(config.updated_at)}</dd></div>
              </dl>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">
          {formError && <p className="text-sm text-red-600 mr-auto">{formError}</p>}
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isCreateMode ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfigDetailPage:component"]










