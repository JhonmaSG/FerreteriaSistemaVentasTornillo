import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { productoSchema, type ProductoFormValues } from '@/features/productos/schema'
import { zodResolver } from '@/lib/zodResolver'

interface ProductoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: Partial<ProductoFormValues>
  submitLabel: string
  onSubmit: (values: ProductoFormValues) => Promise<void>
}

export function ProductoFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  submitLabel,
  onSubmit,
}: ProductoFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      precio: 0,
      stock: 0,
      descripcion: '',
      activo: true,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        nombre: '',
        precio: 0,
        stock: 0,
        descripcion: '',
        activo: true,
        ...defaultValues,
      })
    }
  }, [open, defaultValues, reset])

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field in productoSchema.shape) {
            setError(field as keyof ProductoFormValues, { message })
          }
        }

        if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) {
          setError('root', { message: error.message })
        }
      } else if (error instanceof Error) {
        setError('root', { message: error.message })
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              aria-invalid={errors.nombre ? true : undefined}
              aria-describedby={errors.nombre ? 'nombre-error' : undefined}
              {...register('nombre')}
            />
            {errors.nombre ? (
              <p id="nombre-error" className="text-sm text-destructive">
                {errors.nombre.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (COP)</Label>
              <Input
                id="precio"
                type="number"
                inputMode="decimal"
                step="1"
                aria-invalid={errors.precio ? true : undefined}
                aria-describedby={errors.precio ? 'precio-error' : undefined}
                {...register('precio')}
              />
              {errors.precio ? (
                <p id="precio-error" className="text-sm text-destructive">
                  {errors.precio.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                inputMode="numeric"
                step="1"
                aria-invalid={errors.stock ? true : undefined}
                aria-describedby={errors.stock ? 'stock-error' : undefined}
                {...register('stock')}
              />
              {errors.stock ? (
                <p id="stock-error" className="text-sm text-destructive">
                  {errors.stock.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              aria-invalid={errors.descripcion ? true : undefined}
              aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              {...register('descripcion')}
            />
            {errors.descripcion ? (
              <p id="descripcion-error" className="text-sm text-destructive">
                {errors.descripcion.message}
              </p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('activo')} />
            Producto activo
          </label>

          {errors.root ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
