// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="React authentication context module: state, session, and provider."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the module entry point, dependencies, constants, interfaces, hooks, and provider component."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="AuthContext, AuthProvider, useAuth, and helper functions" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies and defines constants, interfaces, and the provider for authentication." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-developers"]











import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { setAccountId, apiFetch, onUnauthorized } from '../lib/api'
import { User } from '../types/auth'
// CIL[DOC-VECTOR type="context" content="purpose='React authentication context module: state, session, and provider.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_version:constant" type="constant" identity="storage_version" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the storage_version constant."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the storage_version value used by the auth context."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="constant value" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declarative constant with no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STORAGE_VERSION = 1
// CIL[DOC-VECTOR type="context" content="purpose='Define the storage_version constant.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_version:constant"]
// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_key:constant" type="constant" identity="storage_key" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the storage_key constant."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the storage_key value used by the auth context."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="constant value" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declarative constant with no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STORAGE_KEY = 'spine_user'
// CIL[DOC-VECTOR type="context" content="purpose='Define the storage_key constant.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_key:constant"]
// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_ttl_ms:constant" type="constant" identity="storage_ttl_ms" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the storage_ttl_ms constant."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the storage_ttl_ms value used by the auth context."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="constant value" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declarative constant with no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000
// CIL[DOC-VECTOR type="context" content="purpose='Define the storage_ttl_ms constant.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:storage_ttl_ms:constant"]
// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:session_timeout_ms:constant" type="constant" identity="session_timeout_ms" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the session_timeout_ms constant."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the session_timeout_ms value used by the auth context."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="constant value" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declarative constant with no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SESSION_TIMEOUT_MS = 15000
// CIL[DOC-VECTOR type="context" content="purpose='Define the session_timeout_ms constant.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:session_timeout_ms:constant"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:storeduserenvelope:interface" type="interface" identity="storeduserenvelope" parent="module_header"]
// CIL[DOC-MACRO purpose="TypeScript interface/type definition for storeduserenvelope."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of storeduserenvelope data."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="storeduserenvelope interface shape" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface declaration for type checking and contracts." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface StoredUserEnvelope {
  version: number
  timestamp: number
  user: User
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface/type definition for storeduserenvelope.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:storeduserenvelope:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:readStoredUser:function" type="function" identity="readStoredUser" parent="module_header"]
// CIL[DOC-MACRO purpose="Deserialize and validate the cached user from localStorage."]
// CIL[DOC-RESPONSIBILITY responsibility="Read the stored user envelope, validate version and TTL, and return the user."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="User | null" errors="returns null on parse, version mismatch, expiry, or storage read error" side_effects="reads from localStorage"]
// CIL[DOC-MICRO logic_summary="Reads localStorage by STORAGE_KEY, parses the JSON envelope, checks version and TTL, then returns user or null." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const envelope: StoredUserEnvelope = JSON.parse(raw)
    if (envelope.version !== STORAGE_VERSION) return null
    if (Date.now() - envelope.timestamp > STORAGE_TTL_MS) return null
    return envelope.user
  } catch {
    return null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Deserialize and validate the cached user from localStorage.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:readStoredUser:function"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:writeStoredUser:function" type="function" identity="writeStoredUser" parent="module_header"]
// CIL[DOC-MACRO purpose="Persist or clear the cached user envelope in localStorage."]
// CIL[DOC-RESPONSIBILITY responsibility="Serialize the user to a versioned envelope or remove the stored key."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="user: User | null" outputs="none" errors="silently swallowed" side_effects="writes or removes localStorage key"]
// CIL[DOC-MICRO logic_summary="Writes a versioned envelope with timestamp when user is truthy, otherwise removes the storage key." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function writeStoredUser(user: User | null) {
  try {
    if (user) {
      const envelope: StoredUserEnvelope = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        user,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Persist or clear the cached user envelope in localStorage.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:writeStoredUser:function"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:getSessionWithTimeout:function" type="function" identity="getSessionWithTimeout" parent="module_header"]
// CIL[DOC-MACRO purpose="Fetch the Supabase session with a timeout fallback."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap supabase.auth.getSession in a Promise.race to avoid hanging on slow networks."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ data: { session: any | null } }" errors="returns null session on timeout or error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Races the Supabase getSession promise against a SESSION_TIMEOUT_MS timeout." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getSessionWithTimeout(): Promise<{ data: { session: any | null } }> {
  try {
    return await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), SESSION_TIMEOUT_MS)
      )
    ])
  } catch (error) {
    return { data: { session: null } }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch the Supabase session with a timeout fallback.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:getSessionWithTimeout:function"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:AuthContextType:interface" type="interface" identity="AuthContextType" parent="module_header"]
