<script setup lang="ts">
import type { SessionData, TelemetryData, HistoryPoint } from '~/composables/useAirGuardian'
import ModelAccuracyCard from '../ModelAccuracyCard.vue'
import CorrelationMatrix from '../CorrelationMatrix.vue'
import DataLakeExporter from '../DataLakeExporter.vue'

withDefaults(defineProps<{
  telemetry?: TelemetryData
  history?: HistoryPoint[]
  sessions?: SessionData[]
  selectedSessionId?: string | null
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})
</script>

<template>
  <div class="space-y-3.5 w-full select-none">
    <!-- Placa Metálica Remachada Bandeja II -->
    <div 
      class="relative px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 shadow-md transition-colors"
      :class="theme === 'white-lab' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200 border-slate-300' : 'bg-gradient-to-r from-[#171c26] via-[#10141e] to-[#171c26] border-slate-700/80'"
    >
      <div class="pl-1">
        <span class="font-mono text-xs font-black tracking-widest uppercase drop-shadow" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-slate-100'">
          BANDEJA II • LABORATORIO DATA SCIENCE & MODELOS ML
        </span>
        <span class="text-[9px] font-mono text-sky-500 block tracking-wider font-semibold">
          PIPELINE DE REGRESIÓN • INFERENCIA ESP32-S3 & LAKEHOUSE MEDALLION
        </span>
      </div>

      <div class="flex items-center gap-1.5 p-1 rounded-lg border shadow-inner" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950/90 border-slate-700/80'">
        <span class="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border" :class="theme === 'white-lab' ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-sky-950/80 border-sky-700/60 text-sky-300'">
          ENGINE: EXP-DECAY v1.4
        </span>
        <span class="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border" :class="theme === 'white-lab' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'">
          R² = 0.942
        </span>
      </div>
    </div>

    <!-- Grid de Modelos & Correlación -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
      <div class="lg:col-span-6">
        <ModelAccuracyCard :theme="theme" />
      </div>
      <div class="lg:col-span-6">
        <CorrelationMatrix :theme="theme" />
      </div>
    </div>

    <!-- Centro de Exportación Data Lakehouse -->
    <div>
      <DataLakeExporter :sessions="sessions" :telemetry="telemetry" :theme="theme" />
    </div>
  </div>
</template>
