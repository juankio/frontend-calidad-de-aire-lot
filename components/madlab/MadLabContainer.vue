<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted, nextTick } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import anime from 'animejs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  title?: string
  noPadding?: boolean
  expanded?: boolean
}>(), {
  title: '',
  noPadding: false,
  expanded: undefined
})

const emit = defineEmits<{
  (e: 'update:expanded', val: boolean): void
}>()

const internalExpanded = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const isExpanded = computed({
  get: () => props.expanded !== undefined ? props.expanded : internalExpanded.value,
  set: (val: boolean) => {
    internalExpanded.value = val
    emit('update:expanded', val)
  }
})

// Proveer estado al árbol de componentes hijos (Leaflet, Osciloscopio, etc.)
provide('isContainerExpanded', isExpanded)

async function toggleFocus() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  await nextTick()
  window.dispatchEvent(new Event('resize'))

  // Animación armónica con Anime.js sin desmontar el árbol
  if (containerRef.value) {
    anime({
      targets: containerRef.value,
      scale: isExpanded.value ? [0.94, 1] : [1.03, 1],
      opacity: [0.85, 1],
      duration: isExpanded.value ? 400 : 250,
      easing: isExpanded.value ? 'spring(1, 85, 14, 0)' : 'easeOutQuart',
      complete: () => {
        window.dispatchEvent(new Event('resize'))
      }
    })
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isExpanded.value) {
    toggleFocus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- Placeholder en el grid para evitar Layout Shifts (CLS) mientras está expandido -->
  <div
    v-if="isExpanded"
    class="w-full h-full min-h-[220px] rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/10 flex items-center justify-center pointer-events-none select-none"
    aria-hidden="true"
  >
    <span class="text-[10px] font-mono tracking-widest text-cyan-400/60 uppercase">MÓDULO TÁCTICO EN VISTA EXPANDIDA</span>
  </div>

  <!-- Teleport a body cuando está expandido para librarse de stacking contexts sin desmontar componentes -->
  <Teleport to="body" :disabled="!isExpanded">
    <!-- Backdrop fijo con blur militar mecha -->
    <div
      v-if="isExpanded"
      class="fixed inset-0 z-[99] bg-black/85 backdrop-blur-md transition-opacity duration-300 pointer-events-auto"
      @click="toggleFocus"
    />

    <!-- Tarjeta del Contenedor (UN SOLO SLOT PERSISTENTE) -->
    <div
      ref="containerRef"
      v-bind="$attrs"
      :class="[
        isExpanded
          ? 'fixed inset-3 sm:inset-6 md:inset-10 z-[100] max-w-6xl mx-auto h-[86vh] max-h-[90vh] p-4 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.15)] bg-[#070b14]/95 border-cyan-500/40'
          : 'relative w-full flex-1 shadow-[0_12px_32px_rgba(0,0,0,0.6)] bg-slate-900/60 hover:bg-slate-900/80 border-cyan-500/20 hover:border-cyan-500/40 ' + (noPadding ? '' : 'p-3.5'),
        'rounded-2xl backdrop-blur-xl border text-slate-100 select-none flex flex-col transition-all duration-300 overflow-hidden group'
      ]"
    >
      <!-- Esquinas Tácticas HUD (Corner Brackets SVG) -->
      <svg class="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/40 group-hover:text-cyan-400/80 transition-colors pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 13V3C1 1.89543 1.89543 1 3 1H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="3" cy="3" r="1" fill="currentColor" />
      </svg>
      <svg class="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/40 group-hover:text-cyan-400/80 transition-colors pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 13V3C13 1.89543 12.1046 1 11 1H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="11" cy="3" r="1" fill="currentColor" />
      </svg>
      <svg class="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/40 group-hover:text-cyan-400/80 transition-colors pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 1V11C1 12.1046 1.89543 13 3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="3" cy="11" r="1" fill="currentColor" />
      </svg>
      <svg class="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/40 group-hover:text-cyan-400/80 transition-colors pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 1V11C13 12.1046 12.1046 13 11 13H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="11" cy="11" r="1" fill="currentColor" />
      </svg>

      <!-- Botón de Control de Enfoque (Maximizar / Minimizar) Táctico -->
      <button
        v-if="isExpanded"
        @click="toggleFocus"
        class="absolute top-3 right-4 z-30 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 transition-all p-1.5 bg-slate-950/80 rounded-lg border border-cyan-500/40 shadow-lg cursor-pointer flex items-center gap-1.5 text-[11px] font-mono font-bold"
        title="Restaurar (Esc)"
      >
        <Minimize2 class="w-3.5 h-3.5 text-cyan-400" />
        <span class="text-slate-300 text-[10px]">Restaurar</span>
      </button>

      <button
        v-else
        @click="toggleFocus"
        class="absolute top-2.5 right-2.5 z-20 text-cyan-400/60 hover:text-cyan-300 hover:border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-all p-1 bg-slate-950/80 rounded-lg border border-cyan-500/30 cursor-pointer shadow"
        title="Maximizar a Pantalla Completa"
      >
        <Maximize2 class="w-3.5 h-3.5" />
      </button>

      <!-- Slot único: mantiene vivos a Leaflet, Osciloscopio y todos los estados -->
      <div class="flex-1 min-h-0 relative h-full flex flex-col overflow-hidden">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
