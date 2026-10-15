import type { SessionData } from '~/composables/useAirGuardian'

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function getMarkerColor(avgPpm: number | null | undefined): string {
  if (!avgPpm || avgPpm < 650) return '#10b981'
  if (avgPpm < 1000) return '#f59e0b'
  return '#ef4444'
}

export function buildLocationPinHtml(color: string, isSelected: boolean): string {
  return `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
      <div class="w-4 h-4 rounded-full border-2 border-amber-300 shadow-[0_0_10px_${color}]" style="background-color: ${color}"></div>
      ${isSelected ? `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
    </div>
  `
}

export function buildLocationPopupHtml(s: SessionData, color: string): string {
  return `
    <div style="background: #18120b; color: #fef3c7; padding: 6px 10px; border-radius: 10px; border: 1.5px solid #854d0e; font-family: monospace; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.9);">
      <strong style="color: #fbbf24; display: block; font-size: 12px; font-family: 'Special Elite', cursive;">${escapeHtml(s.name)}</strong>
      <div>Calidad: <span style="color: ${color}; font-weight: bold;">${s.avg_ppm ? Math.round(s.avg_ppm) : 410} PPM</span></div>
      <div style="font-size: 9px; color: #a8a29e;">Muestras registradas: ${s.total_samples || 0}</div>
    </div>
  `
}

export function renderLeafletSessionMarkers(
  L: any,
  markersGroup: any,
  sessions: SessionData[],
  selectedSessionId: string | null | undefined,
  onSelect: (id: string) => void
) {
  if (!markersGroup) return
  markersGroup.clearLayers()

  sessions.slice(0, 25).forEach((s) => {
    const sId = s.id || (s as any).session_id
    const color = getMarkerColor(s.avg_ppm)
    const isSelected = !!sId && sId === selectedSessionId

    const customIcon = L.divIcon({
      html: buildLocationPinHtml(color, isSelected),
      className: 'custom-location-pin',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    })

    const marker = L.marker([s.latitude, s.longitude], { icon: customIcon })
    if (sId) marker.on('click', () => onSelect(sId))
    marker.bindPopup(buildLocationPopupHtml(s, color))
    markersGroup.addLayer(marker)
  })
}

export function fitOrFlyLeafletMap(
  leafletMap: any,
  sessions: SessionData[],
  selectedSessionId: string | null | undefined,
  isExpanded: boolean
) {
  if (!leafletMap) return
  leafletMap.invalidateSize()

  if (selectedSessionId) {
    const s = sessions.find(x => (x.id || (x as any).session_id) === selectedSessionId)
    if (s && typeof s.latitude === 'number' && typeof s.longitude === 'number') {
      leafletMap.flyTo([s.latitude, s.longitude], isExpanded ? 16 : 14, { duration: 0.5 })
      return
    }
  }

  const validCoords = sessions
    .filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map(s => [s.latitude, s.longitude] as [number, number])

  if (validCoords.length > 1) {
    try {
      leafletMap.fitBounds(validCoords, { padding: [40, 40], maxZoom: 16, animate: true })
    } catch {}
  } else if (validCoords.length === 1) {
    leafletMap.flyTo(validCoords[0], isExpanded ? 16 : 14, { duration: 0.5 })
  }
}
