<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Database, X, Layers } from 'lucide-vue-next'
import anime from 'animejs'
import DataLakeExporter from '~/components/DataLakeExporter.vue'
import type { SessionData, TelemetryData } from '~/composables/useAirGuardian'

const props = defineProps<{
  isOpen: boolean
  sessions?: SessionData[]
  telemetry?: TelemetryData
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const isClosing = ref(false)

const isReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

async function animateOpen() {
  await nextTick()
  if (isReducedMotion() || !modalCardRef.value || !backdropRef.value) return

  anime.remove([backdropRef.value, modalCardRef.value])
  anime({ targets: backdropRef.value, opacity: [0, 1], duration: 250, easing: 'easeOutQuad' })
  anime({ targets: modalCardRef.value, opacity: [0, 1], scale: [0.94, 1], translateY: [15, 0], duration: 350, easing: 'cubicBezier(0.16, 1, 0.3, 1)' })
}

function handleClose() {
  if (isClosing.value) return
  if (isReducedMotion() || !modalCardRef.value || !backdropRef.value) {
    emit('close')
    return
  }

  isClosing.value = true
  anime.remove([modalCardRef.value, backdropRef.value])
  anime({ targets: modalCardRef.value, opacity: [1, 0], scale: [1, 0.95], translateY: [0, 12], duration: 180, easing: 'easeInQuad' })
  anime({
    targets: backdropRef.value,
    opacity: [1, 0],
    duration: 200,
    easing: 'easeInQuad',
    complete: () => {
      isClosing.value = false
      emit('close')
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    isClosing.value = false
    animateOpen()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="isOpen"
    ref="backdropRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
    @click.self="handleClose"
  >
    <div
      ref="modalCardRef"
      class="relative w-full max-w-3xl bg-slate-950 border border-amber-500/40 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Corchetes de diseño táctico -->
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <div class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <div class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

      <!-- Barra Superior -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-amber-500/30 bg-slate-900/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Database class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-scifi font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>DATA LAKEHOUSE // EXPORT</span>
              <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                MEDALLION
              </span>
            </h3>
            <p class="text-[10px] font-mono text-slate-400">Descarga de series históricas y telemetría de silicio</p>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 flex items-center justify-center transition active:scale-90 cursor-pointer"
          title="Cerrar modal"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Contenido: Exporter de Datos -->
      <div class="p-3 sm:p-5 overflow-y-auto">
        <DataLakeExporter
          :sessions="sessions"
          :telemetry="telemetry"
          theme="graphite"
        />
      </div>
    </div>
  </div>
</template>
