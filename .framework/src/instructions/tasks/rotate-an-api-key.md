---
title: Rotate an API key
audience: developers, agents
kind: task
skills:
  - spine-operate
verified_against: eb8a2fe
verified_on: 2026-11-26
source_files:
  - .framework/functions/api-keys.ts
  - .framework/src/instructions/reference/functions/api-keys.md
---

# Rotate an API key

## Goal

Replace a live `sk_…` key — scheduled rotation, suspected leak, departing
integration — with zero downtime for its callers.

There is no update action on `/api/api-keys`. Rotation is: **create a
replacement, switch callers over, verify, revoke the old key.**

## Prerequisites

- An identity allowed to manage keys for the target account — see the
  authority model below.
- The list of places the old key is used (env vars, CI secrets, scripts).

## Who may rotate — the real authority model

Key management is **account-scoped self-service**, not `system_admin`-only:

- Any account-bound principal (human via JWT, or a machine key holding an
  `account_id`) can `list`, `get`, `create`, `revoke`, and read
  `usage-logs` within **its own account**.
- A non-system caller cannot mint `is_internal` keys or `*:*` scope (403),
  and requested `scopes` are clipped to what the caller holds — a `cli`
  key can rotate itself but can never widen.
- Only `system_admin` or an unbound internal machine principal can mint
  wildcard/internal keys or act across accounts.
- Rotating someone *else's* key works only if it lives in your account;
  foreign-account keys are invisible to you.

## Steps

1. **Find the key.** `GET /api/api-keys` lists your account's keys
   (`id`, `key_prefix`, `name`, `scopes`, `is_active`, `expires_at`,
   `last_used_at`). Raw keys are never stored — identify by `key_prefix`
   and `name`.

   ```bash
   curl -H "x-api-key: $SPINE_API_KEY" "$BASE_URL/api/api-keys"
   ```

2. **Create the replacement** with the same (or narrower) scopes:

   ```bash
   curl -X POST -H "x-api-key: $SPINE_API_KEY" -H "Content-Type: application/json" \
     -d '{"name":"<same-purpose> v2","scopes":"<same scopes>","rate_limit":100}' \
     "$BASE_URL/api/api-keys"
   ```

   The raw `sk_…` is returned **once** — copy it now. Omitting `scopes`
   inherits the caller's scopes.

3. **Switch callers.** Update env vars/secrets (`SPINE_API_KEY`,
   `SPINE_CLI_API_KEY`, integration configs, Netlify env, CI secrets) and
   redeploy/restart anything that caches the key.

4. **Verify the switch.** `GET /api/api-keys?action=usage-logs&api_key_id=<new-id>`
   should show calls landing on the new key; the old key's usage should go
   quiet. For a leaked key, don't wait — go straight to step 5.

5. **Revoke the old key:**

   ```bash
   curl -X POST -H "x-api-key: $SPINE_API_KEY" -H "Content-Type: application/json" \
     -d '{"id":"<old-key-id>"}' "$BASE_URL/api/api-keys?action=revoke"
   ```

   Revocation sets `is_active = false` — soft, auditable, and it writes an
   `api_key.revoked` audit log entry. Keys are never hard-deleted through
   the API.

## Verify

- `GET /api/api-keys` shows old key `is_active: false`, new key active.
- Callers work on the new key; nothing still references the old prefix in
  configs.

## Common mistakes

- **Rotating the key you're calling with mid-flight** — create and swap
  callers *before* revoking, or your own revoke call authenticates with a
  dying credential (it still completes — the revoke lands first).
- **Expecting `system_admin` to be required** — it isn't; account members
  self-serve. If that surprises you, audit *who* in the account can reach
  key management, not the endpoint's gate.
- **Losing the raw key** — only the hash and 8-char `key_prefix` persist;
  there is no "show key again."
- **Revoking before checking usage-logs** — a silent caller (cron job,
  forgotten CI) dies at revocation with no warning.

## Reference

- [API keys entity page](../api-keys.md) — fields, scopes, rate limits.
- [api-keys function reference](../reference/functions/api-keys.md) —
  exact request/response shapes and 401/403 semantics.
