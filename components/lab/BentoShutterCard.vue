<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: 'emerald' | 'amber' | 'sky' | 'rose'
  isOpen: boolean
  theme?: 'graphite' | 'white-lab'
}>(), { subtitle: '', badge: '', badgeColor: 'emerald', theme: 'graphite' })

const emit = defineEmits<{ (e: 'update:isOpen', val: boolean): void; (e: 'toggle'): void }>()
const cardRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragY = ref<number | null>(null)
let startY = 0, initialPct = 0, cardH = 300

const toggle = () => { emit('update:isOpen', !props.isOpen); emit('toggle') }
const onPointerDown = (e: PointerEvent) => {
  isDragging.value = true
  startY = e.clientY
  cardH = cardRef.value?.clientHeight || 300
  initialPct = props.isOpen ? -90 : 0
  dragY.value = initialPct
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
const onPointerMove = (e: PointerEvent) => {
  if (isDragging.value) dragY.value = Math.min(0, Math.max(-90, initialPct + ((e.clientY - startY) / cardH) * 100))
}
const onPointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (dragY.value !== null) { emit('update:isOpen', dragY.value < -35); emit('toggle') }
  dragY.value = null
}
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }
})

const transform = computed(() => dragY.value !== null ? `translateY(${dragY.value}%)` : (props.isOpen ? 'translateY(-90%)' : 'translateY(0%)'))
const badgeClass = computed(() => ({
  emerald: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 ring-emerald-500/20',
  amber: 'bg-amber-950/80 border-amber-600/60 text-amber-300 ring-amber-500/20',
  sky: 'bg-sky-950/80 border-sky-600/60 text-sky-300 ring-sky-500/20',
  rose: 'bg-rose-950/80 border-rose-600/60 text-rose-300 ring-rose-500/20'
}[props.badgeColor || 'emerald']))
</script>

<template>
  <div
    ref="cardRef"
    class="relative w-full h-full min-h-[180px] lg:min-h-0 flex flex-col overflow-hidden rounded-2xl border transition-colors select-none shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
    :class="theme === 'white-lab' ? 'bg-[#f8fafc] border-slate-300 text-slate-900' : 'bg-[#0c0e14] border-slate-800 text-slate-100'"
  >
    <div v-for="p in ['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5']" :key="p" :class="['absolute w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-600 shadow-inner z-40', p]" />

    <header
      class="relative z-30 px-3.5 py-2 border-b flex items-center justify-between gap-2 shrink-0 shadow-sm"
      :class="theme === 'white-lab' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200 border-slate-300' : 'bg-gradient-to-r from-slate-900 via-[#131722] to-slate-900 border-slate-800'"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-2 h-2 rounded-full shrink-0" :class="isOpen ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'" />
        <div class="truncate">
          <div class="flex items-center gap-1.5">
            <h4 class="font-mono text-xs font-black uppercase tracking-wider truncate">{{ title }}</h4>
            <span v-if="badge" class="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ring-1" :class="badgeClass">{{ badge }}</span>
          </div>
          <p v-if="subtitle" class="text-[9px] font-mono opacity-70 truncate leading-none mt-0.5">{{ subtitle }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="toggle"
        class="px-2.5 py-1 rounded text-[9px] font-mono font-bold border transition active:scale-95 cursor-pointer shrink-0"
        :class="isOpen ? (theme === 'white-lab' ? 'bg-slate-300 border-slate-400 text-slate-800 hover:bg-slate-400' : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700') : 'bg-cyan-950/80 border-cyan-700 text-cyan-300 hover:bg-cyan-900'"
      >{{ isOpen ? 'BAJAR ⯆' : 'SUBIR ⯅' }}</button>
    </header>

    <div class="relative flex-1 p-3 flex flex-col overflow-hidden transition-opacity duration-300" :class="isOpen ? 'opacity-100' : 'opacity-15 pointer-events-none'">
      <div class="w-full h-1 rounded-full mb-2 shrink-0 transition-all duration-500" :class="isOpen ? 'bg-gradient-to-r from-cyan-400 via-white to-cyan-400 shadow-[0_0_12px_#38bdf8] animate-pulse' : 'bg-slate-800/30'" />
      <div class="flex-1 min-h-0 relative z-10 overflow-y-auto"><slot /></div>
    </div>

    <div
      class="absolute inset-x-0 bottom-0 top-[37px] z-20 touch-none flex flex-col justify-between p-3.5 border-t transition-transform select-none shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]"
      :class="[isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]', isOpen ? 'shadow-2xl' : 'shadow-none', theme === 'white-lab' ? 'corrugated-white border-slate-400' : 'corrugated-graphite border-slate-700/80']"
      :style="{ transform }"
      @pointerdown="onPointerDown"
    >
      <div class="relative z-10 flex items-center justify-between text-[8px] font-mono uppercase">
        <span class="flex items-center gap-1 font-bold text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          COMPUERTA BENTO
        </span>
        <span class="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-bold">{{ theme === 'white-lab' ? 'ACERO ESMALTADO' : 'TITANIO ASTM' }}</span>
      </div>

      <div @click.stop="toggle" class="relative z-10 mx-auto my-auto p-2.5 rounded-xl bg-gradient-to-b from-slate-900 via-[#10141e] to-slate-950 border-2 border-slate-700 hover:border-cyan-500 transition cursor-pointer flex flex-col items-center gap-1.5 group shadow-lg">
        <div class="w-20 h-3 bg-gradient-to-r from-slate-600 via-slate-200 to-slate-600 rounded border border-slate-400 flex items-center justify-between px-1.5">
          <div class="w-1 h-1 rounded-full bg-slate-900" /><div class="w-6 h-1.5 bg-slate-900 rounded-sm" /><div class="w-1 h-1 rounded-full bg-slate-900" />
        </div>
        <span class="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-300 group-hover:text-cyan-300">{{ isOpen ? '⯆ ARRASTRA O CLIC' : '⯅ DESLIZAR PARA ABRIR' }}</span>
      </div>

      <div class="relative z-10 flex items-center justify-between pt-1 border-t border-slate-800/80 text-[8px] font-mono text-slate-500 font-bold uppercase">
        <span>ENCLAVAMIENTO</span><div class="w-16 h-1 bg-slate-950 rounded-full border border-slate-800" /><span>BENTO CELL</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.corrugated-graphite { background: repeating-linear-gradient(90deg, #0e1118 0px, #171c26 6px, #252c3b 12px, #151922 18px, #0c0e14 24px); }
.corrugated-white { background: repeating-linear-gradient(90deg, #cbd5e1 0px, #e2e8f0 6px, #f8fafc 12px, #e2e8f0 18px, #cbd5e1 24px); }
</style>
