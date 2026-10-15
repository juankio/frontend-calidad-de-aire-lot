import { ref, computed, onMounted, onUnmounted } from 'vue'

export type RiskEmotionStatus =
  | 'OPTIMAL'
  | 'WARNING_PREDICTIVE'
  | 'CRITICAL'
  | 'RECOVERY'
  | 'SLEEPING'
  | 'DIZZY'

export interface TelemetryState {
  device_id: string
  timestamp: number
  ppm: number
  co_ppm: number
  temperature: number
  humidity: number
  delta_ppm_1m: number
  predicted_ppm_15m: number
  risk_status: RiskEmotionStatus
  session_id?: string | null
  source?: 'hardware' | 'simulator'
  raw_adc?: number
  raw_adc7?: number
  mq7_raw?: number
  mpu_connected?: boolean
  eye_x: number
  eye_y: number
  pitch: number
  roll: number
  ax?: number
  ay?: number
  az?: number
  is_shaking: boolean
  free_heap?: number
  uptime_s?: number
  offline_pending?: number
  device_emotion: RiskEmotionStatus
  view_mode: 'FACE' | 'HUD'
}

export type TelemetryData = TelemetryState

export interface SessionData {
  id: string
  session_id?: string
  name: string
  description?: string
  latitude: number
  longitude: number
  radius_meters: number
  start_time: number
  total_samples: number
  avg_ppm: number | null
  max_ppm: number | null
  avg_temp?: number | null
  avg_humidity?: number | null
}

export interface HistoryPoint {
  timestamp: number
  ppm: number
  predicted_ppm_15m: number
}

interface RawSensorPayload {
  ppm?: number
  co_ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  delta_ppm?: number
  delta_ppm_1m?: number
  predicted_ppm_15m?: number
  raw_adc?: number
  raw_adc135?: number
  raw_adc7?: number
  mq7_raw?: number
  mpu_connected?: boolean
  eye_x?: number
  eye_y?: number
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
  is_shaking?: boolean
  emotion?: string
  device_emotion?: string
  view_mode?: string
  risk_status?: string
}

interface RawTelemetryPayload {
  cmd?: string
  device_id?: string
  timestamp?: number
  ppm?: number
  co_ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  delta_ppm_1m?: number
  delta_ppm?: number
  slope_ppm?: number
  ewma_ppm?: number
  voltage?: number
  predicted_ppm_15m?: number
  risk_status?: string
  status?: string
  session_id?: string | null
  source?: 'hardware' | 'simulator' | string
  raw_adc?: number
  raw_adc135?: number
  raw_adc7?: number
  mq7_raw?: number
  mpu_connected?: boolean
  eye_x?: number
  eye_y?: number
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
  is_shaking?: boolean
  free_heap?: number
  uptime_s?: number
  offline_pending?: number
  device_emotion?: string
  emotion?: string
  view_mode?: string
  sensors?: RawSensorPayload
  hardware?: {
    free_heap?: number
    uptime_s?: number
  }
  storage?: {
    offline_pending?: number
  }
  raw?: RawTelemetryPayload
  processed?: RawTelemetryPayload
  prediction?: RawTelemetryPayload
}

const DEFAULT_SESSIONS: SessionData[] = [
  {
    id: 'loc-1',
    name: 'Universidad - Campus Central',
    description: 'Toma de muestras en plazoleta de aulas de ingeniería',
    latitude: 4.1450,
    longitude: -73.6280,
    radius_meters: 120,
    start_time: Date.now() - 3600000 * 4,
    total_samples: 54,
    avg_ppm: 435,
    max_ppm: 580
  },
  {
    id: 'loc-2',
    name: 'Parque Central Los Libertadores',
    description: 'Zona arbolada con alta circulación peatonal',
    latitude: 4.1500,
    longitude: -73.6330,
    radius_meters: 150,
    start_time: Date.now() - 3600000 * 3,
    total_samples: 68,
    avg_ppm: 395,
    max_ppm: 440
  },
  {
    id: 'loc-3',
    name: 'Laboratorio de Prototipado IoT',
    description: 'Ensayos con aerosoles y cautines de soldadura',
    latitude: 4.1420,
    longitude: -73.6266,
    radius_meters: 60,
    start_time: Date.now() - 3600000 * 2,
    total_samples: 92,
    avg_ppm: 820,
    max_ppm: 1450
  },
  {
    id: 'loc-4',
    name: 'Hogar - Base Operativa',
    description: 'Monitoreo ambiental residencial continuo',
    latitude: 4.1380,
    longitude: -73.6220,
    radius_meters: 80,
    start_time: Date.now() - 3600000,
    total_samples: 110,
    avg_ppm: 455,
    max_ppm: 610
  }
]

