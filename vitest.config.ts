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
    // Use different environments for different test types
    environment: 'node',
    environmentMatchGlobs: [
      // React tests need jsdom environment - use more specific patterns
      ['packages/react/**/*.tsx', 'jsdom'],
    ],
    // Resolve workspace packages correctly
    resolveSnapshots: resolve(__dirname, './packages'),
  },
  resolve: {
    alias: {
      // Explicitly resolve MSW modules
      'msw/node': resolve(__dirname, './node_modules/.pnpm/msw@2.12.7_@types+node@20.19.27_typescript@5.9.3/node_modules/msw/lib/node/index.js'),
      'msw': resolve(__dirname, './node_modules/.pnpm/msw@2.12.7_@types+node@20.19.27_typescript@5.9.3/node_modules/msw/lib/core/index.js'),
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
