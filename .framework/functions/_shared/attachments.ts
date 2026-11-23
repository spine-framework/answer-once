/**
 * @module   attachments
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * Attachment upload orchestration: policy resolution, declared-input
 * validation, and the tmp→final commit. The security contract:
 *
 * - Clients can only WRITE to the tmp quarantine bucket (signed upload URL).
 * - The ONLY way bytes reach a final bucket is through commitUpload —
 *   actual size is re-checked, real mime is sniffed from bytes, GPS EXIF is
 *   stripped per the type's file_policy, then the server writes the row's
 *   storage columns itself. The client never supplies storage_path.
 * - Read access is RLS on the row: read-url loads the row with the caller's
 *   db, so if you can't see the row you get 404 before any URL is minted.
 *
 * file_policy lives on the attachment-kind type's design_schema — apps own
 * their policies via type seeds. Images only: allowed_mime is always
 * clamped to IMAGE_MIMES regardless of what a policy declares.
 */

import { createHash, randomUUID } from 'node:crypto'
import { IMAGE_MIMES, sniffImageMime, stripGps } from './image-meta'
import {
  TMP_BUCKET, PRIVATE_BUCKET, PUBLIC_BUCKET, BUCKET_MAX_BYTES,
  downloadBytes, uploadBytes, removeBytes, publicReadUrl,
} from './storage'

export interface FilePolicy {
  allowed_mime: string[]
  max_bytes: number
  visibility: string[]
  default_visibility: 'private' | 'public'
  strip_gps: boolean
}

export const DEFAULT_IMAGE_POLICY: FilePolicy = {
  allowed_mime: [...IMAGE_MIMES],
  max_bytes: 10 * 1024 * 1024,
  visibility: ['private', 'public'],
  default_visibility: 'private',
  strip_gps: true,
}

const VALID_VISIBILITIES = ['private', 'public']

export function httpError(statusCode: number, message: string): Error {
  const e: any = new Error(message)
  e.statusCode = statusCode
  return e
}

/**
 * Merge a type's design_schema.file_policy over the image defaults.
 * Invariants that can't be relaxed by config: allowed_mime is always
 * clamped to supported images (v1 is images-only regardless of policy), and
 * max_bytes is capped by the bucket-level ceiling.
 */
export function resolveFilePolicy(designSchema: any): FilePolicy {
  const declared = designSchema?.file_policy
  if (!declared || typeof declared !== 'object' || Array.isArray(declared)) {
    return { ...DEFAULT_IMAGE_POLICY }
  }
  const policy: FilePolicy = { ...DEFAULT_IMAGE_POLICY }

  if (Array.isArray(declared.allowed_mime)) {
    const mimes = declared.allowed_mime
      .filter((m: any) => typeof m === 'string' && IMAGE_MIMES.has(m))
    if (mimes.length === 0) {
      throw httpError(400, 'file_policy.allowed_mime contains no supported image types (jpeg, png, webp, gif)')
    }
    policy.allowed_mime = mimes
  }
  if (declared.max_bytes !== undefined) {
    const max = Number(declared.max_bytes)
    if (!Number.isFinite(max) || max <= 0) {
      throw httpError(400, 'file_policy.max_bytes must be a positive number')
    }
    policy.max_bytes = Math.min(Math.floor(max), BUCKET_MAX_BYTES)
  }
  if (declared.visibility !== undefined) {
    const vis = (Array.isArray(declared.visibility) ? declared.visibility : [declared.visibility])
      .filter((v: any) => VALID_VISIBILITIES.includes(v))
    if (vis.length === 0) {
      throw httpError(400, 'file_policy.visibility must contain "private" and/or "public"')
    }
    policy.visibility = vis
  }
  if (declared.default_visibility !== undefined && VALID_VISIBILITIES.includes(declared.default_visibility)) {
    policy.default_visibility = declared.default_visibility
  }
  if (declared.strip_gps !== undefined) {
    policy.strip_gps = declared.strip_gps !== false
  }
  return policy
}

/** Validate the client's declared inputs at upload-url mint time. */
export function assertUploadAllowed(
  policy: FilePolicy,
  declared: { mime_type?: string; file_size?: number; visibility?: string },
): void {
  if (!declared.mime_type || !policy.allowed_mime.includes(declared.mime_type)) {
    throw httpError(400, `mime_type "${declared.mime_type}" is not allowed by this type's file_policy`)
  }
  if (declared.file_size !== undefined && declared.file_size !== null) {
    const size = Number(declared.file_size)
    if (!Number.isFinite(size) || size <= 0) throw httpError(400, 'file_size must be a positive number')
    if (size > policy.max_bytes) {
      throw httpError(413, `file_size exceeds this type's limit of ${policy.max_bytes} bytes`)
    }
  }
  const vis = declared.visibility || policy.default_visibility
  if (!policy.visibility.includes(vis)) {
    throw httpError(400, `visibility "${vis}" is not allowed by this type's file_policy`)
  }
}

