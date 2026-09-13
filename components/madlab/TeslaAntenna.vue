<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Radio, Zap, Battery, AlertTriangle } from 'lucide-vue-next'
import anime from 'animejs'
import MadLabContainer from './MadLabContainer.vue'

const props = withDefaults(defineProps<{
  status?: 'ONLINE' | 'SIMULATED' | 'OFFLINE'
  rssi?: number
  battery?: number
  lastPacketSec?: number
}>(), { status: 'OFFLINE', rssi: -62, battery: 86, lastPacketSec: 999 })

const isOnline = computed(() => props.status === 'ONLINE'), isSimulated = computed(() => props.status === 'SIMULATED'), isOffline = computed(() => props.status === 'OFFLINE')

const statusTheme = computed(() => {
  if (isOnline.value) return { bg: 'border-emerald-500/60 text-emerald-400 bg-emerald-950/50', label: '🟢 ESP32 EN LÍNEA (TELEMETRÍA OK)', waveColor: '#06b6d4', plasma: '#38bdf8', plasmaSec: '#a5f3fc' }
  if (isSimulated.value) return { bg: 'border-amber-500/60 text-amber-300 bg-amber-950/60 animate-pulse', label: '⚡ SIMULADOR ACTIVO (MODO LOCAL)', waveColor: '#f59e0b', plasma: '#fbbf24', plasmaSec: '#fef08a' }
  return { bg: 'border-rose-600/60 text-rose-400 bg-rose-950/40', label: '🔴 ESP32 DESCONECTADO (SIN SEÑAL)', waveColor: '#64748b', plasma: '#94a3b8', plasmaSec: '#cbd5e1' }
})

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const copperSpheresRef = ref<SVGElement | null>(null)
const sparkArc1Ref = ref<SVGElement | null>(null), sparkArc2Ref = ref<SVGElement | null>(null), sparkArc3Ref = ref<SVGElement | null>(null)
const sparkPlasmaGlowRef = ref<SVGElement | null>(null)
const rfRing1 = ref<SVGElement | null>(null), rfRing2 = ref<SVGElement | null>(null), rfRing3 = ref<SVGElement | null>(null), rfRing4 = ref<SVGElement | null>(null)
let ambientTimer: ReturnType<typeof setInterval> | null = null

function clearAllAnimations() {
  const targets = [sparkArc1Ref.value, sparkArc2Ref.value, sparkArc3Ref.value, sparkPlasmaGlowRef.value, copperSpheresRef.value, rfRing1.value, rfRing2.value, rfRing3.value, rfRing4.value].filter(Boolean)
  if (targets.length) anime.remove(targets)
}

function triggerPacketPulse() {
  if (props.status === 'OFFLINE') { clearAllAnimations(); return }
  if (isReducedMotion()) {
    if (sparkPlasmaGlowRef.value) {
      anime.remove(sparkPlasmaGlowRef.value)
      anime({ targets: sparkPlasmaGlowRef.value, opacity: [0, 0.4, 0], duration: 700, easing: 'easeInOutQuad' })
    }
    return
  }

  clearAllAnimations()
  const activePlasma = statusTheme.value.plasma

  // 1. Arcos voltaicos de alta frecuencia entre las esferas de cobre
  if (sparkArc1Ref.value && sparkArc2Ref.value) {
    anime({
      targets: [sparkArc1Ref.value, sparkArc2Ref.value],
      opacity: [{ value: 1, duration: 40 }, { value: 0.15, duration: 30 }, { value: 1, duration: 50 }, { value: 0.25, duration: 40 }, { value: 0.9, duration: 60 }, { value: 0, duration: 150 }],
      easing: 'easeInOutSine'
    })
  }
  if (sparkArc3Ref.value) {
    anime({ targets: sparkArc3Ref.value, opacity: [{ value: 0.95, duration: 45 }, { value: 0.1, duration: 35 }, { value: 0.8, duration: 60 }, { value: 0, duration: 140 }], easing: 'linear' })
  }

  // 2. Destello de plasma y campo electromagnético en las esferas de cobre
  if (copperSpheresRef.value) {
    anime({ targets: copperSpheresRef.value, filter: [`drop-shadow(0 0 0px ${activePlasma})`, `drop-shadow(0 0 16px ${activePlasma})`, `drop-shadow(0 0 3px ${activePlasma})`], duration: 480, easing: 'easeOutQuad' })
  }
  if (sparkPlasmaGlowRef.value) {
    anime({ targets: sparkPlasmaGlowRef.value, opacity: [{ value: 0.85, duration: 50 }, { value: 0.2, duration: 180 }, { value: 0, duration: 200 }], scale: [{ value: 1.3, duration: 80 }, { value: 0.9, duration: 350 }], easing: 'easeOutExpo' })
  }

  // 3. Ondas concéntricas de radiofrecuencia pulsando hacia afuera desde el entrehierro
  const rings = [rfRing1.value, rfRing2.value, rfRing3.value, rfRing4.value].filter(Boolean)
  if (rings.length) {
    anime({
      targets: rings,
      r: [6, 54],
      opacity: [{ value: 0.85, duration: 60 }, { value: 0, duration: 750, easing: 'easeOutCubic' }],
      strokeWidth: [2, 0.4],
      delay: anime.stagger(130),
      duration: 880,
      easing: 'easeOutCubic'
    })
  }
}

