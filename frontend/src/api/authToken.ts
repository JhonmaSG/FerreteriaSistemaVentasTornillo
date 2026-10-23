/**
 * Token JWT en memoria.
 *
 * Vive aquí y no en el cliente HTTP para que la etapa 3 (autenticación) sea la
 * única responsable de decidir dónde se persiste (sessionStorage) y cuándo se
 * limpia. El cliente solo pregunta si hay token antes de cada request.
 */
let token: string | null = null

export function getAuthToken(): string | null {
  return token
}

export function setAuthToken(value: string | null): void {
  token = value
}
