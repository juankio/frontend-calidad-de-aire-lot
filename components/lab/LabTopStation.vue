<script setup lang="ts">
import { computed } from 'vue'
import LiveMascotWidget from '../LiveMascotWidget.vue'

const props = withDefaults(defineProps<{
  ppm?: number; coPpm?: number; temperature?: number; humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  viewMode?: 'FACE' | 'HUD'; isSimulatorRunning?: boolean
  theme?: 'graphite' | 'white-lab'
}>(), {
  ppm: 412, coPpm: 5.8, temperature: 23.8, humidity: 54,
  riskStatus: 'OPTIMAL', viewMode: 'FACE', isSimulatorRunning: false,
  theme: 'graphite'
})

const emit = defineEmits<{ (e: 'toggleViewMode'): void; (e: 'toggleSimulator'): void }>()

const gasTheme = computed(() => {
  if (props.ppm > 1200) return { fill: '#ef4444', label: 'CRÍTICO', light: '#fca5a5' }
  if (props.ppm >= 700) return { fill: '#f59e0b', label: 'REACTIVO', light: '#fde68a' }
  return { fill: '#10b981', label: 'ÓPTIMO', light: '#6ee7b7' }
})
const coTheme = computed(() => (props.coPpm > 25 ? '#ef4444' : props.coPpm > 10 ? '#f59e0b' : '#06b6d4'))
const hGas = computed(() => Math.min(58, Math.max(10, (props.ppm / 2000) * 58)))
const hCo = computed(() => Math.min(58, Math.max(10, (props.coPpm / 50) * 58)))
const hEnv = computed(() => Math.min(58, Math.max(10, (props.humidity / 100) * 58)))
</script>

