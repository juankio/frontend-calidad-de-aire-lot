<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted, nextTick } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
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
    class="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-[#854d0e]/30 bg-black/25 flex items-center justify-center pointer-events-none select-none"
    aria-hidden="true"
  >
    <span class="text-[10px] font-mono tracking-widest text-[#854d0e]/60 uppercase">Panel en Vista Expandida</span>
  </div>

  <!-- Teleport a body cuando está expandido para librarse de stacking contexts sin desmontar componentes -->
  <Teleport to="body" :disabled="!isExpanded">
    <!-- Backdrop fijo con blur de laboratorio -->
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
          ? 'fixed inset-3 sm:inset-6 md:inset-10 z-[100] max-w-6xl mx-auto h-[86vh] max-h-[90vh] p-4 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)]'
          : 'relative w-full flex-1 shadow-[0_12px_28px_rgba(0,0,0,0.7)] group hover:border-[#854d0e]/80 ' + (noPadding ? '' : 'p-3.5'),
        'rounded-2xl bg-gradient-to-b from-[#14100c] via-[#0d0a08] to-[#080605] border-2 border-[#854d0e]/60 text-slate-200 select-none flex flex-col transition-colors overflow-hidden'
      ]"
    >
      <LabScrew class="absolute top-2 left-2 pointer-events-none" :rotation="18" />
      <LabScrew class="absolute top-2 right-2 pointer-events-none" :rotation="-42" />
      <LabScrew class="absolute bottom-2 left-2 pointer-events-none" :rotation="65" />
      <LabScrew class="absolute bottom-2 right-2 pointer-events-none" :rotation="-20" />

      <!-- Botón de Control de Enfoque (Maximizar / Minimizar) -->
      <button
        v-if="isExpanded"
        @click="toggleFocus"
        class="absolute top-3 right-4 z-30 text-[#854d0e] hover:text-[#f59e0b] hover:border-[#f59e0b] transition-all p-1.5 bg-black/70 rounded-lg border border-[#854d0e]/50 shadow-lg cursor-pointer flex items-center gap-1.5 text-[11px] font-journal font-bold"
        title="Restaurar (Esc)"
      >
        <Minimize2 class="w-3.5 h-3.5 text-[#fbbf24]" />
        <span class="text-stone-300 text-[10px]">Restaurar</span>
      </button>

      <button
        v-else
        @click="toggleFocus"
        class="absolute top-2.5 right-2.5 z-20 text-[#854d0e]/70 hover:text-[#f59e0b] hover:border-[#fbbf24]/60 opacity-0 group-hover:opacity-100 transition-all p-1 bg-black/60 rounded-lg border border-[#854d0e]/40 cursor-pointer"
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
