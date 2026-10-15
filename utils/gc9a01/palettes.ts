import type { EmotionTheme, EyeMode, EyebrowMode, Gc9a01Emotion, MouthMode } from './types'

function theme(
  bgCenter: string,
  bgEdge: string,
  primary: string,
  pupil: string,
  blush: string,
  eyeMode: EyeMode,
  mouthMode: MouthMode,
  eyebrowMode: EyebrowMode = 'normal'
): EmotionTheme {
  return { bgCenter, bgEdge, primary, pupil, blush, eyeMode, mouthMode, eyebrowMode }
}

const BASE = ['#06281b', '#031810', '#10b981', '#022c22', 'rgba(16, 185, 129, 0.35)'] as const

export const EMOTION_THEMES: Record<Gc9a01Emotion, EmotionTheme> = {
  OPTIMAL: theme(...BASE, 'normal', 'smile', 'normal'),
  WARNING_PREDICTIVE: theme('#331d06', '#1f1103', '#f59e0b', '#451a03', 'rgba(245, 158, 11, 0.35)', 'normal', 'neutral', 'angry'),
  GAS_MASK: theme('#2c2208', '#171204', '#facc15', '#3f2e05', 'rgba(250, 204, 21, 0.25)', 'normal', 'gasMask', 'angry'),
  CRITICAL: theme('#3d0812', '#25040a', '#f43f5e', '#4c0519', 'rgba(244, 63, 94, 0.45)', 'cross', 'openOval', 'angry'),
  RECOVERY: theme('#082638', '#041520', '#38bdf8', '#082f49', 'rgba(56, 189, 248, 0.35)', 'happyArc', 'smile', 'normal'),
  SLEEPING: theme('#111827', '#090d14', '#64748b', '#0f172a', 'rgba(100, 116, 139, 0.25)', 'sleepArc', 'neutral', 'normal'),
  DIZZY: theme('#232e0c', '#141b06', '#eab308', '#1e293b', 'rgba(163, 230, 53, 0.45)', 'spiral', 'wavy', 'normal'),
  NAUSEA: theme('#163010', '#0b1908', '#84cc16', '#1a2e05', 'rgba(132, 204, 22, 0.55)', 'squint', 'wavy', 'worried'),
  VOMIT: theme('#1d360d', '#0d1a05', '#a3e635', '#1a2e05', 'rgba(163, 230, 53, 0.5)', 'squint', 'vomit', 'worried'),
  WIPER: theme('#082638', '#04141f', '#38bdf8', '#082f49', 'rgba(56, 189, 248, 0.4)', 'normal', 'neutral', 'worried'),
  BABY_ROCKING: theme('#29152c', '#150a18', '#f472b6', '#3b0764', 'rgba(244, 114, 182, 0.55)', 'happyArc', 'pacifier', 'normal'),
  BABY_SLEEP: theme('#0f172a', '#070b14', '#93c5fd', '#1e1b4b', 'rgba(244, 114, 182, 0.35)', 'sleepArc', 'neutral', 'normal'),
  STARTLED: theme('#2e1035', '#18071c', '#38bdf8', '#0f172a', 'rgba(244, 63, 94, 0.45)', 'wide', 'openOval', 'surprised'),
  UPSIDE_DOWN: theme('#36101e', '#1f0810', '#fb7185', '#4c0519', 'rgba(251, 113, 133, 0.5)', 'upsideDown', 'wavy', 'normal'),
  WALL_LEFT: theme('#072a24', '#031714', '#2dd4bf', '#042f2e', 'rgba(45, 212, 191, 0.4)', 'wallLeft', 'neutral', 'normal'),
  WALL_RIGHT: theme('#072a24', '#031714', '#2dd4bf', '#042f2e', 'rgba(45, 212, 191, 0.4)', 'wallRight', 'neutral', 'normal'),
  FREEFALL: theme('#1e1b4b', '#0d0b26', '#38bdf8', '#090d16', 'rgba(56, 189, 248, 0.35)', 'wide', 'yawn', 'surprised'),
  WINK: theme(...BASE, 'wink', 'tongue', 'normal'),
  LOVE: theme('#380d24', '#1f0613', '#f472b6', '#500724', 'rgba(244, 63, 94, 0.6)', 'heart', 'smile', 'normal'),
  BUBBLEGUM: theme('#2b122a', '#170816', '#34d399', '#064e3b', 'rgba(244, 114, 182, 0.5)', 'normal', 'bubblegum', 'normal'),
  WHISTLE: theme(...BASE, 'normal', 'whistle', 'normal'),
  SNEEZE: theme(...BASE, 'squint', 'neutral', 'normal'),
  YAWN: theme(...BASE, 'sleepArc', 'yawn', 'normal'),
  DERP: theme(...BASE, 'derp', 'tongue', 'skeptical'),
  SUSPICIOUS: theme(...BASE, 'suspicious', 'neutral', 'skeptical'),
  GLASSES_COOL: theme('#092230', '#04121a', '#22d3ee', '#083344', 'rgba(34, 211, 238, 0.35)', 'normal', 'smirk', 'normal'),
  COFFEE: theme('#27170c', '#140b05', '#fbbf24', '#3b1c06', 'rgba(251, 191, 36, 0.4)', 'normal', 'neutral', 'normal'),
  RAMEN: theme('#2b130a', '#170904', '#fb923c', '#431407', 'rgba(251, 146, 60, 0.45)', 'normal', 'neutral', 'normal'),
  MUSIC_VIBE: theme('#22103b', '#110720', '#c084fc', '#2e1065', 'rgba(192, 132, 252, 0.45)', 'normal', 'smile', 'normal'),
  BUTTERFLY: theme('#07282c', '#031518', '#2dd4bf', '#042f2e', 'rgba(244, 114, 182, 0.45)', 'normal', 'smile', 'surprised'),
  DETECTIVE: theme('#1e2412', '#101308', '#eab308', '#1e293b', 'rgba(234, 179, 8, 0.3)', 'detective', 'neutral', 'angry'),
  ZEN: theme('#062830', '#031419', '#22d3ee', '#083344', 'rgba(34, 211, 238, 0.35)', 'sleepArc', 'neutral', 'normal'),
  CRYING: theme('#0c213b', '#061120', '#60a5fa', '#172554', 'rgba(96, 165, 250, 0.45)', 'normal', 'wavy', 'worried'),
  LAUGHING: theme('#092c1e', '#041810', '#34d399', '#022c22', 'rgba(251, 113, 133, 0.5)', 'squint', 'laugh', 'normal'),
  HOT_PANTING: theme('#3b1509', '#210a04', '#fb923c', '#431407', 'rgba(244, 63, 94, 0.55)', 'normal', 'tongue', 'worried')
}

