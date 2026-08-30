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

export function useAirGuardian() {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || 'http://localhost:3002'
  const wsBase = (config.public.wsBase as string) || 'ws://localhost:3002'

  const wsConnected = ref(false)
  const isSimulatorRunning = ref(false)
  const isModalOpen = ref(false)
  const viewMode = ref<'FACE' | 'HUD'>('FACE')
  const selectedSessionId = ref<string | null>(null)

  // Tracking estricto de paquetes
  const lastPacketTime = ref<number | null>(null)
  const lastPacketSource = ref<'HARDWARE' | 'SIMULATOR' | 'NONE'>('NONE')
  const nowTick = ref(Date.now())

  const telemetry = reactive<TelemetryData>({
    device_id: 'air-guardian-01',
    timestamp: 0,
    ppm: 400,
    co_ppm: 0,
    temperature: 24.0,
    humidity: 50,
    delta_ppm_1m: 0,
    predicted_ppm_15m: 400,
    risk_status: 'SLEEPING',
    session_id: null
  })

  const history = ref<HistoryPoint[]>([])
  const sessions = ref<SessionData[]>([])

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let fallbackPollingTimer: ReturnType<typeof setInterval> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null

  // Cálculo reactivo de segundos transcurridos
  const lastPacketAgeSec = computed(() => {
    if (!lastPacketTime.value) return 999
    return Math.max(0, Math.floor((nowTick.value - lastPacketTime.value) / 1000))
  })

  // Estado del Enlace Inalámbrico
  const hardwareStatus = computed<'ONLINE' | 'SIMULATED' | 'OFFLINE'>(() => {
    if (isSimulatorRunning.value) return 'SIMULATED'
    if (lastPacketTime.value && lastPacketAgeSec.value < 8 && lastPacketSource.value === 'HARDWARE') {
      return 'ONLINE'
    }
    return 'OFFLINE'
  })

  // Si está OFFLINE y no está simulando, la mascota duerme
  const effectiveRiskStatus = computed(() => {
    if (hardwareStatus.value === 'OFFLINE') return 'SLEEPING'
    return telemetry.risk_status
  })

  function updateFromPayload(data: any) {
    if (!data) return
    const isSim = data.source === 'simulator' || isSimulatorRunning.value
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
          if (msg.type === 'TELEMETRY_UPDATE' && msg.payload) {
            updateFromPayload(msg.payload)
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
          const age = Date.now() - Number(json.data.timestamp)
          // Solo si tiene menos de 8 segundos lo consideramos paquete en vivo
          if (age < 8000) {
            updateFromPayload(json.data)
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
        if (json.success && Array.isArray(json.data)) {
          sessions.value = json.data
        }
      }
    } catch (err) {
      console.error('Error fetching sessions', err)
    }
  }

  async function checkSimulatorStatus() {
    try {
      const res = await fetch(`${apiBase}/api/simulate/status`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          isSimulatorRunning.value = !!json.data.running
        }
      }
    } catch {
      // Ignored
    }
  }

  async function toggleSimulator(forceState?: boolean) {
    try {
      const nextState = forceState !== undefined ? forceState : !isSimulatorRunning.value
      console.log('toggleSimulator triggered! Target state:', nextState)
      const res = await fetch(`${apiBase}/api/simulate/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: nextState })
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          isSimulatorRunning.value = !!json.data.running
          if (isSimulatorRunning.value) {
            lastPacketSource.value = 'SIMULATOR'
            lastPacketTime.value = Date.now()
          }
        }
      }
    } catch (err) {
      console.error('Error toggling simulator', err)
    }
  }

  function selectSession(id: string) {
    if (selectedSessionId.value === id) {
      selectedSessionId.value = null
      fetchHistory(null)
    } else {
      selectedSessionId.value = id
      fetchHistory(id)
    }
  }

  function toggleViewMode() {
    viewMode.value = viewMode.value === 'FACE' ? 'HUD' : 'FACE'
  }

  onMounted(() => {
    connectWebSocket()
    checkSimulatorStatus()
    fetchLiveTelemetry()
    fetchHistory()
    fetchSessions()

    tickTimer = setInterval(() => {
      nowTick.value = Date.now()
    }, 1000)

    fallbackPollingTimer = setInterval(() => {
      if (!wsConnected.value) {
        fetchLiveTelemetry()
      }
      fetchSessions()
    }, 3500)
  })

  onUnmounted(() => {
    if (socket) {
      socket.close()
      socket = null
    }
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
    isSimulatorRunning,
    hardwareStatus,
    effectiveRiskStatus,
    lastPacketAgeSec,
    isModalOpen,
    viewMode,
    toggleSimulator,
    toggleViewMode,
    selectSession,
    fetchSessions,
    fetchHistory
  }
}
