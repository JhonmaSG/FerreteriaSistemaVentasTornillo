import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Descarga el contrato OpenAPI del backend y lo guarda en openapi.json.
 *
 * El archivo se versiona para que la generación de tipos no dependa de que
 * el backend esté levantado (por ejemplo, en CI). Este script solo se usa
 * para refrescar el contrato cuando la API cambia.
 */
const apiUrl = process.env.API_URL ?? 'http://localhost:8080'
const outFile = path.resolve(fileURLToPath(new URL('../openapi.json', import.meta.url)))

const response = await fetch(`${apiUrl}/v3/api-docs`)

if (!response.ok) {
  console.error(`No se pudo obtener ${apiUrl}/v3/api-docs (HTTP ${response.status})`)
  process.exit(1)
}

const spec = await response.json()
await writeFile(outFile, `${JSON.stringify(spec, null, 2)}\n`, 'utf8')

const routes = Object.keys(spec.paths ?? {}).length
console.log(`openapi.json actualizado desde ${apiUrl}/v3/api-docs (${routes} rutas)`)
