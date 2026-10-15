<script setup lang="ts">
import { ref, computed } from 'vue'
import { Compass, Radio, CheckCircle2, XCircle, AlertTriangle, Vibrate } from 'lucide-vue-next'
import {
  getMpuShakeButtonLabel,
  getMpuOrientationLabel,
  computeMpuPupilStyle,
  computePointerGyroAngles
} from '~/utils/mpu6050Helper'

const props = defineProps<{
  mpuConnected?: boolean; eyeX?: number; eyeY?: number; pitch?: number; roll?: number
  isShaking?: boolean; deviceEmotion?: string; isHardwareOnline?: boolean
}>()

const emit = defineEmits<{
  (e: 'updateGyro', eyeX: number, eyeY: number): void; (e: 'shake'): void; (e: 'calibrate'): void
}>()

const isOnline = computed(() => props.isHardwareOnline ?? true)
const isConnected = computed(() => isOnline.value && (props.mpuConnected ?? true))
const xVal = computed(() => Number(props.eyeX ?? 0))
const yVal = computed(() => Number(props.eyeY ?? 0))
const rollVal = computed(() => (props.roll !== undefined && props.roll !== 0) ? Number(props.roll) : Number((xVal.value * 9.0).toFixed(1)))
const pitchVal = computed(() => (props.pitch !== undefined && props.pitch !== 0) ? Number(props.pitch) : Number((yVal.value * 9.0).toFixed(1)))
const rollDeg = rollVal
const pitchDeg = pitchVal

const isDizzyOrShaking = computed(() =>
  Boolean(props.isShaking) || ['DIZZY', 'NAUSEA', 'VOMIT', 'WIPER'].includes(String(props.deviceEmotion ?? ''))
)

const shakeButtonLabel = computed(() => getMpuShakeButtonLabel(String(props.deviceEmotion ?? '')))
const orientationStatusLabel = computed(() =>
  getMpuOrientationLabel(String(props.deviceEmotion ?? ''), isDizzyOrShaking.value, rollVal.value)
)
const pupilPos = computed(() => computeMpuPupilStyle(rollVal.value, pitchVal.value))

const radarRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

function updateGyroFromEvent(e: PointerEvent) {
  if (!radarRef.value) return
  const { eyeX, eyeY } = computePointerGyroAngles(e, radarRef.value.getBoundingClientRect())
  emit('updateGyro', eyeX, eyeY)
}

