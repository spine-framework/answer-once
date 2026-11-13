import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useTickets } from '../../hooks/useTickets'
import { useDirectory } from '../../hooks/useDirectory'
import { TicketCard } from '../../components/TicketCard'
import { SearchFilterBar } from '../../components/SearchFilterBar'
import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@core/components/ui/tabs'
import { Plus } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
]

function isResolved(ticket: any): boolean {
  return ticket.status === 'resolved' || ticket.status === 'closed'
}

export default function TicketsPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { tickets, loading, error } = useTickets()
  const { personName } = useDirectory()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dashboard "New Ticket" lands here with state.newTicket — forward to the
  // dedicated /tickets/new composer page.
  useEffect(() => {
    if (location.state?.newTicket) {
      navigate(appPath('/tickets/new'), { replace: true })
    }
  }, [location.state, navigate, appPath])

  const filtered = tickets.filter((t) =>
    (statusFilter === 'all' || (statusFilter === 'resolved' ? isResolved(t) : !isResolved(t))) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     (t.description || '').toLowerCase().includes(search.toLowerCase()))
  )

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => !isResolved(t)).length,
    resolved: tickets.filter(isResolved).length,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Your support requests</p>
        </div>
        <Button onClick={() => navigate(appPath('/tickets/new'))} size="sm">
          <Plus size={16} className="mr-1" /> New Ticket
        </Button>
      </div>

      <div className="px-6 py-3 border-b border-border space-y-3">
        <SearchFilterBar
          placeholder="Search tickets…"
          value={search}
          onChange={setSearch}
        />
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
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {search ? 'No tickets match your search.' : 'No tickets yet. Ask a question to get started.'}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} creatorName={personName(t.created_by)} onClick={() => navigate(appPath(`/tickets/${t.id}`))} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
