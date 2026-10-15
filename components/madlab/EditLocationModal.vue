<script setup lang="ts">
import { ref, watch } from 'vue'
import { Pencil, X, Check, Compass } from 'lucide-vue-next'
import type { SessionData } from '~/composables/useAirGuardian'

const props = defineProps<{
  isOpen: boolean
  session: SessionData | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', session: SessionData): void
}>()

const config = useRuntimeConfig()
const apiBase = ((config.public.apiBase as string) || 'https://servidor-taller.tailf19567.ts.net:10000').replace(/\/+$/, '')

const name = ref('')
const description = ref('')
const latitude = ref(4.1420)
const longitude = ref(-73.6266)
const radiusMeters = ref(50)
const isSubmitting = ref(false)
const errorMessage = ref('')

const PRESETS = [
  { name: 'Campus Unillanos', lat: 4.1450, lng: -73.6280 },
  { name: 'Laboratorio IoT', lat: 4.1420, lng: -73.6266 },
  { name: 'Parque Libertadores', lat: 4.1500, lng: -73.6330 },
  { name: 'Hogar / Base', lat: 4.1380, lng: -73.6220 }
]

watch(() => props.session, (s) => {
  if (s) {
    name.value = s.name || ''
    description.value = s.description || ''
    latitude.value = Number(s.latitude) || 4.1420
    longitude.value = Number(s.longitude) || -73.6266
    radiusMeters.value = Number(s.radius_meters) || 50
    errorMessage.value = ''
  }
}, { immediate: true })

function applyPreset(preset: { lat: number; lng: number }) {
  latitude.value = preset.lat
  longitude.value = preset.lng
}

async function handleSave() {
  if (!props.session) return
  const id = props.session.id || (props.session as any).session_id
  if (!id) return

  if (!name.value || name.value.trim().length < 2) {
    errorMessage.value = 'El nombre requiere al menos 2 caracteres'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const updatedPayload: Partial<SessionData> = {
      name: name.value.trim(),
      description: description.value.trim(),
      latitude: Number(latitude.value),
      longitude: Number(longitude.value),
      radius_meters: Number(radiusMeters.value)
    }

    const res = await fetch(`${apiBase}/api/sessions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload)
    })

    if (res.ok) {
      emit('saved', { ...props.session, ...updatedPayload })
      emit('close')
    } else {
      errorMessage.value = 'Error al actualizar sesión en el servidor'
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Error inesperado al guardar'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div class="bg-[#070b14]/95 border border-cyan-500/40 rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] space-y-3 relative select-none font-mono">
      <svg class="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none"><path d="M1 13V3C1 1.89543 1.89543 1 3 1H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      <svg class="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none"><path d="M13 13V3C13 1.89543 12.1046 1 11 1H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      <svg class="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none"><path d="M1 1V11C1 12.1046 1.89543 13 3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
      <svg class="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none"><path d="M13 1V11C13 12.1046 12.1046 13 11 13H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>

      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2 px-1 sm:px-2">
        <h3 class="text-xs sm:text-sm font-scifi font-bold text-white flex items-center gap-2">
          <Pencil class="w-4 h-4 text-cyan-400 shrink-0" />
          <span>CALIBRAR PUNTO TÁCTICO</span>
        </h3>
        <button type="button" @click="emit('close')" aria-label="Cerrar modal" class="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-cyan-200 transition cursor-pointer rounded-lg hover:bg-slate-900 active:scale-90">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="space-y-2.5 font-mono px-0.5 text-xs">
        <div v-if="errorMessage" class="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px]">{{ errorMessage }}</div>

        <div>
          <label class="block text-[11px] font-bold text-slate-200 mb-0.5">Nombre de la Ubicación</label>
          <input v-model="name" type="text" required minlength="2" maxlength="120" class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono" />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-200 mb-0.5">Notas del Entorno / Descripción</label>
          <input v-model="description" type="text" maxlength="500" class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono" />
        </div>

        <div>
          <span class="block text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-mono">
            <Compass class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Presets Geográficos Tácticos:</span>
          </span>
          <div class="grid grid-cols-2 gap-1.5 font-mono">
            <button
              v-for="preset in PRESETS"
              :key="preset.name"
              type="button"
              @click="applyPreset(preset)"
              class="min-h-[40px] px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/25 hover:border-cyan-400 rounded-xl text-left transition cursor-pointer flex flex-col justify-center active:scale-95"
            >
              <span class="text-[9.5px] font-bold text-cyan-300 truncate">{{ preset.name }}</span>
              <span class="text-[8px] text-slate-400 font-mono">{{ preset.lat.toFixed(3) }}, {{ preset.lng.toFixed(3) }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 font-mono">
          <div>
            <label class="block text-[10px] text-slate-400 mb-0.5">Latitud</label>
            <input v-model="latitude" type="number" step="0.0001" required class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-cyan-400 focus:outline-none font-mono" />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-0.5">Longitud</label>
            <input v-model="longitude" type="number" step="0.0001" required class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-cyan-400 focus:outline-none font-mono" />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-0.5">Radio (m)</label>
            <input v-model="radiusMeters" type="number" step="5" min="10" max="50000" required class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-cyan-400 focus:outline-none font-mono" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-cyan-500/20 font-mono">
          <button type="button" @click="emit('close')" class="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer">
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="min-h-[40px] px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white rounded-xl text-xs font-bold transition shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check class="w-3.5 h-3.5" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Calibración' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
