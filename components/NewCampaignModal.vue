<script setup lang="ts">
import { ref } from 'vue'
import { MapPin, X, Navigation, Check } from 'lucide-vue-next'
import AddressSearchField from './madlab/AddressSearchField.vue'

declare function resolveApiConfig(): { apiBase: string; wsBase: string }

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()

const apiBase = (() => {
  const fallback = 'http://localhost:3002'
  try {
    if (typeof resolveApiConfig === 'function') {
      return resolveApiConfig().apiBase.replace(/\/+$/, '') || fallback
    }
  } catch { }
  try {
    const config = useRuntimeConfig()
    return String(config.public?.apiBase || fallback).replace(/\/+$/, '') || fallback
  } catch {
    return fallback
  }
})()

const name = ref(''), description = ref(''), latitude = ref(4.1420), longitude = ref(-73.6266), isSubmitting = ref(false)

function onAddressFound(payload: { latitude: number; longitude: number; displayName: string }) {
  latitude.value = payload.latitude
  longitude.value = payload.longitude
}

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
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div class="bg-[#070b14]/95 border border-cyan-500/40 rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] space-y-3.5 relative select-none font-mono">
      <!-- Esquinas Tácticas HUD -->
      <svg class="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 13V3C1 1.89543 1.89543 1 3 1H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 13V3C13 1.89543 12.1046 1 11 1H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 1V11C1 12.1046 1.89543 13 3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 1V11C13 12.1046 12.1046 13 11 13H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      
      <!-- Cabecera Táctica -->
      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2 px-1 sm:px-2">
        <h3 class="text-xs sm:text-sm font-scifi font-bold text-white flex items-center gap-1.5">
          <MapPin class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>MARCAR NUEVO PUNTO DE MEDICIÓN</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          aria-label="Cerrar modal"
          class="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-200 hover:bg-slate-900 cursor-pointer transition active:scale-90"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-3 font-mono px-0.5">
        <AddressSearchField @found="onAddressFound" />

        <div>
          <label class="block text-[11px] font-bold text-slate-200 mb-1">Nombre del lugar (mínimo 3 caracteres)</label>
          <input
            v-model="name"
            type="text"
            placeholder="Ej: Laboratorio de Electrónica"
            required
            minlength="3"
            maxlength="120"
            class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono"
          >
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-200 mb-1">Observaciones del entorno</label>
          <input
            v-model="description"
            type="text"
            placeholder="Ej: Ventanas cerradas, 20 estudiantes en clase"
            maxlength="500"
            class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono"
          >
        </div>

        <div class="grid grid-cols-2 gap-2 font-mono">
          <div>
            <label class="block text-[10.5px] text-slate-400 mb-1">Latitud GPS</label>
            <input
              v-model="latitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
            >
          </div>
          <div>
            <label class="block text-[10.5px] text-slate-400 mb-1">Longitud GPS</label>
            <input
              v-model="longitude"
              type="number"
              step="0.0001"
              required
              class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
            >
          </div>
        </div>

        <button
          type="button"
          @click="obtainCurrentGps"
          class="w-full min-h-[40px] py-2 bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Navigation class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Obtener ubicación GPS actual</span>
        </button>

        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-cyan-500/20 font-mono">
          <button
            type="button"
            @click="emit('close')"
            class="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="min-h-[40px] px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check class="w-3.5 h-3.5 shrink-0" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Punto' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>