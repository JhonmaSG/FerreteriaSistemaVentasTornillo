import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/api/client'
import { AuthContext, type AuthContextValue } from './context'
import { clearSession, loadSession, saveSession, type Session } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.POST('/api/auth/login', {
      body: { username, password },
    })

    if (!data?.token) {
      throw new Error('La respuesta de login no incluyó un token')
    }

    const next: Session = {
      token: data.token,
      username: data.username ?? username,
      roles: data.roles ?? [],
    }

    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
