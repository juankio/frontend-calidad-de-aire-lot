import { ref, computed } from 'vue'
import type { Gc9a01Emotion } from '~/utils/gc9a01Renderer'
import type { TelemetryState, SessionData, HistoryPoint } from './types'

export const DEFAULT_SESSIONS: SessionData[] = [
  {
    id: 'loc-1', name: 'Universidad - Campus Central',
    description: 'Toma de muestras en plazoleta de aulas de ingeniería',
    latitude: 4.1450, longitude: -73.6280, radius_meters: 120,
    start_time: Date.now() - 3600000 * 4, total_samples: 54, avg_ppm: 435, max_ppm: 580
  },
  {
    id: 'loc-2', name: 'Parque Central Los Libertadores',
    description: 'Zona arbolada con alta circulación peatonal',
    latitude: 4.1500, longitude: -73.6330, radius_meters: 150,
    start_time: Date.now() - 3600000 * 3, total_samples: 68, avg_ppm: 395, max_ppm: 440
  },
  {
    id: 'loc-3', name: 'Laboratorio de Prototipado IoT',
    description: 'Ensayos con aerosoles y cautines de soldadura',
    latitude: 4.1420, longitude: -73.6266, radius_meters: 60,
    start_time: Date.now() - 3600000 * 2, total_samples: 92, avg_ppm: 820, max_ppm: 1450
  },
  {
    id: 'loc-4', name: 'Hogar - Base Operativa',
    description: 'Monitoreo ambiental residencial continuo',
    latitude: 4.1380, longitude: -73.6220, radius_meters: 80,
    start_time: Date.now() - 3600000, total_samples: 110, avg_ppm: 455, max_ppm: 610
  }
]

export const LOCAL_IDLE_CAROUSEL: ReadonlyArray<Gc9a01Emotion> = [
  'OPTIMAL', 'BUBBLEGUM', 'GLASSES_COOL', 'RAMEN', 'COFFEE',
  'MUSIC_VIBE', 'BUTTERFLY', 'WINK', 'LOVE', 'DERP',
  'BABY_SLEEP', 'DETECTIVE', 'WHISTLE', 'ZEN', 'LAUGHING'
]

export const sessions = ref<SessionData[]>(DEFAULT_SESSIONS)
export const selectedSessionId = ref<string | null>(null)
export const activeSessionId = selectedSessionId

export const wsConnected = ref(false)
export const usbConnected = ref(false)
export const operationMode = ref<'LOCAL' | 'LIVE'>('LIVE')
export const isSimulatorRunning = ref(false)
export const isModalOpen = ref(false)

export const lastPacketTime = ref<number | null>(null)
export const lastPacketSource = ref<'HARDWARE' | 'SIMULATOR' | 'NONE'>('NONE')
export const nowTick = ref(Date.now())
export const gyroTareOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 })
export const shakeComboCount = ref(0)

export const telemetry = ref<TelemetryState>({
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

export const history = ref<HistoryPoint[]>([
  { timestamp: Date.now() - 40000, ppm: 410, predicted_ppm_15m: 415 },
  { timestamp: Date.now() - 30000, ppm: 415, predicted_ppm_15m: 420 },
  { timestamp: Date.now() - 20000, ppm: 418, predicted_ppm_15m: 425 },
  { timestamp: Date.now() - 10000, ppm: 420, predicted_ppm_15m: 430 },
  { timestamp: Date.now(), ppm: 420, predicted_ppm_15m: 435 }
])

export const runtimeState = {
  socket: null as WebSocket | null,
  reconnectTimer: null as ReturnType<typeof setTimeout> | null,
  fallbackPollingTimer: null as ReturnType<typeof setInterval> | null,
  tickTimer: null as ReturnType<typeof setInterval> | null,
  localMockTimer: null as ReturnType<typeof setInterval> | null,
  shakeTimer: null as ReturnType<typeof setInterval> | null,
  usbIngestDebounceTimer: null as ReturnType<typeof setTimeout> | null,
  lastSeenServerTimestamp: null as number | null,
  manualGyroLockUntil: 0,
  lastRawEyeX: 0,
  lastRawEyeY: 0,
  lastUsbIngestSentAt: 0,
  activeConsumers: 0,
  lastManualShakeAt: 0,
  lastManualDragDir: 0,
  manualRapidWhipCount: 0,
  lastManualDragFlipAt: 0,
  mockTrend: 1
}

export const viewMode = computed<'FACE' | 'HUD'>(() => telemetry.value.view_mode)

export const lastPacketAgeSec = computed<number | null>(() => {
  if (lastPacketTime.value === null) return null
  return Math.max(0, Math.floor((nowTick.value - lastPacketTime.value) / 1000))
})

export const hardwareStatus = computed<'ONLINE' | 'SIMULATED' | 'OFFLINE'>(() => {
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

export const isHardwareOnline = computed<boolean>(
  () => operationMode.value === 'LOCAL' || hardwareStatus.value === 'ONLINE'
)

export const effectiveRiskStatus = computed<TelemetryState['risk_status']>(() => {
  const emo = telemetry.value.device_emotion
  if (telemetry.value.is_shaking || emo === 'DIZZY' || emo === 'NAUSEA' || emo === 'VOMIT') {
    return 'DIZZY'
  }
  if (
    operationMode.value === 'LIVE' &&
    hardwareStatus.value === 'OFFLINE' &&
    nowTick.value >= runtimeState.manualGyroLockUntil &&
    Date.now() >= runtimeState.manualGyroLockUntil
  ) {
    return 'SLEEPING'
  }
  return telemetry.value.risk_status
})

export const currentSession = computed<SessionData | null>(() => {
  if (!selectedSessionId.value) return null
  return sessions.value.find((s) => (s.id || s.session_id) === selectedSessionId.value) ?? null
})

export function resolveApiConfig(): { apiBase: string; wsBase: string } {
  const fallbackApi = 'https://servidor-taller.tailf19567.ts.net:10000'
  try {
    const config = useRuntimeConfig()
    const apiBase = String(config.public?.apiBase || fallbackApi).replace(/\/+$/, '')
    const wsBase = String(config.public?.wsBase || apiBase.replace(/^http/, 'ws')).replace(/\/+$/, '')
    return { apiBase, wsBase }
  } catch {
    return { apiBase: fallbackApi, wsBase: fallbackApi.replace(/^http/, 'ws') }
  }
}
