---
title: Shared Modules Reference
audience: developers, agents
kind: reference
verified_against: f69c37d
verified_on: 2026-10-30
source_files:
  - .framework/functions/_shared/index.ts
  - .framework/functions/_shared/middleware.ts
  - .framework/functions/_shared/principal.ts
  - .framework/functions/_shared/db.ts
  - .framework/functions/_shared/permissions.ts
  - .framework/functions/_shared/schema-utils.ts
  - .framework/functions/_shared/trigger-engine.ts
  - .framework/functions/_shared/pipeline-runner.ts
  - .framework/functions/_shared/agent-runner.ts
  - .framework/functions/_shared/logging.ts
  - .framework/functions/_shared/audit.ts
  - .framework/functions/_shared/tracing.ts
  - .framework/functions/_shared/rate-limit.ts
  - .framework/functions/_shared/resolve-credentials.ts
  - .framework/functions/_shared/resolve-ids.ts
  - .framework/functions/_shared/hash-api-key.ts
  - .framework/functions/_shared/webhook-registration.ts
  - .framework/functions/_shared/webhook-registry.ts
  - .framework/functions/_shared/message-sequence.ts
  - .framework/functions/_shared/security.ts
---

# Shared Modules Reference

`.framework/functions/_shared/` is the library every Netlify function builds
on — bundled per function, never deployed as an endpoint itself.
`.framework/functions/_shared/index.ts` re-exports the common surface
(`createHandler`, `createPublicHandler`, `requireUserContext`,
`requireSystemContextWithAudit`, `json`, `errorResponse`, `cors`, the
`Principal`/`RequestContext`/`CoreContext`/`HandlerFunction`/`HandlerResult`
types). Import a sibling as `from './_shared/<module>'`.

## Request handling

| Module | Exports | Import when |
|---|---|---|
| `middleware.ts` | `createHandler`, `createPublicHandler`, `json`, `error`, `cors`, `parseBody`, `requireUserContext`, `requireSystemContextWithAudit`; `RequestContext`, `CoreContext`, `HandlerFunction`, `HandlerResult` | every function — wraps auth, tracing, envelope, and error mapping around your handler |
| `principal.ts` | `resolvePrincipal`, `SYSTEM_PRINCIPAL`, `ANONYMOUS_PRINCIPAL`, `getPrincipalDb`, `isSystemAdmin`, `humanHasRole`, `machineHasScope`, `resolveInternalPersonId`, `formatPrincipalForAudit` | reading `ctx.principal`, checking roles/scopes, internal invocations |
| `db.ts` | `adminDb` (service-role, bypasses RLS), `getUserDb(token)` (RLS-scoped), `joins` | direct table access — prefer `ctx.db` (already principal-scoped) inside handlers |

## Permissions & data shape

| Module | Exports | Import when |
|---|---|---|
| `permissions.ts` | `PermissionEngine`, `resolveFirstSurfacePermissions`, `sanitizeRecordData`, `validateUpdatePermissions`, `canAccessRecord`, `isSystemAdmin`, `PermissionResult` | evaluating `design_schema` grants, stripping fields a principal can't read, validating writes |
| `schema-utils.ts` | `generateValidationSchema`, `sanitizeFieldData`, `formatFieldData`, `transformRecordData`, `ValidationSchema` | field validation/sanitization against `data_type`; generating `validation_schema` |
| `resolve-ids.ts` | `resolveTypeId`, `resolveTypeIds`, `resolveTypeRecord`, `resolveAccountId`, `resolveLinkTypeId(s)`, `resolveAgentId`, `resolvePromptConfigId` | slug→uuid lookups for types, link types, accounts, agents, prompts |

## Automation & agents

| Module | Exports | Import when |
|---|---|---|
| `trigger-engine.ts` | `fireCreateTriggers`, `fireUpdateTriggers`, `fireDeleteTriggers`, `checkAndFireTriggers`, `dispatchTriggerPipeline`, `EventType` | firing record-change triggers; dispatching a pipeline run (needs `INTERNAL_INVOKE_SECRET`) |
| `pipeline-runner.ts` | `runPipeline`, `sweepStaleExecutions`, `ExecutionResult`, `StageResult` | executing a pipeline's stages inside a function/background context |
| `agent-runner.ts` | `runAgent`, `runAgentStep`, `claimAgentEpisode`, `kickAgentEpisode`, `acquireEpisodeLease`, `resolveAgentConfig`, `executeToolAction`, `retrieveKnowledge`, `AgentConfig`, `ToolCall`, `ToolResult` | running an AI agent turn against a thread |
| `message-sequence.ts` | `insertMessageSequenced` | inserting a message outside `runAgent` — allocates `MAX(sequence)+1` and retries on the `(thread_id, sequence)` race |
| `notify.ts` | `resolveNotificationRecipients` | resolving `role:<slug>` / `self` / UUID recipients to `people.id` |

## Observability & audit

