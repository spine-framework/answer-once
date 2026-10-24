// CIL[BEGIN stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the AuthConfirmPage React component for confirming email signup and password reset tokens."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies, the Supabase client, and shared UI components."]
// CIL[DOC-CONTEXT module="AuthConfirmPage" layer="pages/auth" related_files=".framework/src/components/ui/LoadingSpinner.tsx,.framework/src/lib/supabase.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Top-level module imports for the auth confirmation page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers maintaining auth flows"]
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import {
  clearPendingRegistration,
  finalizeRegistration,
  readPendingRegistration,
} from '../../lib/registration'
import { useBranding } from '../../hooks/useBranding'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the AuthConfirmPage React component for confirming email signup and password reset tokens.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:stage:type" type="type" identity="Stage" parent="~/.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-MACRO purpose="Union type describing the possible stages of the email and password confirmation flow."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the string literal stage values used by the AuthConfirmPage state machine."]
// CIL[DOC-CONTEXT module="AuthConfirmPage" layer="pages/auth" related_files=".framework/src/components/ui/LoadingSpinner.tsx,.framework/src/lib/supabase.ts,.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Stage union string literal" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Literal union type for the component's UI and verification state." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type Stage =
  | 'verifying'
  | 'signup_success'
  | 'set_password'
  | 'password_saved'
  | 'error'

// CIL[DOC-VECTOR type="context" content="purpose='Union type describing the possible stages of the email and password confirmation flow.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:stage:type"]
// CIL[BEGIN stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:authconfirmpage:function" type="function" identity="AuthConfirmPage" parent="~/.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-MACRO purpose="Render the authentication confirmation page and allow users to set a new password after a recovery flow."]
// CIL[DOC-RESPONSIBILITY responsibility="Verify the OTP token hash, display success or error UI, and handle the new password form submission."]
// CIL[DOC-CONTEXT module="AuthConfirmPage" layer="pages/auth" related_files=".framework/src/components/ui/LoadingSpinner.tsx,.framework/src/lib/supabase.ts,.framework/src/pages/auth/AuthConfirmPage.tsx"]
// CIL[DOC-CONTRACT inputs="token_hash and type URL query parameters" outputs="JSX for the verifying, error, signup success, set password, or password saved states" errors="Invalid or missing confirmation link, expired or invalid OTP, failed password update, mismatched or short passwords" side_effects="Calls supabase.auth.verifyOtp and supabase.auth.updateUser; navigates to / on success after a timeout"]
// CIL[DOC-MICRO logic_summary="Reads token_hash and type from the query string, verifies the OTP with Supabase, then renders a stage-based UI and processes password form submission with client-side validation." notable_decisions="['hash/implicit session fallback via getSession + PASSWORD_RECOVERY listener','resumes spine.pending_registration intent after signup confirm via finalizeRegistration + refreshUser']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="change" content="Batch4b: links with no token_hash fall back to supabase.auth.getSession (implicit/hash flow); successful signup confirms resume pending registration intent — non-invite runs authenticated complete-registration, invite just rebinds context"]
export function AuthConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const branding = useBranding()

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | string | null

  const [stage, setStage] = useState<Stage>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    // After a confirmed signup, resume the pending registration intent saved
    // in sessionStorage before the email round-trip (spine.pending_registration).
    // Invite intents need no server call — the stub was claimed by the
    // auth.users trigger when signUp ran.
    const finishSignup = async () => {
      const intent = readPendingRegistration()
      try {
        if (intent && !intent.invite && intent.path) {
          const result = await finalizeRegistration(intent)
          clearPendingRegistration()
          await refreshUser()
          if (cancelled) return
          setStage('signup_success')
          setTimeout(() => navigate(
            result.status === 'pending' ? '/auth/pending-approval' : '/',
            { replace: true }
          ), 1500)
          return
        }
        if (intent) clearPendingRegistration()
        await refreshUser()
        if (cancelled) return
        setStage('signup_success')
        setTimeout(() => navigate('/', { replace: true }), 1500)
      } catch {
        // Keep the intent — /register?resume=1 retries it and surfaces the
        // error. The signup itself is still confirmed.
        if (cancelled) return
        setStage('signup_success')
        setTimeout(() => navigate('/register?resume=1', { replace: true }), 1500)
      }
    }

    if (tokenHash && type) {
      ;(async () => {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        })

        if (error) {
          if (error.message.includes('expired') || error.message.includes('otp_expired')) {
            setErrorMessage('This link has expired. Links are valid for 1 hour.')
          } else if (error.message.includes('invalid')) {
            setErrorMessage('This link is invalid or has already been used.')
          } else {
            setErrorMessage(error.message)
          }
          setStage('error')
          return
        }

        if (type === 'recovery') {
          setStage('set_password')
        } else {
          void finishSignup()
        }
      })()
      return () => { cancelled = true }
    }

    // Hash/implicit callback: detectSessionInUrl consumes #access_token before
    // this page reads params, so a live session means the link verified.
    const hashType = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type')
    if (hashType === 'recovery') {
      setStage('set_password')
      return () => { cancelled = true }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) {
        setStage('set_password')
      }
    })

    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) {
        await finishSignup()
        return
      }
      setErrorMessage('Invalid or missing confirmation link. Please request a new one.')
      setStage('error')
    })()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordError(error.message)
        return
      }
      setStage('password_saved')
      setTimeout(() => navigate('/', { replace: true }), 1500)
    } finally {
      setIsSaving(false)
    }
  }

  if (stage === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-slate-600">Verifying your link...</p>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    const isExpired = errorMessage.includes('expired')
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Link problem</h1>
            <p className="text-slate-600">{errorMessage}</p>
          </div>
          <div className="space-y-3">
            {isExpired ? (
              <Link
                to="/forgot-password"
                className="block w-full py-2 px-4 rounded-[5px] bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 text-center"
              >
                Request a new link
              </Link>
            ) : null}
            <Link to="/login" className="block text-sm text-accent-blue hover:text-accent-blue-light">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'signup_success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Email confirmed!</h1>
          <p className="text-slate-600">Taking you to the app...</p>
          <LoadingSpinner className="w-5 h-5 mx-auto" />
        </div>
      </div>
    )
  }

  if (stage === 'password_saved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Password updated!</h1>
          <p className="text-slate-600">Taking you to the app...</p>
          <LoadingSpinner className="w-5 h-5 mx-auto" />
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
            Set a new password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Choose a strong password for your account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSetPassword}>
          {passwordError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{passwordError}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="Repeat your new password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-[5px] shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                'Save new password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the authentication confirmation page and allow users to set a new password after a recovery flow.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/auth/AuthConfirmPage.tsx:authconfirmpage:function"]
