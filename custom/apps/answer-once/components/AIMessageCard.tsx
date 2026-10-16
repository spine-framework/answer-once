// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/AIMessageCard.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="AI response card with evidence state and feedback"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an AI/agent message with citations and thumbs feedback"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/AIMessageCard.tsx" layer="custom_app" related_files="custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-CONTRACT inputs="message, ticketId, messageId, onFeedback" outputs="JSX element" errors="none" side_effects="feedback submission"]
// CIL[DOC-MICRO logic_summary="Shows evidence_state label, markdown content, source list (clickable for ao_kb_* sources → /kb/:id), and feedback buttons; parses JSON-string data fields and normalizes server feedback values" notable_decisions="admin-data display-formats json fields into strings — cited_sources/retrieved_sources are parsed defensively; server stores feedback as helpful|not_helpful, normalized to up|down"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@core/components/ui/button'
import { useAppPath } from '@core/hooks/useAppPath'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSubmitFeedback } from '../hooks/useTickets'
// CIL[END stable_id="~/custom/apps/answer-once/components/AIMessageCard.tsx:module_header:module_header"]

function FormattedAIResponse({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-brand-navy [&_pre]:p-3 [&_pre]:text-brand-gray [&_code]:break-words [&_code]:text-xs">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

interface AIMessageCardProps {
  message: any
  ticketId: string
  messageId: string
  onFeedback: () => void
}

export function AIMessageCard({ message, ticketId, messageId, onFeedback }: AIMessageCardProps) {
  const { submitFeedback, loading } = useSubmitFeedback()
  const navigate = useNavigate()
  const appPath = useAppPath()
  // Server stores 'helpful' | 'not_helpful' on message.data.feedback.
  const persisted = message.data?.feedback
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(
    persisted === 'helpful' ? 'up' : persisted === 'not_helpful' ? 'down' : persisted || null,
  )

  const handleFeedback = async (type: 'up' | 'down') => {
    if (loading || feedback) return
    await submitFeedback(ticketId, messageId, type)
    setFeedback(type)
    onFeedback()
  }

  const state = message.data?.evidence_state
  const label = state === 'verified' ? 'Verified answer'
    : state === 'evidence_found' ? 'Answer grounded in sources'
    : state === 'incomplete' ? 'Partial evidence — answer may be incomplete'
    : state === 'not_established' ? 'No supporting sources — escalated to human'
    : null

  // admin-data display-formats json fields — cited_sources/retrieved_sources
  // arrive as pretty-printed JSON strings, so parse defensively.
  const toArray = (v: any): any[] => {
    if (Array.isArray(v)) return v
    if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] } }
    return []
  }
  const cited = toArray(message.data?.cited_sources)
  const sources = cited.length > 0 ? cited : toArray(message.data?.retrieved_sources)

  const labelFor = (s: any) =>
    typeof s === 'string'
      ? s
      : s?.chunk_name || s?.title || (s?.source_file ? s.source_file.split('/').pop() : null) || s?.document_id || 'Source'

  const kbLinkFor = (s: any) =>
    s && typeof s !== 'string' && s?.document_id && (s?.item_type === 'ao_kb_shared' || s?.item_type === 'ao_kb_article')
      ? appPath(`/kb/${s.document_id}`)
      : null

  return (
    <div className="flex justify-start">
      <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-muted/80 text-foreground border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={14} className="text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Answer Once</span>
        </div>
        {label && <div className="text-xs text-muted-foreground mt-1">{label}</div>}
        <FormattedAIResponse content={message.content} />

        {sources.length > 0 && (
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Sources ({sources.length}) — {labelFor(sources[0])}
            </summary>
            <ul className="mt-1 space-y-0.5 pl-2">
              {sources.slice(0, 3).map((s: any, i: number) => {
                const href = kbLinkFor(s)
                return (
                  <li key={i} className="truncate">
                    {href ? (
                      <button className="underline hover:text-foreground" onClick={() => navigate(href)}>
                        {labelFor(s)}
                      </button>
                    ) : (
                      labelFor(s)
                    )}
                    {s?.similarity ? ` — ${Math.round(s.similarity * 100)}%` : ''}
                  </li>
                )
              })}
            </ul>
          </details>
        )}

        {message?.created_at && (
          <div className="mt-1 text-[10px] opacity-60 text-right">
            {new Date(message.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
        )}

        {!feedback && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Was this helpful?</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback('up')} disabled={loading}>
              <ThumbsUp size={12} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback('down')} disabled={loading}>
              <ThumbsDown size={12} />
            </Button>
          </div>
        )}

        {feedback === 'up' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-brand">
            <CheckCircle size={12} />
            <span>Thanks for the feedback!</span>
          </div>
        )}

        {feedback === 'down' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 text-xs text-brand-navy">
            <AlertCircle size={12} />
            <span>Escalated to our team. We'll follow up shortly.</span>
          </div>
        )}

      </div>
    </div>
  )
}
