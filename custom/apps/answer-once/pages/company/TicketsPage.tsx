import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { useAuth } from '@core/contexts/AuthContext'
import { useTickets } from '../../hooks/useTickets'
import { useWatchedMap, hasUnreadActivity } from '../../hooks/useWatchers'
import { useDirectory } from '../../hooks/useDirectory'
import { TicketCard } from '../../components/TicketCard'
import { SearchFilterBar } from '../../components/SearchFilterBar'
import { Skeleton } from '@core/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@core/components/ui/tabs'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'needs_attention', label: 'Needs Attention' },
  { value: 'ai_responding', label: 'AI Responding' },
  { value: 'pending_resolution', label: 'Awaiting Customer' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

function needsAttention(ticket: any, watchedMap: Map<string, any>): boolean {
  if (ticket.status === 'human_assigned' || ticket.status === 'open') return true
  return hasUnreadActivity(ticket, watchedMap.get(ticket.id))
}

function matchesFilter(ticket: any, filter: string, watchedMap: Map<string, any>): boolean {
  if (filter === 'all') return true
  if (filter === 'needs_attention') return needsAttention(ticket, watchedMap)
  return ticket.status === filter
}

export default function TicketsPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tickets, loading, error, refetch } = useTickets()
  const { watchedMap } = useWatchedMap(user?.id)
  const { accountName, personName } = useDirectory()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('needs_attention')

  // Lazy auto-resolve sweep — once per day, backs up the scheduled sweep:
  // flips pending_resolution tickets older than 72h to resolved.
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    try { if (localStorage.getItem('ao_auto_resolve_swept') === today) return } catch { /* private mode */ }
    apiFetch('/.netlify/functions/custom_answeronce-journey?action=auto_resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(() => { try { localStorage.setItem('ao_auto_resolve_swept', today) } catch { /* ignore */ } })
      .then(() => refetch())
      .catch(() => {})
  }, [refetch])

  const filtered = tickets.filter((t) =>
    matchesFilter(t, statusFilter, watchedMap) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     (t.description || '').toLowerCase().includes(search.toLowerCase()))
  )

  const counts = {
    all: tickets.length,
    needs_attention: tickets.filter(t => needsAttention(t, watchedMap)).length,
    ai_responding: tickets.filter(t => t.status === 'ai_responding').length,
    pending_resolution: tickets.filter(t => t.status === 'pending_resolution').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Support queue</p>
      </div>
      <div className="px-6 py-3 border-b border-border space-y-3">
        <SearchFilterBar placeholder="Search tickets…" value={search} onChange={setSearch} />
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="h-8 max-w-full overflow-x-auto justify-start">
            {STATUS_FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-xs shrink-0">
                {f.label}
                {counts[f.value as keyof typeof counts] > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                    {counts[f.value as keyof typeof counts]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No tickets match this filter.</div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {filtered.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                watching={watchedMap.has(t.id)}
                unread={hasUnreadActivity(t, watchedMap.get(t.id))}
                accountName={accountName(t.account_id)}
                creatorName={personName(t.created_by)}
                onClick={() => navigate(appPath(`/company/tickets/${t.id}`))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
