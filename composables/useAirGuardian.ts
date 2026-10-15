import { onMounted, onUnmounted } from 'vue'
import {
  telemetry, history, sessions, selectedSessionId, activeSessionId,
  wsConnected, usbConnected, operationMode, isSimulatorRunning, isModalOpen,
  lastPacketTime, lastPacketSource, nowTick, gyroTareOffset, shakeComboCount,
  viewMode, lastPacketAgeSec, hardwareStatus, isHardwareOnline,
  effectiveRiskStatus, currentSession, runtimeState
} from './airGuardian/state'
import {
  parseRiskEmotion, mergeTelemetryLayers, applyBackendSample, applyLiveTelemetry
} from './airGuardian/parsers'
import {
  sendRemoteEmotionCommand, toggleScreenViewMode, toggleViewMode, setManualGyro,
  calibrateGyroZero, triggerGyroShake, triggerBabyRocking, triggerCustomEmotion
} from './airGuardian/gyroActions'
import {
  disableBackendSimulator, forwardUsbTelemetryToBackend, ingestUsbSerialStatus,
  markUsbDisconnected, connectWebSocket, fetchLiveTelemetry
} from './airGuardian/networkSync'
import {
  runLocalMockStep, startLocalMock, stopLocalMock, setOperationMode, toggleSimulator
} from './airGuardian/simulatorMock'
import {
  fetchHistory, fetchSessions, selectSession, createSession, updateSession,
  deleteSession, fetchAnalyticsSummary, compareSessions, exportDatasetUrl
} from './airGuardian/sessionsApi'

export * from './airGuardian/types'
export { parseRiskEmotion }

export function useAirGuardian() {
  onMounted(() => {
    runtimeState.activeConsumers++
    if (runtimeState.activeConsumers > 1) return

    disableBackendSimulator()
    connectWebSocket()
    fetchLiveTelemetry()
    fetchHistory()
    fetchSessions()
    if (operationMode.value === 'LOCAL') {
      runLocalMockStep()
      startLocalMock()
    }

    if (runtimeState.tickTimer) clearInterval(runtimeState.tickTimer)
    runtimeState.tickTimer = setInterval(() => {
      nowTick.value = Date.now()
    }, 1000)

    if (runtimeState.fallbackPollingTimer) clearInterval(runtimeState.fallbackPollingTimer)
    runtimeState.fallbackPollingTimer = setInterval(() => {
      const reconnectTimer = runtimeState.reconnectTimer
      if (operationMode.value === 'LIVE' && !reconnectTimer) {
        fetchLiveTelemetry()
      } else if (operationMode.value === 'LIVE') {
        fetchLiveTelemetry()
      }
    }, 2000)
  })

  onUnmounted(() => {
    runtimeState.activeConsumers = Math.max(0, runtimeState.activeConsumers - 1)
    if (runtimeState.activeConsumers > 0) return

    if (runtimeState.socket) {
      runtimeState.socket.close()
      runtimeState.socket = null
    }
    stopLocalMock()
    if (runtimeState.reconnectTimer) clearTimeout(runtimeState.reconnectTimer)
    if (runtimeState.fallbackPollingTimer) clearInterval(runtimeState.fallbackPollingTimer)
    if (runtimeState.tickTimer) clearInterval(runtimeState.tickTimer)
    if (runtimeState.shakeTimer) clearInterval(runtimeState.shakeTimer)
    if (runtimeState.usbIngestDebounceTimer) clearTimeout(runtimeState.usbIngestDebounceTimer)
  })

  return {
    telemetry, history, sessions, selectedSessionId, activeSessionId,
    wsConnected, usbConnected, operationMode, isSimulatorRunning,
    hardwareStatus, isHardwareOnline, effectiveRiskStatus, lastPacketAgeSec,
    lastPacketTime, lastPacketSource, currentSession, isModalOpen, viewMode,
    gyroTareOffset, shakeComboCount,
    ingestUsbSerialStatus, markUsbDisconnected, forwardUsbTelemetryToBackend,
    disableBackendSimulator, connectWebSocket, fetchLiveTelemetry,
    mergeTelemetryLayers, applyBackendSample, applyLiveTelemetry,
    runLocalMockStep, startLocalMock, stopLocalMock, setOperationMode, toggleSimulator,
    sendRemoteEmotionCommand, toggleViewMode, toggleScreenViewMode,
    setManualGyro, calibrateGyroZero, triggerGyroShake, triggerBabyRocking, triggerCustomEmotion,
    selectSession, createSession, updateSession, deleteSession,
    fetchSessions, fetchHistory, fetchAnalyticsSummary, compareSessions, exportDatasetUrl
  }
}
