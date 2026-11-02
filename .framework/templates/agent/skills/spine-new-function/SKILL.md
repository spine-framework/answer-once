---
name: spine-new-function
description: "Decide when a custom Netlify function is allowed (admin-data can't cover the case) and write it correctly."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You decide whether a piece of server logic may become a custom function, and
write it when it may. **Default answer: no** — runtime record CRUD belongs to
`/api/admin-data`, full stop.

## When a custom function IS allowed

A `custom/functions/` (or app `functions/`) handler is legitimate only when
`/api/admin-data` cannot express the work:

- **Non-record operations** — compute, aggregation, export, file transform.
- **External orchestration** — call an integration, fan out to several
  services, run a multi-step protocol in one request.
- **Inbound webhooks** — verify a signature and normalize a payload before
  handing it to a pipeline (see `spine-add-integration`).
- **Scheduled/system work** — timer-driven batch jobs that need server
  context.
- **Auth-adjacent flows** — invite acceptance, api-key exchange, registration
  handshakes (see `.framework/src/instructions/api-keys.md` and
  `integrations.md`).

It is **never** allowed for: listing/creating/updating/deleting `items`,
`threads`, `messages`, `links`, `attachments`, `watchers`, or other runtime
records — those calls bypass permission checks, type resolution, audit, and
triggers inside admin-data. See
`.framework/src/instructions/reference/api/admin-data.md`.

## Writing the function

1. Read `.framework/src/instructions/reference/api/admin-data.md` and
   `.framework/src/instructions/reference/functions/index.md` for the
   endpoint inventory your function may use.
2. Place it in `custom/functions/` (project-scoped) or the app's
   `functions/` dir; assemble picks it up at build time.
3. Inside the function, import shared helpers via `./_shared/*` (the
   assembled flat layout) — never via relative paths into `.framework/`.
4. Authenticate with the platform auth helpers (principal resolution,
   role checks). Use `adminDb` only when bypassing RLS is truly intended.
5. Keep secrets in env — `VITE_*` vars are public; service keys are not.
6. Register a `custom_*` scheduled/function section in `netlify.toml` if it
   needs a schedule — those sections are app-owned and survive upgrade.

## Verify

- `npm run typecheck:functions` — functions are typechecked against the
  assembled layout.
- Exercise it once via the assembled function endpoint, not by shortcutting
  through app code.

## Rules

- If a proposed function reads/writes runtime records, redirect the design to
  `/api/admin-data` and say why.
- One function per edge case — no catch-all "custom-api.ts" grab bags.

## Docs — part of the change

A function change is incomplete until the owning app's
`src/instructions/reference/functions` page reflects it — signature,
env vars, schedule, failure modes. Re-verify and bump `verified_*`.
