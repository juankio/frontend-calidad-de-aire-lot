<script setup lang="ts">
import { RotateCcw, Box, Compass, Layers, ShieldCheck, Activity } from 'lucide-vue-next'

const props = defineProps<{
  wireframe: boolean
  clamshellDist: number
  autoRotate: boolean
  displayPitch: string
  displayRoll: string
}>()

const emit = defineEmits<{
  (e: 'update:wireframe', val: boolean): void
  (e: 'update:clamshellDist', val: number): void
  (e: 'update:autoRotate', val: boolean): void
  (e: 'resetCamera'): void
}>()
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-cyan-500/25 bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 flex flex-col justify-between gap-3 overflow-y-auto font-mono">
    <div class="space-y-3.5">
      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <span class="text-[10px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Activity class="w-3.5 h-3.5" /> PANEL DE MANDO 3D
        </span>
        <button
          type="button"
          @click="emit('resetCamera')"
          class="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 text-[9.5px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
        >
          <RotateCcw class="w-3 h-3" /> Reset Cámara
        </button>
      </div>

      <!-- Slider Despiece Clamshell -->
      <div class="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-2.5 space-y-2">
        <div class="flex items-center justify-between text-[10.5px]">
          <span class="text-slate-300 font-bold flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5 text-cyan-400" /> Despiece Clamshell
          </span>
          <span class="text-cyan-300 font-bold">{{ clamshellDist }} mm</span>
        </div>
        <input
          :value="clamshellDist"
          @input="emit('update:clamshellDist', Number(($event.target as HTMLInputElement).value))"
          type="range"
          min="0"
          max="50"
          step="1"
          class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div class="flex justify-between text-[8px] text-slate-500 font-bold">
          <span>0mm (ENSAMBLE)</span>
          <span>50mm (EXPLOSIÓN)</span>
        </div>
      </div>

      <!-- Switches Wireframe & Auto-Giro -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="emit('update:wireframe', !wireframe)"
          class="p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition cursor-pointer active:scale-95"
          :class="wireframe ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-slate-950/80 border-cyan-500/30 text-slate-400 hover:text-slate-200'"
        >
          <Box class="w-4 h-4" />
          <span>{{ wireframe ? 'WIREFRAME' : 'SÓLIDO PBR' }}</span>
        </button>

        <button
          type="button"
          @click="emit('update:autoRotate', !autoRotate)"
          class="p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition cursor-pointer active:scale-95"
          :class="autoRotate ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-slate-950/80 border-cyan-500/30 text-slate-400 hover:text-slate-200'"
        >
          <Compass class="w-4 h-4" />
          <span>{{ autoRotate ? 'AUTO-GIRO ON' : 'AUTO-GIRO OFF' }}</span>
        </button>
      </div>

      <!-- Inclinación Inercial IMU -->
      <div class="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-2.5 space-y-1.5">
        <div class="flex items-center justify-between text-[10px] text-slate-300 font-bold">
          <span class="flex items-center gap-1.5">
            <Compass class="w-3.5 h-3.5 text-cyan-400" /> Horizonte IMU MPU-6050
          </span>
          <span class="text-[8.5px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">I2C BUS</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center text-[10px] pt-1">
          <div class="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20">
            <div class="text-[8px] text-slate-500">PITCH (CABECEO)</div>
            <div class="text-xs font-bold text-cyan-300">{{ displayPitch }}°</div>
          </div>
          <div class="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/20">
            <div class="text-[8px] text-slate-500">ROLL (ALABEO)</div>
            <div class="text-xs font-bold text-cyan-300">{{ displayRoll }}°</div>
          </div>
        </div>
      </div>

      <!-- Materiales Mil-Spec -->
      <div class="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-2.5 space-y-1.5 text-[9px] text-slate-400">
        <div class="font-bold text-slate-300 text-[10px] mb-1">Capas FDM Mil-Spec:</div>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-slate-700" /> Frente:</span>
          <span class="text-slate-200">Titanio Oscuro #0f172a</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-orange-600" /> Trasera:</span>
          <span class="text-slate-200">Naranja Óxido #c2410c</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Visor:</span>
          <span class="text-cyan-300">Emisivo Neón Reactivo</span>
        </div>
      </div>
    </div>

    <div class="pt-2 border-t border-cyan-500/20 text-center">
      <div class="text-[8.5px] text-slate-500 flex items-center justify-center gap-1">
        <ShieldCheck class="w-3 h-3 text-cyan-400" />
        <span>AIR GUARDIAN IOT • TELEMETRÍA 3D</span>
      </div>
    </div>
  </aside>
</template>
