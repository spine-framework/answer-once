
import React from 'react'
import { Link } from 'react-router-dom'
import { useBranding } from '../hooks/useBranding'


export function SetupPage() {
  const branding = useBranding()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src={branding.logo_url} alt={branding.app_name} className="h-14 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Welcome to {branding.app_name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your project is running but no apps are installed yet.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Getting started
          </h3>
          <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
            <li>
              Edit <code className="bg-slate-100 px-1 rounded">.env</code> with your Supabase credentials
            </li>
            <li>
              Run migrations:{' '}
              <code className="bg-slate-100 px-1 rounded">npx spine-framework migrate</code>
            </li>
            <li>
              Install an app:{' '}
              <code className="bg-slate-100 px-1 rounded">npx spine-framework install-app &lt;app-package&gt;</code>
            </li>
            <li>
              Reassemble:{' '}
              <code className="bg-slate-100 px-1 rounded">npm run assemble && netlify dev</code>
            </li>
          </ol>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Already set up? Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}