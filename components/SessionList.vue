<script setup lang="ts">
const props = withDefaults(defineProps<{
  sessions: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    start_time: number
    total_samples: number
    avg_ppm: number | null
    max_ppm: number | null
  }>
  selectedSessionId: string | null
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

const emit = defineEmits<{
  (e: 'selectSession', id: string): void
}>()

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div 
    class="rounded-xl p-3.5 sm:p-4 border transition-colors duration-300 shadow-md"
    :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0e1118] border-slate-800 text-slate-100'"
  >
    <h3 class="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between" :class="theme === 'white-lab' ? 'text-slate-800' : 'text-slate-200'">
      <span>Historial de Campañas (Data Warehouse)</span>
      <span class="text-[9px]" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">{{ sessions.length }} registros</span>
    </h3>

    <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
      <div 
        v-for="s in sessions" 
        :key="s.id"
        @click="emit('selectSession', s.id)"
        class="p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between"
        :class="s.id === selectedSessionId 
          ? (theme === 'white-lab' ? 'bg-slate-100 border-sky-500 shadow-sm' : 'bg-slate-800 border-sky-500 shadow-md')
          : (theme === 'white-lab' ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-neutral-950/60 border-slate-800/80 hover:border-slate-700')"
      >
        <div class="space-y-0.5">
          <div class="text-xs font-bold flex items-center gap-1.5" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">
            <span class="w-1.5 h-1.5 rounded-full" :class="s.avg_ppm && s.avg_ppm > 800 ? 'bg-amber-500' : 'bg-emerald-500'"></span>
            {{ s.name }}
          </div>
          <div class="text-[9px] font-mono" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">
            {{ formatDate(s.start_time) }} • {{ s.total_samples }} muestras
          </div>
        </div>

        <div class="text-right font-mono">
          <div class="text-xs font-bold" :class="s.avg_ppm && s.avg_ppm > 800 ? 'text-amber-500' : 'text-emerald-500'">
            {{ s.avg_ppm ? Math.round(s.avg_ppm) : '--' }} PPM
          </div>
          <div class="text-[9px]" :class="theme === 'white-lab' ? 'text-slate-400' : 'text-slate-500'">
            Max: {{ s.max_ppm ? Math.round(s.max_ppm) : '--' }}
          </div>
        </div>
      </div>

      <div v-if="sessions.length === 0" class="text-center py-4 text-xs font-mono" :class="theme === 'white-lab' ? 'text-slate-400' : 'text-slate-500'">
        No hay campañas registradas todavía.
      </div>
    </div>
  </div>
</template>
