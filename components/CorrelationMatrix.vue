<script setup lang="ts">
import { ref } from 'vue'
import { Activity, Info } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

interface MatrixCell {
  var1: string
  var2: string
  label1: string
  label2: string
  r: number
  insight: string
}

const vars = [
  { key: 'PPM', label: 'CO2eq' },
  { key: 'CO', label: 'Monóxido' },
  { key: 'TEMP', label: 'Temp' },
  { key: 'HUM', label: 'Humedad' },
  { key: 'DELTA', label: 'Delta PPM' }
]

const matrixValues: number[][] = [
  [1.00,  0.78,  0.32, -0.41,  0.65],
  [0.78,  1.00,  0.28, -0.34,  0.59],
  [0.32,  0.28,  1.00, -0.68,  0.19],
  [-0.41, -0.34, -0.68,  1.00, -0.27],
  [0.65,  0.59,  0.19, -0.27,  1.00]
]

const insights: Record<string, string> = {
  'PPM-CO': 'Fuerte relación directa (+0.78): La combustión o mala ventilación eleva ambos contaminantes.',
  'PPM-TEMP': 'Moderada (+0.32): Temperaturas altas aceleran la liberación de VOCs.',
  'PPM-HUM': 'Inversa (-0.41): El aire seco favorece la suspensión de micro-partículas gaseosas.',
  'PPM-DELTA': 'Fuerte impulso (+0.65): Un delta alto predice saturación inmediata en el recinto.',
  'TEMP-HUM': 'Fuerte correlación psicrométrica inversa (-0.68) entre calor y humedad relativa.'
}

const activeCell = ref<MatrixCell>({
  var1: 'PPM', var2: 'CO', label1: 'CO2eq (PPM)', label2: 'Monóxido (PPM)', r: 0.78,
  insight: insights['PPM-CO']
})

function selectCell(i: number, j: number) {
  const v1 = vars[i], v2 = vars[j]
  const r = matrixValues[i][j]
  const key1 = `${v1.key}-${v2.key}`, key2 = `${v2.key}-${v1.key}`
  const note = i === j ? 'Auto-correlación perfecta de identidad (r = 1.00).' : (insights[key1] || insights[key2] || `Correlación de Pearson r = ${r > 0 ? '+' : ''}${r.toFixed(2)}.`)
  activeCell.value = { var1: v1.key, var2: v2.key, label1: v1.label, label2: v2.label, r, insight: note }
}

function getCellBg(r: number, isDiag: boolean) {
  if (isDiag) return props.theme === 'white-lab' ? 'bg-slate-200 text-slate-800 border-slate-300 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'
  if (r >= 0.7) return props.theme === 'white-lab' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40 font-bold'
  if (r >= 0.3) return props.theme === 'white-lab' ? 'bg-teal-50 text-teal-800 border-teal-200 font-medium' : 'bg-teal-500/20 text-teal-300 border-teal-500/30 font-medium'
  if (r > -0.3) return props.theme === 'white-lab' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-neutral-900/60 text-neutral-400 border-neutral-800'
  if (r > -0.7) return props.theme === 'white-lab' ? 'bg-amber-50 text-amber-800 border-amber-200 font-medium' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium'
  return props.theme === 'white-lab' ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold' : 'bg-rose-500/30 text-rose-300 border-rose-500/40 font-bold'
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
        <div class="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
          <Activity class="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 class="text-xs font-mono font-bold uppercase tracking-wider" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">Matriz de Correlación Pearson</h3>
          <p class="text-[10px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">Coeficientes bivariados entre sensores</p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-[9px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
        <span class="w-2 h-2 rounded-full bg-rose-500"></span> -1.0
        <span class="w-6 h-1 bg-gradient-to-r from-rose-500 via-slate-400 to-emerald-500 mx-1 rounded"></span>
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> +1.0
      </div>
    </div>

    <!-- Heatmap Grid -->
    <div class="overflow-x-auto pb-1">
      <div class="min-w-[280px]">
        <div class="grid grid-cols-6 gap-1 text-center text-xs font-mono">
          <div class="p-0.5"></div>
          <div v-for="v in vars" :key="v.key" class="p-0.5 text-[9px] font-bold uppercase truncate" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">{{ v.key }}</div>

          <template v-for="(rowVar, i) in vars" :key="rowVar.key">
            <div class="flex items-center justify-end pr-1.5 text-[9px] font-bold uppercase truncate" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">{{ rowVar.key }}</div>
            <button
              v-for="(colVar, j) in vars"
              :key="colVar.key"
              @click="selectCell(i, j)"
              class="h-7 rounded border text-[10px] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              :class="[getCellBg(matrixValues[i][j], i === j), activeCell.var1 === rowVar.key && activeCell.var2 === colVar.key ? 'ring-2 ring-teal-500 ring-offset-1' : '']"
            >
              {{ matrixValues[i][j] > 0 && i !== j ? '+' : '' }}{{ matrixValues[i][j].toFixed(2) }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Panel de Interpretación Interactiva -->
    <div class="border rounded-lg p-2.5 flex items-start gap-2" :class="theme === 'white-lab' ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/80 border-slate-800'">
      <Info class="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
      <div class="text-[10px] font-mono leading-relaxed">
        <div class="font-bold flex items-center gap-2" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-slate-200'">
          <span>{{ activeCell.var1 }} ↔ {{ activeCell.var2 }}</span>
          <span class="px-1.5 py-0.2 rounded text-[9px]" :class="activeCell.r > 0 ? (theme === 'white-lab' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300') : (theme === 'white-lab' ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-300')">
            r = {{ activeCell.r > 0 ? '+' : '' }}{{ activeCell.r.toFixed(2) }}
          </span>
        </div>
        <p class="mt-0.5" :class="theme === 'white-lab' ? 'text-slate-600' : 'text-slate-400'">{{ activeCell.insight }}</p>
      </div>
    </div>
  </div>
</template>
