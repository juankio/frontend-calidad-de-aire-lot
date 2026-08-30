<script setup lang="ts">
import { computed, reactive, watch, onMounted } from 'vue'
import { FlaskConical, Flame } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import MadLabContainer from './MadLabContainer.vue'
import anime from 'animejs'

const props = withDefaults(defineProps<{
  ppm?: number
  label?: string
  temperature?: number
}>(), {
  ppm: 450,
  label: 'Matraz de Reactivo',
  temperature: 24.2
})

function getAlchemyState(ppmValue: number) {
  if (ppmValue > 1200) {
    return { name: 'ROJO TÓXICO', main: '#ef4444', deep: '#991b1b', light: '#fca5a5', badge: 'border-rose-500 text-rose-400 bg-rose-950/50' }
  }
  if (ppmValue >= 700) {
    return { name: 'ÁMBAR PESADO', main: '#f59e0b', deep: '#92400e', light: '#fde68a', badge: 'border-amber-500 text-amber-400 bg-amber-950/50' }
  }
  return { name: 'VERDE LIMPIO', main: '#10b981', deep: '#065f46', light: '#a7f3d0', badge: 'border-emerald-500 text-emerald-400 bg-emerald-950/50' }
}

const alchemyState = computed(() => getAlchemyState(props.ppm))

const liquidState = reactive({
  height: 25,
  mainColor: '#10b981',
  lightColor: '#a7f3d0',
  waveOffset: 4
})

watch(() => props.ppm, (newVal) => {
  const newState = getAlchemyState(newVal)
  const newHeight = Math.min(80, Math.max(25, (newVal / 2000) * 80))
  
  anime({
    targets: liquidState,
    height: newHeight,
    mainColor: newState.main,
    lightColor: newState.light,
    duration: 1500,
    easing: 'spring(1, 80, 15, 0)',
  })
})

