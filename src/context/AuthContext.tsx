import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  getSession,
  loginWithCredentials,
  loginWithSocial,
  logout as logoutService,
  registerAccount,
  restoreApiSession,
} from '../lib/auth/authService'
import type { RegisterResult } from '../lib/auth/authService'
import type { RegisterInput, Session, User } from '../lib/auth/types'
import { AUTH_SESSION_EXPIRED_EVENT } from '../lib/api/http'
import { clearWorkspaceCache } from '../lib/api/workspaceSync'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  loginSocial: (email: string) => Promise<void>
  register: (input: RegisterInput) => Promise<RegisterResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await restoreApiSession()
      if (!cancelled) {
        setSession(session)
        setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onExpired = () => {
      clearWorkspaceCache()
      setSession(null)
    }
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async (email: string, password: string, remember = false) => {
    await loginWithCredentials(email, password, remember)
    setSession(getSession())
  }, [])

  const loginSocial = useCallback(async (email: string) => {
    await loginWithSocial(email)
    setSession(getSession())
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerAccount(input)
    setSession(getSession())
    return result
  }, [])

  const logout = useCallback(() => {
    logoutService()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading,
      login,
      loginSocial,
      register,
      logout,
    }),
    [session, isLoading, login, loginSocial, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
