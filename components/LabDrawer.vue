<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  id?: string
  drawerNumber?: string
  title: string
  subtitle?: string
  modelValue?: boolean
  defaultOpen?: boolean
  badge?: string
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'neutral'
}>(), {
  drawerNumber: 'I',
  badgeVariant: 'emerald',
  defaultOpen: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle', value: boolean): void
}>()

const internalOpen = ref(props.defaultOpen)
const isExpanded = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalOpen.value,
  set: (val: boolean) => {
    internalOpen.value = val
    emit('update:modelValue', val)
    emit('toggle', val)
  }
})

function toggleDrawer() {
  isExpanded.value = !isExpanded.value
}

const badgeClasses = computed(() => {
  const map = {
    emerald: 'bg-emerald-950/80 border-emerald-700 text-emerald-300',
    amber: 'bg-amber-950/80 border-amber-700 text-amber-300',
    rose: 'bg-rose-950/80 border-rose-700 text-rose-300',
    sky: 'bg-sky-950/80 border-sky-700 text-sky-300',
    neutral: 'bg-slate-800 border-slate-600 text-slate-300'
  }
  return map[props.badgeVariant || 'emerald']
})
</script>

<template>
  <div class="relative w-full transition-all duration-500 ease-out [perspective:1200px]">
    <!-- Riel Telescópico Lateral (Visible en Apertura) -->
    <div 
      class="border border-slate-700/80 rounded-2xl bg-neutral-950/90 transition-all duration-500 overflow-hidden"
      :class="isExpanded ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-slate-600 ring-1 ring-cyan-500/20' : 'shadow-md'"
    >
      <!-- Cara Frontal de la Gaveta de Laboratorio -->
      <div 
        @click="toggleDrawer"
        class="relative cursor-pointer select-none px-4 sm:px-6 py-4 bg-gradient-to-b from-slate-800 via-slate-850 to-neutral-900 border-b border-slate-700 transition-all duration-300 hover:brightness-105"
      >
        <!-- Tira LED Superior Interna (Iluminación de Trabajo al Abrir) -->
        <div 
          class="absolute inset-x-0 top-0 h-1 transition-all duration-500"
          :class="isExpanded ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]' : 'bg-slate-700/60'"
        ></div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Placa de Identificación Grabada en Metal con Pernos de Esquina -->
          <div class="flex items-center gap-3">
            <div class="relative px-3 py-1.5 rounded bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border border-slate-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.4)]">
              <span class="absolute -top-0.5 -left-0.5 w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
              <span class="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
              <span class="absolute -bottom-0.5 -left-0.5 w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
              <span class="absolute -bottom-0.5 -right-0.5 w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
              <span class="font-mono font-black text-slate-900 text-xs sm:text-sm tracking-wider uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                GAVETA {{ drawerNumber }}
              </span>
            </div>

            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-[11px] font-mono text-slate-400 hidden sm:block">{{ subtitle }}</p>
            </div>
          </div>

          <!-- Manija Tubular de Acero Inoxidable & Controles -->
          <div class="flex items-center gap-4">
            <span v-if="badge" class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-sm" :class="badgeClasses">
              {{ badge }}
            </span>

            <!-- Manija Cromada de Agarre de Precisión -->
            <div class="w-24 sm:w-32 h-3.5 rounded-full bg-gradient-to-r from-slate-500 via-slate-100 to-slate-500 border border-slate-400 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div class="w-16 sm:w-20 h-1 bg-slate-400/40 rounded-full"></div>
            </div>

            <!-- Botón / Indicador de Expansión 3D -->
            <button 
              type="button"
              class="w-8 h-8 rounded-lg bg-neutral-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-transform duration-300"
              :class="isExpanded ? 'rotate-180 bg-slate-800 border-cyan-500/60 text-cyan-300' : ''"
              aria-label="Abrir o cerrar gaveta"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenedor Interior del Cajón Extensible -->
      <div 
        v-show="isExpanded" 
        class="p-4 sm:p-6 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-t border-slate-800 transition-all duration-500"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
