<script setup lang="ts">
import { computed } from 'vue'
import type { TelemetryData, HistoryPoint } from '~/composables/useAirGuardian'
import PredictionBanner from '../PredictionBanner.vue'
import TimeSeriesChart from '../TimeSeriesChart.vue'

const props = withDefaults(defineProps<{
  telemetry?: TelemetryData
  history?: HistoryPoint[]
  theme?: 'graphite' | 'white-lab'
}>(), {
  telemetry: () => ({
    ppm: 412,
    co_ppm: 5.8,
    temperature: 23.8,
    humidity: 54,
    delta_ppm_1m: 0,
    predicted_ppm_15m: 412,
    risk_status: 'OPTIMAL'
  }),
  history: () => [],
  theme: 'graphite'
})

const currentPpm = computed(() => props.telemetry?.ppm ?? 412)
const currentRisk = computed(() => props.telemetry?.risk_status ?? 'OPTIMAL')
const currentPred = computed(() => props.telemetry?.predicted_ppm_15m ?? 412)
const currentDelta = computed(() => props.telemetry?.delta_ppm_1m ?? 0)

const statusLeds = computed(() => [
  { name: 'MAIN PWR', on: true, color: 'bg-emerald-400', glow: 'shadow-[0_0_8px_#34d399]' },
  { name: 'MQ135 ADC', on: currentPpm.value > 0, color: 'bg-emerald-400', glow: 'shadow-[0_0_8px_#34d399]' },
  { 
    name: 'PRED T+15', 
    on: true, 
    color: currentRisk.value === 'WARNING_PREDICTIVE' ? 'bg-amber-400 animate-pulse' : currentRisk.value === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-emerald-400',
    glow: currentRisk.value === 'WARNING_PREDICTIVE' ? 'shadow-[0_0_8px_#f59e0b]' : currentRisk.value === 'CRITICAL' ? 'shadow-[0_0_8px_#f43f5e]' : 'shadow-[0_0_8px_#34d399]'
  },
  { name: 'DSP KALMAN', on: true, color: 'bg-sky-400', glow: 'shadow-[0_0_8px_#38bdf8]' },
  { 
    name: 'HEPA AIR', 
    on: currentPpm.value > 800, 
    color: currentPpm.value > 800 ? 'bg-amber-400 animate-pulse' : 'bg-slate-700', 
    glow: currentPpm.value > 800 ? 'shadow-[0_0_8px_#f59e0b]' : '' 
  }
])
</script>

<template>
  <div class="space-y-3.5 w-full select-none">
    <!-- Placa Metálica Remachada Bandeja I con Panel Annunciator LED -->
    <div 
      class="relative px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 shadow-md transition-colors"
      :class="theme === 'white-lab' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200 border-slate-300' : 'bg-gradient-to-r from-[#171c26] via-[#10141e] to-[#171c26] border-slate-700/80'"
    >
      <div class="pl-1">
        <span class="font-mono text-xs font-black tracking-widest uppercase drop-shadow" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-slate-100'">
          BANDEJA I • OSCILOSCOPIO & CURVA TEMPORAL
        </span>
        <span class="text-[9px] font-mono block tracking-wider" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
          MUESTREO EN TIEMPO REAL • BARRIDO FRECUENCIAL 1.0 HZ
        </span>
      </div>

      <div class="flex items-center gap-1.5 p-1 rounded-lg border shadow-inner" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950/90 border-slate-700/80'">
        <div 
          v-for="led in statusLeds" 
          :key="led.name"
          class="flex items-center gap-1 px-1.5 py-0.5 rounded border"
          :class="theme === 'white-lab' ? 'bg-white border-slate-300' : 'bg-neutral-900 border-neutral-800'"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full transition-all duration-300"
            :class="[led.color, led.on ? led.glow : 'bg-slate-700 opacity-40']"
          />
          <span class="text-[7px] font-mono font-bold tracking-wider uppercase" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-300'">
            {{ led.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Módulos Interiores: PredictionBanner & TimeSeriesChart -->
    <div class="space-y-3">
      <PredictionBanner
        :risk-status="currentRisk"
        :predicted-ppm15m="currentPred"
        :delta-ppm1m="currentDelta"
        :theme="theme"
      />
      <TimeSeriesChart :history="history" :theme="theme" />
    </div>
  </div>
</template>
