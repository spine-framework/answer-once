---
title: Security
audience: both
kind: entity
verified_against: e13127d
verified_on: 2026-10-30
source_files:
  - .framework/src/pages/admin/SecurityPage.tsx
  - .framework/functions/security.ts
  - .framework/functions/_shared/security.ts
  - .framework/migrations/049_security_blocklist.sql
---

## What this is for

The **Security** page (`/spine-framework/admin/security`) is the system-admin console for abusive actors: a report of flagged users/accounts/IPs built from security signal logs, plus the platform blocklist. Its actions apply a three-layer ban — internal `security_blocklist` rows, a Supabase Auth ban, and a Netlify edge IP-deny rule.

## Fields and settings

- **Flagged actors table** — Actor (email or "(no person)"), Account, IP / Country, Signals (count + kind badges e.g. `rate_limit`, `prompt_injection`, `blocked_registration`), Last seen, Status (`active`/person status or `banned`).
- **Row checkboxes + Add to Blacklist** — issues one `ban_user` call per selected row and prints per-layer results (`blocklist`, `auth`, `edge`) inline.
- **Unban** — per-row on banned actors with a `person_id`; revokes their blocklist rows and lifts the auth ban and edge rule.
- **Active blocklist table** — Type (`ip`/`email`/`person`/`account`), Value, Severity, Reason, Created, with per-row Revoke (`blocklist_revoke` sets `revoked_at`).
- All calls go to `/api/security?action=…` (POST): `flagged_accounts`, `blocklist`, `ban_user`, `unban_user`, `blocklist_add`, `blocklist_revoke`.

**Downstream effects**

- `ban_user` accepts `person_id`, `email`, or `ip` — anonymous-signal rows (no person) still ban by account/IP. Layer 1 (internal blocklist) is authoritative; the Supabase Auth and Netlify edge layers report `applied`/`skipped`/`error` per call — the edge layer degrades gracefully when Netlify API credentials aren't configured.
- Blocked principals are rejected at request time by `isBlockedRequest`/`isBlockedIp` in `_shared/security.ts` (checked in middleware and at registration).
- Every action emits `security.*` audit events into `logs` — the same table the flagged report is aggregated from.
- Every action requires a `system_admin` principal.

## Minimal configuration

Nothing to configure — the report fills itself from security signals (rate-limit violations, prompt-injection detections, blocked registrations). To act: select flagged rows → Add to Blacklist.

## Full configuration

Direct API calls for finer control:

```
POST /api/security?action=blocklist_add   { type: "ip", value: "203.0.113.7", severity: "high", reason: "credential stuffing", expires_at: null }
POST /api/security?action=blocklist_revoke { id: "<row uuid>" }
POST /api/security?action=ban_user         { email: "abuser@example.com", ip: "203.0.113.7", reason: "..." }
POST /api/security?action=unban_user       { person_id: "<uuid>" }
```

`expires_at` may be set for temporary bans; entries with `revoked_at` are hidden from the Active blocklist.

## Example

A burst of `rate_limit` signals from one IP appears in Flagged actors. Select the row, Add to Blacklist — the result line shows `banned (auth:applied edge:applied)`; subsequent requests from that IP 403 at the edge and at `isBlockedIp`. If it was a false positive, Unban restores the person and revokes the rows.

## Core files

- `.framework/src/pages/admin/SecurityPage.tsx` — this page
- `.framework/functions/security.ts` — flagged report, three-layer ban/unban, blocklist CRUD, Netlify edge sync
- `.framework/functions/_shared/security.ts` — `isBlockedRequest`/`isBlockedIp` enforcement, `emitSecurityEvent`, injection patterns
- `.framework/migrations/049_security_blocklist.sql` — `security_blocklist` schema
- Tables: `public.security_blocklist`, `public.logs` (signal source)

## Agent notes

- The Netlify edge layer needs Netlify API credentials in env — without them `edge: skipped` is normal, not a failure; the internal blocklist still enforces.
- Banning by `email`/`ip` does not stop a determined actor from rotating — treat the edge deny as a speed bump and watch for re-registration signals.
- Unban requires a `person_id` — rows banned only by IP/email must be lifted via `blocklist_revoke` on the blocklist entries.
- This page is marked experimental and is system-admin only; all writes are audited.
