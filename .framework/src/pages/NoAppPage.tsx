
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBranding } from '../hooks/useBranding'

export function NoAppPage() {
  const { logout } = useAuth()
  const branding = useBranding()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center">
          <img src={branding.logo_url} alt={branding.app_name} className="h-14 w-auto" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">No apps yet</h1>
          <p className="text-slate-600">
            No apps are installed for your account yet. Contact your administrator
            to get access, or sign out and try a different account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="py-2 px-4 rounded-[5px] bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
