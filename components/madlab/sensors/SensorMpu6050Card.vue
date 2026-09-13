<script setup lang="ts">
import { computed } from 'vue'
import { Compass, Radio, CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'
import LabScrew from '../LabScrew.vue'

const props = defineProps<{
  mpuConnected?: boolean
  eyeX?: number
  eyeY?: number
}>()

const isConnected = computed(() => props.mpuConnected ?? true)
const xVal = computed(() => Number(props.eyeX ?? 0))
const yVal = computed(() => Number(props.eyeY ?? 0))

// Magnitud de movimiento y detección de sacudida
const motionMagnitude = computed(() => Math.sqrt(xVal.value * xVal.value + yVal.value * yVal.value))
const isDizzyOrShaking = computed(() => motionMagnitude.value > 1.3)

// Mapeo a píxeles dentro del radar analógico de 80x80 px (rango -2.5 a +2.5 mapeado a -28px a +28px)
const pupilPos = computed(() => {
  const clampX = Math.max(-2.5, Math.min(2.5, xVal.value))
  const clampY = Math.max(-2.5, Math.min(2.5, yVal.value))
  const px = (clampX / 2.5) * 26
  const py = (clampY / 2.5) * 26
  return {
    transform: `translate(${px}px, ${py}px)`
  }
})
</script>

<template>
  <div class="relative bg-gradient-to-b from-[#18120b] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e]/80 rounded-xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 overflow-hidden">
    <LabScrew class="absolute top-1.5 left-1.5" :rotation="28" />
    <LabScrew class="absolute top-1.5 right-1.5" :rotation="-70" />

    <!-- Cabecera de Tarjeta Sensor -->
    <div class="flex items-start justify-between gap-2 pt-1 border-b border-[#854d0e]/40 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-[#101b2b] border border-[#854d0e] flex items-center justify-center text-sky-400 shadow-inner shrink-0">
          <Compass class="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h4 class="font-journal font-bold text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5">
            <span>MPU-6050</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#854d0e] text-amber-300">0x68</span>
          </h4>
          <p class="text-[9px] font-mono text-stone-400">Acelerómetro & Giroscopio (I2C Bus)</p>
        </div>
      </div>
      <!-- Badge Conectado / Desconectado -->
      <div
        class="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0"
        :class="isConnected ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'"
      >
        <component :is="isConnected ? CheckCircle2 : XCircle" class="w-2.5 h-2.5" />
        <span>{{ isConnected ? 'I2C ACTIVO' : 'SIN CONEXIÓN' }}</span>
      </div>
    </div>

    <!-- Visor de Inclinación Pupilar y Burbuja Giroscópica -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
      <!-- Retícula Giroscópica Circular -->
      <div class="flex flex-col items-center justify-center bg-[#070503] border border-[#854d0e]/50 rounded-xl p-2 relative overflow-hidden">
        <div class="w-24 h-24 rounded-full border border-dashed border-amber-600/40 relative flex items-center justify-center bg-[#0d0905]">
          <!-- Cruz de retícula -->
          <div class="absolute w-full h-[1px] bg-amber-700/30" />
          <div class="absolute h-full w-[1px] bg-amber-700/30" />
          <div class="w-14 h-14 rounded-full border border-amber-600/30" />

          <!-- Pupila Reactiva MPU -->
          <div
            class="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-amber-900 shadow-[0_0_10px_#f59e0b] transition-transform duration-200 ease-out flex items-center justify-center"
            :style="pupilPos"
          >
            <div class="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
        </div>
        <span class="text-[8px] font-mono text-stone-400 mt-1">Radar de Inclinación</span>
      </div>

      <!-- Métricas de Vector X/Y y Estado Kinésico -->
      <div class="space-y-2">
        <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 space-y-1">
          <div class="flex justify-between items-center text-[10px] font-mono">
            <span class="text-stone-400">Eje Inclinación X:</span>
            <span class="font-bold text-amber-300">{{ xVal >= 0 ? `+${xVal.toFixed(1)}` : xVal.toFixed(1) }}</span>
          </div>
          <div class="flex justify-between items-center text-[10px] font-mono">
            <span class="text-stone-400">Eje Inclinación Y:</span>
            <span class="font-bold text-amber-300">{{ yVal >= 0 ? `+${yVal.toFixed(1)}` : yVal.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Indicador de Sacudida y Mareo -->
        <div
          class="px-2 py-1.5 rounded-lg border text-[9.5px] font-journal font-bold flex items-center gap-1.5"
          :class="isDizzyOrShaking ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse' : 'bg-[#0e0a06] border-[#854d0e]/40 text-stone-400'"
        >
          <AlertTriangle v-if="isDizzyOrShaking" class="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <Radio v-else class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{{ isDizzyOrShaking ? '¡Sacudida / Mareo Detectado!' : 'Inclinación Estable' }}</span>
        </div>
      </div>
    </div>

    <!-- Pines I2C Físicos -->
    <div class="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#854d0e]/30 text-center">
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400">Línea Datos SDA</div>
        <div class="text-xs font-mono font-bold text-amber-300">GPIO 21</div>
        <div class="text-[7.5px] font-mono text-stone-500">I2C Master @ 400kHz</div>
      </div>

      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-1.5">
        <div class="text-[8px] font-mono text-stone-400">Línea Reloj SCL</div>
        <div class="text-xs font-mono font-bold text-amber-300">GPIO 22</div>
        <div class="text-[7.5px] font-mono text-stone-500">I2C Pull-Up 4.7kΩ</div>
      </div>
    </div>
  </div>
</template>
