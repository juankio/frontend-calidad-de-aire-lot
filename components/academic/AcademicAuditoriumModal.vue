<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { GraduationCap, X, BookOpen, Activity, Table } from 'lucide-vue-next'
import anime from 'animejs'
import LabScrew from '~/components/madlab/LabScrew.vue'
import { useNumericalAcademic } from '~/composables/useNumericalAcademic'
import DifferentialEquationsTab from './DifferentialEquationsTab.vue'
import NumericalSimulationTab from './NumericalSimulationTab.vue'
import ErrorAnalysisTab from './ErrorAnalysisTab.vue'

const props = defineProps<{
  isOpen: boolean
  currentSensorPpm?: number
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  c0, cInf, k, duration, h, activeTab,
  criticalStep, isEulerStable, simulation,
  latexSnippet, exportCsv
} = useNumericalAcademic()

const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const tabContentRef = ref<HTMLElement | null>(null)
const tabButtonsRef = ref<Record<string, HTMLElement | null>>({})
const isClosing = ref(false)

const tabs = [
  { id: 'EDO' as const, label: '1. Ecuaciones Diferenciales', icon: BookOpen },
  { id: 'NUMERICAL' as const, label: '2. Simulación Euler vs RK4', icon: Activity },
  { id: 'ERRORS' as const, label: '3. Análisis de Errores & LaTeX', icon: Table }
]

const isReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

// Orquestación fluida de apertura del modal con Anime.js
async function animateOpen() {
  await nextTick()
  if (!backdropRef.value || !modalCardRef.value || isReducedMotion()) return

  anime.remove([backdropRef.value, modalCardRef.value])
  anime({ targets: backdropRef.value, opacity: [0, 1], duration: 260, easing: 'easeOutQuad' })
  anime({ targets: modalCardRef.value, opacity: [0, 1], scale: [0.93, 1], translateY: [20, 0], duration: 380, easing: 'cubicBezier(0.16, 1, 0.3, 1)' })

  const activeBtn = tabButtonsRef.value[activeTab.value]
  if (activeBtn) {
    anime({
      targets: activeBtn,
      filter: ['brightness(1)', 'brightness(1.35) drop-shadow(0 0 10px rgba(245,158,11,0.5))', 'brightness(1)'],
      duration: 500, delay: 200, easing: 'easeOutQuad'
    })
  }
}

// Cierre elegante y reactivo sin lag
function handleClose() {
  if (isClosing.value) return
  if (isReducedMotion() || !modalCardRef.value || !backdropRef.value) {
    emit('close')
    return
  }

  isClosing.value = true
  anime.remove([modalCardRef.value, backdropRef.value])
  anime({ targets: modalCardRef.value, opacity: [1, 0], scale: [1, 0.95], translateY: [0, 14], duration: 180, easing: 'easeInQuad' })
  anime({
    targets: backdropRef.value, opacity: [1, 0], duration: 200, easing: 'easeInQuad',
    complete: () => { isClosing.value = false; emit('close') }
  })
}

// Transición de pestañas reactiva y micro-interacciones de botones
watch(activeTab, async (newTab) => {
  await nextTick()
  const btnEl = tabButtonsRef.value[newTab]
  if (btnEl && !isReducedMotion()) {
    anime.remove(btnEl)
    anime({
      targets: btnEl,
      scale: [0.94, 1.03, 1],
      filter: ['brightness(1)', 'brightness(1.45) drop-shadow(0 0 12px rgba(245,158,11,0.65))', 'brightness(1)'],
      duration: 340, easing: 'easeOutCubic'
    })
  }

  if (tabContentRef.value && !isReducedMotion()) {
    anime.remove(tabContentRef.value)
    anime({ targets: tabContentRef.value, opacity: [0, 1], translateY: [8, 0], duration: 280, easing: 'cubicBezier(0.22, 1, 0.36, 1)' })
  }
})

watch(() => props.isOpen, (open) => {
  if (open) {
    isClosing.value = false
    if (props.currentSensorPpm && props.currentSensorPpm > 300) c0.value = Math.round(props.currentSensorPpm)
    animateOpen()
  }
})

