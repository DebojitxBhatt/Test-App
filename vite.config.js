import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', 
  optimizeDeps: {
    exclude: ['@electric-sql/pglite', 'sql.js']
  },
  
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  assetsInclude: ['**/*.wasm']
})