function setupAmbientLoop() {
  if (ambientTimer) clearInterval(ambientTimer)
  if (props.status === 'OFFLINE' || isReducedMotion()) return
  ambientTimer = setInterval(() => {
    if (props.status !== 'OFFLINE' && !isReducedMotion() && rfRing1.value && rfRing2.value) {
      anime({
        targets: [rfRing1.value, rfRing2.value],
        r: [6, 38],
        opacity: [{ value: 0.45, duration: 70 }, { value: 0, duration: 1000, easing: 'easeOutQuad' }],
        strokeWidth: [1.6, 0.3],
        delay: anime.stagger(200),
        duration: 1100,
        easing: 'easeOutQuad'
      })
    }
  }, 2600)
}

watch(() => props.lastPacketSec, () => { triggerPacketPulse() })
watch(() => props.status, (st) => {
  if (st !== 'OFFLINE') { triggerPacketPulse(); setupAmbientLoop() }
  else { clearAllAnimations(); if (ambientTimer) clearInterval(ambientTimer) }
})

onMounted(() => { if (props.status !== 'OFFLINE') { triggerPacketPulse(); setupAmbientLoop() } })
onUnmounted(() => { clearAllAnimations(); if (ambientTimer) clearInterval(ambientTimer) })
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-2 border-b border-[#854d0e]/40 mb-2.5">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5" :class="isOnline ? 'text-emerald-400 animate-pulse' : isSimulated ? 'text-amber-400 animate-pulse' : 'text-slate-500'" />
          <span class="text-[11px] font-journal font-bold tracking-wider text-[#fbbf24]">📡 Antena Receptora RF</span>
        </div>
        <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-bold border" :class="statusTheme.bg">{{ statusTheme.label }}</span>
      </div>

      <!-- Escenario SVG Bobina Tesla con Esferas de Cobre y Arcos Voltaicos -->
      <div class="relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#060b14] to-[#020508] border border-[#854d0e]/30 flex-1 min-h-[140px]">
        <svg class="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="cu-coil-ta" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#78350f" /><stop offset="50%" stop-color="#d97706" /><stop offset="100%" stop-color="#b45309" /></linearGradient>
            <radialGradient id="cu-sphere-ta" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#fef08a" /><stop offset="40%" stop-color="#d97706" /><stop offset="100%" stop-color="#78350f" /></radialGradient>
            <radialGradient id="toroid-glow-ta" cx="50%" cy="50%" r="50%">
              <stop offset="0%" :stop-color="isOnline ? '#e0f2fe' : isSimulated ? '#fef3c7' : '#94a3b8'" />
              <stop offset="60%" :stop-color="isOnline ? '#06b6d4' : isSimulated ? '#f59e0b' : '#475569'" />
              <stop offset="100%" stop-color="#083344" />
            </radialGradient>
          </defs>

          <!-- Ondas Concéntricas de RF y Arcos Voltaicos (Anime.js) -->
          <g v-if="!isOffline">
            <circle ref="rfRing1" cx="100" cy="18" r="6" fill="none" :stroke="statusTheme.waveColor" stroke-width="1.6" opacity="0" />
            <circle ref="rfRing2" cx="100" cy="18" r="6" fill="none" :stroke="statusTheme.waveColor" stroke-width="1.6" opacity="0" />
            <circle ref="rfRing3" cx="100" cy="18" r="6" fill="none" :stroke="statusTheme.waveColor" stroke-width="1.6" opacity="0" />
            <circle ref="rfRing4" cx="100" cy="18" r="6" fill="none" :stroke="statusTheme.waveColor" stroke-width="1.6" opacity="0" />
            <ellipse ref="sparkPlasmaGlowRef" cx="100" cy="18" rx="18" ry="10" :fill="statusTheme.plasma" opacity="0" />
            <path ref="sparkArc1Ref" d="M 87 18 Q 93 11 100 19 Q 107 12 113 18" fill="none" :stroke="statusTheme.plasma" stroke-width="2" stroke-linecap="round" opacity="0" />
            <path ref="sparkArc2Ref" d="M 87 18 Q 94 24 100 16 Q 106 23 113 18" fill="none" :stroke="statusTheme.plasmaSec" stroke-width="1.4" stroke-linecap="round" opacity="0" />
            <path ref="sparkArc3Ref" d="M 78 15 L 67 9 M 78 21 L 65 26 M 122 15 L 133 9 M 122 21 L 135 26" fill="none" :stroke="statusTheme.plasma" stroke-width="1.3" stroke-linecap="round" opacity="0" />
          </g>

          <!-- Estructura de la Bobina Secundaria y Primaria -->
          <rect x="75" y="104" width="50" height="12" rx="2" fill="#292524" stroke="#854d0e" stroke-width="1.2" />
          <rect x="85" y="92" width="30" height="12" rx="2" fill="#44403c" stroke="#78350f" stroke-width="1" />
          <line x1="100" y1="92" x2="100" y2="38" stroke="#57534e" stroke-width="4" />
          <path d="M 90 86 Q 100 84 110 86 M 90 78 Q 100 76 110 78 M 90 70 Q 100 68 110 70 M 90 62 Q 100 60 110 62 M 90 54 Q 100 52 110 54 M 90 46 Q 100 44 110 46 M 90 38 Q 100 36 110 38" fill="none" stroke="url(#cu-coil-ta)" stroke-width="2.5" stroke-linecap="round" />
          <ellipse cx="100" cy="30" rx="22" ry="7.5" fill="url(#toroid-glow-ta)" :stroke="isOnline ? '#67e8f9' : isSimulated ? '#fbbf24' : '#64748b'" stroke-width="1.4" />
          <ellipse cx="100" cy="30" rx="8" ry="2.5" fill="#0f172a" />

          <!-- Esferas de Cobre de Descarga (Spark Gap Terminals) -->
          <g ref="copperSpheresRef" class="transition-transform">
            <line x1="82" y1="30" x2="82" y2="18" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" />
            <line x1="118" y1="30" x2="118" y2="18" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" />
            <circle cx="82" cy="18" r="5.5" fill="url(#cu-sphere-ta)" stroke="#fbbf24" stroke-width="1.2" /><circle cx="80.5" cy="16.5" r="1.5" fill="#fef08a" opacity="0.9" />
            <circle cx="118" cy="18" r="5.5" fill="url(#cu-sphere-ta)" stroke="#fbbf24" stroke-width="1.2" /><circle cx="116.5" cy="16.5" r="1.5" fill="#fef08a" opacity="0.9" />
          </g>
        </svg>

        <!-- Overlay de desconexión -->
        <div v-if="isOffline" class="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
          <div class="flex items-center gap-1.5 text-rose-400 font-journal text-[10px] font-bold tracking-wider animate-pulse">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>🔴 ESP32 DESCONECTADO</span>
          </div>
          <span class="text-[8.5px] font-journal text-stone-400 mt-1">Conecta el microcontrolador o activa la palanca de simulación</span>
        </div>
      </div>

      <!-- Indicadores -->
      <div class="grid grid-cols-3 gap-2 mt-auto pt-2 border-t border-[#854d0e]/30 text-center font-mono shrink-0">
        <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
          <div class="flex items-center justify-center gap-1 text-[8.5px] font-journal text-[#fbbf24] font-bold"><Radio class="w-3 h-3" /><span>Señal</span></div>
          <div class="text-[10.5px] font-mono font-extrabold mt-0.5" :class="isOnline ? 'text-emerald-400' : isSimulated ? 'text-amber-400' : 'text-slate-500'">{{ isOnline ? `${rssi} dBm` : isSimulated ? 'VIRTUAL' : '--' }}</div>
        </div>
        <div class="p-1.5 rounded-lg border border-[#854d0e]/40" :class="isOnline ? 'bg-emerald-950/60' : isSimulated ? 'bg-amber-950/60' : 'bg-stone-900/60'">
          <div class="flex items-center justify-center gap-1 text-[8.5px] font-journal font-bold" :class="isOnline ? 'text-emerald-400' : isSimulated ? 'text-amber-400' : 'text-slate-500'"><Battery class="w-3 h-3" /><span>Batería</span></div>
          <div class="text-[10.5px] font-mono font-extrabold text-slate-100 mt-0.5">{{ isOnline ? `${battery}%` : isSimulated ? 'TEST' : 'OFF' }}</div>
        </div>
        <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
          <div class="text-[8.5px] font-journal text-[#fbbf24] font-bold">Datos</div>
          <div class="text-[10px] font-mono font-extrabold mt-0.5" :class="isOnline || isSimulated ? 'text-emerald-400' : 'text-rose-400'">{{ isOnline || isSimulated ? `hace ${lastPacketSec}s` : 'SIN SEÑAL' }}</div>
        </div>
      </div>
    </div>
  </MadLabContainer>
</template>