const globalSessions = ref<SessionData[]>(DEFAULT_SESSIONS)
const globalSelectedSessionId = ref<string | null>(null)

const wsConnected = ref(false)
const usbConnected = ref(false)
const operationMode = ref<'LOCAL' | 'LIVE'>('LIVE')
const isSimulatorRunning = ref(false)
const isModalOpen = ref(false)

const lastPacketTime = ref<number | null>(null)
const lastPacketSource = ref<'HARDWARE' | 'SIMULATOR' | 'NONE'>('NONE')
const nowTick = ref(Date.now())
let lastSeenServerTimestamp: number | null = null

const telemetry = ref<TelemetryState>({
  device_id: 'air-guardian-01',
  timestamp: Date.now(),
  ppm: 420,
  co_ppm: 2.1,
  temperature: 24.5,
  humidity: 55,
  delta_ppm_1m: 5,
  predicted_ppm_15m: 435,
  risk_status: 'OPTIMAL',
  session_id: null,
  raw_adc: 608,
  raw_adc7: 1302,
  mq7_raw: 1302,
  mpu_connected: true,
  eye_x: 0,
  eye_y: 0,
  pitch: 0,
  roll: 0,
  ax: 0,
  ay: 0,
  az: 9.8,
  is_shaking: false,
  free_heap: 184320,
  uptime_s: 3600,
  offline_pending: 0,
  device_emotion: 'OPTIMAL',
  view_mode: 'FACE'
})

const history = ref<HistoryPoint[]>([
  { timestamp: Date.now() - 40000, ppm: 410, predicted_ppm_15m: 415 },
  { timestamp: Date.now() - 30000, ppm: 415, predicted_ppm_15m: 420 },
  { timestamp: Date.now() - 20000, ppm: 418, predicted_ppm_15m: 425 },
  { timestamp: Date.now() - 10000, ppm: 420, predicted_ppm_15m: 430 },
  { timestamp: Date.now(), ppm: 420, predicted_ppm_15m: 435 }
])

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let fallbackPollingTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
let localMockTimer: ReturnType<typeof setInterval> | null = null
let manualGyroLockUntil = 0
let lastRawEyeX = 0
let lastRawEyeY = 0
const gyroTareOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 })
let shakeTimer: ReturnType<typeof setInterval> | null = null
let usbIngestDebounceTimer: ReturnType<typeof setTimeout> | null = null
let lastUsbIngestSentAt = 0
let activeConsumers = 0

function parseRiskEmotion(raw: string): TelemetryState['device_emotion'] {
  const normalized = raw.toUpperCase().trim()
  if (normalized === 'DIZZY' || normalized === 'EMOTION_DIZZY') return 'DIZZY'
  if (
    normalized === 'WARNING_PREDICTIVE' ||
    normalized === 'PREDICTIVE_WARNING' ||
    normalized === 'EMOTION_PREDICTIVE_WARNING' ||
    normalized === 'WARNING' ||
    normalized === 'ALERT'
  ) {
    return 'WARNING_PREDICTIVE'
  }
  if (
    normalized === 'CRITICAL' ||
    normalized === 'EMOTION_CRITICAL' ||
    normalized === 'DANGER' ||
    normalized === 'ERROR'
  ) {
    return 'CRITICAL'
  }
  if (normalized === 'RECOVERY' || normalized === 'EMOTION_RECOVERY' || normalized === 'RECOVERING') {
    return 'RECOVERY'
  }
  if (normalized === 'SLEEPING' || normalized === 'EMOTION_SLEEPING' || normalized === 'SLEEP') {
    return 'SLEEPING'
  }
  return 'OPTIMAL'
}

