import { ApiError } from '@/api/errors'
import type { Producto } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProductos } from '@/features/productos/hooks'
import { formatCurrency } from '@/lib/format'

export function ProductosPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useProductos()

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">Inventario registrado en el sistema.</p>
      </div>

      {isPending ? <ProductosSkeleton /> : null}
      {isError ? (
        <ProductosError error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : null}
      {data && data.length === 0 ? <ProductosEmpty /> : null}
      {data && data.length > 0 ? <ProductosTable productos={data} /> : null}
    </section>
  )
}

function ProductosTable({ productos }: { productos: Producto[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto, index) => (
            <TableRow key={producto.id ?? index}>
              <TableCell className="font-medium">{producto.nombre ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(producto.precio)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{producto.stock ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProductosSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando productos">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function ProductosEmpty() {
  return (
    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      No hay productos registrados.
    </p>
  )
}

interface ProductosErrorProps {
  error: Error
  onRetry: () => void
  retrying: boolean
}

function ProductosError({ error, onRetry, retrying }: ProductosErrorProps) {
  const apiError = error instanceof ApiError ? error : undefined
  const isUnauthorized = apiError?.status === 401

  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
    >
      <p className="font-medium">No se pudieron cargar los productos</p>
      <p className="text-sm text-muted-foreground">
        {apiError?.message ?? 'Ocurrió un error inesperado al consultar la API.'}
      </p>
      {isUnauthorized ? (
        <p className="text-sm text-muted-foreground">
          Inicia sesión para consultar el inventario. El formulario de acceso llega en la etapa 3.
        </p>
      ) : null}
      {apiError?.correlationId ? (
        <p className="font-mono text-xs text-muted-foreground">
          Correlation ID: {apiError.correlationId}
        </p>
      ) : null}
      <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
        {retrying ? 'Reintentando…' : 'Reintentar'}
      </Button>
    </div>
  )
}
