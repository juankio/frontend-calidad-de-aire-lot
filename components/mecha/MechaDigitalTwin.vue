<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { useMechaThreeScene } from '~/composables/useMechaThreeScene'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  ppm?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
  wireframe?: boolean
  clamshellDistance?: number
  autoRotate?: boolean
  compact?: boolean
}>(), {
  ppm: 420,
  riskStatus: 'OPTIMAL',
  pitch: 0,
  roll: 0,
  wireframe: false,
  clamshellDistance: 0,
  autoRotate: true,
  compact: false
})

const containerRef = ref<HTMLDivElement | null>(null)
const { isLoading, loadProgress, hasError, errorMessage, init, updateOptions, resetCamera, dispose } = useMechaThreeScene()

// Referencias vivas para el motor Three.js
defineExpose({
  resetCamera
})

onMounted(() => {
  if (containerRef.value) {
    init(containerRef.value, {
      wireframe: props.wireframe,
      clamshellDistance: props.clamshellDistance,
      compact: props.compact,
      ppm: props.ppm,
      riskStatus: props.riskStatus,
      pitch: props.pitch,
      roll: props.roll,
      ax: props.ax,
      ay: props.ay,
      az: props.az,
      autoRotate: props.autoRotate
    })
  }
})

watch(() => [
  props.wireframe,
  props.clamshellDistance,
  props.ppm,
  props.riskStatus,
  props.pitch,
  props.roll,
  props.ax,
  props.ay,
  props.az,
  props.autoRotate
], () => {
  updateOptions({
    wireframe: props.wireframe,
    clamshellDistance: props.clamshellDistance,
    ppm: props.ppm,
    riskStatus: props.riskStatus,
    pitch: props.pitch,
    roll: props.roll,
    ax: props.ax,
    ay: props.ay,
    az: props.az,
    autoRotate: props.autoRotate
  })
})

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <div class="relative w-full h-full flex items-center justify-center select-none overflow-hidden group">
    <!-- Contenedor WebGL Canvas de Three.js -->
    <div
      ref="containerRef"
      class="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
    />

    <!-- Pantalla de Carga Cyber-Mecha -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-2 text-cyan-400 font-mono text-xs"
    >
      <Loader2 class="w-6 h-6 animate-spin text-cyan-400" />
      <div class="flex items-center gap-1 font-bold tracking-wider">
        <span>ENSAMBLANDO MECHA 3D...</span>
        <span>{{ loadProgress }}%</span>
      </div>
      <div class="w-28 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-cyan-500 transition-all duration-300"
          :style="{ width: `${loadProgress}%` }"
        />
      </div>
    </div>

    <!-- Error de Carga -->
    <div
      v-if="hasError"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/90 text-rose-300 font-mono text-xs p-4 text-center"
    >
      <span class="font-bold uppercase tracking-wider mb-1">Fallo de Telemetría Gráfica</span>
      <span class="text-[10px] opacity-80">{{ errorMessage }}</span>
    </div>

    <!-- Indicador de Control Táctil HUD (solo en hover/desktop y no compacto) -->
    <div
      v-if="!compact && !isLoading"
      class="absolute bottom-2 left-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono text-[9px] text-cyan-400/80 bg-slate-950/70 border border-cyan-500/30 px-2 py-0.5 rounded backdrop-blur-sm hidden sm:flex items-center gap-1.5"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
      <span>ARRASTRAR: ROTAR • SCROLL: ZOOM</span>
    </div>
  </div>
</template>
