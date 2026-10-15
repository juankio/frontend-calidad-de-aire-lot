<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import LiveMascotWidget from '../LiveMascotWidget.vue'
import MechaDigitalTwin from '../mecha/MechaDigitalTwin.vue'
import { Cpu, Eye, Layers, Maximize2, Vibrate, Box } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING' | 'DIZZY'
  deviceEmotion?: string
  viewMode?: 'FACE' | 'HUD'
  pitch?: number
  roll?: number
  eyeX?: number
  eyeY?: number
  isShaking?: boolean
  mpuConnected?: boolean
  ax?: number
  ay?: number
  az?: number
  operationMode?: 'LOCAL' | 'LIVE'
  hardwareStatus?: 'ONLINE' | 'OFFLINE' | 'SIMULATED'
  wsConnected?: boolean
  usbConnected?: boolean
  lastPacketAgeSec?: number | null
}>(), {
  ppm: 412,
  coPpm: 5.8,
  temperature: 23.8,
  humidity: 54,
  riskStatus: 'OPTIMAL',
  deviceEmotion: 'OPTIMAL',
  viewMode: 'FACE',
  pitch: 0,
  roll: 0,
  eyeX: 0,
  eyeY: 0,
  isShaking: false,
  mpuConnected: true,
  operationMode: 'LIVE',
  hardwareStatus: 'OFFLINE',
  wsConnected: false,
  usbConnected: false,
  lastPacketAgeSec: null
})

const emit = defineEmits<{
  (e: 'toggleScreenMode'): void
  (e: 'shakeDevice'): void
  (e: 'open3dModal'): void
  (e: 'switchToLocal'): void
}>()

const chamberStage = ref<'DUAL' | 'XRAY' | '3D_FULL'>('DUAL')
const clamshellDist = ref(0)

function setStage(stage: 'DUAL' | 'XRAY' | '3D_FULL') {
  chamberStage.value = stage
  clamshellDist.value = stage === 'XRAY' ? 24 : 0
}

const isUpsideDown = computed(() => Math.abs(props.roll ?? 0) > 135)

const mirrorRollDeg = ref(Number(props.roll ?? 0))
watch(
  () => props.roll,
  (nextRoll) => {
    const target = Number(nextRoll ?? 0)
    const current = mirrorRollDeg.value
    let delta = ((target - current) % 360 + 540) % 360 - 180
    if (delta === -180 && target > current) delta = 180
    mirrorRollDeg.value = Number((current + delta).toFixed(1))
  },
  { immediate: true }
)

const mirrorRotationStyle = computed(() => ({
  transform: `rotate(${mirrorRollDeg.value}deg)`,
  transition: 'transform 140ms ease-out'
}))

