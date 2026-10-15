import { drawStar } from './eyes'
import { sharedState } from './state'
import type { FaceMetrics, Gc9a01Emotion } from './types'

const VOMIT_SPLATTERS: ReadonlyArray<{ x: number; y: number; r: number; c: string }> = [
  { x: 64, y: 82, r: 16, c: 'rgba(132, 204, 22, 0.85)' },
  { x: 172, y: 74, r: 19, c: 'rgba(163, 230, 53, 0.85)' },
  { x: 96, y: 128, r: 22, c: 'rgba(101, 163, 13, 0.88)' },
  { x: 156, y: 136, r: 17, c: 'rgba(132, 204, 22, 0.85)' },
  { x: 52, y: 152, r: 14, c: 'rgba(163, 230, 53, 0.82)' },
  { x: 184, y: 162, r: 15, c: 'rgba(101, 163, 13, 0.84)' },
  { x: 120, y: 92, r: 13, c: 'rgba(190, 242, 100, 0.82)' }
]

export function drawVomitSplatters(ctx: CanvasRenderingContext2D, wipeAngleRad?: number): void {
  ctx.save()
  for (const s of VOMIT_SPLATTERS) {
    if (wipeAngleRad !== undefined) {
      const blobAngle = Math.atan2(s.x - 120, -(s.y - 232))
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

export function drawWiperOverlay(ctx: CanvasRenderingContext2D, now: number): void {
  const sweep = Math.sin(now * 0.0042) * (Math.PI / 3)
  drawVomitSplatters(ctx, sweep)
  const pivotX = 120
  const pivotY = 232
  const tipX = pivotX + Math.sin(sweep) * 196
  const tipY = pivotY - Math.cos(sweep) * 196

  ctx.save()
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.16)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 175, -Math.PI / 2 - Math.PI / 3, -Math.PI / 2 + Math.PI / 3)
  ctx.stroke()

  for (const [color, width] of [['#0f172a', 10], ['#38bdf8', 4]] as const) {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(pivotX, pivotY)
    ctx.lineTo(tipX, tipY)
    ctx.stroke()
  }

  ctx.fillStyle = '#334155'
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(pivotX, pivotY, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

export function drawBubblegumPop(ctx: CanvasRenderingContext2D, mouthX: number, mouthY: number, now: number): void {
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
    ctx.fillStyle = '#f472b6'
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4
      ctx.beginPath()
      ctx.arc(mouthX + Math.cos(a) * popRadius, mouthY + Math.sin(a) * popRadius, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export function drawSnotBubble(ctx: CanvasRenderingContext2D, centerY: number): void {
  const bubbleR = 7 + (Math.sin(sharedState.breathPhase) + 1) * 5.5
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

export function drawSweatAndTears(
  ctx: CanvasRenderingContext2D, emotion: Gc9a01Emotion, metrics: FaceMetrics, now: number
): void {
  const { centerY, eyeXPos, eyeYPos } = metrics
  if (['NAUSEA', 'HOT_PANTING', 'UPSIDE_DOWN', 'YAWN', 'LAUGHING'].includes(emotion)) {
    ctx.save()
    ctx.fillStyle = emotion === 'NAUSEA' ? '#a3e635' : '#38bdf8'
    const slide = ((now * 0.04) % 16) * (emotion === 'UPSIDE_DOWN' ? -1 : 1)
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

  if (emotion === 'NAUSEA') {
    const puff = 15 + Math.sin(now * 0.014) * 2.5
    ctx.save()
    ctx.fillStyle = 'rgba(163, 230, 53, 0.75)'
    ctx.strokeStyle = '#84cc16'
    ctx.lineWidth = 2.5
    for (const cx of [82, 158]) {
      ctx.beginPath()
      ctx.arc(cx, centerY + 34, puff, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    ctx.restore()
  }

  if (emotion === 'CRYING') {
    ctx.save()
    ctx.fillStyle = 'rgba(56, 189, 248, 0.82)'
    for (let i = 0; i < 2; i++) {
      const wave = Math.sin(now * 0.015 + i) * 3
      ctx.beginPath()
      ctx.roundRect(eyeXPos[i] - 8 + wave * 0.3, eyeYPos + 12, 16, 78, 8)
      ctx.fill()
    }
    ctx.restore()
  }
}

export function renderBasicOverlays(
  ctx: CanvasRenderingContext2D, emotion: Gc9a01Emotion, metrics: FaceMetrics, now: number
): void {
  if (emotion === 'BABY_SLEEP') drawSnotBubble(ctx, metrics.centerY)
  if ((emotion === 'WARNING_PREDICTIVE' || emotion === 'SNEEZE') && Math.abs(sharedState.coughOffset) > 1.2) {
    ctx.save()
    ctx.fillStyle = emotion === 'SNEEZE' ? 'rgba(186, 230, 253, 0.75)' : 'rgba(251, 191, 36, 0.55)'
    for (let p = 0; p < 4; p++) {
      ctx.beginPath()
      ctx.arc(metrics.mouthX + (p - 1.5) * 14, metrics.mouthY + 14 + ((now * 0.08 + p * 7) % 18), 5 + (p % 2) * 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
  if (emotion === 'VOMIT') drawVomitSplatters(ctx)
  else if (emotion === 'WIPER') drawWiperOverlay(ctx, now)
}
