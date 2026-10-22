/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base de la API. Vacío o ausente significa mismo origen: el proxy de
   * Vite en desarrollo y Nginx en producción.
   */
  readonly VITE_API_URL?: string
}
