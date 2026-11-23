---
title: Onboard client staff
audience: developers, agents
kind: task
verified_against: 9d16176
verified_on: 2026-11-17
source_files:
  - .framework/functions/invites.ts
  - .framework/src/instructions/invites.md
  - .framework/src/instructions/roles.md
  - .framework/src/instructions/accounts.md
  - .framework/src/instructions/people.md
---

# Onboard client staff

## Goal

Give a client's people accounts and roles in a deployed Spine project —
the repeatable shape for agencies handing a project to client staff.

## Prerequisites

- The client account exists (or you decided accounts-as-tenants vs
  one-project-per-client — see `accounts.md`; that tenancy call is
  upstream of everything here).
- You hold `system_admin` or an `*_admin` role on the account you're
  staffing — `create-invite` refuses lesser callers.
- `APP_BASE_URL` is set — invite links are built from it.

## Steps

1. **Confirm the roles exist.** Check the account's `roles` (Admin →
   Access → Roles, or `roles` entity page): the seed gives
   `system_admin`/`member`/`member_admin`-style slugs; custom apps may add
   their own. Pick the least-privilege role that covers each person's
   job — `record_permissions` on the project's types is what the role
   actually unlocks.

2. **Create the account row if needed.** Accounts-as-tenants: the client's
   `accounts` row must exist before people can be bound to it
   (`accounts.md` — `parent_id`/`account_paths` define the hierarchy).
   One-project-per-client: the account is already the project.

3. **Invite each person.** Admin → Access → Invites → Generate:

   - name + email + role → produces an `invite_url`
     (`{APP_BASE_URL}/register?t=<token>`); the page shows the role picker
     only when more than one role is assignable.
   - Behind the scenes it creates a stub `people` row carrying the token
     and a 7-day expiry — identity, account, and role are bound *before*
     the person authenticates.
   - Send the link out of band (chat/email). Inviting for `system_admin`
     is refused unless you're already `system_admin`.

   API equivalent: `POST /api/invites` `create-invite` — see
   [invites](../invites.md) for the action surface.

4. **Track acceptance.** The Invites table shows `pending` →
   `active`/`claimed` as people register. Links expire in 7 days —
   `reinvite` mints a fresh URL and kills the old token; `revoke` marks
   the stub `inactive`.

5. **Verify placement.** After registration, the person should appear in
   the account's People list with the right role. Spot-check with
   `npx spine-framework auth whoami` using their credentials, or confirm
   the `people` row's `account_id`/`role_id` — placement is server-side
   via `complete_registration_placement`, so a correct invite means a
   correct person.

6. **Hand over admin.** If the client runs their own admin afterwards,
   make sure at least one *client* person holds an admin role before you
   leave — and revoke/deactivate your own invite or person row if the
   engagement ends (revoke is soft and auditable, never a hard delete).

## Verify

- Each person can sign in and lands on the views their role allows —
  check one create/read per role.
- No `pending` invites older than you intend; no `system_admin` grants
  that weren't deliberate.

## Common mistakes

- **Sharing one login** — invites exist precisely so each person is a
  distinct `people` row with their own role; shared logins break the
  audit trail (`logs` attributes actions per principal).
- **Inviting with the wrong account bound** — placement is server-side
  and binds the invite's account; a person invited under account A can't
  later "move" by re-registering. Re-issue under the right account.
- **Assuming expiry means cleanup** — expired invites leave `inactive`
  stubs; they're harmless but noisy — revoke what you won't reinvite.
- **Forgetting `APP_BASE_URL`** — invite links built with a dev URL send
  client staff to the wrong origin.

## Reference

- [Invites](../invites.md) — statuses, actions, placement RPC.
- [Roles](../roles.md) · [People](../people.md) · [Accounts](../accounts.md)
  — the entities being wired together.
- [Scope and accounts](../concepts/scope-and-accounts.md) — tenancy model.
