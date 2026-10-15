export interface CrtHistoryPoint {
  timestamp: number
  ppm: number
  predicted_ppm_15m: number
}

export function computeCrtPaths(
  history: CrtHistoryPoint[],
  predictedPpm15m: number,
  isExpanded: boolean
) {
  const viewWidth = isExpanded ? 600 : 320
  const viewHeight = isExpanded ? 300 : 120
  const plotWidth = isExpanded ? 500 : 260
  const plotHeight = isExpanded ? 230 : 100
  const plotOffsetY = isExpanded ? 35 : 10
  const midY = viewHeight / 2
  const midX = viewWidth / 2

  const minPpm = history.length ? Math.max(300, Math.min(...history.map(p => p.ppm)) - 40) : 350
  const maxPpm = history.length ? Math.max(800, Math.max(...history.map(p => p.ppm)) + 60) : 800
  const range = maxPpm - minPpm || 1

  const pointsSvg = history.length < 2
    ? `M 0 ${midY} L ${plotWidth} ${midY}`
    : history.map((p, i) => {
        const x = ((i / (history.length - 1)) * plotWidth).toFixed(1)
        const y = (plotOffsetY + (plotHeight - ((p.ppm - minPpm) / range) * plotHeight)).toFixed(1)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')

  const targetX = viewWidth - (isExpanded ? 35 : 10)
  const startY = history.length
    ? plotOffsetY + (plotHeight - ((history[history.length - 1].ppm - minPpm) / range) * plotHeight)
    : midY
  const rawEndY = plotOffsetY + (plotHeight - ((predictedPpm15m - minPpm) / range) * plotHeight)
  const endY = Number.isFinite(rawEndY)
    ? Math.max(plotOffsetY + 8, Math.min(plotOffsetY + plotHeight - 8, rawEndY))
    : midY

  return {
    viewWidth,
    viewHeight,
    midX,
    midY,
    pointsSvg,
    predLineSvg: `M ${plotWidth} ${startY.toFixed(1)} L ${targetX} ${endY.toFixed(1)}`,
    predCirclePos: { cx: targetX, cy: endY }
  }
}
