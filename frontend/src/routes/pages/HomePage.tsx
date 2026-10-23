import { Link } from 'react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sistema de ventas</h1>
        <p className="max-w-prose text-muted-foreground">
          Panel administrativo de Ferretería Tornillo. Gestiona productos, clientes, empleados y
          ventas desde un solo lugar con autenticación y validaciones centralizadas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Consulta y administra el catálogo de productos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/productos">Ir a productos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas</CardTitle>
            <CardDescription>Próximamente: registro de ventas y detalle de compra.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" disabled>
              <span>Próximamente</span>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Próximamente: gestión de clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" disabled>
              <span>Próximamente</span>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>Próximamente: gestión de empleados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" disabled>
              <span>Próximamente</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Etapa 4 en progreso</AlertTitle>
        <AlertDescription>
          Se amplía el shell con navegación por módulos, componentes compartidos y manejo mejorado
          de errores 403/429.
        </AlertDescription>
      </Alert>
    </section>
  )
}