function toggleUpsideDownTest() {
  emit('updateGyro', Math.abs(rollVal.value) > 135 ? 0 : 20, 0)
}

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
  updateGyroFromEvent(e)
}
function onPointerMove(e: PointerEvent) {
  if (isDragging.value) updateGyroFromEvent(e)
}
function onPointerUp() {
  isDragging.value = false
}
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
          <Compass class="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>MPU-6050</span>
            <span class="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">0x68</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Acelerómetro & Giroscopio (I2C Bus)</p>
        </div>
      </div>
      <div
        class="flex items-center gap-1 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0"
        :class="isConnected ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-rose-950/60 border-rose-500/50 text-rose-400'"
      >
        <component :is="isConnected ? CheckCircle2 : XCircle" class="w-2.5 h-2.5" />
        <span>{{ !isOnline ? 'ESP32 OFF • SIN I2C' : (isConnected ? 'I2C ACTIVO' : 'SIN SEÑAL') }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 items-center font-mono">
      <div class="flex flex-col items-center justify-center bg-slate-950/80 border border-cyan-500/30 rounded-xl p-1.5 relative overflow-hidden">
        <div
          ref="radarRef"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @dblclick="emit('updateGyro', 0, 0)"
          class="w-[68px] h-[68px] rounded-full border border-dashed border-cyan-500/50 relative flex items-center justify-center bg-black/90 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          title="Arrastra para inclinar el giroscopio • Doble clic para centrar"
        >
          <div class="absolute w-full h-[1px] bg-cyan-500/30 pointer-events-none" />
          <div class="absolute h-full w-[1px] bg-cyan-500/30 pointer-events-none" />
          <div class="w-9 h-9 rounded-full border border-cyan-500/30 pointer-events-none" />

          <div
            class="w-3.5 h-3.5 rounded-full border transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
            :class="isDizzyOrShaking ? 'bg-fuchsia-400 border-fuchsia-200 shadow-[0_0_12px_#d946ef]' : 'bg-cyan-400 border-cyan-200 shadow-[0_0_10px_#06b6d4]'"
            :style="pupilPos"
          >
            <div class="w-1 h-1 bg-black rounded-full" />
          </div>
        </div>
        <span class="text-[7.5px] font-mono text-cyan-300/90 mt-1">Arrastra Radar 3D</span>
      </div>

      <div class="space-y-1">
        <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 space-y-0.5">
          <div class="flex justify-between items-center text-[8.5px]">
            <span class="text-slate-400">Roll (Lado):</span>
            <span class="font-bold text-cyan-300">{{ rollDeg >= 0 ? `+${rollDeg.toFixed(1)}°` : `${rollDeg.toFixed(1)}°` }}</span>
          </div>
          <div class="flex justify-between items-center text-[8.5px]">
            <span class="text-slate-400">Pitch (Frente):</span>
            <span class="font-bold text-cyan-300">{{ pitchDeg >= 0 ? `+${pitchDeg.toFixed(1)}°` : `${pitchDeg.toFixed(1)}°` }}</span>
          </div>
        </div>

        <div
          class="px-1.5 py-1 rounded-lg border text-[8px] font-mono font-bold flex items-center gap-1 leading-tight"
          :class="isDizzyOrShaking ? 'bg-amber-950/70 border-amber-500 text-amber-300 animate-pulse' : (Math.abs(rollVal) > 135 ? 'bg-cyan-950/80 border-cyan-400/70 text-cyan-200' : 'bg-slate-950/80 border-cyan-500/20 text-slate-300')"
        >
          <AlertTriangle v-if="isDizzyOrShaking" class="w-3 h-3 text-amber-400 shrink-0" />
          <Radio v-else class="w-3 h-3 text-cyan-400 shrink-0" />
          <span class="truncate">{{ orientationStatusLabel }}</span>
        </div>

        <div class="grid grid-cols-3 gap-1">
          <button type="button" @click="emit('calibrate')" class="w-full py-1 px-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 text-[7.5px] font-mono font-bold flex items-center justify-center gap-0.5 transition cursor-pointer active:scale-95" title="Calibrar posición actual como 0.0°">
            <Compass class="w-2.5 h-2.5 shrink-0" /><span>0°</span>
          </button>
          <button type="button" @click="toggleUpsideDownTest" class="w-full py-1 px-1 rounded-lg border text-[7.5px] font-mono font-bold flex items-center justify-center gap-0.5 transition cursor-pointer active:scale-95" :class="Math.abs(rollVal) > 135 ? 'bg-amber-500/25 border-amber-400/80 text-amber-200' : 'bg-slate-950/80 hover:bg-slate-900 border-amber-500/40 text-amber-300'" title="Probar rotación 180° De Cabeza">
            <span>180°</span>
          </button>
          <button type="button" @click="emit('shake')" class="w-full py-1 px-1 rounded-lg bg-fuchsia-950/60 hover:bg-fuchsia-900/70 border border-fuchsia-500/40 text-fuchsia-300 text-[7px] font-mono font-bold flex items-center justify-center gap-0.5 transition cursor-pointer active:scale-95" title="Sacudir repetidamente: 1x Mareo -> 2x Náusea -> 3x Vómito + Limpiaparabrisas">
            <Vibrate class="w-2.5 h-2.5 shrink-0" /><span class="truncate">{{ shakeButtonLabel }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono">
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1">
        <div class="text-[7px] text-slate-400">Línea SDA</div>
        <div class="text-[10.5px] font-bold text-cyan-300 leading-tight">GPIO 21</div>
      </div>
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1">
        <div class="text-[7px] text-slate-400">Línea SCL</div>
        <div class="text-[10.5px] font-bold text-cyan-300 leading-tight">GPIO 22</div>
      </div>
    </div>
  </div>
</template>
