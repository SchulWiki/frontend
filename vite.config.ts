import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8081,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified') || id.includes('hast') || id.includes('mdast')) {
            return 'vendor-markdown'
          }
          if (id.includes('node_modules/react') || id.includes('react-router') || id.includes('react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('@tanstack')) {
            return 'vendor-query'
          }
          if (id.includes('lucide') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance')) {
            return 'vendor-ui'
          }
        },
      },
    },
  },
})
