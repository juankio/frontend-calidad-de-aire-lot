export type Gc9a01Emotion =
  | 'OPTIMAL'
  | 'WARNING_PREDICTIVE'
  | 'CRITICAL'
  | 'RECOVERY'
  | 'SLEEPING'
  | 'DIZZY'
  | 'NAUSEA'
  | 'VOMIT'
  | 'WIPER'
  | 'BABY_ROCKING'
  | 'BABY_SLEEP'
  | 'STARTLED'
  | 'UPSIDE_DOWN'
  | 'WALL_LEFT'
  | 'WALL_RIGHT'
  | 'FREEFALL'
  | 'WINK'
  | 'LOVE'
  | 'BUBBLEGUM'
  | 'WHISTLE'
  | 'SNEEZE'
  | 'YAWN'
  | 'DERP'
  | 'SUSPICIOUS'
  | 'GLASSES_COOL'
  | 'COFFEE'
  | 'RAMEN'
  | 'MUSIC_VIBE'
  | 'BUTTERFLY'
  | 'DETECTIVE'
  | 'ZEN'
  | 'CRYING'
  | 'LAUGHING'
  | 'HOT_PANTING'
  | 'GAS_MASK'

export type NormalizedGc9a01Emotion = Gc9a01Emotion

export type Gc9a01EmotionCategory = 'SHAKE' | 'BABY' | 'GYRO' | 'TAMAGOTCHI' | 'SENSOR'

export interface Gc9a01EmotionMeta {
  id: Gc9a01Emotion
  label: string
  category: Gc9a01EmotionCategory
}

export const GC9A01_EMOTION_CATALOG: ReadonlyArray<Gc9a01EmotionMeta> = [
  // SENSOR
  { id: 'OPTIMAL', label: 'Óptimo (Feliz)', category: 'SENSOR' },
  { id: 'WARNING_PREDICTIVE', label: 'Alerta Predictiva (Tos)', category: 'SENSOR' },
  { id: 'GAS_MASK', label: 'Máscara Antigás', category: 'SENSOR' },
  { id: 'CRITICAL', label: 'Peligro Crítico', category: 'SENSOR' },
  { id: 'RECOVERY', label: 'Recuperación (Alivio)', category: 'SENSOR' },
  { id: 'SLEEPING', label: 'Modo Reposo (Zzz)', category: 'SENSOR' },
  // SHAKE
  { id: 'DIZZY', label: 'Mareado (Espirales)', category: 'SHAKE' },
  { id: 'NAUSEA', label: 'Náuseas (Aguantando)', category: 'SHAKE' },
  { id: 'VOMIT', label: '¡Vómito en Pantalla!', category: 'SHAKE' },
  { id: 'WIPER', label: 'Limpiaparabrisas', category: 'SHAKE' },
  // BABY
  { id: 'BABY_ROCKING', label: 'Meciéndose (Bebé)', category: 'BABY' },
  { id: 'BABY_SLEEP', label: 'Dormido (Burbuja)', category: 'BABY' },
  { id: 'STARTLED', label: '¡Susto al Despertar!', category: 'BABY' },
  // GYRO
  { id: 'UPSIDE_DOWN', label: 'De Cabeza (180°)', category: 'GYRO' },
  { id: 'WALL_LEFT', label: 'Aplastado Izquierda', category: 'GYRO' },
  { id: 'WALL_RIGHT', label: 'Aplastado Derecha', category: 'GYRO' },
  { id: 'FREEFALL', label: 'Caída Libre', category: 'GYRO' },
  // TAMAGOTCHI
  { id: 'BUBBLEGUM', label: 'Globo de Chicle', category: 'TAMAGOTCHI' },
  { id: 'WINK', label: 'Guiño Coqueto (;P)', category: 'TAMAGOTCHI' },
  { id: 'LOVE', label: 'Enamorado (♥)', category: 'TAMAGOTCHI' },
  { id: 'GLASSES_COOL', label: 'Gafas Cyber Cool', category: 'TAMAGOTCHI' },
  { id: 'COFFEE', label: 'Tomando Café', category: 'TAMAGOTCHI' },
  { id: 'RAMEN', label: 'Comiendo Ramen', category: 'TAMAGOTCHI' },
  { id: 'MUSIC_VIBE', label: 'Audífonos & Ritmo', category: 'TAMAGOTCHI' },
  { id: 'BUTTERFLY', label: 'Mariposa Curiosa', category: 'TAMAGOTCHI' },
  { id: 'DETECTIVE', label: 'Detective con Lupa', category: 'TAMAGOTCHI' },
  { id: 'DERP', label: 'Bizco (Derp)', category: 'TAMAGOTCHI' },
  { id: 'SUSPICIOUS', label: 'Sospechando (-_-)', category: 'TAMAGOTCHI' },
  { id: 'ZEN', label: 'Meditación Zen', category: 'TAMAGOTCHI' },
  { id: 'CRYING', label: 'Llorando a Mares', category: 'TAMAGOTCHI' },
  { id: 'LAUGHING', label: 'Carcajadas (> <)', category: 'TAMAGOTCHI' },
  { id: 'WHISTLE', label: 'Silbando Alegre', category: 'TAMAGOTCHI' },
  { id: 'SNEEZE', label: '¡Estornudo!', category: 'TAMAGOTCHI' },
  { id: 'YAWN', label: 'Bostezo Profundo', category: 'TAMAGOTCHI' },
  { id: 'HOT_PANTING', label: 'Calor / Jadeando', category: 'TAMAGOTCHI' }
]

const VALID_EMOTION_SET = new Set<string>(GC9A01_EMOTION_CATALOG.map((item) => item.id))

