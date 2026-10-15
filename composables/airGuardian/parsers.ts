import { normalizeGc9a01Emotion, type Gc9a01Emotion } from '~/utils/gc9a01Renderer'
import type { RiskEmotionStatus, RawTelemetryPayload, HistoryPoint } from './types'
import {
  telemetry, history, operationMode, lastPacketSource,
  lastPacketTime, nowTick, gyroTareOffset, runtimeState
} from './state'

const EMOTION_ALIASES: Record<string, Gc9a01Emotion> = {
  TILT_LEFT: 'WALL_LEFT',
  TILT_RIGHT: 'WALL_RIGHT',
  WHISTLING: 'WHISTLE',
  SNEEZING: 'SNEEZE',
  YAWNING: 'YAWN',
  RECOVERING: 'RECOVERY',
  SLEEP: 'SLEEPING',
  ALERT: 'WARNING_PREDICTIVE',
  ERROR: 'CRITICAL'
}

export function parseRiskEmotion(raw: string): Gc9a01Emotion {
  const cleaned = String(raw || 'OPTIMAL').toUpperCase().trim().replace(/^EMOTION_/, '')
  return EMOTION_ALIASES[cleaned] ?? normalizeGc9a01Emotion(cleaned, false)
}

export function parseBaseRiskStatus(raw: string): RiskEmotionStatus {
  const emo = parseRiskEmotion(raw)
  if (emo === 'CRITICAL' || emo === 'GAS_MASK') return 'CRITICAL'
  if (emo === 'WARNING_PREDICTIVE') return 'WARNING_PREDICTIVE'
  if (emo === 'RECOVERY') return 'RECOVERY'
  if (emo === 'SLEEPING') return 'SLEEPING'
  if (emo === 'DIZZY' || emo === 'NAUSEA' || emo === 'VOMIT') return 'DIZZY'
  return 'OPTIMAL'
}

export function mergeTelemetryLayers(
  ...layers: Array<Record<string, unknown> | RawTelemetryPayload | undefined>
): RawTelemetryPayload {
  const result: Record<string, unknown> = {}
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object') continue
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined && key !== 'raw' && key !== 'processed' && key !== 'prediction') {
        if (value !== null || !(key in result)) result[key] = value
      }
    }
  }
  return result as RawTelemetryPayload
}

