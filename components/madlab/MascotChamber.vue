<script setup lang="ts">
import { computed } from 'vue'
import LiveMascotWidget from '../LiveMascotWidget.vue'
import CyberHexVisorFrame from '../mecha/CyberHexVisorFrame.vue'
import MechaDigitalTwin from '../mecha/MechaDigitalTwin.vue'
import { Cpu } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  viewMode?: 'FACE' | 'HUD' | '3D'
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
}>(), {
  ppm: 412,
  coPpm: 5.8,
  temperature: 23.8,
  humidity: 54,
  riskStatus: 'OPTIMAL',
  viewMode: 'FACE',
  pitch: 0,
  roll: 0
})

const energyTheme = computed(() => {
  if (props.riskStatus === 'CRITICAL') {
    return {
      primary: '#ef4444',
      secondary: '#dc2626',
      badge: 'border-red-500/80 text-red-400 bg-red-950/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      label: 'NIVEL CRÍTICO • PELIGRO',
      pulse: 'animate-ping'
    }
  }
  if (props.riskStatus === 'WARNING_PREDICTIVE') {
    return {
      primary: '#f59e0b',
      secondary: '#f97316',
      badge: 'border-amber-500/80 text-amber-300 bg-amber-950/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      label: 'ALERTA PREDICTIVA • DESVÍO',
      pulse: 'animate-pulse'
    }
  }
  if (props.riskStatus === 'RECOVERY') {
    return {
      primary: '#38bdf8',
      secondary: '#0284c7',
      badge: 'border-sky-500/80 text-sky-300 bg-sky-950/60 shadow-[0_0_12px_rgba(56,189,248,0.3)]',
      label: 'PURGA & VENTILACIÓN',
      pulse: 'animate-pulse'
    }
  }
  if (props.riskStatus === 'SLEEPING') {
    return {
      primary: '#64748b',
      secondary: '#475569',
      badge: 'border-slate-600/80 text-slate-400 bg-slate-900/60',
      label: 'STANDBY • CENTINELA',
      pulse: ''
    }
  }
  return {
    primary: '#06b6d4',
    secondary: '#10b981',
    badge: 'border-cyan-500/70 text-cyan-300 bg-cyan-950/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    label: 'CENTINELA ACTIVO • NORMAL',
    pulse: 'animate-pulse'
  }
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-center p-1 sm:p-1.5 select-none shrink-0">
    <!-- Marco del Visor Hexagonal Mecha (Cyber Accent Visor) -->
    <div class="relative w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] lg:w-[260px] lg:h-[260px] xl:w-[275px] xl:h-[275px] flex items-center justify-center transition-all duration-300">
      <!-- Marco Vectorial Táctico HUD del Visor Hexagonal -->
      <CyberHexVisorFrame
        :primary-color="energyTheme.primary"
        :secondary-color="energyTheme.secondary"
      />

      <!-- Núcleo: Widget GC9A01 Centrado 1:1 con Escala Proporcional Óptima -->
      <div class="relative z-10 scale-[0.68] sm:scale-[0.78] lg:scale-[0.84] xl:scale-90 transition-transform duration-300 flex items-center justify-center">
        <slot>
          <div
            v-if="viewMode === '3D'"
            class="w-[240px] h-[240px] rounded-full overflow-hidden bg-slate-950 border border-cyan-500/40 relative shadow-inner"
          >
            <MechaDigitalTwin
              :ppm="ppm"
              :risk-status="riskStatus"
              :pitch="pitch"
              :roll="roll"
              :ax="ax"
              :ay="ay"
              :az="az"
              :compact="true"
            />
          </div>
          <LiveMascotWidget
            v-else
            :ppm="ppm"
            :co-ppm="coPpm"
            :temperature="temperature"
            :humidity="humidity"
            :risk-status="riskStatus"
            :view-mode="viewMode"
          />
        </slot>
      </div>
    </div>

    <!-- Placa Táctica Mecha de Telemetría -->
    <div
      class="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-mono text-[9px] sm:text-[9.5px] tracking-wider transition-all duration-300 backdrop-blur-md"
      :class="energyTheme.badge"
    >
      <Cpu class="w-3 h-3 shrink-0" :class="energyTheme.primary" />
      <span class="font-extrabold uppercase">{{ energyTheme.label }}</span>
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :class="energyTheme.pulse"
        :style="{ backgroundColor: energyTheme.primary }"
      />
    </div>
  </div>
</template>