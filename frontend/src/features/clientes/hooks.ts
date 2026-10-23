import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClienteRequest } from '@/api/types'
import { createCliente, deleteCliente, getCliente, getClientes, updateCliente } from './api'

export const clientesQueryKey = ['clientes'] as const
export const clienteQueryKey = (id: string) => ['clientes', id] as const

export function useClientes() {
  return useQuery({ queryKey: clientesQueryKey, queryFn: getClientes })
}

export function useCliente(id: string | null) {
  return useQuery({
    queryKey: clienteQueryKey(id ?? ''),
    queryFn: () => getCliente(id!),
    enabled: Boolean(id),
  })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ClienteRequest) => createCliente(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: clientesQueryKey })
    },
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ClienteRequest }) => updateCliente(id, body),
    onSuccess: async (_d, v) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: clientesQueryKey }),
        qc.invalidateQueries({ queryKey: clienteQueryKey(v.id) }),
      ])
    },
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: clientesQueryKey })
    },
  })
}
