import { z } from 'zod'

/**
 * Esquema de validación para Cliente.
 */
export const clienteSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(6, 'El DNI debe tener al menos 6 caracteres')
    .max(11, 'El DNI no puede superar los 11 caracteres'),
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios')
    .max(255, 'Los nombres no pueden superar los 255 caracteres'),
  apellidos: z
    .string()
    .trim()
    .min(1, 'Los apellidos son obligatorios')
    .max(255, 'Los apellidos no pueden superar los 255 caracteres'),
  direccion: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria')
    .max(255, 'La dirección no puede superar los 255 caracteres'),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Teléfono no válido')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Correo electrónico no válido').min(1, 'El email es obligatorio'),
  activo: z.boolean().optional(),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
