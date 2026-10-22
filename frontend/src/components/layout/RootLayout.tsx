import { Link, NavLink, Outlet } from 'react-router'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-foreground' : 'transition-colors hover:text-foreground'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-tight">
            Ferretería Tornillo
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              Ingresar
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        Ferretería Tornillo · Sistema de ventas
      </footer>
    </div>
  )
}
