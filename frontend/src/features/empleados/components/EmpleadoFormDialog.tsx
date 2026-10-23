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
import { empleadoSchema, type EmpleadoFormValues } from '@/features/empleados/schema'
import { zodResolver } from '@/lib/zodResolver'

interface EmpleadoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: Partial<EmpleadoFormValues>
  submitLabel: string
  isEditing?: boolean
  onSubmit: (values: EmpleadoFormValues) => Promise<void>
}

export function EmpleadoFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  submitLabel,
  isEditing = false,
  onSubmit,
}: EmpleadoFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      dni: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      email: '',
      username: '',
      password: '',
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
        telefono: '',
        email: '',
        username: '',
        password: '',
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
          if (field in empleadoSchema.shape) {
            setError(field as keyof EmpleadoFormValues, { message })
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" {...register('username')} disabled={isEditing} />
              {errors.username ? (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña {isEditing ? '(opcional)' : ''}</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
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
            Empleado activo
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
