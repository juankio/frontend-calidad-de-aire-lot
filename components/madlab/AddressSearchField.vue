<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Search, Loader2 } from 'lucide-vue-next'

interface FoundPayload {
  latitude: number
  longitude: number
  displayName: string
}

const emit = defineEmits<{ (e: 'found', payload: FoundPayload): void }>()

const query = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')
const displayName = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let lastRequestAt = 0

async function search() {
  const q = query.value.trim()
  if (q.length < 3) {
    status.value = 'error'
    message.value = 'Escribe al menos 3 caracteres'
    return
  }
  if (status.value === 'loading') return
  const wait = Math.max(0, 1000 - (Date.now() - lastRequestAt))
  if (wait > 0) await new Promise<void>((resolve) => setTimeout(resolve, wait))
  status.value = 'loading'
  message.value = ''
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    lastRequestAt = Date.now()
    if (!Array.isArray(data) || data.length === 0) {
      status.value = 'error'
      message.value = 'No se encontró la dirección'
      displayName.value = ''
      return
    }
    const first = data[0]
    const lat = parseFloat(first.lat)
    const lon = parseFloat(first.lon)
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      status.value = 'error'
      message.value = 'Resultado inválido'
      return
    }
    displayName.value = first.display_name
    status.value = 'success'
    message.value = `Ubicación encontrada: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    emit('found', { latitude: lat, longitude: lon, displayName: first.display_name })
  } catch (err) {
    status.value = 'error'
    message.value = 'Error al buscar la dirección'
    console.error(err)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    void search()
  }
}

watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (query.value.trim().length >= 3) void search()
  }, 600)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-[11px] font-bold text-slate-200 mb-1">Dirección / lugar</label>
    <div class="flex gap-2">
      <input
        v-model="query"
        type="text"
        placeholder="Ej: Cra 22 No. 7 – 06 Sur, La Rosita, Villavicencio"
        @keydown="onKeydown"
        class="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono"
      >
      <button
        type="button"
        @click="search"
        :disabled="status === 'loading'"
        class="min-h-[40px] px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
      >
        <Loader2 v-if="status === 'loading'" class="w-3.5 h-3.5 animate-spin shrink-0" />
        <Search v-else class="w-3.5 h-3.5 shrink-0" />
        <span>Buscar</span>
      </button>
    </div>
    <p v-if="status === 'success'" class="text-[11px] text-emerald-400 font-mono">
      {{ message }}<span v-if="displayName" class="block text-slate-400 truncate">{{ displayName }}</span>
    </p>
    <p v-if="status === 'error'" class="text-[11px] text-amber-400 font-mono">{{ message }}</p>
  </div>
</template>