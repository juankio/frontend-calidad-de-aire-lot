<script setup lang="ts">
import LiveMascotWidget from '../LiveMascotWidget.vue'
import { Sparkles } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  viewMode?: 'FACE' | 'HUD'
}>(), {
  ppm: 412,
  coPpm: 5.8,
  temperature: 23.8,
  humidity: 54,
  riskStatus: 'OPTIMAL',
  viewMode: 'FACE'
})

const bolts = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 45 * Math.PI) / 180
  return { cx: Math.round(150 + 134 * Math.cos(angle)), cy: Math.round(150 + 134 * Math.sin(angle)) }
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-center p-1.5 sm:p-3 select-none">
    <!-- Marco Ojo de Buey de Bronce / Latón con 8 Pernos (Adaptable: 230px Móvil / 280px Tablet / 300px Desktop) -->
    <div class="relative w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] lg:w-[300px] lg:h-[300px] flex items-center justify-center transition-all duration-300">
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="bronze-rim" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stop-color="transparent" />
            <stop offset="74%" stop-color="#451a03" />
            <stop offset="82%" stop-color="#b45309" />
            <stop offset="90%" stop-color="#fbbf24" />
            <stop offset="97%" stop-color="#78350f" />
            <stop offset="100%" stop-color="#291102" />
          </radialGradient>
          <linearGradient id="concave-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
            <stop offset="40%" stop-color="rgba(255,255,255,0.02)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0.5)" />
          </linearGradient>
        </defs>

        <circle cx="150" cy="150" r="148" fill="url(#bronze-rim)" stroke="#78350f" stroke-width="2" />
        <circle cx="150" cy="150" r="122" fill="none" stroke="#291102" stroke-width="3" />

        <g v-for="(b, idx) in bolts" :key="idx">
          <circle :cx="b.cx" :cy="b.cy" r="8.5" fill="#1c1917" stroke="#fbbf24" stroke-width="1.2" />
          <polygon :points="`${b.cx},${b.cy-5} ${b.cx+4.3},${b.cy-2.5} ${b.cx+4.3},${b.cy+2.5} ${b.cx},${b.cy+5} ${b.cx-4.3},${b.cy+2.5} ${b.cx-4.3},${b.cy-2.5}`" fill="#d97706" />
          <circle :cx="b.cx" :cy="b.cy" r="2" fill="#451a03" />
        </g>

        <ellipse cx="130" cy="100" rx="80" ry="40" fill="url(#concave-glass)" opacity="0.75" />
      </svg>

      <!-- Núcleo: Widget GC9A01 Centrado 1:1 con Escala Proporcional Óptima -->
      <div class="relative z-0 scale-[0.74] sm:scale-[0.88] lg:scale-95 transition-transform duration-300 flex items-center justify-center">
        <slot>
          <LiveMascotWidget 
            :ppm="ppm" 
            :co-ppm="coPpm" 
            :temperature="temperature" 
            :humidity="humidity" 
            :risk-status="riskStatus" 
            :view-mode="viewMode" 
          />
        </slot>
      </div>
    </div>

    <!-- Placa de Latón Identificadora -->
    <div class="mt-1 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] border border-[#854d0e]/60 shadow-md font-journal text-[9.5px] sm:text-[10px]">
      <Sparkles class="w-3 h-3 text-amber-400" />
      <span class="font-bold tracking-wide text-[#fbbf24]">
        Cápsula Centinela del Aire
      </span>
      <span class="w-1.5 h-1.5 rounded-full" :class="riskStatus === 'CRITICAL' ? 'bg-rose-500 animate-ping' : riskStatus === 'WARNING_PREDICTIVE' ? 'bg-amber-400' : 'bg-emerald-400'" />
    </div>
  </div>
</template>