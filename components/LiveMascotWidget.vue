<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  ppm: number
  coPpm: number
  temperature: number
  humidity: number
  riskStatus: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  viewMode: 'FACE' | 'HUD'
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId: number | null = null

// Físicas de pupila MPU-6050
let currentX = 0, currentY = 0
let targetX = 0, targetY = 0
let vx = 0, vy = 0
const stiffness = 0.14
const damping = 0.72

// Parpadeo y respiración
let breathAngle = 0
let isBlinking = false
let blinkProgress = 0
let nextBlink = 2000

// Cache de centro para evitar reflow síncrono forzado (layout thrashing) en cada mousemove
let cachedCx = 0
let cachedCy = 0
let cachedRadiusX = 120
let cachedRadiusY = 120

function updateCenter() {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  cachedCx = rect.left + rect.width / 2
  cachedCy = rect.top + rect.height / 2
  cachedRadiusX = (rect.width / 2) || 120
  cachedRadiusY = (rect.height / 2) || 120
}

function handleMouseMove(e: MouseEvent) {
  if (!cachedCx) updateCenter()
  targetX = Math.max(-10, Math.min(10, ((e.clientX - cachedCx) / cachedRadiusX) * 10))
  targetY = Math.max(-8, Math.min(8, ((e.clientY - cachedCy) / cachedRadiusY) * 8))
}

