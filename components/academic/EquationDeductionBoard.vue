<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Binary, CheckCircle2 } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import MathFraction from './MathFraction.vue'
import { DEDUCTION_STEPS } from './deductionModel'
import { useAcademicMotion } from '~/composables/useAcademicMotion'

const props = withDefaults(defineProps<{
  c0?: number
  cInf?: number
  k?: number
}>(), {
  c0: 1200,
  cInf: 420,
  k: 0.08
})

const currentStepIndex = ref(0)
const activeStep = computed(() => DEDUCTION_STEPS[currentStepIndex.value])
const initialDelta = computed(() => props.c0 - props.cInf)

const formulaContainerRef = ref<HTMLElement | null>(null)
const explanationCardsRef = ref<HTMLElement | null>(null)
const calibratedBannerRef = ref<HTMLElement | null>(null)
const stepButtonsRef = ref<Record<number, HTMLElement | null>>({})

const { animateStepChange, animatePulse } = useAcademicMotion()

watch(currentStepIndex, async (idx) => {
  await nextTick()
  animateStepChange(formulaContainerRef.value, explanationCardsRef.value, calibratedBannerRef.value)
  animatePulse(stepButtonsRef.value[idx])
})

function nextStep() {
  if (currentStepIndex.value < DEDUCTION_STEPS.length - 1) currentStepIndex.value++
}

function prevStep() {
  if (currentStepIndex.value > 0) currentStepIndex.value--
}
</script>

