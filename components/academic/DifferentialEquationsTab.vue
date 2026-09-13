<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, Compass, Sparkles, MessageSquareQuote, Flame, Wind, Atom } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import AnalogSlider from '~/components/madlab/AnalogSlider.vue'

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
      insight: `Ojo aquí: el cuarto está cerrado y la generación supera con creces la ventilación (G > Q·C). La concentración va a trepar desde la base medida buscando saturar en ${props.cInf} de nivel asintótico. Si nadie abre las ventanas, en unos ${time95Equilibrium.value} minutos ya alcanzamos el 95% de saturación con aire pesado.`,
      tipProfe: `Para defenderlo en clase: "Profe, la constante k = Q/V (${props.k} min⁻¹) modela la resistencia física al recambio. Si k es baja, el aire no circula y el tiempo característico τ se nos dispara a ${tauMin.value} minutos."`
    }
  }
  return {
    tag: 'PURGA Y VENTILACIÓN FORZADA',
    icon: Wind,
    color: 'border-emerald-500/70 bg-gradient-to-b from-[#072413] to-[#04120a]',
    badgeColor: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/60',
      insight: `Ventilación activa a tope (Q·C > G). El caudal fresco barre los contaminantes desde la concentración base hasta igualar el nivel exterior de ${props.cInf}. Con una constante τ = ${tauMin.value} minutos, la caída es rápida y limpia.`,
    tipProfe: `Para defenderlo en clase: "La solución analítica describe un decaimiento exponencial puro. Es exactamente la misma curva que traza el sensor MQ-135 al entrar en fase RECOVERY cuando se ventila el aula."`
  }
})
</script>

<template>
  <div class="space-y-3.5 text-slate-100 font-sans select-none text-xs">
    <!-- Pizarra de Deducción Matemática (Placa de Bronce Grabada con Remaches) -->
    <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#24180d] via-[#140d07] to-[#0a0603] border-2 border-[#854d0e] shadow-[inset_0_1px_3px_rgba(251,191,36,0.3),0_8px_24px_rgba(0,0,0,0.8)] space-y-3">
      <LabScrew class="absolute top-2 left-2" :rotation="35" />
      <LabScrew class="absolute top-2 right-2" :rotation="-45" />
      <LabScrew class="absolute bottom-2 left-2" :rotation="80" />
      <LabScrew class="absolute bottom-2 right-2" :rotation="-20" />

      <div class="flex items-center justify-between border-b border-[#854d0e]/50 pb-2 px-3">
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-[#fbbf24]" />
          <h3 class="font-journal font-bold text-sm text-[#fbbf24] tracking-wide">
            1. Deducción del Modelo Físico (Balance de Masa en Recintos)
          </h3>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-600/60 text-amber-300 font-mono text-[9.5px] font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          EDO Lineal de 1er Orden
        </span>
      </div>

      <!-- Placas Metálicas Grabadas para las Fórmulas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-center pt-1 px-1">
        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#181109] to-[#080503] border-2 border-[#854d0e]/70 shadow-inner relative">
          <div class="text-[9.5px] font-journal font-bold text-amber-300 mb-1 flex items-center justify-center gap-1">
            <Atom class="w-3 h-3 text-amber-400" />
            <span>Balance Físico Diferencial</span>
          </div>
          <div class="text-xs font-bold text-white bg-black/80 py-1.5 px-2 rounded-lg border border-amber-900/40 shadow tracking-wide">
            V · dC/dt = G - Q · C(t)
          </div>
          <div class="text-[8px] text-stone-400 mt-1 font-journal">Acumulación = Generación - Ventilación</div>
        </div>

        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#181109] to-[#080503] border-2 border-[#854d0e]/70 shadow-inner relative">
          <div class="text-[9.5px] font-journal font-bold text-amber-300 mb-1 flex items-center justify-center gap-1">
            <Atom class="w-3 h-3 text-amber-400" />
            <span>Factor Integrante μ(t)</span>
          </div>
          <div class="text-xs font-bold text-amber-200 bg-black/80 py-1.5 px-2 rounded-lg border border-amber-900/40 shadow tracking-wide">
            μ(t) = e^(∫ k dt) = e^(kt)
          </div>
          <div class="text-[8px] text-stone-400 mt-1 font-journal">Tasa de recambio k = Q/V (min⁻¹)</div>
        </div>

        <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#181109] to-[#080503] border-2 border-[#854d0e]/70 shadow-inner relative">
          <div class="text-[9.5px] font-journal font-bold text-emerald-300 mb-1 flex items-center justify-center gap-1">
            <Atom class="w-3 h-3 text-emerald-400" />
            <span>Solución Analítica Exacta</span>
          </div>
          <div class="text-xs font-bold text-emerald-400 bg-black/80 py-1.5 px-2 rounded-lg border border-emerald-950 shadow tracking-wide">
            C(t) = C_inf + (C0 - C_inf)e^(-kt)
          </div>
          <div class="text-[8px] text-stone-400 mt-1 font-journal">Trayectoria continua exacta en PPM</div>
        </div>
      </div>
    </div>

    <!-- Controles Analógicos de Laboratorio (Potenciómetros Lineales Táctiles de Cobre) -->
    <div class="relative rounded-2xl p-4 bg-gradient-to-b from-[#1c150c] to-[#0b0805] border-2 border-[#854d0e]/80 space-y-3 shadow-md">
      <LabScrew class="absolute top-2 left-2" :rotation="15" />
      <LabScrew class="absolute top-2 right-2" :rotation="-70" />

      <div class="flex items-center justify-between border-b border-[#854d0e]/40 pb-1.5 px-2">
        <div class="flex items-center gap-2">
          <Compass class="w-4 h-4 text-emerald-400" />
          <h4 class="font-journal font-bold text-[#fbbf24] text-xs tracking-wide">
            Calibración Analógica del Recinto Sensorizado
          </h4>
        </div>
        <span class="text-[8.5px] font-mono text-stone-400">Pares MQ-135 + DHT11</span>
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
          label="C_inf (Equilibrio Saturación)"
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

    <!-- FEED INTERACTIVO DE AULA: BITÁCORA DEL ALQUIMISTA -->
    <div
      class="rounded-2xl p-3.5 border-2 space-y-2 shadow-lg transition-colors duration-300 relative"
      :class="academicFeed.color"
    >
      <LabScrew class="absolute bottom-2 right-2" :rotation="48" />

      <div class="flex items-center justify-between border-b border-white/10 pb-1">
        <div class="flex items-center gap-1.5 font-journal font-bold text-xs text-[#fbbf24] tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>Bitácora del Alquimista (Explicación para Clase)</span>
        </div>
        <div class="px-2 py-0.5 rounded border text-[8.5px] font-mono font-bold uppercase flex items-center gap-1" :class="academicFeed.badgeColor">
          <component :is="academicFeed.icon" class="w-3 h-3" />
          <span>{{ academicFeed.tag }}</span>
        </div>
      </div>

      <p class="font-journal text-stone-200 text-[11px] leading-relaxed">
        {{ academicFeed.insight }}
      </p>

      <div class="p-2.5 rounded-xl bg-black/70 border border-amber-700/40 flex items-start gap-2 font-mono text-[9.5px] text-amber-200">
        <MessageSquareQuote class="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
        <div>
          <strong class="text-[#fbbf24] block font-journal text-[10px]">Guía de Sustentación para Juankio:</strong>
          {{ academicFeed.tipProfe }}
        </div>
      </div>
    </div>
  </div>
</template>
