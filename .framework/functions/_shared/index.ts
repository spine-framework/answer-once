// CIL[BEGIN stable_id="~/.framework/functions/_shared/index.ts:reexports:module" type="module" identity="reexports" parent="~/.framework/functions/_shared/index.ts"]
// CIL[DOC-MACRO purpose="Re-exports shared utilities and types for Spine functions"]
// CIL[DOC-RESPONSIBILITY responsibility="Public barrel file that centralizes named exports from the _shared function library"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="re-exports of shared types and functions" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Collects and re-exports shared types and helpers from middleware, principal, db, pipeline-runner, trigger-engine, agent-runner, permissions, schema-utils, resolve-ids, audit, webhook, app-manifest and testing modules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export type { CoreContext } from './middleware'
export type { RequestContext, HandlerFunction, HandlerResult } from './middleware'
export { createHandler, createPublicHandler, requireUserContext, requireSystemContextWithAudit, json, error as errorResponse, cors } from './middleware'
export type { Principal } from './principal'
export { resolvePrincipal } from './principal'
export { isSystemAdmin } from './principal'
export { machineHasScope, humanHasRole } from './principal'
export { getPrincipalDb } from './principal'
export { formatPrincipalForAudit } from './principal'
export { ANONYMOUS_PRINCIPAL } from './principal'
export { SYSTEM_PRINCIPAL } from './principal'
export { adminDb } from './db'
export { getUserDb } from './db'
export { joins } from './db'
export type { DbResult } from './db'
export { runPipeline } from './pipeline-runner'
export type { ExecutionResult, StageResult } from './pipeline-runner'
export { checkAndFireTriggers, fireCreateTriggers, fireUpdateTriggers, fireDeleteTriggers } from './trigger-engine'
export type { EventType } from './trigger-engine'
export { runAgent, resolveAgentConfig } from './agent-runner'
export type { AgentConfig, InferenceResult, ToolCall, ToolResult } from './agent-runner'
export { PermissionEngine } from './permissions'
export type { PermissionResult } from './permissions'
export { sanitizeRecordData, validateUpdatePermissions, canAccessRecord } from './permissions'
export { generateValidationSchema } from './schema-utils'
export type { ValidationSchema } from './schema-utils'
export { resolveTypeId, resolveTypeIds, resolveTypeRecord, resolveLinkTypeId, resolveLinkTypeIds, resolveAccountId, resolveAgentId, resolvePromptConfigId } from './resolve-ids'
export type { TypeRecord } from './resolve-ids'
export { emitAudit } from './audit'
export { resolveHandler, lookupHandler, loadHandler } from './webhook-registry'
export { registerWebhookHandler, deregisterWebhookHandler, isHandlerRegistered } from './webhook-registration'
export type { WebhookHandlerRegistration } from './webhook-registration'
export { loadManifest, mergeWithManifest, clearManifestCache, discoverManifests } from './app-manifest'
export type { AppManifest, NavItem } from './app-manifest'
export { emitSignal, accountDataFlag } from './funnel'
export type { SignalInput } from './funnel'
export { resolveNotificationRecipients } from './notify'
export { checkRateLimit, resolveRateLimitPolicies, RateLimitError } from './rate-limit'
export type { RateLimitPolicy } from './rate-limit'
export { getClientGeo } from './geo'
export type { ClientGeo } from './geo'
export {
  makeTestContext,
  mockPrincipal,
  mockLogger,
  mockEvent,
  mockNetlifyContext,
  cleanup,
  setupTests,
  expectSuccessResponse,
  expectErrorResponse
} from './testing'
export type { TestContext, TestPrincipal, TestLogger } from './testing'
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports shared utilities and types for Spine functions'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/index.ts:reexports:module"]
