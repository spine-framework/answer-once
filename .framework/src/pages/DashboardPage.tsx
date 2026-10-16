// CIL[BEGIN stable_id="~/.framework/src/pages/DashboardPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/DashboardPage.tsx"]
// CIL[DOC-MACRO purpose="Admin dashboard page module"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the dashboard page entry point and declare its dependencies"]
// CIL[DOC-CONTEXT module="dashboard" layer="page" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, auth context, API helpers, routing, and icons for the dashboard page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]


import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../hooks/useApi'
import { apiFetch } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { Box, UserGroupIcon, FileText, BarChart3, Settings, Plus, CubeIcon } from 'lucide-react';
// CIL[DOC-VECTOR type="context" content="purpose='Admin dashboard page module'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/DashboardPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/DashboardPage.tsx:TypeStat:interface" type="interface" identity="TypeStat" parent="~/.framework/src/pages/DashboardPage.tsx"]
// CIL[DOC-MACRO purpose="Type definition for a single entity type statistic"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the fields of a type stat object"]
// CIL[DOC-CONTEXT module="dashboard" layer="type" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/pages/DashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeStat interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares name, count, slug, and icon fields for a statistic card" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TypeStat {
  name: string
  count: number
  slug: string
  icon: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for a single entity type statistic'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/DashboardPage.tsx:TypeStat:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/DashboardPage.tsx:DashboardPage:component" type="component" identity="DashboardPage" parent="~/.framework/src/pages/DashboardPage.tsx"]
// CIL[DOC-MACRO purpose="Render the admin dashboard page"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch item type statistics, render entity cards, and provide quick-action navigation"]
// CIL[DOC-CONTEXT module="dashboard" layer="page" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/pages/DashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX dashboard UI" errors="console.error on failed fetches" side_effects="apiFetch calls and client-side navigation"]
// CIL[DOC-MICRO logic_summary="On mount fetch active item types, counts per type, and renders a grid of cards plus quick action buttons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Array<{
    title: string
    value: number
    icon: any
    color: string
    href: string
  }>>([])
  const [typeStats, setTypeStats] = useState<TypeStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const typesResponse = await apiFetch('/api/types?kind=item&is_active=true')
        if (typesResponse.ok) {
          const response = await typesResponse.json()
          const types = response.data || response
          
          if (!Array.isArray(types)) {
            console.error('Expected array of types, got:', types)
            setTypeStats([])
            return
          }
          
          const statsPromises = types.map(async (type: any) => {
            const countResponse = await apiFetch(`/api/admin-data?action=stats&entity=items&type_slug=${type.slug}`)
            if (countResponse.ok) {
              const countData = await countResponse.json()
              return {
                name: type.name,
                count: countData.count || 0,
                slug: type.slug,
                icon: CubeIcon
              }
            }
            return null
          })
          
          const resolvedStats = await Promise.all(statsPromises)
          const validStats = resolvedStats.filter((s): s is NonNullable<typeof s> => s !== null).slice(0, 8)
          setTypeStats(validStats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [apiFetch])

  const handleCreateNewItem = (typeSlug: string) => {
    navigate(`/spine-framework/admin/data/items/create?typeSlug=${typeSlug}`)
  }

  const handleViewItems = (typeSlug: string) => {
    navigate(`/spine-framework/admin/data/items?typeSlug=${typeSlug}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Entity Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {typeStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.slug}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewItems(stat.slug)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.name}</p>
                    <p className="text-xl font-semibold text-slate-900">{stat.count.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
          
          <div
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/spine-framework/admin/configs/types')}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Configuration</p>
                <p className="text-xl font-semibold text-slate-900">Manage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {typeStats.slice(0, 4).map((stat) => (
            <button
              key={`create-${stat.slug}`}
              onClick={() => handleCreateNewItem(stat.slug)}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">New {stat.name}</span>
            </button>
          ))}
          
          <button 
            onClick={() => navigate('/spine-framework/admin/configs/types')}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Settings className="h-6 w-6" />
            <span className="text-sm font-medium">Configure Types</span>
          </button>
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the admin dashboard page'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/DashboardPage.tsx:DashboardPage:component"]
