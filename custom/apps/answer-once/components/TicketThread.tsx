import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Bot, AlertCircle, User, Loader2 } from 'lucide-react'
import { useTicketThread, TicketMessage } from '../hooks/useTicketThread'
import { useAgentSteps, useFinalizeTicket, AGENT_TERMINAL_MESSAGE_TYPES } from '../hooks/useTickets'
import { useAuth } from '@core/contexts/AuthContext'
import { apiFetch } from '@core/lib/api'
import { ensureWatching, touchTicketActivity, normalizeDataForWrite } from '../hooks/useWatchers'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { ScrollArea } from '@core/components/ui/scroll-area'
import { AIMessageCard } from './AIMessageCard'

// Internal agent step rows (plan/thinking/tool_call/tool_result) never render
// as conversation entries — while the episode runs they narrate inside one
// "AI Agent" box, and once it ends they disappear entirely (provenance stays
// in the thread record, it just isn't shown to the customer).
const STEP_TYPES = new Set(['plan', 'thinking', 'tool_call', 'tool_result'])
const isStepMessage = (m: any) => STEP_TYPES.has(m.data?.message_type)

// Compact timestamp for thread entries — "Oct 13, 9:12 PM"
export const fmtThreadTime = (ts?: string) =>
  ts ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

export const describeStep = (m: any): string => {
  const mt = m.data?.message_type
  const tool = m.data?.tool
  if (mt === 'tool_call') {
    if (tool === 'search_knowledge') return 'Searching the knowledge base…'
    if (tool === 'escalate_to_human') return 'Escalating to a human…'
    if (tool === 'ask_user') return 'Asking a follow-up…'
    return `Using ${tool || 'a tool'}…`
  }
  if (mt === 'tool_result') {
    const res = m.data?.result || m.data?.tool_result
    const count = res?.results?.length ?? res?.count
    if (typeof count === 'number') {
      return count === 0
        ? 'No matching articles found'
        : `Found ${count} knowledge ${count === 1 ? 'match' : 'matches'}`
    }
    if (m.data?.tool === 'escalate_to_human' || /escalate/i.test(m.content || '')) {
      return 'Handed to the human queue'
    }
    if (m.data?.tool === 'search_knowledge' || /search_knowledge/i.test(m.content || '')) {
      return 'Search complete'
    }
    if (m.data?.tool === 'send_notification' || /send_notification/i.test(m.content || '')) {
      return 'Notification sent'
    }
    const fallback = (m.content || 'Tool finished').replace(/ completed$/, '')
    // Never leak raw snake_case tool names into the narration
    return /^[a-z_]+$/.test(fallback) ? 'Tool finished' : fallback
  }
  return 'Reasoning over the evidence…'
}

// Single "AI Agent" activity card — the last few step narrations plus a live
// spinner line. Shared by the thread (live episode) and the new-ticket
// composer (pre-navigation pending state) so the transition is seamless.
export function AgentActivityBox({
  steps,
  starting,
  elapsedS,
}: {
  steps: string[]
  starting?: boolean
  elapsedS?: number | null
}) {
  return (
    <div className="flex flex-col items-start">
      <div className="bg-card border rounded-lg px-3 py-2 text-sm space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 flex items-center gap-1">
          <Bot size={10} /> AI Agent
        </p>
        {steps.map((label, i) => (
          <p
            key={i}
            className={`text-xs ${i === steps.length - 1 ? 'text-foreground' : 'text-muted-foreground/70'}`}
          >
            {label}
          </p>
        ))}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {starting || steps.length === 0 ? 'Agent starting…' : 'Thinking…'}
          {elapsedS != null && <span className="tabular-nums">({elapsedS}s)</span>}
        </p>
      </div>
    </div>
  )
}

