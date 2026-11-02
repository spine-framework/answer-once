---
title: People
audience: both
kind: entity
verified_against: b3b3ae0
verified_on: 2026-11-01
source_files:
  - .framework/migrations/001_core_schema.sql
  - .framework/functions/auth.ts
  - .framework/functions/invites.ts
  - .framework/functions/security.ts
  - .framework/src/contexts/AuthContext.tsx
  - .framework/src/pages/auth/RegisterPage.tsx
---

# People

## What this is for

A **person** is a human user — the `public.people` row bound to a Supabase
auth user. Every signed-in session resolves to exactly one person; that row
carries the account placement, role, and status that gate everything the
user can see and do. Watchers, messages, notification recipients, and
pipeline "who did this" all reference `people.id`.

## Fields and settings

| Column | Notes |
|---|---|
| `auth_uid` | UNIQUE — the Supabase `auth.users.id`. `NULL` on invite stubs (person created before they register). |
| `email` | UNIQUE, required. Login + invite identity. |
| `full_name` | required display name. |
| `account_id` | required — the account the person is placed in. **Falsy `account_id` = "unplaced"**: the router forces `/register?resume=1` until placement completes. |
| `role_id` | FK → `roles`. The person's role slug drives app gating and record permissions. |
| `status` | default `'active'`. `'pending'` users are gated to the pending-approval page by the router. |
| `type_id` | required — people are typed records like everything else. |
| `data` | jsonb — non-system fields per the person type's `design_schema`. |
| `avatar_url`, `phone`, `is_active` | Profile/lifecycle flags. |

**Downstream effects**

- `useAuth().user` (`@core/contexts/AuthContext`) is derived from this row +
  role join: `roles: string[]`, `account_id`, `is_system_admin`, `status`.
- The registration lifecycle: register → (email confirm) → person row with
  `account_id` unset = unplaced → `/register?resume=1` finishes placement →
  `status: 'pending'` requires approval → `active`.
- `handle_new_auth_user` grants `system_admin` only when `people` is empty —
  the first registrant claims the instance (see
  [Security checklist](operations/security-checklist.md)).
- `people.role` comes back from Supabase as object *or* array depending on
  the join — normalize before reading `.slug`.

## Minimal configuration

People rows are created by registration/invites, not by hand — but a valid
person requires: `email`, `full_name`, `account_id`, `role_id`, `type_id`
(the person type), `status: 'active'`.

## Full configuration

Adds `avatar_url`, `phone`, `data` (type-defined fields), `app_id`
(which app created them), `is_active`.

## Example

An invite flow creates a person stub (`auth_uid: null`, `status: 'pending'`,
`account_id` + `role_id` set by the invite's `config`); when the invitee
registers with that email, `auth_uid` binds and they land already placed —
skipping the unplaced dance entirely.

## Core files

- `.framework/migrations/001_core_schema.sql` — table + constraints
- `.framework/functions/auth.ts` — session → person + role resolution
- `.framework/functions/invites.ts` — invite stubs and placement config
- `.framework/src/contexts/AuthContext.tsx` — client `useAuth` shape
- `.framework/src/pages/auth/RegisterPage.tsx` — placement/resume flow

## Agent notes

- Never `INSERT` a person as a substitute for registration — `auth_uid`
  binding and account placement happen through auth/invite paths.
- `status: 'pending'` + truthy `account_id` → pending-approval gate;
  falsy `account_id` → resume-registration routing. Different fixes.
- `person_id` is the FK used by `watchers`, `messages`, `notifications`,
  `item_progress` — it's `people.id`, never `auth_uid`.
