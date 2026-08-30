<script setup lang="ts">
import { computed } from 'vue'
import { Radio, Zap, Battery, AlertTriangle } from 'lucide-vue-next'
import MadLabContainer from './MadLabContainer.vue'
import LabScrew from './LabScrew.vue'

const props = withDefaults(defineProps<{
  status?: 'ONLINE' | 'SIMULATED' | 'OFFLINE'
  rssi?: number
  battery?: number
  lastPacketSec?: number
}>(), {
  status: 'OFFLINE',
  rssi: -62,
  battery: 86,
  lastPacketSec: 999
})

const isOnline = computed(() => props.status === 'ONLINE')
const isSimulated = computed(() => props.status === 'SIMULATED')
const isOffline = computed(() => props.status === 'OFFLINE')

const statusTheme = computed(() => {
  if (isOnline.value) return { bg: 'border-emerald-500/60 text-emerald-400 bg-emerald-950/50', label: '🟢 ESP32 FÍSICO ONLINE (BATERÍA OK)', waveColor: '#10b981' }
  if (isSimulated.value) return { bg: 'border-amber-500/60 text-amber-300 bg-amber-950/60 animate-pulse', label: '⚡ SIMULADOR ACTIVO (PRUEBAS)', waveColor: '#f59e0b' }
  return { bg: 'border-rose-600/60 text-rose-400 bg-rose-950/40', label: '🔴 ESP32 DESCONECTADO (ESPERANDO)', waveColor: '#64748b' }
})
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
      <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-bold border" :class="statusTheme.bg">
        {{ statusTheme.label }}
      </span>
    </div>

    <!-- Escenario SVG Bobina Tesla -->
    <div class="relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#060b14] to-[#020508] border border-[#854d0e]/30 flex-1 min-h-[140px]">
      <svg class="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cu-coil" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#78350f" /><stop offset="50%" stop-color="#d97706" /><stop offset="100%" stop-color="#b45309" />
          </linearGradient>
          <radialGradient id="toroid-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" :stop-color="isOnline ? '#e0f2fe' : isSimulated ? '#fef3c7' : '#94a3b8'" />
            <stop offset="60%" :stop-color="isOnline ? '#06b6d4' : isSimulated ? '#f59e0b' : '#475569'" />
            <stop offset="100%" stop-color="#083344" />
          </radialGradient>
        </defs>

        <g v-if="!isOffline">
          <circle cx="100" cy="26" r="16" fill="none" :stroke="statusTheme.waveColor" stroke-width="1.2" class="p-wave-1" />
          <circle cx="100" cy="26" r="28" fill="none" :stroke="statusTheme.waveColor" stroke-width="1" class="p-wave-2" />
          <circle cx="100" cy="26" r="42" fill="none" :stroke="statusTheme.waveColor" stroke-width="0.8" class="p-wave-3" />
          <path d="M 86 24 L 72 15 M 114 24 L 128 15 M 100 12 L 100 2 M 82 34 L 70 38 M 118 34 L 130 38" :stroke="isOnline ? '#67e8f9' : '#fde047'" stroke-width="1.5" stroke-linecap="round" class="spark-plasma" />
        </g>

        <rect x="75" y="104" width="50" height="12" rx="2" fill="#292524" stroke="#854d0e" stroke-width="1.2" />
        <rect x="85" y="92" width="30" height="12" rx="2" fill="#44403c" stroke="#78350f" stroke-width="1" />
        <line x1="100" y1="92" x2="100" y2="38" stroke="#57534e" stroke-width="4" />
        <path d="M 90 86 Q 100 84 110 86 M 90 78 Q 100 76 110 78 M 90 70 Q 100 68 110 70 M 90 62 Q 100 60 110 62 M 90 54 Q 100 52 110 54 M 90 46 Q 100 44 110 46 M 90 38 Q 100 36 110 38" fill="none" stroke="url(#cu-coil)" stroke-width="2.5" stroke-linecap="round" />
        <ellipse cx="100" cy="26" rx="22" ry="8" fill="url(#toroid-glow)" :stroke="isOnline ? '#67e8f9' : isSimulated ? '#fbbf24' : '#64748b'" stroke-width="1.4" />
        <ellipse cx="100" cy="26" rx="8" ry="2.5" fill="#0f172a" />
      </svg>

      <div v-if="isOffline" class="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
        <div class="flex items-center gap-1.5 text-rose-400 font-journal text-[10px] font-bold tracking-wider animate-pulse">
          <AlertTriangle class="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>🔴 ESP32 DESCONECTADO (SIN SEÑAL)</span>
        </div>
        <span class="text-[8.5px] font-journal text-stone-400 mt-1">Conecta el dispositivo o activa la Palanca de Pruebas</span>
      </div>
    </div>

    <!-- Indicadores -->
    <div class="grid grid-cols-3 gap-2 mt-auto pt-2 border-t border-[#854d0e]/30 text-center font-mono shrink-0">
      <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
        <div class="flex items-center justify-center gap-1 text-[8.5px] font-journal text-[#fbbf24] font-bold"><Radio class="w-3 h-3" /><span>Señal</span></div>
        <div class="text-[10.5px] font-mono font-extrabold mt-0.5" :class="isOnline ? 'text-emerald-400' : isSimulated ? 'text-amber-400' : 'text-slate-500'">
          {{ isOnline ? `${rssi} dBm` : isSimulated ? 'VIRTUAL' : '--' }}
        </div>
      </div>
      <div class="p-1.5 rounded-lg border border-[#854d0e]/40" :class="isOnline ? 'bg-emerald-950/60' : isSimulated ? 'bg-amber-950/60' : 'bg-stone-900/60'">
        <div class="flex items-center justify-center gap-1 text-[8.5px] font-journal font-bold" :class="isOnline ? 'text-emerald-400' : isSimulated ? 'text-amber-400' : 'text-slate-500'">
          <Battery class="w-3 h-3" /><span>Batería</span>
        </div>
        <div class="text-[10.5px] font-mono font-extrabold text-slate-100 mt-0.5">
          {{ isOnline ? `${battery}%` : isSimulated ? 'TEST' : 'OFF' }}
        </div>
      </div>
      <div class="bg-[#1c1917]/80 p-1.5 rounded-lg border border-[#854d0e]/40">
        <div class="text-[8.5px] font-journal text-[#fbbf24] font-bold">Datos</div>
        <div class="text-[10px] font-mono font-extrabold mt-0.5" :class="isOnline || isSimulated ? 'text-emerald-400' : 'text-rose-400'">
          {{ isOnline || isSimulated ? `hace ${lastPacketSec}s` : 'SIN SEÑAL' }}
        </div>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
@keyframes pulse-wave { 0% { transform: scale(0.6); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
.p-wave-1 { transform-origin: 100px 26px; animation: pulse-wave 1.8s infinite ease-out; }
.p-wave-2 { transform-origin: 100px 26px; animation: pulse-wave 1.8s infinite ease-out 0.6s; }
.p-wave-3 { transform-origin: 100px 26px; animation: pulse-wave 1.8s infinite ease-out 1.2s; }
@keyframes spark { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
.spark-plasma { animation: spark 0.2s infinite alternate ease-in-out; }
</style>