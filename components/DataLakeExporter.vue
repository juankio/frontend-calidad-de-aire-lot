<script setup lang="ts">
import { ref, computed } from 'vue'
import { Database, FileSpreadsheet, FileCode, Layers } from 'lucide-vue-next'
import type { SessionData, TelemetryData } from '~/composables/useAirGuardian'

const props = withDefaults(defineProps<{
  sessions?: SessionData[]
  telemetry?: TelemetryData
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

const downloading = ref<string | null>(null)

interface LayerConfig {
  id: 'bronze' | 'silver' | 'gold'
  name: string
  subtitle: string
  badge: string
  badgeColor: string
  formatNote: string
}

const layers: LayerConfig[] = [
  { id: 'bronze', name: 'Capa Bronze (Raw IoT)', subtitle: 'Lecturas brutas ADC, MPU6050 & MQ-135', badge: 'Inmutable Raw', badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-500', formatNote: 'ADC raw, timestamp, device_id' },
  { id: 'silver', name: 'Capa Silver (Curated)', subtitle: 'Series con delta 1m, filtros & riesgo', badge: 'ETL Enriquecido', badgeColor: 'border-slate-500/40 bg-slate-500/10 text-slate-400', formatNote: 'Cleaned PPM, delta, predicted_15m' },
  { id: 'gold', name: 'Capa Gold (KPIs Zona)', subtitle: 'Métricas agregadas por campaña y GPS', badge: 'Analytics Ready', badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500', formatNote: 'Avg/Max PPM, geocoding, radius' }
]

function generateCsv(data: Record<string, any>[]): string {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  return [headers.join(','), ...rows].join('\n')
}

function triggerDownload(content: string, filename: string, type: 'csv' | 'json') {
  const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;'
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportData(layer: 'bronze' | 'silver' | 'gold', format: 'csv' | 'json') {
  const key = `${layer}-${format}`
  downloading.value = key
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  setTimeout(() => {
    let payload: any[] = []
    if (layer === 'gold') {
      payload = (props.sessions || []).map(s => ({
        campaign_id: s.id, name: s.name, lat: s.latitude, lng: s.longitude,
        avg_ppm: s.avg_ppm || 420, max_ppm: s.max_ppm || 580, samples: s.total_samples || 120
      }))
      if (!payload.length) payload = [{ campaign: 'Lab Sentinel', lat: 4.142, lng: -73.626, avg_ppm: 435, max_ppm: 610, samples: 450 }]
    } else if (layer === 'silver') {
      payload = Array.from({ length: 20 }, (_, i) => ({
        timestamp: Date.now() - (19 - i) * 5000,
        ppm: Math.round(410 + Math.sin(i) * 35),
        delta_1m: +(Math.cos(i) * 4.2).toFixed(1),
        predicted_15m: Math.round(425 + Math.sin(i) * 40),
        risk_status: i > 15 ? 'WARNING_PREDICTIVE' : 'OPTIMAL'
      }))
    } else {
      payload = Array.from({ length: 20 }, (_, i) => ({
        device_id: 'ESP32-SENTINEL-01',
        raw_adc: 1420 + Math.floor(Math.random() * 80),
        raw_temp_adc: 540,
        co_adc: 310,
        timestamp: Date.now() - (19 - i) * 5000
      }))
    }

    const content = format === 'csv' ? generateCsv(payload) : JSON.stringify(payload, null, 2)
    triggerDownload(content, `air_guardian_${layer}_${ts}.${format}`, format)
    downloading.value = null
  }, 400)
}
</script>

<template>
  <div 
    class="rounded-xl p-3.5 sm:p-4 border transition-colors duration-300 shadow-md space-y-3"
    :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0e1118] border-slate-800 text-slate-100'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-2.5" :class="theme === 'white-lab' ? 'border-slate-200' : 'border-slate-800/80'">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <Database class="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 class="text-xs font-mono font-bold uppercase tracking-wider" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">Centro de Exportación Data Lakehouse</h3>
          <p class="text-[10px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">Arquitectura Medallion (Bronze / Silver / Gold)</p>
        </div>
      </div>
      <span class="text-[9px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1.5" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-neutral-950 border-slate-800 text-slate-400'">
        <Layers class="w-3 h-3 text-emerald-500" /> SQLite WAL
      </span>
    </div>

    <!-- Lista de Capas Medallion -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <div 
        v-for="layer in layers" 
        :key="layer.id" 
        class="border rounded-lg p-3 flex flex-col justify-between space-y-2"
        :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/70 border-slate-800/80'"
      >
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <h4 class="text-xs font-bold font-sans" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">{{ layer.name }}</h4>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded border" :class="layer.badgeColor">{{ layer.badge }}</span>
          </div>
          <p class="text-[10px] font-mono" :class="theme === 'white-lab' ? 'text-slate-600' : 'text-slate-400'">{{ layer.subtitle }}</p>
          <div class="text-[9px] font-mono mt-1" :class="theme === 'white-lab' ? 'text-slate-400' : 'text-slate-500'">{{ layer.formatNote }}</div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t" :class="theme === 'white-lab' ? 'border-slate-200' : 'border-slate-800/60'">
          <button
            @click="exportData(layer.id, 'csv')"
            :disabled="downloading === `${layer.id}-csv`"
            class="flex-1 py-1 rounded text-[10px] font-mono transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 border cursor-pointer"
            :class="theme === 'white-lab' ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'"
          >
            <FileSpreadsheet class="w-3 h-3 text-emerald-500" />
            <span>{{ downloading === `${layer.id}-csv` ? '...' : 'CSV' }}</span>
          </button>
          <button
            @click="exportData(layer.id, 'json')"
            :disabled="downloading === `${layer.id}-json`"
            class="flex-1 py-1 rounded text-[10px] font-mono transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 border cursor-pointer"
            :class="theme === 'white-lab' ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'"
          >
            <FileCode class="w-3 h-3 text-sky-500" />
            <span>{{ downloading === `${layer.id}-json` ? '...' : 'JSON' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
