import {
  GC9A01_EMOTION_CATALOG,
  type FaceMetrics,
  type Gc9a01Emotion,
  type Gc9a01RenderParams,
  type SharedAnimState
} from './types'

const VALID_EMOTION_SET = new Set<string>(GC9A01_EMOTION_CATALOG.map((item) => item.id))
const NO_BLINK_EMOTIONS: ReadonlyArray<Gc9a01Emotion> = [
  'DIZZY', 'SLEEPING', 'BABY_SLEEP', 'STARTLED', 'FREEFALL', 'ZEN', 'LAUGHING', 'SNEEZE'
]

export const sharedState: SharedAnimState = {
  lastStepMs: 0,
  breathPhase: 0,
  breathOffset: 0,
  blinkState: 1.0,
  nextBlinkStartMs: 0,
  blinkStartMs: -1,
  saccadeX: 0,
  saccadeY: 0,
  nextSaccadeMs: 0,
  coughOffset: 0,
  nextCoughStartMs: 0,
  coughStartMs: -1,
  currentEyeX: 0,
  currentEyeY: 0,
  eyeVelX: 0,
  eyeVelY: 0
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function getNowMs(explicitNow?: number): number {
  if (explicitNow !== undefined) return explicitNow
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

export function getGc9a01EmotionLabel(emotion?: string): string {
  const norm = normalizeGc9a01Emotion(emotion)
  return GC9A01_EMOTION_CATALOG.find((item) => item.id === norm)?.label ?? norm
}

export function normalizeGc9a01Emotion(rawEmotion?: string, isShaking?: boolean): Gc9a01Emotion {
  const cleaned = (rawEmotion ?? 'OPTIMAL').toUpperCase().trim().replace(/^EMOTION_/, '')
  if (cleaned === 'PREDICTIVE_WARNING' || cleaned === 'WARNING') {
    return isShaking ? 'DIZZY' : 'WARNING_PREDICTIVE'
  }
  if (cleaned === 'DANGER') return isShaking ? 'DIZZY' : 'CRITICAL'
  if (VALID_EMOTION_SET.has(cleaned)) {
    const typed = cleaned as Gc9a01Emotion
    if (isShaking && (typed === 'OPTIMAL' || typed === 'RECOVERY' || typed === 'SLEEPING' || typed === 'WARNING_PREDICTIVE')) {
      return 'DIZZY'
    }
    return typed
  }
  return isShaking ? 'DIZZY' : 'OPTIMAL'
}

export function stepSharedGc9a01Animation(params: Gc9a01RenderParams): void {
  const now = getNowMs(params.nowMs)
  if (sharedState.lastStepMs > 0 && now >= sharedState.lastStepMs && now - sharedState.lastStepMs < 8) return
  sharedState.lastStepMs = now

  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)
  sharedState.breathPhase += 0.075
  sharedState.breathOffset = Math.sin(sharedState.breathPhase) * 3.0

  if (sharedState.nextBlinkStartMs === 0) {
    sharedState.nextBlinkStartMs = now + 2600 + Math.random() * 2500
  }

  if (NO_BLINK_EMOTIONS.includes(emotion)) {
    sharedState.blinkState = 1.0
    sharedState.blinkStartMs = -1
  } else {
    if (sharedState.blinkStartMs < 0 && now >= sharedState.nextBlinkStartMs) sharedState.blinkStartMs = now
    if (sharedState.blinkStartMs >= 0) {
      const elapsed = now - sharedState.blinkStartMs
      if (elapsed <= 75) sharedState.blinkState = 1.0 - (elapsed / 75) * 0.95
      else if (elapsed <= 170) sharedState.blinkState = 0.05 + ((elapsed - 75) / 95) * 0.95
      else {
        sharedState.blinkState = 1.0
        sharedState.blinkStartMs = -1
        sharedState.nextBlinkStartMs = now + 2600 + Math.random() * 2500
      }
    } else {
      sharedState.blinkState = 1.0
    }
  }

  let rawEyeX = params.eyeX ?? 0
  let rawEyeY = params.eyeY ?? 0
  if (emotion === 'BUTTERFLY') {
    rawEyeX = Math.sin(now * 0.0024) * 9.5
    rawEyeY = Math.sin(now * 0.0048) * 6.5 - 2
  } else if (emotion === 'SUSPICIOUS') {
    rawEyeX = Math.sin(now * 0.0032) * 8.5
    rawEyeY = 0
  } else if (emotion === 'WHISTLE') {
    rawEyeX = -5.5
    rawEyeY = -4.5
  }

  if (Math.abs(rawEyeX) < 1.5 && Math.abs(rawEyeY) < 1.5) {
    if (now >= sharedState.nextSaccadeMs) {
      sharedState.nextSaccadeMs = now + 1300 + Math.random() * 2100
      if (Math.random() > 0.3) {
        sharedState.saccadeX = (Math.random() * 2 - 1) * 3.2
        sharedState.saccadeY = (Math.random() * 2 - 1) * 2.6
      } else {
        sharedState.saccadeX = 0
        sharedState.saccadeY = 0
      }
    }
  } else {
    sharedState.saccadeX = 0
    sharedState.saccadeY = 0
  }

  if (emotion === 'WARNING_PREDICTIVE' || emotion === 'SNEEZE') {
    if (sharedState.nextCoughStartMs === 0) sharedState.nextCoughStartMs = now + 1600
    if (sharedState.coughStartMs < 0 && now >= sharedState.nextCoughStartMs) sharedState.coughStartMs = now
    if (sharedState.coughStartMs >= 0) {
      const dt = now - sharedState.coughStartMs
      if (dt <= 450) sharedState.coughOffset = Math.sin(dt * 0.055) * 6.5
      else {
        sharedState.coughOffset = 0
        sharedState.coughStartMs = -1
        sharedState.nextCoughStartMs = now + (emotion === 'SNEEZE' ? 2400 : 3600)
      }
    }
  } else {
    sharedState.coughOffset = 0
    sharedState.coughStartMs = -1
    sharedState.nextCoughStartMs = 0
  }

  const targetX = clamp(rawEyeX * 1.4, -12, 12) + sharedState.saccadeX
  const targetY = clamp(rawEyeY * 1.4, -10, 10) + sharedState.saccadeY
  sharedState.eyeVelX = (sharedState.eyeVelX + (targetX - sharedState.currentEyeX) * 0.16) * 0.72
  sharedState.eyeVelY = (sharedState.eyeVelY + (targetY - sharedState.currentEyeY) * 0.16) * 0.72
  sharedState.currentEyeX += sharedState.eyeVelX
  sharedState.currentEyeY += sharedState.eyeVelY
}

export function computeFaceMetrics(emotion: Gc9a01Emotion, now: number): FaceMetrics {
  const wallShiftX = emotion === 'WALL_LEFT' ? -22 : emotion === 'WALL_RIGHT' ? 22 : 0
  const jitterX = emotion === 'STARTLED' || emotion === 'FREEFALL' ? Math.sin(now * 0.09) * 2.2 : 0
  const vibeBounceY = emotion === 'MUSIC_VIBE' ? Math.abs(Math.sin(now * 0.011)) * 5 : emotion === 'LAUGHING' ? Math.abs(Math.sin(now * 0.014)) * -5 : 0
  const centerY = 120 + sharedState.breathOffset + sharedState.coughOffset + vibeBounceY
  return {
    centerY,
    eyeXPos: [76 + wallShiftX + jitterX, 164 + wallShiftX + jitterX],
    eyeYPos: centerY - 10,
    mouthX: 120 + wallShiftX + jitterX,
    mouthY: centerY + 38,
    wallShiftX,
    jitterX,
    squashRx: 24 + Math.sin(sharedState.breathPhase) * 1.5,
    squashRy: Math.max(2.5, (32 - Math.sin(sharedState.breathPhase) * 1.5) * sharedState.blinkState)
  }
}
