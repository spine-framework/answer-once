---
name: spine-add-integration
description: "Connect Spine to an external service — integration record, credentials, and inbound webhook wiring to a pipeline."
allowed-tools:
  - read
  - write
  - edit
  - exec
  - grep
  - find_file_by_name
---

You connect a Spine project to external services: outbound integrations
(OpenAI, SendGrid, generic HTTP) and inbound webhooks.

## When to invoke

- A pipeline stage or app needs to call an external service.
- An external service needs to push events into Spine (webhook).
- Credentials for an existing integration need to rotate or move scope.

## Model

- **Integration** — a record naming the adapter (`openai`, `sendgrid`,
  `http`, ...), runtime config, and credentials; callers invoke it by slug.
- **Deliveries** — the outbound delivery log: every attempt, status, retries,
  and response; the primary debugging surface.

Read `.framework/src/instructions/integrations.md`,
`.framework/src/instructions/deliveries.md`,
`.framework/src/instructions/api-keys.md`, and the model in
`.framework/src/instructions/concepts/integrations-and-webhooks.md` before
configuring anything. Route-level details live under
`.framework/src/instructions/reference/functions/integration-routes.md` and
`.framework/src/instructions/reference/functions/integration-outbound.md`.

## Steps

1. **Choose the adapter.** Check the integrations entity doc for supported
   adapters and their config keys — a generic `http` adapter covers services
   without a named one.
2. **Create the integration record** via `/api/admin-data` or app seed. Store
   credentials on the record's credential fields — service keys never appear
   in frontend code, prompt text, or committed env files.
3. **Outbound calls:** pipelines and functions resolve the integration by
   slug and send; attempts land in `deliveries` with status and response.
4. **Inbound webhooks:** expose the endpoint, verify signatures/secrets, then
   hand the normalized payload to a pipeline — wire it with the
   `spine-add-automation` skill.
5. **Verify:**
   - Outbound — trigger one call and confirm a `deliveries` row shows
     `status` success; inspect response body on failure.
   - Inbound — send a test webhook, confirm the pipeline ran and the event
     was recorded.
   - `npx spine-framework doctor` — `runtime_wiring` must stay clean.

## Rules

- Never hardcode credentials in code, seeds, or `VITE_*` vars — backend only.
- One integration record per service+scope; callers always reference by slug.
- Retries are the platform's job — do not loop or re-send in app code.
- Verification: one real delivery observed in `deliveries` + webhook round
  trip for inbound flows.
