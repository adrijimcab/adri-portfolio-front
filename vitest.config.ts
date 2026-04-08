/// <reference types="vitest" />
import { fileURLToPath } from 'node:url';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

// Vitest + Angular 21 (zoneless) configuration.
// Uses @analogjs/vite-plugin-angular to compile Angular components at test time.
const setupFilePath = fileURLToPath(new URL('./src/test-setup.ts', import.meta.url));

export default defineConfig({
  plugins: [
    angular({
      include: ['**/*.spec.ts', '**/test-setup.ts'],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [setupFilePath],
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/app/core/**/*.ts'],
      exclude: ['src/app/core/**/*.spec.ts', 'src/app/core/models/**'],
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
});