function renderFrame(time: number) {
  animId = requestAnimationFrame(renderFrame)
  if (typeof document !== 'undefined' && document.hidden) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Físicas de resorte
  const fx = -stiffness * (currentX - targetX)
  const fy = -stiffness * (currentY - targetY)
  vx = (vx + fx) * damping
  vy = (vy + fy) * damping
  currentX += vx
  currentY += vy

  breathAngle += 0.04
  if (time > nextBlink && !isBlinking && props.riskStatus !== 'SLEEPING') {
    isBlinking = true
    blinkProgress = 0
  }
  if (isBlinking) {
    blinkProgress += 0.12
    if (blinkProgress >= 1) {
      isBlinking = false
      nextBlink = time + 2500 + Math.random() * 3000
    }
  }

  // Limpiar y cortar círculo exacto
  ctx.save()
  ctx.clearRect(0, 0, 240, 240)
  ctx.beginPath()
  ctx.arc(120, 120, 119.5, 0, Math.PI * 2)
  ctx.clip()

  // Fondo según estado
  const bgGrad = ctx.createRadialGradient(120, 120, 10, 120, 120, 120)
  if (props.riskStatus === 'OPTIMAL') { bgGrad.addColorStop(0, '#06281e'); bgGrad.addColorStop(1, '#02120d') }
  else if (props.riskStatus === 'WARNING_PREDICTIVE') { bgGrad.addColorStop(0, '#2e1f04'); bgGrad.addColorStop(1, '#140c01') }
  else if (props.riskStatus === 'CRITICAL') { bgGrad.addColorStop(0, '#36060c'); bgGrad.addColorStop(1, '#170104') }
  else { bgGrad.addColorStop(0, '#042433'); bgGrad.addColorStop(1, '#010e17') }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 240, 240)

  // MODO CARA MASCOTA
  if (props.viewMode === 'FACE') {
    const breathY = Math.sin(breathAngle) * 1.5
    ctx.translate(120, 120 + breathY)

    let color = '#10b981'
    let pupilColor = '#022c22'
    if (props.riskStatus === 'WARNING_PREDICTIVE') { color = '#f59e0b'; pupilColor = '#451a03' }
    if (props.riskStatus === 'CRITICAL') { color = '#f43f5e'; pupilColor = '#4c0519' }
    if (props.riskStatus === 'RECOVERY') { color = '#38bdf8'; pupilColor = '#082f49' }

    let blinkH = 1
    if (isBlinking) {
      blinkH = Math.max(0.06, 1.0 - Math.sin(blinkProgress * Math.PI) * 0.94)
    }

    // Ojos
    ;[-42, 42].forEach(ex => {
      ctx.save()
      ctx.translate(ex, -12)
      if (props.riskStatus === 'SLEEPING') {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(0, -2, 12, 0.15 * Math.PI, 0.85 * Math.PI, false)
        ctx.stroke()
      } else {
        ctx.scale(1, blinkH)
        if (props.riskStatus === 'CRITICAL') {
          ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); ctx.stroke()
        } else {
          ctx.fillStyle = color
          ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill()
          const px = Math.max(-8, Math.min(8, currentX))
          const py = Math.max(-7, Math.min(7, currentY))
          ctx.fillStyle = pupilColor
          ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.arc(px - 4, py - 4, 4.5, 0, Math.PI * 2); ctx.fill()
        }
      }
      ctx.restore()
    })

    // Boca
    ctx.strokeStyle = props.riskStatus === 'SLEEPING' ? '#38bdf8' : color
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    if (props.riskStatus === 'SLEEPING') {
      ctx.arc(0, 10, 8, 0.15 * Math.PI, 0.85 * Math.PI, false)
      ctx.stroke()
      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 11px "JetBrains Mono", monospace'
      const zOffset = Math.sin(breathAngle) * 3
      ctx.fillText('z', 26, -26 + zOffset)
      ctx.fillText('Z', 36, -36 + zOffset)
    } else if (props.riskStatus === 'OPTIMAL') {
      ctx.arc(0, 14, 12, 0.15 * Math.PI, 0.85 * Math.PI, false)
      ctx.stroke()
    } else if (props.riskStatus === 'WARNING_PREDICTIVE') {
      ctx.moveTo(-10, 20); ctx.lineTo(0, 16); ctx.lineTo(10, 20)
      ctx.stroke()
    } else if (props.riskStatus === 'CRITICAL') {
      ctx.arc(0, 22, 6, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.arc(0, 10, 16, 0.1 * Math.PI, 0.9 * Math.PI, false)
      ctx.stroke()
    }
  } else {
    // MODO TACÓMETRO CIRCULAR (HUD)
    const cx = 120, cy = 120
    const startRad = (135 * Math.PI) / 180
    const totalRad = (270 * Math.PI) / 180
    const pct = Math.max(0, Math.min(1, (props.ppm - 350) / 1650))

    ctx.beginPath()
    ctx.arc(cx, cy, 88, startRad, startRad + totalRad, false)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    let trackColor = '#10b981'
    if (props.riskStatus === 'WARNING_PREDICTIVE' || props.ppm > 800) trackColor = '#f59e0b'
    if (props.riskStatus === 'CRITICAL' || props.ppm > 1400) trackColor = '#f43f5e'
    if (props.riskStatus === 'RECOVERY') trackColor = '#38bdf8'

    if (pct > 0.02) {
      ctx.beginPath()
      ctx.arc(cx, cy, 88, startRad, startRad + totalRad * pct, false)
      ctx.strokeStyle = trackColor
      ctx.lineWidth = 12
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = trackColor
    ctx.font = 'bold 10px "JetBrains Mono", monospace'
    let label = 'AIRE OPTIMO'
    if (props.riskStatus === 'WARNING_PREDICTIVE') label = 'ALERTA ALZA'
    else if (props.riskStatus === 'CRITICAL') label = 'PELIGRO GAS'
    else if (props.riskStatus === 'RECOVERY') label = 'VENTILANDO'
    else if (props.riskStatus === 'SLEEPING') label = 'REPOSO'
    ctx.fillText(label, cx, cy - 48)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px "JetBrains Mono", monospace'
    ctx.fillText(Math.round(props.ppm).toString(), cx, cy - 8)

    ctx.fillStyle = trackColor
    ctx.font = '600 11px "JetBrains Mono", monospace'
    ctx.fillText('PPM CO2eq', cx, cy + 18)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '500 11px "JetBrains Mono", monospace'
    ctx.fillText(`${props.temperature.toFixed(1)}°C  |  ${Math.round(props.humidity)}% HR`, cx, cy + 44)
  }

  ctx.restore()
}

onMounted(() => {
  updateCenter()
  animId = requestAnimationFrame(renderFrame)
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('resize', updateCenter, { passive: true })
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', updateCenter)
})
</script>

<template>
  <!-- Display Circular GC9A01 1:1 con Bisel Mecanizado Único -->
  <div class="relative w-56 h-56 sm:w-60 sm:h-60 rounded-full p-2.5 bg-gradient-to-tr from-slate-700 via-slate-300 to-slate-800 border-2 border-slate-400 shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center select-none">
    <!-- Bisel Interior de Anodizado Negro -->
    <div class="w-full h-full rounded-full overflow-hidden bg-black relative border-2 border-neutral-950 shadow-inner flex items-center justify-center">
      <canvas ref="canvasRef" width="240" height="240" class="w-full h-full object-contain cursor-crosshair"></canvas>
      <!-- Reflejo óptico CRT -->
      <div class="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]"></div>
      <div class="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent"></div>
    </div>
  </div>
</template>
