import type { RawTelemetryPayload } from './types'
import {
  telemetry, wsConnected, usbConnected, operationMode, isSimulatorRunning,
  lastPacketTime, lastPacketSource, nowTick, runtimeState, resolveApiConfig
} from './state'
import { mergeTelemetryLayers, applyBackendSample } from './parsers'

export function disableBackendSimulator() {
  const { apiBase } = resolveApiConfig()
  fetch(`${apiBase}/api/simulate/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enable: false })
  }).catch(() => {})
}

export function forwardUsbTelemetryToBackend() {
  const { apiBase } = resolveApiConfig()
  const t = telemetry.value
  const payload = {
    device_id: t.device_id || 'air-guardian-01',
    timestamp: Math.floor(Date.now()),
    ppm: Math.max(0, Math.min(10000, Number(t.ppm) || 400)),
    co_ppm: Math.max(0, Math.min(2000, Number(t.co_ppm) || 0)),
    temperature: Math.max(-40, Math.min(85, Number(t.temperature) || 24)),
    humidity: Math.max(0, Math.min(100, Number(t.humidity) || 50)),
    delta_ppm: Number(t.delta_ppm_1m) || 0,
    raw_adc: Math.max(0, Math.min(4095, Math.round(Number(t.raw_adc) || 0))),
    raw_adc7: Math.round(Number(t.raw_adc7 ?? t.mq7_raw) || 0),
    mpu_connected: Boolean(t.mpu_connected),
    eye_x: Math.abs(Number(t.roll) || 0) > 90
      ? Number(((Number(t.roll) || 0) / 9.0).toFixed(2))
      : (Number(t.eye_x) || 0),
    eye_y: Number(t.eye_y) || 0,
    pitch: Number(t.pitch) || 0,
    roll: Number(t.roll) || 0,
    ax: Number(t.ax) || 0,
    ay: Number(t.ay) || 0,
    az: Number(t.az ?? 9.8),
    is_shaking: Boolean(t.is_shaking),
    emotion: t.device_emotion || 'OPTIMAL',
    view_mode: t.view_mode || 'FACE',
    free_heap: Number(t.free_heap) || 184320,
    uptime_s: Number(t.uptime_s) || 0,
    offline_pending: Number(t.offline_pending) || 0
  }

  fetch(`${apiBase}/api/telemetry/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {})
}

export function ingestUsbSerialStatus(statusPayload: RawTelemetryPayload) {
  if (!statusPayload || typeof statusPayload !== 'object') return

  usbConnected.value = true
  if (operationMode.value !== 'LIVE') {
    operationMode.value = 'LIVE'
    isSimulatorRunning.value = false
    if (runtimeState.localMockTimer) {
      clearInterval(runtimeState.localMockTimer)
      runtimeState.localMockTimer = null
    }
  }

  const now = Date.now()
  lastPacketSource.value = 'HARDWARE'
  lastPacketTime.value = now
  nowTick.value = now
  applyBackendSample({ ...statusPayload, timestamp: now, source: 'hardware' }, true)

  if (now - runtimeState.lastUsbIngestSentAt >= 1500) {
    runtimeState.lastUsbIngestSentAt = now
    if (runtimeState.usbIngestDebounceTimer) {
      clearTimeout(runtimeState.usbIngestDebounceTimer)
      runtimeState.usbIngestDebounceTimer = null
    }
    forwardUsbTelemetryToBackend()
  } else if (!runtimeState.usbIngestDebounceTimer) {
    const delayMs = Math.max(100, 1500 - (now - runtimeState.lastUsbIngestSentAt))
    runtimeState.usbIngestDebounceTimer = setTimeout(() => {
      runtimeState.usbIngestDebounceTimer = null
      runtimeState.lastUsbIngestSentAt = Date.now()
      forwardUsbTelemetryToBackend()
    }, delayMs)
  }
}

