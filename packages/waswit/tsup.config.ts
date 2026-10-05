import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['../../frontend/src/core/sdk/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  loader: {
    '.wasm': 'file'
  }
});
