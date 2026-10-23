import { z } from 'zod'

/**
 * Esquema de validación para Empleado.
 */
export const empleadoSchema = z.object({
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
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Teléfono no válido')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email('Correo electrónico no válido').min(1, 'El email es obligatorio'),
  username: z
    .string()
    .trim()
    .min(5, 'El usuario debe tener al menos 5 caracteres')
    .max(30, 'El usuario no puede superar los 30 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  activo: z.boolean().optional(),
})

export type EmpleadoFormValues = z.infer<typeof empleadoSchema>
