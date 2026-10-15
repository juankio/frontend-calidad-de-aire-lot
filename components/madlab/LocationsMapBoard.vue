<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject, type Ref } from 'vue'
import { Plus, Compass, MapPin } from 'lucide-vue-next'
import MadLabContainer from './MadLabContainer.vue'
import LocationLogList from './LocationLogList.vue'
import type { SessionData } from '~/composables/useAirGuardian'

const props = withDefaults(defineProps<{
  sessions?: SessionData[]
  selectedSessionId?: string | null
}>(), {
  sessions: () => [],
  selectedSessionId: null
})

const emit = defineEmits<{
  (e: 'selectSession', id: string): void
  (e: 'openCreateModal'): void
  (e: 'editSession', session: SessionData): void
  (e: 'deleteSession', session: SessionData): void
}>()

const isContainerExpanded = ref(false)

const mapContainer = ref<HTMLElement | null>(null)
let leafletMap: any = null
let markersGroup: any = null
const isMapReady = ref(false)

const selectedSession = computed(() => {
  if (!props.sessions || props.sessions.length === 0) return null
  if (!props.selectedSessionId) return props.sessions[0]
  return props.sessions.find(s => (s.id || (s as any).session_id) === props.selectedSessionId) || props.sessions[0]
})

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getMarkerColor(avgPpm: number | null | undefined) {
  if (!avgPpm || avgPpm < 650) return '#10b981' // Esmeralda - Óptimo
  if (avgPpm < 1000) return '#f59e0b'          // Ámbar - Alerta Moderada
  return '#ef4444'                              // Rojo - Crítico
}

async function initLeaflet() {
  if (typeof window === 'undefined' || !mapContainer.value) return

  try {
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')

    const defaultLat = props.sessions[0]?.latitude ?? 4.1420
    const defaultLng = props.sessions[0]?.longitude ?? -73.6266

    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }

    leafletMap = L.map(mapContainer.value, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    })

    leafletMap.whenReady(() => {
      leafletMap.invalidateSize()
    })

    // Capa de mapa táctica nocturna (Fallback táctico limpio OpenStreetMap sin API key ni filtros destructivos)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'clean-dark-tactical-tiles'
    }).addTo(leafletMap)

    markersGroup = L.layerGroup().addTo(leafletMap)
    isMapReady.value = true
    renderMarkers(L)
  } catch (err) {
    console.warn('Modo local de mapa activo:', err)
  }
}

