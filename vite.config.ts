import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Casino_ton/',
  build: { outDir: 'dist', target: 'esnext' },
  server: { port: 3000, open: true }
})
