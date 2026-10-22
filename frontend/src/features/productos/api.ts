import { api } from '@/api/client'
import type { Producto } from '@/api/types'

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
