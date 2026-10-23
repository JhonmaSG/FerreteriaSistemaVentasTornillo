import { z } from 'zod'

/**
 * Reglas del formulario de acceso.
 *
 * Reflejan las restricciones del backend (`@NotBlank` en ambos campos) para
 * evitar un viaje de red por errores evidentes. El límite real lo sigue
 * imponiendo el servidor.
 */
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
