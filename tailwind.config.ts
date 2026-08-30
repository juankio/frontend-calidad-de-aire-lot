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
        mad: ['"Creepster"', 'cursive'],
        journal: ['"Special Elite"', 'cursive'],
        scifi: ['"Orbitron"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        neutral: {
          950: '#07090e',
          900: '#0c0e14',
          850: '#121620',
          800: '#1c2233',
          700: '#2d3345'
        }
      }
    }
  }
} satisfies Config
