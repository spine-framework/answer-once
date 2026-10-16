// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-credentials.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-MACRO purpose="Module header for resolve-credentials; imports shared dependencies."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares module-level imports and identifies file scope."]
// CIL[DOC-CONTEXT module="resolve-credentials" layer="shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports CoreContext from middleware and emitLog from audit." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]


import { CoreContext } from './middleware'
import { emitLog } from './audit'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for resolve-credentials; imports shared dependencies.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-credentials.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-credentials.ts:CredentialEntry:interface" type="interface" identity="CredentialEntry" parent="~/.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-MACRO purpose="Describes a single credential entry with source and raw value."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of a credential configuration entry."]
// CIL[DOC-CONTEXT module="resolve-credentials" layer="shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CredentialEntry type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface with source and value fields; source is either 'value' or 'env_var'." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface CredentialEntry {
  source: 'value' | 'env_var'
  value: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Describes a single credential entry with source and raw value.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-credentials.ts:CredentialEntry:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-credentials.ts:ResolvedCredential:interface" type="interface" identity="ResolvedCredential" parent="~/.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-MACRO purpose="Describes a resolved credential with final value and source."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the return type for resolved credentials."]
// CIL[DOC-CONTEXT module="resolve-credentials" layer="shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ResolvedCredential type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exported interface with value and source fields representing a resolved credential." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface ResolvedCredential {
  value: string
  source: 'value' | 'env_var'
}
// CIL[DOC-VECTOR type="context" content="purpose='Describes a resolved credential with final value and source.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-credentials.ts:ResolvedCredential:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-credentials.ts:resolveCredential:function" type="function" identity="resolveCredential" parent="~/.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-MACRO purpose="Resolves a single credential from a literal value or an environment variable, validating and auditing the result."]
// CIL[DOC-RESPONSIBILITY responsibility="Read the credential entry for the given field, validate its configuration, resolve env_var values from process.env, audit each outcome, and return the resolved credential."]
// CIL[DOC-CONTEXT module="resolve-credentials" layer="shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, integration: any, fieldName: string" outputs="ResolvedCredential" errors="Missing credential configuration, missing environment variable, empty credential value" side_effects="Emits audit log events via emitLog"]
// CIL[DOC-MICRO logic_summary="Extracts the credential entry from integration.credentials; validates that source and value are present; for env_var reads process.env and throws if unset; for literal value throws if empty; audits resolution and returns the resolved credential." notable_decisions="[\"Environment variables are read from process.env\",\"Credential source is either 'value' or 'env_var'\"]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function resolveCredential(
  ctx: CoreContext,
  integration: any,
  fieldName: string
): Promise<ResolvedCredential> {
  const credentials = integration?.credentials || {}
  const entry = credentials[fieldName] as CredentialEntry | undefined

  if (!entry || !entry.source) {
    await emitLog(ctx, 'integration.credential_missing', { type: 'integration', id: integration?.id }, undefined, {
      field: fieldName,
      integration_id: integration?.id,
      account_id: ctx.accountId
    })
    throw new Error(`Missing credential configuration for ${fieldName} on integration ${integration?.id}`)
  }

  if (entry.source === 'env_var') {
    const envValue = process.env[entry.value]
    if (!envValue) {
      await emitLog(ctx, 'integration.credential_env_missing', { type: 'integration', id: integration?.id }, undefined, {
        field: fieldName,
        env_var: entry.value,
        integration_id: integration?.id,
        account_id: ctx.accountId
      })
      throw new Error(`Environment variable ${entry.value} for ${fieldName} is not set`)
    }

    // Success audit is fire-and-forget — the resolved credential is already
    // in hand and the outbound call shouldn't wait on a logs insert. Failure
    // paths above stay awaited so the audit row is durable before the throw.
    void emitLog(ctx, 'integration.credential_resolved', { type: 'integration', id: integration?.id }, undefined, {
      field: fieldName,
      source: 'env_var',
      env_var: entry.value,
      integration_id: integration?.id,
      account_id: ctx.accountId
    })

    return { value: envValue, source: 'env_var' }
  }

  if (!entry.value) {
    await emitLog(ctx, 'integration.credential_empty', { type: 'integration', id: integration?.id }, undefined, {
      field: fieldName,
      source: 'value',
      integration_id: integration?.id,
      account_id: ctx.accountId
    })
    throw new Error(`Credential ${fieldName} on integration ${integration?.id} is empty`)
  }

  void emitLog(ctx, 'integration.credential_resolved', { type: 'integration', id: integration?.id }, undefined, {
    field: fieldName,
    source: 'value',
    integration_id: integration?.id,
    account_id: ctx.accountId
  })

  return { value: entry.value, source: 'value' }
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolves a single credential from a literal value or an environment variable, validating and auditing the result.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-credentials.ts:resolveCredential:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/resolve-credentials.ts:resolveCredentials:function" type="function" identity="resolveCredentials" parent="~/.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-MACRO purpose="Resolves multiple credentials for a list of field names."]
// CIL[DOC-RESPONSIBILITY responsibility="Iterates the requested field names and resolves each one via resolveCredential, accumulating the results."]
// CIL[DOC-CONTEXT module="resolve-credentials" layer="shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, integration: any, fieldNames: string[]" outputs="Record<string, ResolvedCredential>" errors="Propagates any error thrown by resolveCredential" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Loops over fieldNames, awaits resolveCredential for each, and stores results in a record keyed by field name." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function resolveCredentials(
  ctx: CoreContext,
  integration: any,
  fieldNames: string[]
): Promise<Record<string, ResolvedCredential>> {
  const result: Record<string, ResolvedCredential> = {}
  for (const fieldName of fieldNames) {
    result[fieldName] = await resolveCredential(ctx, integration, fieldName)
  }
  return result
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolves multiple credentials for a list of field names.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/resolve-credentials.ts:resolveCredentials:function"]
