import { drawHeart, drawStar } from './eyes'
import { sharedState } from './state'
import type { EmotionTheme, FaceMetrics, Gc9a01Emotion, Gc9a01RenderParams } from './types'

export function drawHeadphones(ctx: CanvasRenderingContext2D, centerY: number, _now: number, theme?: EmotionTheme): void {
  const color = theme?.primary ?? '#10b981'
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 4
  ctx.beginPath(); ctx.arc(120, centerY - 8, 92, 1.12 * Math.PI, 1.88 * Math.PI); ctx.stroke()
  ctx.restore()
}

export function drawDetectiveLoupe(ctx: CanvasRenderingContext2D, eyeXRight: number, eyeYPos: number, _now: number, theme?: EmotionTheme): void {
  ctx.save()
  ctx.strokeStyle = theme?.primary ?? '#10b981'; ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.arc(eyeXRight, eyeYPos, 30, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
}

export function drawCoffeeMug(_ctx: CanvasRenderingContext2D, _now: number): void {}

export function drawRamenBowl(_ctx: CanvasRenderingContext2D, _mouthY: number, _now: number): void {}

export function drawButterflyProp(ctx: CanvasRenderingContext2D, now: number, theme?: EmotionTheme): void {
  const bx = 120 + Math.sin(now * 0.0024) * 58
  const by = 82 + Math.sin(now * 0.0048) * 28
  const wing = Math.abs(Math.sin(now * 0.025)) * 7 + 3
  ctx.save()
  ctx.fillStyle = theme?.primary ?? '#10b981'
  ctx.beginPath()
  ctx.ellipse(bx - wing * 0.6, by, wing, 6, -0.3, 0, Math.PI * 2)
  ctx.ellipse(bx + wing * 0.6, by, wing, 6, 0.3, 0, Math.PI * 2)
  ctx.fill(); ctx.restore()
}

export function drawPpmToastBadge(ctx: CanvasRenderingContext2D, ppm: number, theme: EmotionTheme): void {
  ctx.save()
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'; ctx.strokeStyle = theme.primary; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.roundRect(82, 201, 76, 20, 10); ctx.fill(); ctx.stroke()
  ctx.fillStyle = theme.primary; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(`${Math.round(ppm)} PPM`, 120, 212)
  ctx.restore()
}

export function renderPropOverlays(
  ctx: CanvasRenderingContext2D, params: Gc9a01RenderParams, emotion: Gc9a01Emotion,
  theme: EmotionTheme, metrics: FaceMetrics, now: number
): void {
  const { centerY, eyeXPos, eyeYPos } = metrics
  if (emotion === 'WINK') drawStar(ctx, eyeXPos[1] + 22, eyeYPos - 14, 7, 3, 4, theme.primary)
  if (emotion === 'LOVE') {
    for (let h = 0; h < 3; h++) drawHeart(ctx, h === 0 ? 40 : h === 1 ? 198 : 120, 72 - ((now * 0.03 + h * 18) % 36), 8, theme.primary)
  }
  if (emotion === 'DIZZY') {
    for (let k = 0; k < 3; k++) {
      const a = now * 0.0045 + (k * Math.PI * 2) / 3
      drawStar(ctx, 120 + Math.cos(a) * 48, 48 + Math.sin(a) * 12, 8, 3.5, 5, theme.primary)
    }
  }
  if (emotion === 'SLEEPING' || emotion === 'BABY_SLEEP') {
    const floatY = Math.sin(sharedState.breathPhase * 0.8) * 4
    ctx.save(); ctx.fillStyle = theme.primary; ctx.textAlign = 'center'
    ctx.font = 'bold 13px monospace'; ctx.fillText('z', 174, 74 + floatY)
    ctx.font = 'bold 17px monospace'; ctx.fillText('Z', 190, 58 - floatY * 0.7)
    ctx.restore()
  }
  if (emotion === 'STARTLED') {
    ctx.save(); ctx.fillStyle = theme.primary; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'
    ctx.fillText('!!', 120, 44)
    const burst = 14 + ((now * 0.08) % 24)
    for (let b = 0; b < 6; b++) {
      const a = (b * Math.PI) / 3
      ctx.beginPath(); ctx.arc(142 + Math.cos(a) * burst, centerY + 14 + Math.sin(a) * burst, 2.5, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }
  if (emotion === 'WHISTLE') {
    const noteY = 66 + Math.sin(now * 0.006) * 6
    ctx.save(); ctx.fillStyle = theme.primary; ctx.font = 'bold 16px monospace'
    ctx.fillText('♪', 42, noteY); ctx.fillText('♫', 192, noteY - 8); ctx.restore()
  }
  if (emotion === 'BUTTERFLY') drawButterflyProp(ctx, now, theme)
  drawPpmToastBadge(ctx, params.ppm, theme)
}
