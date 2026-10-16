// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines imports and dependencies for the KB article list UI."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, utility, and UI component imports for KBArticleList."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import block for hooks, API, utilities, and UI primitives." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { Plus, Search, Edit, BookOpen, GripVertical, X } from 'lucide-react'


// CIL[DOC-VECTOR type="context" content="purpose='Defines imports and dependencies for the KB article list UI.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBArticleListProps:interface"]
// CIL[DOC-MACRO purpose="Defines the props accepted by the KBArticleList component."]
// CIL[DOC-RESPONSIBILITY responsibility="Contract between parent and KBArticleList."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="KBArticleListProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists optional and required props for the component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface KBArticleListProps {
  typeSlugs: string[]
  typeName?: string
  onSelect?: (record: KBRecord) => void
  onNew?: () => void
  onEdit?: (record: KBRecord) => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the props accepted by the KBArticleList component.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBArticleListProps:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBRecord:interface"]
// CIL[DOC-MACRO purpose="Defines the shape of a knowledge base record."]
// CIL[DOC-RESPONSIBILITY responsibility="Data model for KB articles."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="KBRecord interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines KBRecord fields including id, title, status, and data." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface KBRecord {
  id: string
  title: string
  description?: string
  status: string
  type_id: string
  type_slug?: string
  created_at: string
  data: Record<string, any>
  [key: string]: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of a knowledge base record.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBRecord:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:TreeNode:interface"]
