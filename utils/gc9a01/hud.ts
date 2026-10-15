import { clamp, getGc9a01EmotionLabel } from './state'
import type { EmotionTheme, Gc9a01Emotion, Gc9a01RenderParams } from './types'

export function renderCircularHUD(
  ctx: CanvasRenderingContext2D,
  params: Gc9a01RenderParams,
  emotion: Gc9a01Emotion,
  palette: EmotionTheme
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
