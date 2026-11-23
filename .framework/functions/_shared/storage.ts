/**
 * @module   storage
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * Supabase Storage plumbing for the attachments byte path. Three buckets,
 * lazily created on first use: a private quarantine (tmp) bucket that is the
 * ONLY place clients may write, a private final bucket for governed files,
 * and a public bucket for files meant to be served without auth.
 *
 * The provider seam is `storage_provider` on the row — every function here
 * takes bucket + path so alternate providers can sit behind the same
 * interface later. Buckets are created lazily rather than by migration so
 * installs without the storage service enabled don't break migrations.
 */

import { adminDb } from './db'

export const TMP_BUCKET = 'attachments-tmp'
export const PRIVATE_BUCKET = 'attachments'
export const PUBLIC_BUCKET = 'attachments-public'

/** Hard ceiling regardless of per-type policy — bucket-level backstop. */
export const BUCKET_MAX_BYTES = 50 * 1024 * 1024
export const SIGNED_READ_TTL_SECONDS = 3600
export const SIGNED_UPLOAD_TTL_SECONDS = 600

const BUCKET_MIME_WHITELIST = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

let ensured: Promise<void> | null = null

/** Idempotent per-process bucket provisioning. A failed attempt is not
 *  cached — storage coming up later should not be poisoned by an early
 *  failure. */
export function ensureAttachmentBuckets(): Promise<void> {
  if (!ensured) {
    ensured = ensureBucketsUncached().catch((e) => { ensured = null; throw e })
  }
  return ensured
}

async function ensureBucketsUncached(): Promise<void> {
  const defs: { id: string; public: boolean }[] = [
    { id: TMP_BUCKET, public: false },
    { id: PRIVATE_BUCKET, public: false },
    { id: PUBLIC_BUCKET, public: true },
  ]
  for (const def of defs) {
    const { error } = await adminDb.storage.createBucket(def.id, {
      public: def.public,
      fileSizeLimit: BUCKET_MAX_BYTES,
      allowedMimeTypes: BUCKET_MIME_WHITELIST,
    })
    if (error && !/already exists|Duplicate/i.test(error.message)) {
      throw new Error(`storage bucket provisioning failed for ${def.id}: ${error.message}`)
    }
  }
}

function storageError(scope: string, error: any): Error {
  const e: any = new Error(`${scope}: ${error?.message || 'storage operation failed'}`)
  e.statusCode = 502
  return e
}

/**
 * Mint a signed upload URL into the tmp quarantine bucket. This is the only
 * write capability a client ever gets — final paths are never signed.
 */
export async function mintUploadUrl(tmpPath: string): Promise<{ uploadUrl: string; token: string; path: string }> {
  await ensureAttachmentBuckets()
  const { data, error } = await adminDb.storage.from(TMP_BUCKET).createSignedUploadUrl(tmpPath)
  if (error || !data) throw storageError('mint upload url', error)
  return { uploadUrl: data.signedUrl, token: data.token, path: data.path }
}

/** Download a storage object. Returns null when the object does not exist. */
export async function downloadBytes(bucket: string, path: string): Promise<Uint8Array | null> {
  const { data, error } = await adminDb.storage.from(bucket).download(path)
  if (error) {
    if (/not found|does not exist|404/i.test(error.message || '')) return null
    throw storageError('download', error)
  }
  return new Uint8Array(await data.arrayBuffer())
}

/** Write bytes to a final bucket — service role only; clients never get this. */
export async function uploadBytes(bucket: string, path: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const { error } = await adminDb.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw storageError('upload', error)
}

/** Delete a storage object. Missing objects are treated as success. */
export async function removeBytes(bucket: string, path: string): Promise<void> {
  const { error } = await adminDb.storage.from(bucket).remove([path])
  if (error && !/not found|does not exist|404/i.test(error.message || '')) {
    throw storageError('remove', error)
  }
}

/** Mint a short-lived read URL for a private object. */
export async function signedReadUrl(bucket: string, path: string, ttlSeconds: number = SIGNED_READ_TTL_SECONDS): Promise<string> {
  const { data, error } = await adminDb.storage.from(bucket).createSignedUrl(path, ttlSeconds)
  if (error || !data) throw storageError('sign read url', error)
  return data.signedUrl
}

/** Permanent public URL for an object in a public bucket. */
export function publicReadUrl(bucket: string, path: string): string {
  const { data } = adminDb.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

const TMP_OBJECT_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Reap quarantined uploads older than 24h — files the client uploaded to
 * tmp but never committed through admin-data. Tmp paths are
 * `{account_id}/{uuid}`, so list is a two-level walk: account dirs (no id)
 * then their objects.
 */
export async function sweepTmpUploads(): Promise<number> {
  try {
    const { data: top } = await adminDb.storage.from(TMP_BUCKET).list('', { limit: 1000 })
    const cutoff = Date.now() - TMP_OBJECT_TTL_MS
    let swept = 0
    for (const dir of top || []) {
      // Entries with an id are objects at root (no account prefix — still
      // fair game); entries without are account dirs to descend into.
      const { data: objects } = dir.id
        ? { data: [dir] }
        : await adminDb.storage.from(TMP_BUCKET).list(dir.name, { limit: 1000 })
      for (const obj of objects || []) {
        if (!obj.id) continue
        const created = obj.created_at ? Date.parse(obj.created_at) : NaN
        if (Number.isFinite(created) && created < cutoff) {
          const path = dir.id ? obj.name : `${dir.name}/${obj.name}`
          const { error } = await adminDb.storage.from(TMP_BUCKET).remove([path])
          if (!error) swept++
        }
      }
    }
    return swept
  } catch (e: any) {
    // Missing bucket (feature unused, storage service off) is not an error.
    if (/not found|does not exist|404/i.test(e?.message || '')) return 0
    throw e
  }
}
