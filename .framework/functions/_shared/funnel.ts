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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/funnel.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/funnel.ts"]
// CIL[DOC-MACRO purpose="Generic typed-signal emission for app-defined journey milestones plus account data-flag reads"]
// CIL[DOC-RESPONSIBILITY responsibility="Write signal items under a caller-declared type_slug for journey events (demo_started, workflow_completed, install_attempted, install_verified, feedback_submitted, escalation/completion signals, etc.)"]
// CIL[DOC-CONTEXT module="funnel" layer="shared-core" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-CONTRACT inputs="ctx, SignalInput {type_slug, action, data?, dedupe?, dedupe_scope?}" outputs="created item or null on skip" errors="never throws — failures are logged and swallowed" side_effects="items insert"]
// CIL[DOC-MICRO logic_summary="Resolve the declared item type once per call, dedupe on (account_id, action_type) or (account_id, action_type, dedupe_scope) when a scope is provided, insert the signal" notable_decisions="Milestones are once-per-account by default; dedupe_scope narrows dedupe to one-per-run; dedupe:false disables it entirely"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { adminDb } from './db'
import type { CoreContext } from './middleware'
import { fireCreateTriggers } from './trigger-engine'
// CIL[END stable_id="~/.framework/functions/_shared/funnel.ts:module_header:module_header"]

// CIL[DOC-MACRO purpose="SignalInput defines the typed request shape for emitSignal: which item type slug to write under, which action name to record, and the dedupe policy."]
// CIL[DOC-RESPONSIBILITY responsibility="SignalInput defines the typed request shape for emitSignal. It lets each caller namespace its own signal item type (e.g. funnel_signal, demo_signal) and choose per-account or run-scoped deduplication."]
// CIL[DOC-CONTEXT module="funnel" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/middleware,.framework/functions/_shared/trigger-engine"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="SignalInput is a plain options object: type_slug selects the item type, action is stored as data.action_type, data merges into the row, dedupe toggles deduplication, dedupe_scope narrows the dedupe key to data->>dedupe_scope." notable_decisions="dedupe_scope is stamped after ...data so the stored value can never disagree with the lookup key"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * SignalInput describes a typed signal emission request: which item type to
 * write under, which action name to record, and whether to dedupe per account.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/funnel.ts:SignalInput:type" type="type" identity="SignalInput" parent="~/.framework/functions/_shared/funnel.ts"]
// CIL[DOC-MACRO purpose="SignalInput type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the SignalInput type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/funnel.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the SignalInput type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/funnel.ts:SignalInput:type"]
// CIL[DOC-VECTOR type="context" content="purpose='SignalInput defines the typed request shape for emitSignal: item type slug, action name, data, and dedupe policy.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="Consumed by emitSignal and every caller emitting typed signals (demo triage/case-analysis/journey, ai-interactions)" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="dedupe_scope, when present, must equal data->>dedupe_scope on the inserted row so later lookups dedupe correctly" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Records a caller-defined action as a signal item under the declared type, ensuring that milestones are only recorded once per account (or per dedupe_scope) to prevent inflation of verified states."]
// CIL[DOC-RESPONSIBILITY responsibility="Records a caller-defined action as a signal item under the declared type_slug, ensuring that milestones are only recorded once per account by default to prevent inflation of verified states. This function is designed to never throw, maintaining the integrity of the product path."]
// CIL[DOC-CONTEXT module="funnel" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/middleware,.framework/functions/_shared/trigger-engine"]
// CIL[DOC-CONTRACT inputs="- ctx: CoreContext (required) — the context containing account information.\n- opts: SignalInput (required) — type_slug, action, optional data, dedupe flag, and dedupe_scope." outputs="Promise<any | null> — resolves to the created signal item or null if no action was taken." errors="none" side_effects="Writes to the database and triggers external event dispatch." dependencies="adminDb.from('types'), adminDb.from('items'), fireCreateTriggers"]
// CIL[DOC-MICRO logic_summary="Resolve the caller-declared type_slug to an item type; if dedupe is on, look up an existing item for (type_id, account_id, action_type) — additionally matching data->>dedupe_scope when provided — and return null on a hit; otherwise insert the signal item with dedupe_scope stamped into data after ...data so the stored key always matches the lookup." notable_decisions="logs warnings on insert and trigger dispatch failures without throwing; dedupe_scope is stamped post-spread so a caller-supplied data.dedupe_scope cannot disagree with the lookup key"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/funnel.ts:emitSignal:function" type="function" identity="emitSignal" parent="~/.framework/functions/_shared/funnel.ts"]
// CIL[DOC-MACRO purpose="emitSignal function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the emitSignal function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/funnel.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the emitSignal function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="invariant" content="Signal items must be stamped with the type's design_schema/validation_schema (and created_by for human principals) — records without stamped schemas fail admin-data's 'No permissions defined' gate. Found as a fresh-install defect: demo_signal items were created unstamped."]
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
// CIL[END stable_id="~/.framework/functions/_shared/funnel.ts:emitSignal:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Records a caller-defined action as a signal item under the declared type_slug, deduped once per account by default or once per dedupe_scope when provided.'; Called by demo triage/case-analysis/journey functions and ai-interactions submitFeedback" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="Callers: custom_demo-triage (escalation signals), custom_demo-case-analysis (completion signals), custom_demo-journey (milestone signals), ai-interactions submitFeedback (funnel_signal)" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Never throws — a signal write must never break the product path; dedupe_scope must match data->>dedupe_scope on the stored row" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Reads a caller-named boolean flag off the account's data bag."]
// CIL[DOC-RESPONSIBILITY responsibility="Reads accounts.data[flag] for the context account and reports whether it is strictly true. Generic replacement for single-purpose flag helpers — callers supply the data key."]
// CIL[DOC-CONTEXT module="funnel" layer="app-specific" related_files=".framework/functions/_shared/db,.framework/functions/_shared/middleware,.framework/functions/_shared/trigger-engine"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext (required) — the context containing the account ID to check; flag: string (required) — the data key to read." outputs="Promise<boolean> — resolves to true if the flag is set, otherwise false." errors="none" side_effects="Makes a call to the database to retrieve account data." dependencies="adminDb.from('accounts')"]
// CIL[DOC-MICRO logic_summary="Select accounts.data for ctx.accountId and return data[flag] === true; any read failure resolves to false." notable_decisions="strict === true check keeps truthy-but-non-boolean values from masquerading as flags"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/funnel.ts:accountDataFlag:function" type="function" identity="accountDataFlag" parent="~/.framework/functions/_shared/funnel.ts"]
// CIL[DOC-MACRO purpose="accountDataFlag function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the accountDataFlag function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/funnel.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the accountDataFlag function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function accountDataFlag(ctx: CoreContext, flag: string): Promise<boolean> {
  try {
    const { data } = await adminDb
      .from('accounts').select('data').eq('id', ctx.accountId).maybeSingle()
    return data?.data?.[flag] === true
  } catch {
    return false
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/funnel.ts:accountDataFlag:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Reads accounts.data[flag] for the context account and reports whether it is strictly true.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Returns false on any read failure — never throws" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
