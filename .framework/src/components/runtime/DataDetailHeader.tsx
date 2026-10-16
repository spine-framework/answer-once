// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/runtime/DataDetailHeader.tsx"]
// CIL[DOC-MACRO purpose="React component module for the data detail header"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the DataDetailHeaderProps interface and the DataDetailHeader presentational component"]
// CIL[DOC-CONTEXT module="runtime" layer="presentation" related_files=".framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="DataDetailHeaderProps and DataDetailHeader exports" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports dependencies, declares the props interface, and exports the detail header component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="runtime-ui"]

import React from 'react'
import { Button } from '../ui/button'
import * as Icons from 'lucide-react'

// CIL[DOC-VECTOR type="context" content="purpose='React component module for the data detail header'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:datadetailheaderprops:interface" type="interface" identity="DataDetailHeaderProps" parent="~/.framework/src/components/runtime/DataDetailHeader.tsx"]
// CIL[DOC-MACRO purpose="Defines the prop contract for the DataDetailHeader component"]
// CIL[DOC-RESPONSIBILITY responsibility="Specifies all data and callback properties required to render and control the detail header"]
// CIL[DOC-CONTEXT module="runtime" layer="type" related_files=".framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="DataDetailHeaderProps TypeScript interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Interface with entity, icon, title, editing flags, and action handler props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DataDetailHeaderProps {
  entity: string
  icon: string
  title: string
  isEditing: boolean
  isCreating: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  saving?: boolean
  deleting?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the prop contract for the DataDetailHeader component'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:datadetailheaderprops:interface"]
// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:datadetailheader:function" type="function" identity="DataDetailHeader" parent="~/.framework/src/components/runtime/DataDetailHeader.tsx"]
// CIL[DOC-MACRO purpose="Render a detail view header with icon, title, entity label, and action buttons"]
// CIL[DOC-RESPONSIBILITY responsibility="Display the entity header and dispatch user actions to the provided callback props"]
// CIL[DOC-CONTEXT module="runtime" layer="presentation" related_files=".framework/src/components/runtime/DataDetailHeader.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-CONTRACT inputs="entity, icon, title, isEditing, isCreating, onEdit, onSave, onCancel, onDelete?, saving?, deleting?" outputs="JSX.Element" errors="N/A" side_effects="Invokes onEdit, onSave, onCancel, and onDelete callbacks when buttons are clicked"]
// CIL[DOC-MICRO logic_summary="Resolves the lucide icon, renders title and entity, conditionally shows save/cancel or edit/delete controls" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="param" content="entity: string - entity collection or label shown in the header">
// CIL[DOC-NOTE type="param" content="icon: string - lucide-react icon key to display">
// CIL[DOC-NOTE type="param" content="title: string - page title rendered in the header">
// CIL[DOC-NOTE type="param" content="isEditing: boolean - whether the detail form is in editing mode">
// CIL[DOC-NOTE type="param" content="isCreating: boolean - whether a new record is being created">
// CIL[DOC-NOTE type="param" content="onEdit: () => void - callback to enter edit mode">
// CIL[DOC-NOTE type="param" content="onSave: () => void - callback to save the current record">
// CIL[DOC-NOTE type="param" content="onCancel: () => void - callback to cancel editing">
// CIL[DOC-NOTE type="param" content="onDelete?: () => void - optional callback to delete the record">
// CIL[DOC-NOTE type="param" content="saving?: boolean - optional flag indicating a save is in progress">
// CIL[DOC-NOTE type="param" content="deleting?: boolean - optional flag indicating a delete is in progress">
export function DataDetailHeader({
  entity,
  icon,
  title,
  isEditing,
  isCreating,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  saving,
  deleting
}: DataDetailHeaderProps) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Box
  
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">
            {isCreating ? `Create new ${entity.slice(0, -1)}` : entity}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onEdit}>
              <Icons.Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                <Icons.Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a detail view header with icon, title, entity label, and action buttons'; No verified external callers; imports: .framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataDetailHeader.tsx:datadetailheader:function"]