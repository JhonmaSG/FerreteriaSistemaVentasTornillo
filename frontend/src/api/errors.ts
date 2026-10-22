const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida',
  401: 'No autenticado: se requiere un token JWT válido',
  403: 'Acceso denegado: no tienes permisos para este recurso',
  404: 'El recurso solicitado no existe',
  429: 'Demasiadas solicitudes. Intenta nuevamente más tarde',
  500: 'Error interno del servidor',
}

/** Errores de validación por campo que devuelve el backend en un 400. */
export type ValidationErrors = Record<string, string>

interface ApiErrorOptions {
  fieldErrors?: ValidationErrors
  retryAfterSeconds?: number
  correlationId?: string
}

/**
 * Error normalizado de la API.
 *
 * El backend responde `{ "message": "..." }` en todos sus errores, salvo la
 * validación de campos, que devuelve un mapa plano `{ campo: "mensaje" }`.
 * Esta clase unifica ambos formatos y conserva los metadatos de la respuesta.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: ValidationErrors
  readonly retryAfterSeconds?: number
  readonly correlationId?: string

  constructor(status: number, message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = options.fieldErrors
    this.retryAfterSeconds = options.retryAfterSeconds
    this.correlationId = options.correlationId
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractMessage(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined

  const message = body.message
  return typeof message === 'string' && message.trim() !== '' ? message : undefined
}

/**
 * Un 400 de validación llega como mapa de campos, sin la clave `message`.
 * Cualquier otra respuesta con `message` se trata como error general.
 */
function extractFieldErrors(body: unknown): ValidationErrors | undefined {
  if (!isRecord(body) || 'message' in body) return undefined

  const entries = Object.entries(body).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  )

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined

  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

/**
 * Convierte una respuesta HTTP fallida en `ApiError`.
 *
 * Tolera cuerpos vacíos o que no sean JSON: el `Retry-After` del rate limit,
 * el `X-Correlation-Id` de los 500 y un mensaje de respaldo por código de
 * estado permiten mostrar algo útil incluso sin cuerpo.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const { status } = response
  const correlationId = response.headers.get('X-Correlation-Id') ?? undefined
  const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'))

  let body: unknown

  try {
    const raw = await response.text()
    body = raw ? JSON.parse(raw) : undefined
  } catch {
    body = undefined
  }

  const fieldErrors = extractFieldErrors(body)
  const message = extractMessage(body) ?? FALLBACK_MESSAGES[status] ?? `Error HTTP ${status}`

  return new ApiError(status, message, { fieldErrors, retryAfterSeconds, correlationId })
}
