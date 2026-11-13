
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { apiFetch } from '../../lib/api'
import { resolvePostAuthPath } from '../../lib/app-mount'
import {
  clearPendingRegistration,
  finalizeRegistration,
  readPendingRegistration,
  savePendingRegistration,
  RegistrationError,
  PendingRegistrationIntent,
} from '../../lib/registration'
import { TurnstileWidget, turnstileEnabled } from '../../components/auth/TurnstileWidget'
import { useBranding } from '../../hooks/useBranding'
type UseType = 'personal' | 'company'
type DomainMatchChoice = 'join' | 'create_new' | null

interface InvitePreview {
  email: string
  full_name: string | null
  account_name: string | null
  role_name: string | null
  kind: string
}


interface RegistrationConfig {
  default_app: string
  default_role: string
  allow_url_override: boolean
  default_app_by_role?: Record<string, string>
  apps: Record<string, {
    roles: string[]
    default_role: string
    path: string
    enabled: boolean
    account_strategy: 'existing' | 'new' | 'choice'
    target_account?: string
    /** When true, company-domain matches may be offered a join_request.
        Server-side, join_request only succeeds when this flag is set — the
        client must hide the join choice otherwise. */
    allow_domain_join?: boolean
    /** Account slug that parents accounts created via the 'new' strategy.
        Resolved server-side; shown here only for completeness. */
    parent_account?: string
    /** When true, skip the personal/company choice and company-name field —
        the workspace is auto-named from the user's name/email. */
    default_workspace_name?: boolean
  }>
}

