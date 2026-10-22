# Ferretería Tornillo — Frontend

Aplicación web del sistema de ventas. Consume la API REST del backend Spring Boot
del mismo repositorio.

## Stack

| Tecnología              | Uso                | Por qué                                           |
| ----------------------- | ------------------ | ------------------------------------------------- |
| React 19 + TypeScript 6 | UI y tipado        | Ecosistema amplio y tipos estrictos sin `any`     |
| Vite 8                  | Build y dev server | Arranque y HMR rápidos; build estático simple     |
| React Router 8          | Enrutado           | Rutas declarativas en modo librería, sin SSR      |
| TanStack Query 5        | Estado de servidor | Caché, reintentos y estados de carga sin Redux    |
| Tailwind CSS 4          | Estilos            | Utilidades con tokens de diseño, sin CSS huérfano |
| shadcn/ui               | Componentes        | Código propio accesible, no una caja negra        |

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

## Contrato de API

`openapi.json` se versiona para que la generación de tipos no dependa de que el
backend esté levantado (por ejemplo, en CI). Se refresca con `npm run api:refresh`
y se commitea junto con `src/api/schema.d.ts`.

Limitación actual del contrato: las operaciones documentan solo `200` y sin
`required`, así que los tipos generados marcan todos los campos como opcionales,
y los errores (`401`, `403`, `404`, `429`) se modelan a mano en el cliente.

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

## Estado

Etapa 1 completada: scaffold, tooling, router y shell. La app todavía no se
comunica con el backend; el proxy de Vite y el cliente HTTP llegan en la etapa 2.
