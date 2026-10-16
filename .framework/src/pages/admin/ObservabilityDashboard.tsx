// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Admin observability dashboard page"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the top-level React page for visualizing system observability metrics"]
// CIL[DOC-CONTEXT module="observability" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines the admin observability dashboard page module and re-exports the component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]






import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { BarChart3, AlertTriangle, Clock, RefreshCw, Bell } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { PageInstructions } from '../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Admin observability dashboard page'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:MetricData:interface" type="interface" identity="MetricData" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for event volume buckets"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a single bucketed event count"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="MetricData[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="bucket and count fields for chart data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface MetricData {
  bucket: string
  count: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for event volume buckets'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:MetricData:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:ErrorRateData:interface" type="interface" identity="ErrorRateData" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for error rate aggregation"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe total, error, and rate fields"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="ErrorRateData" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="total, errors, and rate fields for error summary" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ErrorRateData {
  total: number
  errors: number
  rate: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for error rate aggregation'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:ErrorRateData:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:LatencyData:interface" type="interface" identity="LatencyData" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for latency percentiles"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe p50, p90, p95, p99 latency metrics"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="LatencyData" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="percentile fields for latency distribution" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface LatencyData {
  p50: number
  p90: number
  p95: number
  p99: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for latency percentiles'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:LatencyData:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:PipelineStats:interface" type="interface" identity="PipelineStats" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for pipeline execution statistics"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe per-pipeline success, failure, and duration metrics"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="PipelineStats[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="pipeline_id, success_count, failure_count, and avg_duration_ms fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PipelineStats {
  pipeline_id: string
  success_count: number
  failure_count: number
  avg_duration_ms: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for pipeline execution statistics'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:PipelineStats:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:TopActor:interface" type="interface" identity="TopActor" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for top actor counts"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a principal and its event count"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="TopActor[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="principal_id and event_count fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TopActor {
  principal_id: string
  event_count: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for top actor counts'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:TopActor:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:AlertEvent:interface" type="interface" identity="AlertEvent" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Data shape for threshold alert events"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe an alert with metric, threshold, actual, and timestamp"]
// CIL[DOC-CONTEXT module="observability" layer="type" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="AlertEvent[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="id, metric, threshold_value, actual_value, and created_at fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AlertEvent {
  id: string
  metric: string
  threshold_value: number
  actual_value: number
  created_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Data shape for threshold alert events'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:AlertEvent:interface"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:colors:constant" type="constant" identity="COLORS" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Chart color palette"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide default color codes for charts"]
// CIL[DOC-CONTEXT module="observability" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="string[]" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="static array of hex color values for use in charts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
// CIL[DOC-VECTOR type="context" content="purpose='Chart color palette'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:colors:constant"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:ObservabilityDashboard:component" type="component" identity="ObservabilityDashboard" parent="~/.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-MACRO purpose="Render the observability dashboard"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display event volume, error rate, latency, pipeline health, top actors, and recent alerts"]
// CIL[DOC-CONTEXT module="observability" layer="component" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/ObservabilityDashboard.tsx"]
// CIL[DOC-CONTRACT inputs="timeRange and refreshInterval from local state" outputs="JSX dashboard" errors="failed API fetches" side_effects="periodic refetch via setInterval"]
// CIL[DOC-MICRO logic_summary="Uses useApi hooks to call observability endpoints, derives chart data and stats, and renders charts and alerts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ObservabilityDashboard() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [refreshInterval, setRefreshInterval] = useState(30)

  const timeParams = useMemo(() => {
    const now = new Date()
    let from = new Date()
    switch (timeRange) {
      case '1h':
        from = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    return {
      from: from.toISOString(),
      to: now.toISOString(),
    }
  }, [timeRange])

  
  const { data: eventVolume, loading: loadingVolume, refetch: refetchVolume } = useApi<MetricData[]>(
    async () => {
      const bucket = timeRange === '1h' ? 'minute' : timeRange === '24h' ? 'hour' : 'day'
      const response = await apiFetch(
        `/api/observability?action=event_volume&from=${encodeURIComponent(timeParams.from)}&to=${encodeURIComponent(timeParams.to)}&bucket=${bucket}`
      )
      if (!response.ok) return []
      const result = await response.json()
      return (result.data || result || []).map((d: any) => ({
        bucket: new Date(d.bucket).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: timeRange === '1h' ? 'numeric' : undefined,
        }),
        count: parseInt(d.count),
      }))
    },
    { immediate: true, deps: [timeRange] }
  )

  
  const { data: errorRate, loading: loadingError, refetch: refetchError } = useApi<ErrorRateData>(
    async () => {
      const response = await apiFetch(
        `/api/observability?action=error_rate&from=${encodeURIComponent(timeParams.from)}&to=${encodeURIComponent(timeParams.to)}`
      )
      if (!response.ok) return { total: 0, errors: 0, rate: 0 }
      const result = await response.json()
      return result.data || result || { total: 0, errors: 0, rate: 0 }
    },
    { immediate: true, deps: [timeRange] }
  )

  
  const { data: latency, loading: loadingLatency, refetch: refetchLatency } = useApi<LatencyData>(
    async () => {
      const response = await apiFetch(
        `/api/observability?action=latency_percentiles&from=${encodeURIComponent(timeParams.from)}&to=${encodeURIComponent(timeParams.to)}`
      )
      if (!response.ok) return { p50: 0, p90: 0, p95: 0, p99: 0 }
      const result = await response.json()
      return result.data || result || { p50: 0, p90: 0, p95: 0, p99: 0 }
    },
    { immediate: true, deps: [timeRange] }
  )

  
  const { data: pipelineStats, loading: loadingPipelines, refetch: refetchPipelines } = useApi<PipelineStats[]>(
    async () => {
      const response = await apiFetch(
        `/api/observability?action=pipeline_stats&from=${encodeURIComponent(timeParams.from)}&to=${encodeURIComponent(timeParams.to)}`
      )
      if (!response.ok) return []
      const result = await response.json()
      return result.data || result || []
    },
    { immediate: true, deps: [timeRange] }
  )

  
  const { data: topActors, loading: loadingActors, refetch: refetchActors } = useApi<TopActor[]>(
    async () => {
      const response = await apiFetch(
        `/api/observability?action=top_actors&from=${encodeURIComponent(timeParams.from)}&to=${encodeURIComponent(timeParams.to)}&limit=5`
      )
      if (!response.ok) return []
      const result = await response.json()
      return result.data || result || []
    },
    { immediate: true, deps: [timeRange] }
  )

  
  const { data: recentAlerts } = useApi<AlertEvent[]>(
    async () => {
      const response = await apiFetch('/api/logs?action=account&event=threshold.breached&limit=5')
      if (!response.ok) return []
      const result = await response.json()
      return (result.data || result || []).slice(0, 5)
    },
    { immediate: true }
  )

  
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVolume()
      refetchError()
      refetchLatency()
      refetchPipelines()
      refetchActors()
    }, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const pipelineChartData = useMemo(() => {
    return (pipelineStats || []).map((stat) => ({
      name: stat.pipeline_id.slice(0, 8),
      success: parseInt(stat.success_count as any),
      failure: parseInt(stat.failure_count as any),
      avgDuration: Math.round(parseFloat(stat.avg_duration_ms as any)),
    }))
  }, [pipelineStats])

  const statsCards = [
    {
      title: 'Total Events',
      value: eventVolume?.reduce((sum, d) => sum + d.count, 0) || 0,
      icon: BarChart3,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Error Rate',
      value: `${(errorRate?.rate || 0).toFixed(2)}%`,
      icon: AlertTriangle,
      iconColor: errorRate && errorRate.rate > 5 ? 'text-red-500' : 'text-amber-500',
      bgColor: errorRate && errorRate.rate > 5 ? 'bg-red-50' : 'bg-amber-50',
    },
    {
      title: 'P95 Latency',
      value: `${Math.round(latency?.p95 || 0)}ms`,
      icon: Clock,
      iconColor: latency && latency.p95 > 2000 ? 'text-red-500' : 'text-green-500',
      bgColor: latency && latency.p95 > 2000 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      title: 'Active Pipelines',
      value: pipelineStats?.length || 0,
      icon: RefreshCw,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  const isLoading = loadingVolume || loadingError || loadingLatency || loadingPipelines || loadingActors

  const handleRefresh = () => {
    refetchVolume()
    refetchError()
    refetchLatency()
    refetchPipelines()
    refetchActors()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Observability Dashboard</h1>
          <p className="text-slate-500 mt-1">System health and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
          >
            <option value={10}>Refresh: 10s</option>
            <option value={30}>Refresh: 30s</option>
            <option value={60}>Refresh: 1m</option>
          </select>
          <Button variant="secondary" onClick={handleRefresh} className="text-sm">
            Refresh Now
          </Button>
        </div>
      </div>

      <PageInstructions
        description="Review observability metrics and trace summaries."
        sections={[
          { title: 'What this page is for', content: 'This page shows real-time metrics for event volume, error rates, latency percentiles, and pipeline execution.' },
          { title: 'How to read the cards', content: 'The stats cards show Total Events, Error Rate, P95 Latency, and Active Pipelines. Values change color when thresholds are exceeded (e.g., error rate above 5% or p95 above 2000ms).' },
          { title: 'How to filter and interpret', content: 'Use the time range selector (1h, 24h, 7d) and refresh interval to control the window. Charts below the cards show trends for events, errors, latency, and pipeline success or failure.' },
          { title: 'Important notes', content: 'Alert events are listed when metrics cross their configured thresholds. Top actors show the principals driving the most events.' },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && !eventVolume ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      ) : (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Volume Chart */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventVolume || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latency Percentiles */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Latency Percentiles</h3>
              <div className="h-64">
                {latency ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="grid grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">{Math.round(latency.p50)}ms</div>
                        <div className="text-sm text-slate-500 mt-1">P50 (Median)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-500">{Math.round(latency.p90)}ms</div>
                        <div className="text-sm text-slate-500 mt-1">P90</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-500">{Math.round(latency.p99)}ms</div>
                        <div className="text-sm text-slate-500 mt-1">P99</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No latency data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Health */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Pipeline Health</h3>
              <div className="h-64">
                {pipelineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="success" fill="#10b981" />
                      <Bar dataKey="failure" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No pipeline executions in this time range
                  </div>
                )}
              </div>
            </div>

            {/* Top Actors */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Actors</h3>
              <div className="space-y-3">
                {topActors && topActors.length > 0 ? (
                  topActors.map((actor, index) => (
                    <div key={actor.principal_id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {actor.principal_id.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">{actor.event_count} events</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-8">No activity data</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
              <Link
                to="/spine-framework/admin/observability/alerts"
                className="text-sm text-navy hover:underline flex items-center gap-1"
              >
                <Bell className="h-4 w-4" />
                Manage Alerts
              </Link>
            </div>
            <div className="space-y-2">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <span className="font-medium text-slate-900">
                          {alert.metric} threshold breached
                        </span>
                        <span className="text-sm text-slate-500 ml-2">
                          Expected: {alert.threshold_value}, Got: {alert.actual_value?.toFixed(2) ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatDateTime(alert.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8">No recent alerts</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the observability dashboard'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/ObservabilityDashboard.tsx:ObservabilityDashboard:component"]