export function useAirGuardian() {
  const config = useRuntimeConfig()
  const apiBase = (String(config.public.apiBase || 'https://servidor-taller.tailf19567.ts.net:10000')).replace(/\/+$/, '')
  const wsBase = (String(config.public.wsBase || apiBase.replace(/^http/, 'ws'))).replace(/\/+$/, '')

  const selectedSessionId = globalSelectedSessionId
  const viewMode = computed<'FACE' | 'HUD'>(() => telemetry.value.view_mode)
  const sessions = globalSessions

  const lastPacketAgeSec = computed<number | null>(() => {
    if (lastPacketTime.value === null) return null
    return Math.max(0, Math.floor((nowTick.value - lastPacketTime.value) / 1000))
  })

  const hardwareStatus = computed<'ONLINE' | 'SIMULATED' | 'OFFLINE'>(() => {
    if (operationMode.value === 'LOCAL') return 'SIMULATED'
    if (usbConnected.value) return 'ONLINE'
    if (
      lastPacketTime.value !== null &&
      lastPacketAgeSec.value !== null &&
      lastPacketAgeSec.value < 8 &&
      lastPacketSource.value === 'HARDWARE'
    ) {
      return 'ONLINE'
    }
    return 'OFFLINE'
  })

  const effectiveRiskStatus = computed<TelemetryState['risk_status']>(() => {
    if (telemetry.value.is_shaking || telemetry.value.device_emotion === 'DIZZY') return 'DIZZY'
    if (
      operationMode.value === 'LIVE' &&
      hardwareStatus.value === 'OFFLINE' &&
      nowTick.value >= manualGyroLockUntil &&
      Date.now() >= manualGyroLockUntil
    ) {
      return 'SLEEPING'
    }
    return telemetry.value.risk_status
  })

  function mergeTelemetryLayers(...layers: Array<Record<string, any> | undefined>): RawTelemetryPayload {
    const result: Record<string, any> = {}
    for (const layer of layers) {
      if (!layer || typeof layer !== 'object') continue
      for (const [key, value] of Object.entries(layer)) {
        if (value !== undefined && key !== 'raw' && key !== 'processed' && key !== 'prediction') {
          if (value !== null || !(key in result)) {
            result[key] = value
          }
        }
      }
    }
    return result as RawTelemetryPayload
  }

  function applyBackendSample(sampleInput: RawTelemetryPayload, markHardwareOnline = true) {
    if (!sampleInput) return
    const sample = mergeTelemetryLayers(
      sampleInput as any,
      sampleInput.raw as any,
      sampleInput.processed as any,
      sampleInput.prediction as any
    )
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
    if (sample.ppm !== undefined) telemetry.value.ppm = Number(sample.ppm)
    else if (s?.ppm !== undefined) telemetry.value.ppm = Number(s.ppm)

    if (sample.co_ppm !== undefined) telemetry.value.co_ppm = Number(sample.co_ppm)
    else if (sample.coPpm !== undefined) telemetry.value.co_ppm = Number(sample.coPpm)
    else if (s?.co_ppm !== undefined) telemetry.value.co_ppm = Number(s.co_ppm)
    else if (s?.coPpm !== undefined) telemetry.value.co_ppm = Number(s.coPpm)

    if (sample.temperature !== undefined) telemetry.value.temperature = Number(sample.temperature)
    else if (s?.temperature !== undefined) telemetry.value.temperature = Number(s.temperature)

    if (sample.humidity !== undefined) telemetry.value.humidity = Number(sample.humidity)
    else if (s?.humidity !== undefined) telemetry.value.humidity = Number(s.humidity)

    if (sample.delta_ppm_1m !== undefined) telemetry.value.delta_ppm_1m = Number(sample.delta_ppm_1m)
    else if (sample.delta_ppm !== undefined) telemetry.value.delta_ppm_1m = Number(sample.delta_ppm)
    else if (sample.slope_ppm !== undefined) telemetry.value.delta_ppm_1m = Number(sample.slope_ppm)
    else if (s?.delta_ppm_1m !== undefined) telemetry.value.delta_ppm_1m = Number(s.delta_ppm_1m)
    else if (s?.delta_ppm !== undefined) telemetry.value.delta_ppm_1m = Number(s.delta_ppm)

    if (sample.predicted_ppm_15m !== undefined) {
      telemetry.value.predicted_ppm_15m = Number(sample.predicted_ppm_15m)
    } else if (s?.predicted_ppm_15m !== undefined) {
      telemetry.value.predicted_ppm_15m = Number(s.predicted_ppm_15m)
    } else {
      telemetry.value.predicted_ppm_15m = Math.max(
        380,
        Math.min(10000, Math.round(telemetry.value.ppm + telemetry.value.delta_ppm_1m * 15.0 * 0.65))
      )
    }

    const incomingRisk =
      sample.risk_status ||
      sample.status ||
      s?.risk_status ||
      sample.device_emotion ||
      sample.emotion ||
      s?.device_emotion ||
      s?.emotion
    if (incomingRisk) telemetry.value.risk_status = parseRiskEmotion(String(incomingRisk))
    if (sample.session_id !== undefined) telemetry.value.session_id = sample.session_id
    if (sample.timestamp) telemetry.value.timestamp = Number(sample.timestamp)
    if (sample.device_id) telemetry.value.device_id = sample.device_id

    if (sample.raw_adc !== undefined) telemetry.value.raw_adc = Number(sample.raw_adc)
    else if (sample.raw_adc135 !== undefined) telemetry.value.raw_adc = Number(sample.raw_adc135)
    else if (s?.raw_adc !== undefined) telemetry.value.raw_adc = Number(s.raw_adc)
    else if (s?.raw_adc135 !== undefined) telemetry.value.raw_adc = Number(s.raw_adc135)

    const rawMq7 = sample.raw_adc7 ?? sample.mq7_raw ?? s?.raw_adc7 ?? s?.mq7_raw
    if (rawMq7 !== undefined) {
      telemetry.value.raw_adc7 = Number(rawMq7)
      telemetry.value.mq7_raw = Number(rawMq7)
    }

    if (sample.mpu_connected !== undefined) telemetry.value.mpu_connected = Boolean(sample.mpu_connected)
    else if (s?.mpu_connected !== undefined) telemetry.value.mpu_connected = Boolean(s.mpu_connected)

    const hasGyroPayload =
      sample.eye_x !== undefined ||
      sample.eye_y !== undefined ||
      sample.roll !== undefined ||
      sample.pitch !== undefined ||
      s?.eye_x !== undefined ||
      s?.eye_y !== undefined ||
      s?.roll !== undefined ||
      s?.pitch !== undefined

    const rawInEyeX = sample.eye_x !== undefined
      ? Number(sample.eye_x)
      : (s?.eye_x !== undefined ? Number(s.eye_x) : lastRawEyeX)
    const rawInEyeY = sample.eye_y !== undefined
      ? Number(sample.eye_y)
      : (s?.eye_y !== undefined ? Number(s.eye_y) : lastRawEyeY)

    lastRawEyeX = rawInEyeX
    lastRawEyeY = rawInEyeY

    const offsetEyeX = Number((rawInEyeX - gyroTareOffset.value.x).toFixed(1))
    const offsetEyeY = Number((rawInEyeY - gyroTareOffset.value.y).toFixed(1))
    const inEyeX = Math.abs(offsetEyeX) <= 0.2 ? 0 : offsetEyeX
    const inEyeY = Math.abs(offsetEyeY) <= 0.2 ? 0 : offsetEyeY

    const rawRoll = sample.roll ?? s?.roll
    const rawPitch = sample.pitch ?? s?.pitch
    const hasNonZeroRollPitch =
      (rawRoll !== undefined && Number(rawRoll) !== 0) ||
      (rawPitch !== undefined && Number(rawPitch) !== 0)
    const shouldDeriveRollPitch =
      !hasNonZeroRollPitch ||
      (Math.abs(inEyeX * 9.0) > 90.5 && Math.abs(Number(rawRoll ?? 0)) <= 90)

    if (hasGyroPayload && Date.now() > manualGyroLockUntil) {
      let computedRoll = shouldDeriveRollPitch
        ? inEyeX * 9.0
        : Number(rawRoll ?? 0) - gyroTareOffset.value.x * 9.0
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

    if (sample.ax !== undefined) telemetry.value.ax = Number(sample.ax)
    else if (s?.ax !== undefined) telemetry.value.ax = Number(s.ax)

    if (sample.ay !== undefined) telemetry.value.ay = Number(sample.ay)
    else if (s?.ay !== undefined) telemetry.value.ay = Number(s.ay)

    if (sample.az !== undefined) telemetry.value.az = Number(sample.az)
    else if (s?.az !== undefined) telemetry.value.az = Number(s.az)

    if (sample.free_heap !== undefined) telemetry.value.free_heap = Number(sample.free_heap)
    else if (sample.hardware?.free_heap !== undefined) telemetry.value.free_heap = Number(sample.hardware.free_heap)

    if (sample.uptime_s !== undefined) telemetry.value.uptime_s = Number(sample.uptime_s)
    else if (sample.hardware?.uptime_s !== undefined) telemetry.value.uptime_s = Number(sample.hardware.uptime_s)

    if (sample.offline_pending !== undefined) telemetry.value.offline_pending = Number(sample.offline_pending)
    else if (sample.storage?.offline_pending !== undefined) telemetry.value.offline_pending = Number(sample.storage.offline_pending)

    const hasExplicitEmotionOrShake =
      sample.is_shaking !== undefined ||
      s?.is_shaking !== undefined ||
      sample.device_emotion !== undefined ||
      sample.emotion !== undefined ||
      s?.device_emotion !== undefined ||
      s?.emotion !== undefined

    const rawEmotion = String(
      sample.device_emotion ||
      sample.emotion ||
      s?.device_emotion ||
      s?.emotion ||
      sample.risk_status ||
      sample.status ||
      s?.risk_status ||
      'OPTIMAL'
    ).toUpperCase()
    const shaking =
      Boolean(sample.is_shaking ?? s?.is_shaking) ||
      rawEmotion === 'DIZZY'

    if (Date.now() > manualGyroLockUntil) {
      if (hasExplicitEmotionOrShake || hasGyroPayload) {
        telemetry.value.is_shaking = shaking
        telemetry.value.device_emotion = shaking
          ? 'DIZZY'
          : (rawEmotion === 'PREDICTIVE_WARNING' ? 'WARNING_PREDICTIVE' : parseRiskEmotion(rawEmotion))
      } else if (!telemetry.value.is_shaking) {
        telemetry.value.device_emotion =
          rawEmotion === 'PREDICTIVE_WARNING' ? 'WARNING_PREDICTIVE' : parseRiskEmotion(rawEmotion)
      }
    }

    const rawViewMode = sample.view_mode ?? s?.view_mode
    if (rawViewMode === 'FACE' || rawViewMode === 'HUD') {
      telemetry.value.view_mode = rawViewMode
    } else if (rawViewMode === 'VIEW_PET_FACE') {
      telemetry.value.view_mode = 'FACE'
    } else if (rawViewMode === 'VIEW_CIRCULAR_HUD') {
      telemetry.value.view_mode = 'HUD'
    }

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

  function applyLiveTelemetry(data: RawTelemetryPayload, markHardwareOnline = true) {
    applyBackendSample(data, markHardwareOnline)
  }

  function forwardUsbTelemetryToBackend() {
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

  function ingestUsbSerialStatus(statusPayload: any) {
    if (!statusPayload || typeof statusPayload !== 'object') return

    usbConnected.value = true
    if (operationMode.value !== 'LIVE') {
      operationMode.value = 'LIVE'
      isSimulatorRunning.value = false
      stopLocalMock()
    }

    const now = Date.now()
    lastPacketSource.value = 'HARDWARE'
    lastPacketTime.value = now
    nowTick.value = now

    applyBackendSample(
      {
        ...statusPayload,
        timestamp: now,
        source: 'hardware'
      },
      true
    )

    if (now - lastUsbIngestSentAt >= 1500) {
      lastUsbIngestSentAt = now
      if (usbIngestDebounceTimer) {
        clearTimeout(usbIngestDebounceTimer)
        usbIngestDebounceTimer = null
      }
      forwardUsbTelemetryToBackend()
    } else if (!usbIngestDebounceTimer) {
      const delayMs = Math.max(100, 1500 - (now - lastUsbIngestSentAt))
      usbIngestDebounceTimer = setTimeout(() => {
        usbIngestDebounceTimer = null
        lastUsbIngestSentAt = Date.now()
        forwardUsbTelemetryToBackend()
      }, delayMs)
    }
  }

  let mockTrend = 1
  function runLocalMockStep() {
    if (operationMode.value !== 'LOCAL') return
    let curPpm = telemetry.value.ppm
    if (curPpm > 1200) mockTrend = -1
    if (curPpm < 415) mockTrend = 1
    curPpm = Math.round((curPpm + mockTrend * (12 + Math.random() * 20)) * 10) / 10

    const mockDelta = mockTrend * 18
    const mockPred = Math.round(curPpm + mockDelta * 10)
    let mockRisk: TelemetryState['risk_status'] = 'OPTIMAL'
    if (curPpm > 1050) mockRisk = 'CRITICAL'
    else if (mockDelta > 20 || curPpm > 750) mockRisk = 'WARNING_PREDICTIVE'
    else if (mockDelta < -15) mockRisk = 'RECOVERY'

    const driftEyeX = 0
    const driftEyeY = 0

    applyLiveTelemetry({
      device_id: 'air-guardian-01',
      timestamp: Date.now(),
      ppm: curPpm,
      co_ppm: Math.round((curPpm / 75.0) * 10) / 10,
      temperature: 24.2 + (Math.random() * 0.4 - 0.2),
      humidity: 55 + (Math.random() * 2 - 1),
      delta_ppm_1m: mockDelta,
      predicted_ppm_15m: mockPred,
      risk_status: mockRisk,
      source: 'simulator',
      raw_adc: Math.round(curPpm * 1.45),
      raw_adc7: Math.round((curPpm / 75.0) * 450 + 200),
      mpu_connected: true,
      eye_x: driftEyeX,
      eye_y: driftEyeY,
      free_heap: 182000 + Math.floor(Math.random() * 4000),
      uptime_s: (telemetry.value.uptime_s || 3600) + 2,
      offline_pending: 0,
      device_emotion: mockRisk,
      view_mode: telemetry.value.view_mode
    })

    if (Date.now() > manualGyroLockUntil) {
      telemetry.value.eye_x = driftEyeX
      telemetry.value.eye_y = driftEyeY
      telemetry.value.roll = 0
      telemetry.value.pitch = 0
      telemetry.value.is_shaking = false
    }
  }

  function startLocalMock() {
    if (localMockTimer) clearInterval(localMockTimer)
    localMockTimer = setInterval(runLocalMockStep, 2000)
  }

  function stopLocalMock() {
    if (localMockTimer) {
      clearInterval(localMockTimer)
      localMockTimer = null
    }
  }

  function disableBackendSimulator() {
    fetch(`${apiBase}/api/simulate/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: false })
    }).catch(() => {})
  }

  async function setOperationMode(mode: 'LOCAL' | 'LIVE') {
    operationMode.value = mode
    disableBackendSimulator()
    if (mode === 'LOCAL') {
      isSimulatorRunning.value = true
      runLocalMockStep()
      startLocalMock()
    } else {
      isSimulatorRunning.value = false
      stopLocalMock()
      lastPacketTime.value = null
      lastPacketSource.value = 'NONE'
      lastSeenServerTimestamp = null
      fetchLiveTelemetry()
      if (!wsConnected.value) {
        connectWebSocket()
      }
    }
  }

  function connectWebSocket() {
    if (typeof window === 'undefined') return

    try {
      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        socket.close()
      }

      socket = new WebSocket(wsBase)

      socket.onopen = () => {
        wsConnected.value = true
      }

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type?: string
            event?: string
            payload?: RawTelemetryPayload | RawTelemetryPayload[]
            data?: RawTelemetryPayload | RawTelemetryPayload[]
            raw?: RawTelemetryPayload
            processed?: RawTelemetryPayload
            prediction?: RawTelemetryPayload
          }
          const msgType = String(msg.type || msg.event || '').toUpperCase()
          const rawContainer = msg.payload ?? msg.data ?? (msg.raw || msg.processed ? msg : null)
          if ((msgType === 'TELEMETRY_UPDATE' || msgType === 'TELEMETRY_BATCH') && rawContainer) {
            if (usbConnected.value) return
            const item = Array.isArray(rawContainer) ? rawContainer[rawContainer.length - 1] : rawContainer
            if (!item) return

            const combinedSample = mergeTelemetryLayers(
              item as any,
              (item as any).raw,
              (item as any).processed,
              (item as any).prediction
            )
            if (operationMode.value === 'LIVE' && combinedSample.source === 'simulator') {
              return
            }

            const rawTs = Number(combinedSample.timestamp || 0)
            if (rawTs > 946684800000 && (lastSeenServerTimestamp === null || rawTs > lastSeenServerTimestamp)) {
              lastSeenServerTimestamp = rawTs
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

      socket.onerror = () => {
        wsConnected.value = false
      }

      socket.onclose = () => {
        wsConnected.value = false
        if (operationMode.value === 'LIVE' && !reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null
            connectWebSocket()
          }, 3000)
        }
      }
    } catch {
      wsConnected.value = false
    }
  }

  async function fetchLiveTelemetry() {
    if (usbConnected.value) return
    try {
      const res = await fetch(`${apiBase}/api/telemetry/live`)
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: RawTelemetryPayload }
        if (json.success && json.data) {
          const sample = mergeTelemetryLayers(
            json.data as any,
            json.data.raw as any,
            json.data.processed as any,
            json.data.prediction as any
          )
          if (operationMode.value === 'LIVE' && sample.source === 'simulator') {
            return
          }

          const rawTs = Number(sample.timestamp || 0)
          const ts = rawTs > 946684800000 ? rawTs : 0
          const age = ts > 0 ? Math.max(0, Date.now() - ts) : Infinity
          const isFirstSeen = lastSeenServerTimestamp === null
          const isFreshPacket = ts > 0 && (age < 8000 || (!isFirstSeen && ts !== lastSeenServerTimestamp))

          if (ts > 0 && (lastSeenServerTimestamp === null || ts > lastSeenServerTimestamp)) {
            lastSeenServerTimestamp = ts
          }

          if (isFreshPacket) {
            lastPacketTime.value = Date.now()
            lastPacketSource.value = 'HARDWARE'
            nowTick.value = Date.now()
            applyBackendSample({ ...sample, timestamp: ts }, true)
          } else if (isFirstSeen) {
            applyBackendSample({ ...sample, timestamp: ts || Date.now() }, false)
          }
        }
      }
    } catch {
      // Network error ignored during background poll
    }
  }

  async function fetchHistory(sessionId?: string | null) {
    try {
      let url = `${apiBase}/api/telemetry/history?limit=50`
      if (sessionId) {
        url += `&session_id=${encodeURIComponent(sessionId)}`
      }
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

  async function fetchSessions() {
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

  function selectSession(id: string) {
    if (!id || id === 'undefined') return
    if (selectedSessionId.value === id) {
      selectedSessionId.value = null
      fetchHistory(null)
    } else {
      selectedSessionId.value = id
      fetchHistory(id)
    }
  }

  async function updateSession(id: string, data: Partial<SessionData>) {
    if (!id) return false
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
      if (idx !== -1) {
        sessions.value[idx] = { ...sessions.value[idx], ...data }
      }
      return false
    }
  }

  async function deleteSession(id: string) {
    if (!id) return false
    try {
      if (selectedSessionId.value === id) {
        selectedSessionId.value = null
        await fetchHistory(null)
      }

      sessions.value = sessions.value.filter((s) => (s.id || s.session_id) !== id)

      const res = await fetch(`${apiBase}/api/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })

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

  function toggleViewMode() {
    const nextMode: 'FACE' | 'HUD' = telemetry.value.view_mode === 'FACE' ? 'HUD' : 'FACE'
    telemetry.value.view_mode = nextMode
    if (operationMode.value === 'LIVE') {
      fetch(`${apiBase}/api/telemetry/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: telemetry.value.device_id || 'air-guardian-01',
          view_mode: nextMode
        })
      }).catch(() => {})
    }
  }

  function setManualGyro(eyeX: number, eyeY: number, shaking = false, durationMs = 4500) {
    manualGyroLockUntil = Date.now() + durationMs
    const clampedEyeX = Math.max(-20, Math.min(20, Number(eyeX) || 0))
    const clampedEyeY = Math.max(-10, Math.min(10, Number(eyeY) || 0))
    let computedRoll = clampedEyeX * 9.0
    while (computedRoll > 180) computedRoll -= 360
    while (computedRoll < -180) computedRoll += 360
    const computedPitch = Math.max(-90, Math.min(90, clampedEyeY * 9.0))
    telemetry.value.roll = Number(computedRoll.toFixed(1))
    telemetry.value.pitch = Number(computedPitch.toFixed(1))
    telemetry.value.eye_x = Number(Math.max(-10, Math.min(10, clampedEyeX)).toFixed(2))
    telemetry.value.eye_y = Number(Math.max(-10, Math.min(10, clampedEyeY)).toFixed(2))
    telemetry.value.is_shaking = shaking
    if (shaking) {
      telemetry.value.device_emotion = 'DIZZY'
    } else if (telemetry.value.device_emotion === 'DIZZY') {
      telemetry.value.device_emotion = telemetry.value.risk_status === 'DIZZY' ? 'OPTIMAL' : telemetry.value.risk_status
    }
  }

  function calibrateGyroZero() {
    gyroTareOffset.value = { x: lastRawEyeX, y: lastRawEyeY }
    manualGyroLockUntil = 0
    telemetry.value.eye_x = 0
    telemetry.value.eye_y = 0
    telemetry.value.roll = 0
    telemetry.value.pitch = 0
    telemetry.value.is_shaking = false
  }

  function triggerGyroShake() {
    if (shakeTimer) {
      clearInterval(shakeTimer)
      shakeTimer = null
    }
    const durationMs = 2600
    const startMs = Date.now()
    manualGyroLockUntil = startMs + durationMs

    const nextMode: 'FACE' | 'HUD' = telemetry.value.view_mode === 'FACE' ? 'HUD' : 'FACE'
    telemetry.value.view_mode = nextMode
    telemetry.value.is_shaking = true
    telemetry.value.device_emotion = 'DIZZY'

    let tick = 0
    shakeTimer = setInterval(() => {
      tick++
      const elapsed = Date.now() - startMs
      if (elapsed >= durationMs) {
        if (shakeTimer) {
          clearInterval(shakeTimer)
          shakeTimer = null
        }
        telemetry.value.eye_x = 0
        telemetry.value.eye_y = 0
        telemetry.value.roll = 0
        telemetry.value.pitch = 0
        telemetry.value.is_shaking = false
        telemetry.value.device_emotion =
          telemetry.value.risk_status === 'DIZZY' ? 'OPTIMAL' : telemetry.value.risk_status
        return
      }

      const decay = 1 - elapsed / durationMs
      const sx = Math.sin(tick * 1.9) * 7.2 * decay
      const sy = Math.cos(tick * 2.3) * 6.4 * decay
      telemetry.value.eye_x = Number(sx.toFixed(2))
      telemetry.value.eye_y = Number(sy.toFixed(2))
      telemetry.value.roll = Number(Math.max(-35, Math.min(35, sx * 3.5)).toFixed(1))
      telemetry.value.pitch = Number(Math.max(-30, Math.min(30, -sy * 3.5)).toFixed(1))
      telemetry.value.is_shaking = true
      telemetry.value.device_emotion = 'DIZZY'
    }, 65)
  }

  onMounted(() => {
    activeConsumers++
    if (activeConsumers > 1) return

    disableBackendSimulator()
    connectWebSocket()
    fetchLiveTelemetry()
    fetchHistory()
    fetchSessions()
    if (operationMode.value === 'LOCAL') {
      runLocalMockStep()
      startLocalMock()
    }

    if (tickTimer) clearInterval(tickTimer)
    tickTimer = setInterval(() => {
      nowTick.value = Date.now()
    }, 1000)

    if (fallbackPollingTimer) clearInterval(fallbackPollingTimer)
    fallbackPollingTimer = setInterval(() => {
      if (operationMode.value === 'LIVE') {
        fetchLiveTelemetry()
      }
    }, 2000)
  })

  onUnmounted(() => {
    activeConsumers = Math.max(0, activeConsumers - 1)
    if (activeConsumers > 0) return

    if (socket) {
      socket.close()
      socket = null
    }
    stopLocalMock()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (fallbackPollingTimer) clearInterval(fallbackPollingTimer)
    if (tickTimer) clearInterval(tickTimer)
    if (shakeTimer) clearInterval(shakeTimer)
    if (usbIngestDebounceTimer) clearTimeout(usbIngestDebounceTimer)
  })

  return {
    telemetry,
    history,
    sessions,
    selectedSessionId,
    wsConnected,
    usbConnected,
    operationMode,
    isSimulatorRunning,
    hardwareStatus,
    effectiveRiskStatus,
    lastPacketAgeSec,
    isModalOpen,
    viewMode,
    ingestUsbSerialStatus,
    applyBackendSample,
    applyLiveTelemetry,
    setOperationMode,
    toggleViewMode,
    setManualGyro,
    calibrateGyroZero,
    gyroTareOffset,
    triggerGyroShake,
    selectSession,
    updateSession,
    deleteSession,
    fetchSessions,
    fetchHistory
  }
}
