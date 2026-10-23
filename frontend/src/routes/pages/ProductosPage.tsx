import { useState } from 'react'
import type { Producto } from '@/api/types'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteProductoDialog } from '@/features/productos/components/DeleteProductoDialog'
import { ProductoFormDialog } from '@/features/productos/components/ProductoFormDialog'
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
} from '@/features/productos/hooks'
import type { ProductoFormValues } from '@/features/productos/schema'
import { formatCurrency } from '@/lib/format'

export function ProductosPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useProductos()
  const createProducto = useCreateProducto()
  const updateProducto = useUpdateProducto()
  const deleteProducto = useDeleteProducto()

  const [createOpen, setCreateOpen] = useState(false)
  const [editProducto, setEditProducto] = useState<Producto | null>(null)
  const [deleteProductoState, setDeleteProductoState] = useState<Producto | null>(null)

  const handleCreate = async (values: ProductoFormValues) => {
    const payload = {
      nombre: values.nombre,
      precio: values.precio,
      stock: values.stock,
      descripcion: values.descripcion?.trim() || undefined,
      activo: values.activo ?? true,
    }
    await createProducto.mutateAsync(payload)
  }

  const handleUpdate = async (values: ProductoFormValues) => {
    if (!editProducto?.id) return
    const payload = {
      nombre: values.nombre,
      precio: values.precio,
      stock: values.stock,
      descripcion: values.descripcion?.trim() || undefined,
      activo: values.activo ?? true,
    }
    await updateProducto.mutateAsync({ id: editProducto.id, body: payload })
  }

  const handleDelete = async (producto: Producto) => {
    if (!producto.id) return
    await deleteProducto.mutateAsync(producto.id)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">Inventario registrado en el sistema.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Nuevo producto</Button>
      </div>

      {isPending ? <ProductosSkeleton /> : null}
      {isError ? (
        <ApiErrorAlert error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : null}
      {data && data.length === 0 ? <ProductosEmpty /> : null}
      {data && data.length > 0 ? (
        <ProductosTable
          productos={data}
          onEdit={(producto) => setEditProducto(producto)}
          onDelete={(producto) => setDeleteProductoState(producto)}
        />
      ) : null}

      <ProductoFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo producto"
        description="Registra un producto en el inventario."
        submitLabel="Crear"
        onSubmit={handleCreate}
      />

      <ProductoFormDialog
        open={Boolean(editProducto)}
        onOpenChange={(open) => {
          if (!open) setEditProducto(null)
        }}
        title="Editar producto"
        description="Actualiza la información del producto."
        submitLabel="Guardar"
        defaultValues={
          editProducto
            ? {
                nombre: editProducto.nombre ?? '',
                precio: editProducto.precio ?? 0,
                stock: editProducto.stock ?? 0,
                descripcion: '',
                activo: editProducto.activo ?? true,
              }
            : undefined
        }
        onSubmit={handleUpdate}
      />

      <DeleteProductoDialog
        producto={deleteProductoState}
        open={Boolean(deleteProductoState)}
        onOpenChange={(open) => {
          if (!open) setDeleteProductoState(null)
        }}
        onConfirm={handleDelete}
      />
    </section>
  )
}

interface ProductosTableProps {
  productos: Producto[]
  onEdit: (producto: Producto) => void
  onDelete: (producto: Producto) => void
}

function ProductosTable({ productos, onEdit, onDelete }: ProductosTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
              <TableCell>
                <Badge variant={producto.activo ? 'default' : 'secondary'}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
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
                    <DropdownMenuItem onClick={() => onEdit(producto)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(producto)}
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
