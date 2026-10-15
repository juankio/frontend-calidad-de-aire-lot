<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Info, Cpu, Activity, Sliders } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import { EQUATION_VARIABLES, type VariableDoc } from './deductionModel'
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

const selectedSymbol = ref<string>('C(t)')
const selectedVar = computed<VariableDoc>(() => {
  return EQUATION_VARIABLES.find(v => v.symbol === selectedSymbol.value) || EQUATION_VARIABLES[0]
})

const symbolBadgeRef = ref<HTMLElement | null>(null)
const detailsContainerRef = ref<HTMLElement | null>(null)
const chipRefs = ref<Record<string, HTMLElement | null>>({})

const { animateVariableChange, animatePulse } = useAcademicMotion()

watch(selectedSymbol, async () => {
  await nextTick()
  animateVariableChange(symbolBadgeRef.value, detailsContainerRef.value)
})

function selectVariable(symbol: string, el?: HTMLElement | null) {
  if (selectedSymbol.value === symbol) return
  selectedSymbol.value = symbol
  if (el) animatePulse(el)
}

function getLiveValue(v: VariableDoc): string | null {
  if (!v.liveKey) return null
  switch (v.liveKey) {
    case 'c0': return `${props.c0} PPM`
    case 'cInf': return `${props.cInf} PPM`
    case 'k': return `${props.k} min⁻¹`
    case 'c': return `${props.c0 - props.cInf} PPM`
    default: return null
  }
}
</script>

<template>
  <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#1f160e] via-[#120c07] to-[#080503] border-2 border-[#854d0e]/80 shadow-[inset_0_1px_2px_rgba(251,191,36,0.2),0_6px_20px_rgba(0,0,0,0.8)] space-y-3 font-sans select-none">
    <LabScrew class="absolute top-2 left-2" :rotation="20" />
    <LabScrew class="absolute top-2 right-2" :rotation="-55" />

    <!-- Encabezado de la Leyenda -->
    <div class="flex items-center justify-between border-b border-[#854d0e]/50 pb-2 px-2">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[#fbbf24]">
          <Info class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-mono font-bold text-xs sm:text-sm text-[#fbbf24] tracking-wide">
            Anatomía de Variables: ¿Qué hace cada letra y de dónde sale?
          </h4>
          <p class="text-[9px] font-mono text-stone-400">
            Pasa el cursor o pulsa cualquier término para decodificar su vínculo físico y matemático
          </p>
        </div>
      </div>
      <span class="text-[9px] font-mono text-amber-300/80 bg-black/60 px-2 py-0.5 rounded border border-amber-800/40">
        8 Parámetros EDO
      </span>
    </div>

    <!-- Rejilla de Selectores de Variables (Chips de Bronce Moleteado) -->
    <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5 px-1">
      <button
        v-for="v in EQUATION_VARIABLES"
        :key="v.symbol"
        :ref="el => { if (el) chipRefs[v.symbol] = el as HTMLElement }"
        type="button"
        @mouseenter="selectVariable(v.symbol, chipRefs[v.symbol])"
        @click="selectVariable(v.symbol, chipRefs[v.symbol])"
        class="py-2 px-1 rounded-xl border font-mono transition-all flex flex-col items-center justify-center gap-0.5 text-center relative group active:scale-95"
        :class="selectedSymbol === v.symbol
          ? 'bg-gradient-to-b from-[#92400e] to-[#451a03] border-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-105 z-10'
          : 'bg-[#140e08]/90 border-[#854d0e]/40 hover:border-amber-400/60 hover:bg-[#20140b]'"
      >
        <span class="text-xs sm:text-sm font-bold tracking-tight" :class="selectedSymbol === v.symbol ? 'text-[#fbbf24]' : 'text-stone-200 group-hover:text-amber-200'">
          {{ v.symbol }}
        </span>
        <span class="text-[8px] font-mono text-stone-400 truncate max-w-full px-0.5">
          {{ v.unit }}
        </span>
        <span v-if="v.liveKey" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
      </button>
    </div>

    <!-- Tarjeta de Detalle Interactivo de la Variable Seleccionada -->
    <div class="p-3 sm:p-3.5 rounded-xl bg-gradient-to-b from-[#140d07] to-[#070402] border-2 border-[#854d0e]/70 shadow-inner space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 pb-2">
        <div class="flex items-center gap-2.5">
          <div ref="symbolBadgeRef" class="w-8 h-8 rounded-lg bg-black/80 border border-[#fbbf24]/60 flex items-center justify-center text-sm font-mono font-bold text-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.2)]">
            {{ selectedVar.symbol }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs sm:text-sm text-stone-100">{{ selectedVar.name }}</span>
              <span class="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold border border-amber-600/40 bg-amber-950/40 text-amber-300">
                {{ selectedVar.typeLabel }}
              </span>
            </div>
            <span class="text-[9.5px] font-mono text-stone-400">Unidades Físicas: <strong class="text-amber-300">{{ selectedVar.unit }}</strong></span>
          </div>
        </div>

        <div v-if="getLiveValue(selectedVar)" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-mono text-[10px] text-emerald-300">
          <Sliders class="w-3 h-3 text-emerald-400" />
          <span>Valor Actual: <strong class="text-white">{{ getLiveValue(selectedVar) }}</strong></span>
        </div>
      </div>

      <!-- Desglose Dual: Origen en Hardware vs Rol Matemático -->
      <div ref="detailsContainerRef" class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] font-mono">
        <div class="var-card p-2.5 rounded-lg bg-black/70 border border-amber-900/40 space-y-1">
          <div class="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold">
            <Cpu class="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Origen Físico / Hardware IoT</span>
          </div>
          <p class="text-stone-300 leading-relaxed text-[10px]">
            {{ selectedVar.hardwareOrigin }}
          </p>
        </div>

        <div class="var-card p-2.5 rounded-lg bg-black/70 border border-amber-900/40 space-y-1">
          <div class="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold">
            <Activity class="w-3.5 h-3.5 text-emerald-400" />
            <span>Rol en la Ecuación Diferencial</span>
          </div>
          <p class="text-stone-300 leading-relaxed text-[10px]">
            {{ selectedVar.mathRole }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
