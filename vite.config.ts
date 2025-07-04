import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://us-central1-mat1-9e6b3.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Use '@' for cleaner imports like '@/components/TripForm'
    },
  },
  define: {
    // Set Firestore emulator host for development mode
    ...(command === 'serve' && {
      'process.env.FIREBASE_FIRESTORE_EMULATOR_HOST': JSON.stringify('127.0.0.1:8081'),
    }),
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore'],
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'firebase/app', 'firebase/firestore'],
        },
      },
    },
  },
}));