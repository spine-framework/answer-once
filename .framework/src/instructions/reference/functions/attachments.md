---
title: attachments
audience: both
kind: reference
verified_against: 90d68d2
verified_on: 2026-11-22
source_files:
  - .framework/functions/attachments.ts
  - .framework/functions/_shared/attachments.ts
  - .framework/functions/_shared/storage.ts
  - .framework/functions/_shared/image-meta.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/system-cron.ts
  - .framework/migrations/083_attachment_link_type.sql
---

# attachments

## What it does

Capability-minting endpoint for the attachment byte path — **it never
writes rows**. Record CRUD stays in `admin-data`; this function only mints
upload and read URLs against Supabase Storage.

```
POST /api/attachments?action=upload-url
GET  /api/attachments?action=read-url&id=<uuid>
```

## The upload contract — tmp → commit

Clients can never write to a final storage path. Upload is three steps:

1. **`upload-url`** — `{ type_slug, filename, mime_type, file_size?,
   visibility? }`. Requires an authenticated principal with `create` on the
   resolved attachment type (`resolveTypeRecord('attachment', type_slug)` +
   `resolveFirstSurfacePermissions`, machine `*:*` bypass like admin-data).
   Declared `mime_type`/`file_size`/`visibility` are checked against the
   type's `file_policy`. Returns a signed URL that writes **only** to the
   `attachments-tmp` quarantine bucket:
   `{ tmp_path, upload_url, token, method: 'PUT', headers: {x-upsert},
   expires_in: 600, visibility, max_bytes }`.
2. **Client `PUT`s the file body to `upload_url`** — bytes go straight to
   storage, never through a function.
3. **`admin-data` create** — `{ entity: 'attachments', type_slug,
   tmp_path, filename, visibility?, data?, ... }`. The create hook
   (`_shared/attachments.commitUpload`) downloads the tmp object, verifies
   actual size and magic-byte mime, strips GPS EXIF per policy, writes to
   the final bucket `{account_id}/{uuid}/{filename}`, stamps the verified
   columns (`storage_path`, `file_size`, `mime_type`, `storage_provider`,
   `uploaded_by`) plus `metadata.{bucket, visibility, sha256, public_url?}`,
   then writes the row. `storage_path` is never client input; without
   `tmp_path` only system principals may create metadata-only rows.

Reads: `read-url` loads the row through the caller's RLS-scoped db —
unseen row means 404, no URL minted. Public attachments return the
commit-stamped `metadata.public_url` (stable, embeddable in SSR HTML);
private ones get a 1h signed URL.

## Buckets

Lazy-created on first use (`_shared/storage.ensureAttachmentBuckets`) so
installs without the storage service don't break migrations:

| Bucket | Public | Purpose |
|---|---|---|
| `attachments-tmp` | no | Quarantine — the only place a client may write; swept daily |
| `attachments` | no | Final storage for private attachments; read via signed URLs |
| `attachments-public` | yes | Final storage for public attachments; stable public URLs |

All three carry `file_size_limit` 50MB and an image-only `allowed_mime_types`
backstop. `system-cron` sweeps tmp objects older than 24h at 00:00 UTC.

## `file_policy` (on the attachment type's `design_schema`)

```json
"file_policy": {
  "allowed_mime": ["image/jpeg", "image/png", "image/webp", "image/gif"],
  "max_bytes": 10485760,
  "visibility": ["private", "public"],
  "default_visibility": "private",
  "strip_gps": true
}
```

Apps own policies via their attachment-kind type seeds (`kind:
'attachment'`). Absent policy → `DEFAULT_IMAGE_POLICY` (all four image
types, 10MB, both visibilities, strip on). Invariants config can't relax:
`allowed_mime` is clamped to supported images — v1 is images-only — and
`max_bytes` is capped at the 50MB bucket ceiling. Validated by
`validate-schema` for shape; enforced by `_shared/attachments` at mint and
commit.

`strip_gps` (default on) removes EXIF GPS surgically — JPEG keeps its other
EXIF including orientation (piexif); PNG loses `eXIf`; WebP loses `EXIF`/`XMP`
chunks; GIF carries none. Strip failure fails the upload closed — unstripped
bytes never reach a final bucket.

## Association — records own files via links

`attachments` has no target columns by design (the 5-whys: graphs can't be
pre-declared in table structure). Attach a file to a record with a `links`
row — seeded global link type `has_attachment` (migration 083): source =
the owning record, target = the attachment. Apps may seed their own link
types for specific semantics (`jh-photo`-style). Field values on
`file`/`image` fields store the attachment id directly — a field reference
is implicit association and needs no link row.

## Client API (`.framework/src/lib/attachments.ts`)

- `uploadAttachment(file, { type_slug, visibility?, account_id? })` → the
  three-step dance, returns the attachment row.
- `resolveAttachmentUrl(id)` → renderable URL or null (unseen row/no bytes).

`FieldRenderer` `file`/`image` fields use these; `field.attachment_type`
selects the type (default `attachment`, whose seed grants system_admin
only — member uploads need an app-seeded attachment type with member
`create`), `field.visibility` picks private (default) or public.

## Errors

| Case | Status |
|---|---|
| Missing `type_slug`/`filename`/`mime_type` | 400 |
| Declared mime not in `file_policy.allowed_mime` | 400 |
| Declared size over `max_bytes` | 413 |
| `visibility` outside policy | 400 |
| No `create` on the resolved type | 403 |
| `tmp_path` missing on create (non-system caller) | 400 |
| tmp object absent/empty at commit | 410/400 |
| Sniffed mime not a supported image / not in policy | 400 |
| GPS strip failure | 422 |
| read-url on unseen row | 404 |

## Update/remove

`admin-data` update drops server-stamped storage columns for non-system
callers (`storage_path`, `file_size`, `mime_type`, `uploaded_by`, the
`metadata.{bucket,visibility,sha256,public_url}` keys) — repointing a row at
another upload's bytes would leak them through read-url. Hard-delete
cascades to the stored object (best-effort; failure leaves a reaped-later
orphan).

## Agent notes

- Do **not** hand clients a `storage_path` and expect commit to use it —
  the path is server-generated; the client supplies only `tmp_path`.
- `public` means public: a public-bucket URL is stable and readable by
  anyone who has it until the object is deleted. Unguessable paths are
  obscurity, not auth.
- HEIC, video, PDF, SVG are rejected at sniff — `allowed_mime` can't widen
  past the image set in v1 (SVG is active content, not an image).
- Tmp uploads are single-shot: a consumed tmp_path is deleted at commit;
  retry the whole upload on commit failure.
- Known gap: the byte path has fixture coverage and anonymous-gate smokes
  (401 on unauthed calls), but no live authenticated end-to-end upload has
  been exercised yet (member → upload-url → PUT → commit → GPS-strip →
  read-url). Run that once against spine-dev before relying on
  member-facing uploads.
