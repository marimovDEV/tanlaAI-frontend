import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/static/react/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: '../backend/static/react',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api/v1': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
    },
  },
}))
