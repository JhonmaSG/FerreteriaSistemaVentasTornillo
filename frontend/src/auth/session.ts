import { setAuthToken } from '@/api/authToken'

const STORAGE_KEY = 'ft.session'

export interface Session {
  token: string
  username: string
  roles: string[]
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.username === 'string' &&
    Array.isArray(candidate.roles) &&
    candidate.roles.every((role) => typeof role === 'string')
  )
}

/**
 * Restaura la sesión de la pestaña y sincroniza el token con el cliente HTTP.
 *
 * Se usa sessionStorage a propósito para el MVP: la sesión no sobrevive al
 * cierre de la pestaña y el token no queda en localStorage de forma permanente.
 * En producción lo correcto es una cookie httpOnly con refresh token.
 */
export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)

    if (!isSession(parsed)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }

    setAuthToken(parsed.token)
    return parsed
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveSession(session: Session): void {
  setAuthToken(session.token)

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Almacenamiento no disponible (modo privado o cuota llena): la sesión
    // sigue viva en memoria y el usuario puede trabajar en esta pestaña.
  }
}

export function clearSession(): void {
  setAuthToken(null)

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
}
