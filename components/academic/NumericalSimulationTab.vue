<script setup lang="ts">
import { computed } from 'vue'
import { Activity, AlertTriangle, CheckCircle2, Sparkles, MessageSquareQuote, Zap, Cpu } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import AnalogSlider from '~/components/madlab/AnalogSlider.vue'
import NixieTube from '~/components/madlab/NixieTube.vue'
import type { AcademicStep } from '~/composables/useNumericalAcademic'

const props = defineProps<{
  steps: AcademicStep[]
  metricsEuler: { mae: number; rmse: number; maxErr: number }
  metricsRk4: { mae: number; rmse: number; maxErr: number }
  accuracyBoost: number
  h: number
  criticalStep: number
  isEulerStable: boolean
}>()

const emit = defineEmits<{
  (e: 'update:h', val: number): void
}>()

// Coordenadas para renderizado SVG reactivo estilo osciloscopio
const chartData = computed(() => {
  if (!props.steps.length) return { pointsExact: '', pointsEuler: '', pointsRk4: '', minC: 350, maxC: 1400 }
  const maxT = props.steps[props.steps.length - 1].t || 1
  const allVals = props.steps.flatMap(s => [s.exact, s.euler, s.rk4]).filter(v => isFinite(v))
  const minC = Math.min(...allVals, 350)
  const maxC = Math.max(...allVals, 1400)
  const range = maxC - minC || 1

  const toX = (t: number) => 35 + (t / maxT) * 535
  const toY = (c: number) => 215 - ((c - minC) / range) * 185

  return {
    pointsExact: props.steps.map(s => `${toX(s.t)},${toY(s.exact)}`).join(' '),
    pointsEuler: props.steps.map(s => `${toX(s.t)},${toY(s.euler)}`).join(' '),
    pointsRk4: props.steps.map(s => `${toX(s.t)},${toY(s.rk4)}`).join(' '),
    minC, maxC
  }
})
</script>