// POST calls go through apiFetch so the session Bearer token is attached — complete-registration is authenticated server-side; public GET actions (check-first-user, check-domain, validate-token) stay on raw fetch
// complete-registration rejects anonymous callers; only GET actions remain unauthenticated
async function callInvitesApi(action: string, params: Record<string, any> = {}, method: 'GET' | 'POST' = 'GET') {
  const base = '/.netlify/functions/invites'
  if (method === 'GET') {
    const qs = new URLSearchParams({ action, ...params }).toString()
    const res = await fetch(`${base}?${qs}`)
    return res.json()
  }
  const res = await apiFetch(`${base}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json()
}

async function loadRegistrationConfig(): Promise<RegistrationConfig | null> {
  try {
    const res = await fetch('/spine.config.json')
    if (!res.ok) return null
    const config = await res.json()
    return config.registration ?? null
  } catch {
    return null
  }
}

async function checkFirstUser(): Promise<boolean> {
  try {
    const result = await callInvitesApi('check-first-user')
    return result.data?.is_first_user ?? false
  } catch {
    return false
  }
}

function getPostRegistrationRedirect(
  config: RegistrationConfig | null,
  searchParams: URLSearchParams,
  isInvite: boolean,
  effectiveRole?: string,
  inviteAccountId?: string
): string {
  if (isInvite) {
    return { path: '/', appSlug: null }
  }

  if (config?.allow_url_override) {
    const appOverride = searchParams.get('app')
    if (appOverride && config.apps[appOverride]?.enabled) {
      return { path: config.apps[appOverride].path, appSlug: appOverride }
    }
  }

  const roleForRedirect = effectiveRole || searchParams.get('role') || config?.default_role
  if (roleForRedirect && config?.default_app_by_role?.[roleForRedirect]) {
    const roleBasedApp = config.default_app_by_role[roleForRedirect]
    if (config.apps[roleBasedApp]?.enabled) {
      return { path: config.apps[roleBasedApp].path, appSlug: roleBasedApp }
    }
  }

  if (config?.default_app && config.apps[config.default_app]?.enabled) {
    return { path: config.apps[config.default_app].path, appSlug: config.default_app }
  }

  return { path: '/', appSlug: null }
}

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, refreshUser, logout } = useAuth()
  const branding = useBranding()
  const inviteToken = searchParams.get('t')
  const resumeRequested = searchParams.get('resume') === '1'

  const [regConfig, setRegConfig] = useState<RegistrationConfig | null>(null)
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null)

  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [tokenLoading, setTokenLoading] = useState(!!inviteToken)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')

  const [useType, setUseType] = useState<UseType>('personal')
  const [domainMatchAccountId, setDomainMatchAccountId] = useState<string | null>(null)
  const [domainMatchChoice, setDomainMatchChoice] = useState<DomainMatchChoice>(null)
  const [domainCheckLoading, setDomainCheckLoading] = useState(false)

  const [accountStrategy, setAccountStrategy] = useState<'existing' | 'new'>('new')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Batch4b: confirmation-pending and resume-mode state
  const [confirmationPending, setConfirmationPending] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [resumeError, setResumeError] = useState('')
  const [resumeAttempt, setResumeAttempt] = useState(0)
  const resumeRanRef = useRef(false)

  // Resolve which app/policy governs this registration (shared by submit and
  // the domain-join gate). Role is a client hint only — the server assigns.
  const resolveRegistrationContext = useCallback(() => {
    const urlRole = searchParams.get('role')
    const urlApp = searchParams.get('app')
    const effectiveRole = urlRole || regConfig?.default_role || 'member'
    const effectiveApp =
      urlApp || regConfig?.default_app_by_role?.[effectiveRole] || regConfig?.default_app
    const appConfig = effectiveApp ? regConfig?.apps[effectiveApp] : undefined
    const accountStrategy = appConfig?.account_strategy ?? 'new'
    // join_request only succeeds server-side when allow_domain_join is set;
    // 'choice' strategy implies the same choice UI is permitted.
    const domainJoinAllowed =
      accountStrategy === 'choice' || appConfig?.allow_domain_join === true
    return { effectiveRole, effectiveApp, appConfig, accountStrategy, domainJoinAllowed }
  }, [regConfig, searchParams])

  useEffect(() => {
    ;(async () => {
      const [config, firstUserCheck] = await Promise.all([
        loadRegistrationConfig(),
        checkFirstUser(),
      ])
      setRegConfig(config)
      setIsFirstUser(firstUserCheck)
    })()
  }, [])

  // Batch4b resume mode: an authenticated-but-unplaced user (no account_id)
  // is sent here via /register?resume=1 (see App.tsx). If a pending intent was
  // stored before the confirm-email round-trip, re-run complete-registration
  // with it; otherwise finish with a minimal default intent so the user is
  // never stranded on a dead page.
  const isUnplacedUser = !!user && !user.account_id
  useEffect(() => {
    if (!isUnplacedUser || resumeRanRef.current || isLoading || resuming) return
    if (isFirstUser === null) return // wait for config + first-user probe
    if (error || resumeError) return // a submit/resume error is already on screen

    // Unplaced users can't use the signup form (their auth user already
    // exists), so resume always fires — with the stored intent, or a minimal
    // derived default when none was saved (e.g. confirmed in another browser).
    const intent = readPendingRegistration()

    if (intent?.invite) {
      // Invite stub was already claimed by the auth.users trigger at signUp —
      // confirmation only activated the session. Rebind context and land.
      resumeRanRef.current = true
      setResuming(true)
      ;(async () => {
        clearPendingRegistration()
        await refreshUser()
        navigate('/', { replace: true })
      })()
      return
    }

    const effectiveIntent: PendingRegistrationIntent = intent ?? {
      app: regConfig?.default_app,
      path: 'new_account',
      account_name: user?.full_name || user?.email?.split('@')[0],
      invite: false,
    }
    if (!effectiveIntent.path) {
      resumeRanRef.current = true
      setResumeError('Saved registration details are incomplete. Please contact support or sign out and register again.')
      return
    }

    resumeRanRef.current = true
    setResuming(true)
    ;(async () => {
      try {
        const result = await finalizeRegistration(effectiveIntent)
        clearPendingRegistration()
        if (result.status === 'pending') {
          navigate('/auth/pending-approval', { replace: true })
          return
        }
        await refreshUser()
        {
          const { path, appSlug } = getPostRegistrationRedirect(regConfig, searchParams, false, result.role_slug)
          navigate(await resolvePostAuthPath(appSlug, path), { replace: true })
        }
      } catch (err: any) {
        // Definitive server rejections clear the intent (retrying would fail
        // identically); transient network errors keep it for the next attempt.
        if (!(err instanceof RegistrationError) || err.serverResponded) {
          clearPendingRegistration()
        }
        setResuming(false)
        setResumeError(err?.message || 'Could not finish your registration.')
      }
    })()
  }, [isUnplacedUser, isFirstUser, isLoading, resuming, resumeRequested, resumeAttempt, error, resumeError, regConfig, user, refreshUser, navigate, searchParams])

  useEffect(() => {
    if (!inviteToken) return
    ;(async () => {
      setTokenLoading(true)
      const result = await callInvitesApi('validate-token', { token: inviteToken })
      setTokenLoading(false)
      if (result.error) {
        setTokenError(result.error)
      } else {
        setInvitePreview(result.data)
        setEmail(result.data.email)
        if (result.data.full_name) setFullName(result.data.full_name)
      }
    })()
  }, [inviteToken])

  const handleEmailBlur = useCallback(async () => {
    // Batch4b: domain-join probing only runs when the resolved app policy
    // allows it (account_strategy 'choice' or allow_domain_join).
    if (!email || !email.includes('@') || inviteToken || useType === 'personal' || isFirstUser) return
    if (!resolveRegistrationContext().domainJoinAllowed) return

    setDomainCheckLoading(true)
    setDomainMatchAccountId(null)
    setDomainMatchChoice(null)

    const result = await callInvitesApi('check-domain', { email })
    setDomainCheckLoading(false)

    if (result.data?.match) {
      setDomainMatchAccountId(result.data.account_id || '__matched__')
    }
  }, [email, inviteToken, useType, isFirstUser, resolveRegistrationContext])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isFirstUser && !inviteToken && !regConfig) {
      setError('Registration configuration not loaded. Please refresh and try again.')
      return
    }

    setIsLoading(true)

    try {
      // Resolve the registration intent up-front so it can be persisted BEFORE
      // any placement call — a lost response must be resumable. The server
      // binds email/role/account from ctx.principal + installed app config;
      // the client sends only {app, path, account_name}.
      const { effectiveApp, accountStrategy, domainJoinAllowed } = resolveRegistrationContext()

      const accountName = useType === 'company'
        ? (companyName || fullName || email.split('@')[0])
        : (fullName || email.split('@')[0])

      let registrationPath: PendingRegistrationIntent['path'] = 'new_account'
      if (accountStrategy === 'existing') {
        registrationPath = 'existing_account'
      } else if (domainJoinAllowed && domainMatchAccountId && domainMatchChoice === 'join') {
        registrationPath = 'join_request'
      }

      const pendingIntent: PendingRegistrationIntent = inviteToken
        ? { invite: true } // claim happens in the auth.users trigger at signUp
        : { app: effectiveApp, path: registrationPath, account_name: accountName, invite: false }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitePreview?.email ?? email,
        password,
        options: {
          // invite_token is required server-side to claim the invite stub
          data: {
            full_name: fullName,
            // brand stamps auth.users.user_metadata so GoTrue email templates
            // can branch per brand via {{ .Data.brand }} (subject and body).
            ...(branding.slug ? { brand: branding.slug } : {}),
            ...(inviteToken ? { invite_token: inviteToken } : {}),
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          captchaToken: captchaToken ?? undefined,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Email-confirmation flow: no session yet. Persist the non-secret
      // intent and show a check-your-email state; AuthConfirmPage resumes it.
      if (!signUpData.session) {
        savePendingRegistration(pendingIntent)
        setConfirmationPending(true)
        return
      }

      if (isFirstUser) {
        const freshUser = await refreshUser()
        // Only trust the server-confirmed role — another browser may have won
        // the bootstrap race, in which case land them in their resolved app.
        const confirmedAdmin =
          freshUser?.is_system_admin === true ||
          (freshUser?.roles ?? []).includes('system_admin')
        const { path, appSlug } = getPostRegistrationRedirect(regConfig, searchParams, false, freshUser?.roles?.[0])
        navigate(
          confirmedAdmin
            ? '/spine-framework/admin'
            : await resolvePostAuthPath(appSlug, path),
          { replace: true }
        )
        return
      }

      if (inviteToken) {
        // Claim already happened at signUp; just rebind context and land.
        clearPendingRegistration()
        await refreshUser()
        navigate('/', { replace: true })
        return
      }

      savePendingRegistration(pendingIntent)

      try {
        const result = await finalizeRegistration(pendingIntent)
        clearPendingRegistration()

        if (result.status === 'pending') {
          navigate('/auth/pending-approval', { replace: true })
          return
        }

        await refreshUser()
        // Server-truth role decides the landing path — never the client guess.
        {
          const { path, appSlug } = getPostRegistrationRedirect(regConfig, searchParams, false, result.role_slug)
          navigate(await resolvePostAuthPath(appSlug, path), { replace: true })
        }
      } catch (err: any) {
        if (!(err instanceof RegistrationError) || err.serverResponded) {
          clearPendingRegistration()
        }
        setError(err?.message || 'Registration failed')
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const isInvite = !!inviteToken && !tokenError
  const requestedApp = searchParams.get('app') || regConfig?.default_app
  const hideWorkspaceStep = !isInvite && !isFirstUser &&
    !!requestedApp && regConfig?.apps[requestedApp]?.default_workspace_name === true
  const showPersonalCompanyToggle = !isInvite && !isFirstUser && !hideWorkspaceStep
  const showCompanyName = showPersonalCompanyToggle && useType === 'company'
  // Batch4b: domain-join UI only when the resolved app policy allows it —
  // server rejects join_request without allow_domain_join.
  const domainJoinAllowed = resolveRegistrationContext().domainJoinAllowed
  const showDomainMatchChoice = !!domainMatchAccountId && !isInvite && !isFirstUser && domainJoinAllowed

  // Resume-in-progress: authenticated unplaced user finishing placement.
  if (resuming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Finishing your registration...</p>
        </div>
      </div>
    )
  }

  if (resumeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Registration problem</h1>
            <p className="text-slate-600">{resumeError}</p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                resumeRanRef.current = false
                setResumeError('')
                setResumeAttempt(n => n + 1)
              }}
              className="block w-full py-2 px-4 rounded-[5px] bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            >
              Try again
            </button>
            {/* Authenticated unplaced users can't reach /login — App routes
                them back here — so offer a real sign-out escape hatch. */}
            {isUnplacedUser ? (
              <button
                type="button"
                onClick={() => logout()}
                className="block w-full text-sm text-accent-blue hover:text-accent-blue-light"
              >
                Sign out
              </button>
            ) : (
              <Link to="/login" className="block text-sm text-accent-blue hover:text-accent-blue-light">
                Back to sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Confirmation-enabled signup: no session was returned, so the user must
  // confirm their email. The non-secret pending intent is already in
  // sessionStorage — AuthConfirmPage resumes it after verification.
  if (confirmationPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
            <p className="text-slate-600">
              We sent a confirmation link to{' '}
              <span className="font-medium">{invitePreview?.email ?? email}</span>.
              Click it to activate your account — we'll finish setting things up
              automatically.
            </p>
          </div>
          <Link to="/login" className="block text-sm text-accent-blue hover:text-accent-blue-light">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  // Never swap to the loading state while a submit is in flight.
  if (!isLoading && (tokenLoading || isFirstUser === null || (!isFirstUser && !isInvite && !regConfig))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading registration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center">
            <img src={branding.logo_url} alt={branding.app_name} className="h-14 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {isInvite ? 'Complete your registration' : 'Create your account'}
          </h2>
          {isInvite && (
            <p className="mt-2 text-center text-sm text-slate-600">
              You've been invited to join{' '}
              {invitePreview?.account_name && (
                <span className="font-medium">{invitePreview.account_name}</span>
              )}
            </p>
          )}
        </div>

        {tokenError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              Invalid or expired invitation link.{' '}
              <Link to="/register" className="font-medium text-accent-blue hover:text-accent-blue-light">
                Start a new registration
              </Link>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="Enter your full name"
                disabled={isInvite}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="Enter your email"
                disabled={isInvite}
              />
              {domainCheckLoading && (
                <p className="mt-1 text-sm text-slate-500">Checking domain...</p>
              )}
            </div>

            {showCompanyName && (
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-slate-700">
                  Company name
                </label>
                <input
                  id="company-name"
                  name="company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                  placeholder="Enter your company name"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="Create a password"
              />
            </div>
          </div>

          {showPersonalCompanyToggle && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="use-type"
                    value="personal"
                    checked={useType === 'personal'}
                    onChange={(e) => setUseType(e.target.value as UseType)}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300"
                  />
                  <span className="ml-2 text-sm text-slate-700">Personal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="use-type"
                    value="company"
                    checked={useType === 'company'}
                    onChange={(e) => setUseType(e.target.value as UseType)}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300"
                  />
                  <span className="ml-2 text-sm text-slate-700">Company</span>
                </label>
              </div>
            </div>
          )}

          {showDomainMatchChoice && (
            <div className="rounded-md bg-amber-50 p-4">
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-2">We found an existing account for your domain.</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="domain-choice"
                      value="join"
                      checked={domainMatchChoice === 'join'}
                      onChange={(e) => setDomainMatchChoice(e.target.value as DomainMatchChoice)}
                      className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300"
                    />
                    <span className="ml-2 text-sm text-amber-800">Join existing account</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="domain-choice"
                      value="create_new"
                      checked={domainMatchChoice === 'create_new'}
                      onChange={(e) => setDomainMatchChoice(e.target.value as DomainMatchChoice)}
                      className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300"
                    />
                    <span className="ml-2 text-sm text-amber-800">Create new account</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <TurnstileWidget onToken={setCaptchaToken} />

          <div>
            <button
              type="submit"
              disabled={isLoading || (showDomainMatchChoice && !domainMatchChoice) || (turnstileEnabled && !captchaToken)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-[5px] shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-accent-blue hover:text-accent-blue-light">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}