import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { VentaRequest } from '@/api/types'
import { createVenta, deleteVenta, getVenta, getVentas } from './api'

export const ventasQueryKey = ['ventas'] as const
export const ventaQueryKey = (id: string) => ['ventas', id] as const

export function useVentas() {
  return useQuery({ queryKey: ventasQueryKey, queryFn: getVentas })
}

export function useVenta(id: string | null) {
  return useQuery({
    queryKey: ventaQueryKey(id ?? ''),
    queryFn: () => getVenta(id!),
    enabled: Boolean(id),
  })
}

export function useCreateVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: VentaRequest) => createVenta(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ventasQueryKey })
      await qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useDeleteVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVenta(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ventasQueryKey })
      await qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
