// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Provides reusable form, field, section, row and column UI primitives"]
// CIL[DOC-RESPONSIBILITY responsibility="Aggregate form-building components and their prop types for the shared UI library"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports React, local types, FieldRenderer, Button and utility classes; exports five related components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="UI component consumers and form authors"]
























import React from 'react'
import { FieldDefinition } from '../../types/types'
import { FieldRenderer } from '../shared/FieldRenderer'
import { Button } from './button'
import { cn } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Provides reusable form, field, section, row and column UI primitives'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormProps:interface" type="interface" identity="FormProps" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Defines the prop contract for the Form component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare configurable form state, handlers and action labels"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Fields, data, errors, touched, onChange, onBlur, onSubmit, isSubmitting, submit/cancel controls, disabled and className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FormProps {
  fields: FieldDefinition[]
  data: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  onChange: (field: string, value: any) => void
  onBlur?: (field: string) => void
  onSubmit?: (e: React.FormEvent) => void
  isSubmitting?: boolean
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  showCancel?: boolean
  disabled?: boolean
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the prop contract for the Form component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:Form:component" type="component" identity="Form" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Renders a dynamic form from FieldDefinition objects with validation and action buttons"]
// CIL[DOC-RESPONSIBILITY responsibility="Map fields to FieldRenderer, manage submit and cancel actions, and apply layout classes"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="fields, data, errors, touched, onChange, onBlur, onSubmit, isSubmitting, submitText, cancelText, onCancel, showCancel, disabled, className" outputs="JSX form element" errors="None" side_effects="Calls onChange, onBlur, onSubmit and onCancel callbacks"]
// CIL[DOC-MICRO logic_summary="Filters unnamed fields, delegates per-field rendering to FieldRenderer, and renders submit/cancel buttons in a flex action row" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function Form({
  fields,
  data,
  errors,
  touched,
  onChange,
  onBlur,
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  showCancel = false,
  disabled = false,
  className
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    onChange(fieldName, value)
  }

  const handleFieldBlur = (fieldName: string) => {
    onBlur?.(fieldName)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {fields.filter(f => !!f.name).map((field) => {
        const name = field.name!
        return (
          <FieldRenderer
            key={name}
            field={field}
            value={data[name]}
            onChange={(value) => handleFieldChange(name, value)}
            error={touched[name] ? errors[name] : undefined}
            onBlur={() => handleFieldBlur(name)}
            readonly={disabled}
          />
        )
      })}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={disabled}
        >
          {submitText}
        </Button>
      </div>
    </form>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a dynamic form from FieldDefinition objects with validation and action buttons'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:Form:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormFieldProps:interface" type="interface" identity="FormFieldProps" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Defines the per-field prop contract for the FormField wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the inputs consumed by a single FormField instance"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Single field definition, value, optional error, touched flag, onChange, onBlur and readonly flag" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FormFieldProps {
  field: FieldDefinition
  value: any
  error?: string
  touched?: boolean
  onChange: (value: any) => void
  onBlur?: () => void
  readonly?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the per-field prop contract for the FormField wrapper'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormFieldProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormField:component" type="component" identity="FormField" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Wraps FieldRenderer for a single form field value"]
// CIL[DOC-RESPONSIBILITY responsibility="Forward field props to FieldRenderer with touched-gated error display"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="field, value, error, touched, onChange, onBlur, readonly" outputs="JSX field rendering" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Renders a FieldRenderer and suppresses the error text until the field is touched" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function FormField({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  readonly = false
}: FormFieldProps) {
  return (
    <FieldRenderer
      field={field}
      value={value}
      onChange={onChange}
      error={touched ? error : undefined}
      onBlur={onBlur}
      readonly={readonly}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Wraps FieldRenderer for a single form field value'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormField:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormSectionProps:interface" type="interface" identity="FormSectionProps" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Defines props for a titled form section wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare title, description, children and optional className"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Optional section title, optional description, child content and layout className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines props for a titled form section wrapper'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormSectionProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormSection:component" type="component" identity="FormSection" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Renders a container with an optional title and description"]
// CIL[DOC-RESPONSIBILITY responsibility="Group child fields under a heading with consistent vertical spacing"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="title, description, children, className" outputs="JSX section div" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Conditionally renders a heading and paragraph, then children inside a spaced div" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-medium text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a container with an optional title and description'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormSection:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormRowProps:interface" type="interface" identity="FormRowProps" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Defines props for a responsive form row layout"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare children and optional className for a grid row"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Children to render and an optional className override" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FormRowProps {
  children: React.ReactNode
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines props for a responsive form row layout'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormRowProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormRow:component" type="component" identity="FormRow" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Provides a responsive grid row for laying out form columns"]
// CIL[DOC-RESPONSIBILITY responsibility="Render children in a one or two column grid with a gap"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="children, className" outputs="JSX grid div" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Uses a single column on small screens and two columns on the sm breakpoint" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides a responsive grid row for laying out form columns'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormRow:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormColumnProps:interface" type="interface" identity="FormColumnProps" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Defines props for a grid column with span control"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare children, span and optional className for a column"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Children, optional span value of 1 or 2, and layout className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface FormColumnProps {
  children: React.ReactNode
  span?: 1 | 2
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines props for a grid column with span control'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormColumnProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/Form.tsx:FormColumn:component" type="component" identity="FormColumn" parent="~/.framework/src/components/ui/Form.tsx"]
// CIL[DOC-MACRO purpose="Renders a grid column with a configurable col-span"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply the requested tailwind column span class to children"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/Form.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="children, span, className" outputs="JSX column div" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Maps span to a tailwind col-span class via a lookup and merges an optional className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function FormColumn({ children, span = 1, className }: FormColumnProps) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2'
  }

  return (
    <div className={cn(spanClasses[span], className)}>
      {children}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a grid column with a configurable col-span'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/shared/FieldRenderer.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/Form.tsx:FormColumn:component"]