onMounted(() => {
  const initial = getAlchemyState(props.ppm)
  liquidState.height = Math.min(80, Math.max(25, (props.ppm / 2000) * 80))
  liquidState.mainColor = initial.main
  liquidState.lightColor = initial.light

  anime({
    targets: liquidState,
    waveOffset: -4,
    direction: 'alternate',
    loop: true,
    duration: 1200,
    easing: 'easeInOutSine'
  })
})
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3.5">

    <!-- Encabezado -->
    <div class="flex items-center justify-between pb-2 border-b border-[#854d0e]/40 mb-2.5">
      <div class="flex items-center gap-1.5">
        <FlaskConical class="w-3.5 h-3.5 text-amber-400" />
        <span class="text-[11px] font-journal font-bold tracking-wider text-[#fbbf24]">{{ label }}</span>
      </div>
      <span class="text-[9px] font-mono px-2 py-0.5 rounded font-bold border" :class="alchemyState.badge">
        {{ alchemyState.name }}
      </span>
    </div>

    <!-- Escenario SVG Matraz -->
    <div class="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#060a10] to-[#020305] border border-[#854d0e]/30">
      <svg class="w-full h-full" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="flask-cut">
            <path d="M 90 25 L 90 55 L 60 112 Q 60 118 68 118 L 132 118 Q 140 118 140 112 L 110 55 L 110 25 Z" />
          </clipPath>
          <linearGradient id="glass-glare" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.3)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        <path d="M 110 38 Q 124 38 124 46 Q 124 54 118 58 Q 112 62 122 68 Q 132 74 124 82 Q 116 90 126 96 Q 134 102 128 110" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 110 38 Q 124 38 124 46 Q 124 54 118 58 Q 112 62 122 68 Q 132 74 124 82 Q 116 90 126 96 Q 134 102 128 110" fill="none" stroke="#67e8f9" stroke-width="0.8" stroke-dasharray="3,4" class="steam-flow" />

        <g class="steam-group">
          <path d="M 96 20 Q 92 12 97 6" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round" class="steam-wisp-1" />
          <path d="M 104 22 Q 108 14 102 4" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round" class="steam-wisp-2" />
        </g>

        <g clip-path="url(#flask-cut)">
          <rect x="50" :y="118 - liquidState.height" width="100" :height="liquidState.height" :fill="liquidState.mainColor" opacity="0.85" />
          <path :d="`M 50 ${118 - liquidState.height} Q 100 ${118 - liquidState.height - liquidState.waveOffset} 150 ${118 - liquidState.height} L 150 125 L 50 125 Z`" :fill="liquidState.lightColor" opacity="0.95" />
          <circle cx="85" cy="110" r="2.2" fill="#fff" opacity="0.8" class="bubble-fast" />
          <circle cx="102" cy="112" r="1.8" fill="#fff" opacity="0.8" class="bubble-slow" />
          <circle cx="115" cy="108" r="2.5" fill="#fff" opacity="0.8" class="bubble-mid" />
          <circle cx="94" cy="114" r="1.4" fill="#fff" opacity="0.8" class="bubble-fast-2" />
        </g>

        <path d="M 88 22 L 112 22 L 112 25 L 110 25 L 110 55 L 140 112 Q 140 118 132 118 L 68 118 Q 60 118 60 112 L 90 55 L 90 25 L 88 25 Z" fill="rgba(255,255,255,0.03)" stroke="#78716c" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 94 30 L 94 54 L 72 106" fill="none" stroke="url(#glass-glare)" stroke-width="2" stroke-linecap="round" />
        <line x1="102" y1="75" x2="108" y2="75" stroke="#a8a29e" stroke-width="0.8" />
        <line x1="106" y1="88" x2="114" y2="88" stroke="#a8a29e" stroke-width="0.8" />
        <line x1="110" y1="101" x2="120" y2="101" stroke="#a8a29e" stroke-width="0.8" />

        <line x1="66" y1="120" x2="60" y2="128" stroke="#78350f" stroke-width="2" stroke-linecap="round" />
        <line x1="134" y1="120" x2="140" y2="128" stroke="#78350f" stroke-width="2" stroke-linecap="round" />
        <rect x="94" y="122" width="12" height="6" rx="1" fill="#44403c" stroke="#d97706" stroke-width="0.8" />
        <circle cx="100" cy="120" r="2.5" fill="#38bdf8" class="animate-ping" opacity="0.6" />
      </svg>
    </div>

    <!-- Lecturas -->
    <div class="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-[#854d0e]/30 text-center">
      <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
        <div class="text-[8.5px] font-journal text-[#fbbf24] font-bold">CO2 Aire</div>
        <div class="text-[12px] font-mono font-black text-slate-100 mt-0.5">{{ Math.round(ppm) }}</div>
      </div>
      <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
        <div class="flex items-center justify-center gap-1 text-[8.5px] font-journal text-amber-400 font-bold">
          <Flame class="w-3 h-3 text-orange-400" />
          <span>Temp</span>
        </div>
        <div class="text-[12px] font-mono font-black text-slate-100 mt-0.5">{{ temperature.toFixed(1) }}°C</div>
      </div>
      <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
        <div class="text-[8.5px] font-journal text-[#fbbf24] font-bold">Volumen</div>
        <div class="text-[12px] font-mono font-black text-slate-100 mt-0.5">{{ Math.round(liquidState.height * 4.5) }} mL</div>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
@keyframes bubble-up { 0% { transform: translateY(0); opacity: 0; } 30%, 80% { opacity: 0.9; } 100% { transform: translateY(-50px); opacity: 0; } }
.bubble-fast { animation: bubble-up 1.6s infinite linear; }
.bubble-slow { animation: bubble-up 2.4s infinite linear 0.4s; }
.bubble-mid { animation: bubble-up 2.0s infinite linear 0.9s; }
.bubble-fast-2 { animation: bubble-up 1.8s infinite linear 1.2s; }
@keyframes steam-drift { 0% { transform: translateY(0) scaleX(1); opacity: 0; } 40% { opacity: 0.7; } 100% { transform: translateY(-16px) scaleX(1.4); opacity: 0; } }
.steam-wisp-1 { animation: steam-drift 2.2s infinite ease-out; }
.steam-wisp-2 { animation: steam-drift 2.8s infinite ease-out 0.8s; }
@keyframes dash-scroll { to { stroke-dashoffset: -14; } }
.steam-flow { animation: dash-scroll 1.2s infinite linear; }
</style>