import { telemetry, operationMode, gyroTareOffset, shakeComboCount, runtimeState, resolveApiConfig } from './state'
import { parseRiskEmotion } from './parsers'

function clearShakeTimer() {
  if (runtimeState.shakeTimer) { clearInterval(runtimeState.shakeTimer); runtimeState.shakeTimer = null }
}

function resetPoseToIdle(overrideEmotion?: string) {
  Object.assign(telemetry.value, {
    eye_x: 0, eye_y: 0, roll: 0, pitch: 0, is_shaking: false,
    device_emotion: overrideEmotion ?? (telemetry.value.risk_status === 'DIZZY' ? 'OPTIMAL' : telemetry.value.risk_status)
  })
}

function applyShakeFrame(sx: number, sy: number, rollScale: number, pitchScale: number, clampDeg = 35) {
  Object.assign(telemetry.value, {
    eye_x: Number(sx.toFixed(2)), eye_y: Number(sy.toFixed(2)),
    roll: Number(Math.max(-clampDeg, Math.min(clampDeg, sx * rollScale)).toFixed(1)),
    pitch: Number(Math.max(-30, Math.min(30, -sy * pitchScale)).toFixed(1))
  })
}

function applyRockingFrame(elapsed: number) {
  const rollOsc = Math.sin(elapsed * 0.0055) * 18
  Object.assign(telemetry.value, { roll: Number(rollOsc.toFixed(1)), eye_x: Number((rollOsc / 9.0).toFixed(2)) })
}

function postDeviceCommand(payload: Record<string, unknown>) {
  if (operationMode.value !== 'LIVE') return
  const { apiBase } = resolveApiConfig()
  fetch(`${apiBase}/api/telemetry/command`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: telemetry.value.device_id || 'air-guardian-01', ...payload })
  }).catch(() => {})
}

export function sendRemoteEmotionCommand(emotion: string, viewModeCmd: 'FACE' | 'HUD' = 'FACE') {
  postDeviceCommand({ view_mode: viewModeCmd, emotion })
}

export function toggleScreenViewMode() {
  const nextMode: 'FACE' | 'HUD' = telemetry.value.view_mode === 'FACE' ? 'HUD' : 'FACE'
  telemetry.value.view_mode = nextMode; postDeviceCommand({ view_mode: nextMode })
}
export const toggleViewMode = toggleScreenViewMode

export function setManualGyro(eyeX: number, eyeY: number, shaking = false, durationMs = 4500) {
  const now = Date.now()
  runtimeState.manualGyroLockUntil = now + durationMs
  const clampedEyeX = Math.max(-20, Math.min(20, Number(eyeX) || 0))
  const clampedEyeY = Math.max(-10, Math.min(10, Number(eyeY) || 0))
  const currentDir = Math.abs(clampedEyeX) > 6 ? Math.sign(clampedEyeX) : 0
  if (currentDir !== 0 && currentDir !== runtimeState.lastManualDragDir) {
    runtimeState.manualRapidWhipCount = now - runtimeState.lastManualDragFlipAt < 450 ? runtimeState.manualRapidWhipCount + 1 : 1
    runtimeState.lastManualDragDir = currentDir; runtimeState.lastManualDragFlipAt = now
    if (runtimeState.manualRapidWhipCount >= 4) { runtimeState.manualRapidWhipCount = 0; triggerGyroShake(); return }
  }
  let computedRoll = clampedEyeX * 9.0
  while (computedRoll > 180) computedRoll -= 360
  while (computedRoll < -180) computedRoll += 360
  Object.assign(telemetry.value, {
    roll: Number(computedRoll.toFixed(1)), pitch: Number(Math.max(-90, Math.min(90, clampedEyeY * 9.0)).toFixed(1)),
    eye_x: Number(Math.max(-10, Math.min(10, clampedEyeX)).toFixed(2)), eye_y: Number(Math.max(-10, Math.min(10, clampedEyeY)).toFixed(2)),
    is_shaking: shaking
  })
  if (shaking) telemetry.value.device_emotion = 'DIZZY'
  else if (Math.abs(computedRoll) > 135) telemetry.value.device_emotion = 'UPSIDE_DOWN'
  else if (computedRoll < -55) telemetry.value.device_emotion = 'WALL_LEFT'
  else if (computedRoll > 55) telemetry.value.device_emotion = 'WALL_RIGHT'
  else if (['DIZZY', 'UPSIDE_DOWN', 'WALL_LEFT', 'WALL_RIGHT'].includes(String(telemetry.value.device_emotion))) {
    telemetry.value.device_emotion = telemetry.value.risk_status === 'DIZZY' ? 'OPTIMAL' : telemetry.value.risk_status
  }
}