// CIL[DOC-MACRO purpose="Defines a tree node that extends KBRecord with children."]
// CIL[DOC-RESPONSIBILITY responsibility="Recursive tree structure contract."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TreeNode interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extends KBRecord with a children array." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TreeNode extends KBRecord {
  children: TreeNode[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines a tree node that extends KBRecord with children.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:TreeNode:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:isNullId:function"]
// CIL[DOC-MACRO purpose="Tests whether a value is a null, undefined, or empty id."]
// CIL[DOC-RESPONSIBILITY responsibility="Predicate for missing id values."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="a: string | null | undefined" outputs="boolean (type predicate a is null | undefined)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns true for null, undefined, or empty string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function isNullId(a: string | null | undefined): a is null | undefined {
  return a === null || a === undefined || a === ''
}
// CIL[DOC-VECTOR type="context" content="purpose='Tests whether a value is a null, undefined, or empty id.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:isNullId:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sameId:function"]
// CIL[DOC-MACRO purpose="Compares two id values for equality, treating nullish as equal."]
// CIL[DOC-RESPONSIBILITY responsibility="Determine id equality for parent and record comparisons."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="a, b: string | null | undefined" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns true if values are equal or both nullish." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sameId(a: string | null | undefined, b: string | null | undefined): boolean {
  return a === b || (isNullId(a) && isNullId(b))
}
// CIL[DOC-VECTOR type="context" content="purpose='Compares two id values for equality, treating nullish as equal.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sameId:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sameParent:function"]
// CIL[DOC-MACRO purpose="Checks whether a record's parent_id matches the given parent."]
// CIL[DOC-RESPONSIBILITY responsibility="Parent equality predicate for tree grouping."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="record: KBRecord, parentId: string | undefined" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compares record.data.parent_id to parentId using sameId." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sameParent(record: KBRecord, parentId: string | undefined): boolean {
  return sameId(record.data?.parent_id as string | undefined, parentId)
}
// CIL[DOC-VECTOR type="context" content="purpose='Checks whether a record's parent_id matches the given parent.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sameParent:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sortByOrder:function"]
// CIL[DOC-MACRO purpose="Sorts two KB records by their data.order value."]
// CIL[DOC-RESPONSIBILITY responsibility="Order comparison for tree siblings."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="a: KBRecord, b: KBRecord" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Subtracts b order from a order, defaulting to MAX_SAFE_INTEGER." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function sortByOrder(a: KBRecord, b: KBRecord): number {
  return (a.data?.order ?? Number.MAX_SAFE_INTEGER) - (b.data?.order ?? Number.MAX_SAFE_INTEGER)
}
// CIL[DOC-VECTOR type="context" content="purpose='Sorts two KB records by their data.order value.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:sortByOrder:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBArticleList:component"]
// CIL[DOC-MACRO purpose="Renders a searchable, filterable, drag-and-drop knowledge base article list."]
// CIL[DOC-RESPONSIBILITY responsibility="Display KB articles as a tree or flat list, support search, status/type filters, and reordering via drag-and-drop."]
// CIL[DOC-CONTEXT module="kb" layer="components" related_files=".framework/src/components/kb/KBArticleList.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="typeSlugs: string[], typeName?: string, onSelect?: (record: KBRecord) => void, onNew?: () => void, onEdit?: (record: KBRecord) => void" outputs="JSX" errors="Network or permission errors" side_effects="Fetches data from API, updates state, PATCHes records on drop."]
// CIL[DOC-MICRO logic_summary="Loads record types, fetches article trees, handles search, builds filtered tree, renders list, and applies drag-and-drop reordering." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="param" content="typeSlugs: string[] - allowed knowledge base type slugs"]
// CIL[DOC-NOTE type="param" content="typeName?: string - display name for the knowledge base"]
// CIL[DOC-NOTE type="param" content="onSelect?: (record: KBRecord) => void - callback when an article is selected"]
// CIL[DOC-NOTE type="param" content="onNew?: () => void - callback to create a new article"]
// CIL[DOC-NOTE type="param" content="onEdit?: (record: KBRecord) => void - callback to edit an article"
export function KBArticleList({ typeSlugs, typeName, onSelect, onNew, onEdit }: KBArticleListProps) {
  const [typeRecords, setTypeRecords] = useState<any[]>([])
  const [articles, setArticles] = useState<KBRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResultIds, setSearchResultIds] = useState<Set<string> | null>(null)
  const [searching, setSearching] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dragging, setDragging] = useState<string | null>(null)




  const typeById = useMemo(() => {
    const map: Record<string, any> = {}
    typeRecords.forEach((t) => { map[t.id] = t })
    return map
  }, [typeRecords])





  const typeSlugsSet = useMemo(() => new Set(typeSlugs), [typeSlugs])





  const statusOptions = useMemo(() => {
    const opts = new Set<string>()
    typeRecords.forEach((t) => {
      const options = t.design_schema?.fields?.status?.options || ['draft', 'published', 'archived']
      options.forEach((o: string) => opts.add(o))
    })
    return ['all', ...Array.from(opts)]
  }, [typeRecords])




  const statusLabel = (s: string) => s === 'all' ? 'All' : (s?.charAt(0).toUpperCase() + s?.slice(1))

  useEffect(() => {



    let cancelled = false

    setLoading(true)
    apiFetch('/api/types?action=list')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return



        const found = (j.data || []).filter((t: any) => typeSlugsSet.has(t.slug))

        setTypeRecords(found)
      })
      .catch(() => setTypeRecords([]))
    return () => { cancelled = true }
  }, [typeSlugsSet])




  const loadTree = useCallback(async () => {
    if (typeRecords.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const loadCache = async (title: string): Promise<Record<string, any[]>> => {
        const res = await apiFetch(
          `/api/admin-data?action=list&entity=items&type_slug=kb-article-list&title=${encodeURIComponent(title)}&limit=1&offset=0`
        )
        const json = await res.json()
        const records = Array.isArray(json) ? json : (json.data || [])
        const record = records[0]
        return record?.data?.trees || {}
      }











      const [globalTrees, accountTrees] = await Promise.all([
        loadCache('KB Article List - Global'),
        loadCache('KB Article List - Account'),
      ])
      const allTrees = { ...globalTrees, ...accountTrees }
      const flat = typeSlugs.flatMap((slug) => allTrees[slug] || [])
      setArticles(flat.map((r: any) => ({
        ...r,
        type_slug: r.type_slug || typeById[r.type_id]?.slug,
      })))
    } catch (e: any) {
      setError(e.message || 'Failed to load articles')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [typeRecords, typeSlugs, typeById])





  const handleSearch = useCallback(async (query: string) => {
    if (typeRecords.length === 0 || query.trim().length < 2) {
      setSearchResultIds(null)
      return
    }


    setSearching(true)
    setError(null)
    try {
      const res = await apiFetch('/api/kb?action=search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          type_slugs: typeSlugs,
          sources: ['kb'],
          limit: 100,
          similarity_threshold: 0.4,
        }),
      })
      const json = await res.json()
      console.log('[KBArticleList] search json:', json)
      const results = json.data?.results || json.results || []
      const ids = new Set<string>(results.map((r: any) => r.id).filter(Boolean))
      console.log('[KBArticleList] search results:', results.length, 'ids:', ids.size)
      setSearchResultIds(ids.size > 0 ? ids : new Set())
    } catch (e: any) {
      setError(e.message || 'Search failed')
      setSearchResultIds(null)
    } finally {
      setSearching(false)
    }
  }, [typeRecords, typeSlugs])


  useEffect(() => {
    loadTree()
  }, [loadTree])




  const hasActiveSearch = searchResultIds !== null


  const { visibleArticles, roots, byId } = useMemo(() => {
    let out = articles
    if (statusFilter !== 'all') out = out.filter((a) => a.status === statusFilter)
    if (typeFilter !== 'all') out = out.filter((a) => a.type_slug === typeFilter || a.data?.kb_type === typeFilter)

    const fullById = new Map<string, KBRecord>()
    for (const a of articles) fullById.set(a.id, a)

    if (searchResultIds) {
      const ancestorSet = new Set<string>(searchResultIds)
      for (const id of searchResultIds) {
        let current = fullById.get(id)
        while (current?.data?.parent_id) {
          const parentId = current.data.parent_id as string
          if (ancestorSet.has(parentId)) break
          ancestorSet.add(parentId)
          current = fullById.get(parentId)
        }




      }
      out = out.filter((a) => ancestorSet.has(a.id))
    }

    const nodes: TreeNode[] = out.map((a) => ({ ...a, children: [] }))
    const byId = new Map<string, TreeNode>()
    const idSet = new Set<string>()
    for (const n of nodes) {
      byId.set(n.id, n)
      idSet.add(n.id)
    }
    const roots: TreeNode[] = []
    for (const n of nodes) {
      const parentId = n.data?.parent_id as string | null | undefined
      if (parentId && idSet.has(parentId)) {
        const parent = byId.get(parentId)
        if (parent) parent.children.push(n)
      } else {
        roots.push(n)
      }
    }
    for (const node of byId.values()) {
      node.children = node.children.sort(sortByOrder)
    }
    return { visibleArticles: out, roots: roots.sort(sortByOrder), byId }
  }, [articles, statusFilter, typeFilter, searchResultIds])




  const isTreeMode = useMemo(
    () => statusFilter === 'all' && typeFilter === 'all',
    [statusFilter, typeFilter]
  )




  const handleDrop = async (itemId: string, targetParentId: string | undefined, insertIndex: number) => {
    const item = articles.find((a) => a.id === itemId)
    if (!item) return
    setDragging(null)

    const oldParentId = item.data?.parent_id as string | undefined
    const isSameGroup = sameId(oldParentId, targetParentId)
    let effectiveIndex = insertIndex

    if (isSameGroup) {
      const fullTargetGroup = [...articles]
        .filter((a) => sameParent(a, targetParentId))
        .sort(sortByOrder)
      const originalIndex = fullTargetGroup.findIndex((a) => a.id === itemId)
      if (originalIndex !== -1 && insertIndex > originalIndex) {
        effectiveIndex = insertIndex - 1
      }


    }

    const targetChildren = articles
      .filter((a) => sameParent(a, targetParentId) && a.id !== itemId)
      .sort(sortByOrder)
    const newGroup = [...targetChildren]
    newGroup.splice(effectiveIndex, 0, item)

    const updates: { id: string; type_slug?: string; data: any }[] = []

    newGroup.forEach((a, order) => {
      const nextData = { ...a.data, order }
      if (a.id === itemId) {
        nextData.parent_id = targetParentId ?? null
      }
      const parentChanged = a.id === itemId && !sameId(a.data?.parent_id as string | undefined, targetParentId)
      if (a.data?.order !== order || parentChanged) {
        updates.push({
          id: a.id,
          type_slug: a.type_slug || typeById[a.type_id]?.slug || undefined,
          data: nextData,
        })
      }
    })

    if (!isSameGroup) {
      const sourceChildren = articles
        .filter((a) => sameParent(a, oldParentId) && a.id !== itemId)
        .sort(sortByOrder)
      sourceChildren.forEach((a, order) => {
        if (a.data?.order !== order) {
          updates.push({
            id: a.id,
            type_slug: a.type_slug || typeById[a.type_id]?.slug || undefined,
            data: { ...a.data, order },
          })
        }
      })
    }

    if (updates.length === 0) return

    try {
      await Promise.all(
        updates.map((u) =>
          apiFetch(`/api/admin-data?entity=items&id=${u.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type_slug: u.type_slug, data: u.data }),
          })
        )
      )
      await loadTree()
    } catch (e: any) {
      setError(e.message || 'Failed to update order')
    }
  }




  const DropIndicator = () => (
    <div className="h-0.5 bg-primary rounded-full my-1" />
  )



  function getDropIndex(e: React.DragEvent, container: HTMLElement | null): number {
    if (!container) return 0
    const itemEls = Array.from(container.children).filter((c) => c.getAttribute('data-item') === 'true')
    if (itemEls.length === 0) return 0
    const containerRect = container.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top
    for (let i = 0; i < itemEls.length; i++) {
      const rect = itemEls[i].getBoundingClientRect()
      const centerY = rect.top + rect.height / 2 - containerRect.top
      if (mouseY < centerY) return i
    }

    return itemEls.length
  }




  function SortableDropZone({
    parentId,
    nodes,
    depth,
  }: {
    parentId: string | undefined
    nodes: TreeNode[]
    depth: number
  }): JSX.Element {
    const [over, setOver] = useState(false)
    const [insertIndex, setInsertIndex] = useState<number | null>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const computeIndex = useCallback(
      (e: React.DragEvent) => getDropIndex(e, listRef.current),
      []
    )

    return (
      <div
        ref={listRef}
        className={cn(
          'space-y-0.5',
          depth > 0 ? 'pl-4 border-l border-border/50' : '',
          over && 'rounded-md bg-primary/5',
          depth > 0 && nodes.length === 0 ? 'min-h-[1.5rem]' : ''
        )}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!e.relatedTarget || !listRef.current?.contains(e.relatedTarget as Node)) {
            setOver(true)
          }

        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!e.relatedTarget || !listRef.current?.contains(e.relatedTarget as Node)) {
            setOver(false)
            setInsertIndex(null)
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.dataTransfer.dropEffect = 'move'
          setInsertIndex(computeIndex(e))
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOver(false)



          const id = e.dataTransfer.getData('text/plain')




          const index = computeIndex(e)

          setInsertIndex(null)
          if (id) handleDrop(id, parentId, index)
        }}
      >
        {nodes.length === 0 && over && (
          <div className="text-xs text-muted-foreground py-2 px-3 border border-dashed border-border/60 rounded-md text-center">
            Drop here as child
          </div>
        )}
        {nodes.map((node, i) => (
          <Fragment key={node.id}>
            {insertIndex === i && <DropIndicator />}
            <div
              data-item="true"
              draggable={isTreeMode && !hasActiveSearch}
              onDragStart={(e) => {
                setDragging(node.id)
                e.dataTransfer.setData('text/plain', node.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()



                const id = e.dataTransfer.getData('text/plain')

                if (id) handleDrop(id, node.id, node.children.length)
              }}
              className={cn(
                'group flex items-center gap-2 rounded-md py-1.5 px-2 transition-colors select-none',
                dragging === node.id ? 'opacity-50' : 'hover:bg-accent/50',
                isTreeMode ? 'cursor-grab active:cursor-grabbing' : ''
              )}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              {isTreeMode && (
                <GripVertical size={14} className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
              )}
              <span className="flex-1 text-left text-sm truncate">
                {node.title}
              </span>
              <Badge variant="outline" className="text-[0.625rem] shrink-0">
                {node.type_slug || '—'}
              </Badge>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => onEdit(node)}
                >
                  <Edit size={14} />
                </Button>
              )}
            </div>
            <SortableDropZone parentId={node.id} nodes={node.children} depth={depth + 1} />
          </Fragment>
        ))}
        {insertIndex === nodes.length && <DropIndicator />}
      </div>
    )
  }









  const renderFlatRow = (record: KBRecord) => (
    <div
      key={record.id}
      className="flex items-center gap-3 py-2 px-2 hover:bg-accent/50 rounded-md"
    >
      <button onClick={() => onSelect?.(record)} className="flex-1 text-left text-sm truncate">
        {record.title}
      </button>
      <Badge variant={record.status === 'published' ? 'default' : 'secondary'} className="text-[0.625rem]">
        {record.status}
      </Badge>
      <Badge variant="outline" className="text-[0.625rem]">
        {record.type_slug || '—'}
      </Badge>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {formatDateTime(record.created_at)}
      </span>
      {onEdit && (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(record)}>
          <Edit size={14} />
        </Button>
      )}
    </div>
  )

  return (
    <div className="p-6 h-full overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {typeName || 'Knowledge Base'}
        </h1>
        {onNew && (
          <Button onClick={onNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchQuery) }}
              className="pl-8"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResultIds(null) }}
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => { handleSearch(searchQuery) }}
            disabled={searching || searchQuery.trim().length < 2}
          >
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>
        {statusOptions.map((s: string) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s) }}
          >
            {statusLabel(s)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Type:</span>
        <Button
          variant={typeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setTypeFilter('all') }}
        >
          All
        </Button>
        {typeRecords.map((t) => (
          <Button
            key={t.slug}
            variant={typeFilter === t.slug ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setTypeFilter(t.slug) }}
          >
            {t.name || t.slug}
          </Button>
        ))}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : visibleArticles.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No articles found.</p>
        </div>
      ) : isTreeMode ? (
        <div className="space-y-1">
          <SortableDropZone parentId={undefined} nodes={roots} depth={0} />
        </div>
      ) : (
        <div className="space-y-1 border-t border-border/50 pt-2">
          {visibleArticles.map(renderFlatRow)}
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a searchable, filterable, drag-and-drop knowledge base article list.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/kb/KBArticleList.tsx:KBArticleList:component"]

