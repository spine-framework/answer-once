// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Hooks for Answer Once ticket data management"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide hooks for listing, fetching, creating, and triaging ao_support_ticket records"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/functions/custom_answeronce-journey.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React hooks" errors="none" side_effects="API calls"]
// CIL[DOC-MICRO logic_summary="Uses apiFetch for /api/admin-data reads and POSTs; create/finalize go through the app-owned orchestration function" notable_decisions="ticket creation delegates to custom_answeronce-journey to keep ticket+thread creation atomic"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:ticket:interface" type="interface" identity="Ticket" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Ticket interface for ao_support_ticket records"]
// CIL[DOC-RESPONSIBILITY responsibility="Type shape for ticket items returned by /api/admin-data"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Minimal shape needed by the UI; extra fields live in data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface Ticket {
  id: string
  title: string
  status?: string
  created_at: string
  description?: string
  account_id?: string
  created_by?: string
  data?: Record<string, any>
  design_schema?: Record<string, any>
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:ticket:interface"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:base:constant" type="constant" identity="BASE" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Base query string for ticket list reads"]
// CIL[DOC-RESPONSIBILITY responsibility="Centralize the admin-data query for ao_support_ticket items"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="URL string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Filters by type_slug=ao_support_ticket" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
const BASE = '/api/admin-data?entity=items&type_slug=ao_support_ticket'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:base:constant"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:fetchjson:function" type="function" identity="fetchJSON" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Fetch and validate JSON from an API endpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap apiFetch with JSON parsing and error extraction"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files=".framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="path: string, options?: RequestInit" outputs="Promise<any>" errors="Error on non-OK or json.error" side_effects="HTTP request"]
// CIL[DOC-MICRO logic_summary="Parses response text as JSON, throws on error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`)
  }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:fetchjson:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usetickets:function" type="function" identity="useTickets" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="List ao_support_ticket records"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and expose ticket list state"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketsPage.tsx, custom/apps/answer-once/pages/company/TicketsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ tickets, loading, error, refetch }" errors="network errors surfaced" side_effects="GET /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Calls fetchJSON(BASE) on mount and exposes refetch" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJSON(BASE)
      setTickets(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { tickets, loading, error, refetch: load }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usetickets:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useticket:function" type="function" identity="useTicket" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Fetch a single ticket by id"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose ticket detail state for a given id"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="id: string | null" outputs="{ ticket, loading, error, refetch }" errors="network errors surfaced" side_effects="GET /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Calls fetchJSON with entity=items&id=..." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useTicket(id: string | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setTicket(await fetchJSON(`/api/admin-data?entity=items&id=${id}`))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return { ticket, loading, error, refetch: load }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useticket:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usenewticket:function" type="function" identity="useNewTicket" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Create a ticket via the Answer Once orchestrator"]
// CIL[DOC-RESPONSIBILITY responsibility="POST to custom_answeronce-journey?action=create_ticket to create ticket + external thread"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/functions/custom_answeronce-journey.ts"]
// CIL[DOC-CONTRACT inputs="message: string" outputs="{ ticketId, threadId }" errors="HTTP errors surfaced" side_effects="POST to orchestrator"]
// CIL[DOC-MICRO logic_summary="Wraps fetchJSON to the app-owned function" notable_decisions="keeps ticket+thread creation atomic server-side"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useNewTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTicket = useCallback(async (message: string, title?: string) => {
    setLoading(true)
    setError(null)
    try {
      return await fetchJSON('/.netlify/functions/custom_answeronce-journey?action=create_ticket', {
        method: 'POST',
        body: JSON.stringify({ message, title }),
      })
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { createTicket, loading, error }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usenewticket:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useagentsteps:function" type="function" identity="useAgentSteps" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Run agent steps against a thread"]
// CIL[DOC-RESPONSIBILITY responsibility="Drive the core ai-agents runner in step mode until terminal status"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files=".framework/functions/ai-agents.ts"]
// CIL[DOC-CONTRACT inputs="threadId, firstMessage, onStep, maxSteps" outputs="Promise<last step result>" errors="throws on failure" side_effects="POST /api/ai-agents?action=run, thread polling"]
// CIL[DOC-MICRO logic_summary="Mirrors Portal's useAgentSteps: loop, poll for terminal messages, handle timeouts" notable_decisions="step mode avoids function timeout on long episodes"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
const AGENT_TERMINAL_STATUSES = new Set(['complete', 'awaiting_input', 'failed'])
export const AGENT_TERMINAL_MESSAGE_TYPES = new Set(['final', 'agent', 'awaiting_input', 'error'])

async function fetchThreadMessages(threadId: string): Promise<any[]> {
  const msgs = await fetchJSON(`/api/admin-data?entity=messages&thread_id=${threadId}&sort_direction=asc`)
  return Array.isArray(msgs) ? msgs : []
}

async function waitForStepMessages(
  threadId: string,
  before: Set<string>,
  onStep?: () => Promise<void> | void
): Promise<{ status: string; freshCount: number } | null> {
  let quietPolls = 0
  let freshCount = 0
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    await onStep?.()
    const msgs = await fetchThreadMessages(threadId).catch(() => null)
    if (!msgs) continue
    const fresh = msgs.filter((m: any) => !before.has(m.id))
    const terminal = fresh.find((m: any) => AGENT_TERMINAL_MESSAGE_TYPES.has(m.data?.message_type))
    if (terminal) {
      // Land the terminal row in the caller's state before resolving — onStep
      // ran before this fetch, so the terminal message can race past the last
      // refetch and never render.
      await onStep?.()
      const mt = terminal.data?.message_type
      return {
        status: mt === 'error' ? 'failed' : mt === 'awaiting_input' ? 'awaiting_input' : 'complete',
        freshCount: freshCount + fresh.length,
      }
    }
    if (fresh.length > 0) {
      freshCount += fresh.length
      quietPolls = 0
      fresh.forEach((m: any) => before.add(m.id))
    } else if (++quietPolls >= 15) {
      return { status: 'gathering', freshCount }
    }
  }
  return null
}

