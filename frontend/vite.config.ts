import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    proxy: {
      // El cliente llama a rutas relativas (/api/...) y Vite las reenvía al
      // backend local. Como el navegador solo habla con el dev server, no
      // hace falta CORS. En producción Nginx cumple el mismo papel.
      '/api': { target: 'http://localhost:8080' },
    },
  },
})
