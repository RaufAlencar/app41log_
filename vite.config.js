import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'www',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'www/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
