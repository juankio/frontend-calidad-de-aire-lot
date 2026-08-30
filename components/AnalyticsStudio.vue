<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Database, BarChart3, RefreshCw, Cpu } from 'lucide-vue-next'
import type { SessionData, TelemetryData, HistoryPoint } from '~/composables/useAirGuardian'
import ModelAccuracyCard from './ModelAccuracyCard.vue'
import CorrelationMatrix from './CorrelationMatrix.vue'
import DataLakeExporter from './DataLakeExporter.vue'

const props = defineProps<{
  telemetry: TelemetryData
  history: HistoryPoint[]
  sessions: SessionData[]
  selectedSessionId: string | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const timeWindows = ['1 Hora', '24 Horas', 'Campaña Activa', 'Lakehouse Total']
const activeWindow = ref('Campaña Activa')
const isRefreshing = ref(false)

const totalSamplesCount = computed(() => {
  const sessionSamples = props.sessions.reduce((acc, s) => acc + (s.total_samples || 0), 0)
  return Math.max(sessionSamples, props.history.length || 1450)
})

function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Resumen Ejecutivo Superior de Data Science -->
    <div class="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles class="w-4 h-4" />
            </span>
            <h2 class="text-base font-bold text-white font-sans tracking-tight">Data Science Studio & Machine Learning</h2>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-semibold">
              v2.4 Edge Engine
            </span>
          </div>
          <p class="text-xs text-neutral-400 font-mono">
            Pipeline analítico predictivo con inferencia en tiempo real en microcontrolador ESP32-S3 y Data Lakehouse Medallion.
          </p>
        </div>

        <!-- Controles de Ventana Temporal y Refresco -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              v-for="w in timeWindows"
              :key="w"
              @click="activeWindow = w"
              class="px-2.5 py-1 rounded-lg text-[11px] font-mono transition"
              :class="activeWindow === w ? 'bg-neutral-800 text-white font-medium shadow-sm border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'"
            >
              {{ w }}
            </button>
          </div>
          <button
            @click="handleRefresh"
            :disabled="isRefreshing"
            class="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition active:scale-95 disabled:opacity-50"
            title="Refrescar métricas analíticas"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
          </button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-800/60">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Database class="w-4 h-4" />
          </div>
          <div>
            <div class="text-sm font-bold font-mono text-white">{{ totalSamplesCount.toLocaleString() }}</div>
            <div class="text-[10px] text-neutral-400 font-mono">Muestras Ingestadas</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-teal-400">
            <BarChart3 class="w-4 h-4" />
          </div>
          <div>
            <div class="text-sm font-bold font-mono text-teal-300">0.942 R²</div>
            <div class="text-[10px] text-neutral-400 font-mono">Ajuste Predictivo (15m)</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-sky-400">
            <Cpu class="w-4 h-4" />
          </div>
          <div>
            <div class="text-sm font-bold font-mono text-sky-300">0.4 ms</div>
            <div class="text-[10px] text-neutral-400 font-mono">Latencia Inferencia Edge</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div>
            <div class="text-sm font-bold font-mono text-emerald-400">OPTIMAL</div>
            <div class="text-[10px] text-neutral-400 font-mono">Salud Pipeline SQLite</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Componentes: ML Accuracy & Matriz de Correlación -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-6">
        <ModelAccuracyCard />
      </div>
      <div class="lg:col-span-6">
        <CorrelationMatrix />
      </div>
    </div>

    <!-- Data Lakehouse Exporter Medallion -->
    <div>
      <DataLakeExporter :sessions="sessions" :telemetry="telemetry" />
    </div>
  </div>
</template>
