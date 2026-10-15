import type {
  SessionData,
  AnalyticsSummary,
  ExperimentComparisonResult
} from './types'
import {
  sessions,
  selectedSessionId,
  history,
  telemetry,
  resolveApiConfig
} from './state'

export async function fetchHistory(sessionId?: string | null) {
  const { apiBase } = resolveApiConfig()
  try {
    let url = `${apiBase}/api/telemetry/history?limit=50`
    if (sessionId) url += `&session_id=${encodeURIComponent(sessionId)}`
    const res = await fetch(url)
    if (res.ok) {
      const json = (await res.json()) as {
        success?: boolean
        data?: Array<{ timestamp?: number; ppm?: number; predicted_ppm_15m?: number }>
      }
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        history.value = json.data.map((item) => ({
          timestamp: Number(item.timestamp),
          ppm: Number(item.ppm),
          predicted_ppm_15m: Number(item.predicted_ppm_15m || item.ppm)
        }))
      }
    }
  } catch (err) {
    console.error('Error fetching history', err)
  }
}

export async function fetchSessions() {
  const { apiBase } = resolveApiConfig()
  try {
    const res = await fetch(`${apiBase}/api/sessions`)
    if (res.ok) {
      const json = (await res.json()) as { success?: boolean; data?: SessionData[] }
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        sessions.value = json.data.map((item) => ({
          ...item,
          id: String(item.session_id || item.id || `session-${item.start_time || Math.random()}`)
        }))
      }
    }
  } catch (err) {
    console.error('Error fetching sessions', err)
  }
}

export function selectSession(id: string) {
  if (!id || id === 'undefined') return
  if (selectedSessionId.value === id) {
    selectedSessionId.value = null
    fetchHistory(null)
  } else {
    selectedSessionId.value = id
    fetchHistory(id)
  }
}

export async function createSession(data: Partial<SessionData>): Promise<boolean> {
  if (!data.name || data.name.trim().length < 3) return false
  const { apiBase } = resolveApiConfig()
  try {
    const res = await fetch(`${apiBase}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name.trim(),
        description: (data.description || '').trim(),
        latitude: Number(data.latitude ?? 4.142),
        longitude: Number(data.longitude ?? -73.6266),
        radius_meters: Number(data.radius_meters ?? 50),
        start_time: data.start_time ?? Date.now(),
        device_id: telemetry.value.device_id || 'air-guardian-01'
      })
    })
    if (res.ok) {
      await fetchSessions()
      return true
    }
    return false
  } catch (err) {
    console.error('Error creating session', err)
    return false
  }
}

export async function updateSession(id: string, data: Partial<SessionData>): Promise<boolean> {
  if (!id) return false
  const { apiBase } = resolveApiConfig()
  try {
    const payload: Partial<SessionData> = {}
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.description !== undefined) payload.description = data.description.trim()
    if (data.latitude !== undefined) payload.latitude = Number(data.latitude)
    if (data.longitude !== undefined) payload.longitude = Number(data.longitude)
    if (data.radius_meters !== undefined) payload.radius_meters = Number(data.radius_meters)

    const res = await fetch(`${apiBase}/api/sessions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const idx = sessions.value.findIndex((s) => (s.id || s.session_id) === id)
    if (idx !== -1) {
      const updated = [...sessions.value]
      updated[idx] = { ...updated[idx], ...payload }
      sessions.value = updated
    }

    if (res.ok) {
      await fetchSessions()
      return true
    }
    return false
  } catch (err) {
    console.error('Error updating session', err)
    const idx = sessions.value.findIndex((s) => (s.id || s.session_id) === id)
    if (idx !== -1) sessions.value[idx] = { ...sessions.value[idx], ...data }
    return false
  }
}

export async function deleteSession(id: string): Promise<boolean> {
  if (!id) return false
  const { apiBase } = resolveApiConfig()
  try {
    if (selectedSessionId.value === id) {
      selectedSessionId.value = null
      await fetchHistory(null)
    }
    sessions.value = sessions.value.filter((s) => (s.id || s.session_id) !== id)
    const res = await fetch(`${apiBase}/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchSessions()
      if (selectedSessionId.value === id) {
        selectedSessionId.value = null
        await fetchHistory(null)
      }
      return true
    }
    return false
  } catch (err) {
    console.error('Error deleting session', err)
    return false
  }
}

export async function fetchAnalyticsSummary(sessionId?: string | null): Promise<AnalyticsSummary | null> {
  const { apiBase } = resolveApiConfig()
  try {
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
    const res = await fetch(`${apiBase}/api/analytics/summary${query}`)
    if (res.ok) {
      const json = (await res.json()) as { success?: boolean; data?: AnalyticsSummary }
      if (json.success && json.data) return json.data
    }
  } catch {}
  return null
}

export function compareSessions(sessionAId: string, sessionBId: string): ExperimentComparisonResult {
  const sessionA = sessions.value.find((s) => (s.id || s.session_id) === sessionAId) ?? null
  const sessionB = sessions.value.find((s) => (s.id || s.session_id) === sessionBId) ?? null
  return {
    sessionA,
    sessionB,
    deltaAvgPpm: Number(((sessionA?.avg_ppm ?? 0) - (sessionB?.avg_ppm ?? 0)).toFixed(1)),
    deltaMaxPpm: Number(((sessionA?.max_ppm ?? 0) - (sessionB?.max_ppm ?? 0)).toFixed(1))
  }
}

export function exportDatasetUrl(
  layer: 'bronze' | 'silver' | 'gold' = 'silver',
  format: 'csv' | 'json' = 'csv'
): string {
  const { apiBase } = resolveApiConfig()
  return `${apiBase}/api/analytics/export/${layer}?format=${format}`
}
