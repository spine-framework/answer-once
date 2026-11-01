---
title: Environment Variables
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .env.example
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/db.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/system-cron.ts
  - .framework/functions/pipeline-runner-background.ts
  - .framework/functions/security.ts
  - .framework/functions/invites.ts
  - .framework/functions/adapters/resend-outbound.ts
  - .framework/cli/context.ts
  - .framework/cli/commands/migrate.ts
  - .framework/cli/commands/install-app.ts
  - .framework/src/lib/supabase.ts
  - .framework/src/App.tsx
---

# Environment Variables

Every variable read across `.framework/` — where it's read, whether it's
required, and whether it is browser-exposed. `VITE_*` vars are compiled into
the frontend bundle and are **public by definition**; all others are
server-only (Netlify functions, CLI, MCP tooling). `.env` at the project root
is preloaded by the CLI and dev tooling.

> **Security rule:** never set `VITE_SUPABASE_SERVICE_ROLE_KEY` or put any
> secret behind a `VITE_*` name. The service-role key bypasses RLS entirely;
> shipping it to the browser hands full database access to every visitor.
> Only `VITE_SUPABASE_ANON_KEY` belongs in the client bundle.

## Required — server

| Variable | Read by | Purpose |
|---|---|---|
| `SUPABASE_URL` | `.framework/functions/_shared/db.ts`, `.framework/functions/_shared/principal.ts`, CLI (`context.ts`, `install-app.ts`, `migrate.ts`, `status.ts`, `system.ts`) | Supabase project URL for service + user clients |
| `SUPABASE_SERVICE_ROLE_KEY` | `.framework/functions/_shared/db.ts` (`adminDb`), `.framework/cli/context.ts`, `install-app.ts`, `status.ts` | Service-role client; bypasses RLS. **Server-only** |
| `SUPABASE_ANON_KEY` | `.framework/functions/_shared/principal.ts`, `.framework/functions/_shared/db.ts` (`getUserDb`) | JWT verification and user-scoped PostgREST clients inside functions |

Missing `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` fails CLI commands that
touch the DB and leaves `adminDb` on placeholder credentials — function
calls then fail at query time.

> **Key naming:** all three values are under Supabase Dashboard → Project
> Settings → API Keys (older dashboards: Settings → API / Data API).
> Current dashboards issue the anon key as a **Publishable key**
> (`sb_publishable_…`) and the service-role key as a **Secret key**
> (`sb_secret_…`) — set `*_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` to them
> directly; they work everywhere the legacy JWTs did.

## Required for specific features — server

| Variable | Read by | Required for |
|---|---|---|
| `SUPABASE_DB_PASSWORD` | `.framework/cli/commands/migrate.ts`, `install-app.ts` | Direct Postgres connection for `migrate`/`install-app` (from Supabase Dashboard → Database) |
| `SUPABASE_DB_URL` | `.framework/cli/commands/migrate.ts` | Optional full connection string overriding host/user/port — use the **Session Pooler** (`postgres://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres`) when `db.<ref>.supabase.co:5432` is unreachable (direct connections are IPv6-only on most Supabase projects) |
| `INTERNAL_INVOKE_SECRET` | `.framework/functions/_shared/principal.ts` (`isInternalInvokeAuthorized`), `.framework/functions/_shared/trigger-engine.ts`, `.framework/functions/pipeline-runner-background.ts` | Authenticates function-to-function invocation via `x-internal-secret`. **Required for trigger dispatch** — without it, `dispatchTriggerPipeline` cannot invoke `pipeline-runner-background` and `x-cron-id`/`x-trigger-id`/`x-internal-secret` headers are never honored. Generate with `openssl rand -hex 32` |
| `SCHEDULER_API_KEY` | `.framework/functions/system-cron.ts` | `?api_key=`/`?scheduler_key=` on the scheduler endpoint; unset disables key-gated scheduling |
| `APP_BASE_URL` | `.framework/functions/invites.ts` | Base URL for invite links, auth redirects, and the allowlist for client-supplied `base_url` params |
| `RESEND_API_KEY` | resolved via `env_var` credentials on the `transactional-email`/`resend` integration (`.framework/functions/_shared/resolve-credentials.ts`) | Outbound email (invites, notification stages). Unset → invites fall back to copyable links, email stages skip |
| `EMAIL_FROM` | `.framework/functions/adapters/resend-outbound.ts` | Sender identity for outbound email |
| `OPENAI_API_KEY` | resolved via `env_var` credentials on the `openai` integration; `.framework/functions/_shared/agent-runner.ts` mocks responses when absent | LLM chat/embeddings for agents, pipelines, KB |
| `LLM_DEFAULT_MODEL` | `.framework/functions/_shared/agent-runner.ts`, `.framework/functions/embeddings.ts` | Default model slug when prompts don't pin one |
| `NETLIFY_ACCESS_TOKEN`, `NETLIFY_SITE_ID` | `.framework/functions/security.ts` | Push banned IPs to Netlify edge Firewall rules; unset skips the edge layer |

