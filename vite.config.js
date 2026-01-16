import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // you can change the dev server port if needed
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src', // optional: allows imports like "@/App.jsx"
    },
  },
})
