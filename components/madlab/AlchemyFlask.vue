<script setup lang="ts">
import { computed } from 'vue'
import { Wind, Thermometer, ShieldCheck, AlertTriangle } from 'lucide-vue-next'
import MadLabContainer from './MadLabContainer.vue'

const props = withDefaults(defineProps<{
  ppm?: number
  label?: string
  temperature?: number
}>(), {
  ppm: 450,
  label: 'Matriz de Aire Multi-Gas',
  temperature: 24.2
})

const hudState = computed(() => {
  if (props.ppm > 1200) {
    return {
      name: 'CRÍTICO • TOXICIDAD',
      primary: '#ef4444',
      badge: 'border-rose-500/80 text-rose-400 bg-rose-950/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
      label: 'ALERTA ROJA'
    }
  }
  if (props.ppm >= 700) {
    return {
      name: 'ALERTA • SATURACIÓN',
      primary: '#f59e0b',
      badge: 'border-amber-500/80 text-amber-300 bg-amber-950/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
      label: 'PRECAUCIÓN'
    }
  }
  return {
    name: 'ÓPTIMO • AIRE LIMPIO',
    primary: '#06b6d4',
    badge: 'border-cyan-500/70 text-cyan-300 bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
    label: 'NORMAL'
  }
})

// Cálculo de arco circular vectorial (0% a 100%)
const fillPercentage = computed(() => Math.min(100, Math.max(5, (props.ppm / 2000) * 100)))
const strokeDashoffset = computed(() => {
  const circumference = 2 * Math.PI * 45 // Radio 45 = 282.74
  return circumference - (fillPercentage.value / 100) * (circumference * 0.75)
})

const airPurityScore = computed(() => {
  return Math.max(8, Math.min(99, Math.round(100 - (props.ppm / 2200) * 85)))
})
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col justify-between select-none">
      <!-- Encabezado Táctico -->
      <div class="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-2">
        <div class="flex items-center gap-1.5">
          <Wind class="w-3.5 h-3.5 text-cyan-400" />
          <span class="text-[11px] font-mono font-bold tracking-wider text-slate-100 uppercase">{{ label }}</span>
        </div>
        <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-bold border transition-all duration-300" :class="hudState.badge">
          {{ hudState.name }}
        </span>
      </div>

      <!-- HUD Gauge Circular Vectorial de Concentración y Calidad -->
      <div class="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-[#050811] border border-cyan-500/20">
        <!-- Retícula de fondo y marcas angulares mecha -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />

        <svg class="w-full h-full" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gas-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#06b6d4" />
              <stop offset="60%" stop-color="#10b981" />
              <stop offset="85%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#ef4444" />
            </linearGradient>
            <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Anillo de escala graduado 270 grados -->
          <circle
            cx="100"
            cy="70"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            stroke-width="7"
            stroke-dasharray="212"
            stroke-dashoffset="0"
            transform="rotate(135 100 70)"
            stroke-linecap="round"
          />

          <!-- Arco LED Luminoso Dinámico de Concentración -->
          <circle
            cx="100"
            cy="70"
            r="45"
            fill="none"
            :stroke="hudState.primary"
            stroke-width="7"
            stroke-dasharray="282.74"
            :stroke-dashoffset="strokeDashoffset"
            transform="rotate(135 100 70)"
            stroke-linecap="round"
            filter="url(#arc-glow)"
            class="transition-all duration-700 ease-out"
          />

          <!-- Ticks angulares de graduación -->
          <circle
            cx="100"
            cy="70"
            r="54"
            fill="none"
            stroke="rgba(6, 182, 212, 0.25)"
            stroke-width="1.2"
            stroke-dasharray="2, 6"
          />

          <!-- Centro Digital: Lectura Numérica en font-mono -->
          <text x="100" y="66" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="19" font-weight="800" text-anchor="middle">
            {{ Math.round(ppm) }}
          </text>
          <text x="100" y="80" :fill="hudState.primary" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700" text-anchor="middle" letter-spacing="1">
            PPM IAQ
          </text>
          <text x="100" y="93" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="600" text-anchor="middle">
            PUREZA {{ airPurityScore }}%
          </text>
        </svg>

        <!-- Indicador de cuadrante táctico -->
        <div class="absolute bottom-2 inset-x-0 flex justify-between px-3 text-[7.5px] font-mono text-slate-500">
          <span>0 PPM</span>
          <span class="text-cyan-400/80">MATRIZ AMBIENTAL</span>
          <span>2000 PPM</span>
        </div>
      </div>

      <!-- Lecturas Tácticas Inferiores -->
      <div class="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-cyan-500/20 text-center font-mono shrink-0">
        <div class="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20">
          <div class="text-[8px] text-cyan-400 font-bold uppercase">Lectura</div>
          <div class="text-[11.5px] font-black text-slate-100 mt-0.5">{{ Math.round(ppm) }} <span class="text-[8px] text-slate-400">PPM</span></div>
        </div>
        <div class="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20">
          <div class="flex items-center justify-center gap-1 text-[8px] text-amber-400 font-bold uppercase">
            <Thermometer class="w-2.5 h-2.5" />
            <span>Térmico</span>
          </div>
          <div class="text-[11.5px] font-black text-slate-100 mt-0.5">{{ temperature.toFixed(1) }}°C</div>
        </div>
        <div class="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20">
          <div class="text-[8px] text-emerald-400 font-bold uppercase">Índice IAQ</div>
          <div class="text-[11.5px] font-black text-emerald-300 mt-0.5">{{ airPurityScore }}/100</div>
        </div>
      </div>
    </div>
  </MadLabContainer>
</template>
