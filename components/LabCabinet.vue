<script setup lang="ts">
import { ref, computed } from 'vue'
import LabWheels from './LabWheels.vue'

const props = withDefaults(defineProps<{
  initialAllOpen?: boolean
}>(), {
  initialAllOpen: false
})

const drawer1 = ref(true)
const drawer2 = ref(false)
const drawer3 = ref(false)

const allOpen = computed(() => drawer1.value && drawer2.value && drawer3.value)

function toggleAllDrawers() {
  const target = !allOpen.value
  drawer1.value = target
  drawer2.value = target
  drawer3.value = target
}
</script>

<template>
  <div class="relative w-full max-w-7xl mx-auto my-6 px-2 sm:px-4 select-none">
    <!-- Manija Tubular Lateral de Transporte de Acero Inoxidable -->
    <div class="hidden xl:flex absolute -left-10 top-28 bottom-36 w-8 flex-col items-center justify-between z-20 pointer-events-none">
      <div class="w-6 h-3 rounded-r-md bg-gradient-to-b from-slate-400 to-slate-600 border border-slate-400 shadow-md"></div>
      <div class="w-4 h-full my-1 rounded-full bg-gradient-to-r from-slate-500 via-slate-200 to-slate-600 border-x border-slate-400 shadow-xl"></div>
      <div class="w-6 h-3 rounded-r-md bg-gradient-to-b from-slate-400 to-slate-600 border border-slate-400 shadow-md"></div>
    </div>

    <!-- Chasis Principal del Mueble de Laboratorio Científico -->
    <div class="relative rounded-3xl bg-gradient-to-b from-slate-900 via-neutral-900 to-neutral-950 border-2 border-slate-700 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden">
      <!-- Bisel Perimetral y Remaches Industriales -->
      <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 opacity-80"></div>
      
      <!-- Barra Superior de Control del Mueble & Bloqueo Central -->
      <div class="px-5 py-3.5 bg-neutral-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
          <div class="flex flex-col">
            <span class="font-mono text-xs font-black tracking-widest text-slate-200 uppercase">
              MUEBLE DE LABORATORIO MÓVIL • SENTINEL S3
            </span>
            <span class="text-[9px] font-mono text-slate-500">CHASIS ACERO ASTM A36 • ESTACIÓN BIOQUÍMICA</span>
          </div>
        </div>

        <button 
          @click="toggleAllDrawers" 
          class="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-200 transition-all flex items-center gap-2 shadow-sm hover:border-slate-500"
        >
          <span class="w-2 h-2 rounded-full" :class="allOpen ? 'bg-amber-400' : 'bg-cyan-400'"></span>
          <span>{{ allOpen ? 'Replegar Todo' : 'Abrir Todo' }}</span>
        </button>
      </div>

      <!-- Ranura de Mesa Superior / Countertop -->
      <div class="p-3 sm:p-5 border-b border-slate-800/90 bg-neutral-950/60">
        <slot name="countertop" />
      </div>

      <!-- Cuerpo de Gavetas Organizadoras con Guías Telescópicas -->
      <div class="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-neutral-900/40 via-neutral-950 to-neutral-950">
        <!-- Ranura Gaveta I -->
        <slot name="drawer-1" :is-open="drawer1" :toggle="() => drawer1 = !drawer1" />

        <!-- Ranura Gaveta II -->
        <slot name="drawer-2" :is-open="drawer2" :toggle="() => drawer2 = !drawer2" />

        <!-- Ranura Gaveta III -->
        <slot name="drawer-3" :is-open="drawer3" :toggle="() => drawer3 = !drawer3" />

        <!-- Contenido Adicional / Ranura por Defecto -->
        <slot />
      </div>

      <!-- Ranuras de Ventilación & Descompresión Lateral -->
      <div class="px-6 py-2 bg-neutral-950 border-t border-slate-900 flex justify-between items-center opacity-70">
        <div class="flex gap-1.5">
          <div v-for="n in 8" :key="n" class="w-4 h-1 rounded-full bg-slate-800 shadow-inner"></div>
        </div>
        <span class="text-[9px] font-mono text-slate-600">VENTILACIÓN ACTIVA HEPA</span>
      </div>
    </div>

    <!-- Base Rodante con 4 Ruedas de Laboratorio -->
    <LabWheels :locked="false" />
  </div>
</template>