export function applyBackendSample(sampleInput: RawTelemetryPayload, markHardwareOnline = true) {
  if (!sampleInput) return
  const sample = mergeTelemetryLayers(sampleInput, sampleInput.raw, sampleInput.processed, sampleInput.prediction)
  const isSim = sample.source === 'simulator' || operationMode.value === 'LOCAL'
  if (isSim) {
    lastPacketSource.value = 'SIMULATOR'
    lastPacketTime.value = Date.now()
  } else if (markHardwareOnline) {
    lastPacketSource.value = 'HARDWARE'
    lastPacketTime.value = Date.now()
    nowTick.value = Date.now()
  }

  const s = sample.sensors
  const ppm = sample.ppm ?? s?.ppm
  if (ppm !== undefined) telemetry.value.ppm = Number(ppm)

  const coPpm = sample.co_ppm ?? sample.coPpm ?? s?.co_ppm ?? s?.coPpm
  if (coPpm !== undefined) telemetry.value.co_ppm = Number(coPpm)

  const temp = sample.temperature ?? s?.temperature
  if (temp !== undefined) telemetry.value.temperature = Number(temp)

  const hum = sample.humidity ?? s?.humidity
  if (hum !== undefined) telemetry.value.humidity = Number(hum)

  const delta = sample.delta_ppm_1m ?? sample.delta_ppm ?? sample.slope_ppm ?? s?.delta_ppm_1m ?? s?.delta_ppm
  if (delta !== undefined) telemetry.value.delta_ppm_1m = Number(delta)

  const pred = sample.predicted_ppm_15m ?? s?.predicted_ppm_15m
  telemetry.value.predicted_ppm_15m = pred !== undefined
    ? Number(pred)
    : Math.max(380, Math.min(10000, Math.round(telemetry.value.ppm + telemetry.value.delta_ppm_1m * 15.0 * 0.65)))

  const incomingRisk =
    sample.risk_status || sample.status || s?.risk_status ||
    sample.device_emotion || sample.emotion || s?.device_emotion || s?.emotion
  if (incomingRisk) telemetry.value.risk_status = parseBaseRiskStatus(String(incomingRisk))
  if (sample.session_id !== undefined) telemetry.value.session_id = sample.session_id
  if (sample.timestamp) telemetry.value.timestamp = Number(sample.timestamp)
  if (sample.device_id) telemetry.value.device_id = sample.device_id

  const rawAdc = sample.raw_adc ?? sample.raw_adc135 ?? s?.raw_adc ?? s?.raw_adc135
  if (rawAdc !== undefined) telemetry.value.raw_adc = Number(rawAdc)

  const rawMq7 = sample.raw_adc7 ?? sample.mq7_raw ?? s?.raw_adc7 ?? s?.mq7_raw
  if (rawMq7 !== undefined) {
    telemetry.value.raw_adc7 = Number(rawMq7)
    telemetry.value.mq7_raw = Number(rawMq7)
  }

  const mpuConn = sample.mpu_connected ?? s?.mpu_connected
  if (mpuConn !== undefined) telemetry.value.mpu_connected = Boolean(mpuConn)

  const hasGyroPayload = [sample.eye_x, sample.eye_y, sample.roll, sample.pitch, s?.eye_x, s?.eye_y, s?.roll, s?.pitch]
    .some((v) => v !== undefined)

  const rawInEyeX = Number(sample.eye_x ?? s?.eye_x ?? runtimeState.lastRawEyeX)
  const rawInEyeY = Number(sample.eye_y ?? s?.eye_y ?? runtimeState.lastRawEyeY)
  runtimeState.lastRawEyeX = rawInEyeX
  runtimeState.lastRawEyeY = rawInEyeY

  const offsetEyeX = Number((rawInEyeX - gyroTareOffset.value.x).toFixed(1))
  const offsetEyeY = Number((rawInEyeY - gyroTareOffset.value.y).toFixed(1))
  const inEyeX = Math.abs(offsetEyeX) <= 0.2 ? 0 : offsetEyeX
  const inEyeY = Math.abs(offsetEyeY) <= 0.2 ? 0 : offsetEyeY

  const rawRoll = sample.roll ?? s?.roll
  const rawPitch = sample.pitch ?? s?.pitch
  const hasNonZeroRollPitch = Boolean(Number(rawRoll) || Number(rawPitch))
  const shouldDeriveRollPitch = !hasNonZeroRollPitch || (Math.abs(inEyeX * 9.0) > 90.5 && Math.abs(Number(rawRoll ?? 0)) <= 90)

  if (hasGyroPayload && Date.now() > runtimeState.manualGyroLockUntil) {
    let computedRoll = shouldDeriveRollPitch ? inEyeX * 9.0 : Number(rawRoll ?? 0) - gyroTareOffset.value.x * 9.0
    while (computedRoll > 180) computedRoll -= 360
    while (computedRoll < -180) computedRoll += 360
    const computedPitch = shouldDeriveRollPitch
      ? Math.max(-90, Math.min(90, inEyeY * 9.0))
      : Math.max(-90, Math.min(90, Number(rawPitch ?? 0) - gyroTareOffset.value.y * 9.0))
    telemetry.value.roll = Math.abs(computedRoll) <= 1.8 ? 0 : Number(computedRoll.toFixed(1))
    telemetry.value.pitch = Math.abs(computedPitch) <= 1.8 ? 0 : Number(computedPitch.toFixed(1))
    telemetry.value.eye_x = Number(Math.max(-10, Math.min(10, inEyeX)).toFixed(2))
    telemetry.value.eye_y = Number(Math.max(-10, Math.min(10, inEyeY)).toFixed(2))
  }

  const ax = sample.ax ?? s?.ax; if (ax !== undefined) telemetry.value.ax = Number(ax)
  const ay = sample.ay ?? s?.ay; if (ay !== undefined) telemetry.value.ay = Number(ay)
  const az = sample.az ?? s?.az; if (az !== undefined) telemetry.value.az = Number(az)

  const freeHeap = sample.free_heap ?? sample.hardware?.free_heap
  if (freeHeap !== undefined) telemetry.value.free_heap = Number(freeHeap)
  const uptimeS = sample.uptime_s ?? sample.hardware?.uptime_s
  if (uptimeS !== undefined) telemetry.value.uptime_s = Number(uptimeS)
  const offlinePending = sample.offline_pending ?? sample.storage?.offline_pending
  if (offlinePending !== undefined) telemetry.value.offline_pending = Number(offlinePending)

  const hasExplicitEmotionOrShake = [
    sample.is_shaking, s?.is_shaking, sample.device_emotion, sample.emotion, s?.device_emotion, s?.emotion
  ].some((v) => v !== undefined)

  const rawEmotion = String(
    sample.device_emotion || sample.emotion || s?.device_emotion || s?.emotion ||
    sample.risk_status || sample.status || s?.risk_status || 'OPTIMAL'
  ).toUpperCase()
  const parsedEmotion = parseRiskEmotion(rawEmotion)
  const shaking = Boolean(sample.is_shaking ?? s?.is_shaking) || ['DIZZY', 'NAUSEA', 'VOMIT'].includes(parsedEmotion)

  if (Date.now() > runtimeState.manualGyroLockUntil) {
    if (hasExplicitEmotionOrShake || hasGyroPayload) {
      telemetry.value.is_shaking = shaking
      if (parsedEmotion !== 'OPTIMAL') telemetry.value.device_emotion = parsedEmotion
      else if (shaking) telemetry.value.device_emotion = 'DIZZY'
      else if (Math.abs(telemetry.value.roll) > 135) telemetry.value.device_emotion = 'UPSIDE_DOWN'
      else telemetry.value.device_emotion = 'OPTIMAL'
    } else if (!telemetry.value.is_shaking) {
      telemetry.value.device_emotion =
        Math.abs(telemetry.value.roll) > 135 && parsedEmotion === 'OPTIMAL' ? 'UPSIDE_DOWN' : parsedEmotion
    }
  }

  const rawViewMode = sample.view_mode ?? s?.view_mode
  if (rawViewMode === 'FACE' || rawViewMode === 'HUD') telemetry.value.view_mode = rawViewMode
  else if (rawViewMode === 'VIEW_PET_FACE') telemetry.value.view_mode = 'FACE'
  else if (rawViewMode === 'VIEW_CIRCULAR_HUD') telemetry.value.view_mode = 'HUD'

  const newPoint: HistoryPoint = {
    timestamp: sample.timestamp || Date.now(),
    ppm: Number(telemetry.value.ppm),
    predicted_ppm_15m: Number(telemetry.value.predicted_ppm_15m)
  }
  const last = history.value[history.value.length - 1]
  if (!last || last.timestamp !== newPoint.timestamp) {
    history.value = [...history.value.slice(-49), newPoint]
  }
}

export function applyLiveTelemetry(data: RawTelemetryPayload, markHardwareOnline = true) {
  applyBackendSample(data, markHardwareOnline)
}
