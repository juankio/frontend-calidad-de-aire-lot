<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Zap } from 'lucide-vue-next'
import LabScrew from './LabScrew.vue'
import MadLabContainer from './MadLabContainer.vue'
import anime from 'animejs'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  hardwareStatus?: 'ONLINE' | 'SIMULATED' | 'OFFLINE'
}>(), {
  modelValue: false,
  label: 'Palanca de Pruebas (Simulador)',
  hardwareStatus: 'OFFLINE'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle'): void
}>()

const switchArm = ref<SVGElement | null>(null)

watch(() => props.modelValue, (newVal) => {
  if (!switchArm.value) return
  
  anime({
    targets: switchArm.value,
    rotate: newVal ? 0 : -48,
    duration: 800,
    easing: 'spring(2, 70, 12, 0)',
  })
})

onMounted(() => {
  if (switchArm.value) {
    anime.set(switchArm.value, { rotate: props.modelValue ? 0 : -48 })
  }
})

function toggleSwitch() {
  console.log('toggleSwitch local triggered!')
  emit('update:modelValue', !props.modelValue)
  emit('toggle')
}
</script>

<template>
  <MadLabContainer no-padding class="cursor-pointer group active:scale-[0.99]">
    <div 
      @click="toggleSwitch"
      class="p-3 w-full flex-1 transition flex flex-col justify-between"
    >
      <!-- Encabezado -->
    <div class="flex items-center justify-between pb-1.5 border-b border-[#854d0e]/40 mb-1">
      <div class="flex items-center gap-1.5">
        <Zap class="w-3.5 h-3.5 transition-colors" :class="modelValue ? 'text-cyan-400 animate-pulse' : 'text-stone-500'" />
        <span class="text-[10px] font-journal font-bold tracking-wide text-[#fbbf24]">{{ label }}</span>
      </div>
      <span class="text-[9px] font-mono px-2 py-0.5 rounded font-black border transition-all duration-300" :class="modelValue ? 'border-cyan-400 text-cyan-300 bg-cyan-950/80 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'border-stone-700 text-stone-400 bg-stone-900/60'">
        {{ modelValue ? 'CIRCUITO ACTIVO [ON]' : 'SEGURO ABIERTO [OFF]' }}
      </span>
    </div>

    <!-- Escenario SVG Interruptor de Cuchilla 3D -->
    <div class="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#080605] via-[#020202] to-[#080605] border border-[#854d0e]/40 shadow-inner">
      <svg class="w-full h-full" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="knife-copper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047" /><stop offset="35%" stop-color="#f59e0b" /><stop offset="70%" stop-color="#b45309" /><stop offset="100%" stop-color="#78350f" />
          </linearGradient>
          <linearGradient id="ceramic-base" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#292524" /><stop offset="50%" stop-color="#1c1917" /><stop offset="100%" stop-color="#0c0a09" />
          </linearGradient>
          <linearGradient id="wood-handle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#451a03" /><stop offset="40%" stop-color="#9a3412" /><stop offset="70%" stop-color="#78350f" /><stop offset="100%" stop-color="#291102" />
          </linearGradient>
          <radialGradient id="arc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8" /><stop offset="60%" stop-color="#0891b2" stop-opacity="0.3" /><stop offset="100%" stop-color="#0891b2" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Base de Cerámica Aislante con Biseles y Pernos de Latón -->
        <rect x="34" y="12" width="132" height="106" rx="8" fill="url(#ceramic-base)" stroke="#57534e" stroke-width="1.5" />
        <rect x="38" y="16" width="124" height="98" rx="6" fill="none" stroke="#292524" stroke-width="1" />
        <circle cx="44" cy="22" r="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="0.8" />
        <circle cx="156" cy="22" r="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="0.8" />
        <circle cx="44" cy="108" r="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="0.8" />
        <circle cx="156" cy="108" r="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="0.8" />

        <!-- Zapatas de Contacto de Cobre Superior (Mordaza) -->
        <rect x="88" y="24" width="24" height="18" rx="2" fill="#78350f" stroke="#f59e0b" stroke-width="1.2" />
        <path d="M 94 24 L 94 38 M 106 24 L 106 38" stroke="#fde047" stroke-width="1.5" />
        <circle cx="100" cy="33" r="2.5" fill="#f59e0b" stroke="#451a03" stroke-width="0.8" />

        <!-- Zapata Inferior y Soporte de Pivote -->
        <rect x="88" y="86" width="24" height="22" rx="3" fill="#78350f" stroke="#f59e0b" stroke-width="1.2" />
        <circle cx="100" cy="97" r="8" fill="#92400e" stroke="#fde047" stroke-width="1" />

        <!-- Arcos Voltaicos de Plasma y Aura Eléctrica (Modo ON) -->
        <g v-if="modelValue">
          <circle cx="100" cy="31" r="22" fill="url(#arc-glow)" class="animate-pulse" />
          <path d="M 86 33 Q 80 25 84 17 Q 90 22 93 28 M 114 33 Q 120 25 116 17 Q 110 22 107 28 M 96 22 L 100 10 L 104 22 M 90 35 L 82 42 L 89 45 M 110 35 L 118 42 L 111 45" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" fill="none" class="spark-electric" />
          <circle cx="100" cy="31" r="14" fill="#06b6d4" opacity="0.4" class="animate-ping" />
        </g>

        <!-- Brazo de Doble Cuchilla de Cobre + Mango de Madera Torneada -->
        <g ref="switchArm" :style="{ transformOrigin: '100px 97px' }">
          <!-- Cuchilla Doble -->
          <polygon points="95,97 95,31 98,31 98,97" fill="url(#knife-copper)" stroke="#fde047" stroke-width="0.7" />
          <polygon points="102,97 102,31 105,31 105,97" fill="url(#knife-copper)" stroke="#fde047" stroke-width="0.7" />
          <!-- Barra Aislante y Mango de Madera Torneada -->
          <rect x="91" y="26" width="18" height="5" rx="1.5" fill="#451a03" stroke="#b45309" stroke-width="0.8" />
          <rect x="93" y="4" width="14" height="24" rx="4" fill="url(#wood-handle)" stroke="#b45309" stroke-width="1.2" />
          <line x1="93" y1="11" x2="107" y2="11" stroke="#f59e0b" stroke-width="1" />
          <line x1="93" y1="18" x2="107" y2="18" stroke="#f59e0b" stroke-width="1" />
          <circle cx="100" cy="8" r="4.5" fill="#78350f" stroke="#d97706" stroke-width="0.8" />
        </g>

        <!-- Perno Pasador Central de Latón del Pivote -->
        <circle cx="100" cy="97" r="5" fill="#fde047" stroke="#78350f" stroke-width="1.2" />
        <circle cx="100" cy="97" r="2" fill="#451a03" />
      </svg>
    </div>

    <!-- Barra de Estado Inferior -->
    <div class="mt-1.5 pt-1.5 border-t border-[#854d0e]/30 flex flex-col gap-0.5 text-center font-journal">
      <div v-if="!modelValue && hardwareStatus !== 'ONLINE'" class="text-[8.5px] text-amber-400 font-bold tracking-wide animate-pulse bg-amber-950/50 py-0.5 px-1 rounded border border-amber-500/40">
        ⚡ Cierra la palanca para iniciar simulación
      </div>
      <div v-else class="flex items-center justify-between text-[9px]">
        <span class="text-[#fbbf24] font-bold">ESTADO CIRCUITO:</span>
        <span class="font-bold tracking-wide" :class="modelValue ? 'text-cyan-400 font-mono drop-shadow-[0_0_6px_#22d3ee]' : 'text-stone-400 font-mono'">
          {{ modelValue ? 'ALTA TENSIÓN [CONECTADO]' : 'DESCONECTADO' }}
        </span>
      </div>
    </div>
    </div>
  </MadLabContainer>
</template>

<style scoped>
@keyframes electric {
  0%, 100% { opacity: 0.3; transform: scale(0.95); filter: drop-shadow(0 0 2px #38bdf8); }
  50% { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 0 8px #22d3ee); }
}
.spark-electric { animation: electric 0.12s infinite alternate ease-in-out; }
</style>