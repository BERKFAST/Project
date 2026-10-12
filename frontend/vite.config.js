import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    coverage: {
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.jsx'],
      exclude: ['src/main.jsx'],
    },
  },
});