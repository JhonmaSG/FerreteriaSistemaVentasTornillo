import { api } from '@/api/client'
import type { Cliente, ClienteRequest } from '@/api/types'

export async function getClientes(): Promise<Cliente[]> {
  const { data } = await api.GET('/api/clientes')
  return data ?? []
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  const { data } = await api.GET('/api/clientes/{id}', { params: { path: { id } } })
  return data
}

export async function createCliente(body: ClienteRequest): Promise<Cliente | undefined> {
  const { data } = await api.POST('/api/clientes', { body })
  return data
}

export async function updateCliente(
  id: string,
  body: ClienteRequest,
): Promise<Cliente | undefined> {
  const { data } = await api.PUT('/api/clientes/{id}', { params: { path: { id } }, body })
  return data
}

export async function deleteCliente(id: string): Promise<void> {
  await api.DELETE('/api/clientes/{id}', { params: { path: { id } } })
}
