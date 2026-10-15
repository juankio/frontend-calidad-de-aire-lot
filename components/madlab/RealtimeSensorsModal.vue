<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Activity, X, LayoutGrid, Wind, Flame, Thermometer, Compass, Cpu } from 'lucide-vue-next'
import anime from 'animejs'
import type { TelemetryData } from '~/composables/useAirGuardian'
import SensorMq135Card from './sensors/SensorMq135Card.vue'
import SensorMq7Card from './sensors/SensorMq7Card.vue'
import SensorDht11Card from './sensors/SensorDht11Card.vue'
import SensorMpu6050Card from './sensors/SensorMpu6050Card.vue'
import SystemEsp32TelemetryCard from './sensors/SystemEsp32TelemetryCard.vue'

const props = defineProps<{
  isOpen: boolean
  telemetry: TelemetryData
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

type ActiveTab = 'ALL' | 'MQ135' | 'MQ7' | 'DHT11' | 'MPU6050' | 'SYSTEM'
const activeTab = ref<ActiveTab>('ALL')

const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const isClosing = ref(false)

const isReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

const tabs = [
  { id: 'ALL' as const, label: 'Grid Bento', icon: LayoutGrid },
  { id: 'MQ135' as const, label: 'MQ-135', icon: Wind },
  { id: 'MQ7' as const, label: 'MQ-7 (CO)', icon: Flame },
  { id: 'DHT11' as const, label: 'DHT11', icon: Thermometer },
  { id: 'MPU6050' as const, label: 'MPU-6050', icon: Compass },
  { id: 'SYSTEM' as const, label: 'ESP32 SoC', icon: Cpu }
]

async function animateOpen() {
  await nextTick()
  if (isReducedMotion() || !modalCardRef.value || !backdropRef.value) return

  anime.remove([backdropRef.value, modalCardRef.value])
  anime({ targets: backdropRef.value, opacity: [0, 1], duration: 250, easing: 'easeOutQuad' })
  anime({ targets: modalCardRef.value, opacity: [0, 1], scale: [0.94, 1], translateY: [15, 0], duration: 350, easing: 'cubicBezier(0.16, 1, 0.3, 1)' })
}

function handleClose() {
  if (isClosing.value) return
  if (isReducedMotion() || !modalCardRef.value || !backdropRef.value) {
    emit('close')
    return
  }

  isClosing.value = true
  anime.remove([modalCardRef.value, backdropRef.value])
  anime({ targets: modalCardRef.value, opacity: [1, 0], scale: [1, 0.95], translateY: [0, 12], duration: 180, easing: 'easeInQuad' })
  anime({
    targets: backdropRef.value,
    opacity: [1, 0],
    duration: 200,
    easing: 'easeInQuad',
    complete: () => {
      isClosing.value = false
      emit('close')
    }
  })
}

watch(() => props.isOpen, (open) => {
  if (open) {
    isClosing.value = false
    animateOpen()
  }
})
</script>

<template>
  <div
    v-if="isOpen"
    ref="backdropRef"
    class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]"
  >
    <div
      ref="modalCardRef"
      class="bg-[#070b14]/95 border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92dvh] overflow-hidden p-3.5 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] relative select-none flex flex-col gap-3"
    >
      <!-- Esquinas Tácticas HUD (Corner Brackets SVG) -->
      <svg class="absolute top-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 13V3C1 1.89543 1.89543 1 3 1H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 13V3C13 1.89543 12.1046 1 11 1H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M1 1V11C1 12.1046 1.89543 13 3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <svg class="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" viewBox="0 0 14 14" fill="none">
        <path d="M13 1V11C13 12.1046 12.1046 13 11 13H1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>

      <!-- Cabecera Cyber-Mecha Táctica -->
      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 px-1 sm:px-2 shrink-0">
        <div class="flex items-center gap-2 sm:gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
            <Activity class="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-scifi font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>BANCO DE SENSORES EN TIEMPO REAL</span>
            </h3>
            <p class="text-[9px] sm:text-[9.5px] font-mono text-slate-400">
              Lectura directa de pines ADC, buses I2C / 1-Wire y métricas de silicio ESP32
            </p>
          </div>
        </div>

        <!-- Botón de Cierre Claro y Accesible -->
        <button
          type="button"
          @click="handleClose"
          aria-label="Cerrar modal de sensores"
          title="Cerrar panel de sensores (Esc)"
          class="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 cursor-pointer transition active:scale-95 shadow shrink-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Barra de Filtros / Pestañas de Instrumentación -->
      <nav aria-label="Filtro de sensores" class="flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-cyan-500/20 shrink-0 font-mono">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          @click="activeTab = t.id"
          class="min-h-[34px] sm:min-h-0 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          :class="activeTab === t.id ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900'"
        >
          <component :is="t.icon" class="w-3.5 h-3.5" />
          <span>{{ t.label }}</span>
        </button>
      </nav>

      <!-- Contenedor Bento Grid & Pestañas -->
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1">
        <!-- Vista Bento Completa (Todas las tarjetas ordenadas) -->
        <div
          v-if="activeTab === 'ALL'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 items-stretch"
        >
          <SensorMq135Card
            :ppm="telemetry.ppm"
            :raw-adc="telemetry.raw_adc"
            :delta-ppm="telemetry.delta_ppm_1m"
            class="md:col-span-1"
          />
          <SensorMq7Card
            :co-ppm="telemetry.co_ppm"
            :raw-adc="telemetry.raw_adc7"
            class="md:col-span-1"
          />
          <SensorDht11Card
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
            class="md:col-span-1"
          />
          <SensorMpu6050Card
            :mpu-connected="telemetry.mpu_connected"
            :eye-x="telemetry.eye_x"
            :eye-y="telemetry.eye_y"
            class="md:col-span-1 lg:col-span-2"
          />
          <SystemEsp32TelemetryCard
            :uptime-s="telemetry.uptime_s"
            :free-heap="telemetry.free_heap"
            :offline-pending="telemetry.offline_pending"
            :device-emotion="telemetry.device_emotion"
            :view-mode="telemetry.view_mode"
            class="md:col-span-2 lg:col-span-1"
          />
        </div>

        <!-- Vistas Individuales Detalladas -->
        <div v-else class="max-w-2xl mx-auto py-2">
          <SensorMq135Card
            v-if="activeTab === 'MQ135'"
            :ppm="telemetry.ppm"
            :raw-adc="telemetry.raw_adc"
            :delta-ppm="telemetry.delta_ppm_1m"
          />
          <SensorMq7Card
            v-else-if="activeTab === 'MQ7'"
            :co-ppm="telemetry.co_ppm"
            :raw-adc="telemetry.raw_adc7"
          />
          <SensorDht11Card
            v-else-if="activeTab === 'DHT11'"
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
          />
          <SensorMpu6050Card
            v-else-if="activeTab === 'MPU6050'"
            :mpu-connected="telemetry.mpu_connected"
            :eye-x="telemetry.eye_x"
            :eye-y="telemetry.eye_y"
          />
          <SystemEsp32TelemetryCard
            v-else-if="activeTab === 'SYSTEM'"
            :uptime-s="telemetry.uptime_s"
            :free-heap="telemetry.free_heap"
            :offline-pending="telemetry.offline_pending"
            :device-emotion="telemetry.device_emotion"
            :view-mode="telemetry.view_mode"
          />
        </div>
      </div>

      <!-- Pie de Estado e Información de Calibración -->
      <footer class="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-2 border-t border-[#854d0e]/40 text-[8.5px] sm:text-[9px] font-mono text-stone-400 shrink-0">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Frecuencia de Muestreo: 1 Hz (1 muestra / seg)</span>
        </div>
        <div>
          Dispositivo: <span class="text-amber-300 font-bold">{{ telemetry.device_id || 'air-guardian-01' }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>
