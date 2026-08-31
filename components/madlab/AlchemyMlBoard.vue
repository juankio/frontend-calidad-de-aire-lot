<script setup lang="ts">
import { ref } from 'vue'
import { BrainCircuit, FileSpreadsheet, FileCode } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import MadLabContainer from './MadLabContainer.vue'
import type { SessionData, TelemetryData } from '~/composables/useAirGuardian'

const props = defineProps<{ sessions?: SessionData[]; telemetry?: TelemetryData }>()
const downloading = ref<string | null>(null)

const showMatrix = ref(false)
const vars = ['CO2', 'CO', 'TEMP', 'HUM']
const matrix = [
  [1.00, 0.78, 0.32, -0.41],
  [0.78, 1.00, 0.28, -0.34],
  [0.32, 0.28, 1.00, -0.68],
  [-0.41, -0.34, -0.68, 1.00]
]
const activeInsight = ref('CO2 ↔ CO (+0.78): Más humo o combustión eleva ambos gases.')

function selectCell(i: number, j: number) {
  const notes: Record<string, string> = {
    '0-1': 'CO2 ↔ CO (+0.78): Fuerte relación por humo o falta de aire fresco.',
    '0-2': 'CO2 ↔ TEMP (+0.32): El calor en espacios cerrados acumula gas.',
    '0-3': 'CO2 ↔ HUM (-0.41): El aire seco retiene partículas con facilidad.',
    '2-3': 'TEMP ↔ HUM (-0.68): A mayor calor ambiente, menor humedad relativa.'
  }
  const key = `${Math.min(i, j)}-${Math.max(i, j)}`
  activeInsight.value = i === j ? `${vars[i]} consigo mismo (100% igual)` : (notes[key] || `Relación r=${matrix[i][j] > 0 ? '+' : ''}${matrix[i][j]}`)
}

