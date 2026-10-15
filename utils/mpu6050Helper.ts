export function getMpuShakeButtonLabel(emotion: string): string {
  if (emotion === 'DIZZY') return '2s (Náusea)'
  if (emotion === 'NAUSEA') return '4s (¡Vómito!)'
  if (emotion === 'VOMIT' || emotion === 'WIPER') return '¡Vómito!'
  return '1s (Mareo)'
}

export function getMpuOrientationLabel(emotion: string, isDizzyOrShaking: boolean, rollVal: number): string {
  if (emotion === 'VOMIT') return '🤮 ¡Vómito en Pantalla!'
  if (emotion === 'WIPER') return '🧽 Limpiaparabrisas...'
  if (emotion === 'NAUSEA') return '🤢 Aguantando Vómito'
  if (isDizzyOrShaking) return '🌀 ¡Sacudida • Mareado!'
  if (emotion === 'BABY_ROCKING') return '🍼 Meciendo Bebé (±18°)'
  if (emotion === 'BABY_SLEEP') return '😪 Dormido (Burbuja Moco)'
  if (Math.abs(rollVal) > 135 || emotion === 'UPSIDE_DOWN') return '🙃 De Cabeza (180°)'
  if (Math.abs(rollVal) > 45) return `Inclinación Lateral (${Math.round(rollVal)}°)`
  return 'Inclinación Estable'
}

export function computeMpuPupilStyle(rollVal: number, pitchVal: number): { transform: string } {
  const rawPx = (Math.max(-180, Math.min(180, rollVal)) / 180) * 22
  const rawPy = (Math.max(-90, Math.min(90, pitchVal)) / 90) * 22
  const dist = Math.hypot(rawPx, rawPy)
  const scale = dist > 22 ? 22 / dist : 1
  return { transform: `translate(${(rawPx * scale).toFixed(1)}px, ${(rawPy * scale).toFixed(1)}px)` }
}

export function computePointerGyroAngles(e: PointerEvent, rect: DOMRect): { eyeX: number; eyeY: number } {
  const halfW = rect.width / 2 || 34
  const halfH = rect.height / 2 || 34
  const normX = Math.max(-1, Math.min(1, (e.clientX - (rect.left + halfW)) / halfW))
  const normY = Math.max(-1, Math.min(1, (e.clientY - (rect.top + halfH)) / halfH))
  return {
    eyeX: Number((normX * 20).toFixed(1)),
    eyeY: Number((normY * 10).toFixed(1))
  }
}
