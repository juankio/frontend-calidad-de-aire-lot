<script setup lang="ts">
import { computed } from 'vue'
import { Compass, Radio, CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'

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

// Mapeo a píxeles dentro del radar táctico de 72x72 px
const pupilPos = computed(() => {
  const clampX = Math.max(-2.5, Math.min(2.5, xVal.value))
  const clampY = Math.max(-2.5, Math.min(2.5, yVal.value))
  const px = (clampX / 2.5) * 18
  const py = (clampY / 2.5) * 18
  return {
    transform: `translate(${px}px, ${py}px)`
  }
})
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Cabecera de Tarjeta Sensor -->
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
      <!-- Badge Conectado / Desconectado -->
      <div
        class="flex items-center gap-1 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border shrink-0"
        :class="isConnected ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-rose-950/60 border-rose-500/50 text-rose-400'"
      >
        <component :is="isConnected ? CheckCircle2 : XCircle" class="w-2.5 h-2.5" />
        <span>{{ isConnected ? 'I2C ACTIVO' : 'SIN SEÑAL' }}</span>
      </div>
    </div>

    <!-- Visor de Inclinación y Burbuja Giroscópica Táctica -->
    <div class="grid grid-cols-2 gap-2 items-center font-mono">
      <!-- Retícula Giroscópica Circular Compacta -->
      <div class="flex flex-col items-center justify-center bg-slate-950/80 border border-cyan-500/30 rounded-xl p-1.5 relative overflow-hidden">
        <div class="w-18 h-18 rounded-full border border-dashed border-cyan-500/40 relative flex items-center justify-center bg-black/90 shrink-0">
          <!-- Cruz de retícula -->
          <div class="absolute w-full h-[1px] bg-cyan-500/30" />
          <div class="absolute h-full w-[1px] bg-cyan-500/30" />
          <div class="w-10 h-10 rounded-full border border-cyan-500/30" />

          <!-- Diodo Reactivo MPU -->
          <div
            class="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_10px_#06b6d4] transition-transform duration-200 ease-out flex items-center justify-center"
            :style="pupilPos"
          >
            <div class="w-1 h-1 bg-black rounded-full" />
          </div>
        </div>
        <span class="text-[7.5px] font-mono text-slate-400 mt-1">Radar Inclinación</span>
      </div>

      <!-- Métricas de Vector X/Y y Estado Kinésico -->
      <div class="space-y-1.5">
        <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 space-y-0.5">
          <div class="flex justify-between items-center text-[9px]">
            <span class="text-slate-400">Eje X:</span>
            <span class="font-bold text-cyan-300">{{ xVal >= 0 ? `+${xVal.toFixed(1)}` : xVal.toFixed(1) }}</span>
          </div>
          <div class="flex justify-between items-center text-[9px]">
            <span class="text-slate-400">Eje Y:</span>
            <span class="font-bold text-cyan-300">{{ yVal >= 0 ? `+${yVal.toFixed(1)}` : yVal.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Indicador de Sacudida y Mareo -->
        <div
          class="px-1.5 py-1 rounded-lg border text-[8.5px] font-mono font-bold flex items-center gap-1 leading-tight"
          :class="isDizzyOrShaking ? 'bg-amber-950/70 border-amber-500 text-amber-300 animate-pulse' : 'bg-slate-950/80 border-cyan-500/20 text-slate-300'"
        >
          <AlertTriangle v-if="isDizzyOrShaking" class="w-3 h-3 text-amber-400 shrink-0" />
          <Radio v-else class="w-3 h-3 text-cyan-400 shrink-0" />
          <span class="truncate">{{ isDizzyOrShaking ? '¡Sacudida Dinámica!' : 'Inclinación Estable' }}</span>
        </div>
      </div>
    </div>

    <!-- Pines I2C Físicos -->
    <div class="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono">
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400">Línea SDA</div>
        <div class="text-[11px] sm:text-xs font-bold text-cyan-300 leading-tight">GPIO 21</div>
        <div class="text-[7px] text-slate-500">I2C 400kHz</div>
      </div>

      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1 sm:p-1.5">
        <div class="text-[7.5px] text-slate-400">Línea SCL</div>
        <div class="text-[11px] sm:text-xs font-bold text-cyan-300 leading-tight">GPIO 22</div>
        <div class="text-[7px] text-slate-500">Pull-Up 4.7kΩ</div>
      </div>
    </div>
  </div>
</template>
