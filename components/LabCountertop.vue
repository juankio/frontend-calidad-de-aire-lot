<script setup lang="ts">
import { computed } from 'vue'
import LiveMascotWidget from './LiveMascotWidget.vue'

const props = withDefaults(defineProps<{
  ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  viewMode?: 'FACE' | 'HUD'
  isSimulatorRunning?: boolean
}>(), {
  ppm: 412, coPpm: 5.8, temperature: 23.8, humidity: 54,
  riskStatus: 'OPTIMAL', viewMode: 'FACE', isSimulatorRunning: false
})

const emit = defineEmits<{
  (e: 'toggleViewMode'): void
  (e: 'toggleSimulator'): void
}>()

// Reactividad de color según PPM (<700 Verde, 700-1200 Ámbar, >1200 Rojo)
const liquidTheme = computed(() => {
  if (props.ppm > 1200) return { fill: '#ef4444', text: 'text-rose-400', label: 'CRÍTICO' }
  if (props.ppm >= 700) return { fill: '#f59e0b', text: 'text-amber-400', label: 'PRECAUCIÓN' }
  return { fill: '#10b981', text: 'text-emerald-400', label: 'ÓPTIMO' }
})

const coLiquidColor = computed(() => props.coPpm > 25 ? '#ef4444' : props.coPpm > 10 ? '#f59e0b' : '#06b6d4')
const tubeFillHeight = computed(() => Math.min(68, Math.max(12, (props.ppm / 2000) * 68)))
const coFillHeight = computed(() => Math.min(68, Math.max(12, (props.coPpm / 50) * 68)))
const envFillHeight = computed(() => Math.min(68, Math.max(12, (props.humidity / 100) * 68)))
</script>

