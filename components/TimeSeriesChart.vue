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
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

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

const props = withDefaults(defineProps<{
  history: Array<{
    timestamp: number
    ppm: number
    predicted_ppm_15m: number
  }>
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
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
        borderColor: '#10b981',
        backgroundColor: props.theme === 'white-lab' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2
      },
      {
        label: 'Proyección (+15m)',
        data: props.history.map(item => item.predicted_ppm_15m),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 1.5,
        tension: 0.3,
        fill: false,
        pointRadius: 0
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: props.theme === 'white-lab' ? '#475569' : '#94a3b8',
        font: { family: 'JetBrains Mono', size: 10 }
      }
    },
    tooltip: {
      backgroundColor: props.theme === 'white-lab' ? '#ffffff' : '#11131a',
      borderColor: props.theme === 'white-lab' ? '#cbd5e1' : '#2d3345',
      borderWidth: 1,
      titleColor: props.theme === 'white-lab' ? '#0f172a' : '#f8fafc',
      bodyColor: props.theme === 'white-lab' ? '#334155' : '#e2e8f0',
      titleFont: { family: 'JetBrains Mono' },
      bodyFont: { family: 'JetBrains Mono' }
    }
  },
  scales: {
    x: {
      grid: { color: props.theme === 'white-lab' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)' },
      ticks: { color: props.theme === 'white-lab' ? '#64748b' : '#64748b', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 6 }
    },
    y: {
      grid: { color: props.theme === 'white-lab' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)' },
      ticks: { color: props.theme === 'white-lab' ? '#64748b' : '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
    }
  }
}))
</script>

<template>
  <div 
    class="w-full h-56 sm:h-64 rounded-xl p-3.5 border transition-colors duration-300 shadow-md flex flex-col justify-between"
    :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0e1118] border-slate-800 text-slate-100'"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2" :class="theme === 'white-lab' ? 'text-slate-800' : 'text-slate-200'">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        Curva Temporal & Cono Predictivo (15m)
      </h3>
      <span class="text-[9px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">{{ history.length }} muestras</span>
    </div>
    <div class="w-full h-[calc(100%-1.8rem)]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