export interface Gc9a01RenderParams {
  ppm: number
  temperature: number
  humidity: number
  emotion: Gc9a01Emotion | string
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

const DEFAULT_PALETTE: EmotionPalette = {
  bgCenter: '#06281b',
  bgEdge: '#031810',
  primary: '#10b981',
  pupil: '#022c22',
  blush: 'rgba(16, 185, 129, 0.35)'
}

const EMOTION_PALETTES: Partial<Record<Gc9a01Emotion, EmotionPalette>> = {
  OPTIMAL: DEFAULT_PALETTE,
  WARNING_PREDICTIVE: {
    bgCenter: '#331d06',
    bgEdge: '#1f1103',
    primary: '#f59e0b',
    pupil: '#451a03',
    blush: 'rgba(245, 158, 11, 0.35)'
  },
  GAS_MASK: {
    bgCenter: '#2c2208',
    bgEdge: '#171204',
    primary: '#facc15',
    pupil: '#3f2e05',
    blush: 'rgba(250, 204, 21, 0.25)'
  },
  CRITICAL: {
    bgCenter: '#3d0812',
    bgEdge: '#25040a',
    primary: '#f43f5e',
    pupil: '#4c0519',
    blush: 'rgba(244, 63, 94, 0.45)'
  },
  RECOVERY: {
    bgCenter: '#082638',
    bgEdge: '#041520',
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
    bgEdge: '#141b06',
    primary: '#eab308',
    pupil: '#1e293b',
    blush: 'rgba(163, 230, 53, 0.45)'
  },
  NAUSEA: {
    bgCenter: '#163010',
    bgEdge: '#0b1908',
    primary: '#84cc16',
    pupil: '#1a2e05',
    blush: 'rgba(132, 204, 22, 0.55)'
  },
  VOMIT: {
    bgCenter: '#1d360d',
    bgEdge: '#0d1a05',
    primary: '#a3e635',
    pupil: '#1a2e05',
    blush: 'rgba(163, 230, 53, 0.5)'
  },
  WIPER: {
    bgCenter: '#082638',
    bgEdge: '#04141f',
    primary: '#38bdf8',
    pupil: '#082f49',
    blush: 'rgba(56, 189, 248, 0.4)'
  },
  BABY_ROCKING: {
    bgCenter: '#29152c',
    bgEdge: '#150a18',
    primary: '#f472b6',
    pupil: '#3b0764',
    blush: 'rgba(244, 114, 182, 0.55)'
  },
  BABY_SLEEP: {
    bgCenter: '#0f172a',
    bgEdge: '#070b14',
    primary: '#93c5fd',
    pupil: '#1e1b4b',
    blush: 'rgba(244, 114, 182, 0.35)'
  },
  STARTLED: {
    bgCenter: '#2e1035',
    bgEdge: '#18071c',
    primary: '#38bdf8',
    pupil: '#0f172a',
    blush: 'rgba(244, 63, 94, 0.45)'
  },
  UPSIDE_DOWN: {
    bgCenter: '#36101e',
    bgEdge: '#1f0810',
    primary: '#fb7185',
    pupil: '#4c0519',
    blush: 'rgba(251, 113, 133, 0.5)'
  },
  WALL_LEFT: {
    bgCenter: '#072a24',
    bgEdge: '#031714',
    primary: '#2dd4bf',
    pupil: '#042f2e',
    blush: 'rgba(45, 212, 191, 0.4)'
  },
  WALL_RIGHT: {
    bgCenter: '#072a24',
    bgEdge: '#031714',
    primary: '#2dd4bf',
    pupil: '#042f2e',
    blush: 'rgba(45, 212, 191, 0.4)'
  },
  FREEFALL: {
    bgCenter: '#1e1b4b',
    bgEdge: '#0d0b26',
    primary: '#38bdf8',
    pupil: '#090d16',
    blush: 'rgba(56, 189, 248, 0.35)'
  },
  LOVE: {
    bgCenter: '#380d24',
    bgEdge: '#1f0613',
    primary: '#f472b6',
    pupil: '#500724',
    blush: 'rgba(244, 63, 94, 0.6)'
  },
  BUBBLEGUM: {
    bgCenter: '#2b122a',
    bgEdge: '#170816',
    primary: '#34d399',
    pupil: '#064e3b',
    blush: 'rgba(244, 114, 182, 0.5)'
  },
  GLASSES_COOL: {
    bgCenter: '#092230',
    bgEdge: '#04121a',
    primary: '#22d3ee',
    pupil: '#083344',
    blush: 'rgba(34, 211, 238, 0.35)'
  },
  COFFEE: {
    bgCenter: '#27170c',
    bgEdge: '#140b05',
    primary: '#fbbf24',
    pupil: '#3b1c06',
    blush: 'rgba(251, 191, 36, 0.4)'
  },
  RAMEN: {
    bgCenter: '#2b130a',
    bgEdge: '#170904',
    primary: '#fb923c',
    pupil: '#431407',
    blush: 'rgba(251, 146, 60, 0.45)'
  },
  MUSIC_VIBE: {
    bgCenter: '#22103b',
    bgEdge: '#110720',
    primary: '#c084fc',
    pupil: '#2e1065',
    blush: 'rgba(192, 132, 252, 0.45)'
  },
  BUTTERFLY: {
    bgCenter: '#07282c',
    bgEdge: '#031518',
    primary: '#2dd4bf',
    pupil: '#042f2e',
    blush: 'rgba(244, 114, 182, 0.45)'
  },
  DETECTIVE: {
    bgCenter: '#1e2412',
    bgEdge: '#101308',
    primary: '#eab308',
    pupil: '#1e293b',
    blush: 'rgba(234, 179, 8, 0.3)'
  },
  ZEN: {
    bgCenter: '#062830',
    bgEdge: '#031419',
    primary: '#22d3ee',
    pupil: '#083344',
    blush: 'rgba(34, 211, 238, 0.35)'
  },
  CRYING: {
    bgCenter: '#0c213b',
    bgEdge: '#061120',
    primary: '#60a5fa',
    pupil: '#172554',
    blush: 'rgba(96, 165, 250, 0.45)'
  },
  LAUGHING: {
    bgCenter: '#092c1e',
    bgEdge: '#041810',
    primary: '#34d399',
    pupil: '#022c22',
    blush: 'rgba(251, 113, 133, 0.5)'
  },
  HOT_PANTING: {
    bgCenter: '#3b1509',
    bgEdge: '#210a04',
    primary: '#fb923c',
    pupil: '#431407',
    blush: 'rgba(244, 63, 94, 0.55)'
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
let eyeVelX = 0
let eyeVelY = 0

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function getNowMs(explicitNow?: number): number {
  if (explicitNow !== undefined) return explicitNow
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

export function getPaletteForEmotion(emotion: Gc9a01Emotion): EmotionPalette {
  return EMOTION_PALETTES[emotion] ?? DEFAULT_PALETTE
}

export function getGc9a01EmotionLabel(emotion?: string): string {
  const norm = normalizeGc9a01Emotion(emotion)
  const found = GC9A01_EMOTION_CATALOG.find((item) => item.id === norm)
  return found ? found.label : norm
}

export function normalizeGc9a01Emotion(
  rawEmotion?: string,
  isShaking?: boolean
): Gc9a01Emotion {
  const cleaned = (rawEmotion ?? 'OPTIMAL')
    .toUpperCase()
    .trim()
    .replace(/^EMOTION_/, '')

  if (cleaned === 'PREDICTIVE_WARNING' || cleaned === 'WARNING') {
    return isShaking ? 'DIZZY' : 'WARNING_PREDICTIVE'
  }
  if (cleaned === 'DANGER') {
    return isShaking ? 'DIZZY' : 'CRITICAL'
  }
  if (VALID_EMOTION_SET.has(cleaned)) {
    const typed = cleaned as Gc9a01Emotion
    if (
      isShaking &&
      (typed === 'OPTIMAL' ||
        typed === 'RECOVERY' ||
        typed === 'SLEEPING' ||
        typed === 'WARNING_PREDICTIVE')
    ) {
      return 'DIZZY'
    }
    return typed
  }
  return isShaking ? 'DIZZY' : 'OPTIMAL'
}

export function stepSharedGc9a01Animation(params: Gc9a01RenderParams): void {
  const now = getNowMs(params.nowMs)
  if (lastStepMs > 0 && now >= lastStepMs && now - lastStepMs < 8) {
    return
  }
  lastStepMs = now

  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)

  breathPhase += 0.075
  breathOffset = Math.sin(breathPhase) * 3.0

  if (nextBlinkStartMs === 0) {
    nextBlinkStartMs = now + 2600 + Math.random() * 2500
  }

  const noBlinkEmotions: ReadonlyArray<Gc9a01Emotion> = [
    'DIZZY',
    'SLEEPING',
    'BABY_SLEEP',
    'STARTLED',
    'FREEFALL',
    'ZEN',
    'LAUGHING',
    'SNEEZE'
  ]

  if (noBlinkEmotions.includes(emotion)) {
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
        nextBlinkStartMs = now + 2600 + Math.random() * 2500
      }
    } else {
      blinkState = 1.0
    }
  }

  let rawEyeX = params.eyeX ?? 0
  let rawEyeY = params.eyeY ?? 0

  if (emotion === 'BUTTERFLY') {
    const bx = Math.sin(now * 0.0024) * 9.5
    const by = Math.sin(now * 0.0048) * 6.5 - 2
    rawEyeX = bx
    rawEyeY = by
  } else if (emotion === 'SUSPICIOUS') {
    rawEyeX = Math.sin(now * 0.0032) * 8.5
    rawEyeY = 0
  } else if (emotion === 'WHISTLE') {
    rawEyeX = -5.5
    rawEyeY = -4.5
  }

  if (Math.abs(rawEyeX) < 1.5 && Math.abs(rawEyeY) < 1.5) {
    if (now >= nextSaccadeMs) {
      nextSaccadeMs = now + 1300 + Math.random() * 2100
      if (Math.random() > 0.3) {
        saccadeX = (Math.random() * 2 - 1) * 3.2
        saccadeY = (Math.random() * 2 - 1) * 2.6
      } else {
        saccadeX = 0
        saccadeY = 0
      }
    }
  } else {
    saccadeX = 0
    saccadeY = 0
  }

  if (emotion === 'WARNING_PREDICTIVE' || emotion === 'SNEEZE') {
    if (nextCoughStartMs === 0) {
      nextCoughStartMs = now + 1600
    }
    if (coughStartMs < 0 && now >= nextCoughStartMs) {
      coughStartMs = now
    }
    if (coughStartMs >= 0) {
      const dt = now - coughStartMs
      if (dt <= 450) {
        coughOffset = Math.sin(dt * 0.055) * 6.5
      } else {
        coughOffset = 0
        coughStartMs = -1
        nextCoughStartMs = now + (emotion === 'SNEEZE' ? 2400 : 3600)
      }
    }
  } else {
    coughOffset = 0
    coughStartMs = -1
    nextCoughStartMs = 0
  }

  const targetX = clamp(rawEyeX * 1.4, -12, 12) + saccadeX
  const targetY = clamp(rawEyeY * 1.4, -10, 10) + saccadeY

  const stiffness = 0.16
  const damping = 0.72
  eyeVelX = (eyeVelX + (targetX - currentEyeX) * stiffness) * damping
  eyeVelY = (eyeVelY + (targetY - currentEyeY) * stiffness) * damping
  currentEyeX += eyeVelX
  currentEyeY += eyeVelY
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
  color: string
): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 6
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const a = (i * Math.PI) / points - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(0, size * 0.35)
  ctx.bezierCurveTo(-size, -size * 0.35, -size * 0.55, -size * 0.95, 0, -size * 0.35)
  ctx.bezierCurveTo(size * 0.55, -size * 0.95, size, -size * 0.35, 0, size * 0.35)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.beginPath()
  ctx.arc(-size * 0.28, -size * 0.32, size * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawCircularBackground(
  ctx: CanvasRenderingContext2D,
  palette: EmotionPalette,
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
  ctx.strokeStyle =
    emotion === 'CRITICAL' && Math.sin(now * 0.016) > 0 ? '#f43f5e' : '#334155'
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

function drawEyebrow(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  side: 0 | 1,
  emotion: Gc9a01Emotion,
  color: string,
  now: number
): void {
  const dir = side === 0 ? 1 : -1
  const bounce = Math.sin(breathPhase) * 1.4
  const baseY = ey - 31 + bounce

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 3.6
  ctx.lineCap = 'round'

  if (
    emotion === 'CRITICAL' ||
    emotion === 'WARNING_PREDICTIVE' ||
    emotion === 'GAS_MASK' ||
    emotion === 'DETECTIVE'
  ) {
    ctx.beginPath()
    ctx.moveTo(ex - 15, baseY - 4 * dir)
    ctx.lineTo(ex + 15, baseY + 5 * dir)
    ctx.stroke()
  } else if (
    emotion === 'CRYING' ||
    emotion === 'NAUSEA' ||
    emotion === 'VOMIT' ||
    emotion === 'HOT_PANTING' ||
    emotion === 'WIPER'
  ) {
    ctx.beginPath()
    ctx.moveTo(ex - 15, baseY + 5 * dir)
    ctx.lineTo(ex + 15, baseY - 4 * dir)
    ctx.stroke()
  } else if (emotion === 'STARTLED' || emotion === 'FREEFALL' || emotion === 'BUTTERFLY') {
    ctx.beginPath()
    ctx.arc(ex, baseY - 4, 15, 1.15 * Math.PI, 1.85 * Math.PI)
    ctx.stroke()
  } else if (emotion === 'SUSPICIOUS' || emotion === 'DERP') {
    const tilt = side === 0 ? -3 : 4 * Math.sin(now * 0.005)
    ctx.beginPath()
    ctx.moveTo(ex - 15, baseY + tilt)
    ctx.lineTo(ex + 15, baseY - tilt)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(ex, baseY + 4, 16, 1.18 * Math.PI, 1.82 * Math.PI)
    ctx.stroke()
  }
  ctx.restore()
}

function drawStandardEyeWithPupil(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  rx: number,
  ry: number,
  pupilX: number,
  pupilY: number,
  pupilR: number,
  palette: EmotionPalette
): void {
  ctx.save()
  ctx.fillStyle = palette.primary
  ctx.shadowColor = palette.primary
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (blinkState > 0.32) {
    ctx.fillStyle = palette.pupil
    ctx.beginPath()
    ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(pupilX - pupilR * 0.42, pupilY - pupilR * 0.42, Math.max(2, pupilR * 0.36), 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(pupilX + pupilR * 0.35, pupilY + pupilR * 0.35, Math.max(1.2, pupilR * 0.18), 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawVomitSplatters(
  ctx: CanvasRenderingContext2D,
  wipeAngleRad?: number
): void {
  const splatters: ReadonlyArray<{ x: number; y: number; r: number; c: string }> = [
    { x: 64, y: 82, r: 16, c: 'rgba(132, 204, 22, 0.85)' },
    { x: 172, y: 74, r: 19, c: 'rgba(163, 230, 53, 0.85)' },
    { x: 96, y: 128, r: 22, c: 'rgba(101, 163, 13, 0.88)' },
    { x: 156, y: 136, r: 17, c: 'rgba(132, 204, 22, 0.85)' },
    { x: 52, y: 152, r: 14, c: 'rgba(163, 230, 53, 0.82)' },
    { x: 184, y: 162, r: 15, c: 'rgba(101, 163, 13, 0.84)' },
    { x: 120, y: 92, r: 13, c: 'rgba(190, 242, 100, 0.82)' }
  ]

  ctx.save()
  for (const s of splatters) {
    if (wipeAngleRad !== undefined) {
      const dx = s.x - 120
      const dy = s.y - 232
      const blobAngle = Math.atan2(dx, -dy)
      if (Math.abs(blobAngle - wipeAngleRad) < 0.48 || blobAngle < wipeAngleRad) {
        drawStar(ctx, s.x, s.y, 6, 2.2, 4, '#67e8f9')
        continue
      }
    }
    ctx.fillStyle = s.c
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.arc(s.x + s.r * 0.65, s.y + s.r * 0.4, s.r * 0.55, 0, Math.PI * 2)
    ctx.arc(s.x - s.r * 0.55, s.y + s.r * 0.5, s.r * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawWiperOverlay(ctx: CanvasRenderingContext2D, now: number): void {
  const sweep = Math.sin(now * 0.0042) * (Math.PI / 3)
  drawVomitSplatters(ctx, sweep)

  const pivotX = 120
  const pivotY = 232
  const armLen = 196
  const tipX = pivotX + Math.sin(sweep) * armLen
  const tipY = pivotY - Math.cos(sweep) * armLen

  ctx.save()
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.16)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 175, -Math.PI / 2 - Math.PI / 3, -Math.PI / 2 + Math.PI / 3)
  ctx.stroke()

  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  ctx.lineTo(tipX, tipY)
  ctx.stroke()

  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  ctx.lineTo(tipX, tipY)
  ctx.stroke()

  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawFaceMode(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: Gc9a01Emotion,
  palette: EmotionPalette,
  now: number
): void {
  ctx.save()

  if (emotion === 'BABY_ROCKING') {
    const rockAngle = Math.sin(now * 0.0032) * 0.15
    ctx.translate(120, 120)
    ctx.rotate(rockAngle)
    ctx.translate(-120, -120)
  }

  const wallShiftX = emotion === 'WALL_LEFT' ? -22 : emotion === 'WALL_RIGHT' ? 22 : 0
  const jitterX = emotion === 'STARTLED' || emotion === 'FREEFALL' ? Math.sin(now * 0.09) * 2.2 : 0
  const vibeBounceY =
    emotion === 'MUSIC_VIBE'
      ? Math.abs(Math.sin(now * 0.011)) * 5
      : emotion === 'LAUGHING'
        ? Math.abs(Math.sin(now * 0.014)) * -5
        : 0

  const centerY = 120 + breathOffset + coughOffset + vibeBounceY
  const eyeXPos: [number, number] = [76 + wallShiftX + jitterX, 164 + wallShiftX + jitterX]
  const eyeYPos = centerY - 10

  const squashRx = 24 + Math.sin(breathPhase) * 1.5
  const squashRy = Math.max(2.5, (32 - Math.sin(breathPhase) * 1.5) * blinkState)

  if (emotion === 'MUSIC_VIBE') {
    ctx.save()
    ctx.strokeStyle = '#c084fc'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.arc(120, centerY - 8, 92, 1.08 * Math.PI, 1.92 * Math.PI)
    ctx.stroke()

    ctx.fillStyle = '#3b0764'
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(14, centerY - 26, 22, 46, 9)
    ctx.roundRect(204, centerY - 26, 22, 46, 9)
    ctx.fill()
    ctx.stroke()

    for (let eq = -4; eq <= 4; eq++) {
      const barH = 5 + Math.abs(Math.sin(now * 0.015 + eq * 0.8)) * 14
      ctx.fillStyle = eq % 2 === 0 ? '#22d3ee' : '#f472b6'
      ctx.fillRect(117 + eq * 10, 194 - barH, 6, barH)
    }
    ctx.restore()
  }

  for (let i = 0; i < 2; i++) {
    const side = i as 0 | 1
    const ex = eyeXPos[i]
    drawEyebrow(ctx, ex, eyeYPos, side, emotion, palette.primary, now)

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
    } else if (emotion === 'SLEEPING' || emotion === 'BABY_SLEEP' || emotion === 'ZEN' || emotion === 'YAWN') {
      ctx.save()
      ctx.strokeStyle = palette.primary
      ctx.lineWidth = 4.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(ex, eyeYPos + 2, 18, 0.12 * Math.PI, 0.88 * Math.PI)
      ctx.stroke()
      ctx.restore()
    } else if (emotion === 'RECOVERY' || emotion === 'BABY_ROCKING') {
      ctx.save()
      ctx.strokeStyle = palette.primary
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.shadowColor = palette.primary
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ex, eyeYPos + 6, 19, 1.12 * Math.PI, 1.88 * Math.PI)
      ctx.stroke()
      ctx.restore()
    } else if (
      emotion === 'LAUGHING' ||
      emotion === 'SNEEZE' ||
      emotion === 'NAUSEA' ||
      emotion === 'VOMIT' ||
      (emotion === 'WINK' && i === 1)
    ) {
      ctx.save()
      ctx.strokeStyle = palette.primary
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      if (i === 0) {
        ctx.moveTo(ex - 14, eyeYPos - 10)
        ctx.lineTo(ex + 12, eyeYPos)
        ctx.lineTo(ex - 14, eyeYPos + 10)
      } else {
        ctx.moveTo(ex + 14, eyeYPos - 10)
        ctx.lineTo(ex - 12, eyeYPos)
        ctx.lineTo(ex + 14, eyeYPos + 10)
      }
      ctx.stroke()
      ctx.restore()
    } else if (emotion === 'LOVE') {
      const beat = 1 + Math.sin(now * 0.012 + i * 0.4) * 0.15
      drawHeart(ctx, ex, eyeYPos + 2, 26 * beat, '#f43f5e')
    } else if (emotion === 'DIZZY') {
      ctx.save()
      ctx.fillStyle = '#eab308'
      ctx.shadowColor = '#eab308'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.ellipse(ex, eyeYPos, squashRx, Math.max(6, squashRy), 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      const dir = i === 0 ? 1 : -1
      const angle = now * 0.013 * dir + i * Math.PI
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
    } else if (emotion === 'SUSPICIOUS') {
      drawStandardEyeWithPupil(
        ctx,
        ex,
        eyeYPos,
        squashRx,
        11,
        ex + currentEyeX,
        eyeYPos,
        7,
        palette
      )
      ctx.fillStyle = palette.bgCenter
      ctx.fillRect(ex - 26, eyeYPos - 18, 52, 9)
    } else {
      let rx = squashRx
      let ry = squashRy
      if (emotion === 'WALL_LEFT' && i === 0) {
        rx = 13
        ry = 35 * blinkState
      } else if (emotion === 'WALL_RIGHT' && i === 1) {
        rx = 13
        ry = 35 * blinkState
      } else if (emotion === 'STARTLED' || emotion === 'FREEFALL') {
        rx = 27
        ry = 35
      } else if (emotion === 'DETECTIVE' && i === 0) {
        ry = 14 * blinkState
      } else if (emotion === 'DETECTIVE' && i === 1) {
        rx = 28
        ry = 34 * blinkState
      }

      const derpShiftX = emotion === 'DERP' ? (i === 0 ? 9 : -9) : currentEyeX
      const derpShiftY = emotion === 'DERP' ? (i === 0 ? -4 : 4) : currentEyeY
      const pupilR =
        emotion === 'STARTLED' || emotion === 'FREEFALL'
          ? 4.5
          : emotion === 'UPSIDE_DOWN' && i === 1
            ? 7
            : 11

      drawStandardEyeWithPupil(
        ctx,
        ex,
        eyeYPos,
        rx,
        Math.max(2.5, ry),
        ex + derpShiftX,
        eyeYPos + derpShiftY,
        pupilR,
        palette
      )
    }
  }

  if (emotion === 'GLASSES_COOL') {
    ctx.save()
    ctx.fillStyle = '#090d16'
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.roundRect(42, eyeYPos - 20, 66, 38, 8)
    ctx.roundRect(132, eyeYPos - 20, 66, 38, 8)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(108, eyeYPos - 6)
    ctx.lineTo(132, eyeYPos - 6)
    ctx.moveTo(22, eyeYPos - 10)
    ctx.lineTo(42, eyeYPos - 8)
    ctx.moveTo(198, eyeYPos - 8)
    ctx.lineTo(218, eyeYPos - 10)
    ctx.stroke()

    const glintShift = ((now * 0.08) % 90) - 20
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(48 + glintShift * 0.4, eyeYPos - 14)
    ctx.lineTo(62 + glintShift * 0.4, eyeYPos + 12)
    ctx.moveTo(138 + glintShift * 0.4, eyeYPos - 14)
    ctx.lineTo(152 + glintShift * 0.4, eyeYPos + 12)
    ctx.stroke()
    ctx.restore()
  }

  if (emotion === 'DETECTIVE') {
    ctx.save()
    ctx.fillStyle = 'rgba(253, 224, 71, 0.7)'
    for (let d = 0; d < 5; d++) {
      const dx = 148 + Math.sin(now * 0.003 + d * 1.4) * 20
      const dy = eyeYPos - 8 + Math.cos(now * 0.004 + d * 1.7) * 18
      ctx.beginPath()
      ctx.arc(dx, dy, 2 + (d % 2), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 4.5
    ctx.beginPath()
    ctx.arc(eyeXPos[1], eyeYPos, 32, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(eyeXPos[1] + 23, eyeYPos + 23)
    ctx.lineTo(eyeXPos[1] + 44, eyeYPos + 46)
    ctx.stroke()
    ctx.restore()
  }

  if (emotion === 'WINK') {
    drawStar(ctx, eyeXPos[1] + 22, eyeYPos - 14, 7, 3, 4, '#fde047')
  }

  if (emotion === 'LOVE') {
    for (let h = 0; h < 3; h++) {
      const hy = 72 - ((now * 0.03 + h * 18) % 36)
      const hx = h === 0 ? 40 : h === 1 ? 198 : 120
      drawHeart(ctx, hx, hy, 8, '#f472b6')
    }
  }

  if (emotion === 'ZEN') {
    ctx.save()
    ctx.fillStyle = '#67e8f9'
    ctx.shadowColor = '#22d3ee'
    ctx.shadowBlur = 8
    for (let m = 0; m < 5; m++) {
      const a = now * 0.002 + (m * Math.PI * 2) / 5
      const mx = 120 + Math.cos(a) * 86
      const my = 120 + Math.sin(a) * 86
      ctx.beginPath()
      ctx.arc(mx, my, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (
    emotion === 'NAUSEA' ||
    emotion === 'HOT_PANTING' ||
    emotion === 'UPSIDE_DOWN' ||
    emotion === 'YAWN' ||
    emotion === 'LAUGHING'
  ) {
    ctx.save()
    ctx.fillStyle = emotion === 'NAUSEA' ? '#a3e635' : '#38bdf8'
    const dropDir = emotion === 'UPSIDE_DOWN' ? -1 : 1
    const slide = ((now * 0.04) % 16) * dropDir
    ctx.beginPath()
    ctx.arc(194, eyeYPos - 8 + slide, 4.5, 0, Math.PI * 2)
    ctx.fill()
    if (emotion === 'LAUGHING' || emotion === 'HOT_PANTING') {
      ctx.beginPath()
      ctx.arc(46, eyeYPos - 4 + slide, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  ctx.save()
  ctx.fillStyle = palette.blush
  ctx.beginPath()
  ctx.ellipse(56 + wallShiftX, centerY + 14, 10, 5.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(184 + wallShiftX, centerY + 14, 10, 5.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (emotion === 'NAUSEA') {
    const puff = 15 + Math.sin(now * 0.014) * 2.5
    ctx.save()
    ctx.fillStyle = 'rgba(163, 230, 53, 0.75)'
    ctx.strokeStyle = '#84cc16'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(82, centerY + 34, puff, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(158, centerY + 34, puff, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  if (emotion === 'CRYING') {
    ctx.save()
    ctx.fillStyle = 'rgba(56, 189, 248, 0.82)'
    for (let i = 0; i < 2; i++) {
      const tx = eyeXPos[i]
      const wave = Math.sin(now * 0.015 + i) * 3
      ctx.beginPath()
      ctx.roundRect(tx - 8 + wave * 0.3, eyeYPos + 12, 16, 78, 8)
      ctx.fill()
    }
    ctx.restore()
  }

  const mouthX = 120 + wallShiftX + jitterX
  const mouthY = centerY + 38

  ctx.save()
  ctx.strokeStyle = palette.primary
  ctx.fillStyle = palette.primary
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (
    emotion === 'OPTIMAL' ||
    emotion === 'RECOVERY' ||
    emotion === 'LOVE' ||
    emotion === 'BUTTERFLY' ||
    emotion === 'MUSIC_VIBE'
  ) {
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(mouthX, mouthY - 6, 17, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  } else if (emotion === 'WINK' || emotion === 'DERP' || emotion === 'HOT_PANTING') {
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(mouthX, mouthY - 6, 15, 0.12 * Math.PI, 0.88 * Math.PI)
    ctx.stroke()

    const pantBob = emotion === 'HOT_PANTING' ? Math.sin(now * 0.022) * 3.5 : 0
    ctx.fillStyle = '#fb7185'
    ctx.beginPath()
    ctx.roundRect(mouthX - 7, mouthY + 2, 14, 15 + pantBob, [2, 2, 8, 8])
    ctx.fill()
  } else if (emotion === 'LAUGHING') {
    ctx.fillStyle = '#4c0519'
    ctx.strokeStyle = palette.primary
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.arc(mouthX, mouthY - 4, 20, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#fb7185'
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + 6, 10, 0, Math.PI)
    ctx.fill()
  } else if (emotion === 'GLASSES_COOL') {
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(mouthX - 14, mouthY + 2)
    ctx.quadraticCurveTo(mouthX + 4, mouthY + 8, mouthX + 18, mouthY - 6)
    ctx.stroke()
  } else if (emotion === 'WHISTLE') {
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.arc(mouthX + 14, mouthY, 6, 0, Math.PI * 2)
    ctx.stroke()
  } else if (
    emotion === 'CRITICAL' ||
    emotion === 'STARTLED' ||
    emotion === 'FREEFALL' ||
    emotion === 'YAWN'
  ) {
    const ry = emotion === 'FREEFALL' || emotion === 'YAWN' ? 18 : 11
    ctx.fillStyle = '#1e1b4b'
    ctx.strokeStyle = palette.primary
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.ellipse(mouthX, mouthY + 2, 13, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else if (emotion === 'VOMIT') {
    ctx.fillStyle = '#1a2e05'
    ctx.strokeStyle = '#a3e635'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.ellipse(mouthX, mouthY, 22, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    const streamGrad = ctx.createLinearGradient(mouthX, mouthY, mouthX, 240)
    streamGrad.addColorStop(0, '#bef264')
    streamGrad.addColorStop(0.5, '#84cc16')
    streamGrad.addColorStop(1, '#4d7c0f')
    ctx.fillStyle = streamGrad
    const wave = Math.sin(now * 0.02) * 5
    ctx.beginPath()
    ctx.moveTo(mouthX - 18, mouthY)
    ctx.quadraticCurveTo(mouthX - 24 + wave, 195, mouthX - 28, 240)
    ctx.lineTo(mouthX + 28, 240)
    ctx.quadraticCurveTo(mouthX + 24 + wave, 195, mouthX + 18, mouthY)
    ctx.closePath()
    ctx.fill()
  } else if (emotion === 'DIZZY' || emotion === 'NAUSEA' || emotion === 'CRYING' || emotion === 'UPSIDE_DOWN') {
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(mouthX - 18, mouthY)
    ctx.lineTo(mouthX - 9, mouthY - 5)
    ctx.lineTo(mouthX, mouthY + 4)
    ctx.lineTo(mouthX + 9, mouthY - 5)
    ctx.lineTo(mouthX + 18, mouthY)
    ctx.stroke()
  } else if (emotion === 'BABY_ROCKING') {
    const bob = Math.sin(now * 0.012) * 2
    ctx.fillStyle = '#f472b6'
    ctx.strokeStyle = '#fbcfe8'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.ellipse(mouthX, mouthY + bob, 16, 11, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + bob, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#fde047'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + 8 + bob, 9, 0.1 * Math.PI, 0.9 * Math.PI)
    ctx.stroke()
  } else if (emotion === 'BUBBLEGUM') {
    const cycle = (now % 3200) / 3200
    if (cycle < 0.82) {
      const r = 5 + (cycle / 0.82) * 23
      ctx.fillStyle = 'rgba(244, 114, 182, 0.82)'
      ctx.strokeStyle = '#fbcfe8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(mouthX, mouthY + 2, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.beginPath()
      ctx.arc(mouthX - r * 0.35, mouthY - r * 0.3, r * 0.22, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const popRadius = 24 + (cycle - 0.82) * 80
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4
        ctx.fillStyle = '#f472b6'
        ctx.beginPath()
        ctx.arc(mouthX + Math.cos(a) * popRadius, mouthY + Math.sin(a) * popRadius, 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (emotion === 'GAS_MASK') {
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(mouthX - 28, mouthY - 18, 56, 38, 12)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.arc(mouthX - 30, mouthY + 4, 13, 0, Math.PI * 2)
    ctx.arc(mouthX + 30, mouthY + 4, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + 2, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(mouthX - 12, mouthY)
    ctx.lineTo(mouthX + 12, mouthY)
    ctx.stroke()
  }
  ctx.restore()

  if (emotion === 'DIZZY') {
    for (let k = 0; k < 3; k++) {
      const a = now * 0.0045 + (k * Math.PI * 2) / 3
      const sx = 120 + Math.cos(a) * 48
      const sy = 48 + Math.sin(a) * 12
      drawStar(ctx, sx, sy, 8, 3.5, 5, '#fde047')
    }
  }

  if (emotion === 'BABY_SLEEP') {
    const bubbleR = 7 + (Math.sin(breathPhase) + 1) * 5.5
    const bx = 142
    const by = centerY + 14
    ctx.save()
    ctx.fillStyle = 'rgba(56, 189, 248, 0.42)'
    ctx.strokeStyle = '#bae6fd'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(bx, by, bubbleR, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(bx - bubbleR * 0.35, by - bubbleR * 0.35, bubbleR * 0.24, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (emotion === 'SLEEPING' || emotion === 'BABY_SLEEP') {
    const floatY = Math.sin(breathPhase * 0.8) * 4
    ctx.save()
    ctx.fillStyle = '#93c5fd'
    ctx.textAlign = 'center'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('z', 174, 74 + floatY)
    ctx.font = 'bold 17px monospace'
    ctx.fillText('Z', 190, 58 - floatY * 0.7)
    ctx.restore()
  }

  if (emotion === 'STARTLED') {
    ctx.save()
    ctx.fillStyle = '#f43f5e'
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('!!', 120, 44)

    ctx.fillStyle = '#bae6fd'
    const burst = 14 + ((now * 0.08) % 24)
    for (let b = 0; b < 6; b++) {
      const a = (b * Math.PI) / 3
      ctx.beginPath()
      ctx.arc(142 + Math.cos(a) * burst, centerY + 14 + Math.sin(a) * burst, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (emotion === 'BABY_ROCKING' || emotion === 'WHISTLE' || emotion === 'MUSIC_VIBE') {
    const noteY = 66 + Math.sin(now * 0.006) * 6
    ctx.save()
    ctx.fillStyle = '#fde047'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('♪', 42, noteY)
    ctx.fillStyle = '#38bdf8'
    ctx.fillText('♫', 192, noteY - 8)
    ctx.restore()
  }

  if (emotion === 'COFFEE') {
    const sip = Math.sin(now * 0.004) * 4
    ctx.save()
    ctx.fillStyle = '#f8fafc'
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(102, 166 + sip, 36, 28, [4, 4, 10, 10])
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 2
    for (let s = -1; s <= 1; s++) {
      const sy = 158 + sip - ((now * 0.03 + s * 8) % 16)
      ctx.beginPath()
      ctx.arc(120 + s * 8, sy, 3, 0, Math.PI)
      ctx.stroke()
    }
    ctx.restore()
  }

  if (emotion === 'RAMEN') {
    const slurp = Math.sin(now * 0.015) * 4
    ctx.save()
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 3
    for (let n = -8; n <= 8; n += 5) {
      ctx.beginPath()
      ctx.moveTo(120 + n, mouthY + 2)
      ctx.quadraticCurveTo(120 + n + slurp, 162, 120 + n, 176)
      ctx.stroke()
    }

    ctx.fillStyle = '#dc2626'
    ctx.strokeStyle = '#fde047'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(120, 174, 26, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  if (emotion === 'BUTTERFLY') {
    const bx = 120 + Math.sin(now * 0.0024) * 62
    const by = 86 + Math.sin(now * 0.0048) * 32
    const wing = Math.abs(Math.sin(now * 0.025)) * 9 + 4
    ctx.save()
    ctx.fillStyle = '#f472b6'
    ctx.shadowColor = '#f472b6'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.ellipse(bx - wing * 0.6, by, wing, 8, -0.3, 0, Math.PI * 2)
    ctx.ellipse(bx + wing * 0.6, by, wing, 8, 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (emotion === 'WARNING_PREDICTIVE' || emotion === 'SNEEZE') {
    if (Math.abs(coughOffset) > 1.2) {
      ctx.save()
      ctx.fillStyle = emotion === 'SNEEZE' ? 'rgba(186, 230, 253, 0.75)' : 'rgba(251, 191, 36, 0.55)'
      for (let p = 0; p < 4; p++) {
        const px = mouthX + (p - 1.5) * 14
        const py = mouthY + 14 + ((now * 0.08 + p * 7) % 18)
        ctx.beginPath()
        ctx.arc(px, py, 5 + (p % 2) * 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
  }

  if (emotion === 'VOMIT') {
    drawVomitSplatters(ctx)
  } else if (emotion === 'WIPER') {
    drawWiperOverlay(ctx, now)
  }

  const ppmText = `${Math.round(params.ppm)} PPM`
  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'
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

  ctx.restore()
}

function drawHudMode(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: Gc9a01Emotion,
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
  ctx.fillText(getGc9a01EmotionLabel(emotion).toUpperCase(), 120, 202)
  ctx.restore()
}

export function renderGc9a01Display(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams
): void {
  stepSharedGc9a01Animation(params)

  const now = getNowMs(params.nowMs)
  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)
  const palette = getPaletteForEmotion(emotion)

  ctx.save()
  ctx.clearRect(0, 0, 240, 240)

  ctx.beginPath()
  ctx.arc(120, 120, 120, 0, Math.PI * 2)
  ctx.clip()

  drawCircularBackground(ctx, palette, emotion, now)

  if (params.viewMode === 'HUD') {
    drawHudMode(ctx, params, emotion, palette)
  } else {
    drawFaceMode(ctx, params, emotion, palette, now)
  }

  ctx.restore()
}
