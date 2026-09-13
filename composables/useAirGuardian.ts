import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export interface TelemetryData {
  device_id: string
  timestamp: number
  ppm: number
  co_ppm: number
  temperature: number
  humidity: number
  delta_ppm_1m: number
  predicted_ppm_15m: number
  risk_status: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  session_id?: string | null
  source?: 'hardware' | 'simulator'
  raw_adc?: number
  raw_adc7?: number
  mpu_connected?: boolean
  eye_x?: number
  eye_y?: number
  free_heap?: number
  uptime_s?: number
  offline_pending?: number
  device_emotion?: string
  view_mode?: string
}

export interface SessionData {
  id: string
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

export function useAirGuardian() {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || 'http://localhost:3002'
  const wsBase = (config.public.wsBase as string) || 'ws://localhost:3002'

  const wsConnected = ref(false)
  const operationMode = ref<'LOCAL' | 'LIVE'>('LIVE')
  const isSimulatorRunning = ref(false)
  const isModalOpen = ref(false)
  const viewMode = ref<'FACE' | 'HUD'>('FACE')
  const selectedSessionId = globalSelectedSessionId

  // Tracking estricto de paquetes
  const lastPacketTime = ref<number | null>(Date.now())
  const lastPacketSource = ref<'HARDWARE' | 'SIMULATOR' | 'NONE'>('HARDWARE')
  const nowTick = ref(Date.now())

  const telemetry = reactive<TelemetryData>({
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

  const sessions = globalSessions

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let fallbackPollingTimer: ReturnType<typeof setInterval> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let localMockTimer: ReturnType<typeof setInterval> | null = null

  // Cálculo reactivo de segundos transcurridos
  const lastPacketAgeSec = computed(() => {
    if (!lastPacketTime.value) return 999
    return Math.max(0, Math.floor((nowTick.value - lastPacketTime.value) / 1000))
  })

  // Estado del Enlace Inalámbrico
  const hardwareStatus = computed<'ONLINE' | 'SIMULATED' | 'OFFLINE'>(() => {
    if (operationMode.value === 'LOCAL') return 'SIMULATED'
    if (lastPacketTime.value && lastPacketAgeSec.value < 8 && lastPacketSource.value === 'HARDWARE') {
      return 'ONLINE'
    }
    return 'OFFLINE'
  })

  // Si está OFFLINE en modo LIVE y no llegan paquetes, la mascota duerme
  const effectiveRiskStatus = computed(() => {
    if (hardwareStatus.value === 'OFFLINE' && operationMode.value === 'LIVE') return 'SLEEPING'
    return telemetry.risk_status
  })

  function updateFromPayload(data: any) {
    if (!data) return
    const isSim = data.source === 'simulator' || operationMode.value === 'LOCAL'
    lastPacketSource.value = isSim ? 'SIMULATOR' : 'HARDWARE'
    lastPacketTime.value = Date.now()

    if (data.ppm !== undefined) telemetry.ppm = Number(data.ppm)
    if (data.co_ppm !== undefined) telemetry.co_ppm = Number(data.co_ppm)
    else if (data.coPpm !== undefined) telemetry.co_ppm = Number(data.coPpm)
    if (data.temperature !== undefined) telemetry.temperature = Number(data.temperature)
    if (data.humidity !== undefined) telemetry.humidity = Number(data.humidity)
    if (data.delta_ppm_1m !== undefined) telemetry.delta_ppm_1m = Number(data.delta_ppm_1m)
    else if (data.delta_ppm !== undefined) telemetry.delta_ppm_1m = Number(data.delta_ppm)
    if (data.predicted_ppm_15m !== undefined) telemetry.predicted_ppm_15m = Number(data.predicted_ppm_15m)
    if (data.risk_status) telemetry.risk_status = data.risk_status
    if (data.session_id !== undefined) telemetry.session_id = data.session_id
    if (data.timestamp) telemetry.timestamp = Number(data.timestamp)
    if (data.device_id) telemetry.device_id = data.device_id

    // Extracción de sensores individuales y telemetría de sistema
    if (data.raw_adc !== undefined) telemetry.raw_adc = Number(data.raw_adc)
    else if (data.raw_adc135 !== undefined) telemetry.raw_adc = Number(data.raw_adc135)
    else if (data.sensors?.raw_adc135 !== undefined) telemetry.raw_adc = Number(data.sensors.raw_adc135)

    if (data.raw_adc7 !== undefined) telemetry.raw_adc7 = Number(data.raw_adc7)
    else if (data.sensors?.raw_adc7 !== undefined) telemetry.raw_adc7 = Number(data.sensors.raw_adc7)

    if (data.mpu_connected !== undefined) telemetry.mpu_connected = Boolean(data.mpu_connected)
    else if (data.sensors?.mpu_connected !== undefined) telemetry.mpu_connected = Boolean(data.sensors.mpu_connected)

    if (data.eye_x !== undefined) telemetry.eye_x = Number(data.eye_x)
    else if (data.sensors?.eye_x !== undefined) telemetry.eye_x = Number(data.sensors.eye_x)

    if (data.eye_y !== undefined) telemetry.eye_y = Number(data.eye_y)
    else if (data.sensors?.eye_y !== undefined) telemetry.eye_y = Number(data.sensors.eye_y)

    if (data.free_heap !== undefined) telemetry.free_heap = Number(data.free_heap)
    else if (data.hardware?.free_heap !== undefined) telemetry.free_heap = Number(data.hardware.free_heap)

    if (data.uptime_s !== undefined) telemetry.uptime_s = Number(data.uptime_s)
    else if (data.hardware?.uptime_s !== undefined) telemetry.uptime_s = Number(data.hardware.uptime_s)

    if (data.offline_pending !== undefined) telemetry.offline_pending = Number(data.offline_pending)
    else if (data.storage?.offline_pending !== undefined) telemetry.offline_pending = Number(data.storage.offline_pending)

    if (data.device_emotion !== undefined) telemetry.device_emotion = String(data.device_emotion)
    else if (data.emotion !== undefined) telemetry.device_emotion = String(data.emotion)

    if (data.view_mode !== undefined) telemetry.view_mode = String(data.view_mode)

    // Sincronización instantánea de view_mode desde el ESP32 / Backend
    if (data.view_mode) {
      const vm = String(data.view_mode).toUpperCase().trim()
      if (vm === 'FACE' || vm === 'VIEW_PET_FACE') {
        viewMode.value = 'FACE'
      } else if (vm === 'HUD' || vm === 'VIEW_CIRCULAR_HUD') {
        viewMode.value = 'HUD'
      }
    }

    // Mapeo y sincronización de emoción desde el ESP32 / Backend hacia telemetry.risk_status
    const emotionRaw = data.device_emotion || data.emotion
    if (emotionRaw) {
      const e = String(emotionRaw).toUpperCase().trim()
      if (e === 'OPTIMAL' || e === 'EMOTION_OPTIMAL' || e === 'HAPPY') {
        telemetry.risk_status = 'OPTIMAL'
      } else if (e === 'WARNING_PREDICTIVE' || e === 'EMOTION_PREDICTIVE_WARNING' || e === 'WARNING' || e === 'ALERT') {
        telemetry.risk_status = 'WARNING_PREDICTIVE'
      } else if (e === 'CRITICAL' || e === 'EMOTION_CRITICAL' || e === 'DANGER' || e === 'ERROR') {
        telemetry.risk_status = 'CRITICAL'
      } else if (e === 'RECOVERY' || e === 'EMOTION_RECOVERY' || e === 'RECOVERING') {
        telemetry.risk_status = 'RECOVERY'
      } else if (e === 'SLEEPING' || e === 'EMOTION_SLEEPING' || e === 'SLEEP') {
        telemetry.risk_status = 'SLEEPING'
      }
    }

    const newPoint: HistoryPoint = {
      timestamp: data.timestamp || Date.now(),
      ppm: Number(data.ppm || telemetry.ppm),
      predicted_ppm_15m: Number(data.predicted_ppm_15m || telemetry.predicted_ppm_15m)
    }

    const last = history.value[history.value.length - 1]
    if (!last || last.timestamp !== newPoint.timestamp) {
      history.value = [...history.value.slice(-49), newPoint]
    }
  }

  // Generador local de contingencia para modo quemado / offline
  let mockTrend = 1
  function runLocalMockStep() {
    if (operationMode.value !== 'LOCAL') return
    let curPpm = telemetry.ppm
    if (curPpm > 1200) mockTrend = -1
    if (curPpm < 415) mockTrend = 1
    curPpm = Math.round((curPpm + mockTrend * (12 + Math.random() * 20)) * 10) / 10

    const mockDelta = mockTrend * 18
    const mockPred = Math.round(curPpm + mockDelta * 10)
    let mockRisk: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' = 'OPTIMAL'
    if (curPpm > 1050) mockRisk = 'CRITICAL'
    else if (mockDelta > 20 || curPpm > 750) mockRisk = 'WARNING_PREDICTIVE'
    else if (mockDelta < -15) mockRisk = 'RECOVERY'

    updateFromPayload({
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
      eye_x: Math.round((Math.sin(Date.now() / 1500) * 1.2) * 10) / 10,
      eye_y: Math.round((Math.cos(Date.now() / 2000) * 0.9) * 10) / 10,
      free_heap: 182000 + Math.floor(Math.random() * 4000),
      uptime_s: (telemetry.uptime_s || 3600) + 2,
      offline_pending: 0,
      device_emotion: mockRisk,
      view_mode: viewMode.value
    })
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
        // Backend no disponible, generador local activo
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
          const msg = JSON.parse(event.data)
          if ((msg.type === 'TELEMETRY_UPDATE' || msg.type === 'TELEMETRY_BATCH') && msg.payload) {
            const payload = Array.isArray(msg.payload) ? msg.payload[msg.payload.length - 1] : msg.payload
            if (operationMode.value === 'LIVE' && payload.source === 'simulator') {
              return // Ignorar simulador si estamos en modo hardware 1-a-1
            }
            updateFromPayload(payload)
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
        if (!reconnectTimer) {
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
        const json = await res.json()
        if (json.success && json.data) {
          const rawTs = Number(json.data.timestamp)
          const ts = rawTs < 946684800000 ? Date.now() : rawTs
          const age = Date.now() - ts
          if (age < 15000 || rawTs < 946684800000) {
            updateFromPayload({ ...json.data, timestamp: ts })
          }
        }
      }
    } catch {
      // Ignored
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
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          history.value = json.data.map((item: any) => ({
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
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          sessions.value = json.data.map((item: any) => ({
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
      const payload: Record<string, any> = {}
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

      // Actualizar inmediatamente en estado local para reactividad instantánea
      const idx = sessions.value.findIndex(s => (s.id || (s as any).session_id) === id)
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
      const idx = sessions.value.findIndex(s => (s.id || (s as any).session_id) === id)
      if (idx !== -1) {
        sessions.value[idx] = { ...sessions.value[idx], ...data }
      }
      return false
    }
  }

  async function deleteSession(id: string) {
    if (!id) return false
    try {
      // Si la sesión a eliminar estaba seleccionada, deseleccionar y refrescar historial
      if (selectedSessionId.value === id) {
        selectedSessionId.value = null
        await fetchHistory(null)
      }

      // Eliminar de sessions.value inmediatamente
      sessions.value = sessions.value.filter(s => (s.id || (s as any).session_id) !== id)

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
    viewMode.value = viewMode.value === 'FACE' ? 'HUD' : 'FACE'
    fetch(`${apiBase}/api/telemetry/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: telemetry.device_id || 'air-guardian-01',
        view_mode: viewMode.value
      })
    }).catch(err => {
      console.error('Error sending view_mode command to backend', err)
    })
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
    selectSession,
    updateSession,
    deleteSession,
    fetchSessions,
    fetchHistory
  }
}
