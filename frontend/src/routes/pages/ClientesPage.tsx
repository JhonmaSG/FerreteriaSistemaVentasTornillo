import { useState } from 'react'
import type { Cliente } from '@/api/types'
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
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { ClienteFormDialog } from '@/features/clientes/components/ClienteFormDialog'
import {
  useClientes,
  useCreateCliente,
  useDeleteCliente,
  useUpdateCliente,
} from '@/features/clientes/hooks'
import type { ClienteFormValues } from '@/features/clientes/schema'

export function ClientesPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useClientes()
  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()
  const deleteCliente = useDeleteCliente()

  const [createOpen, setCreateOpen] = useState(false)
  const [editCliente, setEditCliente] = useState<Cliente | null>(null)
  const [deleteClienteState, setDeleteClienteState] = useState<Cliente | null>(null)

  const handleCreate = async (values: ClienteFormValues) => {
    const payload = {
      dni: values.dni,
      nombres: values.nombres,
      apellidos: values.apellidos,
      direccion: values.direccion,
      telefono: values.telefono?.trim() || undefined,
      email: values.email,
    }
    await createCliente.mutateAsync(payload)
  }

  const handleUpdate = async (values: ClienteFormValues) => {
    if (!editCliente?.id) return
    const payload = {
      dni: values.dni,
      nombres: values.nombres,
      apellidos: values.apellidos,
      direccion: values.direccion,
      telefono: values.telefono?.trim() || undefined,
      email: values.email,
    }
    await updateCliente.mutateAsync({ id: editCliente.id, body: payload })
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!cliente.id) return
    await deleteCliente.mutateAsync(cliente.id)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestión de clientes del sistema.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Nuevo cliente</Button>
      </div>

      {isPending ? <SkeletonList /> : null}
      {isError ? (
        <ApiErrorAlert error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : null}
      {data && data.length === 0 ? <EmptyState /> : null}
      {data && data.length > 0 ? (
        <ClientesTable
          clientes={data}
          onEdit={(cliente) => setEditCliente(cliente)}
          onDelete={(cliente) => setDeleteClienteState(cliente)}
        />
      ) : null}

      <ClienteFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo cliente"
        description="Registra un cliente en el sistema."
        submitLabel="Crear"
        onSubmit={handleCreate}
      />

      <ClienteFormDialog
        open={Boolean(editCliente)}
        onOpenChange={(open) => {
          if (!open) setEditCliente(null)
        }}
        title="Editar cliente"
        description="Actualiza la información del cliente."
        submitLabel="Guardar"
        defaultValues={
          editCliente
            ? {
                dni: editCliente.dni ?? '',
                nombres: editCliente.nombres ?? '',
                apellidos: editCliente.apellidos ?? '',
                direccion: editCliente.direccion ?? '',
                telefono: editCliente.telefono ?? '',
                email: editCliente.email ?? '',
                activo: editCliente.activo ?? true,
              }
            : undefined
        }
        onSubmit={handleUpdate}
      />

      <DeleteConfirmDialog
        item={deleteClienteState}
        open={Boolean(deleteClienteState)}
        onOpenChange={(open) => {
          if (!open) setDeleteClienteState(null)
        }}
        onConfirm={handleDelete}
        getLabel={(cliente) =>
          `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim() || cliente.dni || 'cliente'
        }
        title="Eliminar cliente"
      />
    </section>
  )
}

function ClientesTable({
  clientes,
  onEdit,
  onDelete,
}: {
  clientes: Cliente[]
  onEdit: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Nombres</TableHead>
            <TableHead>Apellidos</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => (
            <TableRow key={cliente.id ?? index}>
              <TableCell className="font-medium">{cliente.dni ?? '—'}</TableCell>
              <TableCell>{cliente.nombres ?? '—'}</TableCell>
              <TableCell>{cliente.apellidos ?? '—'}</TableCell>
              <TableCell>{cliente.email ?? '—'}</TableCell>
              <TableCell>{cliente.telefono ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
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
                    <DropdownMenuItem onClick={() => onEdit(cliente)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(cliente)}
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
    <div className="space-y-2" aria-label="Cargando clientes">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      No hay clientes registrados.
    </p>
  )
}
