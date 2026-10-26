import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/morning-dashboard/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '朝の情報チェック',
        short_name: '朝チェック',
        description: '天気とJRの運行情報をまとめて確認する自分専用アプリ',
        theme_color: '#315f9d',
        background_color: '#f3f6fb',
        display: 'standalone',
        start_url: '/morning-dashboard/',
        scope: '/morning-dashboard/',
        lang: 'ja',
        icons: [
          {
            src: '/morning-dashboard/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
})