function download(layer: 'bronze' | 'silver' | 'gold', fmt: 'csv' | 'json') {
  downloading.value = `${layer}-${fmt}`
  const data = layer === 'gold' 
    ? (props.sessions || [{ id: 'ses-1', name: 'Casa', lat: 4.14, lng: -73.62, avg_ppm: 430 }])
    : Array.from({ length: 15 }, (_, i) => ({ timestamp: Date.now() - i * 4000, ppm: 410 + i * 5, nivel: layer }))
  const blob = new Blob([fmt === 'csv' ? Object.keys(data[0]).join(',') + '\n' + data.map(r => Object.values(r).join(',')).join('\n') : JSON.stringify(data, null, 2)], { type: fmt === 'csv' ? 'text/csv' : 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = `registros_${layer}_${Date.now()}.${fmt}`; a.click(); URL.revokeObjectURL(a.href)
  setTimeout(() => { downloading.value = null }, 350)
}
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col overflow-y-auto gap-2.5">

    <!-- Cabecera -->
    <div class="flex items-center justify-between pb-1.5 border-b border-[#854d0e]/40">
      <div class="flex items-center gap-1.5">
        <BrainCircuit class="w-3.5 h-3.5 text-amber-400" />
        <span class="text-[11px] font-journal font-bold tracking-wider text-[#fbbf24]">🧪 Cerebro de IA & Descarga de Datos</span>
      </div>
      <span class="text-[8.5px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/50 text-amber-300 font-bold">MODELO v1.4</span>
    </div>

    <!-- 1. Tres Tubos Nixie de Precisión de IA -->
    <div class="grid grid-cols-3 gap-2 shrink-0">
      <div v-for="(nixie, idx) in [{ l: 'PRECISIÓN R²', val: '94.2%', sub: 'Acierto del Modelo' }, { l: 'DESVIACIÓN', val: '±18', sub: 'Margen de Error' }, { l: 'TIEMPO', val: '15m', sub: 'Anticipación' }]" :key="idx"
        class="flex flex-col items-center p-1.5 rounded-xl bg-gradient-to-b from-[#1a120b] to-[#080503] border border-[#854d0e]/60 shadow-inner relative">
        <div class="relative w-full h-12 rounded-t-lg bg-black/80 border border-amber-500/20 flex flex-col items-center justify-center overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:4px_4px] opacity-15" />
          <div class="absolute top-0 left-1 w-1.5 h-8 bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
          <span class="text-base sm:text-lg font-mono font-black tracking-widest text-amber-400 drop-shadow-[0_0_8px_#ea580c]">{{ nixie.val }}</span>
        </div>
        <div class="w-full mt-1 pt-1 border-t border-[#854d0e]/40 text-center">
          <div class="text-[8.5px] font-journal font-bold text-[#fbbf24]">{{ nixie.l }}</div>
          <div class="text-[7.5px] font-journal text-stone-400">{{ nixie.sub }}</div>
        </div>
      </div>
    </div>

    <!-- 2. Matriz de Relación entre Variables -->
    <div class="p-2 rounded-xl bg-[#090604] border border-[#854d0e]/40 flex flex-col gap-1.5 flex-1 min-h-[140px]">
      <div class="flex items-center justify-between text-[8.5px] text-[#fbbf24] font-journal font-bold cursor-pointer" @click="showMatrix = !showMatrix">
        <span>RELACIÓN ENTRE GASES & TEMPERATURA</span>
        <span class="text-[7.5px] font-mono text-stone-400">{{ showMatrix ? 'Ocultar' : 'Ver Análisis Avanzado' }}</span>
      </div>
      
      <template v-if="showMatrix">
        <div class="grid grid-cols-5 gap-1 text-center text-[8.5px] font-mono mt-1 flex-1">
          <div class="text-[7.5px] text-stone-500 font-bold" />
          <div v-for="v in vars" :key="v" class="text-[7.5px] text-[#fbbf24] font-bold">{{ v }}</div>
          <template v-for="(row, i) in vars" :key="row">
            <div class="text-[7.5px] text-[#fbbf24] font-bold flex items-center justify-end pr-1">{{ row }}</div>
            <button v-for="(col, j) in vars" :key="col" @click="selectCell(i, j)"
              class="py-0.5 rounded border text-[8px] transition cursor-pointer hover:scale-105 active:scale-95"
              :class="i === j ? 'bg-stone-800 text-stone-300 border-stone-700' : matrix[i][j] > 0.5 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60' : matrix[i][j] < -0.3 ? 'bg-rose-950/80 text-rose-300 border-rose-600/60' : 'bg-stone-900 text-stone-400 border-stone-800'">
              {{ matrix[i][j] > 0 && i !== j ? '+' : '' }}{{ matrix[i][j].toFixed(2) }}
            </button>
          </template>
        </div>
        <div class="text-[8.5px] font-journal px-2 py-1 rounded bg-[#140e08] border border-[#854d0e]/30 text-amber-200 truncate">
          {{ activeInsight }}
        </div>
      </template>
      <div v-else class="text-[8.5px] font-journal px-2 py-1.5 rounded bg-[#140e08] border border-[#854d0e]/30 text-amber-200/80 text-center">
        ⚡ Sistema Operativo. Variables estables. Correlación principal: CO2 y CO.
      </div>
    </div>

    <!-- 3. Descargar Registros (Excel CSV / JSON) -->
    <div class="p-2 rounded-xl bg-[#0a0705] border border-[#854d0e]/40 shrink-0">
      <div class="text-[9px] font-journal font-bold text-[#fbbf24] mb-1.5 flex items-center justify-between">
        <span>Descargar Registros (Excel CSV / JSON)</span>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div v-for="vial in [{ id: 'bronze' as const, name: 'Lecturas Crudas', sub: 'Datos en Bruto', color: 'from-amber-700 to-amber-900', glow: 'text-amber-400' }, { id: 'silver' as const, name: 'Filtrados', sub: 'Sin Ruido', color: 'from-cyan-600 to-blue-900', glow: 'text-cyan-400' }, { id: 'gold' as const, name: 'Resumen Lugares', sub: 'Promedios', color: 'from-yellow-400 to-amber-600', glow: 'text-yellow-300' }]" :key="vial.id"
          class="flex flex-col items-center p-1.5 rounded-lg bg-black/50 border border-[#854d0e]/40">
          <span class="text-[8px] font-journal font-bold truncate" :class="vial.glow">{{ vial.name }}</span>
          <span class="text-[6.5px] font-journal text-stone-400 mb-1">{{ vial.sub }}</span>
          <div class="flex gap-1 w-full">
            <button @click="download(vial.id, 'csv')" :disabled="downloading === `${vial.id}-csv`"
              class="flex-1 py-1.5 rounded bg-[#1c150c] hover:bg-[#2b1d10] border border-[#854d0e]/60 hover:border-[#fbbf24] text-[8.5px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 cursor-pointer transition shadow hover:shadow-[0_0_8px_rgba(245,158,11,0.2)] active:scale-95">
              <FileSpreadsheet class="w-2 h-2 text-emerald-400" /> CSV
            </button>
            <button @click="download(vial.id, 'json')" :disabled="downloading === `${vial.id}-json`"
              class="flex-1 py-1.5 rounded bg-[#081519] hover:bg-[#0b1e24] border border-cyan-800/60 hover:border-cyan-400 text-[8.5px] font-mono font-bold text-cyan-500 hover:text-cyan-300 flex items-center justify-center gap-1 cursor-pointer transition shadow hover:shadow-[0_0_8px_rgba(6,182,212,0.2)] active:scale-95">
              <FileCode class="w-2 h-2 text-cyan-400" /> JSON
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>