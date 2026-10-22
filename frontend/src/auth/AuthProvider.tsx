import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { AuthContext, type AuthContextValue } from './context'
import { clearSession, loadSession, saveSession, UNAUTHORIZED_EVENT, type Session } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const queryClient = useQueryClient()

  const logout = useCallback(() => {
    clearSession()
    // Los datos en caché pertenecen al usuario anterior: no deben sobrevivir
    // al cierre de sesión ni a un token vencido.
    queryClient.clear()
    setSession(null)
  }, [queryClient])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

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
