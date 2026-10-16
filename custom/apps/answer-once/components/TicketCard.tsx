// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/TicketCard.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Ticket list card for the customer and company ticket queues"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a clickable ticket summary with status badge"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/TicketCard.tsx" layer="custom_app" related_files="custom/apps/answer-once/hooks/useTickets.ts, custom/apps/answer-once/components/StatusBadge.tsx"]
// CIL[DOC-CONTRACT inputs="ticket: Ticket, onClick: () => void" outputs="JSX element" errors="none" side_effects="navigation via onClick"]
// CIL[DOC-MICRO logic_summary="Shows title, status, description snippet, and created date" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { Ticket } from '../hooks/useTickets'
import { StatusBadge } from './StatusBadge'
import { Eye } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/components/TicketCard.tsx:module_header:module_header"]

interface TicketCardProps {
  ticket: Ticket
  onClick: () => void
  watching?: boolean
  unread?: boolean
  accountName?: string
  creatorName?: string
}

export function TicketCard({ ticket, onClick, watching, unread, accountName, creatorName }: TicketCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm truncate">{ticket.title}</h3>
          {ticket.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {watching && (
            <Eye size={14} className={unread ? 'text-primary' : 'text-muted-foreground'} aria-label={unread ? 'Watching — unread activity' : 'Watching'} />
          )}
          <StatusBadge status={ticket.status || 'new'} />
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">
        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
        {accountName && <span>· {accountName}</span>}
        {creatorName && <span>· by {creatorName}</span>}
        {ticket.data?.aim_human_assignee_name && (
          <span>· {ticket.data.aim_human_assignee_name}</span>
        )}
      </div>
    </button>
  )
}
