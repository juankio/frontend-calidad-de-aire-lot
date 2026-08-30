<script setup lang="ts">
import { ShieldCheck, AlertTriangle, AlertOctagon, Activity } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  riskStatus: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  predictedPpm15m: number
  deltaPpm1m: number
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})
</script>

<template>
  <div 
    class="w-full rounded-xl p-3 border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
    :class="[
      theme === 'white-lab' ? {
        'bg-emerald-50/90 border-emerald-300 text-emerald-950': riskStatus === 'OPTIMAL',
        'bg-amber-50/95 border-amber-400 text-amber-950 animate-pulse': riskStatus === 'WARNING_PREDICTIVE',
        'bg-rose-50/95 border-rose-400 text-rose-950': riskStatus === 'CRITICAL',
        'bg-cyan-50/90 border-cyan-300 text-cyan-950': riskStatus === 'RECOVERY',
        'bg-slate-100 border-slate-300 text-slate-800': riskStatus === 'SLEEPING'
      } : {
        'bg-emerald-950/40 border-emerald-800/80 text-emerald-200': riskStatus === 'OPTIMAL',
        'bg-amber-950/50 border-amber-700 text-amber-200 animate-pulse': riskStatus === 'WARNING_PREDICTIVE',
        'bg-rose-950/60 border-rose-700 text-rose-200': riskStatus === 'CRITICAL',
        'bg-cyan-950/40 border-cyan-800/80 text-cyan-200': riskStatus === 'RECOVERY',
        'bg-[#121620] border-slate-800 text-slate-300': riskStatus === 'SLEEPING'
      }
    ]"
  >
    <div class="flex items-center gap-3">
      <div 
        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow"
        :class="{
          'bg-emerald-500/20 text-emerald-500': riskStatus === 'OPTIMAL',
          'bg-amber-500/30 text-amber-500': riskStatus === 'WARNING_PREDICTIVE',
          'bg-rose-500/30 text-rose-500': riskStatus === 'CRITICAL',
          'bg-cyan-500/20 text-cyan-500': riskStatus === 'RECOVERY',
          'bg-slate-700 text-slate-400': riskStatus === 'SLEEPING'
        }"
      >
        <ShieldCheck v-if="riskStatus === 'OPTIMAL'" class="w-4 h-4" />
        <AlertTriangle v-else-if="riskStatus === 'WARNING_PREDICTIVE'" class="w-4 h-4" />
        <AlertOctagon v-else-if="riskStatus === 'CRITICAL'" class="w-4 h-4" />
        <Activity v-else class="w-4 h-4" />
      </div>

      <div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] font-journal uppercase tracking-wider font-extrabold">
            {{ riskStatus === 'WARNING_PREDICTIVE' ? 'Alerta: Aire Cambiando' : riskStatus === 'CRITICAL' ? '¡Peligro! Aire Contaminado' : 'Aire Limpio y Seguro' }}
          </span>
        </div>
        <p class="text-[11px] font-journal mt-0.5" :class="theme === 'white-lab' ? 'text-slate-700' : 'text-slate-300'">
          <span v-if="riskStatus === 'WARNING_PREDICTIVE'">
            Tendencia al alza (+{{ deltaPpm1m.toFixed(1) }} PPM/min). Pronóstico en 15 min: <strong class="font-mono font-bold">{{ predictedPpm15m }} PPM</strong>. <em>Ventilar el área.</em>
          </span>
          <span v-else-if="riskStatus === 'CRITICAL'">
            Nivel de gas crítico. Ventilar inmediatamente el lugar.
          </span>
          <span v-else>
            Concentración de gases estable y aire seguro.
          </span>
        </p>
      </div>
    </div>

    <div 
      class="flex items-center gap-2 self-end sm:self-center font-mono text-[11px] px-2.5 py-1 rounded-lg border"
      :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-black/50 border-slate-700 text-slate-100'"
    >
      <span class="text-[10px] font-journal" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">Pronóstico:</span>
      <span class="font-bold">{{ predictedPpm15m }} PPM</span>
    </div>
  </div>
</template>