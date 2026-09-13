<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Activity, X, LayoutGrid, Wind, Flame, Thermometer, Compass, Cpu } from 'lucide-vue-next'
import anime from 'animejs'
import LabScrew from './LabScrew.vue'
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
    class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xs pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]"
  >
    <div
      ref="modalCardRef"
      class="bg-gradient-to-b from-[#1c150c] via-[#150f08] to-[#0c0906] border-2 border-[#854d0e] rounded-2xl w-full max-w-5xl max-h-[92dvh] overflow-y-auto overscroll-contain p-3.5 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative select-none flex flex-col gap-3"
    >
      <LabScrew class="absolute top-2 left-2" :rotation="22" /><LabScrew class="absolute top-2 right-2" :rotation="-40" />
      <LabScrew class="absolute bottom-2 left-2" :rotation="65" /><LabScrew class="absolute bottom-2 right-2" :rotation="-18" />

      <!-- Cabecera Steampunk Mad Lab -->
      <div class="flex items-center justify-between border-b border-[#854d0e]/60 pb-2.5 px-1 sm:px-2">
        <div class="flex items-center gap-2 sm:gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#27150c] border border-[#854d0e] flex items-center justify-center text-[#fbbf24] shadow-inner shrink-0">
            <Activity class="w-4 h-4 text-[#fbbf24] animate-pulse" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-mad text-[#fbbf24] tracking-wide flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span>BANCO DE SENSORES EN TIEMPO REAL</span>
            </h3>
            <p class="text-[9px] sm:text-[9.5px] font-mono text-stone-400">
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
          class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#2a1708] border border-[#854d0e] text-amber-300 hover:text-amber-100 hover:bg-[#3d210b] cursor-pointer transition active:scale-95 shadow shrink-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Barra de Filtros / Pestañas de Instrumentación -->
      <nav aria-label="Filtro de sensores" class="flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-[#0e0a06] border border-[#854d0e]/50 shrink-0">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          @click="activeTab = t.id"
          class="min-h-[36px] sm:min-h-0 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-journal font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          :class="activeTab === t.id ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-black shadow-[0_0_8px_#f59e0b]' : 'text-stone-400 hover:text-amber-200 hover:bg-[#181109]'"
        >
          <component :is="t.icon" class="w-3.5 h-3.5" />
          <span>{{ t.label }}</span>
        </button>
      </nav>

      <!-- Contenedor Bento Grid & Pestañas -->
      <div class="flex-1 min-h-0">
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
      <footer class="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-2 border-t border-[#854d0e]/40 text-[8.5px] sm:text-[9px] font-mono text-stone-400">
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
