// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  ignore: ['tests/**'],
  experimental: {
    appManifest: false
  },
  vite: {
    build: {
      emptyOutDir: false
    },
    optimizeDeps: {
      include: ['vue', 'leaflet', 'animejs']
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Air Guardian IoT • Laboratorio del Científico Loco',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma IoT de monitoreo predictivo de calidad de aire con ESP32, MPU-6050 y GC9A01' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Creepster&family=Special+Elite&family=Orbitron:wght@700&family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3002',
      wsBase: process.env.WS_BASE || 'ws://localhost:3002'
    }
  }
})
