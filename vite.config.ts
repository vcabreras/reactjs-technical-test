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
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Núcleo que necesita la carga inicial, en un chunk propio: cambia poco entre
              // despliegues y el navegador lo reutiliza de caché. Solo estas librerías: un grupo
              // genérico de node_modules arrastraría a la carga inicial las de la ruta diferida
              // (p. ej. React Hook Form).
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|@tanstack)[\\/]/,
            },
          ],
        },
      },
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
