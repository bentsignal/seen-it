import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig, BuildOptions } from 'vite';
import manifest from './manifest.json';
import pkg from './package.json';

const isDev = process.env.NODE_ENV !== 'production';

export const baseManifest = {
  ...manifest,
  version: pkg.version,
};

export const baseBuildOptions: BuildOptions = {
  sourcemap: isDev,
  emptyOutDir: !isDev,
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: resolve(__dirname, 'public'),
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