async function renderMarkers(LModule?: any) {
  if (!leafletMap || !markersGroup) return
  const L = LModule || (await import('leaflet'))

  markersGroup.clearLayers()

  const displaySessions = props.sessions.slice(0, 25)

  displaySessions.forEach((s) => {
    const sId = s.id || (s as any).session_id
    const color = getMarkerColor(s.avg_ppm)
    const isSelected = !!sId && sId === props.selectedSessionId

    const iconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
        <div class="w-4 h-4 rounded-full border-2 border-amber-300 shadow-[0_0_10px_${color}]" style="background-color: ${color}"></div>
        ${isSelected ? `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
      </div>
    `

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-location-pin',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    })

    const marker = L.marker([s.latitude, s.longitude], { icon: customIcon })
    if (sId) {
      marker.on('click', () => emit('selectSession', sId))
    }

    const popupHtml = `
      <div style="background: #18120b; color: #fef3c7; padding: 6px 10px; border-radius: 10px; border: 1.5px solid #854d0e; font-family: monospace; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.9);">
        <strong style="color: #fbbf24; display: block; font-size: 12px; font-family: 'Special Elite', cursive;">${escapeHtml(s.name)}</strong>
        <div>Calidad: <span style="color: ${color}; font-weight: bold;">${s.avg_ppm ? Math.round(s.avg_ppm) : 410} PPM</span></div>
        <div style="font-size: 9px; color: #a8a29e;">Muestras registradas: ${s.total_samples || 0}</div>
      </div>
    `
    marker.bindPopup(popupHtml)
    markersGroup.addLayer(marker)
  })
}

function handleSelectSession(s: SessionData) {
  const sId = s.id || (s as any).session_id
  if (!sId) return
  emit('selectSession', sId)
  if (leafletMap && s.latitude && s.longitude) {
    leafletMap.flyTo([s.latitude, s.longitude], isContainerExpanded.value ? 16 : 15, { duration: 0.8 })
  }
}

function invalidateAndFitMap() {
  if (!leafletMap) return
  leafletMap.invalidateSize()

  if (props.selectedSessionId) {
    const s = props.sessions.find(x => (x.id || (x as any).session_id) === props.selectedSessionId)
    if (s && typeof s.latitude === 'number' && typeof s.longitude === 'number') {
      leafletMap.flyTo([s.latitude, s.longitude], isContainerExpanded.value ? 16 : 14, { duration: 0.5 })
      return
    }
  }

  const validCoords = props.sessions
    .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map(s => [s.latitude, s.longitude] as [number, number])

  if (validCoords.length > 1) {
    try {
      leafletMap.fitBounds(validCoords, { padding: [40, 40], maxZoom: 16, animate: true })
    } catch {
      // fallback
    }
  } else if (validCoords.length === 1) {
    leafletMap.flyTo(validCoords[0], isContainerExpanded.value ? 16 : 14, { duration: 0.5 })
  }
}

watch(isContainerExpanded, async () => {
  await nextTick()
  invalidateAndFitMap()
  setTimeout(invalidateAndFitMap, 150)
  setTimeout(invalidateAndFitMap, 420)
})

function handleResize() {
  if (leafletMap) {
    leafletMap.invalidateSize()
  }
}

watch(() => props.sessions, () => {
  nextTick(() => renderMarkers())
}, { deep: true })

watch(() => props.selectedSessionId, (newId) => {
  if (!newId || !leafletMap) return
  const s = props.sessions.find(x => (x.id || (x as any).session_id) === newId)
  if (s && s.latitude && s.longitude) {
    leafletMap.flyTo([s.latitude, s.longitude], isContainerExpanded.value ? 16 : 15, { duration: 0.8 })
    renderMarkers()
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    initLeaflet()
  }, 100)
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize()
  }, 300)
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize()
  }, 600)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<template>
  <MadLabContainer v-model:expanded="isContainerExpanded" no-padding class="flex-1 min-h-0 h-full">
    <div
      class="p-2 sm:p-2.5 w-full h-full flex flex-col justify-between gap-1.5 select-none relative"
      :class="isContainerExpanded ? 'overflow-y-auto max-h-full' : 'overflow-hidden flex-1 min-h-0'"
    >
      <!-- Cabecera de Mapas & Cartografía Táctica -->
      <div class="flex items-center justify-between pb-1 border-b border-cyan-500/20 shrink-0 px-1 font-mono">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <Compass class="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <span class="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-100 uppercase">CARTOGRAFÍA & GPS</span>
            <span class="text-[8px] text-cyan-400/80 ml-1">({{ sessions.length }} pts)</span>
          </div>
        </div>
        <button
          @click="emit('openCreateModal')"
          class="px-2 py-0.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 text-[8.5px] sm:text-[9px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer active:scale-95 transition-all"
        >
          <MapPin class="w-2.5 h-2.5 text-emerald-400" />
          <span>Marcar Punto</span>
        </button>
      </div>

      <!-- Contenedor del Mapa Táctico con Marco Mecha -->
      <div
        class="w-full rounded-lg overflow-hidden border border-cyan-500/25 relative shadow-[0_8px_24px_rgba(0,0,0,0.7)] bg-slate-900/90 transition-all duration-300"
        :class="isContainerExpanded ? 'h-[55vh] min-h-[460px]' : 'flex-1 min-h-[110px]'"
      >
        <div ref="mapContainer" class="w-full h-full z-10" />

        <div class="absolute top-1.5 right-1.5 z-20 pointer-events-none">
          <span class="px-1.5 py-0.2 rounded bg-slate-950/90 border border-cyan-500/40 text-[7.5px] font-mono text-cyan-300 shadow backdrop-blur-xs">
            OSM DARK RADAR
          </span>
        </div>

        <div v-if="selectedSession" class="absolute bottom-1.5 left-1.5 z-20 pointer-events-none px-1.5 py-0.2 rounded bg-slate-950/90 border border-cyan-500/40 text-[7.5px] font-mono text-cyan-200">
          Lat: {{ selectedSession.latitude.toFixed(3) }}° | Lng: {{ selectedSession.longitude.toFixed(3) }}°
        </div>
      </div>

      <!-- Bitácora "Lugares Donde Estuvimos" modularizada -->
      <LocationLogList
        :sessions="sessions"
        :selected-session-id="selectedSessionId"
        @select-session="handleSelectSession"
        @edit-session="(s) => emit('editSession', s)"
        @delete-session="(s) => emit('deleteSession', s)"
      />
    </div>
  </MadLabContainer>
</template>

<style>
.custom-location-pin {
  background: transparent !important;
  border: none !important;
}
.leaflet-popup-content-wrapper, .leaflet-popup-tip {
  background: #090d16 !important;
  color: #e2e8f0 !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.9) !important;
  border: 1px solid rgba(6, 182, 212, 0.4) !important;
  font-family: 'JetBrains Mono', monospace !important;
}
.clean-dark-tactical-tiles {
  filter: brightness(0.65) invert(1) contrast(1.15) hue-rotate(185deg) saturate(0.35) !important;
}
</style>