<template>
  <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#25190e] via-[#150d06] to-[#090503] border-2 border-[#854d0e] shadow-[inset_0_1px_3px_rgba(251,191,36,0.25),0_8px_24px_rgba(0,0,0,0.85)] space-y-3 font-sans select-none">
    <LabScrew class="absolute top-2 left-2" :rotation="45" />
    <LabScrew class="absolute top-2 right-2" :rotation="-30" />
    <LabScrew class="absolute bottom-2 left-2" :rotation="70" />
    <LabScrew class="absolute bottom-2 right-2" :rotation="-15" />

    <!-- Barra de Título Estilo Libro de Laboratorio -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#854d0e]/60 pb-2.5 px-2">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[#fbbf24]">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <h3 class="font-mono font-bold text-xs sm:text-sm text-[#fbbf24] tracking-wide">
            Deducción Analítica Paso a Paso (EDO de 1er Orden)
          </h3>
          <p class="text-[9.5px] font-mono text-stone-400">
            Modelo de transporte de gas: dC/dt = -k · (C - C_ext) por separación de variables
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-lg border border-amber-700/50 text-[10px] font-mono text-amber-300">
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        <span>Paso {{ activeStep.step }} de {{ DEDUCTION_STEPS.length }}</span>
      </div>
    </div>

    <!-- Selector de Pasos (Botones de Cobre Numerados) -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-1">
      <button
        v-for="(st, idx) in DEDUCTION_STEPS"
        :key="st.step"
        :ref="el => { if (el) stepButtonsRef[idx] = el as HTMLElement }"
        type="button"
        @click="currentStepIndex = idx"
        class="py-1 px-1.5 rounded-lg border font-mono text-[9.5px] transition-all flex items-center justify-center gap-1 text-center"
        :class="currentStepIndex === idx
          ? 'bg-gradient-to-b from-[#b45309] to-[#78350f] border-[#fbbf24] text-white font-bold shadow-[0_0_10px_rgba(251,191,36,0.35)] scale-[1.02]'
          : 'bg-[#140e08]/90 border-[#854d0e]/40 text-stone-300 hover:border-amber-500/60 hover:text-amber-200'"
      >
        <span class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] shrink-0" :class="currentStepIndex === idx ? 'bg-[#fbbf24] text-black font-black' : 'bg-black/60 text-stone-400'">
          {{ st.step }}
        </span>
        <span class="truncate">{{ st.badge.replace(/^Paso \d+: /, '') }}</span>
      </button>
    </div>

    <!-- Pizarra Matemática Central Grabada -->
    <div class="p-3 sm:p-4 rounded-xl bg-gradient-to-b from-[#120c07] via-[#0b0704] to-[#040201] border-2 border-[#854d0e]/70 shadow-inner space-y-3">
      <div class="flex items-center justify-between border-b border-amber-900/40 pb-1.5 text-[10px] font-mono">
        <span class="text-[#fbbf24] font-bold flex items-center gap-1.5">
          <Binary class="w-3.5 h-3.5 text-amber-400" />
          {{ activeStep.title }}
        </span>
        <span class="text-stone-400 text-[9px]">{{ activeStep.subhead }}</span>
      </div>

      <!-- Fórmula Matemática Renderizada con Fracciones Horizontales Reales -->
      <div ref="formulaContainerRef" class="py-2.5 px-3 rounded-lg bg-black/90 border border-amber-800/40 shadow-md flex flex-wrap items-center justify-center gap-y-2 text-sm sm:text-base text-amber-100 font-mono text-center overflow-x-auto min-h-[58px]">
        <template v-if="activeStep.step === 1">
          <MathFraction num="dC" den="dt" /><span class="text-stone-300 mx-1">= -k · (C - C<sub class="text-[0.75em]">ext</sub>)</span><span class="text-amber-400 font-bold mx-2">⟹</span><MathFraction num="dC" den="C - C ext" /><span class="text-emerald-300 font-bold mx-1">= -k · dt</span>
        </template>
        <template v-else-if="activeStep.step === 2">
          <span class="font-serif italic text-lg sm:text-xl text-amber-300 mr-0.5">∫</span><MathFraction num="1" den="C - C ext" /><span class="text-stone-300">dC =</span><span class="font-serif italic text-lg sm:text-xl text-amber-300 mx-1">∫</span><span class="text-stone-300">-k dt</span><span class="text-amber-400 font-bold mx-2">⟹</span><span class="text-emerald-300 font-bold">ln|C - C<sub class="text-[0.75em]">ext</sub>| = -k·t + c<sub class="text-[0.75em]">1</sub></span>
        </template>
        <template v-else-if="activeStep.step === 3">
          <span class="font-serif italic text-amber-200">e</span><sup class="text-[0.8em] text-amber-300">ln|C - C<sub class="text-[0.75em]">ext</sub>|</sup><span class="text-stone-300 mx-1.5">=</span><span class="font-serif italic text-amber-200">e</span><sup class="text-[0.8em] text-amber-300">-k·t + c<sub class="text-[0.75em]">1</sub></sup><span class="text-amber-400 font-bold mx-2">⟹</span><span class="text-emerald-300 font-bold">C - C<sub class="text-[0.75em]">ext</sub> = c · <span class="font-serif italic">e</span><sup class="text-[0.8em]">-k·t</sup></span>
        </template>
        <template v-else-if="activeStep.step === 4">
          <span class="text-amber-300 font-bold">C(t)</span><span class="text-stone-300 mx-1.5">=</span><span class="text-white">C<sub class="text-[0.75em]">ext</sub></span><span class="text-stone-300 mx-1.5">+</span><span class="text-amber-300 font-bold">c</span><span class="text-emerald-300 mx-1">· <span class="font-serif italic">e</span><sup class="text-[0.8em]">-k·t</sup></span><span class="ml-2 text-[10px] text-stone-400 font-sans border-l border-amber-900/60 pl-2">Familia General de Curvas</span>
        </template>
        <template v-else-if="activeStep.step === 5">
          <span class="text-stone-300">t = 0 ⟹ C(0) = C<sub class="text-[0.75em]">0</sub></span><span class="text-amber-400 font-bold mx-2">⟹</span><span class="text-stone-300">C<sub class="text-[0.75em]">ext</sub> + c·<span class="font-serif italic">e</span><sup class="text-[0.8em]">0</sup> = C<sub class="text-[0.75em]">0</sub></span><span class="text-amber-400 font-bold mx-2">⟹</span><span class="text-emerald-300 font-bold">c = C<sub class="text-[0.75em]">0</sub> - C<sub class="text-[0.75em]">ext</sub></span>
        </template>
        <template v-else-if="activeStep.step === 6">
          <span class="text-emerald-400 font-black">C(t) = C<sub class="text-[0.75em]">ext</sub> + (C<sub class="text-[0.75em]">0</sub> - C<sub class="text-[0.75em]">ext</sub>) · <span class="font-serif italic">e</span><sup class="text-[0.8em]">-k·t</sup></span>
        </template>
      </div>

      <!-- Solución particular evaluada con telemetría en vivo en el paso 6 -->
      <div v-if="activeStep.step === 6" ref="calibratedBannerRef" class="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-[10px] font-mono text-emerald-200 flex flex-wrap items-center justify-between gap-1.5">
        <span class="flex items-center gap-1 font-bold text-[#fbbf24]">
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
          Curva Calibrada en Vivo:
        </span>
        <span class="text-emerald-300 font-bold">
          C(t) = {{ cInf }} + ({{ initialDelta >= 0 ? `+${initialDelta}` : initialDelta }}) · e^(-{{ k.toFixed(2) }}·t)
        </span>
      </div>

      <!-- Explicación pedagógica y física -->
      <div ref="explanationCardsRef" class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] font-mono pt-1">
        <div class="step-card p-2 rounded-lg bg-black/60 border border-amber-900/30 text-stone-300 space-y-0.5">
          <strong class="text-[#fbbf24] block text-[9.5px]">Operación Matemática:</strong>
          <p class="leading-relaxed">{{ activeStep.explanation }}</p>
        </div>
        <div class="step-card p-2 rounded-lg bg-black/60 border border-amber-900/30 text-stone-300 space-y-0.5">
          <strong class="text-amber-300 block text-[9.5px]">Significado Físico en el Recinto:</strong>
          <p class="leading-relaxed">{{ activeStep.physicalInsight }}</p>
        </div>
      </div>
    </div>

    <!-- Navegación Anterior / Siguiente -->
    <div class="flex items-center justify-between pt-1 px-1">
      <button
        type="button"
        @click="prevStep"
        :disabled="currentStepIndex === 0"
        class="px-2.5 py-1 rounded-lg border font-mono text-[10px] flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-black/60 border-[#854d0e]/60 text-amber-200 hover:border-amber-400 active:scale-95"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
        <span>Paso Anterior</span>
      </button>

      <span class="text-[9px] font-mono text-stone-400">
        {{ currentStepIndex + 1 }} / {{ DEDUCTION_STEPS.length }}
      </span>

      <button
        type="button"
        @click="nextStep"
        :disabled="currentStepIndex === DEDUCTION_STEPS.length - 1"
        class="px-2.5 py-1 rounded-lg border font-mono text-[10px] flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-700 to-amber-600 border-amber-400 text-white font-bold hover:brightness-110 active:scale-95"
      >
        <span>Siguiente Paso</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
