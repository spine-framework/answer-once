
import { randomUUID } from 'node:crypto'

const SPINE_URL = process.env.SPINE_URL || process.env.URL || ''

const API_KEY = process.env.SPINE_API_KEY || process.env.SPINE_FRAMEWORK_API_KEY || ''

function baseUrl(): string {
  if (!SPINE_URL) throw new Error('SPINE_URL environment variable is required')
  return SPINE_URL.replace(/\/$/, '')
}

function headers(): Record<string, string> {
  if (!API_KEY) throw new Error('SPINE_API_KEY environment variable is required')
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
    'X-Request-ID': randomUUID(),
    'X-Source': 'spine-framework-mcp',
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `request failed: ${res.status}`)
  }
  if (body && 'data' in body) {
    return body.data as T
  }
  return body as T
}

async function fetchAdminData(
  entity: string,
  action: 'list' | 'get' | 'create' | 'update' | 'remove' | 'stats',
  query: Record<string, any> = {},
  body?: Record<string, any>
): Promise<any> {
  const methodMap: Record<string, string> = {
    list: 'GET',
    get: 'GET',
    stats: 'GET',
    create: 'POST',
    update: 'PATCH',
    remove: 'DELETE',
  }
  const method = methodMap[action]
  const params: Record<string, any> = { ...query, action, entity, method }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const init: RequestInit = { method, headers: headers() }
  if (body && (action === 'create' || action === 'update')) {
    init.body = JSON.stringify(body)
  }
  const res = await fetch(`${baseUrl()}/.netlify/functions/admin-data?${qs}`, init)
  const data = await handleResponse<any>(res)
  if (Array.isArray(data)) return data
  return data
}

export async function fetchFunction(functionName: string, action: string, query: Record<string, any> = {}, body?: Record<string, any>): Promise<any> {
  const method = body ? 'POST' : 'GET'
  const params: Record<string, any> = { ...query, action, method }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const init: RequestInit = { method, headers: headers() }
  if (body) init.body = JSON.stringify(body)
  const res = await fetch(`${baseUrl()}/.netlify/functions/${functionName}?${qs}`, init)
  return handleResponse<any>(res)
}

type Filter = { key: string; op: string; value: any }

type Sort = { field: string; ascending: boolean }

class Query {
  private table: string
  private columns = '*'
  private count = false
  private head = false
  private _single = false
  private _maybeSingle = false
  private filters: Filter[] = []
  private sorts: Sort[] = []
  private limitN?: number
  private rangeFrom?: number
  private rangeTo?: number
  private insertData?: any
  private updateData?: any
  private deleteFlag = false
  private selectAfterInsert = false

  constructor(table: string) {
    this.table = table
  }

  select(columns?: string, opts?: { count?: 'exact'; head?: boolean }) {
    if (columns) this.columns = columns
    if (opts) {
      this.count = opts.count === 'exact'
      this.head = !!opts.head
    }
    return this
  }

  eq(key: string, value: any) {
    this.filters.push({ key, op: 'eq', value })
    return this
  }

  filter(key: string, op: string, value: any) {
    this.filters.push({ key, op, value })
    return this
  }

  in(key: string, values: any[]) {
    this.filters.push({ key, op: 'in', value: values })
    return this
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.sorts.push({ field, ascending: opts?.ascending !== false })
    return this
  }

  limit(n: number) {
    this.limitN = n
    return this
  }

  range(from: number, to: number) {
    this.rangeFrom = from
    this.rangeTo = to
    return this
  }

  ilike(key: string, value: any) {
    this.filters.push({ key, op: 'ilike', value })
    return this
  }

  lte(key: string, value: any) {
    this.filters.push({ key, op: 'lte', value })
    return this
  }

  gte(key: string, value: any) {
    this.filters.push({ key, op: 'gte', value })
    return this
  }

  neq(key: string, value: any) {
    this.filters.push({ key, op: 'neq', value })
    return this
  }

  maybeSingle() {
    this._maybeSingle = true
    return this
  }

  single() {
    this._single = true
    return this
  }

  insert(data: any) {
    this.insertData = data
    return this
  }

  update(data: any) {
    this.updateData = data
    return this
  }

  upsert(data: any) {
    // admin-data does not support upsert; treat as create
    this.insertData = data
    return this
  }

  delete() {
    this.deleteFlag = true
    return this
  }

