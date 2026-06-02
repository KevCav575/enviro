import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: { '@': '/src' },
  },

  server: {
    // En dev, /api/* se proxea al servidor Express en :3001
    // En producción (Vercel), /api/* va directo a la serverless function
    proxy: {
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
