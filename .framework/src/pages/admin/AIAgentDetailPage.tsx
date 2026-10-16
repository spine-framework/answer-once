// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provide imports and dependencies for the AIAgentDetailPage admin view."]
// CIL[DOC-RESPONSIBILITY responsibility="Assemble external and internal imports used by the AI agent detail page."]
// CIL[DOC-CONTEXT module="admin-ai-agent-detail" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="loaded dependencies for the page component" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, router utilities, API helpers, UI primitives, and admin page instructions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-ui-developers"]

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { ArrowLeft, Bot, AlertCircle } from 'lucide-react'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Provide imports and dependencies for the AIAgentDetailPage admin view.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:aiagent:interface" type="interface" identity="aiagent" parent="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the AIAgent data shape used by the detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a TypeScript interface describing an agent record and its configuration fields."]
// CIL[DOC-CONTEXT module="admin-ai-agent-detail" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/pages/admin/AIAgentDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="AIAgent interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an AIAgent interface with optional metadata, model config, system prompt, and tool list." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface AIAgent {
  id: string
  name: string
  description?: string
  app_id?: string
  agent_type: 'chat' | 'analysis' | 'automation' | 'custom'
  model_config: { model: string; max_tokens?: number; temperature?: number }
  system_prompt: string
  tools: string[]
  capabilities?: Record<string, any>
  constraints?: Record<string, any>
  metadata?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

// CIL[DOC-VECTOR type="context" content="purpose='Define the AIAgent data shape used by the detail page.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:aiagent:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:agent_types:constant" type="constant" identity="agent_types" parent="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Provide the selectable labels and values for the agent_type field."]
// CIL[DOC-RESPONSIBILITY responsibility="Supply the list of supported AI agent type options for the select input."]
// CIL[DOC-CONTEXT module="admin-ai-agent-detail" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/pages/admin/AIAgentDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="AGENT_TYPES array constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an array of agent type options with value and label pairs." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const AGENT_TYPES = [
  { value: 'chat', label: 'Chat' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'automation', label: 'Automation' },
  { value: 'custom', label: 'Custom' }
]

