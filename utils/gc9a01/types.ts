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
  { id: 'OPTIMAL', label: 'Óptimo (Feliz)', category: 'SENSOR' },
  { id: 'WARNING_PREDICTIVE', label: 'Alerta Predictiva (Tos)', category: 'SENSOR' },
  { id: 'GAS_MASK', label: 'Máscara Antigás', category: 'SENSOR' },
  { id: 'CRITICAL', label: 'Peligro Crítico', category: 'SENSOR' },
  { id: 'RECOVERY', label: 'Recuperación (Alivio)', category: 'SENSOR' },
  { id: 'SLEEPING', label: 'Modo Reposo (Zzz)', category: 'SENSOR' },
  { id: 'DIZZY', label: 'Mareado (Espirales)', category: 'SHAKE' },
  { id: 'NAUSEA', label: 'Náuseas (Aguantando)', category: 'SHAKE' },
  { id: 'VOMIT', label: '¡Vómito en Pantalla!', category: 'SHAKE' },
  { id: 'WIPER', label: 'Limpiaparabrisas', category: 'SHAKE' },
  { id: 'BABY_ROCKING', label: 'Meciéndose (Bebé)', category: 'BABY' },
  { id: 'BABY_SLEEP', label: 'Dormido (Burbuja)', category: 'BABY' },
  { id: 'STARTLED', label: '¡Susto al Despertar!', category: 'BABY' },
  { id: 'UPSIDE_DOWN', label: 'De Cabeza (180°)', category: 'GYRO' },
  { id: 'WALL_LEFT', label: 'Aplastado Izquierda', category: 'GYRO' },
  { id: 'WALL_RIGHT', label: 'Aplastado Derecha', category: 'GYRO' },
  { id: 'FREEFALL', label: 'Caída Libre', category: 'GYRO' },
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

export type EyeMode =
  | 'normal'
  | 'spiral'
  | 'cross'
  | 'happyArc'
  | 'sleepArc'
  | 'wink'
  | 'heart'
  | 'star'
  | 'squint'
  | 'suspicious'
  | 'wallLeft'
  | 'wallRight'
  | 'wide'
  | 'detective'
  | 'derp'
  | 'upsideDown'

export type MouthMode =
  | 'smile'
  | 'tongue'
  | 'laugh'
  | 'smirk'
  | 'whistle'
  | 'openOval'
  | 'yawn'
  | 'vomit'
  | 'wavy'
  | 'pacifier'
  | 'bubblegum'
  | 'gasMask'
  | 'neutral'

export type EyebrowMode = 'angry' | 'worried' | 'surprised' | 'skeptical' | 'normal'

export interface EmotionTheme {
  bgCenter: string
  bgEdge: string
  primary: string
  pupil: string
  blush: string
  eyeMode: EyeMode
  mouthMode: MouthMode
  eyebrowMode: EyebrowMode
}

export type EmotionPalette = EmotionTheme

export interface SharedAnimState {
  lastStepMs: number
  breathPhase: number
  breathOffset: number
  blinkState: number
  nextBlinkStartMs: number
  blinkStartMs: number
  saccadeX: number
  saccadeY: number
  nextSaccadeMs: number
  coughOffset: number
  nextCoughStartMs: number
  coughStartMs: number
  currentEyeX: number
  currentEyeY: number
  eyeVelX: number
  eyeVelY: number
}

export interface FaceMetrics {
  centerY: number
  eyeXPos: [number, number]
  eyeYPos: number
  mouthX: number
  mouthY: number
  wallShiftX: number
  jitterX: number
  squashRx: number
  squashRy: number
}