export function useAgentSteps() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSteps = useCallback(async (
    threadId: string,
    firstMessage: string,
    onStep?: () => Promise<void> | void,
    maxSteps = 10
  ) => {
    setLoading(true)
    setError(null)
    try {
      let userMessage = firstMessage
      let last: any = null
      let deadSteps = 0
      // One lease identity for the whole step loop — the atomic episode
      // lease keys on driver_id, so steps that each presented a fresh
      // requestId would be refused ('running') once the first nonterminal
      // step claimed the lease.
      const driverToken = crypto.randomUUID()
      for (let i = 0; i < maxSteps; i++) {
        const msgs = await fetchThreadMessages(threadId).catch(() => null)
        // Transient read failure — retry next iteration. Stepping on stale or
        // missing state bypasses every guard below and can re-insert the
        // inbound / re-run an episode that already finished.
        if (msgs === null) {
          await new Promise((r) => setTimeout(r, 1500))
          continue
        }
        const before = new Set<string>(msgs.map((m: any) => m.id))
        const pendingMessage = userMessage.trim()
        // Idempotent re-fire check: when the caller's text already landed as
        // the latest inbound and a terminal agent message answered it, this
        // call is a remount/retry — not a new turn. A fresh episode for a
        // non-empty userMessage would re-run side-effect tools and persist
        // duplicate output even though runAgent dedupes the inbound insert.
        if (pendingMessage) {
          const lastInboundIdx = msgs.reduce(
            (idx: number, m: any, i: number) => (m.direction === 'inbound' ? i : idx),
            -1
          )
          const lastInbound = lastInboundIdx >= 0 ? msgs[lastInboundIdx] : null
          const answered =
            !!lastInbound &&
            (lastInbound.content || '').trim() === pendingMessage &&
            msgs
              .slice(lastInboundIdx + 1)
              .some((m: any) => AGENT_TERMINAL_MESSAGE_TYPES.has(m.data?.message_type))
          if (answered) {
            last = { status: 'complete' }
            break
          }
        }
        // A detached server-side driver (the create_ticket episode kick or a
        // mode:'episode' POST) holds a lease in research_state. While it is
        // live this loop supervises by watching persisted messages — a step
        // POST would be lease-refused anyway, and stepping a completed
        // episode would burn a duplicate turn. When the lease goes stale the
        // loop falls through and takes over with step mode, as before.
        const threadRow = await fetchJSON(`/api/admin-data?entity=threads&id=${threadId}`).catch(() => null)
        if (threadRow === null) {
          await new Promise((r) => setTimeout(r, 1500))
          continue
        }
        // Human-owner gate (client mirror): the framework refuses episode
        // claims on a human-owned thread — stop driving it the same way.
        if (threadRow?.data?.owner === 'human' || threadRow?.data?.escalation_status === 'pending') {
          last = { status: 'complete' }
          break
        }
        const rs = threadRow?.data?.research_state
        const leaseFresh =
          !!rs?.driver_id &&
          Number.isFinite(Date.parse(rs?.driver_heartbeat_at || '')) &&
          Date.now() - Date.parse(rs.driver_heartbeat_at) < 60000
        // Terminal episodes end the loop for a bare supervise call ('' = a
        // remount reconciling a finished episode) and for a re-fire of the
        // same question. A different message continues as a new turn.
        if (rs && AGENT_TERMINAL_STATUSES.has(rs.status) && (!pendingMessage || rs.user_question === pendingMessage)) {
          last = { status: rs.status }
          break
        }
        if (rs && !AGENT_TERMINAL_STATUSES.has(rs.status) && leaseFresh) {
          const watched = await waitForStepMessages(threadId, before, onStep)
          if (watched) {
            last = watched
            if (AGENT_TERMINAL_STATUSES.has(watched.status)) break
            if (watched.freshCount > 0) continue
          }
          // Driver went quiet — fall through and attempt a step; the server
          // lease check decides whether takeover is allowed yet.
        }
        try {
          last = await fetchJSON('/api/ai-agents?action=run', {
            method: 'POST',
            body: JSON.stringify({ thread_id: threadId, user_message: userMessage, mode: 'step', driver_token: driverToken }),
          })
          deadSteps = 0
        } catch (stepErr) {
          const recovered = await waitForStepMessages(threadId, before, onStep)
          if (!recovered) throw stepErr
          last = recovered
          if (!AGENT_TERMINAL_STATUSES.has(recovered.status) && recovered.freshCount === 0) {
            if (++deadSteps >= 2) throw stepErr
          } else {
            deadSteps = 0
          }
        }
        userMessage = ''
        await onStep?.()
        if (AGENT_TERMINAL_STATUSES.has(last?.status)) break
      }
      return last
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { runSteps, loading, error }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useagentsteps:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usefinalizeticket:function" type="function" identity="useFinalizeTicket" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Finalize a ticket after triage"]
// CIL[DOC-RESPONSIBILITY responsibility="POST to custom_answeronce-journey?action=finalize to stamp ticket status/confidence"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/functions/custom_answeronce-journey.ts"]
// CIL[DOC-CONTRACT inputs="ticketId, threadId" outputs="Promise<finalize result>" errors="HTTP errors surfaced" side_effects="POST to orchestrator"]
// CIL[DOC-MICRO logic_summary="Wraps fetchJSON to the app-owned function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useFinalizeTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalize = useCallback(async (ticketId: string, threadId: string) => {
    setLoading(true)
    setError(null)
    try {
      return await fetchJSON('/.netlify/functions/custom_answeronce-journey?action=finalize', {
        method: 'POST',
        body: JSON.stringify({ ticket_id: ticketId, thread_id: threadId }),
      })
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { finalize, loading, error }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usefinalizeticket:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useupdateticket:function" type="function" identity="useUpdateTicket" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Update a ticket's fields"]
// CIL[DOC-RESPONSIBILITY responsibility="PATCH /api/admin-data for ticket status or data updates"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="id: string, fields: Record<string, any>" outputs="Promise<updated record>" errors="HTTP errors surfaced" side_effects="PATCH /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Wraps fetchJSON PATCH" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useUpdateTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTicket = useCallback(async (id: string, fields: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      return await fetchJSON(`/api/admin-data?entity=items&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields),
      })
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { updateTicket, loading, error }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:useupdateticket:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usesubmitfeedback:function" type="function" identity="useSubmitFeedback" parent="~/custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-MACRO purpose="Submit thumbs up/down feedback on an AI response"]
// CIL[DOC-RESPONSIBILITY responsibility="POST to ai-interactions?action=submit_feedback"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTickets.ts" layer="custom_app" related_files=".framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="ticketId, messageId, feedback, reason?" outputs="Promise<{ success: boolean }>" errors="HTTP errors surfaced" side_effects="POST to ai-interactions"]
// CIL[DOC-MICRO logic_summary="Routes feedback through the shared ai-interactions endpoint" notable_decisions="server-side handles not_helpful escalation"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useSubmitFeedback() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitFeedback = useCallback(async (ticketId: string, messageId: string, feedback: 'up' | 'down', reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      await fetchJSON('/.netlify/functions/ai-interactions?action=submit_feedback', {
        method: 'POST',
        body: JSON.stringify({
          message_id: messageId,
          ticket_id: ticketId,
          feedback: feedback === 'up' ? 'helpful' : 'not_helpful',
          ...(reason ? { reason } : {}),
        }),
      })
      return { success: true }
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { submitFeedback, loading, error }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTickets.ts:usesubmitfeedback:function"]
