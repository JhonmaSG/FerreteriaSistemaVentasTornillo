import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/routes/pages/HomePage'
import { LoginPage } from '@/routes/pages/LoginPage'
import { NotFoundPage } from '@/routes/pages/NotFoundPage'
import { ProductosPage } from '@/routes/pages/ProductosPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'productos', element: <ProductosPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
