import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EmpleadoRequest } from '@/api/types'
import { createEmpleado, deleteEmpleado, getEmpleado, getEmpleados, updateEmpleado } from './api'

export const empleadosQueryKey = ['empleados'] as const
export const empleadoQueryKey = (id: string) => ['empleados', id] as const

export function useEmpleados() {
  return useQuery({ queryKey: empleadosQueryKey, queryFn: getEmpleados })
}

export function useEmpleado(id: string | null) {
  return useQuery({
    queryKey: empleadoQueryKey(id ?? ''),
    queryFn: () => getEmpleado(id!),
    enabled: Boolean(id),
  })
}

export function useCreateEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EmpleadoRequest) => createEmpleado(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: empleadosQueryKey })
    },
  })
}

export function useUpdateEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: EmpleadoRequest }) => updateEmpleado(id, body),
    onSuccess: async (_d, v) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: empleadosQueryKey }),
        qc.invalidateQueries({ queryKey: empleadoQueryKey(v.id) }),
      ])
    },
  })
}

export function useDeleteEmpleado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmpleado(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: empleadosQueryKey })
    },
  })
}
