# Answer Once: threat model

Covers `spine-framework/answer-once` (production, support.answer-once.com) and `spine-framework/answer-once-demo` (public demo, demo.answer-once.com). Neither repo has a SECURITY_MODEL.md, so this model was drafted from the code. The **User-stated** sections hold what Ken confirmed.

## System overview
Both repos are standalone exports of the Spine framework. Each has a frozen framework snapshot in `.framework/`, which is byte-identical across the two repos, and an app layer in `custom/`.
- **Runtime:** Netlify. `npm run assemble` copies every `.framework/functions/*.ts` plus `custom/apps/*/functions/*.ts` into `.assembled/netlify/functions`, so every framework function is deployed, including `debug-auth`, `eval-harness`, `tests` and `cil-*`. A Vite/React SPA is served from `dist`. Scheduled functions are `trigger-scheduler` (every minute) and `custom_answeronce-autoresolve-cron` (daily).
- **Data/Auth:** Supabase (Postgres + Auth + Realtime). Functions use `adminDb` (service role, bypasses RLS) or a per-user client `ctx.db` (RLS enforced). Schema and RLS live in `.framework/migrations/*.sql` and `custom/migrations/*.sql`.
- **AI:** LLM agents (`_shared/agent-runner.ts`, `_shared/llm.ts`, `ai-agents.ts`, pipelines/triggers) triage tickets, answer customers and draft KB articles. Embeddings and KB retrieval come from `kb.ts`, `embeddings.ts` and `_shared/kb.ts`. CIL code-intelligence ingestion runs in `cil-*.ts`.
- **Infrastructure:** no separate IaC repo (user-confirmed). It consists of `netlify.toml` (security headers, CSP, function config) and the SQL migrations.

## Trust boundaries
1. Browser ↔ Netlify functions: the request is authenticated in `_shared/principal.ts#resolvePrincipal`.
2. Functions ↔ Supabase: `adminDb` (service role) vs `ctx.db` (user JWT + RLS). Every `adminDb` use on a user request is a place where the code must enforce tenant/visibility checks itself.
3. Tenant ↔ tenant: accounts (`account_id`). Self-registration creates a new account (`account_strategy: "new"`, `default_role: member_admin`) under parent `spine-system`. `spine.config.json` sets `allow_url_override: true`.
4. Customer ↔ staff within the platform: `member`/`member_admin` vs `support`/`support_admin`/`system_admin`. `_shared/access.ts#hasInternalAudience` and `projectMessageForCustomer` gate `visibility = 'internal'` records. Every seeded role has `permissions: ["*"]` (`custom/apps/*/seed/roles.json`), so role *permissions* do not separate customers from staff. Only role slugs and RLS do.
5. Untrusted content ↔ LLM agents: ticket text, KB articles and integration payloads flow into prompts and tool calls.
6. External systems ↔ integrations: inbound `integration-routes.ts` (public handler), outbound `integration-outbound.ts`, `deliveries.ts`, `_shared/webhook-*.ts`, and stored credentials in `_shared/resolve-credentials.ts`.

## Entry points
- **Authenticated JWT API:** every `createHandler` function in `.framework/functions/` and `custom/apps/*/functions/`. Reachable by any self-registered user.
- **Public (anonymous):** `createPublicHandler` in `invites.ts` (registration, invite preview) and `integration-routes.ts`. Turnstile and the IP blocklist are in `_shared/security.ts`.
- **API keys:** the `x-api-key` header becomes a machine principal (`resolveMachinePrincipal`), with keys managed in `api-keys.ts`.
- **Internal invoke:** `x-internal-secret` (`INTERNAL_INVOKE_SECRET`, timing-safe) plus optional `x-cron-id`/`x-trigger-id` principal assumption. A bare valid secret yields `SYSTEM_PRINCIPAL`.
- **Direct Supabase:** the browser holds the anon key and user JWT and can query PostgREST/RPC/Realtime directly. RLS policies and `SECURITY DEFINER` functions (e.g. `handle_new_auth_user` in `042_registration_hierarchy.sql`) form a parallel API surface.
- **Scheduled:** `trigger-scheduler`, `system-cron`, `custom_answeronce-autoresolve-cron`, and background pipelines (`pipeline-runner-background.ts`).
- **Dev tooling:** `.framework/cli`, `.framework/mcp` and `scripts/`. These run with service-role env locally. The user says they are in scope.