| Module | Exports | Import when |
|---|---|---|
| `logging.ts` | `withAdminLogging`, `logAdminDataOperation`, `resolveLogLevels`, `resolveAppUuid`, `LogLevel` | wrapping handlers with the instance log-level-aware logging pipeline |
| `audit.ts` | `emitAudit`, `emitLog`, `emitSpan`, `emitActivity` | writing structured log/audit/span rows into `public.logs` |
| `tracing.ts` | `newTrace`, `startSpan`, `endSpan`, `withSpan(Sync)`, `traceDb`, `formatTraceParent/State`, `parseTraceParent/State`, `generateTraceId/SpanId`, `isSampled` | W3C trace-context propagation and span wrapping of DB calls |
| `outcomes.ts` | `emitOutcome` | recording outcome audit rows |

## Security

| Module | Exports | Import when |
|---|---|---|
| `hash-api-key.ts` | `hashApiKey`, `verifyApiKey`, `omitSecretFields` | minting/verifying API keys (`pbkdf2$iter$salt$hash`, 100k sha256); stripping key material from responses |
| `rate-limit.ts` | `checkRateLimit`, `resolveRateLimitPolicies`, `RateLimitError`, `RateLimitPolicy` | enforcing `config.rate_limits` policies via the atomic `rate_limit_hit` RPC |
| `security.ts` | `isBlockedRequest`, `isBlockedIp`, `checkTypeSlugRateLimit`, `detectInjection`, `emitSecurityEvent`, `getAppSecurityConfig`, `checkRegistrationBlocklist`, `touchPersonGeo`, `INJECTION_PATTERNS` | blocklist checks, per-type-slug rate limits, prompt-injection screening |
| `geo.ts` | `getClientGeo`, `ClientGeo` | best-effort client IP/geo from request headers |

## Integrations & webhooks

| Module | Exports | Import when |
|---|---|---|
| `resolve-credentials.ts` | `resolveCredential`, `resolveCredentials`, `ResolvedCredential` | resolving `integrations.config.credentials` (`value` literal or `env_var` lookup) server-side |
| `webhook-registration.ts` | `registerWebhookHandler`, `deregisterWebhookHandler`, `isHandlerRegistered` | self-registering a custom function as a webhook handler (`webhook_handlers` upsert) |
| `webhook-registry.ts` | `lookupHandler`, `resolveHandler`, `loadHandler`, `listRegisteredHandlers`, `clearHandlerCache` | resolving which registered handler receives an inbound event |
| `retry-deliveries.ts` | `retryPendingDeliveries` | sweeping due `webhook_deliveries` rows for retry |

## Knowledge & LLM

| Module | Exports | Import when |
|---|---|---|
| `kb.ts` | `kbIngest`, `kbPublish`, `kbReindex`, `kbRevoke`, `kbSearch`, `resolveKnowledgeScope`, `knowledgeRowAllowed`, `resolveSecurityLevel`, `matchItemType`, `KnowledgeScope`, `KnowledgeEnvelope` | ingesting/searching embeddings with scope + security-level enforcement |
| `llm.ts` | `callOpenAI`, `callOpenAIChat`, `callOpenAIEmbeddings`, `callEmbeddingApi`, `LlmContext` | thin wrappers over the `openai` outbound integration |
| `funnel.ts` | `emitSignal`, `accountDataFlag`, `SignalInput` | emitting typed funnel/signal events that can fire triggers |
| `access.ts` | `hasInternalAudience`, `projectMessageForCustomer`, `INTERNAL_AUDIENCE_ROLES`, `CUSTOMER_STEP_TYPES` | deciding whether a principal may read `visibility: 'internal'` rows and projecting customer-safe message shapes |

## Framework internals

| Module | Purpose |
|---|---|
| `app-manifest.ts` | `loadManifest`, `mergeWithManifest`, `discoverManifests`, `clearManifestCache` — `manifest.json` loading for app rows with `config_source = 'manifest'` |
| `ast.ts` | `extractIdentities` — TypeScript compiler API for code-analysis pipelines |
| `cil.ts` | stable-id generation, content hashing, file-tree helpers for the code-intelligence pipeline — not needed by custom apps |
| `testing.ts` | `mockEvent`, `mockPrincipal`, `makeTestContext`, `expectSuccessResponse`, `expectErrorResponse`, `setupTests` — function-level test harness |

## Usage notes

- `ctx.db` is already the right client for the request's principal — humans
  get an RLS-scoped client, machines get `adminDb`. Reach for `adminDb`
  directly only when you must deliberately bypass RLS (system writes,
  cross-account lookups like `types`/`accounts` resolution).
- Never `JSON.stringify(ctx.principal)` — `authContext.jwt` rides on it; use
  `formatPrincipalForAudit`.
- Circular-import hazards are real in this layer (`middleware → security →
  rate-limit → funnel → trigger-engine → pipeline-runner → kb → llm →
  integration-outbound → admin-data → middleware`); some modules import
  lazily on purpose — copy that pattern rather than adding a static edge.

## Related

- [admin-data](api/admin-data.md) · [Authentication](api/auth.md) · [Errors and Envelopes](api/errors-and-envelopes.md)
- [Design Schema](design-schema.md) · [Database](database.md)
