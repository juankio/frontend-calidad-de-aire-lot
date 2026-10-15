import { drawHeart, drawStar } from './eyes'
import { sharedState } from './state'
import type { EmotionTheme, FaceMetrics, Gc9a01Emotion, Gc9a01RenderParams } from './types'

export function drawHeadphones(ctx: CanvasRenderingContext2D, centerY: number, now: number): void {
  ctx.save()
  ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 7
  ctx.beginPath(); ctx.arc(120, centerY - 8, 92, 1.08 * Math.PI, 1.92 * Math.PI); ctx.stroke()
  ctx.fillStyle = '#3b0764'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(14, centerY - 26, 22, 46, 9); ctx.roundRect(204, centerY - 26, 22, 46, 9)
  ctx.fill(); ctx.stroke()
  for (let eq = -4; eq <= 4; eq++) {
    const barH = 5 + Math.abs(Math.sin(now * 0.015 + eq * 0.8)) * 14
    ctx.fillStyle = eq % 2 === 0 ? '#22d3ee' : '#f472b6'
    ctx.fillRect(117 + eq * 10, 194 - barH, 6, barH)
  }
  ctx.restore()
}

export function drawDetectiveLoupe(ctx: CanvasRenderingContext2D, eyeXRight: number, eyeYPos: number, now: number): void {
  ctx.save()
  ctx.fillStyle = 'rgba(253, 224, 71, 0.7)'
  for (let d = 0; d < 5; d++) {
    const dx = 148 + Math.sin(now * 0.003 + d * 1.4) * 20
    const dy = eyeYPos - 8 + Math.cos(now * 0.004 + d * 1.7) * 18
    ctx.beginPath(); ctx.arc(dx, dy, 2 + (d % 2), 0, Math.PI * 2); ctx.fill()
  }
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4.5
  ctx.beginPath(); ctx.arc(eyeXRight, eyeYPos, 32, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 7; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(eyeXRight + 23, eyeYPos + 23); ctx.lineTo(eyeXRight + 44, eyeYPos + 46); ctx.stroke()
  ctx.restore()
}

export function drawCoffeeMug(ctx: CanvasRenderingContext2D, now: number): void {
  const sip = Math.sin(now * 0.004) * 4
  ctx.save()
  ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.roundRect(102, 166 + sip, 36, 28, [4, 4, 10, 10]); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2
  for (let s = -1; s <= 1; s++) {
    ctx.beginPath(); ctx.arc(120 + s * 8, 158 + sip - ((now * 0.03 + s * 8) % 16), 3, 0, Math.PI); ctx.stroke()
  }
  ctx.restore()
}

export function drawRamenBowl(ctx: CanvasRenderingContext2D, mouthY: number, now: number): void {
  const slurp = Math.sin(now * 0.015) * 4
  ctx.save()
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3
  for (let n = -8; n <= 8; n += 5) {
    ctx.beginPath(); ctx.moveTo(120 + n, mouthY + 2); ctx.quadraticCurveTo(120 + n + slurp, 162, 120 + n, 176); ctx.stroke()
  }
  ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(120, 174, 26, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export function drawButterflyProp(ctx: CanvasRenderingContext2D, now: number): void {
  const bx = 120 + Math.sin(now * 0.0024) * 62
  const by = 86 + Math.sin(now * 0.0048) * 32
  const wing = Math.abs(Math.sin(now * 0.025)) * 9 + 4
  ctx.save()
  ctx.fillStyle = '#f472b6'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.ellipse(bx - wing * 0.6, by, wing, 8, -0.3, 0, Math.PI * 2)
  ctx.ellipse(bx + wing * 0.6, by, wing, 8, 0.3, 0, Math.PI * 2)
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
  const { centerY, eyeXPos, eyeYPos, mouthY } = metrics
  if (emotion === 'DETECTIVE') drawDetectiveLoupe(ctx, eyeXPos[1], eyeYPos, now)
  if (emotion === 'WINK') drawStar(ctx, eyeXPos[1] + 22, eyeYPos - 14, 7, 3, 4, '#fde047')
  if (emotion === 'LOVE') {
    for (let h = 0; h < 3; h++) drawHeart(ctx, h === 0 ? 40 : h === 1 ? 198 : 120, 72 - ((now * 0.03 + h * 18) % 36), 8, '#f472b6')
  }
  if (emotion === 'ZEN') {
    ctx.save(); ctx.fillStyle = '#67e8f9'; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 8
    for (let m = 0; m < 5; m++) {
      const a = now * 0.002 + (m * Math.PI * 2) / 5
      ctx.beginPath(); ctx.arc(120 + Math.cos(a) * 86, 120 + Math.sin(a) * 86, 3.5, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }
  if (emotion === 'DIZZY') {
    for (let k = 0; k < 3; k++) {
      const a = now * 0.0045 + (k * Math.PI * 2) / 3
      drawStar(ctx, 120 + Math.cos(a) * 48, 48 + Math.sin(a) * 12, 8, 3.5, 5, '#fde047')
    }
  }
  if (emotion === 'SLEEPING' || emotion === 'BABY_SLEEP') {
    const floatY = Math.sin(sharedState.breathPhase * 0.8) * 4
    ctx.save(); ctx.fillStyle = '#93c5fd'; ctx.textAlign = 'center'
    ctx.font = 'bold 13px monospace'; ctx.fillText('z', 174, 74 + floatY)
    ctx.font = 'bold 17px monospace'; ctx.fillText('Z', 190, 58 - floatY * 0.7)
    ctx.restore()
  }
  if (emotion === 'STARTLED') {
    ctx.save(); ctx.fillStyle = '#f43f5e'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'
    ctx.fillText('!!', 120, 44); ctx.fillStyle = '#bae6fd'
    const burst = 14 + ((now * 0.08) % 24)
    for (let b = 0; b < 6; b++) {
      const a = (b * Math.PI) / 3
      ctx.beginPath(); ctx.arc(142 + Math.cos(a) * burst, centerY + 14 + Math.sin(a) * burst, 2.5, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }
  if (emotion === 'BABY_ROCKING' || emotion === 'WHISTLE' || emotion === 'MUSIC_VIBE') {
    const noteY = 66 + Math.sin(now * 0.006) * 6
    ctx.save(); ctx.fillStyle = '#fde047'; ctx.font = 'bold 16px monospace'; ctx.fillText('♪', 42, noteY)
    ctx.fillStyle = '#38bdf8'; ctx.fillText('♫', 192, noteY - 8); ctx.restore()
  }
  if (emotion === 'COFFEE') drawCoffeeMug(ctx, now)
  if (emotion === 'RAMEN') drawRamenBowl(ctx, mouthY, now)
  if (emotion === 'BUTTERFLY') drawButterflyProp(ctx, now)
  drawPpmToastBadge(ctx, params.ppm, theme)
}
