










import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { setAccountId, apiFetch, onUnauthorized } from '../lib/api'
import { User } from '../types/auth'

const STORAGE_VERSION = 1
const STORAGE_KEY = 'spine_user'
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000
const SESSION_TIMEOUT_MS = 15000

interface StoredUserEnvelope {
  version: number
  timestamp: number
  user: User
}

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

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, captchaToken?: string) => Promise<User | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}




const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }


  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

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

// onAuthStateChange callbacks must not await Supabase calls — auth-js awaits listener callbacks inside initializePromise, so fetchUserContext→apiFetch→getAuthHeaders→getSession deadlocks on expired sessions until SESSION_TIMEOUT_MS (15s spinner before login mounts). Work is deferred via setTimeout.
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
