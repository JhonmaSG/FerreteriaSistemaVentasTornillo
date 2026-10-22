import { useQuery } from '@tanstack/react-query'
import { getProductos } from './api'

/** Clave de caché del listado; se reutiliza para invalidar tras un alta o edición. */
export const productosQueryKey = ['productos'] as const

export function useProductos() {
  return useQuery({
    queryKey: productosQueryKey,
    queryFn: getProductos,
  })
}
