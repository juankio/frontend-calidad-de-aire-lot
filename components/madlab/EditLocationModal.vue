<script setup lang="ts">
import { ref, watch } from 'vue'
import { Pencil, X, Check, MapPin, Compass } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import { useAirGuardian, type SessionData } from '~/composables/useAirGuardian'

const props = defineProps<{
  isOpen: boolean
  session: SessionData | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', session: SessionData): void
}>()

const { updateSession } = useAirGuardian()

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

    const ok = await updateSession(id, updatedPayload)
    if (ok) {
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
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xs pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div class="bg-gradient-to-b from-[#1c150c] via-[#150f08] to-[#0c0906] border-2 border-[#854d0e] rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.95)] space-y-3 relative select-none">
      <LabScrew class="absolute top-2 left-2 pointer-events-none" :rotation="20" />
      <LabScrew class="absolute top-2 right-2 pointer-events-none" :rotation="-40" />
      <LabScrew class="absolute bottom-2 left-2 pointer-events-none" :rotation="65" />
      <LabScrew class="absolute bottom-2 right-2 pointer-events-none" :rotation="-15" />

      <!-- Cabecera de Calibración Steampunk -->
      <div class="flex items-center justify-between border-b border-[#854d0e]/60 pb-2 px-1 sm:px-2">
        <h3 class="text-xs sm:text-sm font-journal font-bold text-[#fbbf24] flex items-center gap-2">
          <Pencil class="w-4 h-4 text-amber-400 shrink-0" />
          <span>Calibrar Bitácora de Campo</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          aria-label="Cerrar modal"
          class="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-amber-200 transition cursor-pointer rounded-lg hover:bg-stone-900/60 active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="space-y-2.5 font-journal px-0.5 text-xs">
        <div v-if="errorMessage" class="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-mono">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-[11px] font-bold text-amber-200 mb-0.5">Nombre de la Ubicación</label>
          <input
            v-model="name"
            type="text"
            required
            minlength="2"
            maxlength="120"
            class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-amber-200 mb-0.5">Notas del Entorno / Descripción</label>
          <input
            v-model="description"
            type="text"
            maxlength="500"
            class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono"
          />
        </div>

        <!-- Presets rápidos de Villavicencio -->
        <div>
          <span class="block text-[10px] font-bold text-stone-400 mb-1 flex items-center gap-1">
            <Compass class="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Coordenadas Rápidas (Villavicencio)</span>
          </span>
          <div class="grid grid-cols-2 gap-1.5 font-mono">
            <button
              v-for="preset in PRESETS"
              :key="preset.name"
              type="button"
              @click="applyPreset(preset)"
              class="min-h-[42px] px-2.5 py-1.5 bg-[#1a120a] hover:bg-[#2c1c0f] border border-[#854d0e]/50 hover:border-[#fbbf24] rounded-xl text-left transition cursor-pointer flex flex-col justify-center active:scale-95"
            >
              <span class="text-[9.5px] font-bold text-amber-300 font-journal truncate">{{ preset.name }}</span>
              <span class="text-[8px] text-stone-400 font-mono">{{ preset.lat.toFixed(3) }}, {{ preset.lng.toFixed(3) }}</span>
            </button>
          </div>
        </div>

        <!-- Coordenadas Manuales y Radio -->
        <div class="grid grid-cols-3 gap-2 font-mono">
          <div>
            <label class="block text-[10px] font-journal text-stone-300 mb-0.5">Latitud</label>
            <input
              v-model="latitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-[#fbbf24] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-[10px] font-journal text-stone-300 mb-0.5">Longitud</label>
            <input
              v-model="longitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-[#fbbf24] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-[10px] font-journal text-stone-300 mb-0.5">Radio (m)</label>
            <input
              v-model="radiusMeters"
              type="number"
              step="5"
              min="10"
              max="50000"
              required
              class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-2.5 py-2 sm:py-1 text-base sm:text-xs text-white focus:border-[#fbbf24] focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-[#854d0e]/50 font-journal">
          <button
            type="button"
            @click="emit('close')"
            class="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs text-stone-400 hover:text-stone-200 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="min-h-[42px] px-4 py-1.5 bg-gradient-to-r from-[#b45309] to-[#78350f] hover:from-[#d97706] hover:to-[#92400e] border border-[#fbbf24]/80 text-[#fef3c7] rounded-xl text-xs font-bold transition shadow-[0_2px_8px_rgba(180,83,9,0.5)] cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check class="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
