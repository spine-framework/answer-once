---
title: invites
audience: both
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/invites.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/rate-limit.ts
  - .framework/functions/_shared/security.ts
  - .framework/functions/admin-data.ts
  - .framework/functions/integration-outbound.ts
  - .framework/public/_redirects
---

# invites

## What it does

The registration and membership endpoint. Public actions probe the system
(first user, domain match, invite-token validation); authenticated
actions complete registration, create/revoke/re-send invites, approve or
deny join requests, and manage account members. Invitees are `people`
rows in `invited`/`pending` status carrying `invite_*` fields in `data`.

## Route and methods

`/.netlify/functions/invites`, reachable as `/api/invites` (`/api/*` →
`/.netlify/functions/:splat`). The outer handler is a
`createPublicHandler` dispatching **only** on `?action=` — there is no
HTTP-method check, so `GET` and `POST` both reach every action (write
actions still need a JSON body):

| `?action=` | Auth | Purpose |
|---|---|---|
| `check-first-user` | public | `{ is_first_user }` — true when `people` is empty |
| `check-domain` | public | domain→account match for registration routing |
| `validate-token` | public | inspect an invite token (`?token=`) |
| `complete-registration` | authenticated | place the caller via `complete_registration_placement` RPC |
| `create-invite` | account admin | create an invited `people` stub + invite URL |
| `list-invites` | authenticated | list pending invites, account-scoped |
| `revoke-invite` | account admin | deactivate an invited person |
| `reinvite` | account admin | rotate token + expiry on invited/inactive person |
| `block-invite` | account admin | stamp `invite_blocked_at` on a person |
| `approve` | account admin | activate a `pending` join request |
| `deny` | account admin | deactivate a `pending` join request |
| `list-members` | `*_admin` | list account members (via `admin-data`) |
| `update-member` | `*_admin` | change `full_name` / `role_slug` |
| `deactivate-member` | `*_admin` | set status `inactive` |

Unknown action → `Unknown action: <action>`.

## Authentication

Mixed. The dispatcher is public (`createPublicHandler`), so anonymous
reaches the three probe actions. Every other action requires an
authenticated principal — each inner handler re-checks
`principal.id !== 'anonymous'` and throws `Authentication required` (a
plain `Error`, so it surfaces as HTTP 500, not 401).

"Account admin" (`requireAccountAdmin`) means: principal permissions
include `system`, **or** roles include `system_admin`, **or** any
`*_admin` role **and** `principal.accountId` equals the target account.
Member actions (`list-members`, `update-member`, `deactivate-member`)
accept `system` permission or any `*_admin` role (`canManageMembers`)
plus the same account check.

## Request contract

**`check-domain`** (query): `email` — must contain `@`. Personal-mailbox
domains (gmail, yahoo, hotmail, outlook, icloud, protonmail, etc.) always
return `{ match: false }`; otherwise matches when an active `people` row
exists with `@<domain>`.

**`validate-token`** (query): `token`. Looks up a `people` row in
`invited`/`pending` status with `data.invite_token = <token>`.

**`complete-registration`** (body): `app` and `path` required;
`account_name`, `email` optional. `path` values are resolved by the RPC
(e.g. `new_account` triggers extra `account_create` rate limits).

**`create-invite`** (body): `email`, `account_id`, `role_slug` required;
`full_name`, `base_url`, `app` optional. `role_slug: 'system_admin'` is
refused, as is any role whose `is_system` flag is true or that is absent
from the app's `invitation.allowed_roles`/`registration.roles` allowlist
(when the app declares one).

**`revoke-invite` / `reinvite` / `block-invite` / `approve` / `deny`**
(body): `person_id` (+ `base_url` for `reinvite`).

**`list-invites`** (query): `account_id` (system users may pass any;
others are scoped to their own), `role_slugs` (comma-separated).