  contains(key: string, value: any) {
    this.filters.push({ key, op: 'contains', value })
    return this
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private async execute(): Promise<any> {
    if (this.table === 'apps') return this.executeApps()
    if (this.table === 'embeddings') return this.executeEmbeddings()
    return this.executeAdminData()
  }

  private async executeApps(): Promise<any> {
    if (this.insertData || this.updateData || this.deleteFlag) {
      throw new Error('apps write not supported through MCP proxy')
    }
    const idFilter = this.filters.find(f => f.key === 'id')
    const slugFilter = this.filters.find(f => f.key === 'slug')
    if (this._single || this._maybeSingle || idFilter || slugFilter) {
      const q: Record<string, any> = {}
      if (idFilter) q.id = idFilter.value
      else if (slugFilter) q.slug = slugFilter.value
      try {
        const record = await fetchFunction('apps', 'get', q)
        if (this._single && !record) throw new Error('App not found')
        return { data: record || null, error: null }
      } catch (err: any) {
        if (this._maybeSingle && (err?.message?.includes('not found') || err?.message?.includes('Not found') || err?.message?.includes('not_found'))) {
          return { data: null, error: null }
        }
        return { data: null, error: err }
      }
    }
    const records = await fetchFunction('apps', 'list', { include_system: 'true', include_inactive: 'true' })
    const filtered = this.applyClientFilters(records || [])
    const sorted = this.applyClientSort(filtered)
    return { data: sorted, error: null }
  }

  private async executeEmbeddings(): Promise<any> {
    if (this.insertData || this.updateData || this.deleteFlag) {
      throw new Error('embeddings write not supported through MCP proxy')
    }
    const q: Record<string, any> = {}
    const modelFilter = this.filters.find(f => f.key === 'model_id')
    const docFilter = this.filters.find(f => f.key === 'document_id')
    if (modelFilter) q.model_id = modelFilter.value
    if (docFilter) q.document_id = docFilter.value
    if (this.limitN) q.limit = this.limitN
    if (this.rangeFrom !== undefined) q.offset = this.rangeFrom
    const records = await fetchFunction('embeddings', 'list', q)
    return { data: records || [], error: null }
  }

  private async executeAdminData(): Promise<any> {
    const entity = this.table
    const idFilter = this.filters.find(f => f.key === 'id')
    const hasIdFilter = !!idFilter

    if (this.count && this.head) {
      try {
        const result = await fetchAdminData(entity, 'stats', {})
        return { data: [], count: result?.count ?? 0, error: null }
      } catch (err: any) {
        return { data: [], count: 0, error: err }
      }
    }

    if (this.insertData) {
      const record = await fetchAdminData(entity, 'create', {}, this.insertData)
      if (this.selectAfterInsert && this.columns === 'id') {
        return { data: record ? { id: record.id } : record, error: null }
      }
      return { data: record, error: null }
    }

    if (this.updateData) {
      if (!hasIdFilter) throw new Error('update requires id filter')
      const record = await fetchAdminData(entity, 'update', { id: idFilter.value }, this.updateData)
      return { data: record, error: null }
    }

    if (this.deleteFlag) {
      if (hasIdFilter) {
        const record = await fetchAdminData(entity, 'remove', { id: idFilter.value })
        return { data: record, error: null }
      }

      // list with any eq filters we can push, then client-filter the rest
      const params: Record<string, any> = {}
      for (const f of this.filters) {
        if (f.op === 'eq') params[f.key] = f.value
      }
      const records = await fetchAdminData(entity, 'list', { ...params, limit: 5000 })
      const toDelete = this.applyClientFilters(records || [], this.filters)
      for (const record of toDelete) {
        await fetchAdminData(entity, 'remove', { id: record.id })
      }
      return { data: null, error: null }
    }

    if ((this._single || this._maybeSingle) && hasIdFilter) {
      try {
        const record = await fetchAdminData(entity, 'get', { id: idFilter.value })
        if (this._single && !record) throw new Error('Record not found')
        return { data: record || null, error: null }
      } catch (err: any) {
        if (this._maybeSingle) return { data: null, error: null }
        return { data: null, error: err }
      }
    }

    const inIdFilter = this.filters.find(f => f.key === 'id' && f.op === 'in')
    if (inIdFilter) {
      const records: any[] = []
      for (const id of inIdFilter.value) {
        try {
          const record = await fetchAdminData(entity, 'get', { id })
          if (record) records.push(record)
        } catch {
          // ignore missing
        }
      }
      const otherFilters = this.filters.filter(f => !(f.key === 'id' && f.op === 'in'))
      const filtered = this.applyClientFilters(records, otherFilters)
      return { data: filtered, error: null }
    }

    const params: Record<string, any> = {}
    for (const f of this.filters) {
      if (f.op === 'eq') {
        params[f.key] = f.value
      } else if (f.op === 'ilike') {
        params.search = f.value.replace(/%/g, '')
      } else {
        // other ops are not supported by admin-data list; will client-filter later
      }
    }
    if (this.rangeFrom !== undefined && this.rangeTo !== undefined) {
      params.offset = this.rangeFrom
      params.limit = Math.max(0, this.rangeTo - this.rangeFrom)
    }
    if (this.limitN !== undefined) {
      params.limit = this.limitN
    }
    if (this.sorts.length > 0) {
      params.sort_field = this.sorts[0].field
      params.sort_direction = this.sorts[0].ascending ? 'asc' : 'desc'
    }

    const records = await fetchAdminData(entity, 'list', params)
    const filtered = this.applyClientFilters(records || [])

    if (this._single) {
      if (filtered.length === 0) throw new Error('Record not found')
      if (filtered.length > 1) throw new Error('Multiple records found')
      return { data: filtered[0], error: null }
    }

    if (this._maybeSingle) {
      return { data: filtered[0] || null, error: null }
    }

    return { data: filtered, error: null }
  }

  private applyClientFilters(records: any[], filters = this.filters): any[] {
    return records.filter(record => {
      for (const f of filters) {
        const value = this.getValue(record, f.key)
        if (f.op === 'eq' && value !== f.value) return false
        if (f.op === 'in' && !f.value.includes(value)) return false
        if (f.op === 'ilike' && typeof value === 'string' && !value.toLowerCase().includes(String(f.value).toLowerCase().replace(/%/g, ''))) return false
        if (f.op === 'lte' && value > f.value) return false
        if (f.op === 'gte' && value < f.value) return false
        if (f.op === 'neq' && value === f.value) return false
        if (f.op === 'contains') {
          if (Array.isArray(value) && !value.includes(f.value)) return false
          if (typeof value === 'string' && !value.includes(f.value)) return false
        }
      }
      return true
    })
  }

  private applyClientSort(records: any[]): any[] {
    if (this.sorts.length === 0) return records
    const s = this.sorts[0]
    return [...records].sort((a, b) => {
      const av = this.getValue(a, s.field)
      const bv = this.getValue(b, s.field)
      if (av < bv) return s.ascending ? -1 : 1
      if (av > bv) return s.ascending ? 1 : -1
      return 0
    })
  }

  private getValue(record: any, key: string): any {
    if (key === 'id') return record.id
    if (key in record) return record[key]
    if (key.startsWith('data->>')) {
      const field = key.slice(7)
      return record.data?.[field]
    }
    if (key.startsWith('data->')) {
      const path = key.slice(6)
      return record.data?.[path]
    }
    return undefined
  }
}

export const adminDb = {
  from(table: string) {
    return new Query(table)
  },
  async rpc(name: string, params: Record<string, any> = {}): Promise<any> {
    if (name === 'match_embeddings') {
      const result = await fetchFunction('embeddings', 'search-similar', {}, {
        query_embedding: params.query_embedding,
        model_id: params.model_id || 'text-embedding-3-small',
        limit: params.match_count || params.limit || 10,
        threshold: params.similarity_threshold || 0.15,
        filter_account_ids: params.filter_account_ids ?? null,
        filter_vector_type: params.filter_vector_type ?? null,
        filter_item_types: params.filter_item_types ?? null,
        filter_document_ids: params.filter_document_ids ?? null,
      })
      const rows = Array.isArray(result) ? result : (result?.results || [])
      return { data: rows, error: null }
    }
    throw new Error(`RPC not supported through MCP proxy: ${name}`)
  },
}

export async function resolveTypeRecord(kind: string, slug: string): Promise<any> {
  const rows = await fetchAdminData('types', 'list', { kind, slug, limit: 1 })
  const row = rows?.[0]
  if (!row) throw new Error(`Type not found: ${kind}/${slug}`)
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    design_schema: row.design_schema || {},
    validation_schema: row.validation_schema || {},
    is_active: row.is_active ?? true,
  }
}

export async function resolveTypeId(kind: string, slug: string): Promise<string> {
  const record = await resolveTypeRecord(kind, slug)
  return record.id
}

export async function resolveLinkTypeId(slug: string): Promise<string> {
  const rows = await fetchAdminData('link_types', 'list', { slug, limit: 1 })
  const row = rows?.[0]
  if (!row) throw new Error(`Link type not found: ${slug}`)
  return row.id
}

export async function resolveLinkTypeIds(slugs: string[]): Promise<Record<string, string>> {
  const ids = await Promise.all(slugs.map(resolveLinkTypeId))
  const result: Record<string, string> = {}
  for (let i = 0; i < slugs.length; i++) {
    result[slugs[i]] = ids[i]
  }
  return result
}

