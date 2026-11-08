import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/app/shared/components'),
      '@directives': path.resolve(__dirname, './src/app/shared/directives'),
      '@pipes': path.resolve(__dirname, './src/app/shared/pipes'),
      '@services': path.resolve(__dirname, './src/app/core/services'),
      '@interfaces': path.resolve(__dirname, './src/app/core/interfaces'),
      '@guards': path.resolve(__dirname, './src/app/core/guards'),
      '@interceptors': path.resolve(__dirname, './src/app/core/interceptors'),
    },
  },
});
