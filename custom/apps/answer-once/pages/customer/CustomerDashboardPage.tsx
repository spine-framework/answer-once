import { useTickets } from '../../hooks/useTickets'
import { TicketCard } from '../../components/TicketCard'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { Badge } from '@core/components/ui/badge'
import { Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function CustomerDashboardPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { tickets, loading } = useTickets()
  const recent = tickets.slice(0, 5)
  const [articles, setArticles] = useState<any[]>([])
  const [kbLoading, setKbLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/admin-data?entity=items&type_slugs=ao_kb_article,ao_kb_shared&status=published&limit=5')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        const items = (json.data || json.items || []).filter(
          (a: any) => a?.data?.learning_scope !== 'shared',
        )
        setArticles(items.slice(0, 5))
        setKbLoading(false)
      })
      .catch(() => { if (!cancelled) setKbLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your support overview</p>
        </div>
        <Button onClick={() => navigate(appPath('/tickets'), { state: { newTicket: true } })} size="sm">
          <Plus size={16} className="mr-1" /> New Ticket
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Recent Tickets</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(appPath('/tickets'))}>
                View all <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
                No tickets yet. Ask a question to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((t) => (
                  <TicketCard key={t.id} ticket={t} onClick={() => navigate(appPath(`/tickets/${t.id}`))} />
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Knowledgebase</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(appPath('/kb'))}>
                Browse <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            {kbLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
                Published articles will appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((a) => {
                  const isShared = a?.type_slug === 'ao_kb_shared' || a?.design_schema?.scope === 'platform'
                  return (
                    <button
                      key={a.id}
                      onClick={() => navigate(appPath(`/kb/${a.id}`))}
                      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate flex-1 min-w-0">{a.title}</h3>
                        {isShared && <Badge variant="secondary">Shared</Badge>}
                      </div>
                      {a.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.description}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
