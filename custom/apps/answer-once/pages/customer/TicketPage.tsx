// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/customer/TicketPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Customer ticket detail — conversation with Answer Once"]
// CIL[DOC-RESPONSIBILITY responsibility="Show the ticket metadata and external conversation thread; handle triage and follow-up messages"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/customer/TicketPage.tsx" layer="custom_app" related_files="custom/apps/answer-once/hooks/useTickets.ts, custom/apps/answer-once/hooks/useTicketThread.ts, custom/apps/answer-once/components/TicketThread.tsx"]
// CIL[DOC-CONTRACT inputs="route param id" outputs="JSX page" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Loads ticket + external thread; if navigated here with triage state, starts agent episode and finalizes" notable_decisions="triage state is passed via React Router location.state from the create flow"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useTicket, useNewTicket } from '../../hooks/useTickets'
import { TicketThread, AgentActivityBox } from '../../components/TicketThread'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '@core/components/ui/button'
import { Textarea } from '@core/components/ui/textarea'
import { Skeleton } from '@core/components/ui/skeleton'
import { ArrowLeft, Send, User } from 'lucide-react'
import { useEffect, useState } from 'react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/customer/TicketPage.tsx:module_header:module_header"]

export default function TicketPage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'new'
  const { ticket, loading, error, refetch } = useTicket(isNew ? null : id || null)
  const { createTicket, loading: creating, error: createError } = useNewTicket()
  const [triageDone, setTriageDone] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [newSending, setNewSending] = useState(false)

  // Triage state passed from the creation flow — captured in component state
  // so it survives the router-state clear below (otherwise the optimistic
  // first message flickers out until the persisted inbound row lands).
  const [initialTriage] = useState<{ threadId: string; firstMessage: string } | null>(
    () => (location.state?.triage as { threadId: string; firstMessage: string } | null) ?? null
  )

  // Clear the router state so a refresh doesn't re-run triage
  useEffect(() => {
    if (initialTriage) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [initialTriage, navigate, location.pathname])

  const handleTriageFinished = () => {
    setTriageDone(true)
    refetch()
  }

  const handleCreate = async () => {
    const message = newMessage.trim()
    if (!message || newSending) return
    setNewSending(true)
    try {
      const result = await createTicket(message)
      // Same component stays mounted — swap /tickets/new for the real id in the
      // address bar (replace, so Back doesn't return to the composer) and hand
      // the thread id + first message to the triage effect via router state.
      navigate(appPath(`/tickets/${result.ticketId}`), {
        replace: true,
        state: result.escalated
          ? {}
          : { triage: { threadId: result.threadId, firstMessage: message } },
      })
    } catch {
      // error surfaced via the hook
    } finally {
      setNewSending(false)
    }
  }

  if (isNew) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(appPath('/tickets'))}>
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">New Ticket</h1>
            <p className="text-sm text-muted-foreground">Ask a question to start a support request</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="max-w-2xl mx-auto space-y-3">
            {createError && (
              <div className="text-sm text-destructive">{createError}</div>
            )}
            {newSending ? (
              // The ticket/thread create is a server round-trip (~seconds).
              // Render the same pending state the ticket page will show so the
              // click never feels dead — it continues seamlessly after navigate.
              <>
                <div className="flex justify-end">
                  <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-primary text-primary-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={12} />
                      <span className="text-xs opacity-75">You</span>
                    </div>
                    <div className="whitespace-pre-wrap">{newMessage}</div>
                  </div>
                </div>
                <AgentActivityBox steps={['Sending your question…']} starting />
              </>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No messages yet. Type your question below to get started.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What do you need help with?"
              disabled={creating || newSending}
              className="flex-1 min-h-[44px] max-h-40"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCreate()
                }
              }}
            />
            <Button
              onClick={handleCreate}
              disabled={creating || newSending || !newMessage.trim()}
              size="icon"
              className="self-end"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(appPath('/tickets'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold truncate">{ticket?.title || 'Ticket'}</h1>
              <StatusBadge status={ticket?.status || 'new'} />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {ticket?.created_at ? `Created ${new Date(ticket.created_at).toLocaleDateString()}` : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-sm text-destructive">{error}</div>
        ) : (
          <TicketThread
            ticketId={id!}
            ticketStatus={ticket?.status}
            ticketData={ticket?.data}
            ticketDescription={ticket?.description}
            initialTriage={initialTriage}
            onStatusChange={() => refetch()}
            onTriageFinished={handleTriageFinished}
          />
        )}
      </div>
    </div>
  )
}
