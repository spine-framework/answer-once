// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/TicketPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company ticket workspace — external customer thread + internal notes + actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Show ticket detail with external/internal threads, reply box, and resolution actions for support"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/TicketPage.tsx" layer="custom_app" related_files="custom/apps/answer-once/hooks/useTickets.ts, custom/apps/answer-once/hooks/useSupportThreads.ts"]
// CIL[DOC-CONTRACT inputs="route param id" outputs="JSX page" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Two-pane layout: left = conversation threads, right = ticket metadata; lifecycle actions live in the composer footer and appear by state" notable_decisions="agent step messages collapse into persistent AI Agent cards for provenance; case-analysis runs narrate via activity card in-thread and results render as a thread card"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useAuth } from '@core/contexts/AuthContext'
import { apiFetch } from '@core/lib/api'
import { useTicket, useUpdateTicket, useAgentSteps } from '../../hooks/useTickets'
import { useSupportThreads } from '../../hooks/useSupportThreads'
import { useWatch, ensureWatching, touchTicketActivity, normalizeDataForWrite } from '../../hooks/useWatchers'
import { useDirectory } from '../../hooks/useDirectory'
import { StatusBadge } from '../../components/StatusBadge'
import { AgentActivityBox, AgentRunCard, describeStep, fmtThreadTime } from '../../components/TicketThread'
import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import { ScrollArea } from '@core/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@core/components/ui/tabs'
import { ArrowLeft, Send, Lock, Globe, Bot, User, CheckCircle, Clock, Brain, BookOpen, Eye, EyeOff, Info } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'

const STEP_TYPES = new Set(['plan', 'thinking', 'tool_call', 'tool_result'])
const isStepMessage = (m: any) => STEP_TYPES.has(m.data?.message_type)
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/TicketPage.tsx:module_header:module_header"]