// Persistent "AI Agent" provenance card for support — same box styling, all
// described steps, no spinner. Replaces the per-step rows in the company
// ticket thread so staff can see what the agent did after the episode ends.
export function AgentRunCard({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null
  return (
    <div className="flex flex-col items-start">
      <div className="bg-card border rounded-lg px-3 py-2 text-sm space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 flex items-center gap-1">
          <Bot size={10} /> AI Agent
        </p>
        {steps.map((label, i) => (
          <p
            key={i}
            className={`text-xs ${i === steps.length - 1 ? 'text-foreground' : 'text-muted-foreground/70'}`}
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  )
}

interface TicketThreadProps {

  ticketId: string
  ticketStatus?: string
  ticketData?: Record<string, any>
  ticketDescription?: string
  onStatusChange?: (status: string) => void
  initialTriage?: { threadId: string; firstMessage: string } | null
  onTriageStarted?: () => void
  onTriageFinished?: () => void
}

export function TicketThread({
  ticketId,
  ticketStatus,
  ticketData,
  ticketDescription,
  onStatusChange,
  initialTriage,
  onTriageStarted,
  onTriageFinished,
}: TicketThreadProps) {
  const { thread, messages, loading, loaded, error, sendMessage, refetch } = useTicketThread(ticketId)
  const { runSteps, loading: agentLoading } = useAgentSteps()
  const { finalize, loading: finalizeLoading } = useFinalizeTicket()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [triageStarted, setTriageStarted] = useState(false)
  const [now, setNow] = useState(Date.now())
  const agentStartedAt = useRef<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start triage when a new ticket is created with a thread, or reconcile an
  // ai_responding ticket after a remount. The gate requires a successful
  // first load ('loaded' + no 'error') so a transient fetch failure can never
  // masquerade as an empty thread and re-fire the episode. When messages
  // already exist the episode is running or finished — runSteps is called
  // with an empty message (supervise/takeover + finalize), which can never
  // insert an inbound row or reset a completed episode. Only the genuinely
  // empty-thread case kicks with the question text.
  useEffect(() => {
    if (triageStarted) return
    const shouldAutoStart =
      !initialTriage && ticketStatus === 'ai_responding' && loaded && !error && !loading && !!thread?.id
    const triage = initialTriage ?? (shouldAutoStart
      ? { threadId: thread!.id, firstMessage: messages.length === 0 ? ticketDescription || '' : '' }
      : null)
    if (!triage?.threadId) return
    if (initialTriage && !triage.firstMessage) return

    setTriageStarted(true)
    onTriageStarted?.()
    runSteps(triage.threadId, triage.firstMessage, refetch)
      .then(() => refetch())
      .then(() => finalize(ticketId, triage.threadId))
      .then(() => onTriageFinished?.())
      .catch(() => onTriageFinished?.())
  }, [initialTriage, triageStarted, ticketId, ticketStatus, messages.length, loading, loaded, error, thread?.id, ticketDescription, runSteps, finalize, refetch, onTriageStarted, onTriageFinished])

  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    try {
      await sendMessage(content, { name: user?.full_name || user?.email, role: 'Customer' })
      setInput('')
      if (user?.id) void ensureWatching(ticketId, user.id)

      const patchTicket = (fields: Record<string, any>) =>
        apiFetch(`/api/admin-data?entity=items&id=${ticketId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        }).then(() => onStatusChange?.(fields.status))

      // Branch on the live record, not props — support can assign/resolve
      // while this page is open, and a stale status here writes the wrong
      // transition (observed: a stale 'human_assigned' prop demoted a ticket
      // support had just resolved, without reopen metadata).
      let liveStatus = ticketStatus
      let liveData = ticketData
      try {
        const res = await apiFetch(`/api/admin-data?entity=items&id=${ticketId}`)
        const fresh = await res.json().then((j) => j?.data ?? j)
        if (fresh?.status) { liveStatus = fresh.status; liveData = fresh.data || liveData }
      } catch { /* fall back to props */ }

      // A comment on a resolved/closed ticket is a definitive negative
      // outcome: reopen and hand straight to a human — no AI second chance
      // on a case it already declared closed.
      if (liveStatus === 'resolved' || liveStatus === 'closed') {
        const now = new Date().toISOString()
        void patchTicket({
          status: 'human_assigned',
          data: {
            ...normalizeDataForWrite(liveData || {}),
            reopened_at: now,
            reopen_reason: 'customer_returned',
            resolved_at: null,
            resolved_via: null,
            aim_resolved_by_ai: false,
            demand_class: null,
            ha_article_id: null,
            human_minutes: null,
            last_activity_at: now,
          },
        })
      } else if (liveStatus === 'in_progress' || liveStatus === 'human_assigned') {
        // A reply on a human-owned ticket pops it back into the support queue
        // (assignee preserved); AI-owned tickets just get activity.
        void patchTicket({ status: 'human_assigned' })
      }
      void touchTicketActivity(ticketId)

      // Pending-resolution behavior depends on who proposed the answer:
      // AI-proposed → a reply continues the conversation (re-run triage —
      // a confident follow-up re-enters pending, a weak one escalates);
      // human-proposed → the case returns to its human owner.
      if (liveStatus === 'pending_resolution' && thread?.id) {
        if (liveData?.pending_proposed_by === 'human') {
          void patchTicket({ status: 'in_progress' })
        } else {
          const now = new Date().toISOString()
          await patchTicket({
            status: 'ai_responding',
            data: { ...normalizeDataForWrite(liveData || {}), last_activity_at: now },
          })
          onTriageStarted?.()
          await runSteps(thread.id, content, refetch)
          await refetch()
          await finalize(ticketId, thread.id)
          onTriageFinished?.()
        }
      } else if (liveStatus === 'ai_responding' && thread?.id) {
        // If the ticket was already triaged and is waiting on the customer,
        // a new inbound message should resume the agent episode.
        onTriageStarted?.()
        await runSteps(thread.id, content, refetch)
        await refetch()
        await finalize(ticketId, thread.id)
        onTriageFinished?.()
      }
    } finally {
      setSending(false)
    }
  }, [input, sending, sendMessage, ticketStatus, ticketData, thread, ticketId, user, runSteps, finalize, refetch, onStatusChange, onTriageStarted, onTriageFinished])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // The customer's first message isn't saved until the agent episode starts,
  // so a freshly created ticket briefly has an empty thread. Render the text
  // we already know optimistically until the real inbound row lands.
  const optimisticFirst =
    initialTriage?.firstMessage &&
    !messages.some((m) => m.direction === 'inbound' && m.content === initialTriage.firstMessage)
      ? initialTriage.firstMessage
      : null

  // A terminal agent message after the last inbound means the AI has said its
  // piece — don't keep showing "thinking" while the supervisor finishes
  // bookkeeping or while non-renderable rows trail the final message.
  const lastInboundIdx = messages.reduce((last, m, i) => (m.direction === 'inbound' ? i : last), -1)
  const agentSettled = messages
    .slice(lastInboundIdx + 1)
    .some((m) => AGENT_TERMINAL_MESSAGE_TYPES.has(m.data?.message_type))
  const isAgentWorking = (agentLoading || finalizeLoading) && !agentSettled

  // Step rows after the last inbound belong to the current episode — the last
  // few narrate what the agent is doing inside the single activity box.
  const internalSteps = messages.slice(lastInboundIdx + 1).filter(isStepMessage)
  const recentSteps = internalSteps.slice(-4).map(describeStep)
  const latestStep = internalSteps[internalSteps.length - 1]

  // Elapsed timer — ticks each second while the agent works so the wait reads
  // as progress instead of a hung UI.
  useEffect(() => {
    if (!isAgentWorking) {
      agentStartedAt.current = null
      return
    }
    if (!agentStartedAt.current) agentStartedAt.current = Date.now()
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [isAgentWorking])
  const elapsedS = isAgentWorking && agentStartedAt.current
    ? Math.max(0, Math.floor((now - agentStartedAt.current) / 1000))
    : null

  const renderMessage = (msg: any) => {
    const mt = msg.data?.message_type
    const isAgent = mt === 'agent' || mt === 'final'
    const isUser = msg.direction === 'inbound' && !isAgent
    const isHuman = msg.direction === 'outbound' && mt === 'human'

    // Lifecycle markers (resolved/reopened) render as centered thread events
    if (mt === 'system' || mt === 'event') {
      return (
        <div key={msg.id} className="flex justify-center py-1">
          <span className="text-[11px] text-muted-foreground">
            {msg.content}{msg.created_at ? ` · ${fmtThreadTime(msg.created_at)}` : ''}
          </span>
        </div>
      )
    }

    if (isAgent) {
      return (
        <AIMessageCard
          key={msg.id}
          message={msg}
          ticketId={ticketId}
          messageId={msg.id}
          onFeedback={() => { refetch(); onStatusChange?.(ticketStatus || '') }}
        />
      )
    }

    return (
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-md rounded-lg px-4 py-3 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : isHuman
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-muted/80 text-foreground border border-border'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {isUser ? <User size={12} /> : <Bot size={12} />}
            <span className="text-xs opacity-75">
              {msg.data?.author_name
                ? `${msg.data.author_name} · ${msg.data.author_role || (isUser ? 'Customer' : isHuman ? 'Support' : 'AI')}`
                : isUser
                  ? (msg.created_by === user?.id ? 'You' : 'Customer')
                  : isHuman
                    ? 'Support'
                    : 'Answer Once · AI'}
            </span>
          </div>
          <div className="whitespace-pre-wrap">{msg.content}</div>
          <div className="mt-1 text-[10px] opacity-60 text-right">{fmtThreadTime(msg.created_at)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0 px-4 py-3">
        <div className="space-y-4">
          {loading && messages.length === 0 && !optimisticFirst && (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading conversation…</p>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive p-3 rounded-md bg-destructive/10">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && messages.length === 0 && !optimisticFirst && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No messages yet. Ask your question to get started.</p>
            </div>
          )}

          {optimisticFirst && (
            <div className="flex justify-end">
              <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-primary text-primary-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <User size={12} />
                  <span className="text-xs opacity-75">You</span>
                </div>
                <div className="whitespace-pre-wrap">{optimisticFirst}</div>
              </div>
            </div>
          )}

          {messages.slice(0, lastInboundIdx + 1).filter((m) => !isStepMessage(m)).map(renderMessage)}

          {isAgentWorking && (
            <AgentActivityBox steps={recentSteps} starting={!latestStep} elapsedS={elapsedS} />
          )}

          {messages.slice(lastInboundIdx + 1).filter((m) => !isStepMessage(m)).map(renderMessage)}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        {ticketStatus === 'pending_resolution' && (
          <p className="text-xs text-muted-foreground mb-2">
            We think this is answered — reply if you need more help, otherwise we'll mark it resolved after 3 days.
          </p>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            disabled={sending || isAgentWorking}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || isAgentWorking || !input.trim()} size="icon">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
