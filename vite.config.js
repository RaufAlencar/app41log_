import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  root: "www",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "www/index.html")
      }
    }
  },
  css: {
    postcss: null  // Desativa o PostCSS integrado do Vite
  }
})
