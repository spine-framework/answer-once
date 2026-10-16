// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Client helpers for resumable registration completion"]
// CIL[DOC-RESPONSIBILITY responsibility="Persist non-secret pending registration intent in sessionStorage and finalize registration through the authenticated invites API"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-CONTRACT inputs="module imports" outputs="pending-intent storage helpers, RegistrationError, finalizeRegistration" errors="none" side_effects="reads/writes sessionStorage"]
// CIL[DOC-MICRO logic_summary="Exports spine.pending_registration sessionStorage helpers plus finalizeRegistration, which POSTs {app, path, account_name} to invites?action=complete-registration via apiFetch (Bearer session) and returns the server-truth {status, account_slug, role_slug}" notable_decisions="Never stores password or invite token; invite claim happens in the auth.users trigger at signUp, so invite intent only needs {invite:true}"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="framework developers"]
// CIL[DOC-NOTE type="contract" content="complete-registration is authenticated server-side (createHandler rejects anonymous). Email/role/account target are resolved from ctx.principal + installed app config — the client sends only app, path, account_name."]

import { apiFetch } from './api'
// CIL[END stable_id="~/.framework/src/lib/registration.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:pendingregistrationintent:interface" type="interface" identity="PendingRegistrationIntent" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Describe the resumable registration intent persisted across email confirmation"]
// CIL[DOC-RESPONSIBILITY responsibility="Type for the non-secret pending registration payload stored in sessionStorage"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="PendingRegistrationIntent object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="{app, path, account_name, invite} — no password, email, or invite token" notable_decisions="path is optional because invite intents ({invite:true}) need no server call"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface PendingRegistrationIntent {
  app?: string
  path?: 'new_account' | 'existing_account' | 'join_request'
  account_name?: string
  invite?: boolean
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:pendingregistrationintent:interface"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:pending_registration_key:constant" type="constant" identity="PENDING_REGISTRATION_KEY" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="sessionStorage key for the pending registration intent"]
// CIL[DOC-RESPONSIBILITY responsibility="Single source for the 'spine.pending_registration' storage key"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant string 'spine.pending_registration'" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export const PENDING_REGISTRATION_KEY = 'spine.pending_registration'
// CIL[END stable_id="~/.framework/src/lib/registration.ts:pending_registration_key:constant"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:registrationerror:class" type="class" identity="RegistrationError" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Error type distinguishing definitive server rejections from transient network failures"]
// CIL[DOC-RESPONSIBILITY responsibility="Carry a serverResponded flag so callers know whether a stored intent should be cleared (definitive) or kept for retry (transient)"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="message, serverResponded" outputs="Error subclass" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extends Error with a serverResponded boolean" notable_decisions="serverResponded=true whenever the invites API returned a response (error body or non-OK status); false only for fetch-level/network failures"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export class RegistrationError extends Error {
  serverResponded: boolean
  constructor(message: string, serverResponded: boolean) {
    super(message)
    this.name = 'RegistrationError'
    this.serverResponded = serverResponded
  }
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:registrationerror:class"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:savependingregistration:function" type="function" identity="savePendingRegistration" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Persist the pending registration intent so a confirmation round-trip can resume it"]
// CIL[DOC-RESPONSIBILITY responsibility="Write the intent JSON to sessionStorage under spine.pending_registration"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="intent: PendingRegistrationIntent" outputs="void" errors="storage exceptions swallowed" side_effects="sessionStorage write"]
// CIL[DOC-MICRO logic_summary="JSON.stringify intent into sessionStorage, swallowing storage errors" notable_decisions="Must be called BEFORE complete-registration so a lost response can still resume"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function savePendingRegistration(intent: PendingRegistrationIntent): void {
  try {
    sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(intent))
  } catch {
    // sessionStorage may be unavailable (private mode, SSR); resume simply won't fire
  }
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:savependingregistration:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:readpendingregistration:function" type="function" identity="readPendingRegistration" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Read the persisted pending registration intent"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse and return the sessionStorage intent, or null when absent/corrupt"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="PendingRegistrationIntent | null" errors="parse/storage errors return null" side_effects="sessionStorage read"]
// CIL[DOC-MICRO logic_summary="JSON.parse the stored value; validates it is a plain object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function readPendingRegistration(): PendingRegistrationIntent | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as PendingRegistrationIntent
  } catch {
    return null
  }
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:readpendingregistration:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:clearpendingregistration:function" type="function" identity="clearPendingRegistration" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Remove the persisted pending registration intent"]
// CIL[DOC-RESPONSIBILITY responsibility="Delete spine.pending_registration from sessionStorage on success or definitive failure"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="void" errors="storage exceptions swallowed" side_effects="sessionStorage removeItem"]
// CIL[DOC-MICRO logic_summary="removeItem wrapped in try/catch" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function clearPendingRegistration(): void {
  try {
    sessionStorage.removeItem(PENDING_REGISTRATION_KEY)
  } catch {
    // ignore
  }
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:clearpendingregistration:function"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:completeregistrationresult:interface" type="interface" identity="CompleteRegistrationResult" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Normalized result returned by the authenticated complete-registration endpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="Type for {status, account_slug, role_slug} — server-truth placement and role"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CompleteRegistrationResult object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="status 'active'|'pending'; role_slug is the server-assigned role (never trust the client guess)" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface CompleteRegistrationResult {
  status: 'active' | 'pending'
  account_slug?: string
  role_slug?: string
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:completeregistrationresult:interface"]

// CIL[BEGIN stable_id="~/.framework/src/lib/registration.ts:finalizeregistration:function" type="function" identity="finalizeRegistration" parent="~/.framework/src/lib/registration.ts"]
// CIL[DOC-MACRO purpose="Complete registration through the authenticated invites endpoint"]
// CIL[DOC-RESPONSIBILITY responsibility="POST {app, path, account_name} to invites?action=complete-registration via apiFetch and normalize the response"]
// CIL[DOC-CONTEXT module="framework-api" layer="lib" related_files=".framework/src/lib/api.ts,.framework/src/lib/registration.ts"]
// CIL[DOC-CONTRACT inputs="intent: PendingRegistrationIntent (path required; invite intents rejected)" outputs="Promise<CompleteRegistrationResult>" errors="RegistrationError — serverResponded=true for {error} bodies and non-OK responses, false for network failures" side_effects="authenticated HTTP POST to /.netlify/functions/invites"]
// CIL[DOC-MICRO logic_summary="Sends only {app, path, account_name}; the server binds email/role/account from ctx.principal and installed app config" notable_decisions="Never forwards role_slug, email, target_account, or target_account_id — placement is server-resolved"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export async function finalizeRegistration(
  intent: PendingRegistrationIntent
): Promise<CompleteRegistrationResult> {
  if (intent.invite || !intent.path) {
    // Invite claims happen in the auth.users trigger at signUp time — there is
    // nothing for complete-registration to do.
    throw new RegistrationError('No registration action to complete for this intent', true)
  }

  let res: Response
  try {
    res = await apiFetch('/.netlify/functions/invites?action=complete-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app: intent.app,
        path: intent.path,
        account_name: intent.account_name,
      }),
    })
  } catch (err: any) {
    throw new RegistrationError(err?.message || 'Network error completing registration', false)
  }

  const json = await res.json().catch(() => null)

  if (json?.error) {
    throw new RegistrationError(String(json.error), true)
  }
  if (!res.ok) {
    throw new RegistrationError(
      json?.message || `Registration failed (HTTP ${res.status})`,
      true
    )
  }

  const data = json?.data ?? json ?? {}
  return {
    status: data.status === 'pending' ? 'pending' : 'active',
    account_slug: data.account_slug,
    role_slug: data.role_slug,
  }
}
// CIL[END stable_id="~/.framework/src/lib/registration.ts:finalizeregistration:function"]
