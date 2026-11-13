
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'


export function PendingApprovalPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Awaiting approval</h1>
          <p className="text-slate-600">
            Your access request has been submitted. An account administrator will review
            and approve your request shortly.
          </p>
        </div>

        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            You'll be able to access the platform once your request has been approved.
            Please check back later or contact your administrator directly.
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
