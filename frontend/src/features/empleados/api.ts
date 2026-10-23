import { api } from '@/api/client'
import type { Empleado, EmpleadoRequest } from '@/api/types'

export async function getEmpleados(): Promise<Empleado[]> {
  const { data } = await api.GET('/api/empleados')
  return data ?? []
}

export async function getEmpleado(id: string): Promise<Empleado | undefined> {
  const { data } = await api.GET('/api/empleados/{id}', { params: { path: { id } } })
  return data
}

export async function createEmpleado(body: EmpleadoRequest): Promise<Empleado | undefined> {
  const { data } = await api.POST('/api/empleados', { body })
  return data
}

export async function updateEmpleado(
  id: string,
  body: EmpleadoRequest,
): Promise<Empleado | undefined> {
  const { data } = await api.PUT('/api/empleados/{id}', { params: { path: { id } }, body })
  return data
}

export async function deleteEmpleado(id: string): Promise<void> {
  await api.DELETE('/api/empleados/{id}', { params: { path: { id } } })
}
