// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/ReportingPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Executive reporting — reconciles all demand into outcome buckets, tracks Answer Once economics, and annotates intentional changes; renders as a dashboard or a fullscreen presentation"]
// CIL[DOC-RESPONSIBILITY responsibility="Aggregate ao_support_ticket / ao_kb_article / ao_change_marker / ao_ticket_message records client-side into: demand reconciliation (validated AO / human action / exception / knowledge gap / unclassified / in flight), KPI cards with period-over-period or year-over-year deltas, AO trend with change-marker reference lines, human-action procedure table, exception taxonomy, gap topics, knowledge funnel, per-account breakdown, friction + integrity metrics, and estimated human hours"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/ReportingPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts, .framework/src/components/ui/chart.tsx, custom/apps/answer-once/hooks/useDirectory.ts, custom/apps/answer-once/pages/company/TicketPage.tsx, custom/apps/answer-once/pages/company/KBArticlePage.tsx"]
// CIL[DOC-CONTRACT inputs="route (no params); range picker today/yesterday/7d/30d/90d/MTD/QTD/YTD/all/custom; comparison none/previous/YoY; dashboard|presentation mode" outputs="JSX page + fullscreen presentation overlay" errors="fetch errors render inline" side_effects="GET /api/admin-data (items, messages); POST /api/admin-data items for change markers"]
// CIL[DOC-MICRO logic_summary="Every in-range ticket lands in exactly one demand bucket: explicit demand_class stamps win for human-resolved tickets, otherwise class is derived (AI-resolved → validated AO; reopened/escalated → exception; spawned KB article → knowledge gap). Estimated human hours use human_minutes, else the linked procedure's est_minutes, else a 15-minute fallback for human-touched cases — always labeled as estimates. Change markers render as ReferenceLines and get a live before/after evaluation over their evaluation_days window" notable_decisions="classification is derived at read time so unstamped history still reconciles; presentation mode reuses the same computed stats rather than a second data path"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useBranding } from '@core/hooks/useBranding'
import { apiFetch } from '@core/lib/api'
import { useDirectory } from '../../hooks/useDirectory'
import { Skeleton } from '@core/components/ui/skeleton'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import { Label } from '@core/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@core/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@core/components/ui/dialog'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@core/components/ui/chart'
import {
  Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis,
} from 'recharts'
import { ChevronLeft, ChevronRight, Flag, Info, Presentation, X } from 'lucide-react'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@core/components/ui/hover-card'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/ReportingPage.tsx:module_header:module_header"]

