<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface HistoryPoint {
  timestamp: number
  ppm: number
  predicted_ppm_15m: number
}

const props = withDefaults(defineProps<{
  history: HistoryPoint[]
  currentPpm?: number
  deltaPpm?: number
  predictedPpm?: number
  theme?: 'graphite' | 'white-lab'
}>(), {
  history: () => [],
  currentPpm: undefined,
  deltaPpm: undefined,
  predictedPpm: undefined,
  theme: 'graphite'
})

const safeCurrentPpm = computed(() => {
  if (typeof props.currentPpm === 'number' && !isNaN(props.currentPpm)) {
    return Math.round(props.currentPpm)
  }
  const last = props.history[props.history.length - 1]
  return last ? Math.round(last.ppm) : 400
})

const safeDeltaPpm = computed(() => {
  if (typeof props.deltaPpm === 'number' && !isNaN(props.deltaPpm)) {
    return Math.round(props.deltaPpm)
  }
  return 0
})

const safePredictedPpm = computed(() => {
  if (typeof props.predictedPpm === 'number' && !isNaN(props.predictedPpm)) {
    return Math.round(props.predictedPpm)
  }
  const last = props.history[props.history.length - 1]
  return last ? Math.round(last.predicted_ppm_15m) : 400
})

const deltaTrend = computed(() => {
  const d = safeDeltaPpm.value
  if (d > 0) return { icon: TrendingUp, color: 'text-amber-400', label: `+${d}` }
  if (d < 0) return { icon: TrendingDown, color: 'text-emerald-400', label: `${d}` }
  return { icon: Minus, color: 'text-slate-400', label: '0' }
})

const predictedStatus = computed(() => {
  const p = safePredictedPpm.value
  if (p < 700) {
    return {
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      label: 'ÓPTIMO'
    }
  }
  if (p <= 1000) {
    return {
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      label: 'MODERADO'
    }
  }
  return {
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
    label: 'CRÍTICO'
  }
})

const chartData = computed(() => {
  const labels = props.history.map(item => {
    const d = new Date(item.timestamp)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  })

  return {
    labels,
    datasets: [
      {
        label: 'PPM Medido (MQ-135)',
        data: props.history.map(item => item.ppm),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: props.history.length > 30 ? 1 : 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#06b6d4'
      },
      {
        label: 'Proyección 15m',
        data: props.history.map(item => item.predicted_ppm_15m),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 1.5,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#f59e0b'
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300
  },
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#94a3b8',
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { family: 'JetBrains Mono', size: 9.5 }
      }
    },
    tooltip: {
      backgroundColor: '#030712',
      borderColor: 'rgba(6, 182, 212, 0.5)',
      borderWidth: 1,
      titleColor: '#22d3ee',
      bodyColor: '#f1f5f9',
      padding: 8,
      cornerRadius: 8,
      titleFont: { family: 'JetBrains Mono', size: 10, weight: 'bold' },
      bodyFont: { family: 'JetBrains Mono', size: 9.5 },
      boxPadding: 4
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(6, 182, 212, 0.08)',
        drawTicks: false
      },
      ticks: {
        color: '#64748b',
        font: { family: 'JetBrains Mono', size: 9 },
        maxTicksLimit: 6,
        padding: 4
      },
      border: {
        display: false
      }
    },
    y: {
      grid: {
        color: 'rgba(6, 182, 212, 0.08)'
      },
      ticks: {
        color: '#64748b',
        font: { family: 'JetBrains Mono', size: 9 },
        padding: 4
      },
      border: {
        display: false
      }
    }
  }
}))
</script>

<template>
  <div class="relative bg-slate-900/90 border border-cyan-500/25 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden select-none">
    <!-- Esquinas Tácticas SVG (Corner Brackets) -->
    <svg class="absolute top-1.5 left-1.5 w-3 h-3 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
      <path d="M1 13V3C1 1.89543 1.89543 1 3 1H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <svg class="absolute top-1.5 right-1.5 w-3 h-3 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
      <path d="M13 13V3C13 1.89543 12.1046 1 11 1H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <svg class="absolute bottom-1.5 left-1.5 w-3 h-3 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
      <path d="M1 1V11C1 12.1046 1.89543 13 3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <svg class="absolute bottom-1.5 right-1.5 w-3 h-3 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
      <path d="M13 1V11C13 12.1046 12.1046 13 11 13H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Cabecera Táctica Idéntica a las Tarjetas de Sensores -->
    <div class="flex items-start justify-between gap-2 pt-0.5 border-b border-cyan-500/20 pb-1.5 shrink-0">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="w-6 h-6 rounded-lg bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
          <Activity class="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <h4 class="font-scifi font-bold text-xs sm:text-[13px] text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>SERIE TEMPORAL & PROYECCIÓN</span>
          </h4>
          <p class="text-[8px] sm:text-[8.5px] font-mono text-slate-400">Histórico Continuo e Inercia Cinética (MQ-135 / eCO₂)</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border bg-cyan-950/60 border-cyan-500/40 text-cyan-300">
          CONO 15m
        </span>
      </div>
    </div>

    <!-- Sub-barra HUD de Métricas Rápidas -->
    <div class="grid grid-cols-3 gap-1.5 p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-cyan-500/20 font-mono shrink-0">
      <!-- Métrica 1: PPM Actual -->
      <div class="flex flex-col justify-between">
        <span class="text-[8px] uppercase tracking-wider text-slate-400">PPM Actual</span>
        <div class="flex items-baseline gap-1 mt-0.5">
          <span class="text-xl sm:text-2xl font-black text-cyan-300 tracking-tight leading-none">
            {{ safeCurrentPpm }}
          </span>
          <span class="text-[9.5px] font-bold text-slate-500">PPM</span>
        </div>
      </div>

      <!-- Métrica 2: Derivada Temporal -->
      <div class="flex flex-col justify-between border-x border-cyan-500/15 px-1.5">
        <span class="text-[8px] uppercase tracking-wider text-slate-400">Derivada Temporal</span>
        <div class="flex items-center gap-1 mt-0.5" :class="deltaTrend.color">
          <component :is="deltaTrend.icon" class="w-3 h-3 shrink-0" />
          <span class="text-xs sm:text-sm font-black leading-none">{{ deltaTrend.label }}</span>
          <span class="text-[7.5px] font-normal text-slate-500">PPM/m</span>
        </div>
      </div>

      <!-- Métrica 3: Proyección a 15m -->
      <div class="flex flex-col justify-between">
        <div class="flex items-center justify-between gap-1">
          <span class="text-[8px] uppercase tracking-wider text-slate-400">Proy. +15m</span>
          <span class="text-[7.5px] font-bold px-1 py-0.2 rounded-full border leading-tight" :class="predictedStatus.badgeBg">
            {{ predictedStatus.label }}
          </span>
        </div>
        <div class="flex items-baseline gap-1 mt-0.5">
          <span class="text-lg sm:text-xl font-black tracking-tight leading-none" :class="predictedStatus.color">
            {{ safePredictedPpm }}
          </span>
          <span class="text-[9.5px] font-bold text-slate-500">PPM</span>
        </div>
      </div>
    </div>

    <!-- Gráfico Chart.js Estilizado y Responsivo -->
    <div class="w-full flex-1 min-h-0 relative">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
