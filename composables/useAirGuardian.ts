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
  raw_adc135?: number
  raw_adc7?: number
  mpu_connected?: boolean
  eye_x?: number
  eye_y?: number
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
}

interface RawTelemetryPayload {
  device_id?: string
  timestamp?: number
  ppm?: number
  co_ppm?: number
  coPpm?: number
  temperature?: number
  humidity?: number
  delta_ppm_1m?: number
  delta_ppm?: number
  predicted_ppm_15m?: number
  risk_status?: string
  session_id?: string | null
  source?: 'hardware' | 'simulator' | string
  raw_adc?: number
  raw_adc135?: number
  raw_adc7?: number
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

  const wsConnected = ref(false)
  const operationMode = ref<'LOCAL' | 'LIVE'>('LIVE')
  const isSimulatorRunning = ref(false)
  const isModalOpen = ref(false)
  const selectedSessionId = globalSelectedSessionId

  const lastPacketTime = ref<number | null>(Date.now())
  const lastPacketSource = ref<'HARDWARE' | 'SIMULATOR' | 'NONE'>('HARDWARE')
  const nowTick = ref(Date.now())

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

  const viewMode = computed<'FACE' | 'HUD'>(() => telemetry.value.view_mode)

  const history = ref<HistoryPoint[]>([
    { timestamp: Date.now() - 40000, ppm: 410, predicted_ppm_15m: 415 },
    { timestamp: Date.now() - 30000, ppm: 415, predicted_ppm_15m: 420 },
    { timestamp: Date.now() - 20000, ppm: 418, predicted_ppm_15m: 425 },
    { timestamp: Date.now() - 10000, ppm: 420, predicted_ppm_15m: 430 },
    { timestamp: Date.now(), ppm: 420, predicted_ppm_15m: 435 }
  ])

  const sessions = globalSessions

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let fallbackPollingTimer: ReturnType<typeof setInterval> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let localMockTimer: ReturnType<typeof setInterval> | null = null
  let manualGyroLockUntil = 0
  let shakeTimer: ReturnType<typeof setInterval> | null = null

  const lastPacketAgeSec = computed(() => {
    if (!lastPacketTime.value) return 999
    return Math.max(0, Math.floor((nowTick.value - lastPacketTime.value) / 1000))
  })

  const hardwareStatus = computed<'ONLINE' | 'SIMULATED' | 'OFFLINE'>(() => {
    if (operationMode.value === 'LOCAL') return 'SIMULATED'
    if (lastPacketTime.value && lastPacketAgeSec.value < 8 && lastPacketSource.value === 'HARDWARE') {
      return 'ONLINE'
    }
    return 'OFFLINE'
  })

  const effectiveRiskStatus = computed<TelemetryState['risk_status']>(() => {
    if (telemetry.value.is_shaking || telemetry.value.device_emotion === 'DIZZY') return 'DIZZY'
    if (hardwareStatus.value === 'OFFLINE' && operationMode.value === 'LIVE') return 'SLEEPING'
    return telemetry.value.risk_status
  })

