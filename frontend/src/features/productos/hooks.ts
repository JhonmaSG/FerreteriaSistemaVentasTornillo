import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductoRequest } from '@/api/types'
import { createProducto, deleteProducto, getProducto, getProductos, updateProducto } from './api'

/** Clave de caché del listado; se reutiliza para invalidar tras un alta o edición. */
export const productosQueryKey = ['productos'] as const
export const productoQueryKey = (id: string) => ['productos', id] as const

export function useProductos() {
  return useQuery({
    queryKey: productosQueryKey,
    queryFn: getProductos,
  })
}

export function useProducto(id: string | null) {
  return useQuery({
    queryKey: productoQueryKey(id ?? ''),
    queryFn: () => getProducto(id!),
    enabled: Boolean(id),
  })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProductoRequest) => createProducto(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productosQueryKey })
    },
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProductoRequest }) => updateProducto(id, body),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productosQueryKey }),
        queryClient.invalidateQueries({ queryKey: productoQueryKey(variables.id) }),
      ])
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProducto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productosQueryKey })
    },
  })
}
