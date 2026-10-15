import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        scifi: ['"Orbitron"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        mad: ['"Orbitron"', 'sans-serif'],
        journal: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      colors: {
        neutral: {
          950: '#030712',
          900: '#070b14',
          850: '#0b1120',
          800: '#111827',
          700: '#1e293b'
        },
        mecha: {
          dark: '#030712',
          obsidian: '#070b14',
          panel: '#0b1329',
          cyan: '#06b6d4',
          orange: '#f97316',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444'
        }
      }
    }
  }
} satisfies Config
