import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Vercel serves the static `dist/` directory at the project root, so the
  // asset base path is `/`. Override with `VERCEL_PROJECT_PRODUCTION_URL` etc.
  // if you ever host under a sub-path.
  base: '/',
  build: {
    outDir: 'dist',
    // Keep chunk sizes readable so the production bundle is easier to debug
    // in DevTools and so the Vercel build log is informative.
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
