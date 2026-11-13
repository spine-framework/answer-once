
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TurnstileWidget, turnstileEnabled } from '../../components/auth/TurnstileWidget'
import { resolvePostAuthPath } from '../../lib/app-mount'
import { useBranding } from '../../hooks/useBranding'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const branding = useBranding()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await login(email, password, captchaToken ?? undefined)
      const role = user?.roles?.[0]
      if (!role) {
        navigate('/')
        return
      }

      const res = await fetch('/spine.config.json')
      if (!res.ok) {
        navigate('/')
        return
      }

      const reg = (await res.json()).registration ?? {}
      const app = reg.default_app_by_role?.[role] ?? reg.default_app
      const path = reg.apps?.[app]?.path ?? '/'
      navigate(await resolvePostAuthPath(app, path), { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center">
            <img src={branding.logo_url} alt={branding.app_name} className="h-14 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-medium text-accent-blue hover:text-accent-blue-light">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
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
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-accent-blue hover:text-accent-blue-light">
                Forgot your password?
              </Link>
            </div>
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
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
