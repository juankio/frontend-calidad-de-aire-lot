<script setup lang="ts">
import { Compass, Plus, Navigation } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import type { SessionData } from '~/composables/useAirGuardian'
import MadLabContainer from './MadLabContainer.vue'

const props = withDefaults(defineProps<{ sessions?: SessionData[]; selectedSessionId?: string | null }>(), { sessions: () => [], selectedSessionId: null })
const emit = defineEmits<{ (e: 'selectSession', id: string): void; (e: 'openCreateModal'): void }>()
const centerLat = 4.1420, centerLng = -73.6266

function getRadarPos(lat: number, lng: number) {
  const dx = (lng - centerLng) * 2200, dy = (centerLat - lat) * 2200
  const dist = Math.min(82, Math.sqrt(dx * dx + dy * dy))
  const angleRad = Math.atan2(dy, dx)
  const angleDeg = (angleRad * (180 / Math.PI) + 360) % 360
  return { cx: 100 + Math.cos(angleRad) * dist, cy: 100 + Math.sin(angleRad) * dist, delay: (angleDeg / 360) * 3.6 }
}
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col overflow-y-auto gap-2">

    <!-- Cabecera Militar Táctica -->
    <div class="flex items-center justify-between pb-1.5 border-b border-[#854d0e]/40 shrink-0">
      <div class="flex items-center gap-1.5 pl-1">
        <Compass class="w-3.5 h-3.5 text-emerald-400" />
        <span class="text-[11px] font-journal font-bold tracking-wider text-[#fbbf24]">📡 Radar Táctico 360° & Cartografía</span>
      </div>
      <button @click="emit('openCreateModal')" class="px-2.5 py-1 rounded bg-gradient-to-r from-[#92400e] via-[#b45309] to-[#78350f] hover:from-[#b45309] hover:to-[#92400e] border border-[#fbbf24]/70 text-[#fef3c7] text-[9.5px] font-journal font-bold flex items-center gap-1 shadow-[0_2px_8px_rgba(180,83,9,0.3)] cursor-pointer active:scale-95 transition-all">
        <Plus class="w-2.5 h-2.5" /> 📍 Marcar Lugar
      </button>
    </div>

    <!-- Pantalla Sonar Radar Fósforo 360° con Mapa Cartográfico de Fondo -->
    <div class="flex-1 w-full flex items-center justify-center p-1.5 rounded-xl bg-[#010a04] border-2 border-[#00ff66]/50 relative overflow-hidden shadow-[inset_0_0_24px_rgba(0,255,102,0.2)] min-h-0">
      <svg class="w-full h-full max-w-full aspect-square relative z-10" viewBox="0 0 200 200">
        <defs>
          <clipPath id="radar-viewport"><circle cx="100" cy="100" r="92" /></clipPath>
          <radialGradient id="sonar-cone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,255,102,0.55)" /><stop offset="100%" stop-color="transparent" />
          </radialGradient>
        </defs>

        <g clip-path="url(#radar-viewport)">
          <!-- 1. Fondo Visión Nocturna y Mapa Cartográfico Táctico Real -->
          <rect x="8" y="8" width="184" height="184" fill="#011508" />
          
          <!-- Zonas de Medición / Escaneo -->
          <path d="M 50 40 L 80 30 L 120 50 L 110 90 L 60 80 Z" fill="rgba(0,255,102,0.12)" stroke="#00ff66" stroke-width="0.6" stroke-dasharray="2,1" opacity="0.6" />
          <path d="M 130 110 L 170 120 L 180 160 L 140 180 L 120 150 Z" fill="rgba(0,255,102,0.1)" stroke="#00ff66" stroke-width="0.6" stroke-dasharray="2,1" opacity="0.5" />

          <!-- Manzanas Urbanas y Sectores Tácticos -->
          <rect x="35" y="42" width="26" height="22" rx="2" fill="#022c15" stroke="#054e28" stroke-width="0.8" opacity="0.8" />
          <rect x="70" y="38" width="22" height="26" rx="2" fill="#022c15" stroke="#054e28" stroke-width="0.8" opacity="0.8" />
          <rect x="138" y="46" width="30" height="20" rx="2" fill="#022c15" stroke="#054e28" stroke-width="0.8" opacity="0.8" />
          <rect x="38" y="132" width="28" height="24" rx="2" fill="#022c15" stroke="#054e28" stroke-width="0.8" opacity="0.8" />
          <rect x="132" y="128" width="34" height="28" rx="2" fill="#022c15" stroke="#054e28" stroke-width="0.8" opacity="0.8" />
          <!-- Curvas de Nivel Topográficas -->
          <path d="M 12 55 Q 60 40 100 62 T 188 45 M 10 95 Q 65 80 115 102 T 190 88 M 15 145 Q 75 125 125 152 T 185 138" fill="none" stroke="#047857" stroke-width="0.7" stroke-dasharray="2,3" opacity="0.55" />
          <!-- Malla y Trazado de Calles / Carreteras en Fósforo Verde -->
          <path d="M 8 72 L 192 72 M 8 124 L 192 124 M 64 8 L 64 192 M 132 8 L 132 192 M 22 178 L 178 22" stroke="#00ff66" stroke-width="1.1" stroke-opacity="0.3" />
          <path d="M 8 98 L 192 98 M 98 8 L 98 192" stroke="#00ff66" stroke-width="0.8" stroke-opacity="0.45" stroke-dasharray="4,4" />

          <!-- 2. Retícula Sonar Militar & Anillos de Distancia -->
          <circle cx="100" cy="100" r="92" fill="none" stroke="#00ff66" stroke-width="1.5" stroke-opacity="0.8" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#00ff66" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3" />
          <circle cx="100" cy="100" r="36" fill="none" stroke="#00ff66" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3" />
          <text x="104" y="34" fill="#00ff66" opacity="0.75" font-size="6.5" font-family="monospace" font-weight="bold">500m</text>
          <text x="104" y="62" fill="#00ff66" opacity="0.75" font-size="6.5" font-family="monospace" font-weight="bold">250m</text>

          <!-- 3. Haz de Sonar Barrido 360° Continuo -->
          <g class="sonar-sweep" style="transform-origin: 100px 100px;">
            <path d="M 100 100 L 192 100 A 92 92 0 0 0 165 35 Z" fill="url(#sonar-cone)" opacity="0.85" />
            <line x1="100" y1="100" x2="192" y2="100" stroke="#00ff66" stroke-width="2.2" filter="drop-shadow(0 0 5px #00ff66)" />
          </g>

          <!-- 4. Balizas de Lugares Medidos sobre Coordenadas Cartográficas -->
          <g v-for="s in (sessions.length ? sessions : [{ id: 'demo-1', name: 'Casa (Base)', latitude: 4.142, longitude: -73.626 }])" :key="s.id" class="cursor-pointer group" @click="emit('selectSession', s.id)">
            <circle :cx="getRadarPos(s.latitude, s.longitude).cx" :cy="getRadarPos(s.latitude, s.longitude).cy" r="10" fill="rgba(0,255,102,0.25)" :stroke="s.id === selectedSessionId ? '#fbbf24' : '#00ff66'" stroke-width="1.8" class="sonar-blip" :style="{ animationDelay: `${getRadarPos(s.latitude, s.longitude).delay}s` }" />
            <circle :cx="getRadarPos(s.latitude, s.longitude).cx" :cy="getRadarPos(s.latitude, s.longitude).cy" r="3.8" :fill="s.id === selectedSessionId ? '#fbbf24' : '#00ff66'" :filter="s.id === selectedSessionId ? 'drop-shadow(0 0 4px #fbbf24)' : 'drop-shadow(0 0 3px #00ff66)'" />
            <rect :x="getRadarPos(s.latitude, s.longitude).cx + 4" :y="getRadarPos(s.latitude, s.longitude).cy - 10" width="46" height="9" rx="1.5" fill="#011508" fill-opacity="0.85" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.6" />
            <text :x="getRadarPos(s.latitude, s.longitude).cx + 6" :y="getRadarPos(s.latitude, s.longitude).cy - 3" fill="#00ff66" font-size="5.8" font-family="monospace" font-weight="bold">
              {{ s.name.slice(0, 9) }}
            </text>
          </g>
          <!-- Centro de Base / Operador -->
          <circle cx="100" cy="100" r="3.5" fill="#fbbf24" stroke="#78350f" stroke-width="1.2" />
        </g>
      </svg>

      <div class="absolute top-2 left-2 text-[8px] font-mono text-[#00ff66] bg-black/80 px-1.5 py-0.5 rounded border border-[#00ff66]/40 shadow">BARRIDO 360° MAPA TÁCTICO</div>
      <div class="absolute bottom-2 right-2 text-[8px] font-mono text-amber-400 bg-black/80 px-1.5 py-0.5 rounded border border-amber-500/40 shadow">LUGARES: {{ sessions.length }}</div>
    </div>

    <!-- Bitácora de Lugares Medidos Interactiva -->
    <div class="bg-[#080503] border border-[#854d0e]/40 rounded-xl p-2 shrink-0 flex flex-col gap-1 mt-auto">
      <div class="flex items-center justify-between text-[9px] text-[#fbbf24] font-journal font-bold pb-1 border-b border-[#854d0e]/30">
        <span class="flex items-center gap-1"><Navigation class="w-2.5 h-2.5 text-emerald-400" /> Bitácora de Posición ({{ sessions.length }})</span>
        <span class="text-[8px] font-mono text-stone-400">Clic para centrar</span>
      </div>

      <div class="max-h-20 overflow-y-auto space-y-1 my-0.5 pr-1 font-mono">
        <div v-for="s in (sessions.length ? sessions : [{ id: 'demo-1', name: 'Casa (Base Central)', latitude: 4.1420, longitude: -73.6266, total_samples: 45, avg_ppm: 420 }])" :key="s.id" @click="emit('selectSession', s.id)" class="p-1 rounded border text-[8px] flex items-center justify-between cursor-pointer transition active:scale-[0.98]" :class="s.id === selectedSessionId ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-black/50 border-stone-800 text-stone-300 hover:border-stone-600'">
          <div class="truncate pr-1">
            <div class="font-bold text-[8.5px] text-[#fbbf24] truncate">{{ s.name }}</div>
            <div class="text-[7.5px] text-stone-400">Lat: {{ s.latitude.toFixed(3) }}° | Lng: {{ s.longitude.toFixed(3) }}°</div>
          </div>
          <div class="text-right shrink-0">
            <span class="font-bold text-emerald-400">{{ s.avg_ppm ? Math.round(s.avg_ppm) : 410 }} PPM</span>
            <div class="text-[7px] text-stone-500">{{ s.total_samples || 1 }} lecturas</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
@keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ping-fade {
  0% { transform: scale(0.6); opacity: 0.1; }
  12% { transform: scale(1.6); opacity: 1; filter: drop-shadow(0 0 8px #00ff66); }
  50% { transform: scale(1.1); opacity: 0.45; }
  100% { transform: scale(0.6); opacity: 0.1; }
}
.sonar-sweep { animation: sweep 3.6s linear infinite; }
.sonar-blip { transform-box: fill-box; transform-origin: center; animation: ping-fade 3.6s infinite ease-out; }
</style>