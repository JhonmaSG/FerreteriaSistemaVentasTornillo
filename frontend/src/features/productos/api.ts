import { api } from '@/api/client'
import type { Producto, ProductoRequest } from '@/api/types'

/**
 * Listado de productos.
 *
 * El backend no pagina todavía, así que la respuesta es un array completo.
 * Si llega sin cuerpo (200 vacío) se devuelve un array vacío para que la UI
 * no tenga que distinguir entre "sin datos" y "respuesta nula".
 */
export async function getProductos(): Promise<Producto[]> {
  const { data } = await api.GET('/api/productos')

  return data ?? []
}

export async function getProducto(id: string): Promise<Producto | undefined> {
  const { data } = await api.GET('/api/productos/{id}', {
    params: { path: { id } },
  })

  return data
}

export async function createProducto(body: ProductoRequest): Promise<Producto | undefined> {
  const { data } = await api.POST('/api/productos', {
    body,
  })

  return data
}

export async function updateProducto(
  id: string,
  body: ProductoRequest,
): Promise<Producto | undefined> {
  const { data } = await api.PUT('/api/productos/{id}', {
    params: { path: { id } },
    body,
  })

  return data
}

export async function deleteProducto(id: string): Promise<void> {
  await api.DELETE('/api/productos/{id}', {
    params: { path: { id } },
  })
}
