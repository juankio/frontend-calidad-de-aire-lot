<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { X, Box, Sparkles } from 'lucide-vue-next'
import anime from 'animejs'
import MechaDigitalTwin from './MechaDigitalTwin.vue'
import MechaDigitalTwinHud from './MechaDigitalTwinHud.vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
  ppm?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING' | 'DIZZY'
  deviceEmotion?: string
  screenViewMode?: 'FACE' | 'HUD'
  pitch?: number
  roll?: number
  eyeX?: number
  eyeY?: number
  isShaking?: boolean
  ax?: number
  ay?: number
  az?: number
  temperature?: number
  humidity?: number
}>(), {
  ppm: 420,
  riskStatus: 'OPTIMAL',
  deviceEmotion: 'OPTIMAL',
  screenViewMode: 'FACE',
  pitch: 0,
  roll: 0,
  eyeX: 0,
  eyeY: 0,
  isShaking: false,
  temperature: 24.2,
  humidity: 52
})

const emit = defineEmits<{ (e: 'close'): void }>()

const twinRef = ref<InstanceType<typeof MechaDigitalTwin> | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const isClosing = ref(false)

const isWireframe = ref(false)
const isXray = ref(false)
const clamshellDist = ref(0)
const autoRotateActive = ref(false)

const displayPitch = computed(() => {
  if (props.pitch !== undefined && props.pitch !== 0) return Number(props.pitch).toFixed(1)
  if (props.eyeY !== undefined && props.eyeY !== 0) return (Number(props.eyeY) * 9.0).toFixed(1)
  return '0.0'
})

const displayRoll = computed(() => {
  if (props.roll !== undefined && props.roll !== 0) return Number(props.roll).toFixed(1)
  if (props.eyeX !== undefined && props.eyeX !== 0) return (Number(props.eyeX) * 9.0).toFixed(1)
  return '0.0'
})

function handleResetCamera() {
  if (twinRef.value?.resetCamera) {
    twinRef.value.resetCamera()
  }
}

async function animateOpen() {
  await nextTick()
  if (!modalCardRef.value || !backdropRef.value) return
  anime.remove([backdropRef.value, modalCardRef.value])
  anime({ targets: backdropRef.value, opacity: [0, 1], duration: 240, easing: 'easeOutQuad' })
  anime({ targets: modalCardRef.value, opacity: [0, 1], scale: [0.95, 1], translateY: [18, 0], duration: 320, easing: 'cubicBezier(0.16, 1, 0.3, 1)' })
}

function handleClose() {
  if (isClosing.value) return
  if (!modalCardRef.value || !backdropRef.value) {
    emit('close')
    return
  }
  isClosing.value = true
  anime.remove([modalCardRef.value, backdropRef.value])
  anime({ targets: modalCardRef.value, opacity: [1, 0], scale: [0.95, 1], translateY: [0, 15], duration: 180, easing: 'easeInQuad' })
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

watch(() => props.isOpen, (val) => {
  if (val) {
    isClosing.value = false
    animateOpen()
  }
})
</script>

<template>
  <div
    v-if="isOpen"
    ref="backdropRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md"
    @click.self="handleClose"
  >
    <div
      ref="modalCardRef"
      class="relative w-full max-w-6xl h-[92vh] max-h-[860px] bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 font-sans"
    >
      <header class="shrink-0 px-4 py-3 border-b border-cyan-500/25 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Box class="w-4 h-4" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-scifi font-bold text-sm sm:text-base text-white tracking-wider flex items-center gap-1.5">
                <span class="text-cyan-400">GEMELO DIGITAL 3D</span> • CYBER-MECHA
              </h2>
              <span class="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold hidden sm:inline">
                TELEMETRÍA CAD STL
              </span>
            </div>
            <p class="text-[9.5px] font-mono text-slate-400">Inspección de Hardware FDM • Simulador Dinámico Inercial</p>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono">
          <div class="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-[10px]">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span class="text-cyan-300 font-bold">{{ ppm }} PPM</span>
          </div>
          <button
            type="button"
            @click="handleClose"
            class="w-8 h-8 rounded-lg bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </header>

      <div class="flex-1 min-h-0 flex flex-col lg:flex-row items-stretch">
        <div class="flex-1 relative bg-gradient-to-b from-slate-950 via-[#030a16] to-slate-950 flex items-center justify-center overflow-hidden min-h-[340px] lg:min-h-0">
          <div class="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

          <MechaDigitalTwin
            ref="twinRef"
            :ppm="ppm"
            :temperature="temperature"
            :humidity="humidity"
            :risk-status="riskStatus"
            :device-emotion="deviceEmotion"
            :screen-view-mode="screenViewMode"
            :pitch="pitch"
            :roll="roll"
            :eye-x="eyeX"
            :eye-y="eyeY"
            :is-shaking="isShaking"
            :ax="ax"
            :ay="ay"
            :az="az"
            :wireframe="isWireframe"
            :xray="isXray"
            :clamshell-distance="clamshellDist"
            :auto-rotate="autoRotateActive"
          />

          <div class="absolute bottom-3 right-3 pointer-events-none font-mono text-[9px] text-cyan-300/80 bg-slate-950/80 border border-cyan-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-2">
            <Sparkles class="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>RENDER ENGINE: THREE.JS PBR V186</span>
          </div>
        </div>

        <MechaDigitalTwinHud
          v-model:wireframe="isWireframe"
          v-model:xray="isXray"
          v-model:clamshell-dist="clamshellDist"
          v-model:auto-rotate="autoRotateActive"
          :display-pitch="displayPitch"
          :display-roll="displayRoll"
          @reset-camera="handleResetCamera"
        />
      </div>
    </div>
  </div>
</template>
