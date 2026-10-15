export type Gc9a01Emotion =
  | 'OPTIMAL'
  | 'WARNING_PREDICTIVE'
  | 'PREDICTIVE_WARNING'
  | 'CRITICAL'
  | 'RECOVERY'
  | 'SLEEPING'
  | 'DIZZY'

export type NormalizedGc9a01Emotion =
  | 'OPTIMAL'
  | 'WARNING_PREDICTIVE'
  | 'CRITICAL'
  | 'RECOVERY'
  | 'SLEEPING'
  | 'DIZZY'

export interface Gc9a01RenderParams {
  ppm: number
  temperature: number
  humidity: number
  emotion: Gc9a01Emotion
  viewMode: 'FACE' | 'HUD'
  eyeX?: number
  eyeY?: number
  isShaking?: boolean
  nowMs?: number
}

interface EmotionPalette {
  bgCenter: string
  bgEdge: string
  primary: string
  pupil: string
  blush: string
}

const EMOTION_PALETTES: Record<NormalizedGc9a01Emotion, EmotionPalette> = {
  OPTIMAL: {
    bgCenter: '#06281b',
    bgEdge: '#031810',
    primary: '#10b981',
    pupil: '#022c22',
    blush: 'rgba(16, 185, 129, 0.35)'
  },
  WARNING_PREDICTIVE: {
    bgCenter: '#331d06',
    bgEdge: '#231404',
    primary: '#f59e0b',
    pupil: '#451a03',
    blush: 'rgba(245, 158, 11, 0.35)'
  },
  CRITICAL: {
    bgCenter: '#3d0812',
    bgEdge: '#2a050c',
    primary: '#f43f5e',
    pupil: '#4c0519',
    blush: 'rgba(244, 63, 94, 0.4)'
  },
  RECOVERY: {
    bgCenter: '#082638',
    bgEdge: '#051824',
    primary: '#38bdf8',
    pupil: '#082f49',
    blush: 'rgba(56, 189, 248, 0.35)'
  },
  SLEEPING: {
    bgCenter: '#111827',
    bgEdge: '#090d14',
    primary: '#64748b',
    pupil: '#0f172a',
    blush: 'rgba(100, 116, 139, 0.25)'
  },
  DIZZY: {
    bgCenter: '#232e0c',
    bgEdge: '#182008',
    primary: '#eab308',
    pupil: '#1e293b',
    blush: 'rgba(163, 230, 53, 0.45)'
  }
}

let lastStepMs = 0
let breathPhase = 0
let breathOffset = 0
let blinkState = 1.0
let nextBlinkStartMs = 0
let blinkStartMs = -1
let saccadeX = 0
let saccadeY = 0
let nextSaccadeMs = 0
let coughOffset = 0
let nextCoughStartMs = 0
let coughStartMs = -1
let currentEyeX = 0
let currentEyeY = 0

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function getNowMs(explicitNow?: number): number {
  if (explicitNow !== undefined) return explicitNow
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

export function normalizeGc9a01Emotion(
  rawEmotion?: string,
  isShaking?: boolean
): NormalizedGc9a01Emotion {
  if (isShaking) return 'DIZZY'
  const upper = (rawEmotion ?? 'OPTIMAL').toUpperCase().trim()
  if (upper === 'DIZZY') return 'DIZZY'
  if (upper === 'WARNING_PREDICTIVE' || upper === 'PREDICTIVE_WARNING' || upper === 'WARNING') {
    return 'WARNING_PREDICTIVE'
  }
  if (upper === 'CRITICAL' || upper === 'DANGER') return 'CRITICAL'
  if (upper === 'RECOVERY') return 'RECOVERY'
  if (upper === 'SLEEPING') return 'SLEEPING'
  return 'OPTIMAL'
}

export function stepSharedGc9a01Animation(params: Gc9a01RenderParams): void {
  const now = getNowMs(params.nowMs)
  if (lastStepMs > 0 && now >= lastStepMs && now - lastStepMs < 8) {
    return
  }
  lastStepMs = now

  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)

  breathPhase += 0.08
  breathOffset = Math.sin(breathPhase) * 3.0

  if (nextBlinkStartMs === 0) {
    nextBlinkStartMs = now + 2800 + Math.random() * 2700
  }

  if (emotion === 'DIZZY' || emotion === 'SLEEPING') {
    blinkState = 1.0
    blinkStartMs = -1
  } else {
    if (blinkStartMs < 0 && now >= nextBlinkStartMs) {
      blinkStartMs = now
    }
    if (blinkStartMs >= 0) {
      const elapsed = now - blinkStartMs
      if (elapsed <= 75) {
        blinkState = 1.0 - (elapsed / 75) * 0.95
      } else if (elapsed <= 170) {
        blinkState = 0.05 + ((elapsed - 75) / 95) * 0.95
      } else {
        blinkState = 1.0
        blinkStartMs = -1
        nextBlinkStartMs = now + 2800 + Math.random() * 2700
      }
    } else {
      blinkState = 1.0
    }
  }

  const rawEyeX = params.eyeX ?? 0
  const rawEyeY = params.eyeY ?? 0

  if (Math.abs(rawEyeX) < 1.5 && Math.abs(rawEyeY) < 1.5) {
    if (now >= nextSaccadeMs) {
      nextSaccadeMs = now + 1500 + Math.random() * 2300
      if (Math.random() > 0.35) {
        saccadeX = (Math.random() * 2 - 1) * 2.5
        saccadeY = (Math.random() * 2 - 1) * 2.5
      } else {
        saccadeX = 0
        saccadeY = 0
      }
    }
  } else {
    saccadeX = 0
    saccadeY = 0
  }

  if (emotion === 'WARNING_PREDICTIVE') {
    if (nextCoughStartMs === 0) {
      nextCoughStartMs = now + 2000
    }
    if (coughStartMs < 0 && now >= nextCoughStartMs) {
      coughStartMs = now
    }
    if (coughStartMs >= 0) {
      const dt = now - coughStartMs
      if (dt <= 400) {
        coughOffset = Math.sin(dt * 0.05) * 6.0
      } else {
        coughOffset = 0
        coughStartMs = -1
        nextCoughStartMs = now + 4000
      }
    }
  } else {
    coughOffset = 0
    coughStartMs = -1
    nextCoughStartMs = 0
  }

  const targetX = clamp(rawEyeX * 1.4, -12, 12) + saccadeX
  const targetY = clamp(rawEyeY * 1.4, -10, 10) + saccadeY
  currentEyeX += (targetX - currentEyeX) * 0.25
  currentEyeY += (targetY - currentEyeY) * 0.25
}

