<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
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

const isContainerExpanded = ref(false)

const isSleeping = computed(() => props.riskStatus === 'SLEEPING')
const lastPpm = computed(() => (props.history?.length ? props.history[props.history.length - 1].ppm : 412))
const minPpm = computed(() => (props.history?.length ? Math.max(300, Math.min(...props.history.map(p => p.ppm)) - 40) : 350))
const maxPpm = computed(() => (props.history?.length ? Math.max(800, Math.max(...props.history.map(p => p.ppm)) + 60) : 800))

// Coordenadas dinámicas Tektronix Graticule
const viewWidth = computed(() => isContainerExpanded.value ? 600 : 320)
const viewHeight = computed(() => isContainerExpanded.value ? 300 : 120)
const plotWidth = computed(() => isContainerExpanded.value ? 500 : 260)
const plotHeight = computed(() => isContainerExpanded.value ? 230 : 100)
const plotOffsetY = computed(() => isContainerExpanded.value ? 35 : 10)
const midY = computed(() => viewHeight.value / 2)
const midX = computed(() => viewWidth.value / 2)

const pointsSvg = computed(() => {
  const pts = props.history || []
  const w = plotWidth.value
  const h = plotHeight.value
  const offY = plotOffsetY.value
  if (pts.length < 2) return `M 0 ${midY.value} L ${w} ${midY.value}`
  const range = maxPpm.value - minPpm.value || 1
  return pts.map((p, i) => {
    const x = ((i / (pts.length - 1)) * w).toFixed(1)
    const y = (offY + (h - ((p.ppm - minPpm.value) / range) * h)).toFixed(1)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const predLineSvg = computed(() => {
  const pts = props.history || []
  const w = plotWidth.value
  const h = plotHeight.value
  const offY = plotOffsetY.value
  const targetX = viewWidth.value - (isContainerExpanded.value ? 35 : 10)
  const range = maxPpm.value - minPpm.value || 1
  const startY = pts.length ? offY + (h - ((pts[pts.length - 1].ppm - minPpm.value) / range) * h) : midY.value
  const endY = Math.max(offY + 8, Math.min(offY + h - 8, offY + (h - ((props.predictedPpm15m - minPpm.value) / range) * h)))
  return `M ${w} ${startY.toFixed(1)} L ${targetX} ${endY.toFixed(1)}`
})

const predCirclePos = computed(() => {
  const h = plotHeight.value
  const offY = plotOffsetY.value
  const targetX = viewWidth.value - (isContainerExpanded.value ? 35 : 10)
  const range = maxPpm.value - minPpm.value || 1
  const y = offY + (h - ((props.predictedPpm15m - minPpm.value) / range) * h)
  return {
    cx: targetX,
    cy: Number.isFinite(y) ? Math.max(offY + 8, Math.min(offY + h - 8, y)) : midY.value
  }
})
</script>

<template>
  <MadLabContainer v-model:expanded="isContainerExpanded" no-padding>
    <div
      class="p-3 w-full h-full flex flex-col select-none transition-all duration-300"
      :class="isContainerExpanded ? 'gap-3 overflow-y-auto' : 'overflow-hidden'"
    >
      <!-- Cabecera e Instrumento -->
      <div
        class="flex items-center justify-between rounded-lg bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] border border-[#854d0e]/50 shrink-0 transition-all"
        :class="isContainerExpanded ? 'px-3 py-2 text-xs' : 'px-2 py-1 mb-2 text-[9px]'"
      >
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-stone-800">
            <span
              class="w-2.5 h-2.5 rounded-full border border-black transition-all shadow-[0_0_8px]"
              :class="isSleeping ? 'bg-slate-500 shadow-slate-500' : riskStatus === 'CRITICAL' ? 'bg-rose-500 shadow-rose-500 animate-ping' : riskStatus === 'WARNING_PREDICTIVE' ? 'bg-amber-400 shadow-amber-400 animate-pulse' : 'bg-emerald-400 shadow-emerald-400'"
            />
            <span
              class="font-journal font-bold tracking-wide"
              :class="[
                isContainerExpanded ? 'text-xs' : 'text-[10px]',
                isSleeping ? 'text-stone-400' : riskStatus === 'CRITICAL' ? 'text-rose-400' : riskStatus === 'WARNING_PREDICTIVE' ? 'text-amber-400' : 'text-emerald-400'
              ]"
            >
              {{ isSleeping ? 'Modo Espera (Standby)' : riskStatus === 'CRITICAL' ? '¡Peligro! Concentración Crítica' : riskStatus === 'WARNING_PREDICTIVE' ? 'Alerta: Tendencia al Alza' : 'Calidad de Aire Óptima' }}
            </span>
          </div>
          <span v-if="!isSleeping" class="font-mono text-stone-400 hidden sm:inline" :class="isContainerExpanded ? 'text-[10.5px]' : 'text-[9px]'">
            Δ {{ deltaPpm1m >= 0 ? '+' : '' }}{{ deltaPpm1m.toFixed(1) }} PPM/min
          </span>
        </div>
        <div class="flex items-center gap-1.5 font-mono text-amber-300 font-bold" :class="isContainerExpanded ? 'text-[11px]' : 'text-[9px]'">
          <Radio class="w-3.5 h-3.5" :class="isSleeping ? 'text-stone-500' : 'text-amber-400 animate-pulse'" />
          <span class="font-journal">Pronóstico +15 min:</span>
          <strong class="text-white font-mono text-amber-200">{{ isSleeping ? '---' : `${predictedPpm15m} PPM` }}</strong>
        </div>
      </div>

      <!-- Pantalla CRT Fósforo Verde Tektronix -->
      <div
        class="relative w-full rounded-xl bg-[#020a04] border-2 border-[#00ff66]/30 overflow-hidden shadow-[inset_0_0_35px_rgba(0,255,102,0.22)] transition-all duration-300"
        :class="isContainerExpanded ? 'min-h-[380px] sm:min-h-[460px] flex-1' : 'flex-1 min-h-[140px]'"
      >
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          :viewBox="`0 0 ${viewWidth} ${viewHeight}`"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="crt-grid"
              :width="isContainerExpanded ? 60 : 32"
              :height="isContainerExpanded ? 37.5 : 24"
              patternUnits="userSpaceOnUse"
            >
              <path
                :d="isContainerExpanded ? 'M 60 0 L 0 0 0 37.5' : 'M 32 0 L 0 0 0 24'"
                fill="none"
                stroke="#00ff66"
                stroke-width="0.5"
                stroke-opacity="0.18"
              />
            </pattern>
          </defs>
          <!-- Retícula de fósforo -->
          <rect width="100%" height="100%" fill="url(#crt-grid)" />

          <!-- Eje Central Horizontal (Línea de base) -->
          <line
            x1="0"
            :y1="midY"
            :x2="viewWidth"
            :y2="midY"
            stroke="#00ff66"
            stroke-width="0.9"
            stroke-opacity="0.4"
            stroke-dasharray="3,3"
          />

          <!-- Eje Central Vertical -->
          <line
            :x1="midX"
            y1="0"
            :x2="midX"
            :y2="viewHeight"
            stroke="#00ff66"
            stroke-width="0.9"
            stroke-opacity="0.4"
            stroke-dasharray="3,3"
          />

          <g v-if="isSleeping">
            <line
              x1="0"
              :y1="midY"
              :x2="viewWidth"
              :y2="midY"
              stroke="#00ff66"
              stroke-width="2"
              stroke-opacity="0.75"
              class="crt-glow-line animate-pulse"
            />
          </g>
          <g v-else>
            <!-- Señal de oscilograma real -->
            <path :d="pointsSvg" fill="none" stroke="#00ff66" :stroke-width="isContainerExpanded ? 2.8 : 2.2" stroke-linecap="round" class="crt-glow-line" />
            <!-- Vector de proyección estocástica -->
            <path :d="predLineSvg" fill="none" stroke="#fbbf24" :stroke-width="isContainerExpanded ? 2.5 : 2" stroke-dasharray="4,4" class="crt-glow-pred" />
            <!-- Baliza del pronóstico -->
            <circle :cx="predCirclePos.cx" :cy="predCirclePos.cy" :r="isContainerExpanded ? 4.5 : 3.5" fill="#fbbf24" class="animate-ping" opacity="0.85" />
            <circle :cx="predCirclePos.cx" :cy="predCirclePos.cy" :r="isContainerExpanded ? 3.5 : 2.5" fill="#fef08a" />
          </g>
        </svg>

        <!-- Scanlines CRT vintage -->
        <div class="absolute inset-0 pointer-events-none crt-scanlines" />

        <!-- OSD Modo Espera -->
        <div v-if="isSleeping" class="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
          <div class="px-4 py-2 rounded-lg bg-black/85 border border-[#00ff66]/60 text-[#00ff66] font-journal text-xs sm:text-sm font-bold tracking-wider text-center drop-shadow-[0_0_10px_#00ff66] animate-pulse">
            📟 Osciloscopio Tektronix P31 • Esperando tren de pulsos del sensor
          </div>
        </div>

        <!-- OSD Normal Activo -->
        <template v-else>
          <div
            class="absolute top-2 left-3 right-3 flex items-center justify-between font-mono text-[#00ff66] opacity-90 drop-shadow-[0_0_5px_#00ff66]"
            :class="isContainerExpanded ? 'text-[11px]' : 'text-[9px]'"
          >
            <span class="font-journal">📟 Traza en Vivo: <span class="font-mono font-bold text-[#bbf7d0]">{{ lastPpm }} PPM</span></span>
            <span class="font-journal">Horizonte Predictivo (+15m): <span class="font-mono font-bold text-amber-300">{{ predictedPpm15m }} PPM</span></span>
          </div>
          <div
            class="absolute bottom-2 left-3 right-3 flex items-center justify-between font-mono text-[#00ff66]/70"
            :class="isContainerExpanded ? 'text-[9.5px]' : 'text-[8px]'"
          >
            <div class="flex items-center gap-3">
              <span>BASE TIEMPO: 2.0s/DIV</span>
              <span>SENSIBILIDAD: 50 PPM/DIV</span>
            </div>
            <div class="hidden sm:inline font-journal text-[#00ff66]/60">
              TEK-LAB 2465B • CO2 CHANNEL
            </div>
          </div>
        </template>
      </div>

      <!-- Perillas de Laboratorio Calibradas -->
      <div
        class="grid grid-cols-4 gap-2 mt-auto border-t border-[#854d0e]/30 text-center font-mono shrink-0 transition-all"
        :class="isContainerExpanded ? 'pt-3 pb-1' : 'pt-2'"
      >
        <div v-for="knob in ['TIEMPO', 'SENSIBILIDAD', 'DISPARO', 'FOCO']" :key="knob" class="flex flex-col items-center">
          <div
            class="rounded-full bg-gradient-to-tr from-[#1c1917] via-[#451a03] to-[#78350f] border border-[#fbbf24]/60 flex items-center justify-center shadow-inner relative transition-all"
            :class="isContainerExpanded ? 'w-8 h-8' : 'w-5 h-5'"
          >
            <div
              class="bg-[#fbbf24] absolute rounded-full"
              :class="isContainerExpanded ? 'w-0.5 h-3 top-0.5' : 'w-0.5 h-2 top-0.5'"
            />
            <div
              class="rounded-full bg-[#1c1917] border border-[#d97706]"
              :class="isContainerExpanded ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'"
            />
          </div>
          <span
            class="font-journal font-bold text-[#fbbf24] mt-1"
            :class="isContainerExpanded ? 'text-[9px]' : 'text-[7.5px]'"
          >
            {{ knob }}
          </span>
        </div>
      </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
.crt-scanlines {
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 2px);
  pointer-events: none;
  transform: translateZ(0);
}
.crt-glow-line { filter: drop-shadow(0 0 6px #00ff66); }
.crt-glow-pred { filter: drop-shadow(0 0 5px #fbbf24); }
</style>