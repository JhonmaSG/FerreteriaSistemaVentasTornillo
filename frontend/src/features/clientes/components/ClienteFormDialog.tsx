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
import { clienteSchema, type ClienteFormValues } from '@/features/clientes/schema'
import { zodResolver } from '@/lib/zodResolver'

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: Partial<ClienteFormValues>
  submitLabel: string
  onSubmit: (values: ClienteFormValues) => Promise<void>
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  submitLabel,
  onSubmit,
}: ClienteFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      dni: '',
      nombres: '',
      apellidos: '',
      direccion: '',
      telefono: '',
      email: '',
      activo: true,
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        dni: '',
        nombres: '',
        apellidos: '',
        direccion: '',
        telefono: '',
        email: '',
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
          if (field in clienteSchema.shape) {
            setError(field as keyof ClienteFormValues, { message })
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" {...register('dni')} />
              {errors.dni ? <p className="text-sm text-destructive">{errors.dni.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" {...register('nombres')} />
              {errors.nombres ? (
                <p className="text-sm text-destructive">{errors.nombres.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" {...register('apellidos')} />
              {errors.apellidos ? (
                <p className="text-sm text-destructive">{errors.apellidos.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} />
            {errors.direccion ? (
              <p className="text-sm text-destructive">{errors.direccion.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" {...register('telefono')} />
            {errors.telefono ? (
              <p className="text-sm text-destructive">{errors.telefono.message}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('activo')} />
            Cliente activo
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
