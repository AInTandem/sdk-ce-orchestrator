import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    providers: 'src/providers/index.ts',
    hooks: 'src/hooks/index.ts',
    components: 'src/components/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@aintandem/sdk-core'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
