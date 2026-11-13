

import { CoreContext } from './middleware'
import { emitLog } from './audit'


interface CredentialEntry {
  source: 'value' | 'env_var'
  value: string
}


export interface ResolvedCredential {
  value: string
  source: 'value' | 'env_var'
}


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
