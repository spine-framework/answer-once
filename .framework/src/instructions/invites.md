---
title: Invites & Access
audience: both
kind: entity
verified_against: 9f90999
verified_on: 2026-11-16
source_files:
  - .framework/src/pages/admin/InvitesPage.tsx
  - .framework/src/components/shared/InviteManager.tsx
  - .framework/functions/invites.ts
---

## What this is for

**Invites & Access** (`/spine-framework/admin/access/invites`) manages how people join the account: generating invite links, tracking their status, re-sending or revoking them, and approving access requests. The admin page is scoped to the `system_admin` role; the shared `InviteManager` component underneath supports other role sets.

## Why it exists

You need to add someone to an account with a specific role before they sign up — and the row that eventually becomes their identity should already exist so nothing re-binds at acceptance time.

**Why it exists (5-whys):**

1. Invites need a pre-auth identity — the account, role, and email must be bound *before* the person authenticates, or acceptance becomes a placement problem.
2. Reusing `people` for pending invites means acceptance is a status transition, not a row migration — the person record, its `account_id`, and `role_id` are already correct; only `auth_uid` is missing.
3. `data.invite_token` (looked up via `data->>invite_token`) keeps the secret on the row it activates — no separate token table to keep in sync with people.
4. Placement runs through the service-role-only `complete_registration_placement` RPC (migration 052) because client-supplied email/role/account previously steered placement — an identity-spoofing vector. Server-resolved placement closes it.
5. **Root:** an invite is a person who hasn't authenticated yet — modeling it as a `people` row keeps the identity lifecycle single-table and makes "who can join, as what role" governed data rather than an auth-side channel. *(confirmed 2026-11-13)*

## Fields and settings

- **Generate invite form** — name, email, and role picker (shown only when more than one role is allowed; here it is fixed to `system_admin`). Produces an `invite_url` copied to the clipboard: `{APP_BASE_URL}/register?t=<invite_token>`.
- **Invites table** — the person's name/email, assigned role, status, and actions: reinvite (new link), revoke, approve (access requests), block.
- **Status semantics** — `invited`/`pending` (link issued or request awaiting approval), `approved`, `active`/`claimed` (registered), `revoked` (`inactive`), `expired`, `blocked`. `kind` distinguishes `invite` from `access_request`.
- **Search + sortable columns** over the list from `action=list-invites` (filtered to the allowed role slugs).

**Downstream effects**

- `create-invite` inserts a stub `people` row carrying `invite_token` (16 chars) and `invite_expires_at` (7 days); the register flow consumes the token via `complete-registration` → `complete_registration_placement` RPC.
- Only `system_admin` (or an `*_admin` role on the account) can create invites; creating an invite for `role_slug: system_admin` is refused unless the caller is already `system_admin`.
- `revoke-invite` marks the person `inactive`, killing the unclaimed link; `reinvite` mints a fresh token/link. `block-invite`/`deny` handle abusive requests.
- Registration and account-creation calls are rate-limited per person and per IP.

## Minimal configuration

Fill name + email → Generate → the invite URL lands on your clipboard; send it out of band. The invitee registers within 7 days or you reinvite.

## Full configuration

The backing API (`/.netlify/functions/invites?action=`) also covers the public registration path and member management:

- `check-first-user`, `check-domain`, `validate-token`, `complete-registration` — anonymous signup flow
- `create-invite`, `list-invites`, `revoke-invite`, `reinvite`, `block-invite`
- `approve`, `deny` — access-request review
- `list-members`, `update-member`, `deactivate-member` — existing members

## Example

An admin generates a `system_admin` invite for a new hire, pastes the link into chat. Until they register, the row shows `pending`; if the link is lost, Reinvite mints a new URL and invalidates the old token; if they never join, Revoke marks the stub `inactive`.

## Core files

- `.framework/src/pages/admin/InvitesPage.tsx` — this page (scopes InviteManager to `system_admin`)
- `.framework/src/components/shared/InviteManager.tsx` — invite list/form/actions (reusable in other apps)
- `.framework/functions/invites.ts` — API (all actions above)
- Table: `public.people` (invite stub rows carry `invite_token`/`invite_expires_at`)

## Agent notes

- The invite URL is shown/copied **once** at create/reinvite — the API never returns it again; a lost link means Reinvite, not retrieve.
- Invites expire after 7 days (`invite_expires_at`); expired rows show `expired` until reinvited or revoked.
- This admin page is hardcoded to `system_admin` invites; app-level member invites use the same `InviteManager` with a different `allowedRoles` set.
- Stub invite rows are real `people` rows — they are excluded from normal principal resolution until registration completes.
