<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAirGuardian } from '~/composables/useAirGuardian'
import LiveMascotWidget from '../LiveMascotWidget.vue'
import MechaDigitalTwin from '../mecha/MechaDigitalTwin.vue'
import { Cpu, Eye, Layers, Maximize2, Vibrate, Box } from 'lucide-vue-next'
const props = withDefaults(defineProps<{
  ppm?: number; coPpm?: number; temperature?: number; humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING' | 'DIZZY'
  deviceEmotion?: string; viewMode?: 'FACE' | 'HUD'; pitch?: number; roll?: number; eyeX?: number; eyeY?: number
  isShaking?: boolean; mpuConnected?: boolean; ax?: number; ay?: number; az?: number
  operationMode?: 'LOCAL' | 'LIVE'; hardwareStatus?: 'ONLINE' | 'OFFLINE' | 'SIMULATED'
  wsConnected?: boolean; usbConnected?: boolean; lastPacketAgeSec?: number | null
}>(), {
  ppm: 412, coPpm: 5.8, temperature: 23.8, humidity: 54, riskStatus: 'OPTIMAL', deviceEmotion: 'OPTIMAL',
  viewMode: 'FACE', pitch: 0, roll: 0, eyeX: 0, eyeY: 0, isShaking: false, mpuConnected: true,
  operationMode: 'LIVE', hardwareStatus: 'OFFLINE', wsConnected: false, usbConnected: false, lastPacketAgeSec: null
})
const emit = defineEmits<{
  (e: 'toggleScreenMode'): void; (e: 'shakeDevice'): void; (e: 'rockBaby'): void
  (e: 'selectEmotion', emotion: string): void; (e: 'open3dModal'): void; (e: 'switchToLocal'): void
}>()
const EMOTION_LABELS_ES: Record<string, string> = {
  OPTIMAL: '✨ CENTINELA FELIZ', WARNING_PREDICTIVE: '⚠️ ALERTA PREDICTIVA (TOS)', CRITICAL: '🚨 PELIGRO CRÍTICO',
  RECOVERY: '💨 PURGA & ALIVIO', SLEEPING: '💤 MODO REPOSO', DIZZY: '🌀 MAREADO (ESPIRALES)',
  NAUSEA: '🤢 AGUANTANDO VÓMITO', VOMIT: '🤮 ¡VOMITANDO EN PANTALLA!', WIPER: '🧽 LIMPIAPARABRISAS ACTIVO',
  BABY_ROCKING: '🍼 MECIENDO BEBÉ', BABY_SLEEP: '😪 DORMIDO (BURBUJA MOCO)', STARTLED: '⚡ ¡SUSTO AL DESPERTAR!',
  UPSIDE_DOWN: '🙃 DE CABEZA (180°)', WALL_LEFT: '⬅️ APLASTADO IZQUIERDA', WALL_RIGHT: '➡️ APLASTADO DERECHA',
  FREEFALL: '🪂 CAÍDA LIBRE', BUBBLEGUM: '🍬 GLOBO DE CHICLE', GLASSES_COOL: '😎 MODO COOL',
  RAMEN: '🍜 SORBIENDO RAMEN', COFFEE: '☕ TOMANDO CAFÉ', MUSIC_VIBE: '🎧 MÚSICA & RITMO',
  BUTTERFLY: '🦋 CAZANDO MARIPOSA', DERP: '🤪 BIZCO (DERP)', LOVE: '❤️ ENAMORADO', WINK: '😉 GUIÑO COQUETO',
  DETECTIVE: '🕵️ DETECTIVE LUPA', SUSPICIOUS: '🤨 SOSPECHANDO', ZEN: '🧘 MEDITACIÓN ZEN',
  CRYING: '😭 LLORANDO A MARES', LAUGHING: '😂 CARCAJADAS', WHISTLE: '😙 SILBANDO ALEGRE',
  SNEEZE: '🤧 ¡ESTORNUDO!', YAWN: '🥱 BOSTEZO PROFUNDO', HOT_PANTING: '🥵 CALOR / JADEANDO', GAS_MASK: '😷 MÁSCARA ANTIGÁS'
}
const QUICK_EMOTES = [
  { id: 'OPTIMAL', label: '🙂 Normal' }, { id: 'DIZZY', label: '🌀 Mareo (1s)' }, { id: 'NAUSEA', label: '🤢 Náusea (2s)' },
  { id: 'VOMIT', label: '🤮 Arcada+Vómito' }, { id: 'WIPER', label: '🧽 Limpiar' }, { id: 'BABY_ROCKING', label: '🍼 Mecer' },
  { id: 'BABY_SLEEP', label: '💤 Bostezo+Dormir' }, { id: 'STARTLED', label: '⚡ Susto' }, { id: 'WINK', label: '😉 Guiño' },
  { id: 'LAUGHING', label: '😄 Feliz' }, { id: 'SUSPICIOUS', label: '🤨 Dudar' }, { id: 'YAWN', label: '🥱 Bostezo' },
  { id: 'SNEEZE', label: '🤧 Inhalar+Tos' }
] as const
const chamberStage = ref<'DUAL' | 'XRAY' | '3D_FULL'>('DUAL')
const clamshellDist = ref(0)
function setStage(stage: 'DUAL' | 'XRAY' | '3D_FULL') {
  chamberStage.value = stage
  clamshellDist.value = stage === 'XRAY' ? 24 : 0
}
const isUpsideDown = computed(() => Math.abs(props.roll ?? 0) > 135 || props.deviceEmotion === 'UPSIDE_DOWN')
const activeEmotionKey = computed(() => (props.deviceEmotion || props.riskStatus || 'OPTIMAL').toUpperCase())
const activeEmotionBadge = computed(() => EMOTION_LABELS_ES[activeEmotionKey.value] || `🤖 ${activeEmotionKey.value}`)
const air = useAirGuardian()
interface MotionState { ts: number; pitch: number; roll: number; ax: number; ay: number; az: number; emotion: string; shaking: boolean; hz: number; ageMs: number }
const motionState = computed<MotionState>(() => {
  const raw = (air as unknown as { motionState?: { value?: MotionState } }).motionState?.value
  if (raw) return raw
  return {
    ts: Date.now(),
    pitch: props.pitch ?? 0,
    roll: props.roll ?? 0,
    ax: props.ax ?? 0,
    ay: props.ay ?? 0,
    az: props.az ?? 9.8,
    emotion: props.deviceEmotion ?? 'OPTIMAL',
    shaking: props.isShaking ?? false,
    hz: 0,
    ageMs: 0,
  }
})
const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mirrorRollDeg = ref(Number(props.roll ?? 0))
let rafId: number | null = null
function tick() {
  rafId = requestAnimationFrame(tick)
  const target = Number(motionState.value.roll ?? 0)
  if (reducedMotion) {
    mirrorRollDeg.value = target
    return
  }
  mirrorRollDeg.value += (target - mirrorRollDeg.value) * 0.35
}
onMounted(() => { rafId = requestAnimationFrame(tick) })
onUnmounted(() => { if (rafId !== null) cancelAnimationFrame(rafId); rafId = null })
const mirrorRotationStyle = computed(() => ({
  transform: `rotate(${mirrorRollDeg.value}deg)`,
  transition: 'transform 140ms ease-out'
}))
const energyTheme = computed(() => {
  if (props.isShaking || ['DIZZY', 'NAUSEA', 'VOMIT'].includes(activeEmotionKey.value)) {
    return { color: '#d946ef', badge: 'border-fuchsia-500/80 text-fuchsia-300 bg-fuchsia-950/70 shadow-[0_0_15px_rgba(217,70,239,0.4)]', label: activeEmotionBadge.value, pulse: 'animate-ping' }
  }
  if (props.operationMode === 'LIVE' && props.hardwareStatus === 'OFFLINE' && !props.usbConnected) {
    return { color: '#fb7185', badge: 'border-rose-500/80 text-rose-300 bg-rose-950/70', label: 'ESP32 APAGADO / ESPERANDO SEÑAL WI-FI', pulse: 'animate-pulse' }
  }
  if (props.riskStatus === 'CRITICAL') {
    return { color: '#ef4444', badge: 'border-red-500/80 text-red-400 bg-red-950/60', label: 'NIVEL CRÍTICO • PELIGRO', pulse: 'animate-ping' }
  }
  return { color: '#06b6d4', badge: 'border-cyan-500/70 text-cyan-300 bg-cyan-950/50', label: activeEmotionBadge.value, pulse: 'animate-pulse' }
})
</script>
<template>
  <div class="w-full h-full flex flex-col justify-between gap-1 select-none">
    <div class="flex flex-wrap items-center justify-between gap-1 px-1 shrink-0">
      <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-mono text-[8.5px] sm:text-[9px] tracking-wider transition-all duration-300" :class="energyTheme.badge">
        <Cpu class="w-3 h-3 shrink-0" />
        <span class="font-extrabold uppercase truncate">{{ energyTheme.label }}</span>
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="energyTheme.pulse" :style="{ backgroundColor: energyTheme.color }" />
      </div>
      <div class="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 font-mono text-[8px]">
        <button type="button" @click="setStage('DUAL')" class="px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === 'DUAL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'">
          <Box class="w-2.5 h-2.5" /><span>3D + PANTALLA</span>
        </button>
        <button type="button" @click="setStage('XRAY')" class="px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === 'XRAY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'">
          <Layers class="w-2.5 h-2.5" /><span>RAYOS-X</span>
        </button>
        <button type="button" @click="setStage('3D_FULL')" class="px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer" :class="chamberStage === '3D_FULL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'">
          <span>SOLO 3D</span>
        </button>
        <button type="button" @click="emit('toggleScreenMode')" class="px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer text-cyan-300 hover:bg-cyan-500/15" title="Alternar Cara / Tacómetro HUD">
          <Eye class="w-2.5 h-2.5" /><span>{{ viewMode === 'FACE' ? 'CARA' : 'HUD' }}</span>
        </button>
        <button type="button" @click="emit('open3dModal')" class="px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer text-emerald-300 hover:bg-emerald-500/15" title="Expandir Gemelo Digital 3D">
          <Maximize2 class="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
    <div v-if="operationMode === 'LIVE' && hardwareStatus === 'OFFLINE' && !usbConnected" class="bg-rose-950/85 border border-rose-500/50 text-rose-200 rounded-lg px-2 py-0.5 text-[8px] font-mono flex items-center justify-between gap-2 shrink-0">
      <span class="truncate">📡 MODO EN VIVO: ESP32 físico apagado o sin Wi-Fi (0 paquetes).</span>
      <button type="button" @click="emit('switchToLocal')" class="px-2 py-0.5 rounded bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/60 text-amber-200 font-bold shrink-0 transition cursor-pointer">
        Simulador Local
      </button>
    </div>
    <div v-if="chamberStage === 'DUAL'" class="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-stretch overflow-hidden">
      <div class="sm:col-span-7 h-full min-h-[140px] relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950">
        <MechaDigitalTwin :ppm="ppm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus" :screen-view-mode="viewMode" :pitch="motionState.pitch" :roll="motionState.roll" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="motionState.shaking" :ax="motionState.ax" :ay="motionState.ay" :az="motionState.az" :auto-rotate="false" :xray="false" :clamshell-distance="clamshellDist" :compact="true" />
        <div class="absolute top-1.5 left-1.5 pointer-events-none flex flex-wrap gap-1">
          <span class="px-1.5 py-0.5 rounded bg-slate-950/90 border border-fuchsia-500/50 text-[7.5px] font-mono font-bold text-fuchsia-200">{{ activeEmotionBadge }}</span>
        </div>
      </div>
      <div class="sm:col-span-5 h-full min-h-0 flex flex-col items-center justify-between bg-slate-950/90 border border-cyan-500/25 rounded-xl p-1.5 relative overflow-hidden">
        <div class="w-full flex items-center justify-between gap-1 text-[7.5px] font-mono text-cyan-300 border-b border-cyan-500/20 pb-0.5">
          <span class="font-bold tracking-wider truncate">GC9A01 • {{ activeEmotionBadge }}</span>
          <span v-if="isUpsideDown" class="px-1 py-0.2 rounded bg-amber-950/90 border border-amber-400/70 text-amber-300 font-bold animate-pulse shrink-0">🙃 DE CABEZA (180°)</span>
          <span v-else class="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 shrink-0">240×240</span>
        </div>
        <div class="flex-1 min-h-0 flex items-center justify-center py-0.5">
          <div :style="mirrorRotationStyle" class="flex items-center justify-center">
            <LiveMascotWidget :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus" :view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="isShaking" :compact="true" />
          </div>
        </div>
        <div class="w-full flex items-center justify-between text-[7.5px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/80">
          <span>PITCH: <strong class="text-cyan-300">{{ (pitch ?? 0).toFixed(1) }}°</strong></span>
          <span>ROLL: <strong class="text-cyan-300">{{ (roll ?? 0).toFixed(1) }}°</strong></span>
          <span class="text-emerald-300 font-bold truncate">{{ activeEmotionKey }}</span>
        </div>
      </div>
    </div>
    <div v-else class="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950">
      <MechaDigitalTwin :ppm="ppm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus" :screen-view-mode="viewMode" :pitch="motionState.pitch" :roll="motionState.roll" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="motionState.shaking" :ax="motionState.ax" :ay="motionState.ay" :az="motionState.az" :auto-rotate="false" :xray="chamberStage === 'XRAY'" :clamshell-distance="chamberStage === 'XRAY' ? 24 : clamshellDist" :compact="true" />
      <div class="absolute bottom-1.5 right-1.5 scale-[0.55] origin-bottom-right pointer-events-none">
        <div :style="mirrorRotationStyle" class="flex items-center justify-center">
          <LiveMascotWidget :ppm="ppm" :co-ppm="coPpm" :temperature="temperature" :humidity="humidity" :risk-status="riskStatus" :device-emotion="deviceEmotion || riskStatus" :view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'" :eye-x="eyeX" :eye-y="eyeY" :is-shaking="isShaking" :compact="true" />
        </div>
      </div>
    </div>
    <div class="bg-slate-950/90 border border-cyan-500/25 rounded-lg p-1 shrink-0 font-mono flex flex-col gap-1">
      <div class="flex items-center justify-between gap-1 text-[7.5px]">
        <span class="text-cyan-300 font-bold tracking-wider uppercase truncate">GESTOS FACIALES &amp; FÍSICA IMU (COLOR POR NIVEL DE AIRE)</span>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" @click="emit('shakeDevice')" class="px-2 py-0.5 rounded bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/60 text-fuchsia-200 font-bold transition cursor-pointer active:scale-95 flex items-center gap-1">
            <Vibrate class="w-2.5 h-2.5" /><span>{{ ['DIZZY', 'NAUSEA'].includes(activeEmotionKey) ? '🤮 Agitar 4s (Vómito)' : '🌀 Agitar 1s (Mareo)' }}</span>
          </button>
          <button type="button" @click="emit('rockBaby')" class="px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-500/60 text-sky-200 font-bold transition cursor-pointer active:scale-95">
            <span>🍼 Mecer (Dormir)</span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
        <button
          v-for="emote in QUICK_EMOTES"
          :key="emote.id"
          type="button"
          @click="emit('selectEmotion', emote.id)"
          class="px-1.5 py-0.5 rounded border text-[7.5px] font-bold shrink-0 transition cursor-pointer active:scale-95"
          :class="activeEmotionKey === emote.id ? 'bg-cyan-500/30 border-cyan-300 text-cyan-100 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200'"
        >
          {{ emote.label }}
        </button>
      </div>
    </div>
  </div>
</template>