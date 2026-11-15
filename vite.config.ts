/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // URL ficticia: los tests nunca tocan la red real (MSW con onUnhandledFrame: 'error').
    env: { VITE_API_URL: 'https://api.test' },
    css: false,
    restoreMocks: true,
    passWithNoTests: true,
  },
});
