import { drawBubblegumPop } from './overlaysBasic'
import { clamp, sharedState } from './state'
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

function drawLaughMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, theme: EmotionTheme, now: number): void {
  const openScale = 20 * (0.35 + 0.65 * sharedState.transitionAlpha)
  const bounce = Math.abs(Math.sin(now * 0.015)) * 3
  const r = openScale + bounce
  ctx.fillStyle = theme.pupil
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(mx, my - 4, r, 0, Math.PI)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#fb7185'
  ctx.beginPath()
  ctx.arc(mx, my + 6 * sharedState.transitionAlpha, Math.max(4, r * 0.48), 0, Math.PI)
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
  ctx.fillStyle = theme.pupil
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
  if (sharedState.transitionAlpha < 0.85) {
    const gag = Math.sin(now * 0.045) * 3
    ctx.beginPath()
    ctx.ellipse(mx, my, 12 + 8 * sharedState.transitionAlpha, 5 + 6 * sharedState.transitionAlpha + gag, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    return
  }
  ctx.beginPath()
  ctx.ellipse(mx, my, 22, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  const cascadeEnd = my + (240 - my) * sharedState.transitionAlpha
  const streamGrad = ctx.createLinearGradient(mx, my, mx, 240)
  streamGrad.addColorStop(0, '#bef264')
  streamGrad.addColorStop(0.5, '#84cc16')
  streamGrad.addColorStop(1, '#4d7c0f')
  ctx.fillStyle = streamGrad
  const wave = Math.sin(now * 0.02) * 5
  ctx.beginPath()
  ctx.moveTo(mx - 18, my)
  ctx.quadraticCurveTo(mx - 24 + wave, (my + cascadeEnd) * 0.5, mx - 28, cascadeEnd)
  ctx.lineTo(mx + 28, cascadeEnd)
  ctx.quadraticCurveTo(mx + 24 + wave, (my + cascadeEnd) * 0.5, mx + 18, my)
  ctx.closePath()
  ctx.fill()
}

function drawWavyMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, emotion: Gc9a01Emotion, now: number): void {
  const tremble = emotion === 'CRYING' && now - sharedState.emotionEnteredMs < 700 ? Math.sin(now * 0.065) * 2.2 : 0
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(mx - 18, my + tremble)
  ctx.lineTo(mx - 9, my - 5 - tremble)
  ctx.lineTo(mx, my + 4 + tremble)
  ctx.lineTo(mx + 9, my - 5 - tremble)
  ctx.lineTo(mx + 18, my + tremble)
  ctx.stroke()
}

function drawPacifierMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, theme: EmotionTheme, now: number): void {
  const bob = Math.sin(now * 0.012) * 2
  ctx.fillStyle = theme.pupil
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(mx, my + bob, 14, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

function drawGasMaskMouth(ctx: CanvasRenderingContext2D, mx: number, my: number, theme: EmotionTheme): void {
  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = theme.primary
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
    case 'laugh': drawLaughMouth(ctx, mouthX, mouthY, theme, now); break
    case 'smirk': drawSmirkMouth(ctx, mouthX, mouthY); break
    case 'whistle': drawWhistleMouth(ctx, mouthX, mouthY); break
    case 'openOval': {
      const sneezePhase = (now - sharedState.emotionEnteredMs) % 2600
      const ry = (emotion === 'HOT_PANTING' ? 8 + Math.sin(now * 0.02) * 3.5 : 4 + 7 * sharedState.transitionAlpha) *
        (emotion === 'SNEEZE' ? (sneezePhase < 850 ? 0.55 + (sneezePhase / 850) * 0.55 : sneezePhase < 1850 ? 1.15 : 0.45) : 1)
      drawOpenOvalMouth(ctx, mouthX, mouthY, ry, theme)
      break
    }
    case 'yawn': {
      const openWave = Math.sin(clamp((now - sharedState.emotionEnteredMs) / 2800, 0, 1) * Math.PI)
      drawOpenOvalMouth(ctx, mouthX, mouthY, 2.5 + 14.5 * openWave, theme)
      break
    }
    case 'vomit': drawVomitMouth(ctx, mouthX, mouthY, now); break
    case 'wavy': drawWavyMouth(ctx, mouthX, mouthY, emotion, now); break
    case 'pacifier': drawPacifierMouth(ctx, mouthX, mouthY, theme, now); break
    case 'bubblegum': drawBubblegumPop(ctx, mouthX, mouthY, now); break
    case 'gasMask': drawGasMaskMouth(ctx, mouthX, mouthY, theme); break
    default:
      ctx.lineWidth = 3.5
      ctx.beginPath()
      ctx.moveTo(mouthX - 12, mouthY)
      ctx.lineTo(mouthX + 12, mouthY)
      ctx.stroke()
  }
  ctx.restore()
}
