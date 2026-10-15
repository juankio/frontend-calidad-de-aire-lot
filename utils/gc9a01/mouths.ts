import { drawBubblegumPop } from './overlaysBasic'
import type { EmotionTheme, FaceMetrics, Gc9a01Emotion } from './types'

function drawSmileMouth(ctx: CanvasRenderingContext2D, mx: number, my: number): void {
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(mx, my - 6, 17, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
}

function drawTongueMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, isPanting: boolean, now: number): void {
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(mx, my - 6, 15, 0.12 * Math.PI, 0.88 * Math.PI)
  ctx.stroke()
  const pantBob = isPanting ? Math.sin(now * 0.022) * 3.5 : 0
  ctx.fillStyle = '#fb7185'
  ctx.beginPath()
  ctx.roundRect(mx - 7, my + 2, 14, 15 + pantBob, [2, 2, 8, 8])
  ctx.fill()
}

function drawLaughMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, theme: EmotionTheme): void {
  ctx.fillStyle = '#4c0519'
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(mx, my - 4, 20, 0, Math.PI)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#fb7185'
  ctx.beginPath()
  ctx.arc(mx, my + 6, 10, 0, Math.PI)
  ctx.fill()
}

function drawSmirkMouth(ctx: CanvasRenderingContext2D, mx: number, my: number): void {
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(mx - 14, my + 2)
  ctx.quadraticCurveTo(mx + 4, my + 8, mx + 18, my - 6)
  ctx.stroke()
}

function drawWhistleMouth(ctx: CanvasRenderingContext2D, mx: number, my: number): void {
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(mx + 14, my, 6, 0, Math.PI * 2)
  ctx.stroke()
}

function drawOpenOvalMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, ry: number, theme: EmotionTheme): void {
  ctx.fillStyle = '#1e1b4b'
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.ellipse(mx, my + 2, 13, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

function drawVomitMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, now: number): void {
  ctx.fillStyle = '#1a2e05'
  ctx.strokeStyle = '#a3e635'
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.ellipse(mx, my, 22, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  const streamGrad = ctx.createLinearGradient(mx, my, mx, 240)
  streamGrad.addColorStop(0, '#bef264')
  streamGrad.addColorStop(0.5, '#84cc16')
  streamGrad.addColorStop(1, '#4d7c0f')
  ctx.fillStyle = streamGrad
  const wave = Math.sin(now * 0.02) * 5
  ctx.beginPath()
  ctx.moveTo(mx - 18, my)
  ctx.quadraticCurveTo(mx - 24 + wave, 195, mx - 28, 240)
  ctx.lineTo(mx + 28, 240)
  ctx.quadraticCurveTo(mx + 24 + wave, 195, mx + 18, my)
  ctx.closePath()
  ctx.fill()
}

function drawWavyMouth(ctx: CanvasRenderingContext2D, mx: number, my: number): void {
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(mx - 18, my)
  ctx.lineTo(mx - 9, my - 5)
  ctx.lineTo(mx, my + 4)
  ctx.lineTo(mx + 9, my - 5)
  ctx.lineTo(mx + 18, my)
  ctx.stroke()
}

function drawPacifierMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, now: number): void {
  const bob = Math.sin(now * 0.012) * 2
  ctx.fillStyle = '#f472b6'
  ctx.strokeStyle = '#fbcfe8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(mx, my + bob, 16, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(mx, my + bob, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fde047'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(mx, my + 8 + bob, 9, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.stroke()
}

function drawGasMaskMouth(ctx: CanvasRenderingContext2D, mx: number, my: number): void {
  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#facc15'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect(mx - 28, my - 18, 56, 38, 12)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.arc(mx - 30, my + 4, 13, 0, Math.PI * 2)
  ctx.arc(mx + 30, my + 4, 13, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  ctx.arc(mx, my + 2, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

export function renderMouth(
  ctx: CanvasRenderingContext2D, emotion: Gc9a01Emotion, theme: EmotionTheme, metrics: FaceMetrics, now: number
): void {
  const { mouthX, mouthY } = metrics
  ctx.save()
  ctx.strokeStyle = theme.primary
  ctx.fillStyle = theme.primary
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  switch (theme.mouthMode) {
    case 'smile': drawSmileMouth(ctx, mouthX, mouthY); break
    case 'tongue': drawTongueMouth(ctx, mouthX, mouthY, emotion === 'HOT_PANTING', now); break
    case 'laugh': drawLaughMouth(ctx, mouthX, mouthY, theme); break
    case 'smirk': drawSmirkMouth(ctx, mouthX, mouthY); break
    case 'whistle': drawWhistleMouth(ctx, mouthX, mouthY); break
    case 'openOval': drawOpenOvalMouth(ctx, mouthX, mouthY, 11, theme); break
    case 'yawn': drawOpenOvalMouth(ctx, mouthX, mouthY, 18, theme); break
    case 'vomit': drawVomitMouth(ctx, mouthX, mouthY, now); break
    case 'wavy': drawWavyMouth(ctx, mouthX, mouthY); break
    case 'pacifier': drawPacifierMouth(ctx, mouthX, mouthY, now); break
    case 'bubblegum': drawBubblegumPop(ctx, mouthX, mouthY, now); break
    case 'gasMask': drawGasMaskMouth(ctx, mouthX, mouthY); break
    default:
      ctx.lineWidth = 3.5
      ctx.beginPath()
      ctx.moveTo(mouthX - 12, mouthY)
      ctx.lineTo(mouthX + 12, mouthY)
      ctx.stroke()
  }
  ctx.restore()
}
