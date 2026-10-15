<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Zap, Radio, Shield } from 'lucide-vue-next'
import anime from 'animejs'
import MadLabContainer from './MadLabContainer.vue'

const props = defineProps<{ modelValue: boolean; label?: string; hardwareStatus?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const toggleMotion = { angle: props.modelValue ? 24 : -24 }
const toggleAngle = ref(toggleMotion.angle)
const guardMotion = { angle: props.modelValue ? -55 : 0 }
const guardAngle = ref(guardMotion.angle)
const ledPulse = ref(1)

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function runSwitchAnimation(active: boolean) {
  if (isReducedMotion()) {
    toggleMotion.angle = active ? 24 : -24
    toggleAngle.value = toggleMotion.angle
    guardMotion.angle = active ? -55 : 0
    guardAngle.value = guardMotion.angle
    return
  }

  anime.remove(toggleMotion)
  anime.remove(guardMotion)

  // 1. Levantamiento o cierre de la guarda de seguridad aeroespacial
  anime({
    targets: guardMotion,
    angle: active ? -55 : 0,
    duration: 320,
    easing: 'easeOutCubic',
    update: () => { guardAngle.value = guardMotion.angle }
  })

  // 2. Transición elástica de la palanca de mando aeroespacial
  anime({
    targets: toggleMotion,
    angle: active ? 24 : -24,
    duration: 480,
    easing: 'spring(1.2, 85, 12, 0)',
    update: () => { toggleAngle.value = toggleMotion.angle }
  })

  // 3. Micro-destello reactivo en el diodo LED
  anime({
    targets: ledPulse,
    value: [2, 1],
    duration: 350,
    easing: 'easeOutQuad'
  })
}

watch(() => props.modelValue, (val) => { runSwitchAnimation(val) })

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
      :aria-label="label || 'Conmutador de vuelo táctico'"
      tabindex="0"
      @click="toggleSwitch"
      @keydown.space.prevent="toggleSwitch"
      @keydown.enter.prevent="toggleSwitch"
    >
      <!-- Encabezado Táctico -->
      <div class="flex items-center justify-between pb-1.5 border-b border-cyan-500/20 mb-1">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 transition-colors" :class="modelValue ? 'text-amber-400 animate-pulse' : 'text-cyan-400 animate-pulse'" />
          <span class="text-[10px] font-mono font-bold tracking-wide text-slate-100 uppercase">{{ label || 'CONMUTADOR DE VUELO' }}</span>
        </div>
        <div
          class="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border transition-all duration-300"
          :class="modelValue ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-cyan-950/70 border-cyan-500/80 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'"
        >
          {{ modelValue ? 'MODO LOCAL ACTIVO' : 'TELEMETRÍA EN VIVO' }}
        </div>
      </div>

      <!-- Escenario SVG del Switch Aeroespacial con Guarda Táctica -->
      <div class="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-[#050811] border border-cyan-500/20 shadow-inner">
        <!-- Retícula de fondo mecha -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />

        <svg class="w-full h-full" viewBox="0 0 220 130" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="switch-base-plate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="50%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#020617" />
            </linearGradient>
            <linearGradient id="toggle-lever" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#94a3b8" />
              <stop offset="40%" stop-color="#e2e8f0" />
              <stop offset="100%" stop-color="#64748b" />
            </linearGradient>
            <pattern id="hazard-pattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="12" fill="#0f172a" />
              <rect x="6" width="6" height="12" fill="#f97316" />
            </pattern>
            <filter id="switch-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Placa de montaje aeroespacial con tornillería de titanio -->
          <rect x="25" y="16" width="170" height="98" rx="8" fill="url(#switch-base-plate)" stroke="#334155" stroke-width="1.8" />
          <rect x="30" y="21" width="160" height="88" rx="6" fill="#050811" stroke="rgba(6, 182, 212, 0.2)" stroke-width="1" />

          <!-- Pernos mecha esquineros -->
          <circle cx="36" cy="27" r="2.5" fill="#1e293b" stroke="#06b6d4" stroke-width="0.8" />
          <circle cx="184" cy="27" r="2.5" fill="#1e293b" stroke="#06b6d4" stroke-width="0.8" />
          <circle cx="36" cy="103" r="2.5" fill="#1e293b" stroke="#06b6d4" stroke-width="0.8" />
          <circle cx="184" cy="103" r="2.5" fill="#1e293b" stroke="#06b6d4" stroke-width="0.8" />

          <!-- Grabado láser mecha: Posiciones LIVE vs LOCAL -->
          <text x="68" y="70" fill="#06b6d4" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle" opacity="0.85">EN VIVO</text>
          <circle cx="68" cy="80" r="3" :fill="!modelValue ? '#06b6d4' : '#1e293b'" :stroke="!modelValue ? '#22d3ee' : '#334155'" stroke-width="1" />

          <text x="152" y="70" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" text-anchor="middle" opacity="0.85">LOCAL</text>
          <circle cx="152" cy="80" r="3" :fill="modelValue ? '#f59e0b' : '#1e293b'" :stroke="modelValue ? '#fbbf24' : '#334155'" stroke-width="1" />

          <!-- Collarín y Bisel Central Mecanizado -->
          <rect x="92" y="50" width="36" height="42" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
          <circle cx="110" cy="71" r="14" fill="#020617" stroke="#06b6d4" stroke-width="1.2" />
          <circle cx="110" cy="71" r="7" fill="#0f172a" stroke="#64748b" stroke-width="1" />

          <!-- Palanca Selector Táctico de Vuelo (Toggle Lever) -->
          <g :transform="`rotate(${toggleAngle}, 110, 71)`">
            <!-- Vástago metálico de la palanca -->
            <rect x="107" y="32" width="6" height="38" rx="2" fill="url(#toggle-lever)" stroke="#334155" stroke-width="0.8" />
            <!-- Cabeza esférica con diodo LED integrado -->
            <circle cx="110" cy="30" r="8" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
            <circle
              cx="110"
              cy="30"
              r="4.5"
              :fill="modelValue ? '#f59e0b' : '#06b6d4'"
              filter="url(#switch-glow)"
              class="transition-colors duration-300"
            />
          </g>

          <!-- Guarda de Seguridad Abatible (Safety Cover Guard) con bisagra superior -->
          <g :transform="`rotate(${guardAngle}, 110, 26)`" class="transition-transform origin-[110px_26px]">
            <path
              d="M 94 28 L 126 28 L 122 58 L 98 58 Z"
              fill="url(#hazard-pattern)"
              stroke="#f97316"
              stroke-width="1.2"
              opacity="0.9"
            />
            <circle cx="110" cy="27" r="3" fill="#f97316" stroke="#020617" stroke-width="0.8" />
          </g>
        </svg>

        <!-- Etiqueta táctica de advertencia en la guarda -->
        <div class="absolute bottom-2 inset-x-0 text-center pointer-events-none">
          <span class="text-[8px] font-mono px-2 py-0.5 rounded bg-black/60 border border-slate-700/60" :class="modelValue ? 'text-amber-300' : 'text-cyan-300'">
            {{ modelValue ? 'GUARDA LEVANTADA • MODO DE PRUEBA' : 'GUARDA EN POSICIÓN • ENLACE ACTIVO' }}
          </span>
        </div>
      </div>

      <!-- Footer descriptivo -->
      <div
        class="text-[8.5px] font-mono text-center mt-1 px-2 py-1 rounded bg-slate-950/70 border transition-colors"
        :class="modelValue ? 'text-amber-300 border-amber-500/30' : 'text-cyan-300 border-cyan-500/30'"
      >
        {{ modelValue ? 'SIMULACIÓN: Inyectando datos sintéticos de prueba' : 'FÍSICO: Telemetría en tiempo real desde ESP32' }}
      </div>
    </div>
  </MadLabContainer>
</template>
