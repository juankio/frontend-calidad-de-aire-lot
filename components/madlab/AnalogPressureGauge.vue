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
  title: 'Manómetro de Aire CO2',
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
  if (props.value > 1200) return { label: 'CRÍTICO', color: '#ef4444', badge: 'text-rose-400 border-rose-500 bg-rose-950/40' }
  if (props.value >= 700) return { label: 'ALERTA', color: '#f59e0b', badge: 'text-amber-400 border-amber-500 bg-amber-950/40' }
  return { label: 'ÓPTIMO', color: '#10b981', badge: 'text-emerald-400 border-emerald-500 bg-emerald-950/40' }
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

  // Inercia y amortiguamiento elástico con sobreimpulso mecánico realista
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
      opacity: [{ value: 0.9, duration: 80 }, { value: 0.2, duration: 400 }],
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
    <div class="p-3.5">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-2 border-b border-[#854d0e]/40 mb-2">
        <div class="flex items-center gap-1.5">
          <Gauge class="w-3.5 h-3.5 text-amber-400" />
          <span class="text-[11px] font-journal font-bold tracking-wider text-[#fbbf24]">{{ title }}</span>
        </div>
        <span class="text-[9px] font-mono px-2 py-0.5 rounded font-black border" :class="statusZone.badge">{{ statusZone.label }}</span>
      </div>

      <!-- Esfera del Manómetro SVG -->
      <div class="relative w-full h-36 flex items-center justify-center">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="brass-bezel" cx="50%" cy="50%" r="50%">
              <stop offset="78%" stop-color="#292524" /><stop offset="90%" stop-color="#b45309" /><stop offset="96%" stop-color="#fbbf24" /><stop offset="100%" stop-color="#78350f" />
            </radialGradient>
          </defs>

          <circle cx="100" cy="100" r="94" fill="url(#brass-bezel)" stroke="#78350f" stroke-width="2.5" />
          <circle cx="100" cy="100" r="76" fill="#0c0a09" stroke="#44403c" stroke-width="1.2" />

          <path d="M 41.2 135 A 68 68 0 0 1 62 41" fill="none" stroke="#10b981" stroke-width="6" stroke-linecap="round" />
          <path d="M 68 36 A 68 68 0 0 1 142 46" fill="none" stroke="#f59e0b" stroke-width="6" />
          <path d="M 148 51 A 68 68 0 0 1 158.8 135" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />

          <!-- Resplandor reactivo de alerta crítica -->
          <circle ref="dialGlowRef" cx="100" cy="100" r="74" fill="#ef4444" opacity="0" pointer-events="none" />

          <text x="50" y="146" fill="#94a3b8" font-size="8" font-family="monospace" font-weight="bold">300</text>
          <text x="64" y="26" fill="#94a3b8" font-size="8" font-family="monospace" font-weight="bold">700</text>
          <text x="134" y="32" fill="#94a3b8" font-size="8" font-family="monospace" font-weight="bold">1.2k</text>
          <text x="142" y="146" fill="#94a3b8" font-size="8" font-family="monospace" font-weight="bold">2k</text>
          <text x="100" y="142" fill="#d97706" font-size="7.5" font-family="monospace" font-weight="bold" text-anchor="middle">PPM CO2</text>

          <!-- Aguja Metálica Pivotante con Inercia y Rebote Físico (Anime.js) -->
          <g :transform="`rotate(${currentAngle}, 100, 100)`">
            <circle cx="100" cy="118" r="5" fill="#78350f" stroke="#d97706" stroke-width="0.8" />
            <line x1="100" y1="118" x2="100" y2="100" stroke="#b45309" stroke-width="2.5" />
            <polygon points="98,100 100,34 102,100" fill="#dc2626" />
            <line x1="100" y1="100" x2="100" y2="30" stroke="#fca5a5" stroke-width="1.2" stroke-linecap="round" />
          </g>

          <circle cx="100" cy="100" r="9" fill="#d97706" stroke="#fbbf24" stroke-width="1.5" />
          <circle cx="100" cy="100" r="4" fill="#451a03" />
          <line x1="97" y1="100" x2="103" y2="100" stroke="#fbbf24" stroke-width="1" />
        </svg>
      </div>

      <!-- Lectura de Presión con Suavizado Dinámico -->
      <div class="mt-1 pt-2 border-t border-[#854d0e]/30 flex items-center justify-between px-2">
        <span class="text-[9.5px] font-journal text-[#fbbf24] font-bold">Concentración de CO2:</span>
        <span class="text-[13px] font-mono font-black text-white tracking-wider">{{ displayValue }} <span class="text-[10px] text-stone-400">{{ unit }}</span></span>
      </div>
    </div>
  </MadLabContainer>
</template>