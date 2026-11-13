// custom onPublish callers save at current status — the backend decides publication after validation so a hard-failing draft never becomes published









import { useState, useEffect, useMemo, useRef } from 'react'
import DOMPurify from 'dompurify'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { RichTextEditor } from '../ui/RichTextEditor'
import { SchemaFields } from '../shared/SchemaFields'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ArrowLeft, Save, Send, Trash, X, Edit } from 'lucide-react'


























export interface KBArticleEditorProps {
  typeSlug: string
  typeName?: string
  mode?: 'view' | 'edit' | 'new'
  articleId?: string | null
  canEdit?: boolean
  canCreate?: boolean
  canDelete?: boolean
  onBack?: () => void
  onSave?: (record: any) => void
  onEdit?: (id: string) => void
  onCancel?: () => void
  onDelete?: () => void
  /** Fires whenever the form values change after initialization (field edits). */
  onFormChange?: (values: Record<string, any>) => void
  /**
   * Custom publish step: handleSave(true) saves the current form first, then
   * awaits this callback. When omitted the editor falls back to
   * /api/kb?action=publish. Throwing surfaces the error in the editor UI.
   */
  onPublish?: (recordId: string, savedRecord: any) => Promise<void>
  publishLabel?: string
  saveLabel?: string
  publishDisabled?: boolean
  /**
   * Optional allowlist of schema fields rendered in the right-hand metadata
   * sidebar. Omitted → all non-main fields (default). An empty array hides the
   * sidebar entirely — hidden fields still seed formData, so saves preserve them.
   */
  sidebarFieldNames?: string[]
}



























interface KBRecord {
  id: string
  title: string
  status: string
  created_at: string
  data: Record<string, any>
  [key: string]: any
}



























function getFieldDefault(def: any): any {
  if (def.data_type === 'multiselect' || (def.data_type === 'array' && def.options)) return []
  if (def.data_type === 'boolean' || def.data_type === 'checkbox' || def.data_type === 'switch') return false
  if (def.data_type === 'number' || def.data_type === 'currency' || def.data_type === 'range') return null
  if (def.data_type === 'select' || def.data_type === 'radio') {
    if (Array.isArray(def.options) && def.options.length) {
      const first = def.options[0]
      return typeof first === 'object' ? first.value : first
    }
    return ''
  }
  if (def.data_type === 'datetime' || def.data_type === 'date') return null
  return ''
}



























function initialFormData(schema: any, record: KBRecord | null): Record<string, any> {
  const values: Record<string, any> = {}
  Object.entries(schema?.fields || {}).forEach(([fieldName, fieldDef]: [string, any]) => {
    if (record) {
      values[fieldName] = fieldDef.system
        ? (record[fieldName] !== undefined ? record[fieldName] : getFieldDefault(fieldDef))
        : (record.data?.[fieldName] !== undefined ? record.data[fieldName] : getFieldDefault(fieldDef))
    } else {
      values[fieldName] = getFieldDefault(fieldDef)
    }
  })
  if (!record) {
    values.status = 'draft'
    values.title = ''
    values.content = ''
    values.description = ''
  }
  return values
}



























