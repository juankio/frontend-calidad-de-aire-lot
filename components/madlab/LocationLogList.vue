<script setup lang="ts">
import { ref } from 'vue'
import { Navigation, Pencil, Trash2, Check, X } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
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
  <div class="relative bg-gradient-to-b from-[#181109] via-[#100b06] to-[#080503] border-2 border-[#854d0e]/70 rounded-xl p-2 shrink-0 flex flex-col gap-1.5 shadow-[inset_0_1px_2px_rgba(251,191,36,0.15),0_4px_12px_rgba(0,0,0,0.8)] max-h-36">
    <LabScrew class="absolute top-1 left-1.5" :rotation="28" />
    <LabScrew class="absolute top-1 right-1.5" :rotation="-52" />

    <div class="flex items-center justify-between text-[9px] text-[#fbbf24] font-journal font-bold pb-1 border-b border-[#854d0e]/40 px-3">
      <span class="flex items-center gap-1.5">
        <Navigation class="w-3 h-3 text-emerald-400" />
        <span>Lugares Donde Estuvimos (Bitácora de Campo)</span>
      </span>
      <span class="text-[7.5px] font-mono text-stone-400">Clic para centrar</span>
    </div>

    <div class="overflow-y-auto space-y-1.5 pr-1 font-mono max-h-28">
      <div
        v-for="(s, idx) in sessions.slice(0, 20)"
        :key="s.id || (s as any).session_id || idx"
        @click="emit('selectSession', s)"
        class="group p-1.5 rounded-lg border-2 text-[8px] flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.98] gap-2"
        :class="(selectedSessionId && (s.id === selectedSessionId || (s as any).session_id === selectedSessionId))
          ? 'bg-gradient-to-r from-[#3a200a] to-[#201105] border-[#fbbf24] text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
          : 'bg-[#0b0805]/90 border-[#854d0e]/50 text-stone-300 hover:border-[#fbbf24]/60 hover:bg-[#160f08]'"
      >
        <div class="truncate flex-1 min-w-0 pr-1">
          <div class="font-bold text-[9px] text-[#fbbf24] truncate flex items-center gap-1.5">
            <span
              class="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px]"
              :style="{ backgroundColor: getMarkerColor(s.avg_ppm), boxShadow: `0 0 6px ${getMarkerColor(s.avg_ppm)}` }"
            />
            <span class="truncate">{{ s.name }}</span>
          </div>
          <div class="text-[7.5px] text-stone-400 font-mono mt-0.5 truncate">
            Lat: {{ s.latitude.toFixed(3) }}° | Lng: {{ s.longitude.toFixed(3) }}°
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <!-- Métricas -->
          <div class="text-right shrink-0">
            <span class="font-bold font-mono text-[9px]" :style="{ color: getMarkerColor(s.avg_ppm) }">
              {{ s.avg_ppm ? Math.round(s.avg_ppm) : 410 }} PPM
            </span>
            <div class="text-[7px] text-stone-500 font-journal">{{ s.total_samples || 0 }} lecturas</div>
          </div>

          <!-- Botones de Acción (Editar / Eliminar) -->
          <div
            v-if="confirmingDeleteId === (s.id || (s as any).session_id)"
            class="flex items-center gap-1 bg-red-950/90 border border-red-800/80 rounded px-1.5 py-0.5 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
            @click.stop
          >
            <span class="text-[7.5px] text-rose-300 font-mono">¿Borrar?</span>
            <button
              type="button"
              @click.stop="onConfirmDelete(s)"
              class="p-0.5 hover:bg-rose-800 rounded text-rose-300 hover:text-white transition cursor-pointer"
              title="Confirmar eliminación"
            >
              <Check class="w-3 h-3" />
            </button>
            <button
              type="button"
              @click.stop="confirmingDeleteId = null"
              class="p-0.5 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition cursor-pointer"
              title="Cancelar"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <div v-else class="flex items-center gap-1 opacity-95 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity" @click.stop>
            <button
              type="button"
              @click.stop="emit('editSession', s)"
              aria-label="Editar ubicación"
              class="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#25180c] hover:bg-[#382310] border border-[#854d0e]/70 hover:border-[#fbbf24] text-amber-400 hover:text-amber-200 transition shadow-xs cursor-pointer active:scale-90"
              title="Editar ubicación"
            >
              <Pencil class="w-3 h-3" />
            </button>
            <button
              type="button"
              @click.stop="confirmingDeleteId = (s.id || (s as any).session_id)"
              aria-label="Eliminar ubicación"
              class="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#240b0b] hover:bg-[#3b1212] border border-[#7f1d1d]/70 hover:border-[#ef4444] text-rose-400 hover:text-rose-200 transition shadow-xs cursor-pointer active:scale-90"
              title="Eliminar ubicación"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
