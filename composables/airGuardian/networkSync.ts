import type { RawTelemetryPayload } from './types'
import {
  telemetry, wsConnected, localLinkInfo, operationMode, isSimulatorRunning,
  lastPacketTime, lastPacketSource, nowTick, runtimeState, resolveApiConfig,
  motionState
} from './state'
import { mergeTelemetryLayers, applyBackendSample } from './parsers'

const motionFrameTimes: number[] = []

export function disableBackendSimulator() {
  const { apiBase } = resolveApiConfig()
  fetch(`${apiBase}/api/simulate/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enable: false })
  }).catch(() => {})
}

export function ingestUsbSerialStatus(statusPayload: RawTelemetryPayload) {
  if (!statusPayload || typeof statusPayload !== 'object') return

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
}

export function markUsbDisconnected() {
  // no-op: usbConnected is derived from localLinkInfo
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
        const msg = JSON.parse(event.data) as Record<string, unknown>
        const msgType = String(msg.type || msg.event || '').toUpperCase()

        if (msgType === 'MOTION_UPDATE') {
          const payload = (msg.payload ?? msg.data ?? msg) as Record<string, unknown> | null
          if (payload && typeof payload === 'object') {
            const now = Date.now()
            motionFrameTimes.push(now)
            const cutoff = now - 1000
            while (motionFrameTimes.length > 0 && motionFrameTimes[0] < cutoff) motionFrameTimes.shift()

            const ts = typeof payload.ts === 'number' ? payload.ts : now
            motionState.value = {
              ts,
              pitch: Number(payload.pitch ?? payload.p ?? 0),
              roll: Number(payload.roll ?? payload.r ?? 0),
              ax: Number(payload.ax ?? 0),
              ay: Number(payload.ay ?? 0),
              az: Number(payload.az ?? 9.8),
              emotion: String(payload.emotion ?? payload.e ?? 'OPTIMAL'),
              shaking: Boolean(payload.shaking ?? payload.sh ?? false),
              hz: motionFrameTimes.length,
              ageMs: 0
            }
          }
          return
        }

        const rawContainer = (msg.payload ?? msg.data ?? (msg.raw || msg.processed ? msg : null)) as unknown
        if ((msgType === 'TELEMETRY_UPDATE' || msgType === 'TELEMETRY_BATCH') && rawContainer) {
          const item = Array.isArray(rawContainer) ? rawContainer[rawContainer.length - 1] : rawContainer
          if (!item || typeof item !== 'object') return

          const combinedSample = mergeTelemetryLayers(item as RawTelemetryPayload, (item as RawTelemetryPayload).raw, (item as RawTelemetryPayload).processed, (item as RawTelemetryPayload).prediction)
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

export async function fetchLocalLinkStatus() {
  const { apiBase } = resolveApiConfig()
  try {
    const res = await fetch(`${apiBase}/api/hardware/link`)
    if (!res.ok) return
    const json = (await res.json()) as {
      success?: boolean
      data?: {
        connected?: boolean
        port?: string | null
        baud?: number
        baud_effective?: number
        mot_hz?: number
        tlm_hz?: number
        mot_frames?: number
        tlm_frames?: number
        last_error?: string | null
      }
    }
    if (!json.success || !json.data) return
    const d = json.data
    localLinkInfo.value = {
      connected: Boolean(d.connected),
      port: d.port ?? null,
      baud: d.baud_effective ?? d.baud ?? localLinkInfo.value.baud,
      motHz: d.mot_hz ?? localLinkInfo.value.motHz,
      tlmHz: d.tlm_hz ?? localLinkInfo.value.tlmHz,
      motFrames: d.mot_frames ?? localLinkInfo.value.motFrames,
      tlmFrames: d.tlm_frames ?? localLinkInfo.value.tlmFrames,
      lastError: d.last_error ?? null
    }
  } catch {
    localLinkInfo.value = { ...localLinkInfo.value, connected: false, port: null }
  }
}
