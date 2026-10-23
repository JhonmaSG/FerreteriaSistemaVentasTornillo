import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/auth/context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'transition-colors hover:text-foreground',
    isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
  )

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos', end: false },
  { to: '/clientes', label: 'Clientes', end: false },
  { to: '/empleados', label: 'Empleados', end: false },
  { to: '/ventas', label: 'Ventas', end: false },
] as const

export function RootLayout() {
  const { isAuthenticated, session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-tight">
            Ferretería Tornillo
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {session?.username}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Salir
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Ingresar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        Ferretería Tornillo · Sistema de ventas
      </footer>
    </div>
  )
}
