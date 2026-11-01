// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-MACRO purpose="Top-level module for the admin threshold alerts configuration page"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide imports and module context for the AlertsConfigPage and AlertModal components"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module imports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, icon components, UI primitives, hooks, and utilities used by the alert management page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai-developer, system-admin"]








import React, { useState } from 'react'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:module_header:module_header"]
  Bell,
  Plus,
  Edit,
  Trash2,
  TriangleAlert,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/Modal'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

// CIL[DOC-VECTOR type="context" content="purpose='Top-level module for the admin threshold alerts configuration page'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Describe the shape of a threshold alert record and its embedded data"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the ThresholdAlert TypeScript interface used across the alerts page"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="type" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares fields for alert identity, title, status, metric, operator, threshold, window, optional pipeline linkage, and timestamps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:ThresholdAlert:interface" type="interface" identity="ThresholdAlert" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
interface ThresholdAlert {
  id: string
  title: string
  description?: string
  status: 'active' | 'inactive'
  data: {
    metric: 'error_rate' | 'latency_p95' | 'pipeline_failure_rate'
    operator: 'gt' | 'lt'
    value: number
    window_minutes: number
    pipeline_id?: string | null
    is_active: boolean
  }
  created_at: string
  updated_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:ThresholdAlert:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Describe the shape of a threshold alert record and its embedded data'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Describe a selectable pipeline reference"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the minimal Pipeline shape used for alert pipeline selection"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="type" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares id and name fields for pipeline dropdown options" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:Pipeline:interface" type="interface" identity="Pipeline" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
interface Pipeline {
  id: string
  name: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:Pipeline:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Describe a selectable pipeline reference'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Provide human-readable labels and units for alert metrics and operators"]
// CIL[DOC-RESPONSIBILITY responsibility="Supply display maps for metric names, operators, and units used in the alert list and modal"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record maps" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines METRIC_LABELS, OPERATOR_LABELS, and UNIT_LABELS records for rendering alert details" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:METRIC_LABELS:constant" type="constant" identity="METRIC_LABELS" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
const METRIC_LABELS: Record<string, string> = {
  error_rate: 'Error Rate',
  latency_p95: 'Latency (P95)',
  pipeline_failure_rate: 'Pipeline Failure Rate',
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:METRIC_LABELS:constant"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:OPERATOR_LABELS:constant" type="constant" identity="OPERATOR_LABELS" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
const OPERATOR_LABELS: Record<string, string> = {
  gt: '>',
  lt: '<',
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:OPERATOR_LABELS:constant"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:UNIT_LABELS:constant" type="constant" identity="UNIT_LABELS" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
const UNIT_LABELS: Record<string, string> = {
  error_rate: '%',
  latency_p95: 'ms',
  pipeline_failure_rate: '%',
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:UNIT_LABELS:constant"]



// CIL[DOC-VECTOR type="context" content="purpose='Provide human-readable labels and units for alert metrics and operators'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Admin page for listing, creating, editing, toggling, and deleting threshold alerts"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the alert list, fetch alert and pipeline data, and handle alert CRUD interactions"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX" errors="Failed to fetch/save/delete/toggle alert" side_effects="Displays browser alert on save/delete errors; navigates and refetches lists"]
// CIL[DOC-MICRO logic_summary="Loads alerts and pipelines with useApi, builds stat cards, renders AdminListPage, and provides handlers for save, delete, toggle, and edit actions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertsConfigPage:component" type="component" identity="AlertsConfigPage" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
export function AlertsConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<ThresholdAlert | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: alerts, loading, error, refetch } = useApi<ThresholdAlert[]>(
    async () => {
      const response = await apiFetch('/api/admin-data?entity=items&type_slug=threshold_alert')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const result = await response.json()
      return (result.data || result || []).filter((item: any) => 
        item.data?.metric || item.title?.includes('Alert') || item.title?.includes('Rate') || item.title?.includes('Latency')
      )
    },
    { immediate: true }
  )

  const { data: pipelines } = useApi<Pipeline[]>(
    async () => {
      const response = await apiFetch('/api/pipelines?action=list')
      if (!response.ok) return []
      const result = await response.json()
      return result.data || result || []
    },
    { immediate: true }
  )

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        type_id: 'threshold_alert',
        title: formData.title,
        description: formData.description,
        status: formData.is_active ? 'active' : 'inactive',
        data: {
          metric: formData.metric,
          operator: formData.operator,
          value: parseFloat(formData.value),
          window_minutes: parseInt(formData.window_minutes),
          pipeline_id: formData.pipeline_id || null,
          is_active: formData.is_active,
        },
      }

      if (editingAlert) {
        const response = await apiFetch(`/api/admin-data?entity=items&id=${editingAlert.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Failed to update alert')
      } else {
        const response = await apiFetch('/api/admin-data?entity=items', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Failed to create alert')
      }

      setIsModalOpen(false)
      setEditingAlert(null)
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save alert')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const response = await apiFetch(`/api/admin-data?entity=items&id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete alert')
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete alert')
    }
  }

  const handleToggleActive = async (alert: ThresholdAlert) => {
    try {
      const response = await apiFetch(`/api/admin-data?entity=items&id=${alert.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: alert.status === 'active' ? 'inactive' : 'active',
          data: {
            ...alert.data,
            is_active: alert.status !== 'active',
          },
        }),
      })
      if (!response.ok) throw new Error('Failed to toggle alert')
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to toggle alert')
    }
  }

  const openCreateModal = () => {
    setEditingAlert(null)
    setIsModalOpen(true)
  }

  const openEditModal = (alert: ThresholdAlert) => {
    setEditingAlert(alert)
    setIsModalOpen(true)
  }

  const getMetricBadge = (metric: string) => {
    const colors: Record<string, string> = {
      error_rate: 'bg-error/10 text-error',
      latency_p95: 'bg-warning/50 text-warning',
      pipeline_failure_rate: 'bg-critical/50 text-critical',
    }
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${colors[metric] || 'bg-muted text-muted-foreground'}`}>
        {METRIC_LABELS[metric] || metric}
      </span>
    )
  }




  const statsCards = [
    {
      title: 'Total Alerts',
      value: alerts?.length || 0,
      icon: Bell,
      iconColor: 'text-primary',
    },
    {
      title: 'Active',
      value: alerts?.filter(a => a.status === 'active').length || 0,
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    {
      title: 'Inactive',
      value: alerts?.filter(a => a.status === 'inactive').length || 0,
      icon: XCircle,
      iconColor: 'text-muted-foreground',
    },
    {
      title: 'With Pipeline',
      value: alerts?.filter(a => a.data?.pipeline_id).length || 0,
      icon: TriangleAlert,
      iconColor: 'text-amber-600',
    },
  ]


  return (
    <AdminListPage
      title="Threshold Alerts"
      description="Configure alerts for system metrics and performance thresholds"
      statsCards={statsCards}
      loading={loading}
      error={error}
      emptyMessage="No alerts configured"
      emptyIcon={Bell}
      newButtonText="Create Alert"
      onNewClick={openCreateModal}
    >
      {actionError && (
        <div className="mx-6 mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-medium">Dismiss</button>
        </div>
      )}
      {alerts && alerts.length === 0 ? (
        <div className="p-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No alerts configured</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first threshold alert to monitor system health
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {alerts?.map((alert) => (
            <div key={alert.id} className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-foreground">{alert.title}</h3>
                    {getMetricBadge(alert.data?.metric)}
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                        alert.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {alert.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {METRIC_LABELS[alert.data?.metric]} {OPERATOR_LABELS[alert.data?.operator]} {alert.data?.value}
                      {UNIT_LABELS[alert.data?.metric]}
                    </span>
                    <span>·</span>
                    <span>Window: {alert.data?.window_minutes} min</span>
                    {alert.data?.pipeline_id && (
                      <>
                        <span>·</span>
                        <span className="text-primary">Pipeline: {alert.data.pipeline_id.slice(0, 8)}...</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(alert)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.status === 'active'
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    title={alert.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {alert.status === 'active' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(alert)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAlert(null)
        }}
        onSave={handleSave}
        alert={editingAlert}
        pipelines={pipelines || []}
      />
    </AdminListPage>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertsConfigPage:component"]


// CIL[DOC-VECTOR type="context" content="purpose='Admin page for listing, creating, editing, toggling, and deleting threshold alerts'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Props contract for the AlertModal form component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the properties passed to AlertModal"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="type" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines isOpen, onClose, onSave, alert, and pipelines props for the alert edit/create modal" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertModalProps:interface" type="interface" identity="AlertModalProps" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  alert: ThresholdAlert | null
  pipelines: Pipeline[]
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertModalProps:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the AlertModal form component'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Modal form for creating and editing threshold alerts"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a controlled form, manage alert state, and call onSave with form data"]
// CIL[DOC-CONTEXT module="admin/alerts" layer="component" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/AlertsConfigPage.tsx"]
// CIL[DOC-CONTRACT inputs="isOpen: boolean, onClose: () => void, onSave: (data: any) => void, alert: ThresholdAlert | null, pipelines: Pipeline[]" outputs="JSX" errors="none" side_effects="Updates local form state on user input; calls onSave on submit"]
// CIL[DOC-MICRO logic_summary="Initializes form state, resets state when the alert or isOpen changes, and renders a form with metric, operator, threshold, window, optional pipeline, and active toggle fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertModal:component" type="component" identity="AlertModal" parent="~/.framework/src/pages/admin/AlertsConfigPage.tsx"]
function AlertModal({ isOpen, onClose, onSave, alert, pipelines }: AlertModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metric: 'error_rate',
    operator: 'gt',
    value: '5',
    window_minutes: '5',
    pipeline_id: '',
    is_active: false,
  })

  React.useEffect(() => {
    if (alert) {
      setFormData({
        title: alert.title,
        description: alert.description || '',
        metric: alert.data?.metric || 'error_rate',
        operator: alert.data?.operator || 'gt',
        value: String(alert.data?.value || '5'),
        window_minutes: String(alert.data?.window_minutes || '5'),
        pipeline_id: alert.data?.pipeline_id || '',
        is_active: alert.status === 'active',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        metric: 'error_rate',
        operator: 'gt',
        value: '5',
        window_minutes: '5',
        pipeline_id: '',
        is_active: false,
      })
    }
  }, [alert, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alert ? 'Edit Alert' : 'Create Alert'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="High Error Rate Alert"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Triggers when error rate exceeds threshold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Metric</label>
            <select
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="error_rate">Error Rate</option>
              <option value="latency_p95">Latency (P95)</option>
              <option value="pipeline_failure_rate">Pipeline Failure Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Operator</label>
            <select
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="gt">Greater than (&gt;)</option>
              <option value="lt">Less than (&lt;)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Threshold Value
              <span className="text-muted-foreground font-normal ml-1">
                ({formData.metric === 'latency_p95' ? 'ms' : '%'})
              </span>
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              min="0"
              step={formData.metric === 'latency_p95' ? '100' : '0.1'}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Window (minutes)</label>
            <select
              value={formData.window_minutes}
              onChange={(e) => setFormData({ ...formData, window_minutes: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Pipeline to Fire (optional)
          </label>
          <select
            value={formData.pipeline_id}
            onChange={(e) => setFormData({ ...formData, pipeline_id: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
          >
            <option value="">None (log only)</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            When breached, this pipeline will be executed. Leave empty to log only.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-navy border-slate-300 rounded focus:ring-navy"
          />
          <label htmlFor="is_active" className="text-sm text-slate-700">
            Activate immediately
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {alert ? 'Update Alert' : 'Create Alert'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/AlertsConfigPage.tsx:AlertModal:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Modal form for creating and editing threshold alerts'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/Modal.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]