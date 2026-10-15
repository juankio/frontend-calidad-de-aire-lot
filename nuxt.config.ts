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
      include: ['vue', 'leaflet', 'animejs', 'three']
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Air Guardian IoT • Cyber-Mecha Tactical Command HUD',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma IoT de comando táctico y monitoreo predictivo de calidad de aire con ESP32, GC9A01 y Visor Cyber-Mecha' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: (process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE || 'https://servidor-taller.tailf19567.ts.net:10000').replace(/\/+$/, ''),
      wsBase: (process.env.NUXT_PUBLIC_WS_BASE || process.env.WS_BASE || 'wss://servidor-taller.tailf19567.ts.net:10000').replace(/\/+$/, '')
    }
  }
})
