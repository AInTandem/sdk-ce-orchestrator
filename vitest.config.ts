import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
    // Only include tests from specific source directories, not node_modules
    include: [
      'packages/**/*.test.{ts,tsx}',
      'packages/**/*.spec.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}',
      'tests/**/*.spec.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/node_modules/**',
    ],
    // Ignore tests in example and nested dependency directories
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/examples/**/node_modules/**',
    ],
    // Use jsdom as default environment for all tests
    // Node tests will work in jsdom, but React tests need jsdom
    environment: 'jsdom',
    // Resolve workspace packages correctly
    resolveSnapshots: resolve(__dirname, './packages'),
  },
  // Resolve workspace packages to source directories
  resolve: {
    alias: {
      '@aintandem/sdk-core': resolve(__dirname, './packages/core/src'),
      '@aintandem/sdk-react': resolve(__dirname, './packages/react/src'),
    },
  },
  // Optimize for pnpm workspace
  optimizeDeps: {
    include: [
      '@aintandem/sdk-core',
      '@aintandem/sdk-react',
    ],
  },
});
