<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Zap, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'
import LabScrew from '../LabScrew.vue'

const props = defineProps<{
  coPpm: number
  rawAdc?: number
}>()

const safeCo = computed(() => Number(props.coPpm || 0))
const safeAdc = computed(() => Number(props.rawAdc ?? 1302))
const voltage = computed(() => ((safeAdc.value * 3.3) / 4095).toFixed(2))

// Umbrales OMS / OSHA para Monóxido de Carbono (CO)
const coStatus = computed(() => {
  if (safeCo.value < 9) {
    return {
      label: 'SEGURO',
      desc: 'Nivel normal en recinto cerrado',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/40',
      bar: 'bg-emerald-500',
      icon: CheckCircle2
    }
  }
  if (safeCo.value <= 35) {
    return {
      label: 'ALERTA LEVE',
      desc: 'Ventilar ambiente inmediatamente',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20 border-amber-500/40',
      bar: 'bg-amber-500',
      icon: AlertTriangle
    }
  }
  return {
    label: 'PELIGRO TÓXICO',
    desc: 'Evacuar recinto / Concentración letal',
    color: 'text-rose-400 animate-pulse',
    bg: 'bg-rose-500/25 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    bar: 'bg-rose-500',
    icon: ShieldAlert
  }
})

// Barra de nivel porcentual (0 a 60 ppm CO)
const coPercent = computed(() => {
  const clamped = Math.max(0, Math.min(60, safeCo.value))
  return Math.round((clamped / 60) * 100)
})
</script>

<template>
  <div class="relative bg-gradient-to-b from-[#18120b] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e]/80 rounded-xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 overflow-hidden">
    <LabScrew class="absolute top-1.5 left-1.5" :rotation="48" />
    <LabScrew class="absolute top-1.5 right-1.5" :rotation="-12" />

    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-1 border-b border-[#854d0e]/40 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-[#2b160b] border border-[#854d0e] flex items-center justify-center text-amber-500 shadow-inner shrink-0">
          <Flame class="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h4 class="font-journal font-bold text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5">
            <span>MQ-7</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#854d0e] text-amber-300">GPIO 35</span>
          </h4>
          <p class="text-[9px] font-mono text-stone-400">Monóxido de Carbono (CO Electroquímico)</p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0" :class="[coStatus.bg, coStatus.color]">
        <component :is="coStatus.icon" class="w-2.5 h-2.5" />
        <span>{{ coStatus.label }}</span>
      </div>
    </div>

    <!-- Valor Principal y Medidor CO -->
    <div class="space-y-1.5">
      <div class="flex items-baseline justify-between">
        <span class="text-[10px] font-journal text-stone-400">Gas Monóxido (CO)</span>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl sm:text-3xl font-mono font-black tracking-tight" :class="coStatus.color">
            {{ safeCo.toFixed(1) }}
          </span>
          <span class="text-[11px] font-mono font-bold text-stone-400">PPM CO</span>
        </div>
      </div>

      <!-- Barra de Seguridad CO -->
      <div class="space-y-1">
        <div class="h-2 w-full bg-[#050403] rounded-full border border-[#854d0e]/50 overflow-hidden p-0.5 relative">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="coStatus.bar"
            :style="{ width: `${Math.max(4, coPercent)}%` }"
          />
        </div>
        <div class="flex justify-between text-[8px] font-mono text-stone-500">
          <span>&lt;9 (Seguro)</span>
          <span>9-35 (Alerta)</span>
          <span>&gt;35 (Tóxico)</span>
        </div>
      </div>
      <p class="text-[8.5px] font-journal text-stone-400 text-right italic">{{ coStatus.desc }}</p>
    </div>

    <!-- Métricas Eléctricas -->
    <div class="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#854d0e]/30 text-center">
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-amber-500" />
          <span>Raw ADC MQ-7</span>
        </div>
        <div class="text-xs font-mono font-bold text-amber-300">{{ safeAdc }}</div>
        <div class="text-[7.5px] font-mono text-stone-500">ADC1_CH7 (12b)</div>
      </div>

      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Zap class="w-2.5 h-2.5 text-amber-400" />
          <span>Voltaje Sensor</span>
        </div>
        <div class="text-xs font-mono font-bold text-[#fbbf24]">{{ voltage }} V</div>
        <div class="text-[7.5px] font-mono text-stone-500">Ciclo 1.4V / 5.0V</div>
      </div>
    </div>
  </div>
</template>
