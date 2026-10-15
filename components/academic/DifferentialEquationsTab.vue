<script setup lang="ts">
import { computed } from 'vue'
import { Compass, Sparkles, MessageSquareQuote, Flame, Wind } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import AnalogSlider from '~/components/madlab/AnalogSlider.vue'
import EquationDeductionBoard from './EquationDeductionBoard.vue'
import EquationVariablesLegend from './EquationVariablesLegend.vue'

const props = defineProps<{
  c0: number
  cInf: number
  k: number
  duration: number
}>()

const emit = defineEmits<{
  (e: 'update:c0', val: number): void
  (e: 'update:cInf', val: number): void
  (e: 'update:k', val: number): void
}>()

// Dinámica del recinto calculada en tiempo real
const tauMin = computed(() => Number((1.0 / Math.max(0.001, props.k)).toFixed(1)))
const time95Equilibrium = computed(() => Number((3.0 * tauMin.value).toFixed(1)))
const isAccumulating = computed(() => props.cInf > props.c0)

// Feed de Retroalimentación en Lenguaje Humano (Para sustentar en clase)
const academicFeed = computed(() => {
  if (isAccumulating.value) {
    return {
      tag: 'ACUMULACIÓN DE GASES',
      icon: Flame,
      color: 'border-amber-500/70 bg-gradient-to-b from-[#241407] to-[#120a04]',
      badgeColor: 'text-amber-400 border-amber-500/60 bg-amber-950/60',
      insight: `Ojo aquí: el recinto está cerrado y la generación supera la ventilación (G > Q·C). La concentración trepa desde ${props.c0} PPM buscando saturar en ${props.cInf} PPM. Si nadie abre las ventanas, en unos ${time95Equilibrium.value} minutos ya alcanzamos el 95% de saturación.`,
      tipProfe: `Para defenderlo en clase: "Profe, la constante k = Q/V (${props.k} min⁻¹) modela la resistencia física al recambio. Si k es baja, el aire no circula y el tiempo característico τ se nos dispara a ${tauMin.value} minutos."`
    }
  }
  return {
    tag: 'PURGA Y VENTILACIÓN FORZADA',
    icon: Wind,
    color: 'border-emerald-500/70 bg-gradient-to-b from-[#072413] to-[#04120a]',
    badgeColor: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/60',
    insight: `Ventilación activa a tope (Q·C > G). El caudal fresco barre los contaminantes desde ${props.c0} PPM hasta igualar el nivel exterior de ${props.cInf} PPM. Con una constante τ = ${tauMin.value} minutos, la caída es rápida y limpia.`,
    tipProfe: `Para defenderlo en clase: "La solución analítica describe un decaimiento exponencial puro. Es exactamente la misma curva que traza el sensor MQ-135 al entrar en fase RECOVERY cuando se ventila el aula."`
  }
})
</script>

<template>
  <div class="space-y-3.5 text-slate-100 font-sans select-none text-xs">
    <!-- Pizarra de Deducción Matemática Interactiva (Separación de Variables Paso a Paso) -->
    <EquationDeductionBoard
      :c0="c0"
      :c-inf="cInf"
      :k="k"
    />

    <!-- Leyenda y Desglose Interactivo de Variables (Hardware vs Matemáticas) -->
    <EquationVariablesLegend
      :c0="c0"
      :c-inf="cInf"
      :k="k"
    />

    <!-- Controles Analógicos de Laboratorio (Potenciómetros Lineales Táctiles de Cobre) -->
    <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#1c150c] to-[#0b0805] border-2 border-[#854d0e]/80 space-y-3 shadow-md">
      <LabScrew class="absolute top-2 left-2" :rotation="15" />
      <LabScrew class="absolute top-2 right-2" :rotation="-70" />

      <div class="flex items-center justify-between border-b border-[#854d0e]/40 pb-1.5 px-2">
        <div class="flex items-center gap-2">
          <Compass class="w-4 h-4 text-emerald-400" />
          <h4 class="font-mono font-bold text-[#fbbf24] text-xs tracking-wide">
            Calibración Analógica del Recinto Sensorizado
          </h4>
        </div>
        <span class="text-[8.5px] font-mono text-stone-400">Pares MQ-135 + ESP32</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AnalogSlider
          :model-value="c0"
          :min="380"
          :max="1800"
          :step="10"
          label="C0 (PPM Inicial)"
          sublabel="Base del Sensor"
          unit="PPM"
          color="amber"
          @update:model-value="emit('update:c0', $event)"
        />

        <AnalogSlider
          :model-value="cInf"
          :min="400"
          :max="2500"
          :step="20"
          label="C_ext (Equilibrio Saturación)"
          sublabel="Límite Asintótico"
          unit="PPM"
          color="rose"
          @update:model-value="emit('update:cInf', $event)"
        />

        <AnalogSlider
          :model-value="k"
          :min="0.01"
          :max="0.4"
          :step="0.01"
          label="k (Tasa Renovación Q/V)"
          :sublabel="`τ = ${tauMin} min`"
          unit="min⁻¹"
          color="emerald"
          @update:model-value="emit('update:k', $event)"
        />
      </div>
    </div>

    <!-- Feed Interactivo de Aula: Bitácora del Alquimista -->
    <div
      class="rounded-2xl p-3.5 border-2 space-y-2 shadow-lg transition-colors duration-300 relative"
      :class="academicFeed.color"
    >
      <LabScrew class="absolute bottom-2 right-2" :rotation="48" />

      <div class="flex items-center justify-between border-b border-white/10 pb-1">
        <div class="flex items-center gap-1.5 font-mono font-bold text-xs text-[#fbbf24] tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>Bitácora del Alquimista (Explicación para Clase)</span>
        </div>
        <div class="px-2 py-0.5 rounded border text-[8.5px] font-mono font-bold uppercase flex items-center gap-1" :class="academicFeed.badgeColor">
          <component :is="academicFeed.icon" class="w-3 h-3" />
          <span>{{ academicFeed.tag }}</span>
        </div>
      </div>

      <p class="font-mono text-stone-200 text-[11px] leading-relaxed">
        {{ academicFeed.insight }}
      </p>

      <div class="p-2.5 rounded-xl bg-black/70 border border-amber-700/40 flex items-start gap-2 font-mono text-[9.5px] text-amber-200">
        <MessageSquareQuote class="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
        <div>
          <strong class="text-[#fbbf24] block font-mono text-[10px]">Guía de Sustentación para Juankio:</strong>
          {{ academicFeed.tipProfe }}
        </div>
      </div>
    </div>
  </div>
</template>
