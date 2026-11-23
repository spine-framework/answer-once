
import React, { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { FieldDefinition } from '../../types/types'
import { RichTextEditor } from '../ui/RichTextEditor'
import { uploadAttachment, resolveAttachmentUrl } from '../../lib/attachments'



function toSafeHtml(raw: string | undefined): string {
  const source = (raw ?? '').trim()
  if (!source) return '<p class="text-slate-400 italic">—</p>'
  const likelyHtml = /<\/?(?:h[1-6]|p|div|ul|ol|li|pre|code|br|span|strong|em|a|table|tr|td|th|thead|tbody|blockquote)\b/i.test(source)
  const html = likelyHtml ? source : (marked.parse(source, { async: false }) as string)
  return DOMPurify.sanitize(html)
}



interface FieldRendererProps {
  field: FieldDefinition
  value: any
  onChange?: (value: any) => void
  onBlur?: () => void
  readonly?: boolean
  error?: string
  displayType?: string
}


function resolveRenderType(field: FieldDefinition, displayType?: string): string {
  if (displayType) {
    switch (displayType) {
      case 'textarea':
        return 'textarea'
      case 'rich_text':
        return 'rich_text'
      case 'select':
        return 'select'
      case 'multiselect':
        return 'multiselect'
      case 'radio':
        return 'radio'
      case 'checkbox':
      case 'switch':
        return 'checkbox'
      case 'date_picker':
        return 'date'
      case 'datetime_picker':
        return 'datetime'
      case 'color_picker':
        return 'color'
      case 'range_slider':
        return 'range'
      case 'file_upload':
      case 'image_upload':
        return 'file'
    }
  }
  switch (field.data_type) {
    case 'textarea':
      return 'textarea'
    case 'rich_text':
      return 'rich_text'
    case 'email':
      return 'email'
    case 'phone':
      return 'phone'
    case 'url':
      return 'url'
    case 'number':
    case 'currency':
    case 'range':
      return 'number'
    case 'date':
      return 'date'
    case 'datetime':
      return 'datetime'
    case 'boolean':
    case 'checkbox':
      return 'checkbox'
    case 'select':
      return 'select'
    case 'multiselect':
      return 'multiselect'
    case 'radio':
      return 'radio'
    case 'color':
      return 'color'
    case 'file':
    case 'image':
      return 'file'
    case 'json':
      return 'json'
    default:
      return 'text'
  }
}


export function FieldRenderer({ field, value, onChange, readonly = false, error, displayType }: FieldRendererProps) {
  const renderType = resolveRenderType(field, displayType)

  const renderField = () => {
    switch (renderType) {
      case 'text':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {value || <span className="text-slate-400 italic">—</span>}
          </div>
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
        )

      case 'rich_text':
        return readonly ? (
          <div
            className={`prose prose-sm dark:prose-invert max-w-none ${error ? 'border-red-500' : ''}`}
            // Sanitize before injecting: `value` may be rich-text HTML or legacy
            // markdown stored in records, and must never execute scripts/handlers
            // for readers (stored-XSS defense).
            dangerouslySetInnerHTML={{ __html: toSafeHtml(value) }}
          />
        ) : (
          <RichTextEditor
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            minHeight="200px"
          />
        )

      case 'textarea':
        return readonly ? (
          <div className={`text-slate-900 whitespace-pre-wrap ${error ? 'border-red-500' : ''}`}>
            {value || <span className="text-slate-400 italic">—</span>}
          </div>
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`textarea ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        )

      case 'email':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {value ? <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">{value}</a> : <span className="text-slate-400 italic">—</span>}
          </div>
        ) : (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
        )

      case 'phone':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {value || <span className="text-slate-400 italic">—</span>}
          </div>
        ) : (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
            readOnly={readonly}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
            min={field.min ?? field.validation?.min}
            max={field.max ?? field.validation?.max}
            step={field.step ?? field.validation?.step}
          />
        )

      case 'date': {
        const parsed = value ? new Date(value) : null
        if (parsed && isNaN(parsed.getTime())) {
          return (
            <input
              type="text"
              value={String(value)}
              readOnly
              className={`input bg-slate-50 ${error ? 'border-red-500' : ''}`}
            />
          )
        }
        return (
          <input
            type="date"
            value={parsed ? parsed.toISOString().split('T')[0] : ''}
            onChange={(e) => onChange?.(e.target.value || null)}
            readOnly={readonly}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        )
      }

      case 'datetime': {
        const parsed = value ? new Date(value) : null
        if (parsed && isNaN(parsed.getTime())) {
          return (
            <input
              type="text"
              value={String(value)}
              readOnly
              className={`input bg-slate-50 ${error ? 'border-red-500' : ''}`}
            />
          )
        }
        return (
          <input
            type="datetime-local"
            value={parsed ? parsed.toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange?.(e.target.value || null)}
            readOnly={readonly}
            className={`input ${error ? 'border-red-500' : ''}`}
          />
        )
      }

      case 'select':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {(() => {
              if (!value) return <span className="text-slate-400 italic">—</span>


              const option = field.options?.find((opt) => {
                const optVal = typeof opt === 'string' ? opt : opt.value
                return optVal === value
              })

              return typeof option === 'string' ? option : option?.label || value
            })()}
          </div>
        ) : (
          <select
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`select ${error ? 'border-red-500' : ''}`}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => {


              const optVal = typeof option === 'string' ? option : option.value



              const optLabel = typeof option === 'string' ? option : option.label

              return (
                <option key={optVal} value={optVal}>
                  {optLabel}
                </option>
              )
            })}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {


              const optionValue = typeof option === 'string' ? option : option.value



              const optionLabel = typeof option === 'string' ? option : option.label

              return (
                <label key={optionValue} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(optionValue)}
                    onChange={(e) => {


                      const currentValue = Array.isArray(value) ? value : []

                      if (e.target.checked) {
                        onChange?.([...currentValue, optionValue])
                      } else {
                        onChange?.(currentValue.filter((v: string) => v !== optionValue))
                      }






                    }}
                    disabled={readonly}
                    className="mr-2"
                  />
                  <span>{optionLabel}</span>
                </label>
              )
            })}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {


              const optionValue = typeof option === 'string' ? option : option.value



              const optionLabel = typeof option === 'string' ? option : option.label

              return (
                <label key={optionValue} className="flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={readonly}
                    className="mr-2"
                  />
                  <span>{optionLabel}</span>
                </label>
              )
            })}
          </div>
        )

      case 'checkbox':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {Boolean(value) ? 'Yes' : 'No'}
          </div>
        ) : (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange?.(e.target.checked)}
              className="mr-2"
            />
            <span>{field.label}</span>
          </label>
        )

      case 'json':
        return readonly ? (
          <pre className="bg-slate-100 p-3 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange?.(JSON.parse(e.target.value))
              } catch {
              }


            }}
            className={`textarea font-mono text-sm ${error ? 'border-red-500' : ''}`}
            rows={field.rows || 6}
            placeholder="Enter valid JSON"
          />
        )

      case 'url':
        return readonly ? (
          <div className={`text-slate-900 ${error ? 'border-red-500' : ''}`}>
            {value ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">{value}</a> : <span className="text-slate-400 italic">—</span>}
          </div>
        ) : (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder || 'https://example.com'}
          />
        )

      case 'file':
        return (
          <FileField
            field={field}
            value={value}
            onChange={onChange}
            readonly={readonly}
            isImage={field.data_type === 'image' || displayType === 'image_upload'}
          />
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={readonly}
              className="h-10 w-20"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              readOnly={readonly}
              className={`input flex-1 ${error ? 'border-red-500' : ''}`}
              placeholder="#000000"
            />
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value ?? field.min ?? field.validation?.min ?? 0}
              onChange={(e) => onChange?.(Number(e.target.value))}
              disabled={readonly}
              className="w-full"
              min={field.min ?? field.validation?.min}
              max={field.max ?? field.validation?.max}
              step={field.step ?? field.validation?.step}
            />
            <div className="text-sm text-slate-600">
              Value: {value ?? field.min ?? 0}
            </div>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readonly}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
          />
        )
    }

  }

  return (
    <div className="space-y-1">
      {field.label && (
        <label className="label">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {field.description && (
        <p className="text-xs text-slate-500">{field.description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

/**
 * Attachment-backed file/image field. The value is the attachment row id —
 * upload mints a tmp-bucket URL, PUTs the file, then commits through
 * admin-data so the stored bytes are validated and GPS-stripped. Readonly
 * resolves a read-url at render time (signed for private, permanent for
 * public attachments).
 *
 * `field.attachment_type` selects the attachment-kind type (default
 * 'attachment') whose file_policy governs the upload; `field.visibility`
 * picks private (default) or public.
 */
function FileField({ field, value, onChange, readonly, isImage }: {
  field: FieldDefinition
  value: any
  onChange?: (value: any) => void
  readonly?: boolean
  isImage?: boolean
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setUrl(null)
    if (value && typeof value === 'string') {
      resolveAttachmentUrl(value)
        .then((u) => { if (alive) setUrl(u) })
        .catch(() => {})
    }
    return () => { alive = false }
  }, [value])

  if (readonly) {
    if (!value) return <span className="text-slate-500">No file</span>
    if (!url) return <span className="text-slate-400 text-sm">Loading…</span>
    if (isImage) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={field.label || 'attachment'} className="max-h-48 rounded-lg border border-slate-200" />
        </a>
      )
    }
    return (
      <div className="text-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          View File
        </a>
      </div>
    )
  }

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setUploadError(null)
    try {
      const row = await uploadAttachment(file, {
        type_slug: field.attachment_type || 'attachment',
        visibility: field.visibility || 'private',
      })
      onChange?.(row.id)
    } catch (err: any) {
      setUploadError(err?.message || 'upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {isImage && url && (
        <img src={url} alt={field.label || 'attachment'} className="max-h-48 rounded-lg border border-slate-200" />
      )}
      <input
        type="file"
        accept={isImage ? 'image/jpeg,image/png,image/webp,image/gif' : undefined}
        onChange={pick}
        disabled={busy}
        className="input"
      />
      {busy && <p className="text-xs text-slate-500">Uploading…</p>}
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      {value && !busy && <p className="text-xs text-slate-400">Attached</p>}
    </div>
  )
}