export function KBArticleEditor({
  typeSlug,
  typeName,
  mode = 'view',
  articleId = null,
  canEdit = true,
  canCreate = true,
  canDelete = true,
  onBack,
  onSave,
  onEdit,
  onCancel,
  onDelete,
  onFormChange,
  onPublish,
  publishLabel,
  saveLabel,
  publishDisabled,
  sidebarFieldNames,
}: KBArticleEditorProps) {
  const isCreating = mode === 'new'
  const isEditing = mode === 'edit' || isCreating

  const [typeRecord, setTypeRecord] = useState<any>(null)
  const [record, setRecord] = useState<KBRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isCreating) {
      setTypeRecord(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setTypeRecord(null)
    setRecord(null)
    setError(null)

    apiFetch('/api/types?action=list')
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        const found = (j.data || []).find((t: any) => t.slug === typeSlug)
        setTypeRecord(found || null)
        setLoading(false)
      })
      .catch(() => {
        setTypeRecord(null)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [isCreating, typeSlug])

  useEffect(() => {
    if (isCreating) {
      setRecord(null)
      return
    }
    if (!articleId) {
      setRecord(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    apiFetch(`/api/admin-data?action=get&entity=items&id=${articleId}`)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        const rec = j.data ?? j
        setRecord(rec)
        setLoading(false)
      })
      .catch((e: any) => {
        setError(e.message || 'Failed to load article')
        setRecord(null)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [articleId, isCreating])

  const schema = record?.design_schema || typeRecord?.design_schema

  useEffect(() => {
    if (schema) {
      setFormData(initialFormData(schema, isCreating ? null : record))
    }
  }, [schema, isCreating, record])

  const allFields = useMemo(() => {
    return Object.entries(schema?.fields || {}).map(([name, def]: [string, any]) => ({
      name,
      label: def.label,
      data_type: def.data_type,
      required: def.required,
      options: def.options,
      validation: def.validation,
      permissions: def.permissions,
      system: def.system,
      placeholder: def.placeholder,
    }))
  }, [schema])

  const mainFieldNames = ['title', 'content']
  const mainFields = useMemo(() => allFields.filter(f => mainFieldNames.includes(f.name)), [allFields])
  const sidebarFields = useMemo(() => {
    const fields = allFields.filter(f => !mainFieldNames.includes(f.name))
    return sidebarFieldNames === undefined ? fields : fields.filter(f => sidebarFieldNames.includes(f.name))
  }, [allFields, sidebarFieldNames])
  const titleField = mainFields.find(f => f.name === 'title')
  const contentField = mainFields.find(f => f.name === 'content')

  const titleValue = isEditing ? formData.title : record?.title
  const contentValue = isEditing
    ? (formData.content || '')
    : (record?.data?.content || record?.content || '')
  const descriptionValue = isEditing
    ? (formData.description || '')
    : (record?.description || '')

  const buildPayload = () => {
    const system: Record<string, any> = {}
    const data: Record<string, any> = {}
    Object.entries(schema?.fields || {}).forEach(([fieldName, fieldDef]: [string, any]) => {
      const value = formData[fieldName]
      if (fieldDef.system) {
        system[fieldName] = value
      } else {
        data[fieldName] = value
      }
    })
    return { entity: 'items', type_slug: record?.type_slug || typeRecord?.slug || typeSlug, ...system, data: { ...(record?.data || {}), ...data } }
  }

  const handleSave = async (publish = false) => {
    if (!schema) return
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      // Custom onPublish callers (e.g. app-level validated publish) must save at
      // the record's current status — the backend decides publication after
      // validation, so a hard-failing draft never becomes published here.
      if (publish && !onPublish) payload.status = 'published'
      if (!payload.title?.trim()) throw new Error('Title is required')
      if (!payload.data?.content?.trim()) throw new Error('Content is required')

      let res: Response
      if (isCreating) {
        res = await apiFetch('/api/admin-data?action=create&entity=items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await apiFetch(`/api/admin-data?action=update&entity=items&id=${articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Save failed')
      }

      const json = await res.json().catch(() => null)
      const saved = json?.data ?? json
      const recordId = saved?.id || (isCreating ? null : articleId)

      if (publish && recordId) {
        // Custom publish path (e.g. app-level validated publish/re-embed) — the
        // form was just saved, so the callback operates on durable content.
        if (onPublish) {
          await onPublish(recordId, saved)
        } else {
          await apiFetch('/api/kb?action=publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: recordId }),
          })
        }
      }

      onSave?.(saved)
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isCreating || !articleId) return
    if (!confirm('Delete this article? This cannot be undone.')) return
    setSaving(true)
    try {
      const res = await apiFetch(`/api/admin-data?action=remove&entity=items&id=${articleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      onDelete?.()
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  // Updaters must stay pure — calling the parent's setState (onFormChange)
  // inside the updater runs during this component's render, producing React's
  // setState-during-render warning and re-render loops. Flag the edit here
  // and report it from a post-commit effect instead.
  const formSyncPending = useRef(false)
  const handleFieldChange = (name: string, value: any) => {
    formSyncPending.current = true
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Post-initialization edits only — schema/record hydration sets formData
  // directly and does not flag a sync.
  useEffect(() => {
    if (!formSyncPending.current) return
    formSyncPending.current = false
    onFormChange?.(formData)
  }, [formData, onFormChange])

  if (loading && !record && !isCreating) {
    return (
      <div className="p-6 space-y-4 h-full">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="p-6 text-center text-muted-foreground h-full flex items-center justify-center">
        <p>Could not load type schema for {typeSlug}.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border shrink-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> KB
            </Button>
          )}
          <h1 className="text-base font-semibold truncate max-w-[44ch]">
            {isCreating ? `New ${typeName || typeSlug}` : (record?.title || 'Edit Article')}
          </h1>
          {!isCreating && record && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Badge variant={record.status === 'published' ? 'default' : 'outline'} className="text-xs">
                {record.status || 'draft'}
              </Badge>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(record.created_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'view' && articleId && canEdit && (
            <Button size="sm" variant="outline" onClick={() => articleId && onEdit?.(articleId)} className="gap-1">
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button size="sm" variant="outline" onClick={() => onCancel?.()} className="gap-1">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              {canDelete && !isCreating && (
                <Button size="sm" variant="outline" onClick={handleDelete} disabled={saving} className="gap-1 text-destructive hover:text-destructive">
                  <Trash className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => handleSave(false)} disabled={saving} className="gap-1">
                <Save className="h-3.5 w-3.5" /> {saveLabel || 'Save Draft'}
              </Button>
              <Button size="sm" onClick={() => handleSave(true)} disabled={saving || publishDisabled} className="gap-1">
                <Send className="h-3.5 w-3.5" /> {publishLabel || 'Publish'}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <Label>{titleField?.label || 'Title'} *</Label>
            {isEditing ? (
              <Input
                value={formData.title || ''}
                onChange={e => handleFieldChange('title', e.target.value)}
                placeholder="Article title"
                className="text-lg font-medium"
              />
            ) : (
              <h2 className="text-xl font-semibold">{record?.title || 'Untitled'}</h2>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{contentField?.label || 'Content'} *</Label>
            {isEditing ? (
              <RichTextEditor
                value={formData.content || ''}
                onChange={html => handleFieldChange('content', html)}
                placeholder="Write the article content here…"
                minHeight="400px"
              />
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3 border rounded-md bg-background"
                // Sanitize before injecting: content is rich-text HTML from a stored
                // record and must never execute scripts/handlers (stored-XSS defense).
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(record?.data?.content || record?.content || '<p class="text-muted-foreground italic">No content available.</p>') }}
              />
            )}
          </div>

          {schema.fields?.description && (
            <div className="space-y-1.5">
              <Label>Description</Label>
              {isEditing ? (
                <textarea
                  value={formData.description || ''}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  placeholder="Short description or summary"
                />
              ) : (
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{record?.description || <span className="text-muted-foreground italic">No description.</span>}</p>
              )}
            </div>
          )}
        </div>

        {sidebarFields.length > 0 && (
          <div className="w-72 shrink-0 border-l border-border p-4 space-y-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Metadata</h3>
            <SchemaFields
              fields={sidebarFields}
              data={isEditing ? { ...formData, data: formData } : { ...record, data: record?.data }}
              onChange={isEditing ? handleFieldChange : undefined}
              readonly={!isEditing}
              twoColumn={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}








