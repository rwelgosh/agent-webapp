import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable JSX in .js files
    include: "**/*.{jsx,tsx,js,ts}",
    // Enable Fast Refresh for development
    fastRefresh: true
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); 