export function markUsbDisconnected() {
  usbConnected.value = false
  if (runtimeState.usbIngestDebounceTimer) {
    clearTimeout(runtimeState.usbIngestDebounceTimer)
    runtimeState.usbIngestDebounceTimer = null
  }
}

export function connectWebSocket() {
  if (typeof window === 'undefined') return
  const { wsBase } = resolveApiConfig()

  try {
    if (runtimeState.socket) {
      runtimeState.socket.onopen = null
      runtimeState.socket.onmessage = null
      runtimeState.socket.onerror = null
      runtimeState.socket.onclose = null
      runtimeState.socket.close()
    }

    const ws = new WebSocket(wsBase)
    runtimeState.socket = ws
    ws.onopen = () => { wsConnected.value = true }
    ws.onerror = () => { wsConnected.value = false }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as Record<string, any>
        const msgType = String(msg.type || msg.event || '').toUpperCase()
        const rawContainer = msg.payload ?? msg.data ?? (msg.raw || msg.processed ? msg : null)
        if ((msgType === 'TELEMETRY_UPDATE' || msgType === 'TELEMETRY_BATCH') && rawContainer) {
          if (usbConnected.value) return
          const item = Array.isArray(rawContainer) ? rawContainer[rawContainer.length - 1] : rawContainer
          if (!item) return

          const combinedSample = mergeTelemetryLayers(item, item.raw, item.processed, item.prediction)
          if (operationMode.value === 'LIVE' && combinedSample.source === 'simulator') return

          const rawTs = Number(combinedSample.timestamp || 0)
          if (rawTs > 946684800000 && (runtimeState.lastSeenServerTimestamp === null || rawTs > runtimeState.lastSeenServerTimestamp)) {
            runtimeState.lastSeenServerTimestamp = rawTs
          }
          lastPacketTime.value = Date.now()
          lastPacketSource.value = 'HARDWARE'
          nowTick.value = Date.now()
          applyBackendSample(combinedSample, true)
        }
      } catch (err) {
        console.error('Error parsing WS message', err)
      }
    }

    ws.onclose = () => {
      wsConnected.value = false
      if (operationMode.value === 'LIVE' && !runtimeState.reconnectTimer) {
        runtimeState.reconnectTimer = setTimeout(() => {
          runtimeState.reconnectTimer = null
          connectWebSocket()
        }, 3000)
      }
    }
  } catch {
    wsConnected.value = false
  }
}

export async function fetchLiveTelemetry() {
  if (usbConnected.value) return
  const { apiBase } = resolveApiConfig()
  try {
    const res = await fetch(`${apiBase}/api/telemetry/live`)
    if (!res.ok) return
    const json = (await res.json()) as { success?: boolean; data?: RawTelemetryPayload }
    if (!json.success || !json.data) return

    const sample = mergeTelemetryLayers(json.data, json.data.raw, json.data.processed, json.data.prediction)
    if (operationMode.value === 'LIVE' && sample.source === 'simulator') return

    const rawTs = Number(sample.timestamp || 0)
    const ts = rawTs > 946684800000 ? rawTs : 0
    const age = ts > 0 ? Math.max(0, Date.now() - ts) : Infinity
    const isFirstSeen = runtimeState.lastSeenServerTimestamp === null
    const isFreshPacket = ts > 0 && (age < 8000 || (!isFirstSeen && ts !== runtimeState.lastSeenServerTimestamp))

    if (ts > 0 && (runtimeState.lastSeenServerTimestamp === null || ts > runtimeState.lastSeenServerTimestamp)) {
      runtimeState.lastSeenServerTimestamp = ts
    }

    if (isFreshPacket) {
      lastPacketTime.value = Date.now()
      lastPacketSource.value = 'HARDWARE'
      nowTick.value = Date.now()
      applyBackendSample({ ...sample, timestamp: ts }, true)
    } else if (isFirstSeen) {
      applyBackendSample({ ...sample, timestamp: ts || Date.now() }, false)
    }
  } catch {}
}
