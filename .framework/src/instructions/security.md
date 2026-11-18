---
title: Security
audience: both
kind: entity
verified_against: 9f90999
verified_on: 2026-11-16
source_files:
  - .framework/src/pages/admin/SecurityPage.tsx
  - .framework/functions/security.ts
  - .framework/functions/_shared/security.ts
  - .framework/migrations/049_security_blocklist.sql
---

## What this is for

The **Security** page (`/spine-framework/admin/security`) is the system-admin console for abusive actors: a report of flagged users/accounts/IPs built from security signal logs, plus the platform blocklist. Its actions apply a three-layer ban — internal `security_blocklist` rows, a Supabase Auth ban, and a Netlify edge IP-deny rule.

## Why it exists

### rate-limits

Serverless functions share no memory — a limit check must be database state all invocations can see, and concurrent invocations must not double-spend a window.

**Why it exists (5-whys):**

1. In-memory limits don't work serverlessly — instances share nothing; the counter must be durable state.
2. `(key, window_start)` composite PK + `rate_limit_hit` RPC (`INSERT ON CONFLICT ... count + 1`) makes the spend one atomic statement — same lesson as the lease tables: atomic claims, not read-then-write.
3. The table holds counters only because policies belong to governance — `resolveRateLimitPolicies` reads `account.data.rate_limits` and app `config.rate_limits`; the ledger stays policy-agnostic.
4. RLS is enabled with *no policies* — tenants never read others' counters; all access flows through the SECURITY DEFINER RPC or service role.
5. **Root:** rate limiting is a shared-resource problem — `rate_limits` makes spend atomic, tenant-isolated, and policy-agnostic so any endpoint can opt into throttling without owning the mechanism. *(confirmed 2026-11-13)*

### security-blocklist

Abuse defense must be runtime-editable data at the system's entry points — a middleware constant can't be updated without a deploy and can't carry the decision's lifecycle.

**Why it exists (5-whys):**

1. Blocks must be data — added at runtime when abuse is discovered, applied across functions, not just registration.
2. `type` + `value` with a CHECK constraint makes the denylist polymorphic — IP vs email vs domain vs person vs account are different lookups; typed values make the check dispatchable.
3. `severity` (`soft`/`hard`) + `expires_at`/`revoked_at` carry the decision lifecycle — temporary vs permanent, revocable vs committed. (Current checks filter `severity = 'hard'` + active rules; soft is reserved flagging.)
4. Checks live at chokepoints because that's where abuse enters — `checkRegistrationBlocklist` screens email/domain/IP before placement work (`invites.ts`, part of the 049 hardening); `checkIpBlocklist` runs per authenticated request with a decision cache.
5. **Root:** abuse defense must be runtime-editable data at entry points — `security_blocklist` gives operators a typed, severitied, expirable denylist without a deploy. *(confirmed 2026-11-13)*

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
