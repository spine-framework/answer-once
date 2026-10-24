// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useSupportThreads.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Hook for support-side thread management on ao_support_ticket"]
// CIL[DOC-RESPONSIBILITY responsibility="Load external + internal ao_ticket_thread records and their messages for a ticket"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useSupportThreads.ts" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/seed/types.json"]
// CIL[DOC-CONTRACT inputs="ticketId: string | null" outputs="{ externalThread, internalThread, externalMessages, internalMessages, loading, error, sendExternalReply, sendInternalNote, refetch }" errors="network errors surfaced" side_effects="GET/POST /api/admin-data"]
// CIL[DOC-MICRO logic_summary="Finds external and internal threads by target_id + type_slug + visibility; loads messages for each; send functions create outbound ao_ticket_message records" notable_decisions="support sees both external and internal threads; customers see only external"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[DOC-LEARNING topic="human_owner_gate" content="App-side of the framework human/agent gate (agent-runner isHumanOwned): a human posting on the customer thread stamps threads.data.owner='human' via admin-data PATCH. Core never reads AO item statuses — apps own the translation from domain state to the framework owner signal."]
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'
import { TicketMessage, TicketThread } from './useTicketThread'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useSupportThreads.ts:module_header:module_header"]

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

export function useSupportThreads(ticketId: string | null) {
  const [externalThread, setExternalThread] = useState<TicketThread | null>(null)
  const [internalThread, setInternalThread] = useState<TicketThread | null>(null)
  const [externalMessages, setExternalMessages] = useState<TicketMessage[]>([])
  const [internalMessages, setInternalMessages] = useState<TicketMessage[]>([])
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
      const external = Array.isArray(threads)
        ? (threads.find((t: any) => t.visibility === 'external' || t.visibility === 'public') ?? null)
        : null
      const internal = Array.isArray(threads)
        ? (threads.find((t: any) => t.visibility === 'internal') ?? null)
        : null
      setExternalThread(external)
      setInternalThread(internal)

      if (external?.id) {
        const msgs = await fetchJSON(
          `/api/admin-data?entity=messages&thread_id=${external.id}&sort_direction=asc`
        )
        setExternalMessages(Array.isArray(msgs) ? msgs : [])
      } else {
        setExternalMessages([])
      }

      if (internal?.id) {
        const msgs = await fetchJSON(
          `/api/admin-data?entity=messages&thread_id=${internal.id}&sort_direction=asc`
        )
        setInternalMessages(Array.isArray(msgs) ? msgs : [])
      } else {
        setInternalMessages([])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => { load() }, [load])

  const sendMessage = useCallback(async (
    thread: TicketThread | null,
    content: string,
    visibility: 'external' | 'internal',
    author?: { name?: string; role?: string }
  ) => {
    let targetThread = thread
    if (!targetThread?.id) {
      targetThread = await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'threads',
          type_slug: 'ao_ticket_thread',
          target_type: 'items',
          target_id: ticketId,
          visibility,
          status: 'active',
        }),
      })
      if (visibility === 'external') setExternalThread(targetThread)
      else setInternalThread(targetThread)
    }

    const currentMsgs = visibility === 'external' ? externalMessages : internalMessages
    const nextSequence = currentMsgs.reduce((max, m) => Math.max(max, m.sequence || 0), 0) + 1
    const msg = await fetchJSON('/api/admin-data', {
      method: 'POST',
      body: JSON.stringify({
        entity: 'messages',
        type_slug: 'ao_ticket_message',
        thread_id: targetThread.id,
        content,
        direction: 'outbound',
        sequence: nextSequence,
        visibility,
        data: {
          message_type: 'human',
          sender_type: 'human',
          human_reply: true,
          ...(author?.name ? { author_name: author.name } : {}),
          ...(author?.role ? { author_role: author.role } : {}),
        },
      }),
    })

    if (visibility === 'external') {
      setExternalMessages((prev) => [...prev, msg])
      // A human posting on the customer thread takes ownership of it —
      // stamp the framework's thread-owner gate (thread.data.owner) so no
      // agent episode can claim, narrate, or step this conversation while
      // a person is working it. Re-read before merge so a live episode's
      // research_state checkpoint isn't clobbered.
      const fresh = await fetchJSON(`/api/admin-data?entity=threads&id=${targetThread.id}`).catch(() => null)
      if (fresh) {
        await fetchJSON(`/api/admin-data?action=update&entity=threads&id=${targetThread.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ data: { ...(fresh.data || {}), owner: 'human' } }),
        }).catch(() => {})
      }
    } else {
      setInternalMessages((prev) => [...prev, msg])
    }
    return msg
  }, [ticketId, externalMessages, internalMessages])

  const sendExternalReply = useCallback((content: string, author?: { name?: string; role?: string }) =>
    sendMessage(externalThread, content, 'external', author), [sendMessage, externalThread])

  const sendInternalNote = useCallback((content: string, author?: { name?: string; role?: string }) =>
    sendMessage(internalThread, content, 'internal', author), [sendMessage, internalThread])

  // System event marker on the customer thread — captures lifecycle moments
  // (resolved, reopened) so they render chronologically inside the thread.
  const sendThreadEvent = useCallback(async (content: string) => {
    let targetThread = externalThread
    if (!targetThread?.id) {
      targetThread = await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'threads',
          type_slug: 'ao_ticket_thread',
          target_type: 'items',
          target_id: ticketId,
          visibility: 'external',
          status: 'active',
        }),
      })
      setExternalThread(targetThread)
    }
    const nextSequence = externalMessages.reduce((max, m) => Math.max(max, m.sequence || 0), 0) + 1
    const msg = await fetchJSON('/api/admin-data', {
      method: 'POST',
      body: JSON.stringify({
        entity: 'messages',
        type_slug: 'ao_ticket_message',
        thread_id: targetThread.id,
        content,
        direction: 'outbound',
        sequence: nextSequence,
        visibility: 'external',
        data: { message_type: 'system', sender_type: 'system' },
      }),
    })
    setExternalMessages((prev) => [...prev, msg])
    return msg
  }, [ticketId, externalThread, externalMessages])

  return {
    externalThread,
    internalThread,
    externalMessages,
    internalMessages,
    loading,
    error,
    sendExternalReply,
    sendInternalNote,
    sendThreadEvent,
    refetch: load,
  }
}
