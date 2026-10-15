<script setup lang="ts">
import { computed } from 'vue'
import { Wind, Zap, Activity, Cpu } from 'lucide-vue-next'

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
  if (safePpm.value < 700) return { label: 'ÓPTIMO', color: 'text-cyan-300', bg: 'bg-cyan-950/60 border-cyan-500/40', bar: 'bg-cyan-400' }
  if (safePpm.value <= 1000) return { label: 'MODERADO', color: 'text-amber-300', bg: 'bg-amber-950/60 border-amber-500/40', bar: 'bg-amber-400' }
  return { label: 'CRÍTICO', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/40', bar: 'bg-rose-500' }
})

// Porcentaje para barra de riesgo (400 a 2000 ppm)
const barPercent = computed(() => {
  const clamped = Math.max(350, Math.min(2000, safePpm.value))
  return Math.round(((clamped - 350) / (2000 - 350)) * 100)
})
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
          <Wind class="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>MQ-135</span>
            <span class="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">GPIO 34</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Calidad de Aire / CO2eq (SnO₂ Analógico)</p>
        </div>
      </div>
      <span class="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0" :class="[riskLevel.bg, riskLevel.color]">
        {{ riskLevel.label }}
      </span>
    </div>

    <!-- Valor Principal y Medidor de Barra -->
    <div class="space-y-1 font-mono">
      <div class="flex items-baseline justify-between">
        <span class="text-[9px] text-slate-400">CONCENTRACIÓN AIRE</span>
        <div class="flex items-baseline gap-1">
          <span class="text-xl sm:text-2xl font-black tracking-tight leading-none" :class="riskLevel.color">
            {{ safePpm }}
          </span>
          <span class="text-[10px] font-bold text-slate-400">PPM</span>
        </div>
      </div>

      <!-- Barra de Rangos de Riesgo -->
      <div class="space-y-0.5">
        <div class="h-1.5 w-full bg-slate-950 rounded-full border border-cyan-500/30 overflow-hidden p-0.5 relative">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="riskLevel.bar"
            :style="{ width: `${barPercent}%` }"
          />
        </div>
        <div class="flex justify-between text-[7.5px] font-mono text-slate-500">
          <span>400 (Óptimo)</span>
          <span>700 (Moderado)</span>
          <span>1000+ (Crítico)</span>
        </div>
      </div>
    </div>

    <!-- Métricas Eléctricas y Derivada -->
    <div class="grid grid-cols-3 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono">
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Cpu class="w-2.5 h-2.5 text-cyan-400" />
          <span>Raw ADC</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-cyan-300 leading-tight">{{ safeAdc }}</div>
        <div class="text-[7px] text-slate-500">12b (0-4095)</div>
      </div>

      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Zap class="w-2.5 h-2.5 text-amber-400" />
          <span>Voltaje</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-amber-300 leading-tight">{{ voltage }} V</div>
        <div class="text-[7px] text-slate-500">Aten. 3.3V</div>
      </div>

      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400 flex items-center justify-center gap-0.5">
          <Activity class="w-2.5 h-2.5 text-sky-400" />
          <span>Derivada</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold leading-tight" :class="safeDelta > 0 ? 'text-amber-400' : 'text-emerald-400'">
          {{ safeDelta > 0 ? `+${safeDelta}` : safeDelta }}
        </div>
        <div class="text-[7px] text-slate-500">PPM / min</div>
      </div>
    </div>
  </div>
</template>
