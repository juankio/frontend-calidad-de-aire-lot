<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, X, Navigation, Check } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3002'

const name = ref(''), description = ref(''), latitude = ref(4.1420), longitude = ref(-73.6266), isSubmitting = ref(false)

function obtainCurrentGps() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      latitude.value = parseFloat(pos.coords.latitude.toFixed(6))
      longitude.value = parseFloat(pos.coords.longitude.toFixed(6))
    }, () => alert('No se pudo obtener la ubicación GPS del dispositivo.'))
  }
}

async function submitForm() {
  if (!name.value || name.value.trim().length < 3) return
  isSubmitting.value = true
  try {
    const res = await fetch(`${apiBase}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), description: description.value.trim(), latitude: Number(latitude.value), longitude: Number(longitude.value), radius_meters: 50, start_time: Date.now(), device_id: 'air-guardian-01' })
    })
    if (res.ok) { name.value = ''; description.value = ''; emit('created'); emit('close') }
  } catch (err) {
    console.error('Error al guardar lugar:', err)
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div class="bg-gradient-to-b from-[#1c150c] via-[#150f08] to-[#0d0a07] border-2 border-[#854d0e] rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.95)] space-y-3.5 relative select-none">
      <LabScrew class="absolute top-2 left-2 pointer-events-none" :rotation="24" />
      <LabScrew class="absolute top-2 right-2 pointer-events-none" :rotation="-38" />
      <LabScrew class="absolute bottom-2 left-2 pointer-events-none" :rotation="70" />
      <LabScrew class="absolute bottom-2 right-2 pointer-events-none" :rotation="-15" />
      
      <!-- Cabecera Steampunk -->
      <div class="flex items-center justify-between border-b border-[#854d0e]/50 pb-2 px-1 sm:px-2">
        <h3 class="text-xs sm:text-sm font-journal font-bold text-[#fbbf24] flex items-center gap-1.5">
          <MapPin class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Marcar Nuevo Punto de Medición</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          aria-label="Cerrar modal"
          class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-amber-200 hover:bg-stone-900/60 cursor-pointer transition active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-3 font-journal px-0.5">
        <div>
          <label class="block text-[11px] font-bold text-amber-200 mb-1">Nombre del lugar (mínimo 3 caracteres)</label>
          <input
            v-model="name"
            type="text"
            placeholder="Ej: Laboratorio de Electrónica"
            required
            minlength="3"
            maxlength="120"
            class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono"
          >
        </div>

        <div>
          <label class="block text-[11px] font-bold text-amber-200 mb-1">Observaciones del entorno</label>
          <input
            v-model="description"
            type="text"
            placeholder="Ej: Ventanas cerradas, 20 estudiantes en clase"
            maxlength="500"
            class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono"
          >
        </div>

        <div class="grid grid-cols-2 gap-2 font-mono">
          <div>
            <label class="block text-[10.5px] font-journal text-stone-300 mb-1">Latitud GPS</label>
            <input
              v-model="latitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white focus:border-[#fbbf24] focus:outline-none"
            >
          </div>
          <div>
            <label class="block text-[10.5px] font-journal text-stone-300 mb-1">Longitud GPS</label>
            <input
              v-model="longitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white focus:border-[#fbbf24] focus:outline-none"
            >
          </div>
        </div>

        <button
          type="button"
          @click="obtainCurrentGps"
          class="w-full min-h-[42px] py-2 bg-[#2a1d10] hover:bg-[#3d2a17] border border-[#854d0e]/70 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Navigation class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Obtener ubicación GPS actual</span>
        </button>

        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-[#854d0e]/40 font-journal">
          <button
            type="button"
            @click="emit('close')"
            class="min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs font-journal text-stone-400 hover:text-white cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="min-h-[42px] px-4 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 border border-emerald-500/80 text-emerald-100 rounded-xl text-xs font-bold font-journal transition shadow cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check class="w-3.5 h-3.5 shrink-0" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Punto' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>