// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Hook for the external customer thread on an ao_support_ticket"]
// CIL[DOC-RESPONSIBILITY responsibility="Load the external ao_ticket_thread and its ao_ticket_message records for a given ticket id"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTicketThread.ts" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="ticketId: string | null" outputs="{ thread, messages, loading, error, sendMessage, refetch }" errors="network errors surfaced" side_effects="GET/POST /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Finds external thread by target_id + type_slug + visibility != internal; loads messages ordered ascending; sendMessage appends inbound message" notable_decisions="only external threads are visible to customers"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:message:interface" type="interface" identity="TicketMessage" parent="~/custom/apps/answer-once/hooks/useTicketThread.ts"]
// CIL[DOC-MACRO purpose="Message shape for ao_ticket_message records"]
// CIL[DOC-RESPONSIBILITY responsibility="Type for thread messages returned by admin-data"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTicketThread.ts" layer="custom_app" related_files="custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Minimal shape for rendering conversation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface TicketMessage {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  visibility?: string
  sequence: number
  created_by?: string
  created_at: string
  data?: Record<string, any>
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:message:interface"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:thread:interface" type="interface" identity="TicketThread" parent="~/custom/apps/answer-once/hooks/useTicketThread.ts"]
// CIL[DOC-MACRO purpose="Thread shape for ao_ticket_thread records"]
// CIL[DOC-RESPONSIBILITY responsibility="Type for thread records returned by admin-data"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTicketThread.ts" layer="custom_app" related_files="custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Minimal shape for thread metadata" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface TicketThread {
  id: string
  target_type: string
  target_id: string
  status: string
  type_id?: string
  visibility?: 'external' | 'internal' | 'public'
  data?: Record<string, any>
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:thread:interface"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:fetchjson:function" type="function" identity="fetchJSON" parent="~/custom/apps/answer-once/hooks/useTicketThread.ts"]
// CIL[DOC-MACRO purpose="Fetch and validate JSON from an API endpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap apiFetch with JSON parsing and error extraction"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTicketThread.ts" layer="custom_app" related_files=".framework/src/lib/api.ts"]
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
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:fetchjson:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:useticketthread:function" type="function" identity="useTicketThread" parent="~/custom/apps/answer-once/hooks/useTicketThread.ts"]
// CIL[DOC-MACRO purpose="Load external thread and messages for a ticket"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch ao_ticket_thread with visibility external for the ticket, then its ao_ticket_message records"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useTicketThread.ts" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="ticketId: string | null" outputs="{ thread, messages, loading, error, sendMessage, refetch }" errors="network errors surfaced" side_effects="GET/POST /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Loads threads filtered to external visibility; sendMessage appends inbound ao_ticket_message" notable_decisions="customers only see external threads; internal threads are for support"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function useTicketThread(ticketId: string | null) {
  const [thread, setThread] = useState<TicketThread | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    setError(null)
    try {
      const threads = await fetchJSON(
        `/api/admin-data?entity=threads&target_type=items&target_id=${ticketId}&type_slug=ao_ticket_thread`
      )
      const found: TicketThread | null = Array.isArray(threads)
        ? (threads.find(t => t.visibility !== 'internal') ?? null)
        : null
      setThread(found)
      if (found?.id) {
        const msgs = await fetchJSON(
          `/api/admin-data?entity=messages&thread_id=${found.id}&sort_direction=asc`
        )
        setMessages(Array.isArray(msgs) ? msgs : [])
      } else {
        setMessages([])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => { load() }, [load])

  const sendMessage = useCallback(async (content: string, author?: { name?: string; role?: string }) => {
    if (!thread?.id) throw new Error('No thread found for ticket')
    const nextSequence = messages.reduce((max, m) => Math.max(max, m.sequence || 0), 0) + 1
    const msg = await fetchJSON('/api/admin-data', {
      method: 'POST',
      body: JSON.stringify({
        entity: 'messages',
        type_slug: 'ao_ticket_message',
        thread_id: thread.id,
        content,
        direction: 'inbound',
        sequence: nextSequence,
        visibility: 'external',
        data: {
          ...(author?.name ? { author_name: author.name } : {}),
          ...(author?.role ? { author_role: author.role } : {}),
        },
      }),
    })
    setMessages((prev) => [...prev, msg])
    return msg
  }, [thread, messages])

  return { thread, messages, loading, error, sendMessage, refetch: load }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useTicketThread.ts:useticketthread:function"]
