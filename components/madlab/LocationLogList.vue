<script setup lang="ts">
import { ref } from 'vue'
import { Navigation, Pencil, Trash2, Check, X } from 'lucide-vue-next'
import type { SessionData } from '~/composables/useAirGuardian'

defineProps<{
  sessions: SessionData[]
  selectedSessionId?: string | null
}>()

const emit = defineEmits<{
  (e: 'selectSession', session: SessionData): void
  (e: 'editSession', session: SessionData): void
  (e: 'deleteSession', session: SessionData): void
}>()

const confirmingDeleteId = ref<string | null>(null)

function getMarkerColor(avgPpm: number | null | undefined) {
  if (!avgPpm || avgPpm < 650) return '#10b981' // Esmeralda - Óptimo
  if (avgPpm < 1000) return '#f59e0b'          // Ámbar - Alerta Moderada
  return '#ef4444'                              // Rojo - Crítico
}

function onConfirmDelete(s: SessionData) {
  confirmingDeleteId.value = null
  emit('deleteSession', s)
}
</script>

<template>
  <div class="relative bg-slate-950/90 border border-cyan-500/25 rounded-lg p-1.5 shrink-0 flex flex-col gap-1 shadow-inner font-mono select-none">
    <div class="flex items-center justify-between text-[8.5px] text-cyan-300 font-bold pb-0.5 border-b border-cyan-500/20 px-1">
      <span class="flex items-center gap-1">
        <Navigation class="w-2.5 h-2.5 text-cyan-400" />
        <span>BITÁCORA TÁCTICA</span>
      </span>
      <span class="text-[7px] text-slate-400">Clic p/ centrar</span>
    </div>

    <div class="max-h-[90px] overflow-y-auto overscroll-contain space-y-1 pr-1">
      <div
        v-for="(s, idx) in sessions.slice(0, 20)"
        :key="s.id || (s as any).session_id || idx"
        @click="emit('selectSession', s)"
        class="group p-1 rounded-md border text-[7.5px] flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.98] gap-1.5"
        :class="(selectedSessionId && (s.id === selectedSessionId || (s as any).session_id === selectedSessionId))
          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-100 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-850'"
      >
        <div class="truncate flex-1 min-w-0 pr-1">
          <div class="font-bold text-[8.5px] text-slate-100 truncate flex items-center gap-1">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: getMarkerColor(s.avg_ppm), boxShadow: `0 0 5px ${getMarkerColor(s.avg_ppm)}` }"
            />
            <span class="truncate">{{ s.name }}</span>
          </div>
          <div class="text-[7px] text-slate-400 truncate">
            Lat: {{ s.latitude.toFixed(3) }}° | Lng: {{ s.longitude.toFixed(3) }}°
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Métricas -->
          <div class="text-right shrink-0">
            <span class="font-bold text-[8.5px]" :style="{ color: getMarkerColor(s.avg_ppm) }">
              {{ s.avg_ppm ? Math.round(s.avg_ppm) : 410 }} PPM
            </span>
            <div class="text-[6.5px] text-slate-500">{{ s.total_samples || 0 }} lecturas</div>
          </div>

          <!-- Botones de Acción (Editar / Eliminar) -->
          <div
            v-if="confirmingDeleteId === (s.id || (s as any).session_id)"
            class="flex items-center gap-1 bg-red-950/90 border border-red-800/80 rounded px-1 py-0.5 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
            @click.stop
          >
            <span class="text-[7px] text-rose-300">¿Borrar?</span>
            <button
              type="button"
              @click.stop="onConfirmDelete(s)"
              class="p-0.5 hover:bg-rose-800 rounded text-rose-300 hover:text-white transition cursor-pointer"
              title="Confirmar eliminación"
            >
              <Check class="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              @click.stop="confirmingDeleteId = null"
              class="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Cancelar"
            >
              <X class="w-2.5 h-2.5" />
            </button>
          </div>

          <div v-else class="flex items-center gap-0.5 opacity-95 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity" @click.stop>
            <button
              type="button"
              @click.stop="emit('editSession', s)"
              aria-label="Editar ubicación"
              class="min-w-[22px] min-h-[22px] flex items-center justify-center rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 transition shadow-xs cursor-pointer active:scale-90"
              title="Editar ubicación"
            >
              <Pencil class="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              @click.stop="confirmingDeleteId = (s.id || (s as any).session_id)"
              aria-label="Eliminar ubicación"
              class="min-w-[22px] min-h-[22px] flex items-center justify-center rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-400 hover:text-rose-200 transition shadow-xs cursor-pointer active:scale-90"
              title="Eliminar ubicación"
            >
              <Trash2 class="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
