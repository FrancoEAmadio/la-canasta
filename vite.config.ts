import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // La app se actualiza sola en segundo plano y funciona 100 % sin conexión.
      registerType: 'autoUpdate',
      includeAssets: ['iconos/icono.svg', 'iconos/apple-touch-icon.png'],
      manifest: {
        name: 'La Canasta — Anotador de Puntos',
        short_name: 'La Canasta',
        description: 'Anotador inteligente de puntos, jugadores/equipos y manual interactivo del juego de cartas Canasta.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B1437',
        theme_color: '#1E3A8A',
        icons: [
          { src: 'iconos/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'iconos/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'iconos/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Las tipografías de Google Fonts se guardan tras la primera carga para que la app siga igual sin conexión.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-estilos' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-archivos',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
