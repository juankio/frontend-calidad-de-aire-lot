<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Zap, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'

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
      bg: 'bg-emerald-950/60 border-emerald-500/40',
      bar: 'bg-emerald-500',
      icon: CheckCircle2
    }
  }
  if (safeCo.value <= 35) {
    return {
      label: 'ALERTA LEVE',
      desc: 'Ventilar ambiente inmediatamente',
      color: 'text-amber-300',
      bg: 'bg-amber-950/60 border-amber-500/40',
      bar: 'bg-amber-500',
      icon: AlertTriangle
    }
  }
  return {
    label: 'PELIGRO TÓXICO',
    desc: 'Evacuar recinto / Concentración letal',
    color: 'text-rose-400 animate-pulse',
    bg: 'bg-rose-950/70 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
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
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
          <Flame class="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>MQ-7</span>
            <span class="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">GPIO 35</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Monóxido de Carbono (CO Electroquímico)</p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0" :class="[coStatus.bg, coStatus.color]">
        <component :is="coStatus.icon" class="w-2.5 h-2.5" />
        <span>{{ coStatus.label }}</span>
      </div>
    </div>

    <!-- Valor Principal y Medidor CO -->
    <div class="space-y-1 font-mono">
      <div class="flex items-baseline justify-between">
        <span class="text-[9px] text-slate-400">GAS MONÓXIDO (CO)</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl sm:text-2xl font-black tracking-tight leading-none" :class="coStatus.color">
            {{ safeCo.toFixed(1) }}
          </span>
          <span class="text-[10px] font-bold text-slate-400">PPM CO</span>
        </div>
      </div>

      <!-- Barra de Seguridad CO -->
      <div class="space-y-0.5">
        <div class="h-1.5 w-full bg-slate-950 rounded-full border border-cyan-500/30 overflow-hidden p-0.5 relative">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="coStatus.bar"
            :style="{ width: `${Math.max(4, coPercent)}%` }"
          />
        </div>
        <div class="flex justify-between text-[7.5px] font-mono text-slate-500">
          <span>&lt;9 (Seguro)</span>
          <span>9-35 (Alerta)</span>
          <span>&gt;35 (Tóxico)</span>
        </div>
      </div>
      <p class="text-[8px] font-mono text-slate-400 text-right leading-none">{{ coStatus.desc }}</p>
    </div>

    <!-- Métricas Eléctricas -->
    <div class="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono">
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-cyan-400" />
          <span>Raw ADC MQ-7</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-cyan-300 leading-tight">{{ safeAdc }}</div>
        <div class="text-[7px] text-slate-500">ADC1_CH7 (12b)</div>
      </div>

      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Zap class="w-2.5 h-2.5 text-amber-400" />
          <span>Voltaje Sensor</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-amber-300 leading-tight">{{ voltage }} V</div>
        <div class="text-[7px] text-slate-500">Ciclo 1.4V / 5.0V</div>
      </div>
    </div>
  </div>
</template>
