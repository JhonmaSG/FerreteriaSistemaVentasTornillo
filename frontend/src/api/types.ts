import type { components, paths } from './schema'

/**
 * Tipos del contrato OpenAPI, con alias legibles por dominio.
 *
 * `schema.d.ts` se regenera con `npm run api:types` y no se edita a mano.
 * Los campos de respuesta llegan opcionales porque el backend todavía no
 * declara `required` en el contrato; se estrechan en la capa de features.
 */
export type { components, paths }

type Schemas = components['schemas']

export type Producto = Schemas['ProductoResponse']
export type ProductoRequest = Schemas['ProductoRequest']

export type Cliente = Schemas['ClienteResponse']
export type ClienteRequest = Schemas['ClienteRequest']

export type Empleado = Schemas['EmpleadoResponse']
export type EmpleadoRequest = Schemas['EmpleadoRequest']

export type Venta = Schemas['VentaResponse']
export type VentaRequest = Schemas['VentaRequest']
export type DetalleVenta = Schemas['DetalleVentaResponse']
export type DetalleVentaRequest = Schemas['DetalleVentaRequest']

export type LoginRequest = Schemas['LoginRequest']
export type JwtResponse = Schemas['JwtResponse']
