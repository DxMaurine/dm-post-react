import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'electron',
        'child_process',
        'fs',
        'path',
        'http',
        'os',
        'assert',
      ],
    },
  },
  optimizeDeps: {
    include: [],
  },
  plugins: [react()],
})
