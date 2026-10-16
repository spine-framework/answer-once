// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the PromptConfigDetailPage React page file, imports dependencies, and declares the PromptConfig interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Top-of-file module documentation and dependency imports for the prompt config admin detail page"]
// CIL[DOC-CONTEXT module="prompt-config-admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, router hooks, UI components, API hooks, and utility modules; exports no runtime logic"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]







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
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Defines the PromptConfigDetailPage React page file, imports dependencies, and declares the PromptConfig interface'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfig:interface" type="interface" identity="PromptConfig" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Type definition for prompt configuration records used by the detail page and API"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shape of prompt configuration data"]
// CIL[DOC-CONTEXT module="prompt-config-admin" layer="domain" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="PromptConfig type interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes fields for prompt configuration including metadata, model settings, escalation, and runtime options"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for prompt configuration records used by the detail page and API'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfig:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfigDetailPage:component" type="component" identity="PromptConfigDetailPage" parent="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for creating and editing prompt configurations"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a form for prompt config fields, load existing config, validate JSON, and submit to API"]
// CIL[DOC-CONTEXT module="prompt-config-admin" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PromptConfigDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="URL id param (optional), apiFetch, useApi hook" outputs="Rendered form UI, API save requests" errors="API fetch/save failures, invalid JSON input" side_effects="Updates form state, calls navigate, shows alert"]
// CIL[DOC-MICRO logic_summary="Loads prompt config by id, initialises form state, validates JSON arrays/objects, submits create or patch request, and renders card-based form sections"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
      alert(err.message)
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

      <PageInstructions
        description="Create and manage prompt configurations that define LLM behavior."
        sections={[
          { title: 'What this prompt config controls', content: 'A prompt config stores the prompt body, model settings, escalation rules, knowledge sources, available tools, tool constraints, and metadata that AI agents and chat interfaces use at runtime.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name *</strong> — string, required. The display and lookup name.</li>
            <li><strong>Slug *</strong> — string, required. The unique key callers use to select this config.</li>
            <li><strong>Description</strong> — string, optional. Human-readable purpose.</li>
            <li><strong>App ID</strong> — uuid, optional. Links this config to a specific app; editable only when creating.</li>
            <li><strong>System Prompt</strong> — text. Optional base system instructions.</li>
            <li><strong>Context Template</strong> — text. The prompt body; may include variable placeholders.</li>
            <li><strong>Model</strong> — string, default gpt-4o. The model to use for this prompt.</li>
            <li><strong>Temperature</strong> — number, default 0.7. Sampling temperature.</li>
            <li><strong>Max Tokens</strong> — number, default 4000. Token limit for the response.</li>
            <li><strong>Is Multi Turn</strong> — checkbox, default true. Whether the prompt supports conversation history.</li>
            <li><strong>Max History Messages</strong> — number, default 20. Number of prior messages to include.</li>
            <li><strong>Confidence Threshold</strong> — number, optional. Minimum confidence before taking action.</li>
            <li><strong>Escalation Action / Target</strong> — strings, optional. Where to route low-confidence results.</li>
            <li><strong>Output Mode / Field</strong> — strings, optional. How and where to emit the model output.</li>
            <li><strong>Requires Review</strong> — checkbox, default false. Whether outputs need human review.</li>
            <li><strong>Knowledge Sources</strong> — JSON array, default []. Data sources the prompt can draw from.</li>
            <li><strong>Available Tools</strong> — JSON array, default []. Tool definitions the prompt can invoke.</li>
            <li><strong>Tool Constraints</strong> — JSON object, default {}. Rules restricting tool use.</li>
            <li><strong>Metadata</strong> — JSON object, default {}. Extra structured data attached to the config.</li>
            <li><strong>Active</strong> — checkbox, default true. Inactive configs are not returned as candidates.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Model</strong> defaults to <em>gpt-4o</em> if left blank.</li>
            <li><strong>Temperature</strong> can be any number; 0 is deterministic, higher values produce more random output.</li>
            <li><strong>JSON fields</strong> must contain valid JSON. Arrays are expected for <em>Knowledge Sources</em> and <em>Available Tools</em>; objects are expected for <em>Tool Constraints</em> and <em>Metadata</em>.</li>
            <li><strong>Active</strong>: when checked, callers can select this config by slug or default lookup.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>AI agents and pipelines look up prompts by slug. Missing or inactive configs break those calls.</li>
            <li>Context Template variables must be supplied by callers; unresolved placeholders remain literal in the rendered text.</li>
            <li>Malformed JSON in the JSON fields will prevent save and may break runtime callers expecting arrays or objects.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, enter the required <em>Name</em> and <em>Slug</em>. Optionally set <em>App ID</em>.</li>
            <li>Fill the <em>Context Template</em> prompt body, model defaults, and any optional escalation/output fields.</li>
            <li>Paste valid JSON into the four JSON textareas. Click <strong>Create</strong> or <strong>Update</strong> to save.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Leaving <em>Slug</em> empty or duplicating an existing slug.</li>
            <li>Entering JSON arrays as a string or leaving a JSON field completely blank.</li>
            <li>Setting <em>Max Tokens</em> or <em>Max History Messages</em> to 0 or non-numeric values.</li>
          </ul> },
        ]}
      />

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
                  <Label>App ID</Label>
                  <Input
                    value={formData.app_id}
                    onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                    placeholder="00000000-0000-0000-0000-000000000000"
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
// CIL[DOC-VECTOR type="context" content="purpose='Admin page for creating and editing prompt configurations'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigDetailPage.tsx:PromptConfigDetailPage:component"]