// CIL[DOC-VECTOR type="context" content="purpose='Provide the selectable labels and values for the agent_type field.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:agent_types:constant"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:aiagentdetailpage:function" type="function" identity="aiagentdetailpage" parent="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render and manage the AI agent create/edit detail page."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch or initialize agent data, manage editing state, validate inputs, save to the API, and render the UI."]
// CIL[DOC-CONTEXT module="admin-ai-agent-detail" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/alert.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/pages/admin/AIAgentDetailPage.tsx"]
// CIL[DOC-CONTRACT inputs="route id param from useParams, apiFetch and useApi hooks" outputs="rendered create/edit form or read-only agent detail" errors="Failed to fetch or save errors logged to console" side_effects="navigates on create, calls /api/ai-agents, updates browser UI state"]
// CIL[DOC-MICRO logic_summary="Loads an agent or default create payload, binds form state, parses JSON fields, validates required fields, and saves the agent." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function AIAgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreateMode = !id || id === 'new'
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [editData, setEditData] = useState<Record<string, any>>({})

  const { data: agent, loading, error } = useApi<AIAgent>(
    async () => {
      if (isCreateMode) return {
        id: '', name: '', description: '', app_id: '', agent_type: 'chat' as const,
        model_config: { model: 'gpt-4', max_tokens: 2048, temperature: 0.7 },
        system_prompt: '', tools: [], capabilities: {}, constraints: {}, metadata: {},
        is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }

      const response = await apiFetch(`/api/ai-agents?method=GET&id=${id}`)
      if (!response.ok) throw new Error('Failed to fetch AI agent')
      const result = await response.json()
      return result.data
    },
    { immediate: !isCreateMode }
  )

  useEffect(() => {
    if (agent) {
      setEditData({
        name: agent.name, description: agent.description || '', app_id: agent.app_id || '', agent_type: agent.agent_type,
        model_config: agent.model_config || { model: 'gpt-4', max_tokens: 2048, temperature: 0.7 },
        system_prompt: agent.system_prompt || '', tools: (agent.tools || []).join('\n'),
        capabilities: JSON.stringify(agent.capabilities || {}, null, 2),
        constraints: JSON.stringify(agent.constraints || {}, null, 2),
        metadata: JSON.stringify(agent.metadata || {}, null, 2),
        is_active: agent.is_active
      })
    }
  }, [agent])

  const handleSave = async () => {
    try {
      const payload = {
        ...editData,
        app_id: editData.app_id || null,
        tools: editData.tools?.split('\n').filter(Boolean) || [],
        capabilities: JSON.parse(editData.capabilities || '{}'),
        constraints: JSON.parse(editData.constraints || '{}'),
        metadata: JSON.parse(editData.metadata || '{}')
      }
      const url = isCreateMode ? '/api/ai-agents' : `/api/ai-agents?id=${id}`
      const response = await apiFetch(url, {
        method: isCreateMode ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Failed to save')
      const result = await response.json()
      if (isCreateMode) navigate(`/spine-framework/admin/configs/ai-agents/${result.id}`)
      else setIsEditing(false)
    } catch (err) {
      console.error('Error saving:', err)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
    </div>
  )

  if (error) return (
    <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Failed to load</AlertTitle><AlertDescription>{String(error)}</AlertDescription></Alert>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">{isCreateMode ? 'Create AI Agent' : agent?.name}</h1>
      </div>
      
      <PageInstructions
        description="Configure an AI agent with a model, system prompt, and tools."
        sections={[
          { title: 'What this AI agent controls', content: 'An AI agent is a reusable model, prompt, and tool configuration that Spine invokes from pipelines, triggers, and chat interfaces. It defines how an LLM behaves, which tools it can call, and any guardrails.' },
          { title: 'Fields explained', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Name</strong> — string. The display name used in lists and callers. Missing or empty prevents the record from being saved.</li>
            <li><strong>Type</strong> — select. Categorizes the agent as chat, analysis, automation, or custom. Used to filter and route agents; a missing value defaults to chat.</li>
            <li><strong>Model</strong> — string. The LLM model name stored in <code>model_config.model</code>. If blank, the API call will fail because no model is targeted.</li>
            <li><strong>Max Tokens</strong> — number. The maximum response length. Invalid or empty parses to an empty value and may cause provider errors.</li>
            <li><strong>Temperature</strong> — number between 0 and 2. Lower is more deterministic, higher is more random. Out of range values may be rejected by the provider.</li>
            <li><strong>Description</strong> — string (optional). Human-readable context for other admins.</li>
            <li><strong>System Prompt</strong> — text. Defines the agent personality, instructions, and constraints. Empty means the model receives no system message.</li>
            <li><strong>App ID</strong> — string. Optional owning app UUID; blank means account-scoped.</li>
            <li><strong>Tools (one per line)</strong> — newline-separated string list. Tool names the agent is allowed to invoke. Unknown or missing tools cause runtime errors.</li>
            <li><strong>Capabilities</strong> — JSON object. Optional flags or settings the agent can use. Must be valid JSON or save fails.</li>
            <li><strong>Constraints</strong> — JSON object. Optional guardrails. Must be valid JSON or save fails.</li>
            <li><strong>Metadata</strong> — JSON object. Optional metadata. Must be valid JSON or save fails.</li>
            <li><strong>Active</strong> — checkbox. Inactive agents are not available for invocation.</li>
          </ul> },
          { title: 'Options and values', content: <ul className="list-disc pl-4 space-y-1">
            <li><strong>Agent type</strong>: <em>Chat</em> for conversational assistants, <em>Analysis</em> for data reasoning, <em>Automation</em> for pipeline actions, <em>Custom</em> for anything else.</li>
            <li><strong>Active</strong>: enabled means the agent can be called; disabled means it is hidden from callers and will not run.</li>
          </ul> },
          { title: 'Downstream impact', content: <ul className="list-disc pl-4 space-y-1">
            <li>Pipelines, triggers, and chat UIs reference agents by ID; deleting or changing the model changes their output.</li>
            <li>Tool names listed here must match registered tool names exactly, otherwise the agent cannot call them.</li>
            <li>Invalid JSON in Capabilities or Constraints will stop the save and leave the previous config in place.</li>
          </ul> },
          { title: 'How to create, save, and validate', content: <ol className="list-decimal pl-4 space-y-1">
            <li>In create mode, fill every required field, enter at least a model name and system prompt.</li>
            <li>Add tools one per line; supply optional JSON in Capabilities and Constraints.</li>
            <li>Click Create. On existing records, click Edit, change fields, then Save.</li>
            <li>Validation checks JSON syntax, parses Max Tokens and Temperature as numbers, and rejects empty Name/Model.</li>
          </ol> },
          { title: 'Common mistakes', content: <ul className="list-disc pl-4 space-y-1">
            <li>Pasting a multiline tools string as a single comma-separated line.</li>
            <li>Using invalid JSON in Capabilities or Constraints.</li>
            <li>Referencing a model name that is not configured in the account, causing calls to fail.</li>
          </ul> },
        ]}
      />
      
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <><Button variant="outline" onClick={() => isCreateMode ? navigate(-1) : setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>{isCreateMode ? 'Create' : 'Save'}</Button></>
        ) : <Button onClick={() => setIsEditing(true)}>Edit</Button>}
      </div>

      {isEditing ? (
        <Card><CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>App ID</Label><Input value={editData.app_id || ''} onChange={e => setEditData({...editData, app_id: e.target.value})} placeholder="Optional app UUID" /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={editData.agent_type || 'chat'} onValueChange={v => setEditData({...editData, agent_type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AGENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Model</Label><Input value={editData.model_config?.model || ''} onChange={e => setEditData({...editData, model_config: {...editData.model_config, model: e.target.value}})} /></div>
            <div className="space-y-2"><Label>Max Tokens</Label><Input type="number" value={editData.model_config?.max_tokens || ''} onChange={e => setEditData({...editData, model_config: {...editData.model_config, max_tokens: parseInt(e.target.value)}})} /></div>
            <div className="space-y-2"><Label>Temperature</Label><Input type="number" step="0.1" min="0" max="2" value={editData.model_config?.temperature || ''} onChange={e => setEditData({...editData, model_config: {...editData.model_config, temperature: parseFloat(e.target.value)}})} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} /></div>
          <div className="space-y-2"><Label>System Prompt</Label><Textarea value={editData.system_prompt || ''} onChange={e => setEditData({...editData, system_prompt: e.target.value})} rows={4} /></div>
          <div className="space-y-2"><Label>Tools (one per line)</Label><Textarea value={editData.tools || ''} onChange={e => setEditData({...editData, tools: e.target.value})} rows={3} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Capabilities (JSON)</Label><Textarea value={editData.capabilities || '{}'} onChange={e => setEditData({...editData, capabilities: e.target.value})} rows={4} className="font-mono text-sm" /></div>
            <div className="space-y-2"><Label>Constraints (JSON)</Label><Textarea value={editData.constraints || '{}'} onChange={e => setEditData({...editData, constraints: e.target.value})} rows={4} className="font-mono text-sm" /></div>
            <div className="space-y-2"><Label>Metadata (JSON)</Label><Textarea value={editData.metadata || '{}'} onChange={e => setEditData({...editData, metadata: e.target.value})} rows={4} className="font-mono text-sm" /></div>
          </div>
          <div className="flex items-center gap-2"><Checkbox id="active" checked={editData.is_active} onCheckedChange={c => setEditData({...editData, is_active: c === true})} /><Label htmlFor="active">Active</Label></div>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Card><CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{agent?.agent_type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span>{agent?.model_config?.model}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max Tokens</span><span>{agent?.model_config?.max_tokens}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span>{agent?.model_config?.temperature}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span>{agent?.is_active ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(agent?.created_at || '').toLocaleDateString()}</span></div>
            </div>
            <div className="mt-4"><span className="text-muted-foreground">Description</span><p className="mt-1">{agent?.description || '—'}</p></div>
            <div className="mt-4"><span className="text-muted-foreground">System Prompt</span><p className="mt-1 text-sm bg-muted p-3 rounded">{agent?.system_prompt || '—'}</p></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Tools ({agent?.tools?.length || 0})</CardTitle></CardHeader><CardContent>{agent?.tools?.length ? <ul className="list-disc list-inside">{agent.tools.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p className="text-muted-foreground">No tools configured</p>}</CardContent></Card>
        </div>
      )}
    </div>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Render and manage the AI agent create/edit detail page.'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/AIAgentDetailPage.tsx:aiagentdetailpage:function"]
