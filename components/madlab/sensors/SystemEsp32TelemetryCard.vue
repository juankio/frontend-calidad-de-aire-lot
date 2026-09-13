<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, HardDrive, Clock, ShieldCheck, Sparkles, Monitor } from 'lucide-vue-next'
import LabScrew from '../LabScrew.vue'

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
  if (e.includes('WARNING') || e.includes('ALERT')) return { text: 'ALERTA PREDICTIVA', color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-600' }
  if (e.includes('RECOVERY')) return { text: 'RECUPERACIÓN', color: 'text-teal-400', bg: 'bg-teal-950/70 border-teal-600' }
  if (e.includes('SLEEP')) return { text: 'INACTIVO / SUEÑO', color: 'text-purple-400', bg: 'bg-purple-950/70 border-purple-600' }
  return { text: 'ESTABLE / VIGILANTE', color: 'text-emerald-400', bg: 'bg-emerald-950/70 border-emerald-600' }
})

const viewModeDisplay = computed(() => {
  const vm = (props.viewMode || 'FACE').toUpperCase()
  return vm === 'HUD' ? 'MANÓMETRO CIRCULAR HUD' : 'MASCOTA CENTINELA OLED'
})
</script>

<template>
  <div class="relative bg-gradient-to-b from-[#18120b] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e]/80 rounded-xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 overflow-hidden">
    <LabScrew class="absolute top-1.5 left-1.5" :rotation="18" />
    <LabScrew class="absolute top-1.5 right-1.5" :rotation="-45" />

    <!-- Cabecera de Tarjeta Sistema -->
    <div class="flex items-start justify-between gap-2 pt-1 border-b border-[#854d0e]/40 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-[#27150c] border border-[#854d0e] flex items-center justify-center text-amber-400 shadow-inner shrink-0">
          <Cpu class="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 class="font-journal font-bold text-xs sm:text-sm text-[#fbbf24] flex items-center gap-1.5">
            <span>ESP32 SoC Core</span>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-[#854d0e] text-amber-300">240 MHz</span>
          </h4>
          <p class="text-[9px] font-mono text-stone-400">Xtensa Dual-Core 32-bit LX6 & FreeRTOS</p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#854d0e] bg-[#120d07] text-amber-300 shrink-0">
        <ShieldCheck class="w-2.5 h-2.5 text-emerald-400" />
        <span>SILICIO ACTIVO</span>
      </div>
    </div>

    <!-- Panel de Métricas de Sistema -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <!-- Uptime -->
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 flex flex-col justify-between">
        <div class="text-[8px] font-mono text-stone-400 flex items-center gap-1">
          <Clock class="w-2.5 h-2.5 text-amber-400" />
          <span>Tiempo Activo</span>
        </div>
        <div class="text-xs sm:text-sm font-mono font-bold text-[#fbbf24] mt-1">{{ formattedUptime }}</div>
        <div class="text-[7.5px] font-mono text-stone-500">millis() reloj interno</div>
      </div>

      <!-- Free Heap -->
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 flex flex-col justify-between">
        <div class="text-[8px] font-mono text-stone-400 flex items-center gap-1">
          <Cpu class="w-2.5 h-2.5 text-emerald-400" />
          <span>Heap SRAM Libre</span>
        </div>
        <div class="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-1">{{ heapKb }} KB</div>
        <div class="text-[7.5px] font-mono text-stone-500">SRAM interna 320KB</div>
      </div>

      <!-- Buffer Flash LittleFS -->
      <div class="bg-[#0e0a06] border border-[#854d0e]/40 rounded-lg p-2 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div class="text-[8px] font-mono text-stone-400 flex items-center gap-1">
          <HardDrive class="w-2.5 h-2.5 text-sky-400" />
          <span>Flash LittleFS</span>
        </div>
        <div class="text-xs sm:text-sm font-mono font-bold" :class="pendingSamples > 0 ? 'text-amber-400' : 'text-stone-300'">
          {{ pendingSamples }} muestras
        </div>
        <div class="text-[7.5px] font-mono text-stone-500">Buffer circular 300KB</div>
      </div>
    </div>

    <!-- Estado de Firmware & OLED Display -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-[#854d0e]/30">
      <div class="flex items-center justify-between p-1.5 rounded-lg bg-[#0e0a06] border border-[#854d0e]/40 text-[9px] font-mono">
        <span class="text-stone-400 flex items-center gap-1"><Sparkles class="w-2.5 h-2.5 text-amber-400" /> Emoción Núcleo:</span>
        <span class="font-bold px-1.5 py-0.5 rounded border" :class="[emotionDisplay.color, emotionDisplay.bg]">
          {{ emotionDisplay.text }}
        </span>
      </div>

      <div class="flex items-center justify-between p-1.5 rounded-lg bg-[#0e0a06] border border-[#854d0e]/40 text-[9px] font-mono">
        <span class="text-stone-400 flex items-center gap-1"><Monitor class="w-2.5 h-2.5 text-sky-400" /> Modo OLED:</span>
        <span class="font-bold text-stone-200 truncate max-w-[150px]">{{ viewModeDisplay }}</span>
      </div>
    </div>
  </div>
</template>
