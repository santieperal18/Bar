import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El sitio se publica en https://santieperal18.github.io/Bar/
// En build usamos base '/Bar/'; en desarrollo queda en '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Bar/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
}))