const energyTheme = computed(() => {
  if (props.isShaking || props.riskStatus === 'DIZZY' || props.deviceEmotion === 'DIZZY') {
    return { color: '#d946ef', badge: 'border-fuchsia-500/80 text-fuchsia-300 bg-fuchsia-950/70 shadow-[0_0_15px_rgba(217,70,239,0.4)]', label: '¡SACUDIDA GIROSCOPIO • MAREADO!', pulse: 'animate-ping' }
  }
  if (props.operationMode === 'LIVE' && props.hardwareStatus === 'OFFLINE' && !props.usbConnected) {
    return { color: '#fb7185', badge: 'border-rose-500/80 text-rose-300 bg-rose-950/70 shadow-[0_0_15px_rgba(244,63,94,0.35)]', label: 'ESP32 APAGADO / ESPERANDO SEÑAL WI-FI', pulse: 'animate-pulse' }
  }
  if (props.riskStatus === 'CRITICAL') {
    return { color: '#ef4444', badge: 'border-red-500/80 text-red-400 bg-red-950/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]', label: 'NIVEL CRÍTICO • PELIGRO', pulse: 'animate-ping' }
  }
  if (props.riskStatus === 'WARNING_PREDICTIVE') {
    return { color: '#f59e0b', badge: 'border-amber-500/80 text-amber-300 bg-amber-950/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]', label: 'ALERTA PREDICTIVA • DESVÍO', pulse: 'animate-pulse' }
  }
  if (props.riskStatus === 'RECOVERY') {
    return { color: '#38bdf8', badge: 'border-sky-500/80 text-sky-300 bg-sky-950/60', label: 'PURGA & VENTILACIÓN', pulse: 'animate-pulse' }
  }
  if (props.usbConnected) {
    return { color: '#06b6d4', badge: 'border-cyan-400/80 text-cyan-200 bg-cyan-950/70 shadow-[0_0_12px_rgba(6,182,212,0.35)]', label: 'USB ESP32 + WIFI EN LÍNEA', pulse: 'animate-pulse' }
  }
  return { color: '#06b6d4', badge: 'border-cyan-500/70 text-cyan-300 bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]', label: 'CENTINELA ACTIVO • SINCRONIZADO', pulse: 'animate-pulse' }
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between gap-1.5 select-none">
    <div class="flex flex-wrap items-center justify-between gap-1.5 px-1 shrink-0">
      <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-mono text-[8.5px] sm:text-[9px] tracking-wider transition-all duration-300" :class="energyTheme.badge">
        <Cpu class="w-3 h-3 shrink-0" />
        <span class="font-extrabold uppercase truncate">{{ energyTheme.label }}</span>
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="energyTheme.pulse" :style="{ backgroundColor: energyTheme.color }" />
      </div>

      <div class="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 font-mono text-[8px] sm:text-[8.5px]">
        <button type="button" @click="setStage('DUAL')" class="px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === 'DUAL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'">
          <Box class="w-2.5 h-2.5" />
          <span>3D + PANTALLA</span>
        </button>
        <button type="button" @click="setStage('XRAY')" class="px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === 'XRAY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'">
          <Layers class="w-2.5 h-2.5" />
          <span>RAYOS-X COMPONENTES</span>
        </button>
        <button type="button" @click="setStage('3D_FULL')" class="px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === '3D_FULL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'">
          <span>SOLO 3D</span>
        </button>
      </div>
    </div>

    <div
      v-if="operationMode === 'LIVE' && hardwareStatus === 'OFFLINE' && !usbConnected"
      class="bg-rose-950/85 border border-rose-500/50 text-rose-200 rounded-lg px-2.5 py-1 text-[8.5px] font-mono flex items-center justify-between gap-2 shrink-0"
    >
      <span class="truncate">📡 MODO EN VIVO: El servidor Tailscale está listo, pero tu ESP32 físico está apagado o sin Wi-Fi (0 paquetes recibidos).</span>
      <button
        type="button"
        @click="emit('switchToLocal')"
        class="px-2 py-0.5 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 font-bold shrink-0 transition cursor-pointer active:scale-95"
      >
        Cambiar a Simulador Local
      </button>
    </div>

    <div v-if="chamberStage === 'DUAL'" class="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-12 gap-2 items-stretch overflow-hidden">
      <div class="sm:col-span-7 h-full min-h-[170px] relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950">
        <MechaDigitalTwin
          :ppm="ppm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus"
          :device-emotion="deviceEmotion || riskStatus" :screen-view-mode="viewMode"
          :pitch="pitch" :roll="roll" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="isShaking"
          :ax="ax" :ay="ay" :az="az" :auto-rotate="false" :xray="false" :clamshell-distance="clamshellDist" :compact="true"
        />
        <div class="absolute top-1.5 left-1.5 pointer-events-none flex flex-wrap gap-1">
          <span class="px-1.5 py-0.5 rounded bg-slate-950/85 border border-cyan-500/40 text-[7.5px] font-mono text-cyan-300">MQ-135 / MQ-7 (Orejas)</span>
          <span class="px-1.5 py-0.5 rounded bg-slate-950/85 border border-emerald-500/40 text-[7.5px] font-mono text-emerald-300">GC9A01 1.28" (Ojo)</span>
        </div>
        <div class="absolute bottom-1.5 left-1.5 pointer-events-none flex items-center gap-1">
          <span class="px-1.5 py-0.5 rounded bg-slate-950/85 border border-amber-500/40 text-[7.5px] font-mono text-amber-300">DHT11 (Pecho) • MPU-6050</span>
        </div>
      </div>

      <div class="sm:col-span-5 h-full min-h-0 flex flex-col items-center justify-between bg-slate-950/90 border border-cyan-500/25 rounded-xl p-1.5 relative overflow-hidden">
        <div class="w-full flex items-center justify-between text-[7.5px] font-mono text-cyan-300 border-b border-cyan-500/20 pb-1">
          <span class="font-bold tracking-wider">ESPEJO 1:1 PANTALLA GC9A01</span>
          <span
            v-if="isUpsideDown"
            class="px-1.5 py-0.2 rounded bg-amber-950/90 border border-amber-400/70 text-amber-300 font-bold animate-pulse"
          >
            ORIENTACIÓN: DE CABEZA (180°)
          </span>
          <span v-else class="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40">240×240 IPS</span>
        </div>

        <div class="flex-1 min-h-0 flex items-center justify-center py-0.5">
          <div :style="mirrorRotationStyle" class="flex items-center justify-center">
            <LiveMascotWidget
              :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity"
              :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus"
              :view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'" :eye-x="eyeX" :eye-y="eyeY"
              :is-shaking="isShaking" :compact="true"
            />
          </div>
        </div>

        <div class="w-full flex items-center justify-between text-[7.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
          <span>PITCH: <strong class="text-cyan-300">{{ (pitch ?? 0).toFixed(1) }}°</strong></span>
          <span>ROLL: <strong class="text-cyan-300">{{ (roll ?? 0).toFixed(1) }}°</strong></span>
          <span v-if="isUpsideDown" class="text-amber-300 font-bold">DE CABEZA (180°)</span>
          <span v-else>OJO: <strong class="text-emerald-300">{{ (eyeX ?? 0).toFixed(1) }},{{ (eyeY ?? 0).toFixed(1) }}</strong></span>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950">
      <MechaDigitalTwin
        :ppm="ppm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus"
        :device-emotion="deviceEmotion || riskStatus" :screen-view-mode="viewMode"
        :pitch="pitch" :roll="roll" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="isShaking"
        :ax="ax" :ay="ay" :az="az" :auto-rotate="false" :xray="chamberStage === 'XRAY'"
        :clamshell-distance="chamberStage === 'XRAY' ? 24 : clamshellDist" :compact="true"
      />
      <div class="absolute top-2 left-2 pointer-events-none flex flex-wrap gap-1 max-w-[70%]">
        <span class="px-1.5 py-0.5 rounded bg-slate-950/90 border border-emerald-500/50 text-[8px] font-mono text-emerald-300">ESP32 30P</span>
        <span class="px-1.5 py-0.5 rounded bg-slate-950/90 border border-sky-500/50 text-[8px] font-mono text-sky-300">MPU-6050 I2C</span>
        <span class="px-1.5 py-0.5 rounded bg-slate-950/90 border border-rose-500/50 text-[8px] font-mono text-rose-300">MQ-135 + MQ-7</span>
        <span class="px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-500/50 text-[8px] font-mono text-amber-300">DHT11 + GC9A01 SPI</span>
        <span v-if="isUpsideDown" class="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-400/70 text-[8px] font-mono font-bold text-amber-300">ORIENTACIÓN: DE CABEZA (180°)</span>
      </div>
      <div class="absolute bottom-1.5 right-1.5 scale-[0.58] origin-bottom-right pointer-events-none">
        <div :style="mirrorRotationStyle" class="flex items-center justify-center">
          <LiveMascotWidget
            :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity"
            :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus"
            :view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'" :eye-x="eyeX" :eye-y="eyeY"
            :is-shaking="isShaking" :compact="true"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-1.5 shrink-0 font-mono text-[8.5px] sm:text-[9px]">
      <button type="button" @click="emit('toggleScreenMode')" class="min-h-[28px] px-2 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95">
        <Eye class="w-3 h-3 shrink-0" />
        <span class="truncate">PANTALLA: {{ viewMode === 'FACE' ? 'CARA EXPRESIVA' : 'TACÓMETRO HUD' }}</span>
      </button>
      <button type="button" @click="emit('shakeDevice')" class="min-h-[28px] px-2 py-1 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/50 hover:border-fuchsia-300 text-fuchsia-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95">
        <Vibrate class="w-3 h-3 shrink-0" />
        <span class="truncate">SACUDIR MPU-6050</span>
      </button>
      <button type="button" @click="emit('open3dModal')" class="min-h-[28px] px-2 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-300 text-emerald-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95">
        <Maximize2 class="w-3 h-3 shrink-0" />
        <span class="truncate">EXPANDIR 3D</span>
      </button>
    </div>
  </div>
</template>