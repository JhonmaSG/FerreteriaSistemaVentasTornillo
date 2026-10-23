import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors'

/**
 * Cliente único de TanStack Query para toda la aplicación.
 *
 * Los valores por defecto son deliberadamente conservadores para un panel
 * administrativo: no refrescar al recuperar el foco, considerar los datos
 * frescos durante 30 segundos y reintentar una sola vez.
 *
 * Los errores 4xx no se reintentan: un 401, 403 o 404 no cambia por repetir
 * la petición (y el 429 empeoraría el bloqueo del rate limit).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) {
          return false
        }

        return failureCount < 1
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
