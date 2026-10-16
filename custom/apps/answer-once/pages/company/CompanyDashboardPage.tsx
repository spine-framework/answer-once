// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/CompanyDashboardPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company dashboard — support work queue and knowledge review"]
// CIL[DOC-RESPONSIBILITY responsibility="Show tickets needing attention, recent escalations, and knowledge candidates"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/CompanyDashboardPage.tsx" layer="custom_app" related_files="custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Three-column layout: escalated tickets, in-progress tickets, KB candidates" notable_decisions="focuses on what needs attention now"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useTickets } from '../../hooks/useTickets'
import { TicketCard } from '../../components/TicketCard'
import { useAppPath } from '@core/hooks/useAppPath'
import { Skeleton } from '@core/components/ui/skeleton'
import { Button } from '@core/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, CheckCircle, BookOpen, TrendingUp } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/CompanyDashboardPage.tsx:module_header:module_header"]

export default function CompanyDashboardPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { tickets, loading } = useTickets()

  const escalated = tickets.filter((t) => t.status === 'human_assigned')
  const aiOwned = tickets.filter((t) => t.status === 'ai_responding' || t.status === 'pending_resolution')
  const inProgress = tickets.filter((t) => t.status === 'in_progress')
  const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed')

  const stats = [
    { label: 'Needs Human', value: escalated.length, icon: AlertCircle, color: 'text-brand-navy' },
    { label: 'AI Handling', value: aiOwned.length, icon: Clock, color: 'text-brand' },
    { label: 'In Progress', value: inProgress.length, icon: TrendingUp, color: 'text-brand-light' },
    { label: 'Resolved', value: resolved.length, icon: CheckCircle, color: 'text-brand' },
  ]

  const attentionTickets = [...escalated, ...inProgress].slice(0, 10)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Support Dashboard</h1>
        <p className="text-sm text-muted-foreground">What needs attention</p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <s.icon size={16} className={s.color} />
                <span className="text-sm text-muted-foreground truncate">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tickets needing attention */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Needs Attention</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(appPath('/company/tickets'))}>
                View all →
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : attentionTickets.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
                No tickets need attention right now.
              </div>
            ) : (
              <div className="space-y-2">
                {attentionTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} onClick={() => navigate(appPath(`/company/tickets/${t.id}`))} />
                ))}
              </div>
            )}
          </section>

          {/* Knowledge review queue */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Knowledge Review</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(appPath('/company/kb/review'))}>
                Review queue →
              </Button>
            </div>
            <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
              <BookOpen size={24} className="mx-auto mb-2 text-muted-foreground/50" />
              Knowledge candidates will appear here after case analysis.
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
