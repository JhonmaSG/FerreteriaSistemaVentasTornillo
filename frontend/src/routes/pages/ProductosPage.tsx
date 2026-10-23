import type { Producto } from '@/api/types'
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert'
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
        <ApiErrorAlert error={error} onRetry={() => refetch()} retrying={isFetching} />
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
