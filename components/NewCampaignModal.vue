<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, X, Navigation, Check } from 'lucide-vue-next'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'

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
  if (!name.value) return
  isSubmitting.value = true
  try {
    const res = await fetch(`${apiBase}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, description: description.value, latitude: Number(latitude.value), longitude: Number(longitude.value), radius_meters: 50, start_time: Date.now(), device_id: 'air-guardian-01' })
    })
    if (res.ok) { name.value = ''; description.value = ''; emit('created'); emit('close') }
  } catch (err) {
    console.error('Error al guardar lugar:', err)
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-gradient-to-b from-[#1c150c] to-[#0d0a07] border-2 border-[#854d0e] rounded-2xl w-full max-w-md p-5 shadow-[0_16px_36px_rgba(0,0,0,0.9)] space-y-3.5 relative select-none">
      <div class="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#d97706] border border-[#78350f]" />
      <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d97706] border border-[#78350f]" />
      
      <!-- Cabecera -->
      <div class="flex items-center justify-between border-b border-[#854d0e]/50 pb-2.5">
        <h3 class="text-sm font-journal font-bold text-[#fbbf24] flex items-center gap-1.5">
          <MapPin class="w-4 h-4 text-emerald-400" />
          <span>📍 Marcar Nuevo Punto de Medición</span>
        </h3>
        <button @click="emit('close')" class="text-stone-400 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-3 font-journal">
        <div>
          <label class="block text-xs font-bold text-amber-200 mb-1">Nombre del Lugar (Ej: Mi Cuarto, Cocina, Parque)</label>
          <input v-model="name" type="text" placeholder="Ej: Cocina de la Casa" required class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono">
        </div>

        <div>
          <label class="block text-xs font-bold text-amber-200 mb-1">Notas de lo que había allí</label>
          <input v-model="description" type="text" placeholder="Ej: Ventanas cerradas, cocinando con gas" class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono">
        </div>

        <div class="grid grid-cols-2 gap-2 font-mono">
          <div>
            <label class="block text-[11px] font-journal text-stone-300 mb-1">Latitud GPS</label>
            <input v-model="latitude" type="number" step="0.0001" required class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#fbbf24] focus:outline-none">
          </div>
          <div>
            <label class="block text-[11px] font-journal text-stone-300 mb-1">Longitud GPS</label>
            <input v-model="longitude" type="number" step="0.0001" required class="w-full bg-[#080604] border border-[#854d0e]/60 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#fbbf24] focus:outline-none">
          </div>
        </div>

        <button type="button" @click="obtainCurrentGps" class="w-full py-2 bg-[#2a1d10] hover:bg-[#3d2a17] border border-[#854d0e]/70 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98">
          <Navigation class="w-3.5 h-3.5 text-emerald-400" />
          <span>📍 Usar mi GPS Actual</span>
        </button>

        <div class="flex justify-end gap-2 pt-2 border-t border-[#854d0e]/40 font-mono">
          <button type="button" @click="emit('close')" class="px-3 py-1.5 rounded-xl text-xs font-journal text-stone-400 hover:text-white cursor-pointer">Cancelar</button>
          <button type="submit" :disabled="isSubmitting" class="px-4 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 border border-emerald-500/80 text-emerald-100 rounded-xl text-xs font-bold font-journal transition shadow cursor-pointer active:scale-95 flex items-center gap-1.5">
            <Check class="w-3.5 h-3.5" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Lugar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>