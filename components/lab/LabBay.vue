<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

// Estado de Arrastre Táctil e Interactivo (Drag-to-Lift Physics)
const bayRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragTranslateY = ref<number | null>(null)
let startClientY = 0
let initialTranslate = 0
let bayHeight = 420

function onPointerDown(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  startClientY = clientY
  if (bayRef.value) {
    bayHeight = bayRef.value.clientHeight || 420
  }
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
  const deltaY = clientY - startClientY
  const deltaPct = (deltaY / bayHeight) * 100
  const nextVal = initialTranslate + deltaPct
  dragTranslateY.value = Math.min(0, Math.max(-92, nextVal))
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)

  if (dragTranslateY.value !== null) {
    // Si se arrastró más del 35% hacia arriba -> Abierto; si no -> Cerrado
    if (dragTranslateY.value < -35) {
      emit('update:isOpen', true)
    } else {
      emit('update:isOpen', false)
    }
  }
  dragTranslateY.value = null
}

const computedTransform = computed(() => {
  if (dragTranslateY.value !== null) {
    return `translateY(${dragTranslateY.value}%)`
  }
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
    <!-- Remaches de precisión en las 4 esquinas -->
    <div class="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>
    <div class="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-600 shadow-inner flex items-center justify-center z-40"><div class="w-1 h-px bg-slate-900" /></div>

    <!-- Barra Superior de Control de la Bahía -->
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

      <!-- Botón de estado / Toggle -->
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

    <!-- Cámara Interior de Instrumental con Tira LED Superior -->
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

    <!-- Compuerta Corrediza Estriada con ARRASTRE TÁCTIL (Drag-to-Lift) -->
    <div
      class="absolute inset-x-0 bottom-0 top-[49px] z-20 select-none touch-none transition-transform"
      :class="[
        isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isOpen ? 'shadow-2xl' : 'shadow-none'
      ]"
      :style="{ transform: computedTransform }"
      @mousedown="onPointerDown"
      @touchstart="onPointerDown"
    >
      <div 
        class="w-full h-full relative border-t flex flex-col justify-between p-5 shadow-[inset_0_0_35px_rgba(0,0,0,0.85)]"
        :class="theme === 'white-lab' ? 'corrugated-metal-white border-slate-400' : 'corrugated-metal-bay border-slate-700/80'"
      >
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 opacity-60" />
        
        <div class="relative z-10 flex items-center justify-between">
          <div class="bg-slate-950/90 border border-slate-700/80 px-2.5 py-1 rounded shadow">
            <span class="text-[9px] font-mono font-bold text-slate-300 tracking-widest uppercase flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              PORTÓN CORRUGADO • ARRASTRA HACIA ARRIBA
            </span>
          </div>
          <span class="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
            {{ theme === 'white-lab' ? 'ACERO ESMALTADO ASTM-A36' : 'TITANIO ASTM-B265' }}
          </span>
        </div>

        <!-- Manija / Pasador de Agarre Central para Arrastrar con el Mouse -->
        <div class="relative z-10 flex flex-col items-center justify-center my-auto">
          <div class="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 via-[#10141e] to-slate-950 border-2 border-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center gap-2 group hover:border-cyan-500 transition cursor-grab active:cursor-grabbing">
            
            <!-- Barra de agarre ergonómica -->
            <div class="w-36 h-5 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 rounded border border-slate-400 shadow-md flex items-center justify-between px-2.5">
              <div class="w-2 h-2 rounded-full bg-slate-900" />
              <div class="w-12 h-2 bg-slate-900/80 rounded-sm flex items-center justify-center">
                <div class="w-8 h-0.5 bg-slate-400 rounded-full"></div>
              </div>
              <div class="w-2 h-2 rounded-full bg-slate-900" />
            </div>

            <div class="px-4 py-1.5 rounded bg-gradient-to-b from-slate-700 to-slate-800 text-slate-100 font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center gap-2 border border-slate-500">
              <svg class="w-3.5 h-3.5 text-cyan-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span>{{ isDragging ? 'ARRASTRANDO...' : (isOpen ? 'ARRASTRA PARA BAJAR ⯆' : 'ARRASTRA PARA SUBIR ⯅') }}</span>
            </div>

            <span class="text-[8px] font-mono text-cyan-300/80 font-bold">💡 Haz clic y arrastra con el ratón hacia arriba/abajo</span>
          </div>
        </div>

        <!-- Pie de la compuerta -->
        <div class="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span class="text-[8px] font-mono text-slate-500 font-bold uppercase">SISTEMA CORREDIZO</span>
          <div class="h-1.5 w-24 bg-slate-900 rounded-full border border-slate-800" />
          <span class="text-[8px] font-mono text-slate-500 font-bold uppercase">AIR GUARDIAN LAB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Textura de chapa acanalada grafito */
.corrugated-metal-bay {
  background: repeating-linear-gradient(
    90deg,
    #0e1118 0px,
    #171c26 6px,
    #252c3b 12px,
    #151922 18px,
    #0c0e14 24px
  );
}
/* Textura de chapa acanalada blanca / acero esmaltado */
.corrugated-metal-white {
  background: repeating-linear-gradient(
    90deg,
    #cbd5e1 0px,
    #e2e8f0 6px,
    #f8fafc 12px,
    #e2e8f0 18px,
    #cbd5e1 24px
  );
}
</style>
