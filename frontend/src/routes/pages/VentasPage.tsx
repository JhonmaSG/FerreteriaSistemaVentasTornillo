import { useState } from 'react'
import type { Venta } from '@/api/types'
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert'
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { VentaFormDialog } from '@/features/ventas/components/VentaFormDialog'
import { useClientes } from '@/features/clientes/hooks'
import { useEmpleados } from '@/features/empleados/hooks'
import { useProductos } from '@/features/productos/hooks'
import { useCreateVenta, useDeleteVenta, useVentas } from '@/features/ventas/hooks'
import { formatCurrency } from '@/lib/format'
import type { VentaFormValues } from '@/features/ventas/schema'

export function VentasPage() {
  const { data: ventas, isPending, isError, error, refetch, isFetching } = useVentas()
  const { data: clientes } = useClientes()
  const { data: empleados } = useEmpleados()
  const { data: productos } = useProductos()
  const createVenta = useCreateVenta()
  const deleteVenta = useDeleteVenta()

  const [createOpen, setCreateOpen] = useState(false)
  const [detailVenta, setDetailVenta] = useState<Venta | null>(null)
  const [deleteVentaState, setDeleteVentaState] = useState<Venta | null>(null)

  const handleCreate = async (values: VentaFormValues) => {
    const payload = {
      clienteId: values.clienteId,
      empleadoId: values.empleadoId,
      detalles: values.detalles.map((d) => ({
        productoId: d.productoId,
        cantidad: Number(d.cantidad),
        precioVenta: Number(d.precioVenta),
      })),
    }
    await createVenta.mutateAsync(payload as never)
  }

  const handleDelete = async (venta: Venta) => {
    if (!venta.id) return
    await deleteVenta.mutateAsync(venta.id)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground">Registro y consulta de ventas.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Nueva venta</Button>
      </div>

      {isPending ? <SkeletonList /> : null}
      {isError ? (
        <ApiErrorAlert error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : null}
      {ventas && ventas.length === 0 ? <EmptyState /> : null}
      {ventas && ventas.length > 0 ? (
        <VentasTable
          ventas={ventas}
          onView={(venta) => setDetailVenta(venta)}
          onDelete={(venta) => setDeleteVentaState(venta)}
        />
      ) : null}

      <VentaFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clientes={clientes ?? []}
        empleados={empleados ?? []}
        productos={productos ?? []}
        onSubmit={handleCreate}
      />

      <Dialog open={Boolean(detailVenta)} onOpenChange={(open) => !open && setDetailVenta(null)}>
        <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Detalle de venta</DialogTitle>
            <DialogDescription>
              {detailVenta?.numeroSerie} - {detailVenta?.clienteNombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Empleado:</span>{' '}
                {detailVenta?.empleadoNombre}
              </p>
              <p>
                <span className="text-muted-foreground">Monto total:</span>{' '}
                {formatCurrency(detailVenta?.monto)}
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(detailVenta?.detalles ?? []).map((d, i) => (
                  <TableRow key={d.id ?? i}>
                    <TableCell>{d.productoNombre ?? '—'}</TableCell>
                    <TableCell className="text-right">{d.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.precioVenta)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        item={deleteVentaState}
        open={Boolean(deleteVentaState)}
        onOpenChange={(open) => !open && setDeleteVentaState(null)}
        onConfirm={handleDelete}
        getLabel={(venta) => venta.numeroSerie ?? 'esta venta'}
        title="Eliminar venta"
      />
    </section>
  )
}

function VentasTable({
  ventas,
  onView,
  onDelete,
}: {
  ventas: Venta[]
  onView: (venta: Venta) => void
  onDelete: (venta: Venta) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Serie</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Empleado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((venta, index) => (
            <TableRow key={venta.id ?? index}>
              <TableCell className="font-medium">{venta.numeroSerie ?? '—'}</TableCell>
              <TableCell>{venta.clienteNombre ?? '—'}</TableCell>
              <TableCell>{venta.empleadoNombre ?? '—'}</TableCell>
              <TableCell className="text-right">{formatCurrency(venta.monto)}</TableCell>
              <TableCell>
                <Badge variant={venta.activo ? 'default' : 'secondary'}>
                  {venta.activo ? 'Activa' : 'Anulada'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Acciones
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView(venta)}>Ver detalle</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(venta)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2" aria-label="Cargando ventas">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      No hay ventas registradas.
    </p>
  )
}
