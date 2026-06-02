import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'url' // Native Node tool to handle paths safely

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Maps the "@" shorthand directly to your "src" directory
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