export function calibrateGyroZero() {
  clearShakeTimer()
  gyroTareOffset.value = { x: runtimeState.lastRawEyeX, y: runtimeState.lastRawEyeY }
  runtimeState.manualGyroLockUntil = 0; shakeComboCount.value = 0; resetPoseToIdle()
}

export function triggerGyroShake() {
  clearShakeTimer()
  const startMs = Date.now()
  const elapsedSinceLast = startMs - runtimeState.lastManualShakeAt
  if (shakeComboCount.value === 1 && elapsedSinceLast <= 4500) shakeComboCount.value = 2
  else if (shakeComboCount.value >= 2 && elapsedSinceLast <= 5500) shakeComboCount.value = 3
  else shakeComboCount.value = 1
  runtimeState.lastManualShakeAt = startMs
  const stage = shakeComboCount.value; const durationMs = stage >= 3 ? 6800 : 3400
  runtimeState.manualGyroLockUntil = startMs + durationMs
  const initialStageEmotion = stage === 1 ? 'DIZZY' : stage === 2 ? 'NAUSEA' : 'VOMIT'
  Object.assign(telemetry.value, { view_mode: 'FACE', is_shaking: true, device_emotion: initialStageEmotion })
  sendRemoteEmotionCommand(initialStageEmotion, 'FACE')
  let wiperSent = false; let tick = 0
  runtimeState.shakeTimer = setInterval(() => {
    tick++
    const elapsed = Date.now() - startMs
    if (elapsed >= durationMs) { clearShakeTimer(); if (stage >= 3) shakeComboCount.value = 0; resetPoseToIdle(); return }
    if (stage >= 3 && elapsed >= 3600) {
      if (!wiperSent) { wiperSent = true; sendRemoteEmotionCommand('WIPER', 'FACE') }
      resetPoseToIdle('WIPER'); telemetry.value.eye_x = Number((Math.sin((elapsed - 3600) * 0.0065) * 4.5).toFixed(2))
      return
    }
    const decay = Math.max(0.2, 1 - elapsed / (stage >= 3 ? 3600 : durationMs))
    const amp = stage >= 3 ? 8.5 : stage === 2 ? 7.8 : 7.2
    applyShakeFrame(Math.sin(tick * 1.9) * amp * decay, Math.cos(tick * 2.3) * (amp * 0.88) * decay, 3.5, 3.5)
    telemetry.value.is_shaking = true; telemetry.value.device_emotion = initialStageEmotion
  }, 60)
}

export function triggerBabyRocking() {
  clearShakeTimer()
  const durationMs = 8500; const startMs = Date.now()
  runtimeState.manualGyroLockUntil = startMs + durationMs
  telemetry.value.view_mode = 'FACE'; resetPoseToIdle('BABY_ROCKING'); sendRemoteEmotionCommand('BABY_ROCKING', 'FACE')
  let sleepSent = false
  runtimeState.shakeTimer = setInterval(() => {
    const elapsed = Date.now() - startMs
    if (elapsed >= durationMs) { clearShakeTimer(); resetPoseToIdle(); return }
    if (elapsed < 3400) {
      Object.assign(telemetry.value, { device_emotion: 'BABY_ROCKING', is_shaking: false, eye_y: 0 })
      applyRockingFrame(elapsed); telemetry.value.pitch = Number((Math.cos(elapsed * 0.0028) * 2.5).toFixed(1))
    } else {
      if (!sleepSent) { sleepSent = true; sendRemoteEmotionCommand('BABY_SLEEP', 'FACE') }
      resetPoseToIdle('BABY_SLEEP')
    }
  }, 60)
}

