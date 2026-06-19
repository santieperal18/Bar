import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base configurable por entorno:
//  - Railway (y dev): base '/' por defecto (el sitio se sirve desde la raíz).
//  - GitHub Pages: el workflow setea VITE_BASE='/Bar/' (subcarpeta del repo).
export default defineConfig(() => ({
  base: process.env.VITE_BASE || '/',
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