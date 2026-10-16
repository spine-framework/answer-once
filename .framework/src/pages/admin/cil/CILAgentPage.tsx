// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Chat interface for the CIL agent that answers natural-language questions about indexed code"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a React page that lets users ask the CIL agent questions and view grounded answers with source chunk references"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="project_id from URL and user question" outputs="Rendered chat UI with messages and source links" errors="API request failures render error message in chat" side_effects="Calls /api/cil-agent?action=prepare, /api/ai-agents?action=run, /api/admin-data?entity=messages, and /api/cil-project"]
// CIL[DOC-MICRO logic_summary="Imports dependencies, defines message types, markdown rendering, message bubble, suggestions, and the main page component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Textarea } from '@core/components/ui/textarea'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import {
  Bot,
  User,
  ChevronRight,
  Send,
  RefreshCw,
  Zap,
  Wrench,
  Code2,
  AlertTriangle,
  Plus,
  FileCode2,
} from 'lucide-react'



import { PageInstructions } from '../../../components/admin/PageInstructions'

// CIL[DOC-VECTOR type="context" content="purpose='Chat interface for the CIL agent that answers natural-language questions about indexed code'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:Message:interface" type="interface" identity="Message" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Message shape for CIL agent chat exchanges"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the fields for a chat message including role, content, optional sources and tool calls"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines id, role, content, sources, tool_calls_made, and loading fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_type?: string
  tool?: string
  sources?: { id: string; label: string }[]
  tool_calls_made?: string[]
  loading?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Message shape for CIL agent chat exchanges'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:Message:interface"]





// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:renderMarkdown:function" type="function" identity="renderMarkdown" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Convert assistant answer text with markdown-like code and emphasis markers into React nodes"]
// CIL[DOC-RESPONSIBILITY responsibility="Render inline code, bold text, code blocks, and line breaks safely for assistant messages"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="Array of React nodes" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits text on code fences, then parses inline markers for code and bold." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let key = 0

  
  const segments = text.split(/(```[\s\S]*?```)/g)
  for (const seg of segments) {
    if (seg.startsWith('```')) {
      const lines = seg.slice(3, -3).split('\n')
      const lang = lines[0].trim()
      const code = lines.slice(lang ? 1 : 0).join('\n')
      parts.push(
        <pre key={key++} className="bg-slate-900 text-slate-100 rounded-md p-3 my-2 overflow-auto text-xs font-mono whitespace-pre">
          {lang && <div className="text-slate-400 text-xs mb-1">{lang}</div>}
          {code}
        </pre>
      )
    } else {
      


      const inline = seg.split(/(`[^`]+`|\*\*[^*]+\*\*|\n)/g).map((chunk, i) => {
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{chunk.slice(1, -1)}</code>
        }

        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={i}>{chunk.slice(2, -2)}</strong>
        }
        if (chunk === '\n') return <br key={i} />
        return chunk
      })

      parts.push(<span key={key++}>{inline}</span>)
    }

  }
  return parts
}

// CIL[DOC-VECTOR type="context" content="purpose='Convert assistant answer text with markdown-like code and emphasis markers into React nodes'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:renderMarkdown:function"]




// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:MessageBubble:component" type="component" identity="MessageBubble" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Display a single chat message with avatar, markdown body, and optional tool and source chips"]
// CIL[DOC-RESPONSIBILITY responsibility="Render user or assistant message and link source chunks to the chunk detail page"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="message, projectId, appPath" outputs="JSX message row" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Chooses avatar icon, renders markdown for assistant, and shows tool calls and source chips." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function MessageBubble({ message, projectId, appPath }: {
  message: Message
  projectId: string
  appPath: (p: string) => string
}) {
  const isUser = message.role === 'user'
  const mt = message.message_type

  if (message.loading) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-indigo-600" />
        </div>
        <div className="flex-1 space-y-1.5 pt-0.5">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    )
  }

  // Intermediate research steps render as a compact left-aligned trail rather
  // than full chat bubbles so the plan/tool activity is visually distinct from
  // the agent's actual replies.
  if (!isUser && (mt === 'plan' || mt === 'thinking' || mt === 'tool_call' || mt === 'tool_result')) {
    return (
      <div className="flex items-start gap-2.5 pl-8">
        <div className="flex-1 min-w-0 text-xs">
          {mt === 'tool_call' && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-1">
              <Wrench className="h-3 w-3" /> {message.tool || 'tool'} — running
            </span>
          )}
          {mt === 'tool_result' && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2.5 py-1">
              <Wrench className="h-3 w-3" /> {message.tool || 'tool'} — done
            </span>
          )}
          {(mt === 'plan' || mt === 'thinking') && (
            <div className="text-muted-foreground italic border-l-2 border-indigo-200 pl-3 py-0.5">
              <span className="text-[10px] uppercase tracking-wide text-indigo-400 not-italic font-medium mr-1.5">
                {mt === 'plan' ? 'plan' : 'thinking'}
              </span>
              {renderMarkdown(message.content)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const isAwaiting = mt === 'awaiting_input'
  const isError = mt === 'error'

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? 'bg-slate-200' : 'bg-indigo-100'}`}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-slate-600" />
          : <Bot className="h-3.5 w-3.5 text-indigo-600" />
        }

      </div>

      <div className={`flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-xl px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white rounded-tr-sm'
            : isError
              ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
              : isAwaiting
                ? 'bg-indigo-50 border border-indigo-200 rounded-tl-sm'
                : 'bg-muted rounded-tl-sm'
        }`}>
          {isAwaiting && (
            <div className="text-[10px] uppercase tracking-wide text-indigo-500 font-medium mb-1">Needs your input</div>
          )}
          {isUser
            ? <span className="whitespace-pre-wrap">{message.content}</span>
            : <div className="prose-sm">{renderMarkdown(message.content)}</div>
          }
        </div>

        {}
        {!isUser && (message.tool_calls_made?.length || message.sources?.length) ? (
          <div className="flex flex-wrap gap-1.5 mt-1.5 ml-0.5">
            {(message.tool_calls_made || []).map((tc, i) => (
              <span key={`tc-${tc}-${i}`} className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5">
                <Wrench className="h-2.5 w-2.5" /> {tc}
              </span>
            ))}
            {(message.sources || []).map((src, i) => (
              <a
                key={`src-${src.id}-${i}`}
                href={appPath(projectId ? `/cil/${projectId}/chunks/${src.id}` : `/cil/chunks/${src.id}`)}
                className="inline-flex items-center gap-1 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-2 py-0.5 hover:bg-indigo-100 transition-colors"
                title={`Open chunk: ${src.label}`}
              >
                <Code2 className="h-2.5 w-2.5" /> {src.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Display a single chat message with avatar, markdown body, and optional tool and source chips'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:MessageBubble:component"]



// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:SUGGESTIONS:constant" type="constant" identity="SUGGESTIONS" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Preset example prompts for the CIL agent chat"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide ready-made questions users can click to start a conversation"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Array of prompt strings" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static list of questions covering authentication, embeddings, refactor safety, side effects, and undocumented chunks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const SUGGESTIONS = [
  'What does the authentication middleware do?',
  'Which functions write to the embeddings table?',
  'Is it safe to refactor the createHandler function?',
  'What are the side effects of the runAgent function?',
  'Which chunks have no callers (potential dead code)?',
  'Show me undocumented chunks in this project',
]

// CIL[DOC-VECTOR type="context" content="purpose='Preset example prompts for the CIL agent chat'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:SUGGESTIONS:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:mapRecordToMessage:function" type="function" identity="mapRecordToMessage" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Map a persisted thread message record into the chat display Message shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Translate message_type, tool, and retrieved_sources fields from a messages row into a renderable Message"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="rec: messages record" outputs="Message" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Derives role from message_type, sources from retrieved_sources, and surfaces tool name for tool_call/tool_result rows." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mapRecordToMessage(rec: any): Message {
  const mt = rec?.data?.message_type || 'agent'
  const role: Message['role'] = mt === 'human' ? 'user' : (mt === 'system' ? 'system' : 'assistant')
  const rawSources = Array.isArray(rec?.data?.cited_sources) && rec.data.cited_sources.length
    ? rec.data.cited_sources
    : (rec?.data?.retrieved_sources || [])
  const sources = rawSources
    .map((s: any) => ({ id: s.document_id, label: s.chunk_name || s.title || s.document_id }))
    .filter((s: any) => s.id)
  return {
    id: rec.id,
    role,
    content: rec.content || '',
    message_type: mt,
    tool: rec?.data?.tool,
    sources,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Map a persisted thread message record into the chat display Message shape'; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="Local impact only; used by CILAgentPage.loadMessages"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:mapRecordToMessage:function"]

const TERMINAL_STATUSES = ['complete', 'awaiting_input', 'failed']
const MAX_STEPS = 20

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:CILAgentPage:component" type="component" identity="CILAgentPage" parent="~/.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-MACRO purpose="Main admin page for the CIL agent chat"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage chat state, call the CIL agent API, render messages, suggestions, and input"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/textarea.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILAgentPage.tsx"]
// CIL[DOC-CONTRACT inputs="project_id from URL and user typed question" outputs="Rendered chat UI with message history and source links" errors="API request failures render error message in chat" side_effects="Calls /api/cil-agent?action=prepare, /api/ai-agents?action=run, /api/admin-data?entity=messages, and /api/cil-project"]
// CIL[DOC-MICRO logic_summary="Fetches project title, scrolls to new messages, sends question to API, and renders conversation with suggestions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default function CILAgentPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [threadId, setThreadId] = useState<string | null>(null)
  const conversationIdRef = useRef<string | null>(
    (typeof localStorage !== 'undefined' && projectId)
      ? localStorage.getItem(`cil-agent-conversation:${projectId}`)
      : null
  )
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  
  useEffect(() => {
    if (!projectId) return
    apiFetch(`/api/cil-project?action=get&id=${projectId}`)
      .then(r => r.json())
      .then(data => {
        const p = data?.project || data?.data?.project
        if (p?.title) setProjectTitle(p.title)
      })
      .catch(() => {})
  }, [projectId])

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = useCallback(async (tid: string) => {
    const res = await apiFetch(`/api/admin-data?action=list&entity=messages&thread_id=${tid}&sort_field=created_at&sort_direction=asc&limit=200`)
    const json = await res.json()
    const recs = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : [])
    setMessages(recs.map(mapRecordToMessage))
  }, [])

  const ensureThread = useCallback(async (): Promise<string> => {
    if (!conversationIdRef.current) {
      conversationIdRef.current = crypto.randomUUID()
      if (projectId && typeof localStorage !== 'undefined') {
        localStorage.setItem(`cil-agent-conversation:${projectId}`, conversationIdRef.current)
      }
    }
    const prep = await apiFetch('/api/cil-agent?action=prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        conversation_id: conversationIdRef.current,
      }),
    }).then(r => r.json())
    const tid = prep?.thread_id || prep?.data?.thread_id
    if (!tid) throw new Error('Failed to prepare CIL agent thread')
    setThreadId(tid)
    return tid
  }, [projectId])

  // Restore an existing conversation thread + history only when a persisted
  // conversation_id already exists — a brand-new session stays lazy until the
  // first message so we don't create empty threads.
  useEffect(() => {
    if (!projectId || threadId || !conversationIdRef.current) return
    let cancelled = false
    ensureThread()
      .then(tid => { if (!cancelled) return loadMessages(tid) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [projectId, threadId, ensureThread, loadMessages])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: trimmed },
      { id: crypto.randomUUID(), role: 'assistant', content: '', loading: true },
    ])
    setInput('')
    setSending(true)

    try {
      const tid = threadId || (await ensureThread())

      let userMessage: string = trimmed
      for (let i = 0; i < MAX_STEPS; i++) {
        const res = await apiFetch('/api/ai-agents?action=run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: tid, user_message: userMessage, mode: 'step' }),
        }).then(r => r.json())
        userMessage = ''
        await loadMessages(tid)
        const status = res?.status || res?.data?.status
        if (TERMINAL_STATUSES.includes(status)) break
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          message_type: 'error',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ])
    } finally {
      setSending(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [projectId, sending, threadId, ensureThread, loadMessages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearConversation = () => {
    conversationIdRef.current = null
    if (projectId && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`cil-agent-conversation:${projectId}`)
    }
    setThreadId(null)
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href={appPath('/cil')} className="hover:underline">Code Intelligence</a>
          <ChevronRight className="h-3 w-3" />
          {projectId && (
            <>
              <a href={appPath(`/cil/${projectId}/dashboard`)} className="hover:underline">{projectTitle || 'Project'}</a>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="flex items-center gap-1 text-foreground font-medium">
            <Bot className="h-3.5 w-3.5 text-indigo-500" /> CIL Agent
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projectId && (
            <Badge variant="outline" className="text-xs font-mono">
              <FileCode2 className="h-3 w-3 mr-1" />
              {projectTitle || projectId.slice(0, 8)}
            </Badge>
          )}
          {!isEmpty && (
            <Button size="sm" variant="ghost" onClick={clearConversation} className="h-7 text-xs text-muted-foreground">
              <Plus className="h-3 w-3 mr-1" /> New Chat
            </Button>
          )}
        </div>
      </div>

      <PageInstructions
        description="Ask the CIL agent questions about the indexed codebase."
        sections={[
          { title: 'What this page is for', content: 'Use this chat to ask natural-language questions about the indexed codebase. The agent searches chunk contracts and the call graph to answer accurately.' },
          { title: 'How to use this page', content: 'Type a question in the input and press Enter or click send. Select a suggested prompt to start quickly. The agent returns citations from chunks and may call tools.' },
          { title: 'How to interpret results', content: 'Assistant messages include source chunk references. Click a reference to open the chunk detail. No project ID means the search spans all indexed chunks.' },
          { title: 'Important notes', content: 'The agent only knows what has been ingested and embedded. Run the CIL ingestion pipeline first for fresh or missing code.' },
        ]}
      />

      {}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Bot className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">CIL Codebase Assistant</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me anything about this codebase. I'll search the indexed chunk contracts and call graph to answer accurately.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-left"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {!projectId && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                No project scope — searching across all indexed chunks
              </div>
            )}
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            projectId={projectId || ''}
            appPath={appPath}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {}
      <div className="border-t bg-background px-4 py-3 shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a function, safe refactoring, callers, or blast radius…"
            className="min-h-[44px] max-h-[200px] resize-none text-sm"
            rows={1}
            disabled={sending}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="h-11 w-11 p-0 shrink-0"
          >
            {sending
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1.5">
          <Zap className="h-3 w-3 inline mr-1" />
          Grounded in CIL chunk contracts · Press Shift+Enter for a new line
        </p>
      </div>
    </div>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Main admin page for the CIL agent chat'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/textarea.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILAgentPage.tsx:CILAgentPage:component"]
