import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './context'

/**
 * Guard de rutas privadas.
 *
 * Conserva la ruta intentada en `state.from` para que el login devuelva al
 * usuario exactamente donde quería ir, no a una pantalla por defecto.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
