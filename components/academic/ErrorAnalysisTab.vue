<script setup lang="ts">
import { ref } from 'vue'
import { Table, Download, Copy, CheckCircle2, Sparkles, MessageSquareQuote, FileSpreadsheet } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'
import type { AcademicStep } from '~/composables/useNumericalAcademic'

const props = defineProps<{
  steps: AcademicStep[]
  latexSnippet: string
}>()

const emit = defineEmits<{
  (e: 'exportCsv'): void
}>()

const copied = ref(false)

function copyLatex() {
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(props.latexSnippet).catch(() => {})
  }
}
</script>

<template>
  <div class="space-y-3.5 text-slate-100 font-sans select-none text-xs">
    <!-- Barra de Herramientas de Exportación Académica (Placa de Cobre con Remaches) -->
    <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-gradient-to-b from-[#1c150c] via-[#120d07] to-[#0a0704] border-2 border-[#854d0e] gap-2.5 shadow-md">
      <LabScrew class="absolute top-1.5 left-2" :rotation="60" />
      <LabScrew class="absolute top-1.5 right-2" :rotation="-15" />
      <LabScrew class="absolute bottom-1.5 left-2" :rotation="30" />
      <LabScrew class="absolute bottom-1.5 right-2" :rotation="-45" />

      <div class="flex items-center gap-2 pl-3">
        <Table class="w-4 h-4 text-emerald-400" />
        <div>
          <h4 class="font-mono font-bold text-[#fbbf24] text-xs tracking-wide">
            Tabla de Iteraciones Numéricas Paso a Paso
          </h4>
          <p class="text-[9px] text-stone-400 font-mono">Comparativa paso a paso entre solución exacta, Euler y RK4</p>
        </div>
      </div>

      <div class="flex items-center gap-2 font-mono w-full sm:w-auto justify-end pr-3">
        <!-- Botón Exportar CSV -->
        <button
          @click="emit('exportCsv')"
          class="min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#2a1d10] via-[#1e130a] to-[#120b06] hover:from-[#3a2917] hover:to-[#1e130a] border-2 border-[#854d0e] text-[#fbbf24] text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.6)] active:scale-95 group"
          title="Descargar archivo .CSV con todas las columnas numéricas"
        >
          <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:scale-110 shrink-0" />
          <span>Exportar CSV</span>
        </button>

        <!-- Botón Copiar Tabla LaTeX -->
        <button
          @click="copyLatex"
          class="min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#064e3b] via-[#043628] to-[#022018] hover:from-[#056049] hover:to-[#043628] border-2 border-emerald-500/80 text-emerald-200 text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(5,150,105,0.4)] active:scale-95 group"
          title="Copiar código LaTeX listo para Overleaf / Informe universitario"
        >
          <CheckCircle2 v-if="copied" class="w-3.5 h-3.5 text-emerald-300 animate-bounce shrink-0" />
          <Copy v-else class="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:scale-110 shrink-0" />
          <span>{{ copied ? '¡Copiado!' : 'Copiar LaTeX' }}</span>
        </button>
      </div>
    </div>

    <!-- Tabla Científica de Iteraciones con Encabezado de Latón y Scroll Táctil -->
    <div class="relative rounded-2xl overflow-x-auto overflow-y-auto overscroll-contain border-2 border-[#854d0e] bg-[#070503] shadow-[inset_0_0_24px_rgba(0,0,0,0.9),0_8px_20px_rgba(0,0,0,0.8)] max-h-56">
      <table class="min-w-[620px] w-full text-left font-mono text-[9px] border-collapse">
        <thead class="bg-gradient-to-r from-[#1c140c] via-[#2a1e12] to-[#1c140c] border-b-2 border-[#854d0e] text-[#fbbf24] sticky top-0 z-10 shadow-md">
          <tr>
            <th class="p-2 text-center border-r border-[#854d0e]/40">n</th>
            <th class="p-2 border-r border-[#854d0e]/40">t (min)</th>
            <th class="p-2 text-sky-300 border-r border-[#854d0e]/40">C_exacta</th>
            <th class="p-2 text-amber-300 border-r border-[#854d0e]/40">C_Euler</th>
            <th class="p-2 text-emerald-300 border-r border-[#854d0e]/40">C_RK4</th>
            <th class="p-2 text-rose-300 border-r border-[#854d0e]/40">E_abs(Euler)</th>
            <th class="p-2 text-amber-200 border-r border-[#854d0e]/40">E_rel(Euler)%</th>
            <th class="p-2 text-emerald-300 border-r border-[#854d0e]/40">E_abs(RK4)</th>
            <th class="p-2 text-emerald-200">E_rel(RK4)%</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#854d0e]/25">
          <tr
            v-for="s in steps"
            :key="s.n"
            class="hover:bg-amber-950/30 transition-colors"
          >
            <td class="p-1.5 text-center text-stone-400 font-bold bg-black/40 border-r border-[#854d0e]/20">{{ s.n }}</td>
            <td class="p-1.5 text-stone-300 font-semibold border-r border-[#854d0e]/20">{{ s.t.toFixed(1) }}</td>
            <td class="p-1.5 text-sky-300 font-bold border-r border-[#854d0e]/20">{{ s.exact.toFixed(1) }}</td>
            <td class="p-1.5 text-amber-300 border-r border-[#854d0e]/20">{{ s.euler.toFixed(1) }}</td>
            <td class="p-1.5 text-emerald-300 font-bold border-r border-[#854d0e]/20">{{ s.rk4.toFixed(1) }}</td>
            <td class="p-1.5 text-rose-400 font-semibold border-r border-[#854d0e]/20">{{ s.errAbsEuler.toFixed(2) }}</td>
            <td class="p-1.5 text-amber-300 border-r border-[#854d0e]/20">{{ s.errRelEulerPct.toFixed(2) }}%</td>
            <td class="p-1.5 text-emerald-400 font-semibold border-r border-[#854d0e]/20">{{ s.errAbsRk4.toFixed(4) }}</td>
            <td class="p-1.5 text-emerald-300">{{ s.errRelRk4Pct.toFixed(4) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FEED INTERACTIVO DE ERRORES & AYUDA PARA EL INFORME -->
    <div class="relative rounded-2xl p-3.5 bg-gradient-to-b from-[#18120b] to-[#0a0704] border-2 border-[#854d0e]/70 space-y-2 shadow-md">
      <LabScrew class="absolute bottom-2 right-2" :rotation="70" />

      <div class="flex items-center justify-between border-b border-white/10 pb-1">
        <div class="flex items-center gap-1.5 font-mono font-bold text-xs text-[#fbbf24]">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>Feed de Análisis de Errores & Ayuda de Redacción</span>
        </div>
        <span class="text-[8.5px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/50">
          Cero Deriva en RK4
        </span>
      </div>

      <p class="font-mono text-stone-300 text-[10.5px] leading-relaxed">
        Euler va acumulando deriva paso a paso porque corta la serie de Taylor en la primera derivada (O(h)). Cada iteración arrastra la falla anterior. Con RK4 calculamos cuatro pendientes intermedias y cancelamos términos de error hasta cuarto orden (O(h⁴)). El resultado: deriva prácticamente nula en toda la corrida.
      </p>

      <div class="p-2.5 rounded-xl bg-black/70 border border-emerald-700/40 flex items-start gap-2 font-mono text-[9px] text-emerald-200">
        <MessageSquareQuote class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong class="text-emerald-400 block font-mono text-[10px]">Tip para el informe en Overleaf:</strong>
          "Toca 'Copiar Tabla LaTeX' y pégala directo en tu archivo .tex. Ya sale con formato estándar para informe universitario, caption y etiquetas listas para que no pierdas tiempo peleando con la sintaxis de las columnas."
        </div>
      </div>
    </div>
  </div>
</template>
