import type { EmotionTheme, EyeMode, EyebrowMode, Gc9a01Emotion, MouthMode } from './types'

export type AirQualityTier = 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY'

interface AirColorSet {
  bgCenter: string
  bgEdge: string
  primary: string
  pupil: string
  blush: string
}

export const SEMANTIC_AIR_PALETTES: Record<AirQualityTier, AirColorSet> = {
  OPTIMAL: { bgCenter: '#06281b', bgEdge: '#031810', primary: '#10b981', pupil: '#022c22', blush: 'rgba(16, 185, 129, 0.35)' },
  WARNING_PREDICTIVE: { bgCenter: '#331d06', bgEdge: '#1c1003', primary: '#fbbf24', pupil: '#451a03', blush: 'rgba(251, 191, 36, 0.35)' },
  CRITICAL: { bgCenter: '#3d0812', bgEdge: '#220409', primary: '#f43f5e', pupil: '#4c0519', blush: 'rgba(244, 63, 94, 0.45)' },
  RECOVERY: { bgCenter: '#082638', bgEdge: '#041520', primary: '#38bdf8', pupil: '#082f49', blush: 'rgba(56, 189, 248, 0.35)' }
}

const SLEEP_AIR_PALETTES: Record<AirQualityTier, AirColorSet> = {
  OPTIMAL: { bgCenter: '#041b12', bgEdge: '#020e09', primary: '#059669', pupil: '#022019', blush: 'rgba(16, 185, 129, 0.22)' },
  WARNING_PREDICTIVE: { bgCenter: '#211304', bgEdge: '#120a02', primary: '#d97706', pupil: '#331202', blush: 'rgba(251, 191, 36, 0.22)' },
  CRITICAL: { bgCenter: '#26050b', bgEdge: '#140206', primary: '#e11d48', pupil: '#360312', blush: 'rgba(244, 63, 94, 0.28)' },
  RECOVERY: { bgCenter: '#051824', bgEdge: '#020c12', primary: '#0284c7', pupil: '#062033', blush: 'rgba(56, 189, 248, 0.22)' }
}

function gestureTheme(tier: AirQualityTier, eyeMode: EyeMode, mouthMode: MouthMode, eyebrowMode: EyebrowMode = 'normal'): EmotionTheme {
  return { ...SEMANTIC_AIR_PALETTES[tier], eyeMode, mouthMode, eyebrowMode }
}

export const EMOTION_THEMES: Record<Gc9a01Emotion, EmotionTheme> = {
  OPTIMAL: gestureTheme('OPTIMAL', 'normal', 'smile', 'normal'),
  WARNING_PREDICTIVE: gestureTheme('WARNING_PREDICTIVE', 'normal', 'neutral', 'angry'),
  GAS_MASK: gestureTheme('WARNING_PREDICTIVE', 'normal', 'gasMask', 'angry'),
  CRITICAL: gestureTheme('CRITICAL', 'cross', 'openOval', 'angry'),
  RECOVERY: gestureTheme('RECOVERY', 'happyArc', 'smile', 'normal'),
  SLEEPING: gestureTheme('OPTIMAL', 'sleepArc', 'neutral', 'normal'),
  DIZZY: gestureTheme('OPTIMAL', 'spiral', 'wavy', 'worried'),
  NAUSEA: gestureTheme('OPTIMAL', 'squint', 'wavy', 'worried'),
  VOMIT: gestureTheme('OPTIMAL', 'squint', 'vomit', 'worried'),
  WIPER: gestureTheme('OPTIMAL', 'normal', 'neutral', 'worried'),
  BABY_ROCKING: gestureTheme('OPTIMAL', 'sleepArc', 'smile', 'normal'),
  BABY_SLEEP: gestureTheme('OPTIMAL', 'sleepArc', 'neutral', 'normal'),
  STARTLED: gestureTheme('OPTIMAL', 'wide', 'openOval', 'surprised'),
  UPSIDE_DOWN: gestureTheme('OPTIMAL', 'upsideDown', 'wavy', 'surprised'),
  WALL_LEFT: gestureTheme('OPTIMAL', 'wallLeft', 'neutral', 'worried'),
  WALL_RIGHT: gestureTheme('OPTIMAL', 'wallRight', 'neutral', 'worried'),
  FREEFALL: gestureTheme('OPTIMAL', 'wide', 'yawn', 'surprised'),
  WINK: gestureTheme('OPTIMAL', 'wink', 'smile', 'normal'),
  LOVE: gestureTheme('OPTIMAL', 'heart', 'smile', 'normal'),
  BUBBLEGUM: gestureTheme('OPTIMAL', 'normal', 'bubblegum', 'normal'),
  WHISTLE: gestureTheme('OPTIMAL', 'normal', 'whistle', 'normal'),
  SNEEZE: gestureTheme('OPTIMAL', 'squint', 'openOval', 'worried'),
  YAWN: gestureTheme('OPTIMAL', 'sleepArc', 'yawn', 'normal'),
  DERP: gestureTheme('OPTIMAL', 'derp', 'smirk', 'skeptical'),
  SUSPICIOUS: gestureTheme('OPTIMAL', 'suspicious', 'neutral', 'skeptical'),
  GLASSES_COOL: gestureTheme('OPTIMAL', 'normal', 'smirk', 'skeptical'),
  COFFEE: gestureTheme('OPTIMAL', 'happyArc', 'smile', 'normal'),
  RAMEN: gestureTheme('OPTIMAL', 'happyArc', 'openOval', 'normal'),
  MUSIC_VIBE: gestureTheme('OPTIMAL', 'happyArc', 'smile', 'normal'),
  BUTTERFLY: gestureTheme('OPTIMAL', 'normal', 'smile', 'surprised'),
  DETECTIVE: gestureTheme('OPTIMAL', 'detective', 'smirk', 'skeptical'),
  ZEN: gestureTheme('OPTIMAL', 'sleepArc', 'smile', 'normal'),
  CRYING: gestureTheme('OPTIMAL', 'normal', 'wavy', 'worried'),
  LAUGHING: gestureTheme('OPTIMAL', 'happyArc', 'laugh', 'normal'),
  HOT_PANTING: gestureTheme('OPTIMAL', 'normal', 'openOval', 'worried')
}

