import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'

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

export interface TicketThread {
  id: string
  target_type: string
  target_id: string
  status: string
  type_id?: string
  visibility?: 'external' | 'internal' | 'public'
  data?: Record<string, any>
}

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

export function useTicketThread(ticketId: string | null) {
  const [thread, setThread] = useState<TicketThread | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(false)
  // 'loaded' flips only after a load completes without error — a transient
  // fetch failure leaves messages at [] but must not look like an empty
  // thread to auto-start logic in consumers.
  const [loaded, setLoaded] = useState(false)
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
      setLoaded(true)
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

  return { thread, messages, loading, loaded, error, sendMessage, refetch: load }
}