const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.isOpen && !isClosing.value) handleClose() }
onMounted(() => { window.addEventListener('keydown', onKeyDown); if (props.isOpen) animateOpen() })
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div
    v-if="isOpen"
    ref="backdropRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]"
    @click.self="handleClose"
  >
    <div
      ref="modalCardRef"
      class="bg-gradient-to-b from-[#1c150c] via-[#120d08] to-[#0a0704] border-2 border-[#854d0e] rounded-2xl w-full max-w-4xl h-[92dvh] sm:h-[88vh] max-h-[850px] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(251,191,36,0.18)] relative select-none overflow-hidden"
    >
      <!-- Tornillos ornamentales steampunk en esquinas -->
      <div class="absolute top-2.5 left-2.5 z-10"><LabScrew :rotation="42" /></div>
      <div class="absolute top-2.5 right-12 z-10"><LabScrew :rotation="115" /></div>
      <div class="absolute bottom-2.5 left-2.5 z-10"><LabScrew :rotation="78" /></div>
      <div class="absolute bottom-2.5 right-2.5 z-10"><LabScrew :rotation="15" /></div>

      <!-- Cabecera Universitaria -->
      <div class="px-2.5 sm:px-4 py-2 sm:py-3 border-b border-[#854d0e]/50 flex items-center justify-between shrink-0 bg-[#0f0b07] pl-8 sm:pl-9 pr-2 sm:pr-4">
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
          <div class="p-1.5 sm:p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0">
            <GraduationCap class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="min-w-0">
            <h3 class="text-xs sm:text-base font-journal font-bold text-[#fbbf24] flex items-center gap-1.5 sm:gap-2 truncate">
              <span class="truncate">Auditorio Académico</span>
              <span class="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-400 font-mono shrink-0">
                Cátedra Interdisciplinar
              </span>
            </h3>
            <p class="text-[8.5px] sm:text-[10px] text-stone-400 font-journal truncate">
              Ecuaciones Diferenciales Ordinarias (EDO) & Análisis Numérico (Euler vs Runge-Kutta 4)
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          title="Cerrar ventana académica (Esc)"
          aria-label="Cerrar ventana académica"
          class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-amber-950/40 border border-transparent hover:border-amber-700/40 transition cursor-pointer group active:scale-90 shrink-0"
        >
          <X class="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
        </button>
      </div>

      <!-- Selector de Pestañas Académicas con scroll horizontal suave -->
      <div class="px-2.5 sm:px-4 py-2 border-b border-[#854d0e]/30 bg-[#0d0906] flex items-center gap-1.5 sm:gap-2 shrink-0 font-journal text-xs overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          v-for="tab in tabs"
          :key="tab.id"
          :ref="(el) => { if (el) tabButtonsRef[tab.id] = el as HTMLElement }"
          @click="activeTab = tab.id"
          class="min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer relative shrink-0 active:scale-95 text-[11px] sm:text-xs"
          :class="activeTab === tab.id
            ? 'bg-gradient-to-r from-[#b45309] via-[#c25e0a] to-[#92400e] text-white border border-amber-400/60 shadow-[0_2px_10px_rgba(217,119,6,0.35)]'
            : 'bg-[#150f09]/80 border border-[#854d0e]/30 text-stone-400 hover:text-amber-200 hover:bg-[#1a120b] hover:border-[#854d0e]/60'"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5 shrink-0" :class="activeTab === tab.id ? 'text-amber-200' : 'text-stone-500'" />
          <span>{{ tab.label }}</span>
          <span v-if="activeTab === tab.id" class="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24] animate-pulse" />
        </button>
      </div>

      <!-- Contenido de las Pestañas con Transición y Scroll Limpio -->
      <div ref="tabContentRef" class="p-2.5 sm:p-4 overflow-y-auto overscroll-contain flex-1 pb-6 will-change-[opacity,transform]">
        <DifferentialEquationsTab
          v-if="activeTab === 'EDO'"
          :c0="c0" :c-inf="cInf" :k="k" :duration="duration"
          @update:c0="c0 = $event" @update:c-inf="cInf = $event" @update:k="k = $event"
        />
        <NumericalSimulationTab
          v-else-if="activeTab === 'NUMERICAL'"
          :steps="simulation.steps" :metrics-euler="simulation.metricsEuler" :metrics-rk4="simulation.metricsRk4"
          :accuracy-boost="simulation.accuracyBoost" :h="h" :critical-step="criticalStep" :is-euler-stable="isEulerStable"
          @update:h="h = $event"
        />
        <ErrorAnalysisTab
          v-else
          :steps="simulation.steps" :latex-snippet="latexSnippet"
          @export-csv="exportCsv"
        />
      </div>
    </div>
  </div>
</template>