## Components
| Component | Code |
|---|---|
| **Web Client** | `.framework/src/**`, `custom/apps/*/{index.tsx,pages,components,hooks,views,lib,utils}` |
| **Auth & Access Control** | `.framework/functions/_shared/{principal,middleware,access,permissions,security,rate-limit,hash-api-key,geo}.ts`, `auth.ts`, `invites.ts`, `api-keys.ts`, `roles.ts`, `debug-auth.ts`, `security.ts` |
| **Data API** | `admin-data.ts`, `apps.ts`, `account-nodes.ts`, `kb.ts`, `item-progress.ts`, `logs.ts`, `observability.ts`, `admin-*.ts`, `prompt-configs.ts`, `system.ts`, `custom/apps/answer-once/functions/admin-data.ts` |
| **AI Agents & Pipelines** | `ai-agents.ts`, `ai-interactions.ts`, `embeddings.ts`, `pipelines.ts`, `pipeline-*.ts`, `triggers.ts`, `trigger-scheduler.ts`, `timers.ts`, `system-cron.ts`, `_shared/{agent-runner,llm,pipeline-runner,trigger-engine,kb,outcomes,message-sequence}.ts`, `custom/apps/*/functions/custom_*.ts` |
| **Integrations & Webhooks** | `integrations.ts`, `integration-routes.ts`, `integration-outbound.ts`, `deliveries.ts`, `_shared/{webhook-registration,webhook-registry,resolve-credentials,retry-deliveries,notify}.ts`, `functions/adapters/**` |
| **CIL & Dev Tooling** | `cil-*.ts`, `eval-harness.ts`, `tests.ts`, `_shared/{cil,ast,testing}.ts`, `.framework/cli/**`, `.framework/mcp/**`, `scripts/**`, `bin/**` |
| **Database & Infra** | `.framework/migrations/*.sql`, `custom/migrations/*.sql`, `.framework/schemas/**`, `.framework/seeds/**`, `custom/apps/*/seed/**`, `netlify.toml`, `spine.config.json` |

## Assets (user-stated: all of these are critical)
- Customer ticket content and PII (tickets, threads, messages, people, emails).
- Internal-only notes / staff-visibility records (`visibility = 'internal'` threads/messages, agent reasoning and tool payloads).
- Secrets: `SUPABASE_SERVICE_ROLE_KEY`, LLM provider keys, `INTERNAL_INVOKE_SECRET`, integration credentials.
- API keys and auth sessions (Supabase JWTs, `api_keys` hashes).
- Integrity of the published knowledge base (what the AI tells every customer).

## Attackers (user-stated: all of these matter)
- Anonymous internet users.
- Self-registered customers attacking other tenants (cross-tenant access).
- Customers escalating to staff/internal visibility within their tenant.
- Prompt injection via ticket/KB content into the AI agents (for example, poisoning the published KB, exfiltrating internal notes, or driving tool calls).
- Malicious or compromised support staff.

## Existing controls (observed in code)
- Internal invoke is gated by a timing-safe shared-secret compare. Cron/trigger IDs are only honored with the secret.
- API keys are hashed with prefix lookup, rate-limited, and their usage is logged.
- `hasInternalAudience` and `projectMessageForCustomer` strip internal message content for customers and drop rows whose thread visibility is unknown.
- RLS hardening migrations (`006`, `045`, `046`), plus an IP blocklist (`049`) and rate limits (`035`).
- Turnstile on public registration. Strict headers in `netlify.toml`: CSP with `frame-ancestors 'none'`, HSTS, nosniff. `script-src` still allows `'unsafe-inline'`.

## User-stated scope and priorities
- **Nothing is out of scope.** Framework code, dev tooling, CIL/eval/debug functions and tests are all in scope.
- **Demo (answer-once-demo) is a public demo with throwaway data.** Findings that only affect the demo deployment (`custom/apps/demo/**`, demo-only migrations, demo-only config) are lower priority, **unless they reach shared secrets or infrastructure** (service role key, LLM keys, a Supabase project or Netlify site shared with production). `.framework/` code is identical in both repos and deployed in production, so a `.framework/` finding keeps production priority regardless of which repo it was reported in.

## Open questions
- Does the demo share a Supabase project, LLM keys or `INTERNAL_INVOKE_SECRET` with production? If it does, the demo is not isolated.
- Is `allow_url_override` meant to let a registrant choose app/role via URL in production?
- Should seeded roles keep `permissions: ["*"]`, or is the slug-based staff check the intended sole separation?

## Tags
- `Component`: one of the component names above.
- `Repository`: `answer-once`, `answer-once-demo`, or `shared framework` for `.framework/**`, which is identical in both.
- `OWASP`: OWASP Top 10 2021 category (e.g. `A01:2021 Broken Access Control`), or OWASP LLM Top 10 2025 for LLM-specific issues (e.g. `LLM01:2025 Prompt Injection`).
