import { api } from '@/api/client'
import type { Venta, VentaRequest } from '@/api/types'

export async function getVentas(): Promise<Venta[]> {
  const { data } = await api.GET('/api/ventas')
  return data ?? []
}

export async function getVenta(id: string): Promise<Venta | undefined> {
  const { data } = await api.GET('/api/ventas/{id}', { params: { path: { id } } })
  return data
}

export async function createVenta(body: VentaRequest): Promise<Venta | undefined> {
  const { data } = await api.POST('/api/ventas', { body })
  return data
}

export async function deleteVenta(id: string): Promise<void> {
  await api.DELETE('/api/ventas/{id}', { params: { path: { id } } })
}
