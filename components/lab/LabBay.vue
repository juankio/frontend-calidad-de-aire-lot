<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import LabBaySlidingDoor from './LabBaySlidingDoor.vue'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  isOpen: boolean
  badge?: string
  badgeColor?: 'emerald' | 'amber' | 'sky' | 'rose'
  theme?: 'graphite' | 'white-lab'
}>(), {
  subtitle: '',
  badge: '',
  badgeColor: 'emerald',
  theme: 'graphite'
})

const emit = defineEmits<{
  (e: 'update:isOpen', val: boolean): void
  (e: 'toggle'): void
}>()

const bayRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragTranslateY = ref<number | null>(null)
let startClientY = 0
let initialTranslate = 0
let bayHeight = 420

function onPointerDown(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  startClientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  if (bayRef.value) bayHeight = bayRef.value.clientHeight || 420
  initialTranslate = props.isOpen ? -92 : 0
  dragTranslateY.value = initialTranslate

  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('touchend', onPointerUp)
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  if ('touches' in e) e.preventDefault()
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const deltaPct = ((clientY - startClientY) / bayHeight) * 100
  dragTranslateY.value = Math.min(0, Math.max(-92, initialTranslate + deltaPct))
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)

  if (dragTranslateY.value !== null) {
    emit('update:isOpen', dragTranslateY.value < -35)
  }
  dragTranslateY.value = null
}

const computedTransform = computed(() => {
  if (dragTranslateY.value !== null) return `translateY(${dragTranslateY.value}%)`
  return props.isOpen ? 'translateY(-92%)' : 'translateY(0%)'
})

const badgeStyles = computed(() => ({
  emerald: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 ring-emerald-500/20',
  amber: 'bg-amber-950/80 border-amber-700/60 text-amber-300 ring-amber-500/20',
  sky: 'bg-sky-950/80 border-sky-700/60 text-sky-300 ring-sky-500/20',
  rose: 'bg-rose-950/80 border-rose-700/60 text-rose-300 ring-rose-500/20'
}[props.badgeColor || 'emerald']))

onUnmounted(() => {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)
})
</script>

<template>
  <div
    ref="bayRef"
    class="relative w-full overflow-hidden rounded-2xl border-2 transition-colors duration-300 select-none shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
    :class="theme === 'white-lab' ? 'bg-[#f1f5f9] border-slate-300' : 'bg-[#0c0e14] border-slate-800'"
  >
    <div class="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>

    <div
      class="relative z-30 px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 shadow-md transition-colors"
      :class="theme === 'white-lab' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200 border-slate-300' : 'bg-gradient-to-r from-slate-900 via-[#131722] to-slate-900 border-slate-800'"
    >
      <div class="flex items-center gap-3 pl-2">
        <span class="w-2.5 h-2.5 rounded-full transition-all duration-300" :class="isOpen ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-500'" />
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-mono text-xs sm:text-sm font-black tracking-widest uppercase drop-shadow" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-slate-100'">
              {{ title }}
            </h3>
            <span v-if="badge" class="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ring-1" :class="badgeStyles">{{ badge }}</span>
          </div>
          <p v-if="subtitle" class="text-[9px] font-mono tracking-wide mt-0.5" :class="theme === 'white-lab' ? 'text-slate-600' : 'text-slate-400'">{{ subtitle }}</p>
        </div>
      </div>

      <button
        @click="emit('toggle')"
        class="px-3 py-1 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
        :class="isOpen
          ? (theme === 'white-lab' ? 'bg-slate-300 border-slate-400 text-slate-800 hover:bg-slate-400' : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700')
          : 'bg-cyan-950/70 border-cyan-700 text-cyan-300 hover:bg-cyan-900'"
      >
        <span>{{ isOpen ? 'BAJAR PUERTA ⯆' : 'SUBIR PUERTA ⯅' }}</span>
      </button>
    </div>

    <div
      class="relative w-full p-4 sm:p-5 transition-opacity duration-500"
      :class="[
        isOpen ? 'opacity-100' : 'opacity-15 pointer-events-none',
        theme === 'white-lab' ? 'bg-slate-100 text-slate-900' : 'bg-[#0c0e14] text-slate-100'
      ]"
    >
      <div class="w-full h-1.5 rounded-full mb-4 transition-all duration-500 flex items-center justify-center" :class="isOpen ? 'bg-gradient-to-r from-cyan-400 via-white to-cyan-400 shadow-[0_0_16px_#38bdf8] animate-pulse' : 'bg-slate-800/40'">
        <div v-if="isOpen" class="w-1/2 h-0.5 bg-white/90 rounded-full blur-[0.5px]" />
      </div>
      <div class="relative z-10">
        <slot />
      </div>
    </div>

    <LabBaySlidingDoor
      :is-open="isOpen"
      :is-dragging="isDragging"
      :computed-transform="computedTransform"
      :theme="theme"
      @pointer-down="onPointerDown"
    />
  </div>
</template>
