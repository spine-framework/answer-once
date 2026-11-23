/**
 * Client helpers for the attachment upload path. The three-step contract
 * mirrors the server: mint a tmp-bucket signed URL → PUT bytes → commit
 * through admin-data, which validates the real bytes, strips GPS, moves to
 * final storage, and writes the row.
 *
 * Field values store the attachment row id — `resolveAttachmentUrl` mints
 * the read URL at render time so storage stays swappable.
 */

import { apiFetch } from './api'

export interface AttachmentUploadResult {
  id: string
  filename: string
  mime_type: string
  file_size: number
  storage_path: string
  metadata: Record<string, any>
}

async function readEnvelope(res: Response): Promise<any> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body?.error) {
    const message = body?.error?.message || body?.error || `request failed (${res.status})`
    throw new Error(typeof message === 'string' ? message : 'upload failed')
  }
  return body?.data
}

/**
 * Upload an image and create the attachment row.
 * `type_slug` is required — it selects the attachment-kind type whose
 * file_policy (allowed mimes, max bytes, visibility, strip_gps) governs the
 * upload and whose record_permissions gate it.
 */
export async function uploadAttachment(
  file: File,
  opts: { type_slug: string; visibility?: 'private' | 'public'; account_id?: string },
): Promise<AttachmentUploadResult> {
  const mintRes = await apiFetch('/api/attachments?action=upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type_slug: opts.type_slug,
      filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      visibility: opts.visibility,
    }),
  })
  const minted = await readEnvelope(mintRes)

  const putRes = await fetch(minted.upload_url, {
    method: 'PUT',
    headers: { 'x-upsert': 'false', 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '')
    throw new Error(`file upload failed (${putRes.status})${text ? `: ${text.slice(0, 200)}` : ''}`)
  }

  const createRes = await apiFetch('/api/admin-data?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity: 'attachments',
      type_slug: opts.type_slug,
      tmp_path: minted.tmp_path,
      filename: file.name,
      visibility: minted.visibility,
      ...(opts.account_id ? { account_id: opts.account_id } : {}),
    }),
  })
  return await readEnvelope(createRes)
}

/**
 * Resolve an attachment id to a renderable URL — permanent public_url for
 * public attachments, else a short-lived signed URL. Returns null when the
 * row isn't visible to the caller (RLS) or has no stored bytes.
 */
export async function resolveAttachmentUrl(id: string): Promise<string | null> {
  if (!id) return null
  const res = await apiFetch(`/api/attachments?action=read-url&id=${encodeURIComponent(id)}`)
  if (!res.ok) return null
  const body = await res.json().catch(() => null)
  return body?.data?.url || null
}
