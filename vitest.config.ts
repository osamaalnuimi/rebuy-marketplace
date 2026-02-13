import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts', '**/*.spec.ts'],
    },
  },
  esbuild: {
    target: 'es2022',
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/app/features'),
      '@shared': path.resolve(__dirname, './src/app/shared'),
      '@layout': path.resolve(__dirname, './src/app/layout'),
    },
  },
});
