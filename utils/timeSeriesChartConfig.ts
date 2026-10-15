import type { ChartOptions } from 'chart.js'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

export interface HistoryPoint {
  timestamp: number
  ppm: number
  predicted_ppm_15m: number
}

export function getTimeSeriesDeltaTrend(d: number) {
  if (d > 0) return { icon: TrendingUp, color: 'text-amber-400', label: `+${d}` }
  if (d < 0) return { icon: TrendingDown, color: 'text-emerald-400', label: `${d}` }
  return { icon: Minus, color: 'text-slate-400', label: '0' }
}

export function getTimeSeriesPredictedStatus(p: number) {
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
}

export function buildTimeSeriesChartData(history: HistoryPoint[]) {
  const labels = history.map(item => {
    const d = new Date(item.timestamp)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  })

  return {
    labels,
    datasets: [
      {
        label: 'PPM Medido (MQ-135)',
        data: history.map(item => item.ppm),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: history.length > 30 ? 1 : 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#06b6d4'
      },
      {
        label: 'Proyección 15m',
        data: history.map(item => item.predicted_ppm_15m),
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
}

export function createTimeSeriesChartOptions(): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: 'index', intersect: false },
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
        grid: { color: 'rgba(6, 182, 212, 0.08)', drawTicks: false },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 6, padding: 4 },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(6, 182, 212, 0.08)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 }, padding: 4 },
        border: { display: false }
      }
    }
  }
}
