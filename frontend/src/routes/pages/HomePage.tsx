import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sistema de ventas</h1>
        <p className="max-w-prose text-muted-foreground">
          Base del frontend: enrutado con React Router, estado de servidor con
          TanStack Query y componentes con shadcn/ui. Las pantallas de productos,
          clientes, empleados y ventas llegan en las siguientes etapas.
        </p>
      </div>

      <Button asChild>
        <Link to="/login">Ir a ingreso</Link>
      </Button>
    </section>
  )
}
