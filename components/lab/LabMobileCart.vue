<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  activeShelf?: 'telemetry' | 'analytics' | 'geo'
  doorsOpen?: boolean
}>(), {
  activeShelf: 'telemetry',
  doorsOpen: false
})

const emit = defineEmits<{
  (e: 'update:activeShelf', val: 'telemetry' | 'analytics' | 'geo'): void
  (e: 'update:doorsOpen', val: boolean): void
}>()

const localShelf = ref<'telemetry' | 'analytics' | 'geo'>(props.activeShelf)
const selectedShelf = computed({
  get: () => props.activeShelf ?? localShelf.value,
  set: (val) => {
    localShelf.value = val
    emit('update:activeShelf', val)
  }
})

const localDoorsOpen = ref(props.doorsOpen)
const isDoorsOpen = computed({
  get: () => props.doorsOpen ?? localDoorsOpen.value,
  set: (val) => {
    localDoorsOpen.value = val
    emit('update:doorsOpen', val)
  }
})
</script>

<template>
  <div class="relative w-full max-w-7xl mx-auto my-6 px-2 sm:px-4 select-none">
    <!-- Manija Tubular Cromada Lateral Derecha para Empuje -->
    <div class="hidden xl:flex absolute -right-9 top-28 bottom-36 w-8 flex-col items-center justify-between z-20 pointer-events-none">
      <div class="w-6 h-3 rounded-l-md bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 border border-slate-500 shadow-md" />
      <div class="w-4 h-full my-1 rounded-full bg-gradient-to-r from-slate-500 via-slate-300 to-slate-600 border-x border-slate-400 shadow-2xl" />
      <div class="w-6 h-3 rounded-l-md bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 border border-slate-500 shadow-md" />
    </div>

    <!-- Chasis Titanio & Grafito Oscuro del Mueble -->
    <div class="relative rounded-3xl bg-gradient-to-b from-[#141822] via-[#0e1118] to-[#080a0e] border-2 border-slate-700/80 shadow-[0_25px_65px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden">
      <!-- Bisel Superior Metálico -->
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 opacity-80" />

      <!-- Barra de Control Superior & Selector de Repisas / Bandejas -->
      <div class="px-4 sm:px-6 py-3 bg-[#0a0d13] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <div>
            <span class="font-mono text-xs font-black tracking-widest text-slate-100 uppercase block">
              MUEBLE DE LABORATORIO MÓVIL • SENTINEL S3
            </span>
            <span class="text-[9px] font-mono text-slate-400">CHASIS TITANIO & GRAFITO CIENTÍFICO • BIOQUÍMICA INDUSTRIAL</span>
          </div>
        </div>

        <!-- Selector Rápido de Repisas / Bandejas -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#040608] border border-slate-800">
          <button 
            @click="selectedShelf = 'telemetry'"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
            :class="selectedShelf === 'telemetry' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          >
            I. Telemetría
          </button>
          <button 
            @click="selectedShelf = 'analytics'"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
            :class="selectedShelf === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          >
            II. Data Science
          </button>
          <button 
            @click="selectedShelf = 'geo'"
            class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
            :class="selectedShelf === 'geo' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          >
            III. GPS
          </button>
        </div>
      </div>

      <!-- Ranura 1: Encimera Superior / LabTopStation -->
      <div class="p-3 sm:p-5 border-b border-slate-800/80 bg-[#0c0e14]">
        <slot name="top" />
      </div>

      <!-- Ranura 2: Portón / Gabinete Interior -->
      <div class="p-3 sm:p-6 bg-[#080a0e]">
        <slot name="doors" :is-open="isDoorsOpen" :toggle="() => isDoorsOpen = !isDoorsOpen">
          <slot name="shelves" :active-shelf="selectedShelf" />
          <slot />
        </slot>
      </div>

      <!-- Rejillas de Ventilación & Enfriamiento HEPA -->
      <div class="px-6 py-2.5 bg-[#0a0d13] border-t border-slate-800 flex justify-between items-center text-slate-400">
        <div class="flex gap-1.5">
          <div v-for="n in 10" :key="n" class="w-3.5 h-1 rounded-full bg-slate-800 border-b border-slate-700/80" />
        </div>
        <span class="text-[9px] font-mono tracking-widest text-slate-500 font-bold uppercase">FILTRADO ACTIVO HEPA H14</span>
      </div>
    </div>

    <!-- 4 Ruedas Giratorias de Laboratorio con Frenos Rojos STOP -->
    <div class="relative w-full px-6 pt-3 pb-6">
      <div class="absolute inset-x-8 bottom-3 h-4 bg-black/60 blur-md rounded-full pointer-events-none" />
      <div class="relative flex justify-between items-center max-w-5xl mx-auto px-4 sm:px-8">
        <div v-for="i in 4" :key="i" class="group relative flex flex-col items-center">
          <!-- Pletina de Montaje Metálica -->
          <div class="w-10 h-2 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 rounded-t-sm border-t border-x border-slate-500 shadow-sm flex justify-around items-center px-1">
            <span class="w-1 h-1 rounded-full bg-slate-800" />
            <span class="w-1 h-1 rounded-full bg-slate-800" />
          </div>

          <!-- Horquilla Giratoria 360° con Pedal Rojo STOP -->
          <div class="w-8 h-4 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 border-x border-slate-500 flex items-center justify-center relative shadow-sm">
            <div class="w-2 h-2 rounded-full bg-slate-800 shadow-inner" />
            <!-- Pedal Freno Rojo Industrial -->
            <div class="absolute -right-3.5 -top-1 px-1 py-0.5 rounded-[2px] bg-red-600 hover:bg-red-500 border border-red-800 shadow-md flex items-center justify-center -rotate-12 cursor-pointer transition-transform group-hover:scale-110">
              <span class="text-[6px] font-mono font-black text-white uppercase leading-none">STOP</span>
            </div>
          </div>

          <!-- Rueda de Poliuretano con Rin Titanio -->
          <div class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-950 border-2 border-slate-500 shadow-xl flex items-center justify-center">
            <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-slate-500 via-slate-300 to-slate-600 border border-slate-500 shadow-inner flex items-center justify-center">
              <div class="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
            </div>
          </div>
          <div class="w-9 h-1 bg-black/80 blur-[1px] rounded-full mt-0.5" />
        </div>
      </div>
    </div>
  </div>
</template>