// CIL[DOC-MACRO purpose="TypeScript interface/type definition for AuthContextType."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of AuthContextType data."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="AuthContextType interface shape" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface declaration for type checking and contracts." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, captchaToken?: string) => Promise<User | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface/type definition for AuthContextType.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:AuthContextType:interface"]




// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:authcontext:constant" type="constant" identity="authcontext" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the authcontext constant."]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the authcontext value used by the auth context."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="constant value" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declarative constant with no runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const AuthContext = createContext<AuthContextType | undefined>(undefined)
// CIL[DOC-VECTOR type="context" content="purpose='Define the authcontext constant.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:authcontext:constant"]


// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:useauth:function" type="function" identity="useauth" parent="module_header"]
// CIL[DOC-MACRO purpose="Hook to consume the AuthContext value."]
// CIL[DOC-RESPONSIBILITY responsibility="Return the auth context or throw an error when used outside an AuthProvider."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AuthContextType" errors="throws Error('useAuth must be used within an AuthProvider')" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Calls useContext(AuthContext) and validates the result is defined." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }


  return context
}
// CIL[DOC-VECTOR type="context" content="purpose='Hook to consume the AuthContext value.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:useauth:function"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:AuthProviderProps:interface" type="interface" identity="AuthProviderProps" parent="module_header"]
// CIL[DOC-MACRO purpose="TypeScript interface/type definition for AuthProviderProps."]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the shape of AuthProviderProps data."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="AuthProviderProps interface shape" errors="n/a" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Interface declaration for type checking and contracts." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AuthProviderProps {
  children: React.ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface/type definition for AuthProviderProps.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:AuthProviderProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:fetchUserContext:function" type="function" identity="fetchUserContext" parent="module_header"]