export function getPaletteForEmotion(emotion: Gc9a01Emotion): EmotionTheme {
  return EMOTION_THEMES[emotion] ?? EMOTION_THEMES.OPTIMAL
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

  if (emotion === 'UPSIDE_DOWN' || emotion === 'HOT_PANTING') {
    const heatGrad = ctx.createLinearGradient(120, 0, 120, 115)
    heatGrad.addColorStop(0, 'rgba(244, 63, 94, 0.48)')
    heatGrad.addColorStop(1, 'rgba(244, 63, 94, 0)')
    ctx.fillStyle = heatGrad
    ctx.fillRect(0, 0, 240, 120)
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
  ctx.lineWidth = 1
  for (const radius of [55, 92]) {
    ctx.beginPath()
    ctx.arc(120, 120, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.moveTo(20, 120)
  ctx.lineTo(220, 120)
  ctx.moveTo(120, 20)
  ctx.lineTo(120, 220)
  ctx.stroke()

  if (emotion === 'FREEFALL') {
    ctx.save()
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.38)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    for (let i = 0; i < 10; i++) {
      const lx = 24 + ((i * 23) % 192)
      const ly = ((now * 0.45 + i * 37) % 240) - 20
      ctx.beginPath()
      ctx.moveTo(lx, ly)
      ctx.lineTo(lx, ly + 28)
      ctx.stroke()
    }
    ctx.restore()
  }

  if (emotion === 'ZEN') {
    ctx.save()
    const pulseR = 68 + ((now * 0.025) % 42)
    const alpha = Math.max(0, 1 - (pulseR - 68) / 42) * 0.45
    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha.toFixed(2)})`
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(120, 120, pulseR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  ctx.beginPath()
  ctx.arc(120, 120, 117, 0, Math.PI * 2)
  ctx.strokeStyle = emotion === 'CRITICAL' && Math.sin(now * 0.016) > 0 ? '#f43f5e' : '#334155'
  ctx.lineWidth = emotion === 'CRITICAL' ? 4 : 2.5
  ctx.stroke()

  ctx.save()
  ctx.strokeStyle = palette.primary
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.shadowColor = palette.primary
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(120, 120, 117, -0.72 * Math.PI, -0.28 * Math.PI)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(120, 120, 117, 0.32 * Math.PI, 0.68 * Math.PI)
  ctx.stroke()
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
    ctx.beginPath()
    ctx.ellipse(bx, centerY + 14, 10, 5.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
