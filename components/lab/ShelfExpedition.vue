<script setup lang="ts">
import type { SessionData } from '~/composables/useAirGuardian'
import CampaignMap from '../CampaignMap.vue'
import SessionList from '../SessionList.vue'

withDefaults(defineProps<{
  sessions: SessionData[]
  selectedSessionId: string | null
  theme?: 'graphite' | 'white-lab'
}>(), {
  theme: 'graphite'
})

const emit = defineEmits<{
  (e: 'selectSession', id: string): void
  (e: 'openCreateModal'): void
}>()
</script>

<template>
  <div class="space-y-3.5 w-full select-none">
    <!-- Placa Metálica Remachada Bandeja III -->
    <div 
      class="relative px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 shadow-md transition-colors"
      :class="theme === 'white-lab' ? 'bg-gradient-to-r from-slate-200 via-white to-slate-200 border-slate-300' : 'bg-gradient-to-r from-[#171c26] via-[#10141e] to-[#171c26] border-slate-700/80'"
    >
      <div class="pl-1">
        <span class="font-mono text-xs font-black tracking-widest uppercase drop-shadow" :class="theme === 'white-lab' ? 'text-slate-900' : 'text-slate-100'">
          BANDEJA III • CARTOGRAFÍA GPS & MUESTRAS DE CAMPO
        </span>
        <span class="text-[9px] font-mono text-amber-500 block tracking-wider font-semibold">
          GEOLOCALIZACIÓN IoT • BITÁCORA GEOESPACIAL WAREHOUSE
        </span>
      </div>

      <div class="flex items-center gap-1.5 p-1 rounded-lg border shadow-inner" :class="theme === 'white-lab' ? 'bg-slate-100 border-slate-300' : 'bg-neutral-950/90 border-slate-700/80'">
        <span class="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border" :class="theme === 'white-lab' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-950/80 border-amber-700/60 text-amber-300'">
          GPS LOCK: OK
        </span>
        <span class="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border" :class="theme === 'white-lab' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-300'">
          ZONAS: {{ sessions.length }}
        </span>
      </div>
    </div>

    <!-- Grid de Mapa y Sesiones -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
      <div class="lg:col-span-7">
        <CampaignMap
          :sessions="sessions"
          :selected-session-id="selectedSessionId"
          :theme="theme"
          @select-session="(id) => emit('selectSession', id)"
          @open-create-modal="() => emit('openCreateModal')"
        />
      </div>
      <div class="lg:col-span-5">
        <SessionList
          :sessions="sessions"
          :selected-session-id="selectedSessionId"
          :theme="theme"
          @select-session="(id) => emit('selectSession', id)"
        />
      </div>
    </div>
  </div>
</template>