// CIL[DOC-MACRO purpose="Fetch remote user context with retries and transient error handling."]
// CIL[DOC-RESPONSIBILITY responsibility="Load user data from /api/auth, tolerate transient network failures, and handle auth errors."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="maxRetries: number (default 2)" outputs="User | null" errors="returns null for 401/403, client errors, or unrecoverable exceptions" side_effects="makes HTTP GET request to /api/auth"]
// CIL[DOC-MICRO logic_summary="Retry loop with exponential backoff; 5xx continues, 401/403/null returns, TypeError retries." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function fetchUserContext(maxRetries = 2): Promise<User | null> {
  let lastError: unknown = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 200 * Math.pow(4, attempt - 1)))
      }

      const response = await apiFetch('/api/auth', { method: 'GET' })

      if (response.status === 401 || response.status === 403) {
        return null
      }

      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status}`)
        continue
      }

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (data.error || !data.data) return null
      return data.data
    } catch (error) {
      lastError = error
      if (error instanceof TypeError) continue
      return null
    }
  }
  return null
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch remote user context with retries and transient error handling.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:fetchUserContext:function"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AuthContext.tsx:authprovider:function" type="function" identity="authprovider" parent="module_header"]
// CIL[DOC-MACRO purpose="Provide authentication state and actions to the React component tree."]
// CIL[DOC-RESPONSIBILITY responsibility="Manage user state, session lifecycle, login/logout/refresh, and storage synchronization."]
// CIL[DOC-CONTEXT module="AuthContext" layer="context" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts,.framework/src/lib/supabase.ts,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="children: React.ReactNode" outputs="AuthContext.Provider with value { user, isLoading, login, logout, refreshUser }" errors="login may propagate Supabase error; useAuth throws outside provider" side_effects="updates localStorage, Supabase auth session, account id, and window storage listener"]
// CIL[DOC-MICRO logic_summary="Initializes from cache, fetches/refresh session on mount, exposes callbacks, and listens to auth/storage events." notable_decisions="[]"]
// CIL[DOC-NOTE type="caution" content="onAuthStateChange callbacks must not await Supabase calls — auth-js awaits listener callbacks inside initializePromise, so fetchUserContext→apiFetch→getAuthHeaders→getSession deadlocks on expired sessions until SESSION_TIMEOUT_MS (15s spinner before login mounts). Work is deferred via setTimeout."]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AuthProvider({ children }: AuthProviderProps) {
  const storedUser = readStoredUser()
  const [user, setUser] = useState<User | null>(storedUser)
  const [isLoading, setIsLoading] = useState(true)
  const isLoggingInRef = useRef(false)
  const userRef = useRef<User | null>(storedUser)

  useEffect(() => { userRef.current = user }, [user])

  const setUserWithStorage = useCallback((u: User | null) => {
    setUser(u)
    userRef.current = u
    writeStoredUser(u)
  }, [])

  const clearUser = useCallback(() => {
    setUserWithStorage(null)
    setAccountId(null)
  }, [setUserWithStorage])

  const applyUserContext = useCallback((ctx: User) => {
    setUserWithStorage(ctx)
    setAccountId(ctx.account_id)
  }, [setUserWithStorage])

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    isLoggingInRef.current = true

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      })

      if (error) throw error

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 100))

        const userContext = await fetchUserContext()
        if (userContext) {
          applyUserContext(userContext)
          return userContext
        } else {
          const fallback: User = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.email || 'User',
            account_id: '',
            roles: [],
            permissions: [],
          }
          applyUserContext(fallback)
          return fallback
        }
      }
      return null
    } finally {
      isLoggingInRef.current = false
    }
  }, [applyUserContext])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    clearUser()
  }, [clearUser])

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await getSessionWithTimeout()

    if (!session?.user) {
      clearUser()
      return null
    }

    const userContext = await fetchUserContext()
    if (userContext) {
      applyUserContext(userContext)
      return userContext
    } else {
      clearUser()
      return null
    }
  }, [applyUserContext, clearUser])

  useEffect(() => {
    const unregister = onUnauthorized(() => {
      supabase.auth.signOut().then(() => clearUser())
    })
    return unregister
  }, [clearUser])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      if (e.newValue === null) {
        setUser(null)
        userRef.current = null
        setAccountId(null)
      } else {
        const parsed = readStoredUser()
        if (parsed) {
          setUser(parsed)
          userRef.current = parsed
          setAccountId(parsed.account_id)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const { data: { session } } = await getSessionWithTimeout()

        if (!session?.user) {
          if (!cancelled) clearUser()
          return
        }

        const userContext = await fetchUserContext()
        if (cancelled) return

        if (userContext) {
          applyUserContext(userContext)
        } else if (userRef.current) {
          setAccountId(userRef.current.account_id)
        } else {
          clearUser()
        }
      } catch (error) {
        if (!cancelled) {
          if (userRef.current) {
            setAccountId(userRef.current.account_id)
          } else {
            clearUser()
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return

        if (isLoggingInRef.current) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session?.user) return
          if (userRef.current) return

          // auth-js awaits listener callbacks inside initializePromise —
          // awaiting fetchUserContext here deadlocks it via
          // apiFetch → getAuthHeaders → getSession → initializePromise.
          setTimeout(async () => {
            if (cancelled) return

            const userContext = await fetchUserContext()
            if (cancelled) return

            if (userContext) {
              applyUserContext(userContext)
            } else {
              clearUser()
            }
          }, 0)
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [applyUserContext, clearUser])

  const value: AuthContextType = { user, isLoading, login, logout, refreshUser }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provide authentication state and actions to the React component tree.'; No verified external callers; imports: .framework/src/lib/supabase.ts,.framework/src/lib/api.ts,.framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AuthContext.tsx:authprovider:function"]
