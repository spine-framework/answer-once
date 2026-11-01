---
title: security
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/security.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/audit.ts
  - .framework/public/_redirects
---

# security

## What it does

Security-admin console API: aggregates abuse signals into a
"flagged accounts" report, bans/unbans people across three enforcement
layers (the `security_blocklist` table, Supabase auth ban, and the Netlify
edge firewall), and manages blocklist entries directly.

## Route and methods

`/.netlify/functions/security`, reachable as `/api/security` (`/api/*` →
`/.netlify/functions/:splat`). No method check — the action comes from
`?action=` or `body.action`:

| `action` | Purpose |
|---|---|
| `flagged_accounts` | 30-day rollup of security signals per person/account |
| `ban_user` | Blocklist + Supabase ban + edge IP deny |
| `unban_user` | Revoke blocklist rows + lift Supabase ban + remove edge rule |
| `blocklist` | List `security_blocklist` rows (latest 500) |
| `blocklist_add` | Upsert a blocklist entry |
| `blocklist_revoke` | Stamp `revoked_at` on entries |

Unknown action → `Unknown security action: <action>` (HTTP 400).

## Authentication

Standard `createHandler` plus `requireSystemContextWithAudit` — only
`system_admin` principals (human `system_admin` role, `*:*` machine key,
or internal secret) get in; anonymous → 401. All DB access uses `adminDb`.

## Request contract

**`flagged_accounts`** — no parameters. Scans `logs` for `span_name` in
`security.rate_limit_exceeded`, `security.injection_detected`,
`security.registration_blocked` over the last 30 days (limit 500), buckets
by `person_id` (falling back to account), and joins `people`, `accounts`,
and active blocklist rows.

**`ban_user`** (body): at least one of `person_id`, `email`, `ip`
required. Optional: `reason`, `block_ip` (default `true`), `block_email`
(default `true`).

**`unban_user`** (body): `person_id` required.

**`blocklist`** — no parameters.

**`blocklist_add`** (body): `type` ∈ `ip | email | email_domain |
person_id | account_id` and `value` required; optional `severity`
(default `'hard'`), `reason`, `expires_at`. Email and email-domain values
are lowercased.

**`blocklist_revoke`** (body): `id` *or* (`type`, `value`).

## Response contract

Standard `{ data, error, meta }` envelope.

- `flagged_accounts` → `{ rows: [...] }`, each row
  `{ person_id, email, account_id, account_name, last_ip, last_country,
  person_status, signals, kinds, patterns, last_seen_at, banned }`
  sorted by signal count descending. `banned` is true when any matching
  person/email/IP/account blocklist entry is active.
- `ban_user` → `{ ok: true, person_id, email, ip, layers }` where `layers`
  reports `blocklist` / `auth` / `edge` as `applied`, `skipped`, or
  `error: <msg>` per layer.
- `unban_user` → `{ ok: true, person_id, layers }`.
- `blocklist` → `{ rows: [...] }`.
- `blocklist_add` → `{ ok: true }`; `blocklist_revoke` → `{ ok: true,
  revoked: <n> }`.

## Side effects

- `security_blocklist` upserts keyed on `(type, value)` with
  `banned_by`, `severity`, `reason`, `expires_at`; revoke stamps
  `revoked_at` (rows are never deleted).
- `ban_user`/`unban_user` call `auth.admin.updateUserById` with
  `ban_duration: '876600h'` (~100 years) / `'none'` when the person has an
  `auth_uid`.
- **Netlify edge sync**: when `NETLIFY_ACCESS_TOKEN` + `NETLIFY_SITE_ID`
  are set, IP entries are added to/removed from a managed
  `spine-security:blocklist` deny rule on the site's firewall ruleset.
  Without those env vars the edge layer reports `skipped`. Failures are
  reported in `layers.edge`, not thrown.
- `emitAudit` writes `security.user_banned`, `security.user_unbanned`,
  `security.blocklist_add`, `security.blocklist_revoked` audit rows.
- The blocklist is enforced elsewhere: `isBlockedRequest`/`isBlockedIp`
  in the request middleware and `checkRegistrationBlocklist` during
  registration read `security_blocklist` — this endpoint only writes it.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Unknown action | 400 | `Unknown security action: <action>` |
| Missing ban target | 500 | `person_id, email, or ip is required` |
| Person not found | 500 | `Person not found: <id>` |
| Missing blocklist fields | 500 | `type and value are required` / `id or (type, value) is required` |
| Invalid `type` | 500 | `invalid type: <type>` |
| Blocklist write failures | 500 | `security_blocklist upsert failed: …` etc. |

The system-admin denial is returned as the handler result, so it lands
inside `data` (a `{ statusCode, headers, body }` object) with HTTP 200 —
not as a real 403. See "Agent notes".

## Agent notes

- Banning by bare `email` works even when no `people` row exists — the
  email/domain still lands on the blocklist and blocks future
  registrations via `checkRegistrationBlocklist`.
- `ban_user` also blocklists the person's whole `account_id` — banning a
  person can lock out their entire account. Check `layers` in the
  response to confirm what was applied.
- `unban_user` revokes only the rows matching `person_id`, the person's
  current email, and their current IP — the `account_id` row written by
  `ban_user` is **not** revoked, and neither are manually added
  `email_domain` entries. Revoke those separately via `blocklist_revoke`.
- Per-layer results mean "success" is conditional: `layers.edge:
  'skipped'` just means Netlify env vars are absent, while
  `layers.auth: 'skipped'` means the person has no `auth_uid` (e.g. an
  unregistered invite stub).
- Denial quirk: a non-system-admin caller gets HTTP 200 with the denial
  response object nested under `data`, because
  `requireSystemContextWithAudit(ctx)` returns a response-shaped value
  that the outer envelope wraps. Check `data.statusCode === 403` rather
  than the HTTP status.
