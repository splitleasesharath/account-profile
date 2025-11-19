import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // Copy _redirects to dist folder for Cloudflare Pages
        copyFileSync('_redirects', 'dist/_redirects');
        console.log('✅ Copied _redirects to dist/');
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    // Handle /account-profile/* routes in dev mode
    proxy: {
      '^/account-profile/.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => '/index.html'
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
});
