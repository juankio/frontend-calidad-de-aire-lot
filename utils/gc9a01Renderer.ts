import { renderEyes } from './gc9a01/eyes'
import { renderCircularHUD } from './gc9a01/hud'
import { renderMouth } from './gc9a01/mouths'
import { drawSweatAndTears, renderBasicOverlays } from './gc9a01/overlaysBasic'
import { drawHeadphones, renderPropOverlays } from './gc9a01/overlaysProps'
import { EMOTION_THEMES, drawBackground, drawBlush, getPaletteForEmotion } from './gc9a01/palettes'
import {
  computeFaceMetrics,
  getGc9a01EmotionLabel,
  getNowMs,
  normalizeGc9a01Emotion,
  sharedState,
  stepSharedGc9a01Animation
} from './gc9a01/state'
import {
  GC9A01_EMOTION_CATALOG,
  type EmotionPalette,
  type EmotionTheme,
  type Gc9a01Emotion,
  type Gc9a01EmotionCategory,
  type Gc9a01EmotionMeta,
  type Gc9a01RenderParams,
  type NormalizedGc9a01Emotion,
  type SharedAnimState
} from './gc9a01/types'

export {
  EMOTION_THEMES,
  GC9A01_EMOTION_CATALOG,
  getGc9a01EmotionLabel,
  getPaletteForEmotion,
  normalizeGc9a01Emotion,
  sharedState,
  stepSharedGc9a01Animation,
  type EmotionPalette,
  type EmotionTheme,
  type Gc9a01Emotion,
  type Gc9a01EmotionCategory,
  type Gc9a01EmotionMeta,
  type Gc9a01RenderParams,
  type NormalizedGc9a01Emotion,
  type SharedAnimState
}

function drawFaceMode(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: Gc9a01Emotion,
  palette: EmotionTheme,
  now: number
): void {
  ctx.save()
  if (emotion === 'BABY_ROCKING') {
    const rockAngle = Math.sin(now * 0.0032) * 0.15
    ctx.translate(120, 120)
    ctx.rotate(rockAngle)
    ctx.translate(-120, -120)
  }

  const metrics = computeFaceMetrics(emotion, now)
  if (emotion === 'MUSIC_VIBE') drawHeadphones(ctx, metrics.centerY, now)

  renderEyes(ctx, emotion, palette, metrics, now)
  drawBlush(ctx, palette, metrics.wallShiftX, metrics.centerY)
  drawSweatAndTears(ctx, emotion, metrics, now)
  renderMouth(ctx, emotion, palette, metrics, now)
  renderBasicOverlays(ctx, emotion, metrics, now)
  renderPropOverlays(ctx, params, emotion, palette, metrics, now)
  ctx.restore()
}

export function renderGc9a01Display(ctx: CanvasRenderingContext2D, params: Gc9a01RenderParams): void {
  stepSharedGc9a01Animation(params)
  const now = getNowMs(params.nowMs)
  const emotion = normalizeGc9a01Emotion(params.emotion, params.isShaking)
  const palette = getPaletteForEmotion(emotion)

  ctx.save()
  ctx.clearRect(0, 0, 240, 240)
  ctx.beginPath()
  ctx.arc(120, 120, 120, 0, Math.PI * 2)
  ctx.clip()

  drawBackground(ctx, palette, emotion, now)
  if (params.viewMode === 'HUD') renderCircularHUD(ctx, params, emotion, palette)
  else drawFaceMode(ctx, params, emotion, palette, now)
  ctx.restore()
}