function drawCircularBackground(
  ctx: CanvasRenderingContext2D,
  palette: EmotionPalette
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

  ctx.beginPath()
  ctx.arc(120, 120, 55, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(120, 120, 92, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(20, 120)
  ctx.lineTo(220, 120)
  ctx.moveTo(120, 20)
  ctx.lineTo(120, 220)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(120, 120, 117, 0, Math.PI * 2)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2.5
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

function drawFaceMode(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: NormalizedGc9a01Emotion,
  palette: EmotionPalette,
  now: number
): void {
  const centerY = 120 + breathOffset + coughOffset
  const eyeXPos: [number, number] = [76, 164]
  const eyeYPos = centerY - 10
  const eyeW = 24
  const eyeH = Math.max(2, 32 * blinkState)

  for (let i = 0; i < 2; i++) {
    const ex = eyeXPos[i]

    if (emotion === 'CRITICAL') {
      ctx.save()
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.shadowColor = '#f43f5e'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(ex - 14, eyeYPos - 14)
      ctx.lineTo(ex + 14, eyeYPos + 14)
      ctx.moveTo(ex + 14, eyeYPos - 14)
      ctx.lineTo(ex - 14, eyeYPos + 14)
      ctx.stroke()
      ctx.restore()
    } else if (emotion === 'SLEEPING') {
      ctx.save()
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(ex, eyeYPos, 18, 0.12 * Math.PI, 0.88 * Math.PI)
      ctx.stroke()
      ctx.restore()
    } else if (emotion === 'RECOVERY') {
      ctx.save()
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ex, eyeYPos + 6, 19, 1.12 * Math.PI, 1.88 * Math.PI)
      ctx.stroke()
      ctx.restore()
    } else if (emotion === 'DIZZY') {
      const dizzyRy = Math.max(4, 30 * blinkState)
      ctx.save()
      ctx.fillStyle = '#eab308'
      ctx.shadowColor = '#eab308'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.ellipse(ex, eyeYPos, 24, dizzyRy, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      const dir = i === 0 ? 1 : -1
      const angle = now * 0.012 * dir + i * Math.PI
      const px = ex + Math.cos(angle) * 7
      const py = eyeYPos + Math.sin(angle) * 7

      ctx.fillStyle = palette.pupil
      ctx.beginPath()
      ctx.arc(px, py, 10, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(px, py, 6.5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(px, py, 3, 0, Math.PI * 2)
      ctx.stroke()

      ctx.save()
      ctx.strokeStyle = '#eab308'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      const browOffset = i === 0 ? -4 : 3
      ctx.arc(ex, eyeYPos - 20 + browOffset, 16, 1.15 * Math.PI, 1.85 * Math.PI)
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.save()
      ctx.fillStyle = palette.primary
      ctx.shadowColor = palette.primary
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.ellipse(ex, eyeYPos, eyeW, eyeH, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      if (blinkState > 0.35) {
        const px = ex + currentEyeX
        const py = eyeYPos + currentEyeY

        ctx.fillStyle = palette.pupil
        ctx.beginPath()
        ctx.arc(px, py, 11, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(px - 5, py - 5, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(px + 4, py + 4, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      if (emotion === 'WARNING_PREDICTIVE') {
        const slope = i === 0 ? 5 : -5
        ctx.save()
        ctx.strokeStyle = palette.primary
        ctx.lineWidth = 3.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(ex - 16, eyeYPos - 26 + slope)
        ctx.lineTo(ex + 16, eyeYPos - 26 - slope)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  if (emotion === 'SLEEPING') {
    const floatY = Math.sin(breathPhase * 0.8) * 3
    ctx.save()
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 12px monospace'
    ctx.fillText('z', 176, 74 + floatY)
    ctx.font = 'bold 16px monospace'
    ctx.fillText('Z', 190, 62 - floatY * 0.7)
    ctx.restore()
  }

  ctx.save()
  ctx.fillStyle = palette.blush
  ctx.beginPath()
  ctx.ellipse(58, centerY + 12, 9, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(182, centerY + 12, 9, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const mouthY = centerY + 38
  ctx.save()
  ctx.strokeStyle = palette.primary
  ctx.fillStyle = palette.primary
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (emotion === 'OPTIMAL' || emotion === 'RECOVERY') {
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(120, mouthY - 6, 17, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  } else if (emotion === 'WARNING_PREDICTIVE') {
    if (Math.abs(coughOffset) > 1.5) {
      ctx.fillStyle = palette.pupil
      ctx.strokeStyle = palette.primary
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(120, mouthY, 8, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.lineWidth = 3.5
      ctx.beginPath()
      ctx.moveTo(106, mouthY + 2)
      ctx.quadraticCurveTo(120, mouthY - 6, 134, mouthY + 2)
      ctx.stroke()
    }
  } else if (emotion === 'CRITICAL') {
    ctx.fillStyle = '#4c0519'
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(120, mouthY, 12, 9, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else if (emotion === 'DIZZY') {
    ctx.strokeStyle = '#eab308'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(102, mouthY - 4)
    ctx.lineTo(111, mouthY + 4)
    ctx.lineTo(120, mouthY - 4)
    ctx.lineTo(129, mouthY + 4)
    ctx.lineTo(138, mouthY - 4)
    ctx.stroke()
  } else if (emotion === 'SLEEPING') {
    ctx.beginPath()
    ctx.arc(120, mouthY, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  const ppmText = `${Math.round(params.ppm)} PPM`
  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
  ctx.strokeStyle = palette.primary
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.roundRect(82, 201, 76, 20, 10)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = palette.primary
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ppmText, 120, 212)
  ctx.restore()
}

function drawHudMode(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: NormalizedGc9a01Emotion,
  palette: EmotionPalette
): void {
  const startAngle = 0.75 * Math.PI
  const endAngle = 2.25 * Math.PI
  const totalSweep = endAngle - startAngle
  const pct = clamp((params.ppm - 380) / (2000 - 380), 0.03, 1.0)

  ctx.save()
  ctx.beginPath()
  ctx.arc(120, 120, 95, startAngle, endAngle)
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 11
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(120, 120, 95, startAngle, startAngle + totalSweep * pct)
  ctx.strokeStyle = palette.primary
  ctx.lineWidth = 11
  ctx.lineCap = 'round'
  ctx.shadowColor = palette.primary
  ctx.shadowBlur = 10
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px monospace'
  ctx.fillText(String(Math.round(params.ppm)), 120, 114)

  ctx.fillStyle = palette.primary
  ctx.font = 'bold 11px monospace'
  ctx.fillText('PPM CO2eq', 120, 140)

  const envText = `${params.temperature.toFixed(1)}°C | ${Math.round(params.humidity)}% HR`
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px monospace'
  ctx.fillText(envText, 120, 174)

  ctx.fillStyle = palette.primary
  ctx.font = 'bold 10px monospace'
  ctx.fillText(emotion, 120, 202)
  ctx.restore()
}

export function renderGc9a01Display(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams
): void {
  stepSharedGc9a01Animation(params)

  const now = getNowMs(params.nowMs)
  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)
  const palette = EMOTION_PALETTES[emotion]

  ctx.save()
  ctx.clearRect(0, 0, 240, 240)

  ctx.beginPath()
  ctx.arc(120, 120, 120, 0, Math.PI * 2)
  ctx.clip()

  drawCircularBackground(ctx, palette)

  if (params.viewMode === 'HUD') {
    drawHudMode(ctx, params, emotion, palette)
  } else {
    drawFaceMode(ctx, params, emotion, palette, now)
  }

  ctx.restore()
}
