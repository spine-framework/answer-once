// Never stores password or invite token; invite claim happens in the auth.users trigger at signUp, so invite intent only needs {invite:true}
// complete-registration is authenticated server-side (createHandler rejects anonymous). Email/role/account target are resolved from ctx.principal + installed app config — the client sends only app, path, account_name.

import { apiFetch } from './api'

// path is optional because invite intents ({invite:true}) need no server call
export interface PendingRegistrationIntent {
  app?: string
  path?: 'new_account' | 'existing_account' | 'join_request'
  account_name?: string
  invite?: boolean
}

export const PENDING_REGISTRATION_KEY = 'spine.pending_registration'

export class RegistrationError extends Error {
  serverResponded: boolean
  constructor(message: string, serverResponded: boolean) {
    super(message)
    this.name = 'RegistrationError'
    this.serverResponded = serverResponded
  }
}

// Must be called BEFORE complete-registration so a lost response can still resume
export function savePendingRegistration(intent: PendingRegistrationIntent): void {
  try {
    sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(intent))
  } catch {
    // sessionStorage may be unavailable (private mode, SSR); resume simply won't fire
  }
}

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

export function clearPendingRegistration(): void {
  try {
    sessionStorage.removeItem(PENDING_REGISTRATION_KEY)
  } catch {
    // ignore
  }
}

export interface CompleteRegistrationResult {
  status: 'active' | 'pending'
  account_slug?: string
  role_slug?: string
}

// Never forwards role_slug, email, target_account, or target_account_id — placement is server-resolved
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