/**
 * Path + metadata safety for client-supplied filenames. Strips directory
 * components and anything outside a conservative charset; length-capped.
 */
export function sanitizeFilename(name: any): string {
  const base = String(name || '')
    .split(/[\\/]/).pop()!
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
  return base || 'image'
}

/**
 * Commit a quarantined upload to its final bucket. Validates the ACTUAL
 * bytes (size, magic-byte mime), strips GPS per policy, writes to final
 * storage, and returns the verified row fields + operational metadata to
 * stamp. Throws — with the tmp object left for the sweeper — on any
 * verification or storage failure; callers must not write the row.
 */
export async function commitUpload(params: {
  tmpPath: string
  typeRecord: { design_schema: Record<string, any> }
  accountId: string | null
  filename: string
  visibility?: string
  uploadedBy: string | null
}): Promise<{
  fields: {
    filename: string
    file_size: number
    mime_type: string
    storage_path: string
    storage_provider: string
    uploaded_by: string | null
  }
  metadata: Record<string, any>
}> {
  const policy = resolveFilePolicy(params.typeRecord.design_schema)
  const visibility = params.visibility || policy.default_visibility
  if (!policy.visibility.includes(visibility)) {
    throw httpError(400, `visibility "${visibility}" is not allowed by this type's file_policy`)
  }

  const tmpPath = String(params.tmpPath || '')
  if (!/^[\w\-./]+$/.test(tmpPath) || tmpPath.includes('..')) {
    throw httpError(400, 'tmp_path is malformed')
  }

  const raw = await downloadBytes(TMP_BUCKET, tmpPath)
  if (!raw) throw httpError(410, 'tmp upload not found — upload the file to the signed URL first')
  if (raw.length === 0) throw httpError(400, 'uploaded object is empty')
  if (raw.length > policy.max_bytes) {
    throw httpError(413, `upload exceeds this type's limit of ${policy.max_bytes} bytes`)
  }

  const mime = sniffImageMime(raw)
  if (!mime || !IMAGE_MIMES.has(mime)) {
    throw httpError(400, 'uploaded bytes are not a supported image (jpeg, png, webp, gif)')
  }
  if (!policy.allowed_mime.includes(mime)) {
    throw httpError(400, `detected mime "${mime}" is not allowed by this type's file_policy`)
  }

  let finalBytes = raw
  if (policy.strip_gps) {
    try {
      finalBytes = stripGps(mime, raw)
    } catch (err: any) {
      // Fail closed — never store image bytes we could not strip.
      throw httpError(422, `could not process image metadata: ${err?.message || 'strip failed'}`)
    }
  }

  const sha256 = createHash('sha256').update(finalBytes).digest('hex')
  const filename = sanitizeFilename(params.filename)
  const bucket = visibility === 'public' ? PUBLIC_BUCKET : PRIVATE_BUCKET
  const storagePath = `${params.accountId || 'shared'}/${randomUUID()}/${filename}`

  try {
    await uploadBytes(bucket, storagePath, finalBytes, mime)
  } finally {
    // Quarantine cleanup is best-effort — the sweeper reaps what we miss.
    removeBytes(TMP_BUCKET, tmpPath).catch((e: any) =>
      console.warn(`attachment tmp cleanup failed for ${tmpPath}:`, e?.message || e))
  }

  const metadata: Record<string, any> = { bucket, visibility, sha256 }
  if (visibility === 'public') {
    metadata.public_url = publicReadUrl(bucket, storagePath)
  }

  return {
    fields: {
      filename,
      file_size: finalBytes.length,
      mime_type: mime,
      storage_path: storagePath,
      storage_provider: 'supabase',
      uploaded_by: params.uploadedBy,
    },
    metadata,
  }
}

/**
 * Delete the stored object behind an attachment row — best-effort cascade
 * for admin-data remove. Bucket comes from commit-stamped metadata;
 * missing metadata defaults to the private bucket.
 */
export async function removeAttachmentBytes(row: any): Promise<void> {
  if (!row?.storage_path) return
  const bucket = row.metadata?.bucket === PUBLIC_BUCKET ? PUBLIC_BUCKET : PRIVATE_BUCKET
  await removeBytes(bucket, row.storage_path)
}
