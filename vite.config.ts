import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libs
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts
          'vendor-charts': ['recharts'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Utilities
          'vendor-utils': ['date-fns', 'uuid', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
})