Integration credentials generally use `source: 'env_var'` +
`value: '<VAR_NAME>'` in `integrations.config.credentials` —
`resolveCredentials` reads `process.env[value]` server-side
(`.framework/functions/_shared/resolve-credentials.ts`). Any env var name is
permitted there.

## Optional — server behavior tuning

| Variable | Read by | Default |
|---|---|---|
| `SITE_URL` | `.framework/functions/_shared/middleware.ts` | `Access-Control-Allow-Origin` header; falls back to Netlify's `URL`, then `*` |
| `URL` | `.framework/functions/_shared/middleware.ts`, `.framework/mcp/` | Netlify auto-set site URL; CORS and MCP base-URL fallback |
| `ALLOWED_ORIGINS` | `.framework/functions/invites.ts` | extra CORS origins for invite endpoints |
| `SPINE_IP_RATE_LIMIT` | `.framework/functions/_shared/principal.ts` | per-IP request ceiling for API-key auth; default `300`/60s |
| `REPO_PATH` | `.framework/functions/_shared/app-manifest.ts`, `.framework/mcp/` | project root for manifest discovery; defaults to `process.cwd()` |
| `DB_SCHEMA` | `.framework/functions/_shared/db.ts` | PostgREST schema; default `public` (multi-instance installs only) |
| `EMAIL_WEBHOOK_URL` | outbound adapters | optional inbound-email relay endpoint |

## Client-exposed (`VITE_*`, browser bundle)

| Variable | Read by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `.framework/src/lib/supabase.ts` | Supabase URL for the browser client — required |
| `VITE_SUPABASE_ANON_KEY` | `.framework/src/lib/supabase.ts` | anon key for the browser client — required, RLS-scoped, safe |
| `VITE_ENVIRONMENT` | `.framework/src/contexts/AppContext.tsx`, `.framework/src/hooks/useApps.ts` | environment badge (`dev`/`staging`/`prod`) |
| `VITE_SETUP_MODE` | `.framework/src/App.tsx` | setup-mode UI flag |
| `VITE_TURNSTILE_SITE_KEY` | `.framework/src/components/auth/TurnstileWidget.tsx` | Cloudflare Turnstile site key on auth pages — public by design |
| `VITE_APP_NAME` | `.env.example` (branding) | app name for UI/localStorage/webhook headers — prefer `branding.app_name` in `spine.config.json` |
| `VITE_DB_SCHEMA` | `.env.example` | deprecated multi-instance knob; leave unset |

## CLI / local tooling

| Variable | Read by | Purpose |
|---|---|---|
| `SPINE_CLI_API_KEY` | `.framework/cli/context.ts` | API-key auth for remote CLI commands (`items`, `pipelines`, `agents`, `system`) |
| `SPINE_CLI_JWT` | `.framework/cli/context.ts` | JWT auth alternative for the same commands |
| `SPINE_CLI_ACCOUNT_ID` | `.framework/cli/context.ts` | default account scope; `--account` overrides |
| `SPINE_CLI_DEBUG` | `dev.ts`, `init.ts`, `install-app.ts`, `migrate.ts`, `upgrade.ts` | verbose CLI diagnostics |
| `SPINE_URL`, `SPINE_API_KEY`, `SPINE_FRAMEWORK_API_KEY` | `.framework/mcp/` | MCP server endpoint + key |
| `OPENAI_BASE_URL`, `LLM_API_KEY`, `OPENAI_API_KEY` | `.framework/mcp/` | MCP-side LLM provider config |

## Consumer-side conventions

Not read by framework runtime code — a convention for agent/tooling
integrations so the same credential location works everywhere:

| Variable | Read by | Purpose |
|---|---|---|
| `SPINE_API_KEY` | agent tooling (`.framework/mcp/` honors it too) | the `sk_…` key an agent sends as `x-api-key` on `/api/*` requests; the user creates a scoped key in Admin → Configs → API Keys |

## Test-only

`SPINE_DEV_URL`, `SPINE_DEV_JWT`, `SPINE_TEST_API_KEY`, `SPINE_TEST_ACCOUNT_ID`,
`ACCOUNT_ID`, `SERVICE_KEY` — used by `.framework/tests/` fixtures and
integration suites; never required at runtime.

## Related

- `.env.example` — annotated starter file
- [Authentication](api/auth.md) — how `x-api-key`/`x-internal-secret`/Bearer resolve
- [Shared Modules](shared-modules.md)
