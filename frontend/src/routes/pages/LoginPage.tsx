import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router'
import { ApiError } from '@/api/errors'
import { useAuth } from '@/auth/context'
import { loginSchema, type LoginFormValues } from '@/auth/loginSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@/lib/zodResolver'

interface LoginLocationState {
  from?: { pathname?: string }
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  const [failure, setFailure] = useState<ApiError | Error | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from?.pathname ?? '/productos'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null)

    try {
      await login(values.username, values.password)
    } catch (error) {
      setFailure(error instanceof Error ? error : new Error('No se pudo iniciar sesión'))

      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
          if (field === 'username' || field === 'password') {
            setError(field, { message })
          }
        }
      }
    }
  })

  return (
    <section className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
        <p className="text-sm text-muted-foreground">
          Accede con las credenciales registradas en el sistema.
        </p>
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? 'username-error' : undefined}
            {...register('username')}
          />
          {errors.username ? (
            <p id="username-error" className="text-sm text-destructive">
              {errors.username.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {failure ? (
          <div
            role="alert"
            className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
          >
            <p className="font-medium">{failure.message}</p>
            {failure instanceof ApiError && failure.status === 429 ? (
              <p className="text-muted-foreground">
                Demasiados intentos. Espera{' '}
                {failure.retryAfterSeconds ? `${failure.retryAfterSeconds} segundos` : 'un momento'}{' '}
                antes de reintentar.
              </p>
            ) : null}
            {failure instanceof ApiError && failure.correlationId ? (
              <p className="font-mono text-xs text-muted-foreground">
                Correlation ID: {failure.correlationId}
              </p>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </section>
  )
}
