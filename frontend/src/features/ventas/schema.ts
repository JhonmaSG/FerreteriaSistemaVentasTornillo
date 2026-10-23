import { z } from 'zod'

export const ventaDetalleSchema = z.object({
  productoId: z.string().min(1, 'Selecciona un producto'),
  cantidad: z.coerce.number().int('La cantidad debe ser entera').min(1, 'Mínimo 1 unidad'),
  precioVenta: z.coerce.number().positive('El precio debe ser mayor a 0'),
})

export const ventaSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  empleadoId: z.string().min(1, 'Selecciona un empleado'),
  detalles: z.array(ventaDetalleSchema).min(1, 'Agrega al menos un producto'),
})

export type VentaFormValues = z.infer<typeof ventaSchema>
export type VentaDetalleFormValues = z.infer<typeof ventaDetalleSchema>
