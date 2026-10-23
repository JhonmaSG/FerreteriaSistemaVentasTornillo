import { z } from 'zod'

/**
 * Esquema de validación para Producto.
 *
 * Refleja las restricciones del backend. Los números se coaccionan desde strings
 * para integrarse bien con inputs HTML nativos.
 */
export const productoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  precio: z.coerce
    .number('El precio debe ser un número')
    .positive('El precio debe ser mayor a 0')
    .finite('El precio debe ser un número válido'),
  stock: z.coerce
    .number('El stock debe ser un número')
    .int('El stock debe ser un número entero')
    .nonnegative('El stock no puede ser negativo')
    .finite('El stock debe ser un número válido'),
  descripcion: z
    .string()
    .trim()
    .max(255, 'La descripción no puede superar los 255 caracteres')
    .optional()
    .or(z.literal('')),
  activo: z.boolean().optional(),
})

export type ProductoFormValues = z.infer<typeof productoSchema>