function ThreadMessage({ msg }: { msg: any }) {
  const mt = msg.data?.message_type
  const isAgent = mt === 'agent' || mt === 'final'
  const isCustomer = msg.direction === 'inbound' && !isAgent
  const isHuman = msg.direction === 'outbound' && (mt === 'human' || msg.data?.human_reply === true)
  const isInternal = msg.visibility === 'internal'

  // Lifecycle markers (resolved/reopened) render as centered thread events
  if (mt === 'system' || mt === 'event') {
    return (
      <div className="flex justify-center py-1">
        <span className="text-[11px] text-muted-foreground">
          {msg.content}{msg.created_at ? ` · ${fmtThreadTime(msg.created_at)}` : ''}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isHuman || isInternal ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md rounded-lg px-4 py-3 text-sm ${
        isInternal
          ? 'bg-brand-light/10 text-brand-navy border border-brand-light/40'
          : isHuman
            ? 'bg-primary text-primary-foreground'
            : isAgent
              ? 'bg-brand/10 text-brand-navy border border-brand/30'
              : 'bg-muted/80 text-foreground border border-border'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {isCustomer ? <User size={12} /> : isAgent ? <Bot size={12} /> : isInternal ? <Lock size={12} /> : <Globe size={12} />}
          <span className="text-xs opacity-75">
            {msg.data?.author_name
              ? `${msg.data.author_name} · ${msg.data.author_role || (isCustomer ? 'Customer' : 'Support')}`
              : isCustomer ? 'Customer' : isInternal ? 'Internal note' : isHuman ? 'Support' : 'Answer Once · AI'}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className="mt-1 text-[10px] opacity-60 text-right">{fmtThreadTime(msg.created_at)}</div>
      </div>
    </div>
  )
}

export default function TicketPage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { ticket, loading, error, refetch } = useTicket(id || null)
  const { updateTicket, loading: updating } = useUpdateTicket()
  const {
    externalThread,
    internalThread,
    externalMessages,
    internalMessages,
    loading: threadsLoading,
    sendExternalReply,
    sendInternalNote,
    sendThreadEvent,
    refetch: refetchThreads,
  } = useSupportThreads(id || null)

  const { runSteps } = useAgentSteps()
  const { watching, toggle: toggleWatch, loading: watchLoading } = useWatch(id || null, user?.id)
  const { accountName, personName } = useDirectory()
  const [replyInput, setReplyInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [sending, setSending] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisThreadId, setAnalysisThreadId] = useState<string | null>(null)
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])
  const [analysisElapsed, setAnalysisElapsed] = useState(0)
  const [kbSourceTitle, setKbSourceTitle] = useState<string | null>(null)
  const [procedures, setProcedures] = useState<any[]>([])

  // Published articles marked "human action required" — the procedures a
  // support member can follow. Linking one classifies the ticket as a known
  // Human Action for Reporting demand accounting.
  useEffect(() => {
    let cancelled = false
    apiFetch('/api/admin-data?entity=items&type_slug=ao_kb_article&limit=500')
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        const rows = Array.isArray(j?.data) ? j.data : []
        setProcedures(rows.filter((a: any) =>
          a.status === 'published' && a.data?.resolution_mode === 'human_action_required'))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // While case analysis runs, narrate its thread's step messages inside an
  // AI Agent activity card in the customer thread (the steps live on the
  // analysis thread, not the customer thread, so we poll them directly).
  useEffect(() => {
    if (!analyzing || !analysisThreadId) return
    let cancelled = false
    const started = Date.now()
    const poll = async () => {
      try {
        const j = await apiFetch(
          `/api/admin-data?entity=messages&thread_id=${analysisThreadId}&sort_direction=asc`
        ).then(r => r.json())
        const rows = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : []
        const lines = rows
          .filter((m: any) => isStepMessage(m))
          .map((m: any) => describeStep(m))
          .filter(Boolean)
        if (!cancelled) {
          setAnalysisSteps(lines.slice(-4))
          setAnalysisElapsed(Math.floor((Date.now() - started) / 1000))
        }
      } catch { /* keep polling */ }
    }
    poll()
    const iv = setInterval(poll, 1500)
    return () => { cancelled = true; clearInterval(iv) }
  }, [analyzing, analysisThreadId])

  const kbSourceId = ticket?.data?.aim_kb_source_article_id
  // json fields can arrive stringified through admin-data's field formatter
  const kbSourceIds: string[] = (() => {
    const raw = ticket?.data?.aim_kb_source_ids
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') { try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] } }
    return []
  })()
  const kbSourceExtra = Math.max(0, kbSourceIds.length - 1)
  useEffect(() => {
    setKbSourceTitle(null)
    if (!kbSourceId) return
    let cancelled = false
    apiFetch(`/api/admin-data?entity=items&id=${kbSourceId}`)
      .then(r => r.json())
      .then(j => { if (!cancelled) setKbSourceTitle(j?.data?.title || null) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [kbSourceId])

  const handleSendReply = useCallback(async (proposeResolve = false) => {
    const content = replyInput.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const sent = await sendExternalReply(content, { name: user?.full_name || user?.email, role: 'Support' })
      setReplyInput('')
      if (user?.id) void ensureWatching(id!, user.id)
      const now = new Date().toISOString()
      if (proposeResolve) {
        // Human-proposed resolution: the reply is the proposed answer; the
        // ticket enters the same 72h confirm/auto-resolve window as an AI answer.
        await updateTicket(id!, {
          status: 'pending_resolution',
          data: {
            ...normalizeDataForWrite(ticket?.data || {}),
            pending_proposed_by: 'human',
            resolve_pending_since: now,
            human_resolution_message_id: sent?.id || null,
            aim_human_assignee_id: user?.id,
            aim_human_assignee_name: user?.full_name || user?.email,
            last_activity_at: now,
          },
        })
        refetch()
      // A human reply on an escalated/AI/open ticket claims it and moves it in_progress
      } else if (ticket?.status === 'ai_responding' || ticket?.status === 'human_assigned' || ticket?.status === 'open' || ticket?.status === 'new') {
        await updateTicket(id!, {
          status: 'in_progress',
          data: {
            ...normalizeDataForWrite(ticket?.data || {}),
            aim_human_assignee_id: user?.id,
            aim_human_assignee_name: user?.full_name || user?.email,
            last_activity_at: now,
          },
        })
        refetch()
      } else {
        void touchTicketActivity(id!)
      }
    } finally {
      setSending(false)
    }
  }, [replyInput, sending, sendExternalReply, ticket?.status, ticket?.data, id, user, updateTicket, refetch])

  const handleSendNote = useCallback(async () => {
    const content = noteInput.trim()
    if (!content || sending) return
    setSending(true)
    try {
      await sendInternalNote(content, { name: user?.full_name || user?.email, role: 'Support' })
      setNoteInput('')
      if (user?.id) void ensureWatching(id!, user.id)
      void touchTicketActivity(id!)
    } finally {
      setSending(false)
    }
  }, [noteInput, sending, sendInternalNote, user, id])

  const handleResolve = useCallback(async () => {
    const now = new Date().toISOString()
    // Link the closing human reply as the resolution message so publish
    // validation on derived KB candidates can verify the answer's provenance.
    const lastHuman = [...externalMessages].reverse().find(
      (m: any) => m.direction === 'outbound' && (m.data?.message_type === 'human' || m.data?.human_reply === true)
    )
    await updateTicket(id!, {
      status: 'resolved',
      data: {
        ...normalizeDataForWrite(ticket?.data || {}),
        resolved_at: now,
        resolved_via: 'human',
        aim_resolved_by_ai: false,
        last_activity_at: now,
        ...(ticket?.data?.human_resolution_message_id || !lastHuman
          ? {}
          : { human_resolution_message_id: lastHuman.id }),
      },
    })
    try {
      await sendThreadEvent(`Resolved by ${user?.full_name || user?.email || 'support'}`)
    } catch { /* marker is best-effort; the status update already landed */ }
    refetch()
    refetchThreads()
  }, [id, updateTicket, ticket?.data, externalMessages, refetch, refetchThreads, sendThreadEvent, user])

  const handleReopen = useCallback(async () => {
    const now = new Date().toISOString()
    await updateTicket(id!, { status: 'in_progress', data: { ...normalizeDataForWrite(ticket?.data || {}), reopened_at: now, reopen_reason: 'manual', resolved_at: null, resolved_via: null, aim_resolved_by_ai: false, demand_class: null, ha_article_id: null, human_minutes: null, last_activity_at: now } })
    try {
      await sendThreadEvent(`Reopened by ${user?.full_name || user?.email || 'support'}`)
    } catch { /* marker is best-effort */ }
    refetch()
    refetchThreads()
  }, [id, updateTicket, ticket?.data, refetch, refetchThreads, sendThreadEvent, user])

  // Reporting classification — stamps the demand class (+ which procedure a
  // human followed) so reporting can partition total demand. 'ha:<id>' selects
  // a published human-action article; bare values stamp demand_class directly.
  const handleClassify = useCallback(async (val: string) => {
    if (!id || !ticket) return
    const patch: Record<string, any> = { demand_class: null, ha_article_id: null }
    if (val.startsWith('ha:')) {
      const artId = val.slice(3)
      patch.demand_class = 'human_action'
      patch.ha_article_id = artId
      const est = procedures.find((a) => a.id === artId)?.data?.est_minutes
      if (est != null && ticket.data?.human_minutes == null) patch.human_minutes = est
    } else if (val) {
      patch.demand_class = val
    }
    await updateTicket(id, {
      data: {
        ...normalizeDataForWrite(ticket.data || {}),
        ...patch,
        last_activity_at: new Date().toISOString(),
      },
    })
    refetch()
  }, [id, ticket, procedures, updateTicket, refetch])

  const handleHumanMinutes = useCallback(async (minutes: number | null) => {
    if (!id || !ticket) return
    await updateTicket(id, {
      data: {
        ...normalizeDataForWrite(ticket.data || {}),
        human_minutes: minutes,
        last_activity_at: new Date().toISOString(),
      },
    })
    refetch()
  }, [id, ticket, updateTicket, refetch])

  const handleAssignToMe = useCallback(async () => {
    if (!user?.id) return
    const nextData = {
      ...normalizeDataForWrite(ticket?.data || {}),
      aim_human_assignee_id: user.id,
      aim_human_assignee_name: user.full_name || user.email,
      last_activity_at: new Date().toISOString(),
    }
    const nextStatus = ticket?.status === 'human_assigned' || ticket?.status === 'open' ? 'in_progress' : ticket?.status
    await updateTicket(id!, { status: nextStatus, data: nextData })
    void ensureWatching(id!, user.id)
    refetch()
  }, [id, user, ticket?.data, ticket?.status, updateTicket, refetch])

  const handleRunAnalysis = useCallback(async () => {
    if (!id || analyzing) return
    setAnalyzing(true)
    setAnalysisError(null)
    setAnalysisSteps([])
    setAnalysisElapsed(0)
    try {
      // Provision the case_analysis thread + prompt, then step the agent.
      const res = await apiFetch(
        '/.netlify/functions/custom_answeronce-journey?action=analyze_ticket',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket_id: id }),
        }
      ).then(r => r.json())
      const payload = res?.data || res
      const { analysisThreadId, analysisPrompt } = payload || {}
      if (!analysisThreadId) throw new Error('Failed to provision analysis thread')
      setAnalysisThreadId(analysisThreadId)

      const stepResult = await runSteps(analysisThreadId, analysisPrompt, refetchThreads)
      if (stepResult?.status === 'failed') throw new Error('Analysis agent failed')

      // Stamp ca_* fields and create the KB candidate if earned.
      const fin = await apiFetch(
        '/.netlify/functions/custom_answeronce-journey?action=finalize_analysis',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket_id: id }),
        }
      ).then(r => r.json())
      if (fin?.error) throw new Error(fin.error)
      refetch()
      refetchThreads()
    } catch (e: any) {
      setAnalysisError(e.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }, [id, analyzing, runSteps, refetch, refetchThreads])

  const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed'
  const assigneeId = ticket?.data?.aim_human_assignee_id
  const assigneeName = ticket?.data?.aim_human_assignee_name
  const isMine = assigneeId === user?.id
  const hasHumanReply = externalMessages.some(
    (m: any) => m.direction === 'outbound' && (m.data?.message_type === 'human' || m.data?.human_reply === true)
  ) || ticket?.status === 'in_progress' || ticket?.status === 'pending_resolution'

  // Collapse runs of agent step messages into a single persistent AI Agent
  // card — support keeps the full step narration as provenance (unlike the
  // customer thread, where steps vanish when the episode ends).
  const renderExternalMessages = () => {
    const nodes: any[] = []
    let stepRun: any[] = []
    const flush = () => {
      if (stepRun.length === 0) return
      const labels = stepRun
        .map((m) => describeStep(m) || `${m.data?.tool || m.data?.message_type}`)
        .filter(Boolean)
      nodes.push(<AgentRunCard key={`steps-${stepRun[0].id}`} steps={labels} />)
      stepRun = []
    }
    externalMessages.forEach((m: any) => {
      if (isStepMessage(m)) stepRun.push(m)
      else {
        flush()
        nodes.push(<ThreadMessage key={m.id} msg={m} />)
      }
    })
    flush()
    return nodes
  }

  // Keep the working end of the thread above the fold — on load and as
  // messages/analysis arrive, scroll the newest content into view.
  const threadEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [externalMessages.length, analyzing, analysisSteps.length])

  // Rendered as the desktop side pane and the mobile "Details" tab.
  const metaPanel = (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Status</h3>
        <StatusBadge status={ticket?.status || 'new'} />
      </div>

      {/* Assignee */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Assignee</h3>
        <p className="text-sm">
          {assigneeName || 'Unassigned'}
          {isMine && <span className="text-muted-foreground"> (you)</span>}
        </p>
      </div>

      {/* Resolution classification — feeds Reporting demand accounting */}
      {(ticket && (!isResolved || ticket.data?.demand_class)) && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Resolution class</h3>
          {isResolved ? (
            <p className="text-sm">
              {ticket.data?.demand_class === 'human_action' && ticket.data?.ha_article_id
                ? `Procedure: ${procedures.find((a) => a.id === ticket.data.ha_article_id)?.title || 'article'}`
                : ticket.data?.demand_class
                  ? ticket.data.demand_class.replace(/_/g, ' ')
                  : ticket.data?.resolved_via?.startsWith('ai') ? 'AI validated' : 'Unclassified'}
              {ticket.data?.human_minutes != null && (
                <span className="text-muted-foreground"> · ~{ticket.data.human_minutes}m</span>
              )}
            </p>
          ) : (
            <div className="space-y-2">
              <Select
                value={
                  ticket.data?.demand_class === 'human_action' && ticket.data?.ha_article_id
                    ? `ha:${ticket.data.ha_article_id}`
                    : ticket.data?.demand_class || 'unset'
                }
                onValueChange={(v) => handleClassify(v === 'unset' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Classify…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Not classified</SelectItem>
                  {procedures.map((a) => (
                    <SelectItem key={a.id} value={`ha:${a.id}`}>Procedure: {a.title}</SelectItem>
                  ))}
                  <SelectItem value="knowledge_gap">New knowledge needed</SelectItem>
                  <SelectItem value="exception">Known exception</SelectItem>
                  <SelectItem value="unclassified">Other / unclassified</SelectItem>
                </SelectContent>
              </Select>
              {ticket.data?.demand_class === 'human_action' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number" min={0} className="h-8 w-24 text-sm"
                    placeholder="min"
                    defaultValue={ticket.data?.human_minutes ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value === '' ? null : Math.max(0, Number(e.target.value))
                      if (v !== (ticket.data?.human_minutes ?? null)) handleHumanMinutes(v)
                    }}
                  />
                  <span className="text-xs text-muted-foreground">est. minutes</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Company + requester */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Company</h3>
        <p className="text-sm">{accountName(ticket?.account_id) || '—'}</p>
      </div>
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Requested by</h3>
        <p className="text-sm">{personName(ticket?.created_by) || '—'}</p>
      </div>

      {/* AI Triage */}
      {ticket?.data?.aim_triage_agent_id && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">AI Triage</h3>
          <div className="space-y-1 text-sm">
            {ticket.data.aim_confidence_at_response !== undefined && (
              <p>Confidence: <span className="font-medium">{Math.round(ticket.data.aim_confidence_at_response * 100)}%</span></p>
            )}
            {ticket.data.aim_retrieval_confidence !== undefined && ticket.data.aim_retrieval_confidence !== null && (
              <p>Retrieval: <span className="font-medium">{Math.round(ticket.data.aim_retrieval_confidence * 100)}%</span></p>
            )}
            {ticket.data.aim_escalation_reason && ticket.data.aim_escalation_reason !== 'none' && (
              <p>Escalation: <span className="font-medium text-brand-navy">{ticket.data.aim_escalation_reason}</span></p>
            )}
            {(ticket.data.aim_resolved_by_ai === true || ticket.data.aim_resolved_by_ai === 'Yes' || ticket.data.aim_resolved_by_ai === 'true') && (
              <p className="text-brand text-xs">Resolved by AI</p>
            )}
            {ticket.data.resolved_via && (
              <p>Resolved via: <span className="font-medium">{String(ticket.data.resolved_via).replace(/_/g, ' ')}</span></p>
            )}
            {ticket.status === 'pending_resolution' && ticket.data.resolve_pending_since && (
              <p>Pending since: <span className="font-medium">{new Date(ticket.data.resolve_pending_since).toLocaleDateString()}</span></p>
            )}
            {ticket.data.reopen_reason && (
              <p className="text-brand-navy text-xs">Reopened — {String(ticket.data.reopen_reason).replace(/_/g, ' ')}</p>
            )}
            {(ticket.data.aim_answered_from_kb === true || ticket.data.aim_answered_from_kb === 'Yes' || ticket.data.aim_answered_from_kb === 'true') && kbSourceId && (
              <p>
                Answered from:{' '}
                <button
                  className="font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => navigate(appPath(`/company/kb/${kbSourceId}`))}
                >
                  {kbSourceTitle || 'KB article'}
                </button>
                {kbSourceExtra > 0 && (
                  <span className="text-muted-foreground"> +{kbSourceExtra} more</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {ticket?.description && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Original Request</h3>
          <p className="text-sm bg-muted/50 p-3 rounded-md">{ticket.description}</p>
        </div>
      )}

      {/* Metadata */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Details</h3>
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-2"><Clock size={12} /> Created {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}</p>
          <p>ID: {ticket?.id?.slice(0, 8)}…</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header — actions wrap onto a second row on small screens */}
      <div className="flex flex-wrap items-start sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/tickets'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1 basis-52">
          {loading ? <Skeleton className="h-6 w-48" /> : (
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold truncate max-w-full">{ticket?.title || 'Ticket'}</h1>
              <StatusBadge status={ticket?.status || 'new'} />
            </div>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground">
            {ticket?.created_at ? `Created ${new Date(ticket.created_at).toLocaleDateString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={watching ? 'Watching — click to unwatch' : 'Watch this ticket'}
            onClick={toggleWatch}
            disabled={watchLoading}
          >
            {watching ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
          </Button>
          {!isResolved && !isMine && (
            <Button variant="outline" size="sm" onClick={handleAssignToMe} disabled={updating}>
              <User size={14} className="sm:mr-1" /> <span className="hidden sm:inline">Assign to me</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main content: two-pane on desktop; on mobile the meta pane becomes the "Details" tab */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: conversation threads (+ Details tab on mobile) */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col md:border-r border-border">
          <Tabs defaultValue="external" className="flex-1 min-h-0 flex flex-col">
            <TabsList className="mx-4 mt-2 w-fit">
              <TabsTrigger value="external" className="text-xs gap-1">
                <Globe size={12} /> Customer Thread
              </TabsTrigger>
              <TabsTrigger value="internal" className="text-xs gap-1">
                <Lock size={12} /> Internal Notes
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs gap-1 md:hidden">
                <Info size={12} /> Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external" className="flex-1 flex flex-col overflow-hidden mt-0">
              <ScrollArea className="flex-1 min-h-0 px-4 py-3">
                {threadsLoading && externalMessages.length === 0 && <Skeleton className="h-16 w-3/4" />}
                {!threadsLoading && externalMessages.length === 0 && !analyzing && (
                  <p className="text-sm text-muted-foreground text-center py-8">No customer messages yet.</p>
                )}
                <div className="space-y-3">
                  {renderExternalMessages()}
                  {/* Case-analysis agent card — narrates analysis steps when the
                      agent emits them; the fallback line covers single-shot runs */}
                  {analyzing && (
                    <AgentActivityBox
                      steps={analysisSteps.length > 0 ? analysisSteps : ['Analyzing the resolved case…']}
                      elapsedS={analysisElapsed}
                    />
                  )}
                  {/* Settled analysis card stays in the thread as provenance */}
                  {!analyzing && ticket?.data?.ca_true_problem && (
                    <AgentRunCard
                      steps={analysisSteps.length > 0
                        ? analysisSteps
                        : [
                            'Analyzing the resolved case…',
                            ticket.data.ca_kb_candidate ? 'Extracted a KB candidate' : 'Analysis complete',
                          ]}
                    />
                  )}
                  {/* Analysis results live in the thread, not the sidebar */}
                  {!analyzing && ticket?.data?.ca_true_problem && (
                    <div className="flex flex-col items-start">
                      <div className="bg-card border rounded-lg px-3 py-2 text-sm space-y-1.5 max-w-md">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 flex items-center gap-1">
                          <Brain size={10} /> Case Analysis
                        </p>
                        <p className="text-xs"><span className="font-medium">Problem:</span> {ticket.data.ca_true_problem}</p>
                        {ticket.data.ca_final_solution && (
                          <p className="text-xs"><span className="font-medium">Solution:</span> {ticket.data.ca_final_solution}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {ticket.data.ca_confidence_score !== undefined && (
                            <span>Confidence: {Math.round(ticket.data.ca_confidence_score * 100)}%</span>
                          )}
                          {ticket.data.ca_correctness_state && (
                            <span>{ticket.data.ca_confidence_score !== undefined ? ' · ' : ''}State: {ticket.data.ca_correctness_state}</span>
                          )}
                        </p>
                        {ticket.data.ca_kb_candidate && ticket.data.kb_article_id && (
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => navigate(appPath(`/company/kb/${ticket.data.kb_article_id}`))}
                            >
                              <BookOpen size={12} className="mr-1" /> Review KB candidate
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div ref={threadEndRef} />
                </div>
              </ScrollArea>
              {/* Composer + lifecycle actions — buttons appear only when valid */}
              {!isResolved ? (
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                      placeholder="Reply to customer…"
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button onClick={() => handleSendReply()} disabled={sending || !replyInput.trim()} size="icon" title="Send reply">
                      <Send size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendReply(true)}
                      disabled={sending || !replyInput.trim()}
                      size="icon"
                      title="Send & propose resolved — closes after customer confirm or 3 days of silence"
                    >
                      <CheckCircle size={16} />
                    </Button>
                    {hasHumanReply && (
                      <Button size="sm" onClick={handleResolve} disabled={updating} className="self-center">
                        <CheckCircle size={14} className="mr-1" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-border p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleReopen} disabled={updating}>
                      Reopen
                    </Button>
                    <Button size="sm" onClick={handleRunAnalysis} disabled={analyzing}>
                      <Brain size={14} className="mr-1" />
                      {analyzing ? 'Analyzing…' : ticket?.data?.ca_true_problem ? 'Re-run case analysis' : 'Run case analysis'}
                    </Button>
                    {analysisError && (
                      <p className="text-xs text-destructive">{analysisError}</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="internal" className="flex-1 flex flex-col overflow-hidden mt-0">
              <ScrollArea className="flex-1 min-h-0 px-4 py-3">
                {threadsLoading && internalMessages.length === 0 && <Skeleton className="h-16 w-3/4" />}
                {!threadsLoading && internalMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No internal notes yet.</p>
                )}
                <div className="space-y-3">
                  {internalMessages.map((msg) => (
                    <ThreadMessage key={msg.id} msg={msg} />
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal note…"
                    disabled={sending}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button onClick={handleSendNote} disabled={sending || !noteInput.trim()} size="icon" className="self-end">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Details — mobile-only; the desktop side pane shows the same panel */}
            <TabsContent value="details" className="flex-1 flex flex-col overflow-hidden mt-0 md:hidden">
              <ScrollArea className="flex-1 min-h-0 p-4">
                {metaPanel}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: metadata + actions — desktop side pane */}
        <div className="hidden md:flex w-80 flex-none flex-col border-l border-border bg-muted/30">
          <ScrollArea className="flex-1 min-h-0 p-4">
            {metaPanel}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
