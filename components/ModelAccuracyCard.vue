<script setup lang="ts">
import { ref, computed } from 'vue'
import { BrainCircuit, Cpu, Zap, CheckCircle2, Gauge, TrendingUp, ShieldCheck } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

interface ModelMetric {
  id: string
  name: string
  version: string
  r2: number
  rmse: number
  mae: number
  mape: number
  latencyMs: number
  confidence: number
  runtime: string
  status: 'production' | 'benchmark' | 'baseline'
}

const models = ref<ModelMetric[]>([
  { id: 'exp-decay', name: 'Regresión Exponencial', version: 'v1.4 (Edge Filtered)', r2: 0.942, rmse: 18.4, mae: 12.1, mape: 2.8, latencyMs: 0.4, confidence: 94.2, runtime: 'ESP32 / Edge', status: 'production' },
  { id: 'xgboost', name: 'XGBoost Regressor', version: 'v2.1 (Cloud Bench)', r2: 0.968, rmse: 13.7, mae: 9.4, mape: 1.9, latencyMs: 14.2, confidence: 96.8, runtime: 'Cloud Microservice', status: 'benchmark' },
  { id: 'holt-winters', name: 'Holt-Winters Triple', version: 'v0.9 (Baseline)', r2: 0.891, rmse: 27.5, mae: 19.8, mape: 4.2, latencyMs: 2.1, confidence: 89.1, runtime: 'Node.js Worker', status: 'baseline' }
])

const activeModelId = ref<string>('exp-decay')
const activeModel = computed(() => models.value.find(m => m.id === activeModelId.value) || models.value[0])
</script>

<template>
  <div 
    class="rounded-xl p-3.5 sm:p-4 border transition-colors duration-300 shadow-md space-y-3.5"
    :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0e1118] border-slate-800 text-slate-100'"
  >
    <!-- Encabezado y Selector de Modelo -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5" :class="theme === 'white-lab' ? 'border-slate-200' : 'border-slate-800/80'">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
          <BrainCircuit class="w-3.5 h-3.5" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">Validación de Modelos ML</h3>
            <span v-if="activeModel.status === 'production'" class="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-600/40 text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 class="w-2.5 h-2.5" /> Producción
            </span>
          </div>
          <p class="text-[10px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">{{ activeModel.version }} • {{ activeModel.runtime }}</p>
        </div>
      </div>

      <div class="flex items-center gap-1 p-1 rounded-lg border" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950 border-slate-800'">
        <button
          v-for="m in models"
          :key="m.id"
          @click="activeModelId = m.id"
          class="px-2 py-0.5 rounded text-[10px] font-mono transition font-medium"
          :class="activeModelId === m.id ? (theme === 'white-lab' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'bg-slate-800 text-white shadow-sm border border-slate-700') : 'text-slate-500 hover:text-slate-900'"
        >
          {{ m.name.split(' ')[0] }}
        </button>
      </div>
    </div>

    <!-- Indicador de Confianza Predictiva -->
    <div class="border rounded-lg p-2.5 space-y-1.5" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/80 border-slate-800/80'">
      <div class="flex items-center justify-between text-[11px] font-mono">
        <span class="flex items-center gap-1.5" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-400'">
          <ShieldCheck class="w-3 h-3 text-emerald-500" />
          Confianza Predictiva (t+15m)
        </span>
        <span class="font-bold text-emerald-500">{{ activeModel.confidence }}%</span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" :style="{ width: `${activeModel.confidence}%` }"></div>
      </div>
    </div>

    <!-- Grid de Métricas de Precisión (4 Cuadrantes) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="border rounded-lg p-2" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/60 border-slate-800/80'">
        <div class="text-[9px] font-mono uppercase flex items-center justify-between" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
          <span>R² Score</span>
          <TrendingUp class="w-3 h-3 text-emerald-500" />
        </div>
        <div class="text-base font-bold font-mono mt-0.5" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">{{ activeModel.r2.toFixed(3) }}</div>
        <div class="text-[9px] text-slate-500 font-mono">Bondad Ajuste</div>
      </div>

      <div class="border rounded-lg p-2" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/60 border-slate-800/80'">
        <div class="text-[9px] font-mono uppercase flex items-center justify-between" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
          <span>RMSE</span>
          <Gauge class="w-3 h-3 text-amber-500" />
        </div>
        <div class="text-base font-bold font-mono text-amber-500 mt-0.5">{{ activeModel.rmse }} <span class="text-[9px] font-normal text-slate-500">PPM</span></div>
        <div class="text-[9px] text-slate-500 font-mono">Error Cuadrático</div>
      </div>

      <div class="border rounded-lg p-2" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/60 border-slate-800/80'">
        <div class="text-[9px] font-mono uppercase flex items-center justify-between" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
          <span>MAE</span>
          <Cpu class="w-3 h-3 text-sky-500" />
        </div>
        <div class="text-base font-bold font-mono text-sky-500 mt-0.5">{{ activeModel.mae }} <span class="text-[9px] font-normal text-slate-500">PPM</span></div>
        <div class="text-[9px] text-slate-500 font-mono">Error Medio Abs.</div>
      </div>

      <div class="border rounded-lg p-2" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/60 border-slate-800/80'">
        <div class="text-[9px] font-mono uppercase flex items-center justify-between" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
          <span>Latencia</span>
          <Zap class="w-3 h-3 text-emerald-500" />
        </div>
        <div class="text-base font-bold font-mono text-emerald-500 mt-0.5">{{ activeModel.latencyMs }} <span class="text-[9px] font-normal text-slate-500">ms</span></div>
        <div class="text-[9px] text-slate-500 font-mono">Inferencia Edge</div>
      </div>
    </div>
  </div>
</template>
