<script setup lang="ts">
import { computed } from 'vue'
import { Thermometer, Droplets, Waves, Cpu } from 'lucide-vue-next'

const props = defineProps<{
  temperature: number
  humidity: number
}>()

const safeTemp = computed(() => Number(props.temperature || 24))
const safeHum = computed(() => Number(props.humidity || 50))

// Aproximación de Punto de Rocío (Dew Point Magnus-Tetens)
const dewPoint = computed(() => {
  const t = safeTemp.value
  const rh = Math.max(1, Math.min(100, safeHum.value))
  const dp = t - ((100 - rh) / 5)
  return dp.toFixed(1)
})

const tempPercent = computed(() => {
  const clamped = Math.max(0, Math.min(50, safeTemp.value))
  return Math.round((clamped / 50) * 100)
})

const humPercent = computed(() => {
  const clamped = Math.max(0, Math.min(100, safeHum.value))
  return Math.round(clamped)
})

const comfortIndex = computed(() => {
  if (safeTemp.value >= 20 && safeTemp.value <= 26 && safeHum.value >= 40 && safeHum.value <= 65) {
    return { label: 'CONFORT TÉRMICO', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-500/40' }
  }
  if (safeTemp.value > 30 || safeHum.value > 75) {
    return { label: 'BOCHORNO / CÁLIDO', color: 'text-amber-300', bg: 'bg-amber-950/60 border-amber-500/40' }
  }
  return { label: 'ZONA ESTABLE', color: 'text-cyan-300', bg: 'bg-cyan-950/60 border-cyan-500/30' }
})
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
          <Thermometer class="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>DHT11</span>
            <span class="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">GPIO 15</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Termohigrometría Digital (Bus 1-Wire)</p>
        </div>
      </div>
      <span class="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0" :class="[comfortIndex.bg, comfortIndex.color]">
        {{ comfortIndex.label }}
      </span>
    </div>

    <!-- Indicadores Duales (Temperatura y Humedad) -->
    <div class="grid grid-cols-2 gap-1.5 font-mono">
      <!-- Columna Temperatura -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 flex flex-col justify-between gap-1">
        <div class="flex items-center justify-between">
          <span class="text-[8.5px] text-slate-400 flex items-center gap-1">
            <Thermometer class="w-2.5 h-2.5 text-amber-400" /> TEMP
          </span>
          <span class="text-[11px] sm:text-xs font-bold text-amber-300">{{ safeTemp.toFixed(1) }}°C</span>
        </div>
        <div class="space-y-0.5">
          <div class="h-2.5 w-full bg-slate-950/90 rounded-full border border-cyan-500/35 overflow-hidden relative shadow-inner">
            <div
              class="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
              :class="safeTemp > 29 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'"
              :style="{ width: `${tempPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-[7px] font-mono text-slate-500">
            <span>0°C</span>
            <span>25°C</span>
            <span>50°C</span>
          </div>
        </div>
      </div>

      <!-- Columna Humedad -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 flex flex-col justify-between gap-1">
        <div class="flex items-center justify-between">
          <span class="text-[8.5px] text-slate-400 flex items-center gap-1">
            <Droplets class="w-2.5 h-2.5 text-cyan-400" /> HUMEDAD
          </span>
          <span class="text-[11px] sm:text-xs font-bold text-cyan-300">{{ safeHum.toFixed(0) }}% HR</span>
        </div>
        <div class="space-y-0.5">
          <div class="h-2.5 w-full bg-slate-950/90 rounded-full border border-cyan-500/35 overflow-hidden relative shadow-inner">
            <div
              class="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
              :style="{ width: `${humPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-[7px] font-mono text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Métricas Complementarias -->
    <div class="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono">
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Waves class="w-2.5 h-2.5 text-cyan-400" />
          <span>Punto de Rocío</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-cyan-300 leading-tight">{{ dewPoint }} °C</div>
        <div class="text-[7px] text-slate-500">Magnus-Tetens</div>
      </div>

      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-cyan-400" />
          <span>Protocolo</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-slate-200 leading-tight">Single-Wire</div>
        <div class="text-[7px] text-slate-500">Trama 40b</div>
      </div>
    </div>
  </div>
</template>
