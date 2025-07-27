import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://us-central1-matdash-19d20.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/firestore',
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      'date-fns'
    ],
    exclude: ['lucide-react']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          charts: ['recharts', 'd3'],
          pdf: ['jspdf', 'jspdf-autotable', '@react-pdf/renderer'],
          spreadsheet: ['xlsx', 'papaparse'],
          utils: ['date-fns', 'uuid']
        }
      }
    }
  }
});