export function resolveAirQualityTier(
  emotion: Gc9a01Emotion,
  riskStatus?: string,
  ppm?: number,
  coPpm?: number
): AirQualityTier {
  const status = (riskStatus ?? '').toUpperCase().trim()
  if (status === 'CRITICAL' || status === 'DANGER' || (ppm !== undefined && ppm >= 1000) || (coPpm !== undefined && coPpm >= 35) || emotion === 'CRITICAL') {
    return 'CRITICAL'
  }
  if (
    status === 'WARNING_PREDICTIVE' || status === 'PREDICTIVE_WARNING' || status === 'WARNING' ||
    (ppm !== undefined && ppm >= 700) || (coPpm !== undefined && coPpm >= 18) ||
    emotion === 'WARNING_PREDICTIVE' || emotion === 'GAS_MASK'
  ) {
    return 'WARNING_PREDICTIVE'
  }
  if (status === 'RECOVERY' || emotion === 'RECOVERY') return 'RECOVERY'
  return 'OPTIMAL'
}

export function getPaletteForEmotion(
  emotion: Gc9a01Emotion,
  riskStatus?: string,
  ppm?: number,
  coPpm?: number
): EmotionTheme {
  const gesture = EMOTION_THEMES[emotion] ?? EMOTION_THEMES.OPTIMAL
  const tier = resolveAirQualityTier(emotion, riskStatus, ppm, coPpm)
  const isSleep = emotion === 'SLEEPING' || emotion === 'BABY_SLEEP'
  const colors = isSleep ? SLEEP_AIR_PALETTES[tier] : SEMANTIC_AIR_PALETTES[tier]
  return { ...colors, eyeMode: gesture.eyeMode, mouthMode: gesture.mouthMode, eyebrowMode: gesture.eyebrowMode }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  palette: EmotionTheme,
  emotion: Gc9a01Emotion,
  now: number
): void {
  const grad = ctx.createRadialGradient(120, 112, 14, 120, 120, 120)
  grad.addColorStop(0, palette.bgCenter)
  grad.addColorStop(1, palette.bgEdge)

  ctx.beginPath()
  ctx.arc(120, 120, 120, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
  ctx.lineWidth = 1
  for (const radius of [55, 92]) {
    ctx.beginPath(); ctx.arc(120, 120, radius, 0, Math.PI * 2); ctx.stroke()
  }

  ctx.beginPath()
  ctx.moveTo(20, 120); ctx.lineTo(220, 120)
  ctx.moveTo(120, 20); ctx.lineTo(120, 220)
  ctx.stroke()

  if (emotion === 'FREEFALL') {
    ctx.save()
    ctx.strokeStyle = palette.primary; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; ctx.lineCap = 'round'
    for (let i = 0; i < 8; i++) {
      const lx = 26 + ((i * 25) % 188)
      const ly = ((now * 0.45 + i * 37) % 240) - 20
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 26); ctx.stroke()
    }
    ctx.restore()
  }

  const isCritical = palette.primary === '#f43f5e' || emotion === 'CRITICAL'
  ctx.beginPath()
  ctx.arc(120, 120, 117, 0, Math.PI * 2)
  ctx.strokeStyle = isCritical && Math.sin(now * 0.016) > 0 ? palette.primary : '#334155'
  ctx.lineWidth = isCritical ? 4 : 2.5
  ctx.stroke()

  ctx.save()
  ctx.strokeStyle = palette.primary; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
  ctx.shadowColor = palette.primary; ctx.shadowBlur = 8
  ctx.beginPath(); ctx.arc(120, 120, 117, -0.72 * Math.PI, -0.28 * Math.PI); ctx.stroke()
  ctx.beginPath(); ctx.arc(120, 120, 117, 0.32 * Math.PI, 0.68 * Math.PI); ctx.stroke()
  ctx.restore()
}

export function drawBlush(
  ctx: CanvasRenderingContext2D,
  palette: EmotionTheme,
  wallShiftX: number,
  centerY: number
): void {
  ctx.save()
  ctx.fillStyle = palette.blush
  for (const bx of [56 + wallShiftX, 184 + wallShiftX]) {
    ctx.beginPath(); ctx.ellipse(bx, centerY + 14, 10, 5.5, 0, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}
