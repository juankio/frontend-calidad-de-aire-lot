<script setup lang="ts">
import { computed } from 'vue'
import { Thermometer, Droplets, Waves, Cpu } from 'lucide-vue-next'
import LabScrew from '../LabScrew.vue'

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

// Porcentajes de barras analógicas estilo termómetro y bulbo higrométrico
const tempPercent = computed(() => {
  // Rango 0°C a 50°C
  const clamped = Math.max(0, Math.min(50, safeTemp.value))
  return Math.round((clamped / 50) * 100)
})

const humPercent = computed(() => {
  // Rango 0% a 100%
  const clamped = Math.max(0, Math.min(100, safeHum.value))
  return Math.round(clamped)
})

const comfortIndex = computed(() => {
  if (safeTemp.value >= 20 && safeTemp.value <= 26 && safeHum.value >= 40 && safeHum.value <= 65) {
    return { label: 'CONFORT TÉRMICO', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/40' }
  }
  if (safeTemp.value > 30 || safeHum.value > 75) {
    return { label: 'BOCHORNO / CÁLIDO', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' }
  }
  return { label: 'ZONA REGULAR', color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/30' }
})
</script>

<template>
  <div class="relative bg-gradient-to-b from-[#18120b] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e]/80 rounded-xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 overflow-hidden">
    <LabScrew class="absolute top-1.5 left-1.5" :rotation="60" />
    <LabScrew class="absolute top-1.5 right-1.5" :rotation="-5" />

    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-1 border-b border-[#854d0e]/40 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-[#142217] border border-[#854d0e] flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
          <Thermometer class="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h4 class="font-journal font-bold text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5">
            <span>DHT11</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#854d0e] text-amber-300">GPIO 15</span>
          </h4>
          <p class="text-[9px] font-mono text-stone-400">Termohigrometría Digital (Bus 1-Wire)</p>
        </div>
      </div>
      <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0" :class="[comfortIndex.bg, comfortIndex.color]">
        {{ comfortIndex.label }}
      </span>
    </div>

    <!-- Indicadores Analógicos Duales (Termómetro y Humedad) -->
    <div class="grid grid-cols-2 gap-2">
      <!-- Columna Temperatura -->
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[9.5px] font-journal text-stone-400 flex items-center gap-1">
            <Thermometer class="w-3 h-3 text-amber-400" /> Temperatura
          </span>
          <span class="text-xs font-mono font-bold text-amber-400">{{ safeTemp.toFixed(1) }}°C</span>
        </div>
        <!-- Barra de mercurio simulada -->
        <div class="space-y-1">
          <div class="h-2 w-full bg-[#050403] rounded-full border border-[#854d0e]/50 overflow-hidden p-0.5">
            <div
              class="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
              :style="{ width: `${tempPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-[7.5px] font-mono text-stone-500">
            <span>0°C</span>
            <span>25°C</span>
            <span>50°C</span>
          </div>
        </div>
      </div>

      <!-- Columna Humedad -->
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[9.5px] font-journal text-stone-400 flex items-center gap-1">
            <Droplets class="w-3 h-3 text-sky-400" /> Humedad
          </span>
          <span class="text-xs font-mono font-bold text-sky-400">{{ safeHum.toFixed(0) }}% HR</span>
        </div>
        <!-- Barra de condensación simulada -->
        <div class="space-y-1">
          <div class="h-2 w-full bg-[#050403] rounded-full border border-[#854d0e]/50 overflow-hidden p-0.5">
            <div
              class="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-500"
              :style="{ width: `${humPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-[7.5px] font-mono text-stone-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Métricas Complementarias -->
    <div class="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#854d0e]/30 text-center">
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Waves class="w-2.5 h-2.5 text-teal-400" />
          <span>Punto de Rocío</span>
        </div>
        <div class="text-xs font-mono font-bold text-teal-300">{{ dewPoint }} °C</div>
        <div class="text-[7.5px] font-mono text-stone-500">Magnus-Tetens</div>
      </div>

      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-amber-500" />
          <span>Protocolo</span>
        </div>
        <div class="text-xs font-mono font-bold text-amber-300">Single-Wire</div>
        <div class="text-[7.5px] font-mono text-stone-500">Trama 40 bits</div>
      </div>
    </div>
  </div>
</template>
