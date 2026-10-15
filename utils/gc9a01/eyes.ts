import { sharedState } from './state'
import type { EmotionTheme, FaceMetrics, Gc9a01Emotion } from './types'

export function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number, color: string): void {
  ctx.save()
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 6
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const a = (i * Math.PI) / points - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

export function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(0, size * 0.35)
  ctx.bezierCurveTo(-size, -size * 0.35, -size * 0.55, -size * 0.95, 0, -size * 0.35)
  ctx.bezierCurveTo(size * 0.55, -size * 0.95, size, -size * 0.35, 0, size * 0.35)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.beginPath(); ctx.arc(-size * 0.28, -size * 0.32, size * 0.12, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawNormalEye(
  ctx: CanvasRenderingContext2D, ex: number, ey: number, rx: number, ry: number,
  pupilX: number, pupilY: number, pupilR: number, theme: EmotionTheme
): void {
  ctx.save()
  ctx.fillStyle = theme.primary; ctx.shadowColor = theme.primary; ctx.shadowBlur = 12
  ctx.beginPath(); ctx.ellipse(ex, ey, rx, Math.max(2.5, ry), 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  if (sharedState.blinkState > 0.32 && ry > 6) {
    ctx.fillStyle = theme.pupil
    ctx.beginPath(); ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(pupilX - pupilR * 0.42, pupilY - pupilR * 0.42, Math.max(2, pupilR * 0.36), 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(pupilX + pupilR * 0.35, pupilY + pupilR * 0.35, Math.max(1.2, pupilR * 0.18), 0, Math.PI * 2); ctx.fill()
  }
}

export function drawSpiralEye(
  ctx: CanvasRenderingContext2D, ex: number, ey: number, rx: number, _ry: number, side: 0 | 1, now: number, theme: EmotionTheme
): void {
  ctx.save()
  ctx.fillStyle = theme.pupil
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 3.2
  ctx.shadowColor = theme.primary
  ctx.shadowBlur = 10
  ctx.beginPath(); ctx.arc(ex, ey, rx, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

  const spin = now * 0.014 * (side === 0 ? 1 : -1)
  ctx.beginPath()
  ctx.lineCap = 'round'
  for (let step = 0; step <= 38; step++) {
    const t = step / 38
    const angle = spin + t * Math.PI * 4.8 * (side === 0 ? 1 : -1)
    const radius = t * (rx - 4)
    const sx = ex + Math.cos(angle) * radius
    const sy = ey + Math.sin(angle) * radius
    if (step === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  }
  ctx.stroke()
  ctx.restore()
}

export function drawCrossEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, theme?: EmotionTheme): void {
  const color = theme?.primary ?? '#f43f5e'
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(ex - 14, ey - 14); ctx.lineTo(ex + 14, ey + 14)
  ctx.moveTo(ex + 14, ey - 14); ctx.lineTo(ex - 14, ey + 14)
  ctx.stroke(); ctx.restore()
}

export function drawHappyArcEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, theme: EmotionTheme): void {
  ctx.save()
  ctx.strokeStyle = theme.primary; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.shadowColor = theme.primary; ctx.shadowBlur = 10
  ctx.beginPath(); ctx.arc(ex, ey + 6, 19, 1.12 * Math.PI, 1.88 * Math.PI); ctx.stroke()
  ctx.restore()
}

export function drawSleepArcEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, theme: EmotionTheme): void {
  ctx.save()
  ctx.strokeStyle = theme.primary; ctx.lineWidth = 4.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(ex, ey + 2, 18, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke()
  ctx.restore()
}

export function drawHeartEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, side: 0 | 1, now: number, theme?: EmotionTheme): void {
  drawHeart(ctx, ex, ey + 2, 26 * (1 + Math.sin(now * 0.012 + side * 0.4) * 0.15), theme?.primary ?? '#f43f5e')
}

export function drawStarEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, side: 0 | 1, now: number, theme: EmotionTheme): void {
  const pulse = 1 + Math.sin(now * 0.01 + side * 0.5) * 0.12
  drawStar(ctx, ex, ey, 18 * pulse, 7 * pulse, 5, theme.primary)
}

function drawChevronEye(ctx: CanvasRenderingContext2D, ex: number, ey: number, side: 0 | 1, theme: EmotionTheme): void {
  const s = side === 0 ? 1 : -1
  ctx.save()
  ctx.strokeStyle = theme.primary; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(ex - 14 * s, ey - 10); ctx.lineTo(ex + 12 * s, ey); ctx.lineTo(ex - 14 * s, ey + 10)
  ctx.stroke(); ctx.restore()
}

export function drawSunglasses(ctx: CanvasRenderingContext2D, eyeYPos: number, _now: number): void {
  ctx.save()
  ctx.fillStyle = '#090d16'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.roundRect(42, eyeYPos - 18, 64, 34, 8); ctx.roundRect(134, eyeYPos - 18, 64, 34, 8); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export function drawEyebrows(ctx: CanvasRenderingContext2D, ex: number, ey: number, side: 0 | 1, theme: EmotionTheme, now: number): void {
  const dir = side === 0 ? 1 : -1
  const baseY = ey - 31 + Math.sin(sharedState.breathPhase) * 1.4
  ctx.save()
  ctx.strokeStyle = theme.primary; ctx.lineWidth = 3.6; ctx.lineCap = 'round'
  ctx.beginPath()
  if (theme.eyebrowMode === 'angry') { ctx.moveTo(ex - 15, baseY - 4 * dir); ctx.lineTo(ex + 15, baseY + 5 * dir) }
  else if (theme.eyebrowMode === 'worried') { ctx.moveTo(ex - 15, baseY + 5 * dir); ctx.lineTo(ex + 15, baseY - 4 * dir) }
  else if (theme.eyebrowMode === 'surprised') ctx.arc(ex, baseY - 4, 15, 1.15 * Math.PI, 1.85 * Math.PI)
  else if (theme.eyebrowMode === 'skeptical') {
    const tilt = side === 0 ? -3 : 4 * Math.sin(now * 0.005)
    ctx.moveTo(ex - 15, baseY + tilt); ctx.lineTo(ex + 15, baseY - tilt)
  } else ctx.arc(ex, baseY + 4, 16, 1.18 * Math.PI, 1.82 * Math.PI)
  ctx.stroke(); ctx.restore()
}

export function renderEyes(ctx: CanvasRenderingContext2D, emotion: Gc9a01Emotion, theme: EmotionTheme, metrics: FaceMetrics, now: number): void {
  const { eyeXPos, eyeYPos, squashRx, squashRy } = metrics
  for (let i = 0; i < 2; i++) {
    const side = i as 0 | 1
    const ex = eyeXPos[i]
    drawEyebrows(ctx, ex, eyeYPos, side, theme, now)
    if (emotion === 'BABY_ROCKING') {
      const drowsyRy = 4 + (Math.sin(now * 0.0032) + 1) * 5.5
      drawNormalEye(ctx, ex, eyeYPos + 3, squashRx * 0.92, drowsyRy, ex + sharedState.currentEyeX * 0.3, eyeYPos + 5, 7, theme)
      drawSleepArcEye(ctx, ex, eyeYPos - 2, theme)
    } else if (theme.eyeMode === 'cross') drawCrossEye(ctx, ex, eyeYPos, theme)
    else if (theme.eyeMode === 'sleepArc') drawSleepArcEye(ctx, ex, eyeYPos, theme)
    else if (theme.eyeMode === 'happyArc') drawHappyArcEye(ctx, ex, eyeYPos, theme)
    else if (theme.eyeMode === 'squint' || (theme.eyeMode === 'wink' && side === 1)) drawChevronEye(ctx, ex, eyeYPos, side, theme)
    else if (theme.eyeMode === 'heart') drawHeartEye(ctx, ex, eyeYPos, side, now, theme)
    else if (theme.eyeMode === 'star') drawStarEye(ctx, ex, eyeYPos, side, now, theme)
    else if (theme.eyeMode === 'spiral') drawSpiralEye(ctx, ex, eyeYPos, squashRx, squashRy, side, now, theme)
    else if (theme.eyeMode === 'suspicious') {
      drawNormalEye(ctx, ex, eyeYPos, squashRx, 11, ex + sharedState.currentEyeX, eyeYPos, 7, theme)
      ctx.fillStyle = theme.bgCenter; ctx.fillRect(ex - 26, eyeYPos - 18, 52, 9)
    } else {
      const isWall = (theme.eyeMode === 'wallLeft' && side === 0) || (theme.eyeMode === 'wallRight' && side === 1)
      const rx = isWall ? 13 : theme.eyeMode === 'wide' ? 27 : theme.eyeMode === 'detective' && side === 1 ? 28 : squashRx
      const ry = isWall ? 35 * sharedState.blinkState : theme.eyeMode === 'wide' ? 35 : theme.eyeMode === 'detective' ? (side === 0 ? 14 : 34) * sharedState.blinkState : squashRy
      const dx = theme.eyeMode === 'derp' ? (side === 0 ? 9 : -9) : sharedState.currentEyeX
      const dy = theme.eyeMode === 'derp' ? (side === 0 ? -4 : 4) : sharedState.currentEyeY
      const pr = theme.eyeMode === 'wide' ? 5 : theme.eyeMode === 'upsideDown' && side === 1 ? 7 : 11
      drawNormalEye(ctx, ex, eyeYPos, rx, ry, ex + dx, eyeYPos + dy, pr, theme)
    }
  }
}
