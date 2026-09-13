<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Zap } from 'lucide-vue-next'
import anime from 'animejs'
import MadLabContainer from './MadLabContainer.vue'

const props = defineProps<{ modelValue: boolean; label?: string; hardwareStatus?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const bladeMotion = { angle: props.modelValue ? 0 : -46 }
const bladeAngle = ref(bladeMotion.angle)
const stageRef = ref<HTMLElement | null>(null)
const jawRef = ref<SVGElement | null>(null)
const sparksRef = ref<SVGElement | null>(null)
const sparkIntensity = ref(props.modelValue ? 0.4 : 0)
let sparkTimeout: ReturnType<typeof setTimeout> | null = null

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function runSwitchAnimation(active: boolean) {
  if (isReducedMotion()) {
    bladeMotion.angle = active ? 0 : -46
    bladeAngle.value = bladeMotion.angle
    sparkIntensity.value = active ? 0.4 : 0
    if (jawRef.value) jawRef.value.style.filter = active ? 'drop-shadow(0 0 15px #38bdf8)' : 'none'
    return
  }

  anime.remove(bladeMotion)
  if (jawRef.value) anime.remove(jawRef.value)
  if (sparksRef.value) anime.remove(sparksRef.value)
  if (stageRef.value) anime.remove(stageRef.value)
  if (sparkTimeout) clearTimeout(sparkTimeout)

  if (active) {
    // Cuchilla cae con inercia física y rebote elástico spring(1, 90, 12, 0)
    anime({
      targets: bladeMotion,
      angle: 0,
      easing: 'spring(1, 90, 12, 0)',
      update: () => { bladeAngle.value = bladeMotion.angle }
    })

    // Destello de chispa eléctrica de alto voltaje en bornes de contacto
    sparkTimeout = setTimeout(() => {
      if (jawRef.value) {
        anime({
          targets: jawRef.value,
          filter: ['drop-shadow(0 0 0px #38bdf8)', 'drop-shadow(0 0 15px #38bdf8)', 'drop-shadow(0 0 5px #38bdf8)'],
          duration: 550,
          easing: 'easeOutQuad'
        })
      }
      if (sparksRef.value) {
        anime({
          targets: sparksRef.value,
          opacity: [{ value: 1, duration: 40 }, { value: 0.1, duration: 30 }, { value: 1, duration: 50 }, { value: 0.2, duration: 40 }, { value: 0.9, duration: 60 }, { value: 0, duration: 160 }],
          scale: [{ value: 1.3, duration: 60 }, { value: 0.9, duration: 50 }, { value: 1.2, duration: 70 }, { value: 1, duration: 150 }],
          easing: 'linear'
        })
      }
      sparkIntensity.value = 0.6
      if (stageRef.value) {
        anime({ targets: stageRef.value, translateY: [0, 1.2, -0.8, 0], duration: 180, easing: 'easeInOutQuad' })
      }
    }, 180)
  } else {
    // Cuchilla se retira hacia arriba
    anime({
      targets: bladeMotion,
      angle: -46,
      duration: 380,
      easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      update: () => { bladeAngle.value = bladeMotion.angle }
    })
    if (jawRef.value) {
      anime({ targets: jawRef.value, filter: ['drop-shadow(0 0 10px #38bdf8)', 'drop-shadow(0 0 0px #38bdf8)'], duration: 200, easing: 'easeOutQuad' })
    }
    if (sparksRef.value) {
      anime({ targets: sparksRef.value, opacity: [{ value: 0.8, duration: 40 }, { value: 0, duration: 120 }], easing: 'easeOutQuad' })
    }
    sparkIntensity.value = 0
  }
}

watch(() => props.modelValue, (val) => { runSwitchAnimation(val) })

onMounted(() => {
  if (props.modelValue && jawRef.value && !isReducedMotion()) {
    jawRef.value.style.filter = 'drop-shadow(0 0 6px #38bdf8)'
  }
})

onUnmounted(() => {
  anime.remove(bladeMotion)
  if (jawRef.value) anime.remove(jawRef.value)
  if (sparksRef.value) anime.remove(sparksRef.value)
  if (stageRef.value) anime.remove(stageRef.value)
  if (sparkTimeout) clearTimeout(sparkTimeout)
})

function toggleSwitch() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <MadLabContainer no-padding>
    <div
      class="p-3 w-full flex-1 flex flex-col justify-between cursor-pointer group select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label || 'Conmutador de cuchilla Frankenstein'"
      tabindex="0"
      @click="toggleSwitch"
      @keydown.space.prevent="toggleSwitch"
      @keydown.enter.prevent="toggleSwitch"
    >
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-1.5 border-b border-[#854d0e]/40 mb-1">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 transition-colors" :class="modelValue ? 'text-cyan-400 animate-pulse' : 'text-stone-500'" />
          <span class="text-[10px] font-journal font-bold tracking-wide text-[#fbbf24]">{{ label || 'Conmutador de Cuchilla' }}</span>
        </div>
        <div class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all duration-300"
          :class="modelValue ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-stone-900 border-stone-700 text-stone-500'">
          {{ modelValue ? 'CIRCUITO CERRADO' : 'CIRCUITO ABIERTO' }}
        </div>
      </div>

      <!-- Escenario SVG del Conmutador de Cuchilla Frankenstein -->
      <div ref="stageRef" class="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#070c14] to-[#020407] border border-[#854d0e]/30 shadow-inner">
        <svg class="w-full h-full" viewBox="0 0 220 130" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="cu-term-fs" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#fef08a" /><stop offset="45%" stop-color="#d97706" /><stop offset="100%" stop-color="#78350f" />
            </radialGradient>
            <linearGradient id="blade-brass-fs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" /><stop offset="30%" stop-color="#f59e0b" /><stop offset="70%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" />
            </linearGradient>
            <linearGradient id="handle-wood-fs" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3b1b0b" /><stop offset="50%" stop-color="#1c0f08" /><stop offset="100%" stop-color="#0a0503" />
            </linearGradient>
          </defs>

          <!-- Tablero Base de Pizarra / Baquelita y Remaches -->
          <rect x="16" y="16" width="188" height="98" rx="6" fill="#120e0b" stroke="#78350f" stroke-width="1.6" />
          <rect x="20" y="20" width="180" height="90" rx="4" fill="#080604" stroke="#451a03" stroke-width="1" opacity="0.9" />
          <circle cx="26" cy="26" r="2.2" fill="#d97706" /><circle cx="194" cy="26" r="2.2" fill="#d97706" />
          <circle cx="26" cy="104" r="2.2" fill="#d97706" /><circle cx="194" cy="104" r="2.2" fill="#d97706" />

          <!-- Pistas conductoras de cobre -->
          <line x1="22" y1="72" x2="48" y2="72" stroke="#b45309" stroke-width="4.5" stroke-linecap="round" />
          <line x1="22" y1="72" x2="48" y2="72" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round" />
          <line x1="162" y1="72" x2="198" y2="72" stroke="#b45309" stroke-width="4.5" stroke-linecap="round" />
          <line x1="162" y1="72" x2="198" y2="72" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round" />

          <!-- Bornes de Contacto con drop-shadow 15px #38bdf8 y Mordazas -->
          <g ref="jawRef" class="transition-transform duration-300">
            <rect x="144" y="55" width="18" height="34" rx="2" fill="#38200d" stroke="#b45309" stroke-width="1.4" />
            <path d="M 143 61 L 157 61 L 154 67 L 142 67 Z M 143 83 L 157 83 L 154 77 L 142 77 Z" fill="#f59e0b" stroke="#fbbf24" stroke-width="0.8" />
            <circle cx="153" cy="72" r="4" fill="url(#cu-term-fs)" stroke="#78350f" stroke-width="1" />
            <ellipse cx="153" cy="72" rx="16" ry="12" fill="#38bdf8" :opacity="sparkIntensity * 0.4" />
          </g>

          <!-- Bloque de Bisagra / Pivote Izquierdo -->
          <rect x="40" y="58" width="22" height="28" rx="2.5" fill="#38200d" stroke="#b45309" stroke-width="1.4" />
          <circle cx="51" cy="72" r="7" fill="url(#cu-term-fs)" stroke="#78350f" stroke-width="1.2" />
          <circle cx="51" cy="72" r="2.8" fill="#1c0f08" />

          <!-- Cuchilla Metálica Móvil con Pivote Dinámico (Anime.js) -->
          <g :transform="`rotate(${bladeAngle}, 51, 72)`">
            <path d="M 49 68 L 145 68 L 152 72 L 145 76 L 49 76 Z" fill="url(#blade-brass-fs)" stroke="#fbbf24" stroke-width="1" />
            <line x1="56" y1="72" x2="148" y2="72" stroke="#fef08a" stroke-width="1.2" opacity="0.85" />
            <rect x="146" y="62" width="6" height="20" rx="1.5" fill="#d97706" stroke="#fbbf24" stroke-width="0.8" />
            <path d="M 152 64 Q 174 61 195 64 Q 199 72 195 80 Q 174 83 152 80 Z" fill="url(#handle-wood-fs)" stroke="#78350f" stroke-width="1.2" />
            <circle cx="196" cy="72" r="5" fill="url(#cu-term-fs)" stroke="#78350f" stroke-width="1" />
          </g>

          <!-- Chispas Eléctricas de Alto Voltaje (Anime.js) -->
          <g ref="sparksRef" opacity="0" class="pointer-events-none">
            <path d="M 144 68 L 149 59 L 155 70 L 161 62 L 157 73" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M 142 74 L 148 83 L 154 73 L 162 81 L 156 71" stroke="#67e8f9" stroke-width="1.6" fill="none" stroke-linecap="round" />
            <path d="M 139 71 L 145 64 L 151 77 L 157 69" stroke="#ffffff" stroke-width="1.3" fill="none" stroke-linecap="round" />
            <circle cx="150" cy="62" r="1.8" fill="#ffffff" /><circle cx="158" cy="80" r="1.4" fill="#38bdf8" />
          </g>
        </svg>
      </div>

      <!-- Footer descriptivo -->
      <div class="text-[8.5px] font-journal text-center mt-1 px-2 py-1 rounded bg-black/40 border border-[#854d0e]/20 transition-colors"
           :class="modelValue ? 'text-cyan-300 border-cyan-900/40' : 'text-amber-500/70'">
        {{ modelValue ? '⚡ Cuchilla acoplada: Inyectando telemetría simulada' : '🔌 Cuchilla alzada: Clic para accionar simulación' }}
      </div>
    </div>
  </MadLabContainer>
</template>
