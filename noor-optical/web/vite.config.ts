import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The storefront calls the API through a same-origin `/api` path: the dev server
 * proxies it to the API service on the compose network. That keeps cookies and
 * sessions first-party and avoids CORS entirely in development.
 */
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

/**
 * The preview reaches this dev server through a rotating sandbox hostname.
 * Outside preview mode the allowlist is left untouched, so a normal `vite dev`
 * run keeps the default behaviour. The platform also injects
 * __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, which Vite appends on its own.
 */
const allowedHosts = previewMode && sandboxDomain ? [`.${sandboxDomain}`] : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://api:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
