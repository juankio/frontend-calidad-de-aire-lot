import type { Gc9a01Emotion } from '~/utils/gc9a01Renderer'
import type { TelemetryState } from './types'
import {
  telemetry,
  operationMode,
  isSimulatorRunning,
  wsConnected,
  lastPacketTime,
  lastPacketSource,
  LOCAL_IDLE_CAROUSEL,
  runtimeState
} from './state'
import { applyLiveTelemetry } from './parsers'
import { disableBackendSimulator, fetchLiveTelemetry, connectWebSocket } from './networkSync'

export function runLocalMockStep() {
  if (operationMode.value !== 'LOCAL') return
  let curPpm = telemetry.value.ppm
  if (curPpm > 1200) runtimeState.mockTrend = -1
  if (curPpm < 415) runtimeState.mockTrend = 1
  curPpm = Math.round((curPpm + runtimeState.mockTrend * (12 + Math.random() * 20)) * 10) / 10

  const mockDelta = runtimeState.mockTrend * 18
  const mockPred = Math.round(curPpm + mockDelta * 10)
  let mockRisk: TelemetryState['risk_status'] = 'OPTIMAL'
  if (curPpm > 1050) mockRisk = 'CRITICAL'
  else if (mockDelta > 20 || curPpm > 750) mockRisk = 'WARNING_PREDICTIVE'
  else if (mockDelta < -15) mockRisk = 'RECOVERY'

  const nowMs = Date.now()
  const driftEyeX = Number((Math.sin(nowMs * 0.0012) * 2.2).toFixed(2))
  const driftEyeY = Number((Math.cos(nowMs * 0.0009) * 1.4).toFixed(2))
  const isGestureWindow = Math.floor(nowMs / 2000) % 8 === 0
  const carouselIdx = Math.floor(nowMs / 16000) % LOCAL_IDLE_CAROUSEL.length
  const carouselEmotion: Gc9a01Emotion =
    mockRisk === 'CRITICAL'
      ? 'CRITICAL'
      : mockRisk === 'WARNING_PREDICTIVE'
        ? 'WARNING_PREDICTIVE'
        : isGestureWindow
          ? (LOCAL_IDLE_CAROUSEL[carouselIdx] ?? 'OPTIMAL')
          : 'OPTIMAL'

  applyLiveTelemetry({
    device_id: 'air-guardian-01',
    timestamp: nowMs,
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
    device_emotion: carouselEmotion,
    view_mode: telemetry.value.view_mode
  })

  if (Date.now() > runtimeState.manualGyroLockUntil) {
    telemetry.value.eye_x = driftEyeX
    telemetry.value.eye_y = driftEyeY
    telemetry.value.roll = 0
    telemetry.value.pitch = 0
    telemetry.value.is_shaking = false
    telemetry.value.device_emotion = carouselEmotion
  }
}

export function startLocalMock() {
  if (runtimeState.localMockTimer) clearInterval(runtimeState.localMockTimer)
  runtimeState.localMockTimer = setInterval(runLocalMockStep, 2000)
}

export function stopLocalMock() {
  if (runtimeState.localMockTimer) {
    clearInterval(runtimeState.localMockTimer)
    runtimeState.localMockTimer = null
  }
}

export async function setOperationMode(mode: 'LOCAL' | 'LIVE') {
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
    runtimeState.lastSeenServerTimestamp = null
    fetchLiveTelemetry()
    if (!wsConnected.value) {
      connectWebSocket()
    }
  }
}

export async function toggleSimulator() {
  const nextMode: 'LOCAL' | 'LIVE' = operationMode.value === 'LOCAL' ? 'LIVE' : 'LOCAL'
  await setOperationMode(nextMode)
}
