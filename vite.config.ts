import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

// Base path configurabile per GitHub Pages ("/NOME-REPO/") o dominio/root ("/").
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Cache della SOLA interfaccia essenziale. Nessun dato privato o API in cache.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Le chiamate Supabase (dati/API) non devono mai essere messe in cache.
        // I file scaricabili (es. il volantino PDF) non devono essere intercettati
        // dal fallback SPA, altrimenti il link restituisce index.html.
        navigateFallbackDenylist: [
          /^\/rest\//,
          /^\/auth\//,
          /^\/storage\//,
          /\.pdf$/i,
        ],
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Prima i luoghi',
        short_name: 'Prima i luoghi',
        description:
          'PWA civica per documentare criticità, risorse e proposte del territorio.',
        lang: 'it',
        theme_color: '#1f6f5c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-768.png',
            sizes: '768x768',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-768.png',
            sizes: '768x768',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
  },
});
