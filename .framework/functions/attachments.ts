/**
 * @module   attachments
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * Capability-minting endpoint for the attachment byte path. It never writes
 * rows — record CRUD stays in admin-data (see _shared/attachments.ts for the
 * security contract and the commit-on-create hook).
 *
 *   POST /api/attachments?action=upload-url
 *     { type_slug, filename, mime_type, file_size?, visibility? }
 *     → { tmp_path, upload_url, token, expires_in, visibility, max_bytes }
 *     Requires create permission on the resolved attachment type and
 *     declared inputs within the type's file_policy. The signed URL writes
 *     ONLY to the tmp quarantine bucket — PUT the file body to upload_url
 *     with header x-upsert: false.
 *
 *   GET /api/attachments?action=read-url&id=<uuid>
 *     → { url } — permanent public_url for public attachments, else a
 *     short-lived signed URL for the private bucket. The row is loaded
 *     through the caller's RLS-scoped db: unseen row = 404, no URL minted.
 *
 * Upload then completes via POST /api/admin-data action=create with
 * entity=attachments + tmp_path — the commit hook validates bytes, strips
 * GPS, moves to final storage, and stamps the verified columns.
 */

import { createHandler } from './_shared/middleware'
import { isSystemPrincipal } from './_shared/principal'
import { assertRecordAccess } from './_shared/account-scope'
import { resolveTypeRecord } from './_shared/resolve-ids'
import { resolveFirstSurfacePermissions } from './_shared/permissions'
import {
  resolveFilePolicy, assertUploadAllowed, httpError,
} from './_shared/attachments'
import {
  TMP_BUCKET, mintUploadUrl, signedReadUrl, SIGNED_READ_TTL_SECONDS, SIGNED_UPLOAD_TTL_SECONDS,
} from './_shared/storage'
import { randomUUID } from 'node:crypto'

export const uploadUrl = createHandler(async (ctx, body) => {
  const { type_slug, filename, mime_type, file_size, visibility } = body || {}

  if (!type_slug || typeof type_slug !== 'string') {
    throw httpError(400, 'type_slug is required — every attachment is typed')
  }
  if (!filename || typeof filename !== 'string') {
    throw httpError(400, 'filename is required')
  }
  if (!mime_type || typeof mime_type !== 'string') {
    throw httpError(400, 'mime_type is required')
  }
  if (!ctx.accountId && !isSystemPrincipal(ctx)) {
    throw httpError(403, 'an account is required to upload attachments')
  }

  const typeRecord = await resolveTypeRecord('attachment', type_slug)
  const designSchema = typeRecord.design_schema || {}

  const perms = await resolveFirstSurfacePermissions(
    ctx.principal?.id,
    ctx.accountId,
    type_slug,
    'create',
    designSchema,
  )
  const isMachineGlobal = ctx.principal?.type === 'machine' &&
    (ctx.principal.scopes || []).includes('*:*')
  if (!perms.canCreate && !isMachineGlobal) {
    throw httpError(403, 'Insufficient permissions to create this attachment type')
  }

  const policy = resolveFilePolicy(designSchema)
  assertUploadAllowed(policy, { mime_type, file_size, visibility })

  const tmpPath = `${ctx.accountId || 'shared'}/${randomUUID()}`
  const minted = await mintUploadUrl(tmpPath)

  return {
    tmp_path: minted.path,
    upload_url: minted.uploadUrl,
    token: minted.token,
    method: 'PUT',
    headers: { 'x-upsert': 'false' },
    expires_in: SIGNED_UPLOAD_TTL_SECONDS,
    bucket: TMP_BUCKET,
    visibility: visibility || policy.default_visibility,
    max_bytes: policy.max_bytes,
  }
})

export const readUrl = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}
  if (!id) throw httpError(400, 'id is required')

  const { data: row, error: err } = await ctx.db
    .from('attachments')
    .select('id, account_id, storage_path, storage_provider, mime_type, filename, metadata')
    .eq('id', id)
    .maybeSingle()

  if (err) throw err
  if (!row?.storage_path) throw httpError(404, 'Attachment not found')
  // Machines get adminDb (no RLS) — account scope must be enforced in code.
  // For humans ctx.db already filtered by RLS; this is a belt-and-suspenders
  // re-check on the same rule admin-data uses.
  await assertRecordAccess(ctx, 'attachments', row)

  const meta = row.metadata || {}
  if (meta.public_url) {
    return { url: meta.public_url, expires_in: null }
  }

  const url = await signedReadUrl(meta.bucket || 'attachments', row.storage_path)
  return { url, expires_in: SIGNED_READ_TTL_SECONDS }
})

export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'upload-url':
      if (method === 'POST') return await uploadUrl(ctx, body)
      break
    case 'read-url':
      if (method === 'GET') return await readUrl(ctx, body)
      break
  }
  throw httpError(400, 'Invalid action or method — use action=upload-url (POST) or action=read-url (GET)')
})
