import { ApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ApiErrorAlertProps {
  error: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  showHint?: boolean
}

export function ApiErrorAlert({
  error,
  title = 'No se pudo cargar la información',
  onRetry,
  retrying = false,
  showHint = true,
}: ApiErrorAlertProps) {
  const apiError = error instanceof ApiError ? error : undefined
  const isUnauthorized = apiError?.status === 401
  const isForbidden = apiError?.status === 403
  const isRateLimited = apiError?.status === 429

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{apiError?.message ?? 'Ocurrió un error inesperado al consultar la API.'}</p>

        {showHint && isUnauthorized ? (
          <p>Inicia sesión para continuar. Si tu sesión caducó, vuelve a ingresar.</p>
        ) : null}
        {showHint && isForbidden ? <p>No tienes permisos para realizar esta acción.</p> : null}
        {showHint && isRateLimited ? (
          <p>
            Demasiadas solicitudes.{' '}
            {apiError?.retryAfterSeconds
              ? `Espera ${apiError.retryAfterSeconds} segundos antes de reintentar.`
              : 'Espera un momento antes de reintentar.'}
          </p>
        ) : null}

        {apiError?.correlationId ? (
          <p className="font-mono text-xs">Correlation ID: {apiError.correlationId}</p>
        ) : null}

        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
            {retrying ? 'Reintentando…' : 'Reintentar'}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