<template>
  <div 
    class="relative w-full rounded-2xl border-2 transition-colors duration-300 p-4 sm:p-5 select-none shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
    :class="theme === 'white-lab' ? 'bg-[#f1f5f9] border-slate-300' : 'bg-[#0e1118] border-slate-700/80'"
  >
    <!-- Remaches de acero en 4 esquinas -->
    <div class="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-10"><div class="w-1.5 h-px bg-slate-900" /></div>
    <div class="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-10"><div class="w-1.5 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-10"><div class="w-1.5 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-10"><div class="w-1.5 h-px bg-slate-900" /></div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      <!-- 1. Gradilla de Probetas Pyrex -->
      <div 
        class="lg:col-span-4 border rounded-xl p-3.5 shadow-inner transition-colors"
        :class="theme === 'white-lab' ? 'bg-white border-slate-300' : 'bg-[#080a0f] border-slate-800/90'"
      >
        <div class="flex items-center justify-between pb-2 mb-2 border-b" :class="theme === 'white-lab' ? 'border-slate-200' : 'border-slate-800/80'">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full animate-ping" :style="{ backgroundColor: gasTheme.fill }" />
            <span class="text-[10px] font-mono font-bold tracking-widest uppercase" :class="theme === 'white-lab' ? 'text-slate-800' : 'text-slate-200'">GRADILLA PYREX</span>
          </div>
          <span class="text-[9px] font-mono px-2 py-0.5 rounded font-bold" :style="{ color: gasTheme.fill, border: `1px solid ${gasTheme.fill}`, backgroundColor: `${gasTheme.fill}15` }">{{ gasTheme.label }}</span>
        </div>

        <div class="flex justify-around items-end pt-1 rounded-lg p-2.5 border shadow-inner" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-[#040608] border-slate-800/60'">
          <!-- Probeta 1: Gas CO2eq Reactivo -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-24 overflow-visible" viewBox="0 0 36 90">
              <rect x="5" y="2" width="26" height="4" rx="2" fill="#475569" stroke="#64748b" stroke-width="0.8" />
              <rect x="8" y="6" width="20" height="78" rx="10" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.2" />
              <clipPath id="pyrex-1"><rect x="9" y="7" width="18" height="76" rx="9" /></clipPath>
              <g clip-path="url(#pyrex-1)">
                <rect x="9" :y="84 - hGas" width="18" :height="hGas" :fill="gasTheme.fill" opacity="0.85" />
                <path :d="`M 9 ${84 - hGas} Q 18 ${84 - hGas + 3} 27 ${84 - hGas} Z`" :fill="gasTheme.light" opacity="0.95" />
                <circle cx="15" cy="76" r="1.4" fill="#fff" class="bubble-anim-1" /><circle cx="21" cy="65" r="1.1" fill="#fff" class="bubble-anim-2" /><circle cx="17" cy="50" r="1.5" fill="#fff" class="bubble-anim-3" />
              </g>
              <line v-for="n in 5" :key="n" x1="10" :y1="18 + n * 11" x2="15" :y2="18 + n * 11" stroke="#94a3b8" stroke-width="0.75" opacity="0.6" />
              <rect x="22" y="10" width="2" height="68" rx="1" fill="#ffffff" opacity="0.25" />
            </svg>
            <span class="text-[9px] font-mono font-bold" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-400'">CO2eq</span>
          </div>

          <!-- Probeta 2: Monóxido CO -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-24 overflow-visible" viewBox="0 0 36 90">
              <rect x="5" y="2" width="26" height="4" rx="2" fill="#475569" stroke="#64748b" stroke-width="0.8" />
              <rect x="8" y="6" width="20" height="78" rx="10" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.2" />
              <clipPath id="pyrex-2"><rect x="9" y="7" width="18" height="76" rx="9" /></clipPath>
              <g clip-path="url(#pyrex-2)">
                <rect x="9" :y="84 - hCo" width="18" :height="hCo" :fill="coTheme" opacity="0.85" />
                <path :d="`M 9 ${84 - hCo} Q 18 ${84 - hCo + 3} 27 ${84 - hCo} Z`" fill="#e0f2fe" opacity="0.95" />
                <circle cx="16" cy="74" r="1.3" fill="#fff" class="bubble-anim-2" /><circle cx="19" cy="58" r="1.1" fill="#fff" class="bubble-anim-1" />
              </g>
              <line v-for="n in 5" :key="n" x1="10" :y1="18 + n * 11" x2="15" :y2="18 + n * 11" stroke="#94a3b8" stroke-width="0.75" opacity="0.6" />
              <rect x="22" y="10" width="2" height="68" rx="1" fill="#ffffff" opacity="0.25" />
            </svg>
            <span class="text-[9px] font-mono font-bold" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-400'">CO PPM</span>
          </div>

          <!-- Probeta 3: Solución Ambiente % HR -->
          <div class="flex flex-col items-center gap-1">
            <svg class="w-9 h-24 overflow-visible" viewBox="0 0 36 90">
              <rect x="5" y="2" width="26" height="4" rx="2" fill="#475569" stroke="#64748b" stroke-width="0.8" />
              <rect x="8" y="6" width="20" height="78" rx="10" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.2" />
              <clipPath id="pyrex-3"><rect x="9" y="7" width="18" height="76" rx="9" /></clipPath>
              <g clip-path="url(#pyrex-3)">
                <rect x="9" :y="84 - hEnv" width="18" :height="hEnv" fill="#06b6d4" opacity="0.85" />
                <path :d="`M 9 ${84 - hEnv} Q 18 ${84 - hEnv + 3} 27 ${84 - hEnv} Z`" fill="#cffafe" opacity="0.95" />
                <circle cx="15" cy="70" r="1.3" fill="#fff" class="bubble-anim-3" /><circle cx="20" cy="54" r="1.4" fill="#fff" class="bubble-anim-2" />
              </g>
              <line v-for="n in 5" :key="n" x1="10" :y1="18 + n * 11" x2="15" :y2="18 + n * 11" stroke="#94a3b8" stroke-width="0.75" opacity="0.6" />
              <rect x="22" y="10" width="2" height="68" rx="1" fill="#ffffff" opacity="0.25" />
            </svg>
            <span class="text-[9px] font-mono font-bold" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-400'">AMB %</span>
          </div>
        </div>
      </div>

      <!-- 2. Display GC9A01 Centrado 1:1 -->
      <div class="lg:col-span-4 flex flex-col items-center justify-center py-1">
        <LiveMascotWidget :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :view-mode="viewMode" />
        <div class="mt-2.5 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span class="text-[9px] font-mono font-bold uppercase tracking-widest" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-400'">TERMINAL ÓPTICO • GC9A01</span>
        </div>
      </div>

      <!-- 3. Palancas Industriales Metálicas Satinadas -->
      <div class="lg:col-span-4 space-y-3">
        <div 
          class="border rounded-xl p-3 shadow-inner transition-colors"
          :class="theme === 'white-lab' ? 'bg-white border-slate-300' : 'bg-[#080a0f] border-slate-800/90'"
        >
          <div class="flex items-center justify-between pb-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider" :class="theme === 'white-lab' ? 'text-slate-800' : 'text-slate-300'">SIMULADOR IOT</span>
            <div class="w-2 h-2 rounded-full" :class="isSimulatorRunning ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-500'" />
          </div>
          <button @click="emit('toggleSimulator')" class="mt-2 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-b from-[#1c2230] via-[#141822] to-[#0c0e14] border border-slate-700 text-xs font-mono text-slate-200 hover:border-slate-500 shadow-sm active:scale-[0.98] transition cursor-pointer">
            <span class="text-[10px] font-bold text-slate-300">PALANCA ESTADO</span>
            <div class="w-10 h-5 rounded-full p-0.5 bg-neutral-950 border border-slate-700 flex items-center transition" :class="isSimulatorRunning ? 'justify-end bg-amber-950/80 border-amber-500' : 'justify-start'">
              <div class="w-4 h-4 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 shadow-md border border-slate-300" />
            </div>
          </button>
        </div>

        <div 
          class="border rounded-xl p-3 shadow-inner transition-colors"
          :class="theme === 'white-lab' ? 'bg-white border-slate-300' : 'bg-[#080a0f] border-slate-800/90'"
        >
          <div class="flex items-center justify-between pb-1">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider" :class="theme === 'white-lab' ? 'text-slate-800' : 'text-slate-300'">MODO HUD / SENTINEL</span>
            <div class="w-2 h-2 rounded-full" :class="viewMode === 'FACE' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'" />
          </div>
          <button @click="emit('toggleViewMode')" class="mt-2 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-b from-[#1c2230] via-[#141822] to-[#0c0e14] border border-slate-700 text-xs font-mono text-slate-200 hover:border-slate-500 shadow-sm active:scale-[0.98] transition cursor-pointer">
            <span class="text-[10px] font-bold text-slate-300">{{ viewMode === 'FACE' ? 'MASCOTA' : 'TACÓMETRO' }}</span>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded font-black border" :class="viewMode === 'FACE' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/50' : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'">SWAP</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes rise {
  0% { transform: translateY(0); opacity: 0; }
  30%, 80% { opacity: 0.85; }
  100% { transform: translateY(-44px); opacity: 0; }
}
.bubble-anim-1 { animation: rise 2.2s infinite ease-in; }
.bubble-anim-2 { animation: rise 2.9s infinite ease-in 0.7s; }
.bubble-anim-3 { animation: rise 2.5s infinite ease-in 1.4s; }
</style>
