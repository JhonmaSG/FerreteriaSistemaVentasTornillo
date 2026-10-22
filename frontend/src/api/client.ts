import createClient from 'openapi-fetch'
import { getAuthToken } from './authToken'
import { parseApiError } from './errors'
import type { paths } from './schema'

/**
 * Sin VITE_API_URL las peticiones van al mismo origen ("/api/..."):
 * el proxy de Vite en desarrollo y Nginx en producción. Solo se define una
 * URL absoluta si el frontend y la API viven en dominios distintos.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const api = createClient<paths>({ baseUrl: API_BASE_URL })

api.use({
  onRequest({ request }) {
    const token = getAuthToken()

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    return request
  },

  async onResponse({ response }) {
    if (!response.ok) {
      throw await parseApiError(response)
    }

    return response
  },
})
