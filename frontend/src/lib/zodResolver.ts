import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

/**
 * Adaptador mínimo entre Zod y React Hook Form.
 *
 * `@hookform/resolvers` arrastra una cadena de peers opcionales que choca con
 * el Zod 4 que ya usa el CLI de shadcn. El contrato que necesita RHF es
 * pequeño (validar y devolver errores por campo), así que se implementa aquí
 * en lugar de aceptar `--legacy-peer-deps` o duplicar versiones.
 *
 * El primer mensaje de cada campo es el que se muestra; los errores de nivel
 * superior (por ejemplo, reglas entre campos) se agrupan en `root`.
 */
export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values)

    if (result.success) {
      return { values: result.data, errors: {} }
    }

    const errors: Record<string, { type: string; message: string }> = {}

    for (const issue of result.error.issues) {
      const field = issue.path.map(String).join('.') || 'root'
      errors[field] ??= { type: issue.code, message: issue.message }
    }

    return {
      values: {},
      errors: errors as FieldErrors<TFieldValues>,
    }
  }
}