async function fetchJSON(path: string, init?: RequestInit) {
  const res = await apiFetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const json = await res.json().catch(() => null)
  if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`)
  return json?.data
}

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'mtd' | 'qtd' | 'ytd' | 'all' | 'custom'
type CompareKey = 'none' | 'prev' | 'yoy'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'mtd', label: 'MTD' },
  { key: 'qtd', label: 'QTD' },
  { key: 'ytd', label: 'YTD' },
  { key: 'all', label: 'All' },
  { key: 'custom', label: 'Custom' },
]

const COMPARES: { key: CompareKey; label: string }[] = [
  { key: 'none', label: 'No compare' },
  { key: 'prev', label: 'vs previous' },
  { key: 'yoy', label: 'vs year ago' },
]

interface Window { start: number; end: number }

function startOfDay(t: number) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }

function rangeWindow(key: RangeKey, customStart: string, customEnd: string): Window {
  const now = Date.now()
  const day = 86400000
  switch (key) {
    case 'today': return { start: startOfDay(now), end: now }
    case 'yesterday': { const t0 = startOfDay(now); return { start: t0 - day, end: t0 } }
    case '7d': return { start: now - 7 * day, end: now }
    case '90d': return { start: now - 90 * day, end: now }
    case 'mtd': { const d = new Date(now); d.setDate(1); return { start: startOfDay(d.getTime()), end: now } }
    case 'qtd': { const d = new Date(now); d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1); return { start: startOfDay(d.getTime()), end: now } }
    case 'ytd': { const d = new Date(now); d.setMonth(0, 1); return { start: startOfDay(d.getTime()), end: now } }
    case 'all': return { start: 0, end: now }
    case 'custom': {
      const s = customStart ? startOfDay(new Date(`${customStart}T00:00:00`).getTime()) : now - 30 * day
      const e = customEnd ? startOfDay(new Date(`${customEnd}T00:00:00`).getTime()) + day : now
      return { start: Math.min(s, e), end: Math.max(s, e) }
    }
    case '30d':
    default: return { start: now - 30 * day, end: now }
  }
}

function compareWindow(win: Window, key: CompareKey): Window | null {
  if (key === 'none' || win.start === 0) return null
  if (key === 'prev') { const len = win.end - win.start; return { start: win.start - len, end: win.start } }
  const s = new Date(win.start); s.setFullYear(s.getFullYear() - 1)
  const e = new Date(win.end); e.setFullYear(e.getFullYear() - 1)
  return { start: s.getTime(), end: e.getTime() }
}

const RESOLVED_STATUSES = new Set(['resolved', 'closed'])
const AI_VIA = new Set(['ai_confirmed', 'ai_auto'])

function inWindow(iso: string | undefined, w: Window) {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t >= w.start && t <= w.end
}

// boolean fields can arrive display-formatted ("Yes"/"No") through admin-data
const isTrue = (v: any) => v === true || v === 'true' || v === 'Yes'

function numOrNull(v: any): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function median(values: number[]) {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function fmtHours(h: number | null) {
  if (h === null) return '—'
  if (h < 1) return `${Math.round(h * 60)}m`
  if (h < 48) return `${h.toFixed(1)}h`
  return `${(h / 24).toFixed(1)}d`
}

// Final resolution attribution. resolved_via is authoritative; legacy tickets
// resolved before the stamp fall back to aim_resolved_by_ai.
function isAiResolved(t: any) {
  if (!RESOLVED_STATUSES.has(t.status)) return false
  const via = t.data?.resolved_via
  if (via) return AI_VIA.has(via)
  return isTrue(t.data?.aim_resolved_by_ai)
}

// Customer wait — AI cases clock out at the confident answer
// (resolve_pending_since), human cases at resolved_at.
function waitHours(t: any): number | null {
  const end = isAiResolved(t)
    ? (t.data?.resolve_pending_since || t.data?.resolved_at || t.updated_at)
    : (t.data?.resolved_at || t.updated_at)
  if (!end) return null
  const ms = new Date(String(end).replace(/ at /i, ' ')).getTime() - new Date(t.created_at).getTime()
  return Number.isNaN(ms) || ms < 0 ? null : ms / 3600000
}

// --- Demand reconciliation -------------------------------------------------
// Every ticket lands in exactly one bucket. Explicit demand_class stamps win
// for human-resolved cases; everything else is derived at read time.

type DemandClass = 'validated_ao' | 'human_action' | 'exception' | 'knowledge_gap' | 'unclassified' | 'in_flight'

const DEMAND_CLASSES: { key: DemandClass; label: string; color: string; desc: string }[] = [
  { key: 'validated_ao', label: 'Validated AO', color: 'hsl(216 100% 50%)', desc: 'Resolved by AI — confirmed by the customer or unchallenged through the auto-resolve window' },
  { key: 'human_action', label: 'Human Action', color: 'hsl(208 100% 60%)', desc: 'A person followed a known procedure — tracked per article with estimated minutes' },
  { key: 'exception', label: 'Exception', color: 'hsl(219 72% 25%)', desc: 'Reopened or escalated — judgment calls, not knowledge gaps' },
  { key: 'knowledge_gap', label: 'Knowledge Gap', color: 'hsl(38 92% 55%)', desc: 'No answer existed — this is the KB write-backlog' },
  { key: 'unclassified', label: 'Unclassified', color: 'hsl(214 25% 60%)', desc: 'Human-resolved but not yet classified — classify on the ticket page' },
  { key: 'in_flight', label: 'In Flight', color: 'hsl(214 55% 78%)', desc: 'Still open, awaiting confirmation, or being worked' },
]

function classifyTicket(t: any): DemandClass {
  if (!RESOLVED_STATUSES.has(t.status)) return 'in_flight'
  if (isAiResolved(t)) return 'validated_ao'
  const dc = t.data?.demand_class
  if (dc === 'human_action' || t.data?.ha_article_id) return 'human_action'
  if (dc === 'exception' || dc === 'knowledge_gap' || dc === 'unclassified') return dc
  if (t.data?.reopened_at || (t.data?.aim_escalation_reason && t.data.aim_escalation_reason !== 'none')) return 'exception'
  if (t.data?.kb_article_id) return 'knowledge_gap'
  return 'unclassified'
}

// Estimated human minutes — stamped human_minutes, else the linked procedure's
// est_minutes, else a 15-minute fallback for cases a human touched. AI-validated
// and AI-owned in-flight cases estimate to zero. Always an estimate.
function estHumanMinutes(t: any, articleById: Map<string, any>): number {
  const stamped = numOrNull(t.data?.human_minutes)
  if (stamped != null) return stamped
  const ha = t.data?.ha_article_id ? articleById.get(t.data.ha_article_id) : null
  const est = numOrNull(ha?.data?.est_minutes)
  if (est != null) return est
  const cls = classifyTicket(t)
  if (cls === 'validated_ao') return 0
  if (cls === 'in_flight') return (t.status === 'human_assigned' || t.status === 'in_progress') ? 15 : 0
  return 15
}

const STOPWORDS = new Set('the a an to for and or of in on at is it its do does did can could we you your i me my our us they them their this that these those are was were be been with without not no yes how what when where why which who get got use used using need needs have has had help issue problem question ticket about from as by will would should just also new make made want know'.split(' '))

function titleKeywords(tickets: any[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const t of tickets) {
    const words = String(t.title || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    const seen = new Set<string>()
    for (const w of words) {
      if (w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue
      seen.add(w)
      counts.set(w, (counts.get(w) || 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

// --- Primitives (cheap, also used for comparison windows + marker evals) ----

interface PrimitiveStats {
  total: number
  aiResolved: number
  resolved: number
  reopened: number
  resolvedEver: number
  aoRate: number | null
  reopenRate: number | null
  estMinutes: number
  waitMedian: number | null
  frictionCount: number
  frictionRate: number | null
}

function primitiveStats(tickets: any[], articleById: Map<string, any>, win: Window): PrimitiveStats {
  const inR = tickets.filter(t => inWindow(t.created_at, win))
  const aiResolved = inR.filter(isAiResolved)
  const resolved = inR.filter(t => RESOLVED_STATUSES.has(t.status))
  const reopened = inR.filter(t => t.data?.reopened_at)
  const resolvedEver = resolved.length + reopened.filter(t => !RESOLVED_STATUSES.has(t.status)).length
  const friction = inR.filter(t =>
    t.data?.reopened_at || (t.data?.aim_escalation_reason && t.data.aim_escalation_reason !== 'none'))
  const estMinutes = inR.reduce((s, t) => s + estHumanMinutes(t, articleById), 0)
  const waitMedian = median(resolved.map(waitHours).filter((v): v is number => v !== null))
  return {
    total: inR.length,
    aiResolved: aiResolved.length,
    resolved: resolved.length,
    reopened: reopened.length,
    resolvedEver,
    aoRate: inR.length ? aiResolved.length / inR.length : null,
    reopenRate: resolvedEver ? reopened.length / resolvedEver : null,
    estMinutes,
    waitMedian,
    frictionCount: friction.length,
    frictionRate: inR.length ? friction.length / inR.length : null,
  }
}

// Observed before/after value for a marker's tracked metric over its
// evaluation_days window — powers the live hypothesis check.
function markerMetricValue(metric: string, p: PrimitiveStats): number | null {
  switch (metric) {
    case 'ao_pct': return p.aoRate === null ? null : p.aoRate * 100
    case 'reopen_rate': return p.reopenRate === null ? null : p.reopenRate * 100
    case 'human_hours': return p.estMinutes / 60
    case 'wait_time': return p.waitMedian
    case 'volume': return p.total
    case 'friction': return p.frictionRate === null ? null : p.frictionRate * 100
    default: return null
  }
}

const METRIC_LABELS: Record<string, string> = {
  ao_pct: 'Answer Once %', reopen_rate: 'Reopen rate', human_hours: 'Human hours',
  wait_time: 'Customer wait', volume: 'Ticket volume', friction: 'Friction rate',
}

const MARKER_TYPES: { value: string; label: string }[] = [
  { value: 'process', label: 'Process' }, { value: 'kb_overhaul', label: 'KB overhaul' },
  { value: 'automation', label: 'Automation' }, { value: 'staffing', label: 'Staffing' },
  { value: 'incident', label: 'Incident' }, { value: 'release', label: 'Release' },
  { value: 'routing', label: 'Routing' }, { value: 'policy', label: 'Policy' },
  { value: 'tooling', label: 'Tooling' }, { value: 'other', label: 'Other' },
]

const trendConfig: ChartConfig = {
  volume: { label: 'Tickets', color: 'hsl(214 55% 78%)' },
  ao: { label: 'Answer Once %', color: 'hsl(216 100% 50%)' },
}

const CLASS_COLORS = Object.fromEntries(DEMAND_CLASSES.map(c => [c.key, c.color]))

// Bucket granularity follows the window length: days for short ranges, weeks
// for quarter-ish views, months for long ones.
function bucketGranularity(win: Window): 'day' | 'week' | 'month' {
  const days = (win.end - win.start) / 86400000
  if (days <= 14) return 'day'
  if (days <= 130) return 'week'
  return 'month'
}

function bucketKey(iso: string, gran: 'day' | 'week' | 'month') {
  const d = new Date(iso)
  if (gran === 'day') return d.toISOString().slice(0, 10)
  if (gran === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const day = d.getDay() || 7 // Monday-start week
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}
export default function ReportingPage() {
  const { accountName } = useDirectory()
  const branding = useBranding()
  const [range, setRange] = useState<RangeKey>('30d')
  const [compare, setCompare] = useState<CompareKey>('prev')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [presentationMode, setPresentationMode] = useState(false)
  const [markerOpen, setMarkerOpen] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [markers, setMarkers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetchJSON('/api/admin-data?entity=items&type_slug=ao_support_ticket&limit=1000&sort_field=created_at&sort_direction=desc').catch(() => []),
      fetchJSON('/api/admin-data?entity=items&type_slug=ao_kb_article&limit=1000').catch(() => []),
      fetchJSON('/api/admin-data?entity=items&type_slug=ao_change_marker&limit=500').catch(() => []),
      fetchJSON('/api/admin-data?entity=messages&type_slug=ao_ticket_message&limit=1000&sort_field=created_at&sort_direction=desc').catch(() => []),
    ])
      .then(([tix, arts, marks, msgs]) => {
        setTickets(Array.isArray(tix) ? tix : [])
        setArticles(Array.isArray(arts) ? arts : [])
        setMarkers(Array.isArray(marks) ? marks : [])
        setMessages(Array.isArray(msgs) ? msgs : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const win = useMemo(() => rangeWindow(range, customStart, customEnd), [range, customStart, customEnd])
  const cmpWin = useMemo(() => compareWindow(win, compare), [win, compare])
  const gran = useMemo(() => bucketGranularity(win), [win])

  const articleById = useMemo(() => new Map(articles.map(a => [a.id, a])), [articles])

  const stats = useMemo(() => {
    const prim = primitiveStats(tickets, articleById, win)
    const cmp = cmpWin ? primitiveStats(tickets, articleById, cmpWin) : null
    const inR = tickets.filter(t => inWindow(t.created_at, win))

    // Demand reconciliation — every case lands in exactly one bucket.
    const buckets = new Map<DemandClass, any[]>()
    for (const c of DEMAND_CLASSES) buckets.set(c.key, [])
    for (const t of inR) buckets.get(classifyTicket(t))!.push(t)
    const bucketRows = DEMAND_CLASSES.map(c => ({
      ...c, tickets: buckets.get(c.key)!, count: buckets.get(c.key)!.length,
      pct: inR.length ? buckets.get(c.key)!.length / inR.length : 0,
      minutes: buckets.get(c.key)!.reduce((s, t) => s + estHumanMinutes(t, articleById), 0),
    }))

    // Trend: volume bars + AO% line per bucket, markers overlay as reference lines.
    const trendMap = new Map<string, { bucket: string; volume: number; ai: number }>()
    for (const t of inR) {
      const k = bucketKey(t.created_at, gran)
      const row = trendMap.get(k) || { bucket: k, volume: 0, ai: 0 }
      row.volume++
      if (isAiResolved(t)) row.ai++
      trendMap.set(k, row)
    }
    const trend = [...trendMap.values()]
      .sort((a, b) => a.bucket.localeCompare(b.bucket))
      .map(r => ({ ...r, ao: r.volume ? Math.round((r.ai / r.volume) * 100) : null }))
    const markerLines = markers
      .filter(m => m.data?.marker_date && inWindow(m.data.marker_date, win))
      .map(m => ({ bucket: bucketKey(m.data.marker_date, gran), title: m.title || 'Change' }))

    // Human-action procedures — published human_action_required articles and
    // the tickets classified onto them.
    const haTickets = buckets.get('human_action')!
    const haByArticle = new Map<string, { count: number; minutes: number; reopens: number }>()
    let haUnlinked = 0
    for (const t of haTickets) {
      const artId = t.data?.ha_article_id
      if (!artId) { haUnlinked++; continue }
      const row = haByArticle.get(artId) || { count: 0, minutes: 0, reopens: 0 }
      row.count++
      row.minutes += estHumanMinutes(t, articleById)
      if (t.data?.reopened_at) row.reopens++
      haByArticle.set(artId, row)
    }
    const haRows = [...haByArticle.entries()]
      .map(([id, r]) => ({ id, title: articleById.get(id)?.title || 'Unknown procedure', ...r }))
      .sort((a, b) => b.count - a.count)
    const procedures = articles
      .filter(a => a.data?.resolution_mode === 'human_action_required')
      .map(a => ({ id: a.id, title: a.title, est: numOrNull(a.data?.est_minutes), used: haByArticle.get(a.id)?.count || 0 }))
      .sort((a, b) => b.used - a.used)

    // Exceptions — escalations by reason plus reopen reasons.
    const reasonCounts = new Map<string, number>()
    for (const t of inR) {
      const r = t.data?.aim_escalation_reason
      if (r && r !== 'none') reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1)
      const rr = t.data?.reopen_reason
      if (t.data?.reopened_at && rr && rr !== r) reasonCounts.set(`reopen: ${rr}`, (reasonCounts.get(`reopen: ${rr}`) || 0) + 1)
    }
    const exceptions = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])
    const diagnosisCounts = new Map<string, number>()
    for (const m of messages.filter(m => inWindow(m.created_at, win) && m.data?.feedback_diagnosis)) {
      const d = String(m.data.feedback_diagnosis)
      diagnosisCounts.set(d, (diagnosisCounts.get(d) || 0) + 1)
    }
    const diagnoses = [...diagnosisCounts.entries()].sort((a, b) => b[1] - a[1])

    // Gap topics — recurring words among knowledge-gap and unclassified cases.
    const gaps = titleKeywords([...buckets.get('knowledge_gap')!, ...buckets.get('unclassified')!])
      .filter(([, n]) => n >= 2).slice(0, 8)

    // Knowledge funnel: resolved → analyzed → candidate → in review → published
    const analyzed = inR.filter(t => t.data?.analysis_timestamp).length
    const withCandidate = inR.filter(t => t.data?.kb_article_id).length
    const linked = inR.map(t => t.data?.kb_article_id ? articleById.get(t.data.kb_article_id) : null).filter(Boolean)
    const funnel = [
      { stage: 'Resolved', count: prim.resolved },
      { stage: 'Analyzed', count: analyzed },
      { stage: 'KB candidate', count: withCandidate },
      { stage: 'In review', count: linked.filter((a: any) => ['in_review', 'candidate', 'draft'].includes(a.status)).length },
      { stage: 'Published', count: linked.filter((a: any) => a.status === 'published').length },
    ]

    // Per-account breakdown
    const byAccount = new Map<string, { total: number; ai: number; minutes: number; reopened: number }>()
    for (const t of inR) {
      const key = t.account_id || 'unknown'
      const row = byAccount.get(key) || { total: 0, ai: 0, minutes: 0, reopened: 0 }
      row.total++
      if (isAiResolved(t)) row.ai++
      row.minutes += estHumanMinutes(t, articleById)
      if (t.data?.reopened_at) row.reopened++
      byAccount.set(key, row)
    }
    const accountRows = [...byAccount.entries()]
      .map(([id, r]) => ({ id, ...r, ao: r.total ? r.ai / r.total : 0 }))
      .sort((a, b) => b.total - a.total)

    // Change markers — hypotheses with a live before/after over evaluation_days.
    const day = 86400000
    const markerRows = markers
      .map(m => {
        const md = m.data?.marker_date ? new Date(m.data.marker_date).getTime() : null
        const evalDays = numOrNull(m.data?.evaluation_days) ?? 30
        let observed: number | null = null
        let before: number | null = null
        if (md !== null && m.data?.metric) {
          before = markerMetricValue(m.data.metric, primitiveStats(tickets, articleById, { start: md - evalDays * day, end: md }))
          const after = markerMetricValue(m.data.metric, primitiveStats(tickets, articleById, { start: md, end: Math.min(md + evalDays * day, Date.now()) }))
          observed = before !== null && after !== null ? after - before : null
        }
        return { id: m.id, title: m.title, date: md, data: m.data || {}, before, observed }
      })
      .sort((a, b) => (b.date || 0) - (a.date || 0))

    return { prim, cmp, bucketRows, trend, markerLines, haRows, haUnlinked, procedures, exceptions, diagnoses, gaps, funnel, accountRows, markerRows }
  }, [tickets, articles, markers, messages, articleById, win, cmpWin, gran])

  const delta = (cur: number | null, prev: number | null | undefined) =>
    cur === null || prev === null || prev === undefined ? null : cur - prev

  const kpis = [
    { label: branding.app_name, value: stats.prim.aoRate === null ? '—' : `${Math.round(stats.prim.aoRate * 100)}%`, sub: `${stats.prim.aiResolved} of ${stats.prim.total} resolved w/o a human`, d: delta(stats.prim.aoRate, stats.cmp?.aoRate), unit: 'pts', scale: 100, info: 'Share of all cases resolved to the customer\u2019s satisfaction with zero human involvement. Any human touch or post-close reopen counts against it.' },
    { label: 'Total demand', value: String(stats.prim.total), sub: 'tickets opened in range', d: delta(stats.prim.total, stats.cmp?.total), unit: '', scale: 1, invert: true, info: 'All tickets opened in the window — the denominator every bucket shares.' },
    { label: 'Est. human hours', value: fmtHours(stats.prim.estMinutes / 60), sub: 'estimate — stamped, procedure, or 15m fallback', d: delta(stats.prim.estMinutes, stats.cmp?.estMinutes), unit: 'm', scale: 1, invert: true, info: 'Estimated human effort: ticket human_minutes, else the linked procedure\u2019s est_minutes, else a 15-minute fallback for human-touched cases. An estimate, not measured labor.' },
    { label: 'Median wait', value: fmtHours(stats.prim.waitMedian), sub: 'open to confident answer or human resolution', d: delta(stats.prim.waitMedian, stats.cmp?.waitMedian), unit: 'h', scale: 1, invert: true, info: 'Typical customer wait: created → confident AI answer, or created → human resolution.' },
    { label: 'Reopen rate', value: stats.prim.reopenRate === null ? '—' : `${Math.round(stats.prim.reopenRate * 100)}%`, sub: `${stats.prim.reopened} reopened — the AO integrity check`, d: delta(stats.prim.reopenRate, stats.cmp?.reopenRate), unit: 'pts', scale: 100, invert: true, info: 'Share of ever-resolved cases the customer came back on. If AO% rises while this rises faster, we\u2019re closing confidently, not correctly.' },
  ]

  const rangeLabel = RANGES.find(r => r.key === range)?.label || range

  const body = loading ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
  ) : error ? (
    <div className="text-sm text-destructive py-8 text-center border border-dashed border-border rounded-lg">{error}</div>
  ) : (
    <div className="space-y-6 max-w-6xl">
      {/* KPI row with comparison deltas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map(k => (
          <Stat key={k.label} label={k.label} info={k.info} value={k.value} sub={k.sub}
            delta={k.d === null ? null : { value: k.d * (k.scale || 1), unit: k.unit, invert: !!k.invert }} />
        ))}
      </div>

      {/* Demand reconciliation — 100% of demand accounted for */}
      <Card title="Demand reconciliation — where every case landed" info="Every ticket in range lands in exactly one bucket. Validated AO is the goal state; Human Action is work a person must do by design; Exception is judgment; Knowledge Gap is the KB write-backlog; Unclassified needs a class stamped on the ticket.">
        {stats.prim.total === 0 ? <Empty /> : (
          <div className="space-y-3">
            <div className="flex h-5 rounded overflow-hidden bg-muted">
              {stats.bucketRows.filter(b => b.count > 0).map(b => (
                <div key={b.key} style={{ width: `${b.pct * 100}%`, background: b.color }} title={`${b.label}: ${b.count}`} />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {stats.bucketRows.map(b => (
                <div key={b.key} className="flex items-start gap-2 rounded border border-border/60 p-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: b.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{b.label} <span className="text-muted-foreground font-normal">· {b.count} ({Math.round(b.pct * 100)}%)</span></p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                    {b.minutes > 0 && <p className="text-xs text-muted-foreground">~{fmtHours(b.minutes / 60)} est. human time</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* AO trend + change markers */}
      <Card title={`${branding.app_name} trend — volume, rate, and the changes that should move it`} info="Ticket volume per bucket with the AO% line overlaid. Vertical lines are change markers — intentional operational changes annotated so a trend shift has an explanation attached.">
        {stats.trend.length === 0 ? <Empty /> : (
          <ChartContainer config={trendConfig} className="h-64 w-full">
            <ComposedChart data={stats.trend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis yAxisId="vol" allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
              <YAxis yAxisId="ao" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="vol" dataKey="volume" fill="var(--color-volume)" radius={[2, 2, 0, 0]} />
              <Line yAxisId="ao" type="monotone" dataKey="ao" stroke="var(--color-ao)" strokeWidth={2} dot={false} connectNulls />
              {stats.markerLines.map((m, i) => (
                <ReferenceLine key={i} yAxisId="vol" x={m.bucket} stroke="hsl(38 92% 45%)" strokeDasharray="4 3"
                  label={{ value: m.title, position: 'insideTopLeft', fontSize: 10, fill: 'hsl(38 92% 40%)' }} />
              ))}
            </ComposedChart>
          </ChartContainer>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Human actions — procedures people actually ran */}
        <Card title="Human actions — procedures in use" info="Cases a person resolved by following a published human-action procedure, with estimated time. Procedures with zero uses may be dead weight; heavily used ones are automation candidates.">
          {stats.haRows.length === 0 && stats.procedures.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {stats.haRows.map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs w-44 truncate shrink-0" title={r.title}>{r.title}</span>
                  <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${(r.count / Math.max(stats.haRows[0]?.count || 1, 1)) * 100}%`, background: CLASS_COLORS.human_action }} />
                  </div>
                  <span className="text-xs font-medium w-24 text-right">{r.count}× · ~{fmtHours(r.minutes / 60)}</span>
                </div>
              ))}
              {stats.haUnlinked > 0 && <p className="text-xs text-muted-foreground">{stats.haUnlinked} human-action case{stats.haUnlinked === 1 ? '' : 's'} not linked to a procedure.</p>}
              {stats.procedures.filter(p => p.used === 0).slice(0, 3).map(p => (
                <p key={p.id} className="text-xs text-muted-foreground">Unused procedure: {p.title}{p.est != null ? ` (~${p.est}m)` : ''}</p>
              ))}
            </div>
          )}
        </Card>

        {/* Exceptions — the judgment-call taxonomy */}
        <Card title="Exceptions — why cases needed judgment" info="Escalation and reopen reasons behind the exception bucket. These are not knowledge gaps — writing an article won\u2019t fix a refund decision or a returned customer.">
          {stats.exceptions.length === 0 && stats.diagnoses.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {stats.exceptions.map(([reason, count]) => (
                <BarRow key={reason} label={reason.replace(/_/g, ' ')} count={count} max={stats.exceptions[0][1]} color={CLASS_COLORS.exception} />
              ))}
              {stats.diagnoses.map(([d, count]) => (
                <BarRow key={d} label={`thumbs: ${d.replace(/_/g, ' ')}`} count={count} max={stats.diagnoses[0][1]} color="hsl(219 72% 45%)" />
              ))}
            </div>
          )}
        </Card>

        {/* Knowledge gaps — the write backlog */}
        <Card title="Knowledge gaps — what to write next" info="Recurring themes in cases where no answer existed. Each cluster closed by a new article converts gap volume into Validated AO.">
          {stats.gaps.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {stats.gaps.map(([word, count]) => (
                <BarRow key={word} label={word} count={count} max={stats.gaps[0][1]} color={CLASS_COLORS.knowledge_gap} />
              ))}
            </div>
          )}
        </Card>

        {/* Knowledge funnel */}
        <Card title="Knowledge funnel" info="Resolved case → analysis → knowledge candidate → review → published article. A fat bottom with a thin top means answers aren\u2019t becoming reusable knowledge.">
          {stats.funnel.every(f => f.count === 0) ? <Empty /> : (
            <div className="space-y-2">
              {stats.funnel.map(f => (
                <BarRow key={f.stage} label={f.stage} count={f.count} max={Math.max(stats.funnel[0]?.count || 0, 1)} color="hsl(216 100% 50%)" />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Change markers — hypotheses and observed impact */}
      <Card title="Change markers — intentional changes and what they did" info="Every marker records a hypothesis (metric, expected direction, evaluation window). Observed shows the live before/after delta across that window — evaluate it and stamp eval_status once the window closes.">
        {stats.markerRows.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">Change</th>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  <th className="py-2 pr-4 font-medium">Expected</th>
                  <th className="py-2 pr-4 font-medium text-right">Observed Δ</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.markerRows.map(m => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-medium">{m.title}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{m.date ? new Date(m.date).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-4">{(m.data.change_type || 'other').replace(/_/g, ' ')}</td>
                    <td className="py-2 pr-4">{METRIC_LABELS[m.data.metric] || m.data.metric || '—'}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {m.data.expected_direction ? `${m.data.expected_direction}${m.data.expected_magnitude ? ` ${m.data.expected_magnitude}` : ''}` : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right font-medium">
                      {m.observed === null ? '—' : `${m.observed > 0 ? '+' : ''}${m.observed.toFixed(1)}${['ao_pct', 'reopen_rate', 'friction'].includes(m.data.metric) ? 'pts' : ''}`}
                    </td>
                    <td className="py-2">{(m.data.eval_status || 'pending').replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Account breakdown */}
      <Card title="By account" info={`Demand, ${branding.app_name} %, estimated human hours, and reopens per customer account. The lowest-${branding.app_name} accounts are where seeding knowledge pays off fastest.`}>
        {stats.accountRows.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">Account</th>
                  <th className="py-2 pr-4 font-medium text-right">Tickets</th>
                  <th className="py-2 pr-4 font-medium text-right">{branding.app_name}</th>
                  <th className="py-2 pr-4 font-medium text-right">Est. hours</th>
                  <th className="py-2 font-medium text-right">Reopened</th>
                </tr>
              </thead>
              <tbody>
                {stats.accountRows.map(r => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-medium">{accountName(r.id) || 'Unknown'}</td>
                    <td className="py-2 pr-4 text-right">{r.total}</td>
                    <td className="py-2 pr-4 text-right">{Math.round(r.ao * 100)}% <span className="text-muted-foreground">({r.ai})</span></td>
                    <td className="py-2 pr-4 text-right">~{fmtHours(r.minutes / 60)}</td>
                    <td className="py-2 text-right">{r.reopened}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Friction: {stats.prim.frictionCount} case{stats.prim.frictionCount === 1 ? '' : 's'} ({stats.prim.frictionRate === null ? '—' : `${Math.round(stats.prim.frictionRate * 100)}%`}) hit a reopen or escalation.
        Human hours are estimates — stamped minutes, procedure estimates, or a 15-minute fallback.
      </p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Reporting</h1>
          <p className="text-sm text-muted-foreground">Demand reconciliation and {branding.app_name} economics — {rangeLabel.toLowerCase()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {RANGES.map(r => (
            <Button key={r.key} size="sm" variant={range === r.key ? 'default' : 'outline'} onClick={() => setRange(r.key)}>
              {r.label}
            </Button>
          ))}
          <Select value={compare} onValueChange={(v) => setCompare(v as CompareKey)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMPARES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setMarkerOpen(true)}>
            <Flag size={14} className="mr-1" /> Marker
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPresentationMode(true)}>
            <Presentation size={14} className="mr-1" /> Present
          </Button>
        </div>
      </div>
      {range === 'custom' && (
        <div className="px-4 sm:px-6 py-2 border-b border-border flex items-center gap-2 text-sm">
          <Label htmlFor="db-start" className="text-xs text-muted-foreground">From</Label>
          <Input id="db-start" type="date" className="h-8 w-40" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          <Label htmlFor="db-end" className="text-xs text-muted-foreground">To</Label>
          <Input id="db-end" type="date" className="h-8 w-40" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
        </div>
      )}

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">{body}</div>

      {presentationMode && !loading && !error && (
        <PresentationOverlay stats={stats} kpis={kpis} rangeLabel={rangeLabel} accountName={accountName} onClose={() => setPresentationMode(false)} />
      )}
      <MarkerDialog open={markerOpen} onClose={() => setMarkerOpen(false)} onSaved={() => { setMarkerOpen(false); load() }} />
    </div>
  )
}
// --- Presentation mode --------------------------------------------------------
// Same computed stats, re-laid-out as a fullscreen sequence. Arrow keys /
// buttons navigate, Esc exits. Slides are deliberately information-dense —
// this is a board presentation, not a marketing piece.

function PresentationOverlay({ stats, kpis, rangeLabel, accountName, onClose }: {
  stats: any
  kpis: { label: string; value: string; sub: string; info?: string; d: number | null; unit: string; scale: number; invert?: boolean }[]
  rangeLabel: string
  accountName: (id?: string | null) => string | undefined
  onClose: () => void
}) {
  const [slide, setSlide] = useState(0)
  const branding = useBranding()

  const slides: { title: string; sub: string; body: ReactNode }[] = [
    {
      title: 'Reporting',
      sub: `Demand reconciliation and ${branding.app_name} economics — ${rangeLabel.toLowerCase()}`,
      body: (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {kpis.map(k => (
            <Stat key={k.label} label={k.label} value={k.value} sub={k.sub}
              delta={k.d === null ? null : { value: k.d * (k.scale || 1), unit: k.unit, invert: !!k.invert }} />
          ))}
        </div>
      ),
    },
    {
      title: 'Demand reconciliation',
      sub: 'Every case lands in exactly one bucket — 100% of demand accounted for',
      body: (
        <div className="space-y-4">
          <div className="flex h-8 rounded overflow-hidden bg-muted">
            {stats.bucketRows.filter((b: any) => b.count > 0).map((b: any) => (
              <div key={b.key} style={{ width: `${b.pct * 100}%`, background: b.color }} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.bucketRows.map((b: any) => (
              <div key={b.key} className="flex items-start gap-3 rounded border border-border/60 p-3">
                <span className="mt-1.5 h-3 w-3 rounded-sm shrink-0" style={{ background: b.color }} />
                <div>
                  <p className="font-medium">{b.label} <span className="text-muted-foreground font-normal">· {b.count} ({Math.round(b.pct * 100)}%)</span></p>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                  {b.minutes > 0 && <p className="text-sm text-muted-foreground">~{fmtHours(b.minutes / 60)} est. human time</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: `${branding.app_name} trend`,
      sub: 'Volume, rate, and the changes that should move it',
      body: stats.trend.length === 0 ? <Empty /> : (
        <ChartContainer config={trendConfig} className="h-[55vh] w-full">
          <ComposedChart data={stats.trend}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis yAxisId="vol" allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
            <YAxis yAxisId="ao" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar yAxisId="vol" dataKey="volume" fill="var(--color-volume)" radius={[2, 2, 0, 0]} />
            <Line yAxisId="ao" type="monotone" dataKey="ao" stroke="var(--color-ao)" strokeWidth={3} dot={false} connectNulls />
            {stats.markerLines.map((m: any, i: number) => (
              <ReferenceLine key={i} yAxisId="vol" x={m.bucket} stroke="hsl(38 92% 45%)" strokeDasharray="4 3"
                label={{ value: m.title, position: 'insideTopLeft', fontSize: 11, fill: 'hsl(38 92% 40%)' }} />
            ))}
          </ComposedChart>
        </ChartContainer>
      ),
    },
    {
      title: 'Human actions',
      sub: 'Procedures people ran — and the estimated time they took',
      body: stats.haRows.length === 0 ? <Empty /> : (
        <div className="space-y-3">
          {stats.haRows.map((r: any) => (
            <div key={r.id} className="flex items-center gap-4">
              <span className="text-sm w-64 truncate shrink-0">{r.title}</span>
              <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                <div className="h-full" style={{ width: `${(r.count / Math.max(stats.haRows[0]?.count || 1, 1)) * 100}%`, background: CLASS_COLORS.human_action }} />
              </div>
              <span className="text-sm font-medium w-28 text-right">{r.count}× · ~{fmtHours(r.minutes / 60)}</span>
            </div>
          ))}
          {stats.haUnlinked > 0 && <p className="text-sm text-muted-foreground">{stats.haUnlinked} human-action cases not linked to a procedure.</p>}
        </div>
      ),
    },
    {
      title: 'Exceptions & knowledge gaps',
      sub: 'What needed judgment vs. what needs writing',
      body: (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Exceptions</h3>
            {stats.exceptions.length === 0 ? <Empty /> : stats.exceptions.slice(0, 6).map(([reason, count]: [string, number]) => (
              <BarRow key={reason} label={reason.replace(/_/g, ' ')} count={count} max={stats.exceptions[0][1]} color={CLASS_COLORS.exception} large />
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Gap topics</h3>
            {stats.gaps.length === 0 ? <Empty /> : stats.gaps.slice(0, 6).map(([word, count]: [string, number]) => (
              <BarRow key={word} label={word} count={count} max={stats.gaps[0][1]} color={CLASS_COLORS.knowledge_gap} large />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Change markers',
      sub: 'Hypotheses and what they actually did',
      body: stats.markerRows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-medium">Change</th>
              <th className="py-2 pr-4 font-medium">When</th>
              <th className="py-2 pr-4 font-medium">Metric</th>
              <th className="py-2 pr-4 font-medium">Expected</th>
              <th className="py-2 pr-4 font-medium text-right">Observed Δ</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.markerRows.map((m: any) => (
              <tr key={m.id} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 font-medium">{m.title}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{m.date ? new Date(m.date).toLocaleDateString() : '—'}</td>
                <td className="py-2.5 pr-4">{METRIC_LABELS[m.data.metric] || m.data.metric || '—'}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{m.data.expected_direction || '—'}{m.data.expected_magnitude ? ` ${m.data.expected_magnitude}` : ''}</td>
                <td className="py-2.5 pr-4 text-right font-medium">
                  {m.observed === null ? '—' : `${m.observed > 0 ? '+' : ''}${m.observed.toFixed(1)}${['ao_pct', 'reopen_rate', 'friction'].includes(m.data.metric) ? 'pts' : ''}`}
                </td>
                <td className="py-2.5">{(m.data.eval_status || 'pending').replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      title: 'By account',
      sub: 'Where the demand is and who it costs',
      body: stats.accountRows.length === 0 ? <Empty /> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-medium">Account</th>
              <th className="py-2 pr-4 font-medium text-right">Tickets</th>
              <th className="py-2 pr-4 font-medium text-right">{branding.app_name}</th>
              <th className="py-2 pr-4 font-medium text-right">Est. hours</th>
              <th className="py-2 font-medium text-right">Reopened</th>
            </tr>
          </thead>
          <tbody>
            {stats.accountRows.map((r: any) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 font-medium">{accountName(r.id) || 'Unknown'}</td>
                <td className="py-2.5 pr-4 text-right">{r.total}</td>
                <td className="py-2.5 pr-4 text-right">{Math.round(r.ao * 100)}% <span className="text-muted-foreground">({r.ai})</span></td>
                <td className="py-2.5 pr-4 text-right">~{fmtHours(r.minutes / 60)}</td>
                <td className="py-2.5 text-right">{r.reopened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ]

  const go = useCallback((d: number) => setSlide(s => Math.min(Math.max(s + d, 0), slides.length - 1)), [slides.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  const s = slides[slide]
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="px-6 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Slide {slide + 1} of {slides.length}</p>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => go(-1)} disabled={slide === 0}><ChevronLeft size={14} /></Button>
          <Button size="sm" variant="outline" onClick={() => go(1)} disabled={slide === slides.length - 1}><ChevronRight size={14} /></Button>
          <Button size="sm" variant="outline" onClick={onClose}><X size={14} /></Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold">{s.title}</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">{s.sub}</p>
          {s.body}
        </div>
      </div>
    </div>
  )
}

// --- Marker creation ---------------------------------------------------------

function MarkerDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', when: '', change_type: 'process', metric: 'ao_pct', expected_direction: '', expected_magnitude: '', evaluation_days: '30', why: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    if (!form.title.trim() || !form.when || !form.change_type || !form.metric) {
      setErr('Change, when, type, and metric are required.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      await fetchJSON('/api/admin-data', {
        method: 'POST',
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'ao_change_marker',
          title: form.title.trim(),
          data: {
            marker_date: new Date(form.when).toISOString(),
            change_type: form.change_type,
            metric: form.metric,
            ...(form.expected_direction ? { expected_direction: form.expected_direction } : {}),
            ...(form.expected_magnitude.trim() ? { expected_magnitude: form.expected_magnitude.trim() } : {}),
            evaluation_days: numOrNull(form.evaluation_days) ?? 30,
            ...(form.why.trim() ? { why: form.why.trim() } : {}),
            eval_status: 'pending',
          },
        }),
      })
      setForm({ title: '', when: '', change_type: 'process', metric: 'ao_pct', expected_direction: '', expected_magnitude: '', evaluation_days: '30', why: '' })
      onSaved()
    } catch (e: any) {
      setErr(e.message || 'Failed to save marker')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add change marker</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="mk-title" className="text-xs">Change</Label>
            <Input id="mk-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Published billing overhaul" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="mk-when" className="text-xs">When</Label>
              <Input id="mk-when" type="datetime-local" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={form.change_type} onValueChange={(v) => setForm({ ...form, change_type: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MARKER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Primary metric</Label>
              <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(METRIC_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Expected direction</Label>
              <Select value={form.expected_direction || 'none'} onValueChange={(v) => setForm({ ...form, expected_direction: v === 'none' ? '' : v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="mk-mag" className="text-xs">Expected impact</Label>
              <Input id="mk-mag" value={form.expected_magnitude} onChange={(e) => setForm({ ...form, expected_magnitude: e.target.value })} placeholder="e.g. +10pts" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mk-eval" className="text-xs">Eval window (days)</Label>
              <Input id="mk-eval" type="number" min={1} value={form.evaluation_days} onChange={(e) => setForm({ ...form, evaluation_days: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="mk-why" className="text-xs">Why this change</Label>
            <Textarea id="mk-why" rows={2} value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} placeholder="Hypothesis — what should move and why" />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add marker'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Small presentational pieces ----------------------------------------------

function InfoTip({ text }: { text: string }) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="inline-flex items-center text-muted-foreground hover:text-brand transition-colors" aria-label="How to read this">
          <Info size={13} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="p-3 text-brand-navy">{text}</HoverCardContent>
    </HoverCard>
  )
}

function fmtDelta(d: { value: number; unit: string; invert: boolean }) {
  if (d.value === 0) return null
  const favorable = d.invert ? d.value < 0 : d.value > 0
  const sign = d.value > 0 ? '+' : ''
  const text = d.unit === 'pts' ? `${sign}${d.value.toFixed(1)} pts`
    : d.unit === 'm' || d.unit === 'h'
      ? `${d.value > 0 ? '+' : '−'}${fmtHours(Math.abs(d.value) / (d.unit === 'm' ? 60 : 1))}`
      : `${sign}${Math.round(d.value)}`
  return { text, favorable }
}

function Stat({ label, value, sub, info, delta }: {
  label: string; value: string; sub: string; info?: string
  delta?: { value: number; unit: string; invert: boolean } | null
}) {
  const d = delta ? fmtDelta(delta) : null
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        {label}
        {info && <InfoTip text={info} />}
      </p>
      <p className="text-2xl font-semibold mt-1">
        {value}
        {d && (
          <span className={`ml-2 text-sm font-medium ${d.favorable ? 'text-brand' : 'text-destructive'}`}>{d.text}</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}

function BarRow({ label, count, max, color, large }: { label: string; count: number; max: number; color: string; large?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${large ? 'text-sm w-48' : 'text-xs w-36'} text-muted-foreground truncate shrink-0`} title={label}>{label}</span>
      <div className={`flex-1 ${large ? 'h-5' : 'h-4'} rounded bg-muted overflow-hidden`}>
        <div className="h-full" style={{ width: `${(count / Math.max(max, 1)) * 100}%`, background: color }} />
      </div>
      <span className={`${large ? 'text-sm' : 'text-xs'} font-medium w-8 text-right`}>{count}</span>
    </div>
  )
}

function Card({ title, children, info }: { title: string; children: ReactNode; info?: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
        {title}
        {info && <InfoTip text={info} />}
      </h2>
      {children}
    </section>
  )
}

function Empty() {
  return <p className="text-sm text-muted-foreground py-8 text-center">No data in this range.</p>
}
