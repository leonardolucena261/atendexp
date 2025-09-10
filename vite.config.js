import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2017'
  },
  server: {
    port: 3000
  }
});