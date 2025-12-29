import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'packages/**/*.spec.ts',
      'packages/**/*.spec.tsx',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json', 'text-summary'],
      include: ['packages/*/src/**/*'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'packages/core/src/types/',
        'dist/',
        'build/',
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@aintandem/sdk-core': resolve(__dirname, './packages/core/src'),
      '@aintandem/sdk-react': resolve(__dirname, './packages/react/src'),
    },
  },
});
