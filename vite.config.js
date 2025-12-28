import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

// https://vite.dev/config/
export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['192.png', '512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'MyNotBusyAgenda',
        short_name: 'MyAgenda',
        description: 'A personal organization app for a clear mind.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  // Use root path for Capacitor builds, GitHub Pages path for web builds
  base: process.env.VITE_BUILD_TARGET === 'capacitor' ? '/' : '/MyNotBusyAgenda/',
})
