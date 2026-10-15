import type { Gc9a01Emotion } from '~/utils/gc9a01Renderer'

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
  device_emotion: Gc9a01Emotion | string
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

export type SessionRecord = SessionData

export interface HistoryPoint {
  timestamp: number
  ppm: number
  predicted_ppm_15m: number
}

export interface AnalyticsSummary {
  total_samples: number
  avg_ppm: number
  max_ppm: number
  min_ppm: number
  avg_temperature?: number
  avg_humidity?: number
}

export interface ExperimentComparisonResult {
  sessionA: SessionRecord | null
  sessionB: SessionRecord | null
  deltaAvgPpm: number
  deltaMaxPpm: number
}

export interface RawSensorPayload {
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

export interface RawTelemetryPayload {
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
