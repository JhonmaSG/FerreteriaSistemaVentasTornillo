import { useFieldArray, useForm } from 'react-hook-form'
import { useState } from 'react'
import { ApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ventaSchema, type VentaFormValues } from '@/features/ventas/schema'
import { zodResolver } from '@/lib/zodResolver'
import { formatCurrency } from '@/lib/format'
import type { Cliente, Empleado, Producto } from '@/api/types'

interface VentaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: Cliente[]
  empleados: Empleado[]
  productos: Producto[]
  onSubmit: (values: VentaFormValues) => Promise<void>
}

export function VentaFormDialog({
  open,
  onOpenChange,
  clientes,
  empleados,
  productos,
  onSubmit,
}: VentaFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteId: '',
      empleadoId: '',
      detalles: [{ productoId: '', cantidad: 1, precioVenta: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })
  const [rootError, setRootError] = useState<string | null>(null)
  const detallesWatch = watch('detalles')

  const total = (detallesWatch ?? []).reduce((sum, d) => {
    const qty = Number(d?.cantidad) || 0
    const price = Number(d?.precioVenta) || 0
    return sum + qty * price
  }, 0)

  const handleProductoChange = (index: number, productoId: string) => {
    const producto = productos.find((p) => p.id === productoId)
    setValue(`detalles.${index}.productoId`, productoId)
    if (producto?.precio !== undefined && producto?.precio !== null) {
      setValue(`detalles.${index}.precioVenta`, producto.precio)
    }
  }

  const submit = handleSubmit(async (values) => {
    setRootError(null)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          setError(field as unknown as keyof VentaFormValues, { message })
        }
        if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) {
          setRootError(error.message)
        }
      } else if (error instanceof Error) {
        setRootError(error.message)
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Nueva venta</DialogTitle>
          <DialogDescription>
            Registra una venta con cliente, empleado y productos.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select onValueChange={(v) => setValue('clienteId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id!}>
                      {c.nombres} {c.apellidos} - {c.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clienteId ? (
                <p className="text-sm text-destructive">{errors.clienteId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select onValueChange={(v) => setValue('empleadoId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((e) => (
                    <SelectItem key={e.id} value={e.id!}>
                      {e.nombres} {e.apellidos} - {e.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empleadoId ? (
                <p className="text-sm text-destructive">{errors.empleadoId.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Productos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productoId: '', cantidad: 1, precioVenta: 0 })}
              >
                Agregar producto
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-12">
                <div className="space-y-2 sm:col-span-6">
                  <Label>Producto</Label>
                  <Select onValueChange={(v) => handleProductoChange(index, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter((p) => p.activo !== false)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id!}>
                            {p.nombre} - {formatCurrency(p.precio)} (Stock: {p.stock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.detalles?.[index]?.productoId ? (
                    <p className="text-sm text-destructive">
                      {errors.detalles[index]?.productoId?.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Cantidad</Label>
                  <Input type="number" {...register(`detalles.${index}.cantidad` as const)} />
                  {errors.detalles?.[index]?.cantidad ? (
                    <p className="text-sm text-destructive">
                      {errors.detalles[index]?.cantidad?.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label>Precio venta</Label>
                  <Input
                    type="number"
                    step="1"
                    {...register(`detalles.${index}.precioVenta` as const)}
                  />
                  {errors.detalles?.[index]?.precioVenta ? (
                    <p className="text-sm text-destructive">
                      {errors.detalles[index]?.precioVenta?.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-end sm:col-span-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
            {errors.detalles?.message ? (
              <p className="text-sm text-destructive">{errors.detalles.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>

          {rootError ? (
            <p role="alert" className="text-sm text-destructive">
              {rootError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Registrar venta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
