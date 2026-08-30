<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import anime from 'animejs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  title?: string
  noPadding?: boolean
}>(), {
  title: '',
  noPadding: false
})

const isExpanded = ref(false)
const containerExpandedRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

async function toggleFocus() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }

  await nextTick()

  // Soft spring animation for expansion
  if (isExpanded.value && containerExpandedRef.value) {
    anime({
      targets: containerExpandedRef.value,
      scale: [0.95, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'spring(1, 80, 15, 0)'
    })
  }
}
</script>

<template>
  <div v-if="isExpanded" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" @click.self="toggleFocus">
    <div
      ref="containerExpandedRef"
      v-bind="$attrs"
      class="relative w-full max-w-5xl rounded-2xl bg-gradient-to-b from-[#14100c] via-[#0d0a08] to-[#080605] border-2 border-[#854d0e]/60 text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.9)] select-none flex flex-col"
      :class="[noPadding ? '' : 'p-4 sm:p-6', 'max-h-[90vh] overflow-y-auto']"
    >
      <LabScrew class="absolute top-2 left-2" :rotation="18" />
      <LabScrew class="absolute top-2 right-2" :rotation="-42" />
      <LabScrew class="absolute bottom-2 left-2" :rotation="65" />
      <LabScrew class="absolute bottom-2 right-2" :rotation="-20" />
      
      <button @click="toggleFocus" class="absolute top-3 right-4 z-10 text-[#854d0e] hover:text-[#f59e0b] transition-colors p-1 bg-black/40 rounded-lg border border-[#854d0e]/40">
        <Minimize2 class="w-4 h-4" />
      </button>

      <div class="flex-1 min-h-0 relative h-full">
        <slot />
      </div>
    </div>
  </div>

  <div
    v-else
    ref="containerRef"
    v-bind="$attrs"
    class="relative w-full rounded-2xl flex-1 bg-gradient-to-b from-[#14100c] via-[#0d0a08] to-[#080605] border-2 border-[#854d0e]/60 text-slate-200 shadow-[0_12px_28px_rgba(0,0,0,0.7)] select-none flex flex-col group transition-colors hover:border-[#854d0e]/80"
    :class="noPadding ? '' : 'p-3.5'"
  >
    <LabScrew class="absolute top-2 left-2" :rotation="18" />
    <LabScrew class="absolute top-2 right-2" :rotation="-42" />
    <LabScrew class="absolute bottom-2 left-2" :rotation="65" />
    <LabScrew class="absolute bottom-2 right-2" :rotation="-20" />

    <button @click="toggleFocus" class="absolute top-2.5 right-2.5 z-10 text-[#854d0e]/60 hover:text-[#f59e0b] opacity-0 group-hover:opacity-100 transition-all p-1 bg-black/40 rounded-lg border border-[#854d0e]/40">
      <Maximize2 class="w-3.5 h-3.5" />
    </button>

    <div class="flex-1 min-h-0 relative h-full">
      <slot />
    </div>
  </div>
</template>