<template>
  <div class="relative w-full rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-neutral-950 border-t-2 border-x-2 border-slate-600 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] p-4 sm:p-5 overflow-hidden">
    <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 opacity-90"></div>
    <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <!-- Módulo Izquierdo: Gradilla de 3 Probetas Reactivas -->
      <div class="lg:col-span-4 bg-neutral-900/90 border border-slate-700/70 rounded-xl p-3 shadow-inner">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: liquidTheme.fill }"></span>
            <span class="text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase">Muestras Químicas</span>
          </div>
          <span class="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700" :class="liquidTheme.text">{{ liquidTheme.label }}</span>
        </div>

        <div class="flex justify-around items-end pt-1">
          <!-- Probeta 1: CO2eq / PPM -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-22 overflow-visible" viewBox="0 0 36 84">
              <rect x="6" y="2" width="24" height="4" rx="1" fill="#94a3b8" />
              <rect x="9" y="6" width="18" height="72" rx="9" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.5" />
              <clipPath id="tc-1"><rect x="10" y="7" width="16" height="70" rx="8" /></clipPath>
              <g clip-path="url(#tc-1)">
                <rect x="10" :y="78 - tubeFillHeight" width="16" :height="tubeFillHeight" :fill="liquidTheme.fill" opacity="0.85" />
                <circle cx="15" :cy="75 - (tubeFillHeight * 0.4)" r="1.5" fill="#fff" class="animate-bounce" opacity="0.6" />
              </g>
              <line v-for="n in 4" :key="n" x1="10" :y1="22 + n * 12" x2="16" :y2="22 + n * 12" stroke="#cbd5e1" stroke-width="0.8" opacity="0.5" />
            </svg>
            <span class="text-[9px] font-mono text-slate-400 font-bold">CO2eq</span>
          </div>

          <!-- Probeta 2: Monóxido CO -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-22 overflow-visible" viewBox="0 0 36 84">
              <rect x="6" y="2" width="24" height="4" rx="1" fill="#94a3b8" />
              <rect x="9" y="6" width="18" height="72" rx="9" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.5" />
              <clipPath id="tc-2"><rect x="10" y="7" width="16" height="70" rx="8" /></clipPath>
              <g clip-path="url(#tc-2)">
                <rect x="10" :y="78 - coFillHeight" width="16" :height="coFillHeight" :fill="coLiquidColor" opacity="0.85" />
                <circle cx="18" :cy="75 - (coFillHeight * 0.5)" r="1.2" fill="#fff" class="animate-pulse" opacity="0.5" />
              </g>
              <line v-for="n in 4" :key="n" x1="10" :y1="22 + n * 12" x2="16" :y2="22 + n * 12" stroke="#cbd5e1" stroke-width="0.8" opacity="0.5" />
            </svg>
            <span class="text-[9px] font-mono text-slate-400 font-bold">CO PPM</span>
          </div>

          <!-- Probeta 3: Temp & Hum -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-22 overflow-visible" viewBox="0 0 36 84">
              <rect x="6" y="2" width="24" height="4" rx="1" fill="#94a3b8" />
              <rect x="9" y="6" width="18" height="72" rx="9" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.5" />
              <clipPath id="tc-3"><rect x="10" y="7" width="16" height="70" rx="8" /></clipPath>
              <g clip-path="url(#tc-3)">
                <rect x="10" :y="78 - envFillHeight" width="16" :height="envFillHeight" fill="#38bdf8" opacity="0.85" />
                <circle cx="14" :cy="75 - (envFillHeight * 0.6)" r="1.3" fill="#fff" class="animate-bounce" opacity="0.5" />
              </g>
              <line v-for="n in 4" :key="n" x1="10" :y1="22 + n * 12" x2="16" :y2="22 + n * 12" stroke="#cbd5e1" stroke-width="0.8" opacity="0.5" />
            </svg>
            <span class="text-[9px] font-mono text-slate-400 font-bold">AMB %</span>
          </div>
        </div>
      </div>

      <!-- Módulo Central: Pantalla Circular GC9A01 sobre Base de Aluminio -->
      <div class="lg:col-span-5 flex flex-col items-center justify-center">
        <div class="p-2 rounded-full bg-gradient-to-tr from-slate-600 via-slate-400 to-slate-200 shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.6)] border-2 border-slate-500">
          <div class="p-1 rounded-full bg-neutral-950 border border-slate-700 shadow-inner">
            <LiveMascotWidget :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :view-mode="viewMode" />
          </div>
        </div>
        <div class="mt-2 flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-[10px] font-mono text-slate-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>TERMINAL ÓPTICO SENTINEL GC9A01</span>
        </div>
      </div>

      <!-- Módulo Derecho: Indicadores Digitales & Interruptores de Palanca -->
      <div class="lg:col-span-3 space-y-2.5">
        <div class="bg-neutral-900/90 border border-slate-700/70 rounded-xl p-2.5 shadow-inner font-mono">
          <span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase block mb-1">Sensores Calibrados</span>
          <div class="grid grid-cols-2 gap-1.5">
            <div class="p-1 rounded bg-slate-950 border border-slate-800 text-center">
              <span class="text-[8px] text-slate-500 block">GAS CO2eq</span>
              <span class="text-xs font-bold text-slate-200">{{ Math.round(ppm) }} <span class="text-[8px] text-slate-500">PPM</span></span>
            </div>
            <div class="p-1 rounded bg-slate-950 border border-slate-800 text-center">
              <span class="text-[8px] text-slate-500 block">DHT11 TEMP</span>
              <span class="text-xs font-bold text-slate-200">{{ temperature.toFixed(1) }} <span class="text-[8px] text-slate-500">°C</span></span>
            </div>
          </div>
        </div>

        <div class="bg-neutral-900/90 border border-slate-700/70 rounded-xl p-2.5 space-y-2">
          <button @click="emit('toggleSimulator')" class="w-full flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs font-mono transition-all" :class="isSimulatorRunning ? 'bg-amber-950/50 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'">
            <span class="text-[10px] font-bold">SIMULADOR</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-black" :class="isSimulatorRunning ? 'text-amber-400' : 'text-slate-600'">{{ isSimulatorRunning ? 'ON' : 'OFF' }}</span>
              <div class="w-6 h-3 rounded-full p-0.5" :class="isSimulatorRunning ? 'bg-amber-600' : 'bg-slate-800'">
                <div class="w-2 h-2 rounded-full bg-white transition-transform" :class="isSimulatorRunning ? 'translate-x-3' : 'translate-x-0'"></div>
              </div>
            </div>
          </button>

          <button @click="emit('toggleViewMode')" class="w-full flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs font-mono transition-all" :class="viewMode === 'FACE' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' : 'bg-sky-950/50 border-sky-500 text-sky-300'">
            <span class="text-[10px] font-bold">VISTA DISPLAY</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/10 uppercase">{{ viewMode === 'FACE' ? 'Mascota' : 'Tacómetro' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
