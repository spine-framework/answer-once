---
title: State-machine-driven records
audience: developers, agents
kind: concept
verified_against: 5f7c326
verified_on: 2026-11-24
source_files:
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/admin-data.ts
  - .framework/src/hooks/useEntityRecord.ts
---

# State-machine-driven records

Most real types have a lifecycle — `draft → review → live`, `open → claimed
→ done` — not just fields. The discipline that keeps a lifecycle honest on
Spine: **the transition table is pure code, the record layer enforces who
may move state, and the database decides races.**

## The pattern

1. **Model the lifecycle as a pure module** in `custom/shared/` — a
   transition table (`{from → [to…]}`, guards, side-effects metadata) with
   no imports from db, env, or browser APIs. The frontend renders
   affordances from it via `@domain/*`; functions enforce it via
   `./_shared/domain/*`. One source of truth, both trees.

2. **Shape `record_permissions` so state can't be client-written.** A bare
   `update` grant never covers `status`/`is_active` — the record layer
   denies them unless `fields.<col>.permissions.<role>: ["write"]` or
   `system_fields.<col>.<role>: ["write"]` grants it explicitly (decision
   `0032`). Two sanctioned shapes:
   - **Operator transitions** — grant the operator role `write` on
     `status`; the client PATCHes through the guard and the transition
     table lives in a trigger/pipeline validating `from → to`.
   - **Machine transitions** — grant nothing; only system principals,
     internal machines, and functions move state (claim via
     `admin-data?action=atomic` `{from, to}` for the operator-visible
     claim without a blanket write grant).

3. **Claims are atomic, not read-then-write.** `atomic` with
   `{from: "open", to: "claimed"}` loses cleanly (`409`) under parallel
   claims; the `{path, op, value}` + `delta` grammar covers counters and
   allocation in the same statement. Never read state, decide, then
   `update` — that is a race by construction
   ([concurrency-and-idempotency](concurrency-and-idempotency.md)).

## What not to do

- **Don't rely on the UI to hide transitions.** Rendering only valid
  actions is affordance, not enforcement — a member with `update` could
  PATCH `status` directly until the record-layer guard was added.
- **Don't write bespoke RPCs for transition shapes `atomic` covers.** An
  RPC bypasses `validation_schema`, field permissions, triggers, and
  audit — it is the documented escape hatch for grammar the CAS surface
  can't express, with mandatory `REVOKE EXECUTE FROM PUBLIC, anon,
  authenticated` hygiene (see `spine-migration` skill, decision `0033`).
- **Don't scatter the transition table** — a second copy in a function
  that drifts from the UI's copy is how invalid transitions get written
  through a legitimate path.

## Why it exists

1. Apps kept re-inventing the same lifecycle discipline — and each
   re-invention leaked a hole (client-writable `status`, racy claims,
   drifted transition copies).
2. The primitives exist — protected system columns, field grants,
   `atomic`, `custom/shared` — but without a named pattern, each app
   assembled them differently (or not at all).
3. **Root:** a state machine is only real when *all three* hold — pure
   transition definition, record-layer write guard, atomic claim — and a
   named doctrine is how the third-party check survives project churn.