**`list-members`** (query/body): `account_id` (defaults to the caller's).
**`update-member`** (body): `person_id`, `full_name`, `role_slug`.
**`deactivate-member`** (body): `person_id`.

## Response contract

Standard `{ data, error, meta }` envelope.

- `check-first-user` → `{ is_first_user: boolean }`.
- `check-domain` → `{ match, account_id? }`.
- `validate-token` → `{ email, full_name, account_name, role_name,
  kind }`.
- `complete-registration` → `{ status, account_slug, role_slug?, next? }`
  from the RPC placement.
- `create-invite` → `{ id, token, invite_url, expires_at, email_sent }`.
- `reinvite` → `{ token, invite_url, expires_at }`.
- `list-invites` → array of `{ id, email, full_name, status, kind,
  expires_at, blocked_at, created_at, account, role }`.
- `revoke-invite`/`block-invite`/`approve`/`deny` → `{ success: true }`.
- `list-members` → `{ data: [...] }`; `update-member`/`deactivate-member`
  → `{ success: true, data }`.

## Side effects

- `create-invite`/`reinvite` write `people` rows (via `admin-data` create
  for the stub): `data.invite_token` (16-char alnum),
  `invite_kind: 'invite'`, `invite_expires_at` (now + 7 days),
  `invite_attempts: 0`, `invite_blocked_at`, `invite_invited_by`.
- `invite_url` = `<base>/register?t=<token>`; `base_url` is honored only
  for localhost or origins in `APP_BASE_URL`/`ALLOWED_ORIGINS`, otherwise
  falls back to `APP_BASE_URL`.
- `create-invite` sends email through `integration-outbound` when an
  active `invite-email` (preferred) or `transactional-email` integration
  exists; `config.templates.invite` subject/html support
  `{{to_name}}`, `{{invite_url}}`, `{{account_name}}`, `{{expires_at}}`
  placeholders, with a built-in HTML fallback.
- `complete-registration` calls the service-role
  `complete_registration_placement` RPC (the only writer of
  `account_id`/`role_id` placement), then `recordRegistrationGeo` +
  `registration.completed` log.
- `checkRegistrationBlocklist` (email, email domain, IP) runs before
  placement; `checkRateLimit` enforces `registration` and
  `account_create` (person + IP keyed), `invite_create`, and
  `invite_email` (account keyed).
- `emitLog` writes `invite.created`, `invite.revoked`,
  `invite.reinvited`, `invite.approved`, `invite.blocked`,
  `invite.denied`, `member.updated`, `member.deactivated`.
- Member actions delegate to `admin-data` list/update internally, so
  admin-data logging and trigger firing apply there too.

## Errors

| Condition | HTTP | Message |
|---|---|---|
| Anonymous on a gated action | 500 | `Authentication required` |
| Not an account admin | 500 | `Insufficient permissions — *_admin role required for this account` (and member variants) |
| Missing required fields | 500 | `email, account_id, and role_slug are required` / `app and path are required` / `person_id is required` / `Token is required` / `Valid email is required` |
| Unknown action | 500 | `Unknown action: <action>` |
| `system_admin` or system role requested | 500 | `Role '<slug>' is not permitted in this context` / `Role '<slug>' not found` |
| Duplicate email+account | 500 | `A person with this email already exists or has a pending invite for this account` |
| Bad/used token | 500 | `Invite not found or already used` |
| Blocked invite | 500 | `This invite link has been blocked. Please contact the administrator.` |
| Expired invite | 500 | `This invite link has expired. Please request a new one.` |
| ≥5 failed attempts | 500 | `Too many failed attempts. This invite has been blocked.` |
| Registration blocklist hit | 403 | `This registration is not eligible. Contact support if you believe this is an error.` |
| Rate limit | 429 | `RateLimitError` envelope fields (`action`, `limit`, `retry_after`) |
| RPC placement failure | 400 | RPC message or `Registration placement failed` |
| Wrong state | 500 | `Invite not found or already processed` / `Person is not in a reinvitable state` / `Access request not found or already processed` |

## Agent notes

- First-user bootstrap is **not** here — the Postgres
  `handle_new_auth_user` trigger grants `system_admin` on the very first
  signup. `check-first-user` only reports whether `people` is empty.
- Invite tokens live on `people.data.invite_token`; revoke clears the
  token and deactivates; reinvite rotates it (`invited` or `inactive`
  rows only); `validate-token` enforces expiry, `invite_blocked_at`, and
  the 5-attempt ceiling.
- `approve`/`deny` target `status = 'pending'` rows — the join-request
  path — while `revoke-invite` targets `invited`/`pending`.
- `update-member` can only assign roles allowed by the target account's
  owned apps (`invitation.allowed_roles`/`registration.roles` in
  `apps.config`), and never `system_admin` or `is_system` roles.
- `list-invites` does **not** verify membership in the queried account —
  it scopes by `account_id` for non-system callers but accepts any
  `account_id` they pass. Don't treat it as an authorization boundary.
- Registration never trusts client claims: the placement RPC derives
  account and role server-side from the app's registration config.
