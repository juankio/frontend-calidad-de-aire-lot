<script setup lang="ts">
import { ref } from 'vue'
import { Plus, MapPin } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  sessions: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    radius_meters: number
    avg_ppm: number | null
    max_ppm: number | null
    total_samples: number
  }>
  selectedSessionId: string | null
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

const emit = defineEmits<{
  (e: 'selectSession', id: string): void
  (e: 'openCreateModal'): void
}>()

const mapCenterLat = ref(4.1420)
const mapCenterLng = ref(-73.6266)

function getSvgX(lng: number) {
  const delta = (lng - mapCenterLng.value) * 1200
  return 200 + delta
}

function getSvgY(lat: number) {
  const delta = (mapCenterLat.value - lat) * 1200
  return 150 + delta
}
</script>

<template>
  <div 
    class="rounded-xl p-3.5 sm:p-4 border transition-colors duration-300 shadow-md space-y-3"
    :class="theme === 'white-lab' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0e1118] border-slate-800 text-slate-100'"
  >
    <div class="flex items-center justify-between border-b pb-2.5" :class="theme === 'white-lab' ? 'border-slate-200' : 'border-slate-800/80'">
      <div>
        <h3 class="text-xs font-journal font-bold uppercase tracking-wider flex items-center gap-2" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-white'">
          <MapPin class="w-3.5 h-3.5 text-emerald-500" />
          Lugares Medidos & GPS
        </h3>
        <p class="text-[10px] font-journal" :class="theme === 'white-lab' ? 'text-slate-500' : 'text-slate-400'">Puntos de toma de muestras de aire</p>
      </div>

      <button 
        @click="emit('openCreateModal')"
        class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 shadow cursor-pointer font-journal"
      >
        <Plus class="w-3 h-3" />
        📍 Marcar Lugar
      </button>
    </div>

    <!-- Mapa Vectorial Interactivo Geoespacial -->
    <div 
      class="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border flex items-center justify-center transition-colors"
      :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-[#06080c] border-slate-800'"
    >
      <svg class="w-full h-full" viewBox="0 0 400 300">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" :stroke="theme === 'white-lab' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Círculos de Lugares Medidos -->
        <g v-for="s in sessions" :key="s.id" class="cursor-pointer group" @click="emit('selectSession', s.id)">
          <circle 
            :cx="getSvgX(s.longitude)" 
            :cy="getSvgY(s.latitude)" 
            :r="Math.max(14, s.radius_meters / 2)" 
            :fill="s.avg_ppm && s.avg_ppm > 800 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'"
            :stroke="s.id === selectedSessionId ? '#38bdf8' : s.avg_ppm && s.avg_ppm > 800 ? '#f59e0b' : '#10b981'"
            :stroke-width="s.id === selectedSessionId ? 2.5 : 1"
            stroke-dasharray="3,3"
          />

          <circle 
            :cx="getSvgX(s.longitude)" 
            :cy="getSvgY(s.latitude)" 
            r="5" 
            :fill="s.id === selectedSessionId ? '#38bdf8' : s.avg_ppm && s.avg_ppm > 800 ? '#f59e0b' : '#10b981'"
            class="transition-transform group-hover:scale-125"
          />

          <text 
            :x="getSvgX(s.longitude)" 
            :y="getSvgY(s.latitude) - 8" 
            text-anchor="middle" 
            class="text-[9px] font-mono font-bold"
            :class="theme === 'white-lab' ? 'fill-slate-800' : 'fill-slate-200'"
          >
            {{ s.name }}
          </text>
        </g>
      </svg>

      <div class="absolute bottom-2 left-2 border px-2 py-0.5 rounded text-[9px] font-mono" :class="theme === 'white-lab' ? 'bg-white/90 border-slate-300 text-slate-600' : 'bg-neutral-950/90 border-slate-800 text-slate-400'">
        Lat: {{ mapCenterLat }}° | Lng: {{ mapCenterLng }}°
      </div>
    </div>
  </div>
</template>