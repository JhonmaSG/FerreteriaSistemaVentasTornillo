import { useState } from 'react'
import type { Empleado } from '@/api/types'
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
import { EmpleadoFormDialog } from '@/features/empleados/components/EmpleadoFormDialog'
import {
  useCreateEmpleado,
  useDeleteEmpleado,
  useEmpleados,
  useUpdateEmpleado,
} from '@/features/empleados/hooks'
import type { EmpleadoFormValues } from '@/features/empleados/schema'

export function EmpleadosPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useEmpleados()
  const createEmpleado = useCreateEmpleado()
  const updateEmpleado = useUpdateEmpleado()
  const deleteEmpleado = useDeleteEmpleado()

  const [createOpen, setCreateOpen] = useState(false)
  const [editEmpleado, setEditEmpleado] = useState<Empleado | null>(null)
  const [deleteEmpleadoState, setDeleteEmpleadoState] = useState<Empleado | null>(null)

  const handleCreate = async (values: EmpleadoFormValues) => {
    const payload = {
      dni: values.dni,
      nombres: values.nombres,
      apellidos: values.apellidos,
      telefono: values.telefono?.trim() || undefined,
      email: values.email,
      username: values.username,
      password: values.password || '',
    }
    await createEmpleado.mutateAsync(payload)
  }

  const handleUpdate = async (values: EmpleadoFormValues) => {
    if (!editEmpleado?.id) return
    const payload: Record<string, unknown> = {
      dni: values.dni,
      nombres: values.nombres,
      apellidos: values.apellidos,
      telefono: values.telefono?.trim() || undefined,
      email: values.email,
      username: values.username,
    }
    if (values.password && values.password.trim()) {
      payload.password = values.password
    }
    await updateEmpleado.mutateAsync({ id: editEmpleado.id, body: payload as never })
  }

  const handleDelete = async (empleado: Empleado) => {
    if (!empleado.id) return
    await deleteEmpleado.mutateAsync(empleado.id)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Empleados</h1>
          <p className="text-sm text-muted-foreground">Gestión de empleados del sistema.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Nuevo empleado</Button>
      </div>

      {isPending ? <SkeletonList /> : null}
      {isError ? (
        <ApiErrorAlert error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : null}
      {data && data.length === 0 ? <EmptyState /> : null}
      {data && data.length > 0 ? (
        <EmpleadosTable
          empleados={data}
          onEdit={(empleado) => setEditEmpleado(empleado)}
          onDelete={(empleado) => setDeleteEmpleadoState(empleado)}
        />
      ) : null}

      <EmpleadoFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo empleado"
        description="Registra un empleado en el sistema."
        submitLabel="Crear"
        onSubmit={handleCreate}
      />

      <EmpleadoFormDialog
        open={Boolean(editEmpleado)}
        onOpenChange={(open) => {
          if (!open) setEditEmpleado(null)
        }}
        title="Editar empleado"
        description="Actualiza la información del empleado. Deja la contraseña vacía para no cambiarla."
        submitLabel="Guardar"
        isEditing
        defaultValues={
          editEmpleado
            ? {
                dni: editEmpleado.dni ?? '',
                nombres: editEmpleado.nombres ?? '',
                apellidos: editEmpleado.apellidos ?? '',
                telefono: editEmpleado.telefono ?? '',
                email: editEmpleado.email ?? '',
                username: editEmpleado.username ?? '',
                password: '',
                activo: editEmpleado.activo ?? true,
              }
            : undefined
        }
        onSubmit={handleUpdate}
      />

      <DeleteConfirmDialog
        item={deleteEmpleadoState}
        open={Boolean(deleteEmpleadoState)}
        onOpenChange={(open) => {
          if (!open) setDeleteEmpleadoState(null)
        }}
        onConfirm={handleDelete}
        getLabel={(empleado) =>
          `${empleado.nombres ?? ''} ${empleado.apellidos ?? ''}`.trim() ||
          empleado.username ||
          empleado.dni ||
          'empleado'
        }
        title="Eliminar empleado"
      />
    </section>
  )
}

function EmpleadosTable({
  empleados,
  onEdit,
  onDelete,
}: {
  empleados: Empleado[]
  onEdit: (empleado: Empleado) => void
  onDelete: (empleado: Empleado) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Nombres</TableHead>
            <TableHead>Apellidos</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empleados.map((empleado, index) => (
            <TableRow key={empleado.id ?? index}>
              <TableCell className="font-medium">{empleado.dni ?? '—'}</TableCell>
              <TableCell>{empleado.username ?? '—'}</TableCell>
              <TableCell>{empleado.nombres ?? '—'}</TableCell>
              <TableCell>{empleado.apellidos ?? '—'}</TableCell>
              <TableCell>{empleado.email ?? '—'}</TableCell>
              <TableCell>{empleado.telefono ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={empleado.activo ? 'default' : 'secondary'}>
                  {empleado.activo ? 'Activo' : 'Inactivo'}
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
                    <DropdownMenuItem onClick={() => onEdit(empleado)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(empleado)}
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
    <div className="space-y-2" aria-label="Cargando empleados">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      No hay empleados registrados.
    </p>
  )
}
