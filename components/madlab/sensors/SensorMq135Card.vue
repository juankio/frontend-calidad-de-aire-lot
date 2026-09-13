<script setup lang="ts">
import { computed } from 'vue'
import { Wind, Zap, Activity, Cpu } from 'lucide-vue-next'
import LabScrew from '../LabScrew.vue'

const props = defineProps<{
  ppm: number
  rawAdc?: number
  deltaPpm?: number
}>()

const safePpm = computed(() => Number(props.ppm || 400))
const safeAdc = computed(() => Number(props.rawAdc ?? 608))
const voltage = computed(() => ((safeAdc.value * 3.3) / 4095).toFixed(2))
const safeDelta = computed(() => Number(props.deltaPpm || 0))

const riskLevel = computed(() => {
  if (safePpm.value < 700) return { label: 'ÓPTIMO', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40', bar: 'bg-emerald-500' }
  if (safePpm.value <= 1000) return { label: 'MODERADO', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40', bar: 'bg-amber-500' }
  return { label: 'CRÍTICO', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40', bar: 'bg-rose-500' }
})

// Porcentaje para barra de riesgo (400 a 2000 ppm)
const barPercent = computed(() => {
  const clamped = Math.max(350, Math.min(2000, safePpm.value))
  return Math.round(((clamped - 350) / (2000 - 350)) * 100)
})
</script>

<template>
  <div class="relative bg-gradient-to-b from-[#18120b] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e]/80 rounded-xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 overflow-hidden">
    <LabScrew class="absolute top-1.5 left-1.5" :rotation="15" />
    <LabScrew class="absolute top-1.5 right-1.5" :rotation="-25" />

    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-1 border-b border-[#854d0e]/40 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-[#27170a] border border-[#854d0e] flex items-center justify-center text-[#fbbf24] shadow-inner shrink-0">
          <Wind class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-journal font-bold text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5">
            <span>MQ-135</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#854d0e] text-amber-300">GPIO 34</span>
          </h4>
          <p class="text-[9px] font-mono text-stone-400">Calidad de Aire / CO2eq (SnO₂ Analógico)</p>
        </div>
      </div>
      <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0" :class="[riskLevel.bg, riskLevel.color]">
        {{ riskLevel.label }}
      </span>
    </div>

    <!-- Valor Principal y Medidor de Barra -->
    <div class="space-y-1.5">
      <div class="flex items-baseline justify-between">
        <span class="text-[10px] font-journal text-stone-400">Concentración de Aire</span>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl sm:text-3xl font-mono font-black tracking-tight" :class="riskLevel.color">
            {{ safePpm }}
          </span>
          <span class="text-[11px] font-mono font-bold text-stone-400">PPM</span>
        </div>
      </div>

      <!-- Barra de Rangos de Riesgo -->
      <div class="space-y-1">
        <div class="h-2 w-full bg-[#050403] rounded-full border border-[#854d0e]/50 overflow-hidden p-0.5 relative">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="riskLevel.bar"
            :style="{ width: `${barPercent}%` }"
          />
        </div>
        <div class="flex justify-between text-[8px] font-mono text-stone-500">
          <span>400 (Óptimo)</span>
          <span>700 (Moderado)</span>
          <span>1000+ (Crítico)</span>
        </div>
      </div>
    </div>

    <!-- Métricas Eléctricas y Derivada -->
    <div class="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-[#854d0e]/30 text-center">
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-amber-500" />
          <span>Raw ADC</span>
        </div>
        <div class="text-xs font-mono font-bold text-amber-300">{{ safeAdc }}</div>
        <div class="text-[7.5px] font-mono text-stone-500">12 bits (0-4095)</div>
      </div>

      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Zap class="w-2.5 h-2.5 text-amber-400" />
          <span>Voltaje</span>
        </div>
        <div class="text-xs font-mono font-bold text-[#fbbf24]">{{ voltage }} V</div>
        <div class="text-[7.5px] font-mono text-stone-500">Atenuación 3.3V</div>
      </div>

      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
          <Activity class="w-2.5 h-2.5 text-sky-400" />
          <span>Derivada</span>
        </div>
        <div class="text-xs font-mono font-bold" :class="safeDelta > 0 ? 'text-amber-400' : 'text-emerald-400'">
          {{ safeDelta > 0 ? `+${safeDelta}` : safeDelta }}
        </div>
        <div class="text-[7.5px] font-mono text-stone-500">PPM / min</div>
      </div>
    </div>
  </div>
</template>
