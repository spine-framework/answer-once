// CIL[BEGIN stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/shared/FieldRenderer.tsx"]
// CIL[DOC-MACRO purpose="Import dependencies and types used to render schema-driven form fields"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports for React, sanitization, markdown parsing, FieldDefinition, and the RichTextEditor component"]
// CIL[DOC-CONTEXT module="components/shared" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported symbols available to FieldRenderer, toSafeHtml, resolveRenderType, and FieldRendererProps" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React, DOMPurify, marked, FieldDefinition type, and RichTextEditor component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-developers,ui-developers"]

import React from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { FieldDefinition } from '../../types/types'
import { RichTextEditor } from '../ui/RichTextEditor'

// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and types used to render schema-driven form fields'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/RichTextEditor.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:toSafeHtml:function" type="function" identity="toSafeHtml" parent="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Sanitize raw HTML or markdown text for safe rendering as HTML"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a raw string to sanitized HTML, detecting existing HTML and falling back to markdown parsing"]
// CIL[DOC-CONTEXT module="components/shared" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/RichTextEditor.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="raw: string | undefined" outputs="sanitized HTML string" errors="none" side_effects="Runs DOMPurify and marked.parse"]
// CIL[DOC-MICRO logic_summary="Trim input, detect common HTML tags, parse markdown if plain, then sanitize with DOMPurify" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function toSafeHtml(raw: string | undefined): string {
  const source = (raw ?? '').trim()
  if (!source) return '<p class="text-slate-400 italic">—</p>'
  const likelyHtml = /<\/?(?:h[1-6]|p|div|ul|ol|li|pre|code|br|span|strong|em|a|table|tr|td|th|thead|tbody|blockquote)\b/i.test(source)
  const html = likelyHtml ? source : (marked.parse(source, { async: false }) as string)
  return DOMPurify.sanitize(html)
}
// CIL[DOC-VECTOR type="context" content="purpose='Sanitize raw HTML or markdown text for safe rendering as HTML'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/RichTextEditor.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:toSafeHtml:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:FieldRendererProps:interface" type="interface" identity="FieldRendererProps" parent="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the props accepted by the FieldRenderer component"]
// CIL[DOC-RESPONSIBILITY responsibility="Type-check the field, value, change handlers, readonly flag, error, and optional display type"]
// CIL[DOC-CONTEXT module="components/shared" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/RichTextEditor.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="props object" outputs="typed prop contract for FieldRenderer" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declare an interface describing the props consumed by FieldRenderer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface FieldRendererProps {
  field: FieldDefinition
  value: any
  onChange?: (value: any) => void
  onBlur?: () => void
  readonly?: boolean
  error?: string
  displayType?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props accepted by the FieldRenderer component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/RichTextEditor.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:FieldRendererProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:resolveRenderType:function" type="function" identity="resolveRenderType" parent="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Map a FieldDefinition and optional display override to a concrete render type string"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the widget type to render based on displayType override or field.data_type"]
// CIL[DOC-CONTEXT module="components/shared" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/RichTextEditor.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field: FieldDefinition, displayType?: string" outputs="render type string (text, rich_text, textarea, email, phone, etc.)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Switch on displayType if provided, otherwise map field.data_type to a canonical render type" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Map a FieldDefinition and optional display override to a concrete render type string'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/RichTextEditor.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:resolveRenderType:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:FieldRenderer:component" type="component" identity="FieldRenderer" parent="~/.framework/src/components/shared/FieldRenderer.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a schema-driven form field with the appropriate input or read-only display"]
// CIL[DOC-RESPONSIBILITY responsibility="Pick a render type and render the matching input or read-only widget, including labels, descriptions, and error messages"]
// CIL[DOC-CONTEXT module="components/shared" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/RichTextEditor.tsx,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field, value, onChange, readonly, error, displayType" outputs="JSX form field with label, control, description, and error" errors="none" side_effects="Invokes onChange callback on user interaction"]
// CIL[DOC-MICRO logic_summary="Compute renderType from field and displayType, then switch on renderType to render the correct control, fallback to text input, and wrap with label/description/error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
        return readonly ? (
          value ? (
            <div className="text-sm">
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                View File
              </a>
            </div>
          ) : (
            <span className="text-slate-500">No file</span>
          )
        ) : (
          <input
            type="file"
            onChange={(e) => {


              const file = e.target.files?.[0]

              if (file) onChange?.(file.name)
            }}
            className={`input ${error ? 'border-red-500' : ''}`}
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
// CIL[DOC-VECTOR type="context" content="purpose='Render a schema-driven form field with the appropriate input or read-only display'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/RichTextEditor.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/FieldRenderer.tsx:FieldRenderer:component"]