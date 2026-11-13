/**
 * @module   funnel
 * @audience internal
 * @layer    shared-core
 * @stability stable
 *
 * Generic typed-signal emission + account data-flag reads
 *
 * @seeAlso db (provides database access for signal insertion).
 * @seeAlso trigger-engine (handles the creation of triggers based on emitted signals).
 * @seeAlso middleware (defines the core context used in signal processing).
 *
 * @cil-generated
 */

import { adminDb } from './db'
import type { CoreContext } from './middleware'
import { fireCreateTriggers } from './trigger-engine'

// dedupe_scope is stamped after ...data so the stored value can never disagree with the lookup key
/**
 * SignalInput describes a typed signal emission request: which item type to
 * write under, which action name to record, and whether to dedupe per account.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export type SignalInput = {
  /** Item type slug (kind='item') the signal is written under. */
  type_slug: string
  /** Caller-defined action name, recorded as data.action_type. */
  action: string
  /** Extra payload merged into the item's data. */
  data?: Record<string, any>
  /** When true (default), skip the write if this account already recorded the same action. */
  dedupe?: boolean
  /**
   * Optional dedupe scope. When set, the dedupe lookup additionally matches
   * data->>dedupe_scope and the inserted row carries the value — e.g. one
   * milestone per demo run instead of once per account.
   */
  dedupe_scope?: string
}

/**
 * Records a caller-defined action as a signal item under the declared type, ensuring that milestones are only recorded once per account by default to prevent inflation of verified states. This function is designed to never throw, maintaining the integrity of the product path.
 *
 * @inputSpec
 *   - ctx: CoreContext (required) — the context containing account information.
 *   - opts: SignalInput (required) — type_slug, action, optional data and dedupe flag.
 * @outputSpec  Promise<any | null> — resolves to the created signal item or null if no action was taken.
 * @sideEffects Writes to the database and triggers external event dispatch.
 * @stability   stable
 * @calls       adminDb.from('types'), adminDb.from('items'), fireCreateTriggers
 * @errorHandling logs warnings on insert and trigger dispatch failures without throwing
 * @cil-generated
 */
/**
 * Record a caller-defined action as a signal item under the declared type.
 * Signals are once-per-account by default: if this account already recorded
 * the same action_type the call is a no-op, so "verified" states can't be
 * inflated by retries. Never throws — a signal write must never break the
 * product path.
 */
// Signal items must be stamped with the type's design_schema/validation_schema (and created_by for human principals) — records without stamped schemas fail admin-data's 'No permissions defined' gate. Found as a fresh-install defect: demo_signal items were created unstamped.
export async function emitSignal(
  ctx: CoreContext,
  opts: SignalInput
): Promise<any | null> {
  const { type_slug, action, data = {}, dedupe = true, dedupe_scope } = opts
  try {
    const { data: typeRow } = await adminDb
      .from('types').select('id, design_schema, validation_schema').eq('kind', 'item').eq('slug', type_slug).maybeSingle()
    if (!typeRow?.id) return null

    if (dedupe) {
      let existingQ = adminDb
        .from('items').select('id')
        .eq('type_id', typeRow.id)
        .eq('account_id', ctx.accountId)
        .eq('data->>action_type', action)
      if (dedupe_scope !== undefined) {
        existingQ = existingQ.eq('data->>dedupe_scope', dedupe_scope)
      }
      const { data: existing } = await existingQ.limit(1)
      if (existing?.length) return null
    }

    const { data: created, error } = await adminDb
      .from('items')
      .insert({
        type_id: typeRow.id,
        account_id: ctx.accountId,
        title: `${action} — ${new Date().toISOString().slice(0, 10)}`,
        status: 'active',
        // Stamp the type's schemas like admin-data does — unstamped items hit
        // the 'No permissions defined' gate when surfaced through admin-data.
        design_schema: typeRow.design_schema || {},
        validation_schema: typeRow.validation_schema || {},
        created_by: ctx.principal?.type === 'human' ? ctx.principal.id : null,
        data: {
          action_type: action,
          action_value: 1,
          occurred_at: new Date().toISOString(),
          source: data.source || 'app',
          ...data,
          // Stamped after ...data so the stored scope always matches the
          // dedupe lookup key — a caller-supplied data.dedupe_scope can never
          // disagree with it.
          ...(dedupe_scope !== undefined ? { dedupe_scope } : {}),
        },
      })
      .select('*')
      .single()
    if (error) {
      console.warn(`emitSignal(${type_slug}/${action}) insert failed:`, error.message)
      return null
    }
    // Signals are inserted via adminDb which bypasses admin-data's trigger
    // dispatch — fire item_created explicitly so signal consumers (e.g. app
    // pipelines wired to the signal type) see the event.
    fireCreateTriggers('items', created.id, created, ctx).catch(err =>
      console.warn(`emitSignal(${type_slug}/${action}) trigger dispatch failed:`, err?.message)
    )
    return created
  } catch (err: any) {
    console.warn(`emitSignal(${type_slug}/${action}) failed:`, err?.message)
    return null
  }
}

/**
 * Reads a caller-named boolean flag off the account's data bag.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — the context containing the account ID to check.
 *   flag: string (required) — the data key to read.
 * @outputSpec  Promise<boolean> — resolves to true if the flag is set, otherwise false.
 * @sideEffects Makes a call to the database to retrieve account data.
 * @stability   stable
 * @calls       adminDb.from('accounts')
 * @cil-generated
 */
/** True when accounts.data[flag] === true for the context account. */
export async function accountDataFlag(ctx: CoreContext, flag: string): Promise<boolean> {
  try {
    const { data } = await adminDb
      .from('accounts').select('data').eq('id', ctx.accountId).maybeSingle()
    return data?.data?.[flag] === true
  } catch {
    return false
  }
}
