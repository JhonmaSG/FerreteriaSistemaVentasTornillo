# Ferretería Tornillo — Frontend

Aplicación web del sistema de ventas. Consume la API REST del backend Spring Boot
del mismo repositorio.

## Stack

| Tecnología                | Uso                | Por qué                                           |
| ------------------------- | ------------------ | ------------------------------------------------- |
| React 19 + TypeScript 5.9 | UI y tipado        | Ecosistema amplio y tipos estrictos sin `any`     |
| Vite 8                    | Build y dev server | Arranque y HMR rápidos; build estático simple     |
| React Router 8            | Enrutado           | Rutas declarativas en modo librería, sin SSR      |
| TanStack Query 5          | Estado de servidor | Caché, reintentos y estados de carga sin Redux    |
| React Hook Form + Zod     | Formularios        | Validación declarativa y errores por campo        |
| Tailwind CSS 4            | Estilos            | Utilidades con tokens de diseño, sin CSS huérfano |
| shadcn/ui                 | Componentes        | Código propio accesible, no una caja negra        |

## Requisitos

- Node.js >= 22.12 (lo exige el paquete `cn` que usa shadcn 4)
- npm >= 10

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # type-check (tsc -b) + build de producción
npm run preview      # servir el build localmente
npm run lint         # ESLint
npm run format       # Prettier
npm run format:check # verificar formato (para CI)
npm run api:pull     # refrescar openapi.json desde el backend local
npm run api:types    # regenerar src/api/schema.d.ts desde openapi.json
npm run api:refresh  # ambos, en orden
```

## Entorno

Copia `.env.example` a `.env` solo si necesitas apuntar a otra API; el valor por
defecto (vacío) funciona con el proxy de Vite en desarrollo y con Nginx en
producción. Los archivos `.env` no se versionan y no deben contener secretos:
todo lo que empieza por `VITE_` termina dentro del bundle.

## Contrato de API

`openapi.json` se versiona para que la generación de tipos no dependa de que el
backend esté levantado (por ejemplo, en CI). Se refresca con `npm run api:refresh`
y se commitea junto con `src/api/schema.d.ts`.

Limitación actual del contrato: las operaciones documentan solo `200` y sin
`required`, así que los tipos generados marcan todos los campos como opcionales,
y los errores (`401`, `403`, `404`, `429`) se modelan a mano en el cliente.

## Capa API

`src/api/client.ts` expone un cliente tipado con `openapi-fetch` sobre los tipos
del contrato. `baseUrl` se toma de `VITE_API_URL`; vacío significa mismo origen.
El middleware adjunta el token JWT cuando existe y convierte toda respuesta no
exitosa en `ApiError` (`status`, `message`, `fieldErrors`, `retryAfterSeconds`,
`correlationId`), definido en `src/api/errors.ts`.

## Estructura

```
src/
  api/                 Cliente HTTP y tipos generados desde OpenAPI (etapa 2)
  auth/                Sesión, token y guards de rutas (etapa 3)
  components/
    ui/                Componentes generados por shadcn/ui
    layout/            Shell de la aplicación (header, navegación)
    common/            Componentes compartidos entre dominios
  features/<dominio>/  Productos, clientes, empleados y ventas
  lib/                 Utilidades y configuración (queryClient, cn)
  routes/              Router y páginas de entrada
```

Los imports internos usan el alias `@/`, que apunta a `src/`.

## Autenticación

El login llama a `POST /api/auth/login` y guarda `{ token, username, roles }` en
`sessionStorage`: la sesión muere al cerrar la pestaña y el token no queda en
`localStorage`. Es una decisión de MVP; en producción corresponde una cookie
`httpOnly` con refresh token, fuera del alcance de JavaScript.

`ProtectedRoute` envuelve las rutas privadas y conserva el destino original en
`state.from`, de modo que el login devuelve al usuario donde quería entrar. Si
cualquier respuesta es `401` (token vencido o revocado), el middleware del
cliente limpia la sesión, emite `ft:unauthorized` y el `AuthProvider` cierra
sesión y vacía la caché de TanStack Query para no mostrar datos del usuario
anterior.

## Estado

Etapas 1 a 7 completadas: scaffold, tooling, router, shell, contrato OpenAPI,
cliente HTTP tipado, proxy, autenticación, CRUD de Productos/Clientes/Empleados
y módulo de Ventas.

La aplicación cubre el flujo principal de ventas del sistema. Pendiente pulido
y CI (Etapa 8).