export function triggerCustomEmotion(emotion: string, durationMs = 4800) {
  if (emotion === 'BABY_ROCKING') { triggerBabyRocking(); return }
  clearShakeTimer()
  const targetEmotion = parseRiskEmotion(emotion); const startMs = Date.now()
  const effectiveDuration = targetEmotion === 'VOMIT' ? 8200 : targetEmotion === 'BABY_SLEEP' ? 6200 : durationMs
  runtimeState.manualGyroLockUntil = startMs + effectiveDuration
  if (targetEmotion === 'VOMIT') {
    Object.assign(telemetry.value, { view_mode: 'FACE', is_shaking: true, device_emotion: 'NAUSEA' })
    sendRemoteEmotionCommand('VOMIT', 'FACE')
  } else if (targetEmotion === 'BABY_SLEEP') {
    telemetry.value.view_mode = 'FACE'; resetPoseToIdle('YAWN'); sendRemoteEmotionCommand('YAWN', 'FACE')
  } else if (targetEmotion === 'SNEEZE') {
    telemetry.value.view_mode = 'FACE'; resetPoseToIdle('SUSPICIOUS'); sendRemoteEmotionCommand('SUSPICIOUS', 'FACE')
  } else {
    const shouldShake = ['DIZZY', 'NAUSEA'].includes(targetEmotion)
    Object.assign(telemetry.value, { view_mode: 'FACE', is_shaking: shouldShake, device_emotion: targetEmotion })
    sendRemoteEmotionCommand(targetEmotion, 'FACE')
    if (targetEmotion === 'UPSIDE_DOWN') { telemetry.value.roll = 180; telemetry.value.pitch = 0 }
    else if (!shouldShake) resetPoseToIdle(targetEmotion)
  }
  let tick = 0; let secondStageSent = false
  runtimeState.shakeTimer = setInterval(() => {
    tick++
    const elapsed = Date.now() - startMs
    if (elapsed >= effectiveDuration) { clearShakeTimer(); resetPoseToIdle(); return }
    if (targetEmotion === 'VOMIT') {
      if (elapsed < 1100) {
        telemetry.value.device_emotion = 'NAUSEA'; telemetry.value.is_shaking = true
        applyShakeFrame(Math.sin(tick * 1.6) * 4.2, Math.cos(tick * 1.9) * 3.5, 2.2, 2.0, 45)
      } else if (elapsed < 3900) {
        telemetry.value.device_emotion = 'VOMIT'; telemetry.value.is_shaking = true
        applyShakeFrame(Math.sin(tick * 1.9) * 6.5, Math.cos(tick * 2.2) * 5.2, 2.8, 2.5, 65)
      } else if (elapsed < 6600) {
        resetPoseToIdle('WIPER'); telemetry.value.eye_x = Number((Math.sin((elapsed - 3900) * 0.0065) * 4.5).toFixed(2))
      } else { resetPoseToIdle('RECOVERY') }
      return
    }
    if (targetEmotion === 'BABY_SLEEP') {
      if (elapsed < 1500) resetPoseToIdle('YAWN')
      else { if (!secondStageSent) { secondStageSent = true; sendRemoteEmotionCommand('BABY_SLEEP', 'FACE') }; resetPoseToIdle('BABY_SLEEP') }
      return
    }
    if (targetEmotion === 'SNEEZE') {
      if (elapsed < 700) resetPoseToIdle('SUSPICIOUS')
      else {
        if (!secondStageSent) { secondStageSent = true; sendRemoteEmotionCommand('SNEEZE', 'FACE') }
        resetPoseToIdle('SNEEZE'); applyShakeFrame(Math.sin(tick * 2.4) * 3.2, Math.cos(tick * 2.6) * 2.8, 1.8, 1.8, 25)
      }
      return
    }
    const shouldShake = ['DIZZY', 'NAUSEA'].includes(targetEmotion)
    telemetry.value.device_emotion = targetEmotion; telemetry.value.is_shaking = shouldShake
    if (shouldShake) applyShakeFrame(Math.sin(tick * 1.8) * 5.5, Math.cos(tick * 2.1) * 4.5, 2.5, 2.2, 90)
  }, 60)
}
