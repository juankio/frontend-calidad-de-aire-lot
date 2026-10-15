<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Radio, Wifi, Battery, Activity, AlertTriangle } from 'lucide-vue-next'
import anime from 'animejs'
import MadLabContainer from './MadLabContainer.vue'
import { isReducedMotionPreferred } from '~/utils/modalAnimHelper'

const props = withDefaults(defineProps<{
  status?: 'ONLINE' | 'SIMULATED' | 'OFFLINE'
  rssi?: number
  battery?: number
  lastPacketSec?: number
}>(), { status: 'OFFLINE', rssi: -62, battery: 86, lastPacketSec: 999 })

const isOnline = computed(() => props.status === 'ONLINE')
const isSimulated = computed(() => props.status === 'SIMULATED')
const isOffline = computed(() => props.status === 'OFFLINE')

const statusTheme = computed(() => {
  if (isOnline.value) {
    return {
      border: 'border-cyan-500/40',
      badge: 'border-cyan-500/60 text-cyan-300 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
      label: 'ENLACE ESP32 • ACTIVO',
      color: '#06b6d4',
      signalBars: 4
    }
  }
  if (isSimulated.value) {
    return {
      border: 'border-amber-500/40',
      badge: 'border-amber-500/60 text-amber-300 bg-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      label: 'PUENTE VIRTUAL • LOCAL',
      color: '#f59e0b',
      signalBars: 3
    }
  }
  return {
    border: 'border-rose-500/40',
    badge: 'border-rose-500/60 text-rose-400 bg-rose-950/40',
    label: 'SIN ENLACE • DESCONECTADO',
    color: '#ef4444',
    signalBars: 0
  }
})

const spectrumBars = ref([28, 45, 62, 85, 95, 78, 55, 68, 88, 92, 70, 48, 35, 20])
const carrierPulse = ref(0)
let animInterval: ReturnType<typeof setInterval> | null = null

function triggerPacketPulse() {
  if (isOffline.value || isReducedMotionPreferred()) return
  carrierPulse.value = 1
  anime({ targets: carrierPulse, value: [1, 0], duration: 650, easing: 'easeOutQuad' })
  spectrumBars.value = spectrumBars.value.map(() => Math.floor(25 + Math.random() * 70))
}

function startSpectrumLoop() {
  if (animInterval) clearInterval(animInterval)
  if (isOffline.value || isReducedMotionPreferred()) return
  animInterval = setInterval(() => {
    if (!isOffline.value) {
      spectrumBars.value = spectrumBars.value.map(val => {
        const delta = (Math.random() - 0.5) * 24
        return Math.min(95, Math.max(15, Math.round(val + delta)))
      })
    }
  }, 1200)
}

watch(() => props.lastPacketSec, () => { triggerPacketPulse() })
watch(() => props.status, (st) => {
  if (st !== 'OFFLINE') { triggerPacketPulse(); startSpectrumLoop() }
  else if (animInterval) clearInterval(animInterval)
})

onMounted(() => { if (props.status !== 'OFFLINE') startSpectrumLoop() })
onUnmounted(() => { if (animInterval) clearInterval(animInterval) })
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col select-none">
      <div class="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-2">
        <div class="flex items-center gap-2">
          <Radio class="w-3.5 h-3.5 text-cyan-400" :class="!isOffline ? 'animate-pulse' : 'text-slate-600'" />
          <span class="text-[11px] font-mono font-bold tracking-wider text-slate-100 uppercase">CONSOLA RF • 2.4 GHz</span>
        </div>
        <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-bold border transition-all duration-300" :class="statusTheme.badge">
          {{ statusTheme.label }}
        </span>
      </div>

      <div class="relative w-full flex-1 min-h-[135px] rounded-xl bg-[#050811] border border-cyan-500/20 overflow-hidden flex flex-col justify-between p-2.5">
        <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div class="absolute inset-x-0 h-px bg-cyan-400/30 shadow-[0_0_8px_#06b6d4] pointer-events-none animate-pulse" style="top: 40%;" />

        <div class="relative z-10 flex items-center justify-between text-[8px] font-mono text-cyan-400/70">
          <span>ESPECTRO FFT [CH 1-14]</span>
          <span>BW: 20MHz • -{{ Math.abs(rssi) }} dBm</span>
        </div>

        <div class="relative z-10 flex items-end justify-between gap-1 h-20 px-1 pt-2">
          <div v-for="(val, idx) in spectrumBars" :key="idx" class="flex-1 flex flex-col justify-end items-center h-full group">
            <div
              class="w-full rounded-t-sm transition-all duration-300 relative overflow-hidden"
              :style="{
                height: isOffline ? '8%' : `${val}%`,
                backgroundColor: isOffline ? '#334155' : statusTheme.color,
                boxShadow: isOffline ? 'none' : `0 0 8px ${statusTheme.color}`
              }"
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-white/60" />
            </div>
          </div>
        </div>

        <div class="relative z-10 flex items-center justify-between text-[7px] font-mono text-slate-500 pt-1 border-t border-cyan-500/10">
          <span>2.412 GHz</span>
          <span class="text-cyan-400/80">PORTADORA ISMBAND</span>
          <span>2.484 GHz</span>
        </div>

        <div v-if="isOffline" class="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center z-20">
          <div class="flex items-center gap-1.5 text-rose-400 font-mono text-[10px] font-bold tracking-wider animate-pulse">
            <AlertTriangle class="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>ENLACE RF PERDIDO</span>
          </div>
          <span class="text-[8.5px] font-sans text-slate-400 mt-1">Conecta el ESP32 o activa la simulación táctica</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-cyan-500/20 text-center font-mono shrink-0">
        <div class="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20">
          <div class="flex items-center justify-center gap-1 text-[8.5px] text-cyan-400 font-bold"><Wifi class="w-3 h-3" /><span>SEÑAL RF</span></div>
          <div class="text-[11px] font-mono font-extrabold mt-0.5" :class="isOnline ? 'text-cyan-300' : isSimulated ? 'text-amber-300' : 'text-slate-500'">
            {{ isOnline ? `${rssi} dBm` : isSimulated ? 'VIRTUAL' : '0 dBm' }}
          </div>
        </div>
        <div class="p-1.5 rounded-lg border border-cyan-500/20 bg-slate-950/70">
          <div class="flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-300"><Battery class="w-3 h-3 text-cyan-400" /><span>BATERÍA</span></div>
          <div class="text-[11px] font-mono font-extrabold text-slate-100 mt-0.5">{{ isOnline ? `${battery}%` : isSimulated ? '100%' : '0%' }}</div>
        </div>
        <div class="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20">
          <div class="flex items-center justify-center gap-1 text-[8.5px] text-cyan-400 font-bold"><Activity class="w-3 h-3" /><span>LATENCIA</span></div>
          <div class="text-[10.5px] font-mono font-extrabold mt-0.5" :class="isOnline || isSimulated ? 'text-emerald-400' : 'text-rose-400'">
            {{ isOnline || isSimulated ? `${lastPacketSec}s sync` : 'TIMEOUT' }}
          </div>
        </div>
      </div>
    </div>
  </MadLabContainer>
</template>
