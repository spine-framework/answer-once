// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * @module   EntitySelect
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides a React component for selecting entities within the admin interface, leveraging a native select dropdown. It fetches data from an API to populate the selection options, ensuring that the component reflects the current state of available entities.
 * INVARIANT: The component must always receive valid API response data to function correctly.
 *
 * @seeAlso native-select (provides the UI component for selection).
 * @seeAlso api (handles the data fetching required for populating the select options).
 *
 * @cil-generated
 */

import React, { useEffect, useState } from 'react'
import { NativeSelect } from '../ui/native-select'
import { apiFetch } from '../../lib/api'
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:module_header:module_header"]



// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:Option:interface" type="interface" identity="Option" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * The Option interface defines the structure for an option item used in selection components. It provides a standardized way to represent selectable items with a value and a label.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface Option {
  value: string
  label: string
}
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:Option:interface"]



// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:EntitySelectProps:interface" type="interface" identity="EntitySelectProps" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * EntitySelectProps defines the properties required for the EntitySelect component, facilitating the selection of entities from a specified endpoint. It allows for customization of the selection behavior and appearance.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface EntitySelectProps {
  endpoint: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  mapOption?: (row: any) => Option
  className?: string
}
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:EntitySelectProps:interface"]



// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:defaultMap:function" type="function" identity="defaultMap" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * The defaultMap function transforms a row object into an Option object, providing a standard way to represent entities with a value and label. This is useful for creating dropdowns or selection lists in the admin interface.
 *
 * @inputSpec
 *   row: any (required) — the row object containing entity data.
 * @outputSpec  Option — an object with 'value' and 'label' properties.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const defaultMap = (row: any): Option => ({
  value: row.id,
  label: row.name || row.title || row.slug || row.id,
})
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:defaultMap:function"]



// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:EntitySelect:component" type="component" identity="EntitySelect" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * EntitySelect is a component that allows users to select an entity from a dynamically fetched list of options. It handles API data retrieval and state management to provide a user-friendly interface for entity selection.
 *
 * @macro       Dropdown component for selecting entities from an API-driven list.
 * @micro       Fetches options from a specified endpoint and maps them using a provided mapping function.
 * @inputSpec
 *   endpoint: string (required) — the API endpoint to fetch options from.
 *   value: string (optional) — the currently selected value.
 *   onChange: function (required) — callback function to handle value changes.
 *   placeholder: string (optional) — placeholder text for the dropdown.
 *   mapOption: function (optional) — function to map API response items to dropdown options.
 *   className: string (optional) — additional CSS class names for styling.
 * @outputSpec  JSX.Element — renders a NativeSelect component with options.
 * @sideEffects fetches data from an external API endpoint.
 * @stability   internal
 * @calls       apiFetch
 * @errorHandling sets options to an empty array on fetch failure.
 * @cil-generated
 */
export function EntitySelect({
  endpoint,
  value,
  onChange,
  placeholder = 'Select…',
  mapOption = defaultMap,
  className,
}: EntitySelectProps) {
  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    apiFetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const rows: any[] = data?.data || data?.items || data?.projects || data || []
        setOptions(rows.map(mapOption))
      })
      .catch(() => setOptions([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  const known = options.some(o => o.value === value)

  return (
    <NativeSelect
      value={value || ''}
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:EntitySelect:component"]

      onChange={e => onChange(e.target.value)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {value && !known && <option value={value}>{value}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </NativeSelect>
  )
}


// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:AppSelect:component" type="component" identity="AppSelect" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * AppSelect is a specialized component for selecting applications in the admin interface, providing a predefined endpoint and placeholder to streamline the selection process.
 *
 * @macro       Component that facilitates app selection in the admin panel.
 * @micro       Uses a fixed API endpoint to fetch a list of applications.
 * @inputSpec
 *   props: Omit<EntitySelectProps, 'endpoint' | 'placeholder'> — properties for the EntitySelect component.
 * @outputSpec  JSX.Element — renders the EntitySelect component.
 * @sideEffects none
 * @stability   internal
 * @calls       EntitySelect
 * @cil-generated
 */
export function AppSelect(props: Omit<EntitySelectProps, 'endpoint' | 'placeholder'>) {
  return <EntitySelect endpoint="/api/apps?action=list" placeholder="No app (global)" {...props} />
}
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:AppSelect:component"]



// CIL[BEGIN stable_id="~/.framework/src/components/admin/EntitySelect.tsx:PipelineSelect:component" type="component" identity="PipelineSelect" parent="~/.framework/src/components/admin/EntitySelect.tsx"]
/**
 * PipelineSelect is a component that provides a dropdown for selecting a pipeline from a predefined list. It simplifies the usage of the EntitySelect component by pre-configuring the endpoint and placeholder specific to pipelines.
 *
 * @macro       Component that renders a selection interface for pipelines.
 * @micro       Uses the EntitySelect component with a fixed API endpoint for fetching pipeline data.
 * @inputSpec
 *   props: Omit<EntitySelectProps, 'endpoint' | 'placeholder'> — properties for the EntitySelect component excluding endpoint and placeholder.
 * @outputSpec  JSX.Element — renders the EntitySelect component.
 * @sideEffects none
 * @stability   internal
 * @calls       EntitySelect
 * @cil-generated
 */
export function PipelineSelect(props: Omit<EntitySelectProps, 'endpoint' | 'placeholder'>) {
  return <EntitySelect endpoint="/api/pipelines?action=list" placeholder="Select a pipeline…" {...props} />
}
// CIL[END stable_id="~/.framework/src/components/admin/EntitySelect.tsx:PipelineSelect:component"]

