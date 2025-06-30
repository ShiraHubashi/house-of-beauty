import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/beauty-store-frontend/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})