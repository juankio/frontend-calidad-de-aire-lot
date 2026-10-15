<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { renderGc9a01Display, normalizeGc9a01Emotion } from '~/utils/gc9a01Renderer'

const props = withDefaults(defineProps<{
  ppm: number
  coPpm?: number
  temperature?: number
  humidity?: number
  riskStatus: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING' | 'DIZZY'
  deviceEmotion?: string
  viewMode?: 'FACE' | 'HUD'
  eyeX?: number
  eyeY?: number
  isShaking?: boolean
  compact?: boolean
}>(), {
  coPpm: 5.5,
  temperature: 24.0,
  humidity: 55.0,
  viewMode: 'FACE',
  eyeX: 0,
  eyeY: 0,
  isShaking: false,
  compact: false
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId: number | null = null

let hoverEyeX = 0
let hoverEyeY = 0
let cachedCx = 0
let cachedCy = 0
let cachedRadiusX = 120
let cachedRadiusY = 120

function updateCenter() {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  cachedCx = rect.left + rect.width / 2
  cachedCy = rect.top + rect.height / 2
  cachedRadiusX = (rect.width / 2) || 120
  cachedRadiusY = (rect.height / 2) || 120
}

function handleMouseMove(e: MouseEvent) {
  if (!cachedCx) updateCenter()
  hoverEyeX = Math.max(-8, Math.min(8, ((e.clientX - cachedCx) / cachedRadiusX) * 6))
  hoverEyeY = Math.max(-7, Math.min(7, ((e.clientY - cachedCy) / cachedRadiusY) * 5))
}

function renderFrame() {
  animId = requestAnimationFrame(renderFrame)
  if (typeof document !== 'undefined' && document.hidden) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const effectiveEyeX = Math.abs(props.eyeX ?? 0) > 0.05 ? Number(props.eyeX) : hoverEyeX
  const effectiveEyeY = Math.abs(props.eyeY ?? 0) > 0.05 ? Number(props.eyeY) : hoverEyeY

  renderGc9a01Display(ctx, {
    ppm: props.ppm,
    coPpm: props.coPpm,
    riskStatus: props.riskStatus,
    temperature: props.temperature,
    humidity: props.humidity,
    emotion: normalizeGc9a01Emotion(props.deviceEmotion || props.riskStatus, props.isShaking),
    viewMode: props.viewMode === 'HUD' ? 'HUD' : 'FACE',
    eyeX: effectiveEyeX,
    eyeY: effectiveEyeY,
    isShaking: props.isShaking
  })
}

onMounted(() => {
  updateCenter()
  animId = requestAnimationFrame(renderFrame)
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('resize', updateCenter, { passive: true })
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', updateCenter)
})
</script>

<template>
  <div
    class="relative rounded-full p-2 bg-gradient-to-tr from-slate-700 via-slate-300 to-slate-800 border-2 border-slate-400 shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center select-none"
    :class="compact ? 'w-[148px] h-[148px] sm:w-[168px] sm:h-[168px]' : 'w-52 h-52 sm:w-56 sm:h-56'"
  >
    <div class="w-full h-full rounded-full overflow-hidden bg-black relative border-2 border-neutral-950 shadow-inner flex items-center justify-center">
      <canvas ref="canvasRef" width="240" height="240" class="w-full h-full object-contain cursor-crosshair" />
      <div class="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]" />
      <div class="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent" />
    </div>
  </div>
</template>
