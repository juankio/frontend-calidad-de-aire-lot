<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, HardDrive, Clock, ShieldCheck, Sparkles, Monitor } from 'lucide-vue-next'

const props = defineProps<{
  uptimeS?: number
  freeHeap?: number
  offlinePending?: number
  deviceEmotion?: string
  viewMode?: string
}>()

// Formateo de Uptime a Días, Horas, Minutos, Segundos
const formattedUptime = computed(() => {
  const total = Number(props.uptimeS ?? 3600)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
})

// Memoria Libre en KB
const heapKb = computed(() => {
  const bytes = Number(props.freeHeap ?? 184320)
  return (bytes / 1024).toFixed(1)
})

// Muestras encoladas en LittleFS Flash
const pendingSamples = computed(() => Number(props.offlinePending ?? 0))

const emotionDisplay = computed(() => {
  const e = (props.deviceEmotion || 'OPTIMAL').toUpperCase()
  if (e.includes('CRITICAL') || e.includes('DANGER')) return { text: 'CRÍTICA / PÁNICO', color: 'text-rose-400', bg: 'bg-rose-950/70 border-rose-600' }
  if (e.includes('WARNING') || e.includes('ALERT')) return { text: 'ALERTA PREDICTIVA', color: 'text-amber-300', bg: 'bg-amber-950/70 border-amber-500' }
  if (e.includes('RECOVERY')) return { text: 'RECUPERACIÓN', color: 'text-sky-300', bg: 'bg-sky-950/70 border-sky-500' }
  if (e.includes('SLEEP')) return { text: 'STANDBY', color: 'text-slate-400', bg: 'bg-slate-900 border-slate-700' }
  return { text: 'ESTABLE / VIGILANTE', color: 'text-cyan-300', bg: 'bg-cyan-950/70 border-cyan-500' }
})

const viewModeDisplay = computed(() => {
  const vm = (props.viewMode || 'FACE').toUpperCase()
  return vm === 'HUD' ? 'MANÓMETRO CIRCULAR HUD' : 'CENTINELA VISOR MECHA'
})
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Cabecera de Tarjeta Sistema -->
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
          <Cpu class="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>ESP32 SoC Core</span>
            <span class="text-[8.5px] font-mono px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">240 MHz</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Xtensa Dual-Core 32b LX6 & FreeRTOS</p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/40 bg-slate-950 text-cyan-300 shrink-0">
        <ShieldCheck class="w-2.5 h-2.5 text-emerald-400" />
        <span>SILICIO ACTIVO</span>
      </div>
    </div>

    <!-- Panel de Métricas de Sistema -->
    <div class="grid grid-cols-3 gap-1.5 font-mono">
      <!-- Uptime -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 flex flex-col justify-between">
        <div class="text-[7.5px] text-slate-400 flex items-center gap-1">
          <Clock class="w-2.5 h-2.5 text-cyan-400" />
          <span>Tiempo Activo</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-slate-100 mt-0.5 leading-tight">{{ formattedUptime }}</div>
        <div class="text-[7px] text-slate-500">millis() reloj</div>
      </div>

      <!-- Free Heap -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 flex flex-col justify-between">
        <div class="text-[7.5px] text-slate-400 flex items-center gap-1">
          <Cpu class="w-2.5 h-2.5 text-emerald-400" />
          <span>Heap Libre</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold text-emerald-400 mt-0.5 leading-tight">{{ heapKb }} KB</div>
        <div class="text-[7px] text-slate-500">SRAM 320KB</div>
      </div>

      <!-- Buffer Flash LittleFS -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-1.5 flex flex-col justify-between">
        <div class="text-[7.5px] text-slate-400 flex items-center gap-1">
          <HardDrive class="w-2.5 h-2.5 text-sky-400" />
          <span>LittleFS</span>
        </div>
        <div class="text-[11px] sm:text-xs font-bold mt-0.5 leading-tight" :class="pendingSamples > 0 ? 'text-amber-300' : 'text-slate-300'">
          {{ pendingSamples }} m.
        </div>
        <div class="text-[7px] text-slate-500">Buffer 300KB</div>
      </div>
    </div>

    <!-- Estado de Firmware & OLED Display -->
    <div class="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/20 font-mono">
      <div class="flex items-center justify-between p-1 rounded-lg bg-slate-950/80 border border-cyan-500/20 text-[8.5px]">
        <span class="text-slate-400 flex items-center gap-1"><Sparkles class="w-2.5 h-2.5 text-cyan-400" /> Núcleo:</span>
        <span class="font-bold px-1 py-0.2 rounded border text-[8px]" :class="[emotionDisplay.color, emotionDisplay.bg]">
          {{ emotionDisplay.text }}
        </span>
      </div>

      <div class="flex items-center justify-between p-1 rounded-lg bg-slate-950/80 border border-cyan-500/20 text-[8.5px]">
        <span class="text-slate-400 flex items-center gap-1"><Monitor class="w-2.5 h-2.5 text-sky-400" /> Display:</span>
        <span class="font-bold text-slate-200 truncate max-w-[110px] text-[8px]">{{ viewModeDisplay }}</span>
      </div>
    </div>
  </div>
</template>