  function applyLiveTelemetry(data: RawTelemetryPayload) {
    if (!data) return
    const isSim = data.source === 'simulator' || operationMode.value === 'LOCAL'
    lastPacketSource.value = isSim ? 'SIMULATOR' : 'HARDWARE'
    lastPacketTime.value = Date.now()

    if (data.ppm !== undefined) telemetry.value.ppm = Number(data.ppm)
    if (data.co_ppm !== undefined) telemetry.value.co_ppm = Number(data.co_ppm)
    else if (data.coPpm !== undefined) telemetry.value.co_ppm = Number(data.coPpm)
    if (data.temperature !== undefined) telemetry.value.temperature = Number(data.temperature)
    if (data.humidity !== undefined) telemetry.value.humidity = Number(data.humidity)
    if (data.delta_ppm_1m !== undefined) telemetry.value.delta_ppm_1m = Number(data.delta_ppm_1m)
    else if (data.delta_ppm !== undefined) telemetry.value.delta_ppm_1m = Number(data.delta_ppm)
    if (data.predicted_ppm_15m !== undefined) telemetry.value.predicted_ppm_15m = Number(data.predicted_ppm_15m)
    if (data.risk_status) telemetry.value.risk_status = parseRiskEmotion(data.risk_status)
    if (data.session_id !== undefined) telemetry.value.session_id = data.session_id
    if (data.timestamp) telemetry.value.timestamp = Number(data.timestamp)
    if (data.device_id) telemetry.value.device_id = data.device_id

    if (data.raw_adc !== undefined) telemetry.value.raw_adc = Number(data.raw_adc)
    else if (data.raw_adc135 !== undefined) telemetry.value.raw_adc = Number(data.raw_adc135)
    else if (data.sensors?.raw_adc135 !== undefined) telemetry.value.raw_adc = Number(data.sensors.raw_adc135)

    if (data.raw_adc7 !== undefined) telemetry.value.raw_adc7 = Number(data.raw_adc7)
    else if (data.sensors?.raw_adc7 !== undefined) telemetry.value.raw_adc7 = Number(data.sensors.raw_adc7)

    if (data.mpu_connected !== undefined) telemetry.value.mpu_connected = Boolean(data.mpu_connected)
    else if (data.sensors?.mpu_connected !== undefined) telemetry.value.mpu_connected = Boolean(data.sensors.mpu_connected)

    const inEyeX = data.eye_x !== undefined ? Number(data.eye_x) : telemetry.value.eye_x
    const inEyeY = data.eye_y !== undefined ? Number(data.eye_y) : telemetry.value.eye_y

    if (Date.now() > manualGyroLockUntil) {
      telemetry.value.eye_x = inEyeX
      telemetry.value.eye_y = inEyeY
      telemetry.value.roll = data.roll !== undefined
        ? Number(data.roll)
        : Math.max(-35, Math.min(35, Number((inEyeX * 3.5).toFixed(1))))
      telemetry.value.pitch = data.pitch !== undefined
        ? Number(data.pitch)
        : Math.max(-30, Math.min(30, Number((-inEyeY * 3.5).toFixed(1))))
    }

    if (data.ax !== undefined) telemetry.value.ax = Number(data.ax)
    else if (data.sensors?.ax !== undefined) telemetry.value.ax = Number(data.sensors.ax)

    if (data.ay !== undefined) telemetry.value.ay = Number(data.ay)
    else if (data.sensors?.ay !== undefined) telemetry.value.ay = Number(data.sensors.ay)

    if (data.az !== undefined) telemetry.value.az = Number(data.az)
    else if (data.sensors?.az !== undefined) telemetry.value.az = Number(data.sensors.az)

    if (data.free_heap !== undefined) telemetry.value.free_heap = Number(data.free_heap)
    else if (data.hardware?.free_heap !== undefined) telemetry.value.free_heap = Number(data.hardware.free_heap)

    if (data.uptime_s !== undefined) telemetry.value.uptime_s = Number(data.uptime_s)
    else if (data.hardware?.uptime_s !== undefined) telemetry.value.uptime_s = Number(data.hardware.uptime_s)

    if (data.offline_pending !== undefined) telemetry.value.offline_pending = Number(data.offline_pending)
    else if (data.storage?.offline_pending !== undefined) telemetry.value.offline_pending = Number(data.storage.offline_pending)

    const rawEmotion = String(data.device_emotion || data.emotion || data.risk_status || 'OPTIMAL').toUpperCase()
    const shaking = Boolean(data.is_shaking) || rawEmotion === 'DIZZY' || Math.sqrt(inEyeX * inEyeX + inEyeY * inEyeY) > 6.0

    if (Date.now() > manualGyroLockUntil) {
      telemetry.value.is_shaking = shaking
      telemetry.value.device_emotion = shaking
        ? 'DIZZY'
        : (rawEmotion === 'PREDICTIVE_WARNING' ? 'WARNING_PREDICTIVE' : parseRiskEmotion(rawEmotion))
    }

    if (data.view_mode === 'FACE' || data.view_mode === 'HUD') {
      telemetry.value.view_mode = data.view_mode
    } else if (data.view_mode === 'VIEW_PET_FACE') {
      telemetry.value.view_mode = 'FACE'
    } else if (data.view_mode === 'VIEW_CIRCULAR_HUD') {
      telemetry.value.view_mode = 'HUD'
    }

    const newPoint: HistoryPoint = {
      timestamp: data.timestamp || Date.now(),
      ppm: Number(data.ppm || telemetry.value.ppm),
      predicted_ppm_15m: Number(data.predicted_ppm_15m || telemetry.value.predicted_ppm_15m)
    }

    const last = history.value[history.value.length - 1]
    if (!last || last.timestamp !== newPoint.timestamp) {
      history.value = [...history.value.slice(-49), newPoint]
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

    const driftEyeX = Number((Math.sin(Date.now() * 0.0012) * 0.35).toFixed(2))
    const driftEyeY = Number((Math.cos(Date.now() * 0.0015) * 0.25).toFixed(2))

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
      telemetry.value.roll = Number((telemetry.value.eye_x * 3.5).toFixed(1))
      telemetry.value.pitch = Number((-telemetry.value.eye_y * 3.5).toFixed(1))
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

  async function setOperationMode(mode: 'LOCAL' | 'LIVE') {
    operationMode.value = mode
    if (mode === 'LOCAL') {
      isSimulatorRunning.value = true
      startLocalMock()
      try {
        await fetch(`${apiBase}/api/simulate/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enable: true })
        })
      } catch {
        // Fallback local mock active
      }
    } else {
      isSimulatorRunning.value = false
      stopLocalMock()
      try {
        await fetch(`${apiBase}/api/simulate/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enable: false })
        })
      } catch {
        // Backend offline
      }
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
            payload?: RawTelemetryPayload | RawTelemetryPayload[]
          }
          if ((msg.type === 'TELEMETRY_UPDATE' || msg.type === 'TELEMETRY_BATCH') && msg.payload) {
            const payload = Array.isArray(msg.payload) ? msg.payload[msg.payload.length - 1] : msg.payload
            if (!payload) return
            if (operationMode.value === 'LIVE' && payload.source === 'simulator') {
              return
            }
            applyLiveTelemetry(payload)
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
    try {
      const res = await fetch(`${apiBase}/api/telemetry/live`)
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: RawTelemetryPayload }
        if (json.success && json.data) {
          const rawTs = Number(json.data.timestamp)
          const ts = rawTs < 946684800000 ? Date.now() : rawTs
          const age = Date.now() - ts
          if (age < 15000 || rawTs < 946684800000) {
            applyLiveTelemetry({ ...json.data, timestamp: ts })
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
    telemetry.value.eye_x = Number(eyeX.toFixed(2))
    telemetry.value.eye_y = Number(eyeY.toFixed(2))
    telemetry.value.roll = Number((eyeX * 3.5).toFixed(1))
    telemetry.value.pitch = Number((-eyeY * 3.5).toFixed(1))
    telemetry.value.is_shaking = shaking
    if (shaking) {
      telemetry.value.device_emotion = 'DIZZY'
    } else if (telemetry.value.device_emotion === 'DIZZY') {
      telemetry.value.device_emotion = telemetry.value.risk_status === 'DIZZY' ? 'OPTIMAL' : telemetry.value.risk_status
    }
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
    connectWebSocket()
    fetchLiveTelemetry()
    fetchHistory()
    fetchSessions()
    if (operationMode.value === 'LOCAL') {
      startLocalMock()
    }

    tickTimer = setInterval(() => {
      nowTick.value = Date.now()
    }, 1000)

    fallbackPollingTimer = setInterval(() => {
      if (!wsConnected.value && operationMode.value === 'LIVE') {
        fetchLiveTelemetry()
      }
    }, 3500)
  })

  onUnmounted(() => {
    if (socket) {
      socket.close()
      socket = null
    }
    stopLocalMock()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (fallbackPollingTimer) clearInterval(fallbackPollingTimer)
    if (tickTimer) clearInterval(tickTimer)
    if (shakeTimer) clearInterval(shakeTimer)
  })

  return {
    telemetry,
    history,
    sessions,
    selectedSessionId,
    wsConnected,
    operationMode,
    isSimulatorRunning,
    hardwareStatus,
    effectiveRiskStatus,
    lastPacketAgeSec,
    isModalOpen,
    viewMode,
    setOperationMode,
    toggleViewMode,
    setManualGyro,
    triggerGyroShake,
    selectSession,
    updateSession,
    deleteSession,
    fetchSessions,
    fetchHistory
  }
}
