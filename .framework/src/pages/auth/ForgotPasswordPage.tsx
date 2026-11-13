
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TurnstileWidget, turnstileEnabled } from '../../components/auth/TurnstileWidget'
import { useBranding } from '../../hooks/useBranding'


export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const branding = useBranding()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm`,
        captchaToken: captchaToken ?? undefined,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
            <p className="text-slate-600">
              We sent a password reset link to <span className="font-medium">{email}</span>.
            </p>
          </div>
          <div className="rounded-md bg-slate-100 border border-slate-200 p-4 text-sm text-slate-700 text-left space-y-1">
            <p>The link expires in 1 hour.</p>
            <p>If you don't see it, check your spam folder.</p>
          </div>
          <Link to="/login" className="block text-sm text-accent-blue hover:text-accent-blue-light">
            Back to sign in
          </Link>
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

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
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <TurnstileWidget onToken={setCaptchaToken} />

          <div>
            <button
              type="submit"
              disabled={isLoading || (turnstileEnabled && !captchaToken)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-[5px] shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-accent-blue hover:text-accent-blue-light">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}