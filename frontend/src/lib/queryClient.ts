import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente único de TanStack Query para toda la aplicación.
 *
 * Los valores por defecto son deliberadamente conservadores para un panel
 * administrativo: no refrescar al recuperar el foco, reintentar una sola vez
 * y considerar los datos frescos durante 30 segundos.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
