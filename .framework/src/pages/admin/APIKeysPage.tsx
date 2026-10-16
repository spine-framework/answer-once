// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Module header for the admin API keys list page, importing dependencies and defining the page component scope."]
// CIL[DOC-RESPONSIBILITY responsibility="Set up imports and module metadata for APIKeysPage."]
// CIL[DOC-CONTEXT module="admin/api-keys" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains import statements for the page; no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai-coder"]




import React, { useState } from 'react'
import { Plus, Key, CheckCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'

import { PageInstructions } from '../../components/admin/PageInstructions'
import { formatDateTime } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for the admin API keys list page, importing dependencies and defining the page component scope.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:apikey:interface" type="interface" identity="apikey" parent="none"]
// CIL[DOC-MACRO purpose="Define the TypeScript shape of an API key record."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a typed interface for API key data."]
// CIL[DOC-CONTEXT module="admin/api-keys" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/APIKeysPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="APIKey type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes fields for an API key including id, name, key_type, is_active, usage, integration, and creator." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface APIKey {
  id: string
  name: string
  key_type: 'inbound' | 'outbound'
  is_active: boolean
  last_used_at?: string
  expires_at?: string
  rate_limit?: number
  usage_count?: number
  integration?: {
    id: string
    name: string
    provider: string
  }
  created_by_person?: {
    id: string
    full_name: string
    email: string
  }
  created_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the TypeScript shape of an API key record.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:apikey:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:apikeyspage:function" type="function" identity="apikeyspage" parent="none"]
// CIL[DOC-MACRO purpose="Render the admin API keys list page with search, filtering, sorting, and usage statistics."]
// CIL[DOC-RESPONSIBILITY responsibility="Display and filter API keys; handle row navigation."]
// CIL[DOC-CONTEXT module="admin/api-keys" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/APIKeysPage.tsx"]
// CIL[DOC-CONTRACT inputs="none (React hook props and local state)" outputs="JSX page rendering" errors="Throws if API fetch fails (handled by useApi error state)" side_effects="Fetches /api/api-keys on mount; navigates on row click"]
// CIL[DOC-MICRO logic_summary="Fetches API keys, applies search/status/type filters, sorts, and renders a SortableTableHeader table with stats cards and usage instructions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function APIKeysPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: apiKeys, loading, error, refetch } = useApi<APIKey[]>(
    async () => {
      const response = await apiFetch('/api/api-keys?action=list')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const result = await response.json()
      return (result.data || result) as APIKey[]
    },
    { immediate: true }
  )

  const filteredKeys = (apiKeys || []).filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (key.integration?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && key.is_active) ||
      (selectedStatus === 'inactive' && !key.is_active)
    const matchesType = selectedType === 'all' || key.key_type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (key: APIKey) => {
    window.location.href = `/spine-framework/admin/configs/api-keys/${key.id}`
  }

  const sortedKeys = [...(filteredKeys || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof APIKey]
    let bValue: any = b[sortKey as keyof APIKey]
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'boolean') {
      return sortDirection === 'asc' ? (aValue ? 1 : 0) : (bValue ? 1 : 0)
    }
    
    return 0
  })

  const isExpired = (key: APIKey) => {
    if (!key.expires_at) return false
    return new Date(key.expires_at) < new Date()
  }

  const statsCards = [
    {
      title: 'Total Keys',
      value: (apiKeys || []).length,
      icon: Key,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active',
      value: (apiKeys || []).filter(k => k.is_active).length,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      title: 'Inbound Keys',
      value: (apiKeys || []).filter(k => k.key_type === 'inbound').length,
      icon: ShieldCheck,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Expiring Soon',
      value: (apiKeys || []).filter(k => {
        if (!k.expires_at) return false
        const days = Math.ceil((new Date(k.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days > 0 && days <= 7
      }).length,
      icon: Clock,
      iconColor: 'text-orange-500'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' }
  ]

  const filters = [
    {
      label: 'Status',
      value: selectedStatus,
      options: statusOptions,
      onChange: setSelectedStatus
    },
    {
      label: 'Type',
      value: selectedType,
      options: typeOptions,
      onChange: setSelectedType
    }
  ]

  return (
    <AdminListPage
      title="API Keys"
      description="Manage API keys and access tokens"
      noPageInstructions
      newButtonText="Generate API Key"
      newButtonHref="/spine-framework/admin/configs/api-keys/new"
      statsCards={statsCards}
      searchPlaceholder="Search API keys..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No API keys found"
      emptyIcon={Key}
    >
      <PageInstructions
        title="API key usage instructions"
        description="API keys are generated tokens that authenticate external callers or service-to-service calls. The full key is shown once after creation. Copy it immediately and store it securely."
        sections={[
          { title: '1. Inbound webhooks (authenticate callers to Spine)', content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Create an <code className="text-xs bg-muted px-1 rounded">inbound</code> key, optionally bound to an Integration. Send the key in the request header to <code className="text-xs bg-muted px-1 rounded">/api/integration-routes</code>:
              </p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto font-mono">{`X-Api-Key: sk_...`}</pre>
              <p className="text-sm text-slate-600">
                The Integration Broker will validate the key and route the event to the adapter defined by the integration.
              </p>
            </div>
          )},
          { title: '2. Outbound / service calls (use a key instead of an env var)', content: (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                You can use a literal key value in an integration's <code className="text-xs bg-muted px-1 rounded">credentials</code> instead of <code className="text-xs bg-muted px-1 rounded">env_var</code>. Create a key, copy the value, and paste it into the integration's credentials JSON with <code className="text-xs bg-muted px-1 rounded">source: "value"</code>:
              </p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto font-mono">{JSON.stringify({ api_token: { source: 'value', value: 'sk_...' } }, null, 2)}</pre>
            </div>
          )},
          { title: '3. Key types', content: (
            <div className="space-y-2">
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                <li><strong>inbound</strong> — external services calling Spine (webhooks, API clients).</li>
                <li><strong>outbound</strong> — Spine services calling another system, often linked to an integration.</li>
                <li><strong>internal</strong> — internal Spine function-to-function calls.</li>
                <li><strong>cli</strong> — command-line scripts and tooling.</li>
              </ul>
            </div>
          )},
          { title: '4. Rate limits, scopes, and expiration', content: (
            <p className="text-sm text-slate-600">
              Use <code className="text-xs bg-muted px-1 rounded">rate_limit</code> to throttle usage, set <code className="text-xs bg-muted px-1 rounded">expires_at</code> for short-lived keys, and define <code className="text-xs bg-muted px-1 rounded">permissions</code> / <code className="text-xs bg-muted px-1 rounded">scopes</code> as JSON arrays to restrict what the key can do.
            </p>
          )},
        ]}
      />

      {sortedKeys.length === 0 ? (
        <div className="p-8 text-center">
          <Key className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No API keys found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Name"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Type"
                sortKey="key_type"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Status"
                sortKey="is_active"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Integration"
                sortKey="integration"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Usage"
                sortKey="usage_count"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Expires"
                sortKey="expires_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedKeys.map((key) => (
              <tr 
                key={key.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(key)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-900">
                    <span className="text-accent-blue hover:text-navy">
                      {key.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {key.created_by_person?.full_name || key.created_by_person?.email || 'System'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                    key.key_type === 'inbound'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {key.key_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                    key.is_active && !isExpired(key)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {key.is_active && !isExpired(key) ? 'Active' : isExpired(key) ? 'Expired' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {key.integration?.name || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {key.usage_count?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {key.expires_at ? (
                    <span className={isExpired(key) ? 'text-red-600' : ''}>
                      {formatDateTime(key.expires_at)}
                    </span>
                  ) : (
                    'Never'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-slate-400">→</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminListPage>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the admin API keys list page with search, filtering, sorting, and usage statistics.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/APIKeysPage.tsx:apikeyspage:function"]