<template>
  <div class="space-y-3.5 text-slate-100 font-sans select-none text-xs">
    <!-- Panel de Control Mecánico: Paso de Integración h -->
    <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#1e150c] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
      <LabScrew class="absolute top-1.5 left-2" :rotation="45" />
      <LabScrew class="absolute top-1.5 right-2" :rotation="-25" />

      <div class="space-y-0.5 pl-3">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-[#fbbf24]" />
          <h4 class="font-journal font-bold text-[#fbbf24] text-xs tracking-wide">
            Discretización & Paso de Integración (h = Δt)
          </h4>
        </div>
        <p class="text-[9.5px] text-stone-400 font-journal">
          Mueve el deslizador para ver cómo el error de truncamiento castiga a Euler frente a RK4 o si se rompe la estabilidad de Dahlquist.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="flex-1 sm:w-56">
          <AnalogSlider
            :model-value="h"
            :min="0.1"
            :max="4.0"
            :step="0.1"
            label="Paso h"
            sublabel="Intervalo Δt"
            unit="min"
            color="amber"
            @update:model-value="emit('update:h', $event)"
          />
        </div>

        <div
          class="px-3 py-2 rounded-xl border-2 text-[9.5px] font-mono flex items-center gap-1.5 shrink-0 shadow-inner"
          :class="isEulerStable ? 'bg-[#052e16] border-emerald-500/70 text-emerald-300' : 'bg-[#450a0a] border-rose-500 text-rose-200 animate-pulse'"
        >
          <CheckCircle2 v-if="isEulerStable" class="w-4 h-4 text-emerald-400" />
          <AlertTriangle v-else class="w-4 h-4 text-rose-400" />
          <div class="flex flex-col">
            <span class="font-bold">{{ isEulerStable ? 'Estabilidad Estable' : 'Región Inestable' }}</span>
            <span class="text-[7.5px] opacity-75">{{ isEulerStable ? 'h < 2/k' : `h ≥ ${criticalStep} min` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pantalla Osciloscopio CRT de Fósforo Verde con Retícula de Laboratorio -->
    <div class="relative rounded-2xl p-3 bg-gradient-to-b from-[#0a180e] via-[#020b05] to-[#010603] border-2 border-[#854d0e] shadow-[0_12px_32px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(0,255,102,0.15)] overflow-hidden">
      <LabScrew class="absolute top-2 left-2 z-20" :rotation="18" />
      <LabScrew class="absolute top-2 right-2 z-20" :rotation="-60" />

      <!-- Cabecera OSD CRT -->
      <div class="flex items-center justify-between text-[9.5px] font-mono border-b border-[#00ff66]/30 pb-1.5 mb-2 px-3 text-[#00ff66]">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 text-[#00ff66] animate-pulse" />
          <span class="font-bold tracking-wider">BANCO CRT TIPO 502 • TRAZAS NUMÉRICAS</span>
        </div>
        <div class="flex items-center gap-3 text-[8.5px]">
          <span class="text-sky-300 font-bold flex items-center gap-1">
            <span class="w-2.5 h-0.5 bg-sky-400 rounded-full" /> Analítica Exacta
          </span>
          <span class="text-amber-300 font-bold flex items-center gap-1">
            <span class="w-2.5 h-0.5 bg-amber-400 rounded-full border-b border-dashed" /> Euler (O(h))
          </span>
          <span class="text-emerald-400 font-bold flex items-center gap-1">
            <span class="w-2.5 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#00ff66]" /> RK4 (O(h⁴))
          </span>
        </div>
      </div>

      <!-- Pantalla cóncava CRT con Scanlines -->
      <div class="relative w-full rounded-xl bg-[#010a04] border border-[#00ff66]/40 overflow-hidden shadow-[inset_0_0_30px_rgba(0,255,102,0.22)]">
        <svg class="w-full h-44 sm:h-48" viewBox="0 0 600 240">
          <defs>
            <pattern id="crt-grid-num" width="40" height="24" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.18" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crt-grid-num)" />

          <!-- Ejes principales -->
          <line x1="35" y1="215" x2="575" y2="215" stroke="#00ff66" stroke-width="1" stroke-opacity="0.5" />
          <line x1="35" y1="25" x2="35" y2="215" stroke="#00ff66" stroke-width="1" stroke-opacity="0.5" />
          <line x1="35" y1="120" x2="575" y2="120" stroke="#00ff66" stroke-width="0.6" stroke-dasharray="3,3" stroke-opacity="0.35" />

          <!-- Curvas graficadas -->
          <polyline :points="chartData.pointsExact" fill="none" stroke="#38bdf8" stroke-width="2.5" class="crt-glow-cyan" />
          <polyline :points="chartData.pointsEuler" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2" class="crt-glow-amber" />
          <polyline :points="chartData.pointsRk4" fill="none" stroke="#00ff66" stroke-width="2.5" class="crt-glow-green" />
        </svg>

        <!-- Filtro óptico scanlines analógicas -->
        <div class="absolute inset-0 pointer-events-none crt-scanlines" />

        <!-- Sub-marcas OSD -->
        <div class="absolute bottom-1.5 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-[#00ff66]/70 pointer-events-none">
          <span>TIME/DIV: {{ (h * 2).toFixed(1) }}m</span>
          <span>RANGE: {{ chartData.minC.toFixed(0) }} - {{ chartData.maxC.toFixed(0) }} PPM</span>
          <span>DISCRETIZACIÓN: RUNGE-KUTTA RK4</span>
        </div>
      </div>
    </div>

    <!-- Tres Tubos Nixie de Precisión Numérica -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <NixieTube
        :value="`${metricsEuler.rmse.toFixed(2)} PPM`"
        label="RMSE Euler (1er Orden)"
        :sublabel="`Error Máx: ±${metricsEuler.maxErr.toFixed(1)} PPM`"
        color="amber"
      />

      <NixieTube
        :value="`${metricsRk4.rmse.toFixed(4)} PPM`"
        label="RMSE Runge-Kutta 4"
        :sublabel="`Error Máx: ±${metricsRk4.maxErr.toFixed(3)} PPM`"
        color="emerald"
      />

      <NixieTube
        :value="`${accuracyBoost}x`"
        label="Ganancia de Precisión"
        sublabel="Reducción de Varianza O(h⁴)"
        color="cyan"
      />
    </div>

    <!-- FEED INTERACTIVO DE CONVERGENCIA & LIPSCHITZ -->
    <div class="relative rounded-2xl p-3.5 bg-gradient-to-b from-[#18120b] to-[#0a0704] border-2 border-[#854d0e]/70 space-y-2 shadow-md">
      <LabScrew class="absolute bottom-2 right-2" :rotation="22" />

      <div class="flex items-center justify-between border-b border-white/10 pb-1">
        <div class="flex items-center gap-1.5 font-journal font-bold text-xs text-[#fbbf24]">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>Diagnóstico Numérico en Tiempo Real</span>
        </div>
        <span class="text-[8.5px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-black/60 border border-amber-800/50">
          Paso h = {{ h.toFixed(2) }} min
        </span>
      </div>

      <p class="font-journal text-stone-300 text-[10.5px] leading-relaxed">
        Miren el salto de precisión. Con un paso h = {{ h.toFixed(2) }} min, Euler se desfasa {{ metricsEuler.mae.toFixed(2) }} PPM de media porque trunca en primer orden. RK4, en cambio, promedia cuatro pendientes intermedias con la regla de Simpson y tumba el error medio a apenas {{ metricsRk4.mae.toFixed(4) }} PPM. Una diferencia abismal.
      </p>

      <div class="p-2.5 rounded-xl bg-black/70 border border-amber-700/40 flex items-start gap-2 font-mono text-[9px] text-amber-200">
        <MessageSquareQuote class="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
        <div>
          <strong class="text-[#fbbf24] block font-journal text-[10px]">Argumento para el Profesor de Análisis Numérico:</strong>
          "Profe, fíjese en el orden de convergencia: si partimos el paso h a la mitad, el error de Euler apenas baja a la mitad (O(h)), mientras que en RK4 el error se desploma por un factor de 2⁴ = 16 (O(h⁴)). Por eso RK4 no tiene rival para integrar series temporales continuas."
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crt-scanlines {
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 2px);
}
.crt-glow-green { filter: drop-shadow(0 0 5px #00ff66); }
.crt-glow-amber { filter: drop-shadow(0 0 4px #f59e0b); }
.crt-glow-cyan { filter: drop-shadow(0 0 4px #38bdf8); }
</style>
