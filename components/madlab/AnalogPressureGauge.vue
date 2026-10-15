<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Gauge } from 'lucide-vue-next'
import anime from 'animejs'
import MadLabContainer from './MadLabContainer.vue'

const props = withDefaults(defineProps<{
  value?: number
  min?: number
  max?: number
  title?: string
  unit?: string
}>(), {
  value: 520,
  min: 300,
  max: 2000,
  title: 'Manómetro CO2 Táctico',
  unit: 'PPM'
})

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function calcAngle(val: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, val))
  const pct = (clamped - props.min) / (props.max - props.min)
  return -120 + pct * 240
}

const needleMotion = { angle: calcAngle(props.value) }
const currentAngle = ref(needleMotion.angle)
const readoutMotion = { val: props.value }
const displayValue = ref(Math.round(props.value))
const dialGlowRef = ref<SVGElement | null>(null)

const statusZone = computed(() => {
  if (props.value > 1200) return { label: 'CRÍTICO', color: '#ef4444', badge: 'text-rose-400 border-rose-500/80 bg-rose-950/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]' }
  if (props.value >= 700) return { label: 'ALERTA', color: '#f59e0b', badge: 'text-amber-300 border-amber-500/80 bg-amber-950/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]' }
  return { label: 'ÓPTIMO', color: '#06b6d4', badge: 'text-cyan-300 border-cyan-500/70 bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]' }
})

watch(() => props.value, (newVal) => {
  const targetAngle = calcAngle(newVal)

  if (isReducedMotion()) {
    needleMotion.angle = targetAngle
    currentAngle.value = targetAngle
    readoutMotion.val = newVal
    displayValue.value = Math.round(newVal)
    return
  }

  // Inercia y amortiguamiento elástico con sobreimpulso de instrumento de vuelo
  anime.remove(needleMotion)
  anime({
    targets: needleMotion,
    angle: targetAngle,
    easing: 'spring(1.15, 82, 10, 0)',
    update: () => {
      currentAngle.value = needleMotion.angle
    }
  })

  // Conteo sincronizado y suave de la lectura digital
  anime.remove(readoutMotion)
  anime({
    targets: readoutMotion,
    val: newVal,
    duration: 550,
    easing: 'easeOutQuad',
    update: () => {
      displayValue.value = Math.round(readoutMotion.val)
    }
  })

  // Destello reactivo si cruza al umbral crítico
  if (newVal > 1200 && dialGlowRef.value) {
    anime.remove(dialGlowRef.value)
    anime({
      targets: dialGlowRef.value,
      opacity: [{ value: 0.9, duration: 80 }, { value: 0.15, duration: 400 }],
      easing: 'easeOutQuad'
    })
  }
})

onMounted(() => {
  const targetAngle = calcAngle(props.value)
  if (isReducedMotion()) {
    currentAngle.value = targetAngle
    return
  }

  // Calibración inicial suave desde el origen del dial
  needleMotion.angle = -120
  anime({
    targets: needleMotion,
    angle: targetAngle,
    easing: 'spring(1, 80, 12, 0)',
    update: () => {
      currentAngle.value = needleMotion.angle
    }
  })
})

onUnmounted(() => {
  anime.remove(needleMotion)
  anime.remove(readoutMotion)
  if (dialGlowRef.value) anime.remove(dialGlowRef.value)
})
</script>

<template>
  <MadLabContainer no-padding>
    <div class="p-3 w-full h-full flex flex-col justify-between select-none">
      <!-- Encabezado Táctico -->
      <div class="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-1">
        <div class="flex items-center gap-1.5">
          <Gauge class="w-3.5 h-3.5 text-cyan-400" />
          <span class="text-[11px] font-mono font-bold tracking-wider text-slate-100 uppercase">{{ title }}</span>
        </div>
        <span class="text-[8.5px] font-mono px-2 py-0.5 rounded font-black border transition-all duration-300" :class="statusZone.badge">{{ statusZone.label }}</span>
      </div>

      <!-- Esfera del Manómetro Táctico HUD SVG -->
      <div class="relative w-full h-36 flex items-center justify-center">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hud-gauge-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="60%" stop-color="#0b1120" />
              <stop offset="100%" stop-color="#030712" />
            </linearGradient>
            <filter id="needle-laser" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Bisel exterior mecha -->
          <circle cx="100" cy="100" r="95" fill="url(#hud-gauge-rim)" stroke="#1e293b" stroke-width="2" />
          <circle cx="100" cy="100" r="88" fill="#050811" stroke="rgba(6, 182, 212, 0.2)" stroke-width="1" />

          <!-- Ticks radiales milimétricos -->
          <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.8" stroke-dasharray="2, 5.5" />

          <!-- Arcos LED Luminosos de Estado (Cian -> Ámbar -> Rojo) -->
          <path d="M 41.2 135 A 68 68 0 0 1 62 41" fill="none" stroke="#06b6d4" stroke-width="5" stroke-linecap="round" />
          <path d="M 68 36 A 68 68 0 0 1 142 46" fill="none" stroke="#f59e0b" stroke-width="5" />
          <path d="M 148 51 A 68 68 0 0 1 158.8 135" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />

          <!-- Resplandor reactivo de alerta crítica -->
          <circle ref="dialGlowRef" cx="100" cy="100" r="76" fill="#ef4444" opacity="0" pointer-events="none" />

          <!-- Marcadores de Escala en JetBrains Mono -->
          <text x="48" y="146" fill="#94a3b8" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="700">300</text>
          <text x="64" y="26" fill="#94a3b8" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="700">700</text>
          <text x="134" y="32" fill="#94a3b8" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="700">1.2k</text>
          <text x="144" y="146" fill="#94a3b8" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="700">2k</text>
          <text x="100" y="142" fill="#06b6d4" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle" letter-spacing="1">PPM CO2</text>

          <!-- Aguja Vectorial Táctica Pivotante con Resorte Anime.js -->
          <g :transform="`rotate(${currentAngle}, 100, 100)`">
            <circle cx="100" cy="118" r="4.5" fill="#0f172a" stroke="#06b6d4" stroke-width="1" />
            <line x1="100" y1="118" x2="100" y2="100" stroke="#06b6d4" stroke-width="2" />
            <polygon points="98.5,100 100,28 101.5,100" fill="#22d3ee" filter="url(#needle-laser)" />
            <line x1="100" y1="100" x2="100" y2="24" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />
          </g>

          <!-- Centro del Pivote Mecha -->
          <circle cx="100" cy="100" r="8" fill="#0f172a" stroke="#06b6d4" stroke-width="1.5" />
          <circle cx="100" cy="100" r="3.5" fill="#22d3ee" />
        </svg>
      </div>

      <!-- Lectura Digital Táctica de Precisión -->
      <div class="mt-1 pt-2 border-t border-cyan-500/20 flex items-center justify-between px-2 font-mono">
        <span class="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Telemetría CO2:</span>
        <span class="text-[13px] font-black text-white tracking-wider">{{ displayValue }} <span class="text-[10px] text-cyan-400/80">{{ unit }}</span></span>
      </div>
    </div>
  </MadLabContainer>
</template>