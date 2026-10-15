<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Cpu, Radio, Zap, GraduationCap, Usb, Activity, MapPin, Clock, Box, Database } from 'lucide-vue-next'

const props = defineProps<{
  operationMode: 'LOCAL' | 'LIVE'
  hardwareStatus: 'ONLINE' | 'OFFLINE' | 'SIMULATED'
}>()

const emit = defineEmits<{
  (e: 'setOperationMode', mode: 'LOCAL' | 'LIVE'): void
  (e: 'openAcademic'): void
  (e: 'openUsb'): void
  (e: 'openSensors'): void
  (e: 'openMarkLocation'): void
  (e: 'openDigitalTwin'): void
  (e: 'openDataLake'): void
}>()

const clockTime = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

function updateClock() {
  const now = new Date()
  clockTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 1000) })
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })

const statusBadge = computed(() => {
  if (props.operationMode === 'LOCAL') {
    return { label: 'MODO LOCAL • DATOS SINTÉTICOS', dot: 'bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse', border: 'border-amber-500/40 text-amber-300 bg-amber-950/40', short: 'LOCAL' }
  }
  if (props.hardwareStatus === 'ONLINE') {
    return { label: 'ESP32 EN LÍNEA • TELEMETRÍA OK', dot: 'bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse', border: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40', short: 'ESP32 ON' }
  }
  return { label: 'ESP32 DESCONECTADO • SIN SEÑAL', dot: 'bg-rose-500 shadow-[0_0_10px_#ef4444]', border: 'border-rose-500/40 text-rose-400 bg-rose-950/40', short: 'ESP32 OFF' }
})
</script>

<template>
  <header class="relative shrink-0 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/25 p-2 sm:px-3 sm:py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.08)]">
    <!-- Corchetes Tácticos Angulares en Esquinas -->
    <div class="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-tl-sm" />
    <div class="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-tr-sm" />
    <div class="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none rounded-bl-sm" />
    <div class="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none rounded-br-sm" />

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 sm:gap-2 max-w-full">
      <!-- Marca e Identidad Cyber-Mecha Táctica -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center justify-center shrink-0">
            <Cpu class="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="font-scifi text-sm sm:text-base md:text-lg font-black text-white tracking-widest drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)] flex items-center gap-1">
                <span class="text-cyan-400">AIR</span> GUARDIAN
              </h1>
              <span class="px-1.5 py-0.2 rounded bg-cyan-950/70 border border-cyan-500/40 text-[8.5px] font-mono font-bold text-cyan-300 tracking-wider hidden sm:inline">
                CYBER-MECHA v2.0
              </span>
            </div>
            <div class="text-[8px] sm:text-[8.5px] font-mono text-slate-400 tracking-wider flex items-center gap-1 mt-0.5 leading-none">
              <span>COMMAND HUD</span><span class="text-cyan-500">•</span><span class="text-cyan-300/80">PREDICTIVE AIR TELEMETRY</span>
            </div>
          </div>
        </div>

        <!-- Reloj Móvil / Badge (<1024px) -->
        <div class="flex lg:hidden items-center gap-1.5 font-mono">
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-[8px] text-cyan-400 shrink-0">
            <Clock class="w-2.5 h-2.5" /><span>{{ clockTime }}</span>
          </div>
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[7.5px] border shrink-0" :class="statusBadge.border">
            <span class="w-1.5 h-1.5 rounded-full" :class="statusBadge.dot" />
            <span class="font-bold">{{ statusBadge.short }}</span>
          </div>
        </div>
      </div>

      <!-- Consola de Control de Mando Aeroespacial -->
      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-1 sm:gap-1.5 pt-1 lg:pt-0 border-t border-cyan-500/15 lg:border-t-0 font-mono">
        <!-- Reloj Desktop -->
        <div class="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-[9.5px] text-cyan-300 shadow-inner">
          <Clock class="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span class="tracking-widest font-bold">{{ clockTime }}</span>
          <span class="text-[7.5px] text-slate-500 ml-0.5">T-SYNC</span>
        </div>

        <!-- Selector Dual: Conmutador Aeroespacial -->
        <div class="flex items-center bg-slate-900/90 border border-cyan-500/40 rounded-lg p-0.5 text-[8.5px] sm:text-[9px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] shrink-0">
          <button
            type="button"
            @click="emit('setOperationMode', 'LOCAL')"
            class="min-h-[28px] sm:min-h-0 px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            :class="operationMode === 'LOCAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-slate-400 hover:text-slate-200'"
            title="Telemetría simulada local"
          >
            <Zap class="w-2.5 h-2.5" /><span>LOCAL</span>
          </button>
          <button
            type="button"
            @click="emit('setOperationMode', 'LIVE')"
            class="min-h-[28px] sm:min-h-0 px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            :class="operationMode === 'LIVE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-slate-200'"
            title="Telemetría en tiempo real con ESP32"
          >
            <Radio class="w-2.5 h-2.5" /><span>EN VIVO</span>
          </button>
        </div>

        <!-- Badge Desktop -->
        <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] border transition-all duration-300" :class="statusBadge.border">
          <span class="w-1.5 h-1.5 rounded-full" :class="statusBadge.dot" />
          <span class="font-bold tracking-wide">{{ statusBadge.label }}</span>
        </div>

        <!-- Botones de Acción Rápida con Glassmorphism -->
        <div class="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[10.5px]">
          <button type="button" @click="emit('openDigitalTwin')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 font-bold transition flex items-center gap-1 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95 shrink-0" title="Gemelo Digital 3D interactivo">
            <Box class="w-3 h-3 text-cyan-400 shrink-0" /><span>Gemelo 3D</span>
          </button>
          <button type="button" @click="emit('openAcademic')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-bold transition flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer active:scale-95 shrink-0" title="Auditorio: EDO y Métodos Numéricos">
            <GraduationCap class="w-3 h-3 text-purple-400 shrink-0" /><span>Cátedra EDO</span>
          </button>
          <button type="button" @click="emit('openUsb')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 font-bold transition flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer active:scale-95 shrink-0" title="Conexión Web Serial USB">
            <Usb class="w-3 h-3 text-cyan-400 shrink-0" /><span>USB ESP32</span>
          </button>
          <button type="button" @click="emit('openDataLake')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold transition flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer active:scale-95 shrink-0" title="Exportar datos CSV/JSON (Data Lake Bronze/Silver/Gold)">
            <Database class="w-3 h-3 text-amber-400 shrink-0" /><span>Data Lake</span>
          </button>
          <button type="button" @click="emit('openSensors')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 hover:border-blue-400 text-blue-200 font-bold transition flex items-center gap-1 shadow-[0_0_12px_rgba(59,130,246,0.2)] cursor-pointer active:scale-95 shrink-0" title="Telemetría de sensores individuales">
            <Activity class="w-3 h-3 text-blue-400 animate-pulse shrink-0" /><span>Sensores</span>
          </button>
          <button type="button" @click="emit('openMarkLocation')" class="min-h-[28px] sm:min-h-0 px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-200 font-bold transition flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer active:scale-95 shrink-0" title="Registrar nuevo punto GPS">
            <MapPin class="w-3 h-3 text-emerald-400 shrink-0" /><span>Marcar Punto</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>