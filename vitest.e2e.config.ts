import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/e2e/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['tests/e2e/**/*.ts'],
      all: false, // Don't require coverage for E2E tests
    },
    testTimeout: 30000, // 30 seconds for E2E tests
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@aintandem/sdk-core': resolve(__dirname, './packages/core/src'),
      '@aintandem/sdk-react': resolve(__dirname, './packages/react/src'),
    },
  },
});
