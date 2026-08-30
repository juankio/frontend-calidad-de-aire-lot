<script setup lang="ts">
import { computed } from 'vue'
import { Radio, Activity } from 'lucide-vue-next'
import MadLabContainer from './MadLabContainer.vue'
import LabScrew from './LabScrew.vue'

const props = withDefaults(defineProps<{
  history?: Array<{ timestamp: number; ppm: number; predicted_ppm_15m: number }>
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  predictedPpm15m?: number
  deltaPpm1m?: number
}>(), {
  history: () => [],
  riskStatus: 'OPTIMAL',
  predictedPpm15m: 412,
  deltaPpm1m: 0
})

const isSleeping = computed(() => props.riskStatus === 'SLEEPING')
const lastPpm = computed(() => (props.history?.length ? props.history[props.history.length - 1].ppm : 412))
const minPpm = computed(() => (props.history?.length ? Math.max(300, Math.min(...props.history.map(p => p.ppm)) - 40) : 350))
const maxPpm = computed(() => (props.history?.length ? Math.max(800, Math.max(...props.history.map(p => p.ppm)) + 60) : 800))

const pointsSvg = computed(() => {
  const pts = props.history || []
  if (pts.length < 2) return 'M 0 60 L 260 60'
  const w = 260, h = 100, range = maxPpm.value - minPpm.value || 1
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${((i / (pts.length - 1)) * w).toFixed(1)} ${(h - ((p.ppm - minPpm.value) / range) * h).toFixed(1)}`).join(' ')
})

const predLineSvg = computed(() => {
  const pts = props.history || []
  const w = 260, h = 100, range = maxPpm.value - minPpm.value || 1
  const startY = pts.length ? h - ((pts[pts.length - 1].ppm - minPpm.value) / range) * h : 60
  const endY = Math.max(8, Math.min(92, h - ((props.predictedPpm15m - minPpm.value) / range) * h))
  return `M 260 ${startY.toFixed(1)} L 310 ${endY.toFixed(1)}`
})

const predCircleY = computed(() => {
  const range = maxPpm.value - minPpm.value || 1
  const y = 100 - ((props.predictedPpm15m - minPpm.value) / range) * 100
  return Number.isFinite(y) ? Math.max(10, Math.min(110, y)) : 60
})
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full flex-1 flex flex-col">
    <!-- Cabecera e Instrumento -->
    <div class="flex items-center justify-between px-2 py-1 mb-2 rounded-lg bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] border border-[#854d0e]/50">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-stone-800">
          <span class="w-2.5 h-2.5 rounded-full border border-black transition-all shadow-[0_0_8px]"
            :class="isSleeping ? 'bg-slate-500 shadow-slate-500' : riskStatus === 'CRITICAL' ? 'bg-rose-500 shadow-rose-500 animate-ping' : riskStatus === 'WARNING_PREDICTIVE' ? 'bg-amber-400 shadow-amber-400 animate-pulse' : 'bg-emerald-400 shadow-emerald-400'" />
          <span class="text-[10px] font-journal font-bold tracking-wide" :class="isSleeping ? 'text-stone-400' : riskStatus === 'CRITICAL' ? 'text-rose-400' : riskStatus === 'WARNING_PREDICTIVE' ? 'text-amber-400' : 'text-emerald-400'">
            {{ isSleeping ? 'Modo Espera (Standby)' : riskStatus === 'CRITICAL' ? '¡Peligro! Aire Contaminado' : riskStatus === 'WARNING_PREDICTIVE' ? 'Alerta: Aire Cambiando' : 'Aire Limpio y Seguro' }}
          </span>
        </div>
        <span v-if="!isSleeping" class="text-[9px] font-mono text-stone-400 hidden sm:inline">Δ {{ deltaPpm1m >= 0 ? '+' : '' }}{{ deltaPpm1m.toFixed(1) }} PPM/min</span>
      </div>
      <div class="flex items-center gap-1 text-[9px] font-mono text-amber-300 font-bold">
        <Radio class="w-3 h-3" :class="isSleeping ? 'text-stone-500' : 'text-amber-400 animate-pulse'" />
        <span class="font-journal">Pronóstico en 15 min:</span>
        <strong class="text-white font-mono">{{ isSleeping ? '---' : `${predictedPpm15m} PPM` }}</strong>
      </div>
    </div>

    <!-- Pantalla CRT Fósforo Verde -->
    <div class="relative w-full flex-1 min-h-[140px] rounded-xl bg-[#020a04] border-2 border-[#00ff66]/30 overflow-hidden shadow-[inset_0_0_25px_rgba(0,255,102,0.18)]">
      <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 120" preserveAspectRatio="none">
        <defs>
          <pattern id="crt-grid" width="32" height="24" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 24" fill="none" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crt-grid)" />
        <line x1="0" y1="60" x2="320" y2="60" stroke="#00ff66" stroke-width="0.8" stroke-opacity="0.35" stroke-dasharray="2,2" />
        <line x1="160" y1="0" x2="160" y2="120" stroke="#00ff66" stroke-width="0.8" stroke-opacity="0.35" stroke-dasharray="2,2" />

        <g v-if="isSleeping">
          <line x1="0" y1="60" x2="320" y2="60" stroke="#00ff66" stroke-width="1.8" stroke-opacity="0.7" class="crt-glow-line animate-pulse" />
        </g>
        <g v-else>
          <path :d="pointsSvg" fill="none" stroke="#00ff66" stroke-width="2.2" stroke-linecap="round" class="crt-glow-line" />
          <path :d="predLineSvg" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3" class="crt-glow-pred" />
          <circle cx="310" :cy="predCircleY" r="3.5" fill="#fbbf24" class="animate-ping" opacity="0.8" />
        </g>
      </svg>

      <div class="absolute inset-0 pointer-events-none crt-scanlines" />

      <!-- OSD Modo Espera -->
      <div v-if="isSleeping" class="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
        <div class="px-3 py-1.5 rounded-lg bg-black/85 border border-[#00ff66]/60 text-[#00ff66] font-journal text-[10px] sm:text-xs font-bold tracking-wider text-center drop-shadow-[0_0_8px_#00ff66] animate-pulse">
          📟 Monitor de Aire en Tiempo Real • Esperando señal del sensor
        </div>
      </div>

      <!-- OSD Normal Activo -->
      <template v-else>
        <div class="absolute top-1.5 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-[#00ff66] opacity-90 drop-shadow-[0_0_4px_#00ff66]">
          <span class="font-journal">📟 Monitor en Vivo: <span class="font-mono font-bold">{{ lastPpm }} PPM</span></span>
          <span class="font-journal">Pronóstico +15m: <span class="font-mono font-bold">{{ predictedPpm15m }} PPM</span></span>
        </div>
        <div class="absolute bottom-1.5 left-2 flex items-center gap-3 text-[8px] font-mono text-[#00ff66]/70">
          <span>VENTANA: 2.0s/DIV</span>
          <span>ESCALA: 50 PPM/DIV</span>
        </div>
      </template>
    </div>

    <!-- Perillas de Laboratorio -->
    <div class="grid grid-cols-4 gap-2 mt-auto pt-2 border-t border-[#854d0e]/30 text-center font-mono">
      <div v-for="knob in ['TIEMPO', 'SENSIBILIDAD', 'DISPARO', 'FOCO']" :key="knob" class="flex flex-col items-center">
        <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1c1917] via-[#451a03] to-[#78350f] border border-[#fbbf24]/60 flex items-center justify-center shadow-inner relative">
          <div class="w-0.5 h-2 bg-[#fbbf24] absolute top-0.5 rounded-full" />
          <div class="w-1.5 h-1.5 rounded-full bg-[#1c1917] border border-[#d97706]" />
        </div>
        <span class="text-[7.5px] font-journal font-bold text-[#fbbf24] mt-0.5">{{ knob }}</span>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
.crt-scanlines { background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 2px); }
.crt-glow-line { filter: drop-shadow(0 0 5px #00ff66); }
.crt-glow-pred { filter: drop-shadow(0 0 4px #fbbf24); }
</style>