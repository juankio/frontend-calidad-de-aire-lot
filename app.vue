<script setup lang="ts">
import { computed } from 'vue'
import { Plus, FlaskConical, Eye } from 'lucide-vue-next'
import { useAirGuardian } from '~/composables/useAirGuardian'
import TeslaAntenna from '~/components/madlab/TeslaAntenna.vue'
import MascotChamber from '~/components/madlab/MascotChamber.vue'
import AlchemyFlask from '~/components/madlab/AlchemyFlask.vue'
import AnalogPressureGauge from '~/components/madlab/AnalogPressureGauge.vue'
import FrankensteinSwitch from '~/components/madlab/FrankensteinSwitch.vue'
import CrtOscilloscope from '~/components/madlab/CrtOscilloscope.vue'
import AlchemyMlBoard from '~/components/madlab/AlchemyMlBoard.vue'
import GpsRadarMap from '~/components/madlab/GpsRadarMap.vue'
import LabScrew from '~/components/madlab/LabScrew.vue'
import NewCampaignModal from '~/components/NewCampaignModal.vue'

const {
  telemetry, history, sessions, selectedSessionId,
  isSimulatorRunning, hardwareStatus, effectiveRiskStatus,
  lastPacketAgeSec, isModalOpen, viewMode,
  toggleSimulator, toggleViewMode, selectSession, fetchSessions
} = useAirGuardian()

const headerStatusBadge = computed(() => {
  if (hardwareStatus.value === 'ONLINE') {
    return { label: '🟢 ESP32 FÍSICO ONLINE (BATERÍA OK)', dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse', text: 'text-emerald-400' }
  }
  if (hardwareStatus.value === 'SIMULATED') {
    return { label: '⚡ MODO SIMULADOR SINTÉTICO (PRUEBAS)', dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse', text: 'text-amber-400' }
  }
  return { label: '🔴 ESP32 DESCONECTADO (ESPERANDO SEÑAL)', dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', text: 'text-rose-400' }
})
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-[#07090e] text-slate-100 font-sans p-3 sm:p-4 gap-3 select-none">
    <!-- Header de Latón / Cobre con Tipografía de Científico Loco -->
    <header class="relative shrink-0 rounded-2xl bg-gradient-to-r from-[#1c150c] via-[#2a1d10] to-[#1c150c] border-2 border-[#854d0e]/80 p-2.5 sm:px-4 sm:py-2 shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
      <LabScrew class="absolute top-1.5 left-2" :rotation="24" />
      <LabScrew class="absolute top-1.5 right-2" :rotation="-38" />
      <LabScrew class="absolute bottom-1.5 left-2" :rotation="72" />
      <LabScrew class="absolute bottom-1.5 right-2" :rotation="-15" />

      <div class="flex items-center justify-between gap-2 max-w-full">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#78350f] to-[#fbbf24] p-0.5 shadow flex items-center justify-center">
            <div class="w-full h-full bg-[#0a0705] rounded-[6px] flex items-center justify-center text-[#fbbf24]">
              <FlaskConical class="w-4 h-4 text-[#fbbf24]" />
            </div>
          </div>
          <div>
            <h1 class="flex items-center gap-2">
              <span class="font-mad text-lg sm:text-xl md:text-2xl text-[#fbbf24] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">DR. AIR GUARDIAN</span>
              <span class="text-[#f59e0b] hidden sm:inline">•</span>
              <span class="text-amber-200/90 text-xs sm:text-sm font-journal font-bold tracking-wide hidden sm:inline">Laboratorio de Monitoreo de Aire</span>
            </h1>
            <div class="text-[9px] font-journal text-amber-400/90 tracking-wide sm:hidden">Laboratorio de Monitoreo de Aire</div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c0906] border border-[#854d0e]/60 font-mono text-[9px] sm:text-[10px]">
            <span class="w-2 h-2 rounded-full" :class="headerStatusBadge.dot" />
            <span class="font-bold" :class="headerStatusBadge.text">{{ headerStatusBadge.label }}</span>
          </div>

          <button
            @click="isModalOpen = true"
            class="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-r from-[#92400e] via-[#b45309] to-[#78350f] hover:from-[#b45309] hover:to-[#92400e] border border-[#fbbf24]/70 text-[#fef3c7] text-xs font-journal font-bold transition flex items-center gap-1.5 shadow-[0_4px_12px_rgba(180,83,9,0.3)] cursor-pointer active:scale-95"
          >
            <Plus class="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>📍 Marcar Lugar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- App Shell Zero Scroll: Mesa Superior + Banco Inferior -->
    <main class="flex-1 flex flex-col gap-3 w-full max-w-[1750px] mx-auto min-h-0 shrink-0 pb-10">
      <!-- 1. Mesa Superior de Instrumentos -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 shrink-0 items-center">
        <div class="md:col-span-1 lg:col-span-3 flex justify-center">
          <TeslaAntenna :status="hardwareStatus" :rssi="-64" :battery="88" :last-packet-sec="lastPacketAgeSec" />
        </div>

        <div class="md:col-span-1 lg:col-span-4 flex flex-col items-center justify-center">
          <MascotChamber
            :ppm="telemetry.ppm"
            :co-ppm="telemetry.co_ppm"
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
            :risk-status="effectiveRiskStatus"
            :view-mode="viewMode"
          />
          <button
            @click="toggleViewMode"
            class="mt-0.5 px-3 py-1 rounded-full bg-[#1c150c] border border-[#854d0e] text-[9.5px] font-journal font-bold text-[#fbbf24] hover:border-[#fbbf24] hover:bg-[#2b1d10] transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
          >
            <Eye class="w-3 h-3 text-amber-400" />
            <span>Cambiar Vista: {{ viewMode === 'FACE' ? 'Mascota Expresiva' : 'Manómetro Digital' }}</span>
          </button>
        </div>

        <div class="md:col-span-2 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <AlchemyFlask :ppm="telemetry.ppm" :temperature="telemetry.temperature" label="Matraz de Aire" />
          <AnalogPressureGauge :value="telemetry.ppm" :min="300" :max="2000" title="Manómetro CO2" unit="PPM" />
          <FrankensteinSwitch :model-value="isSimulatorRunning" :hardware-status="hardwareStatus" @update:model-value="(val) => { isSimulatorRunning = val; toggleSimulator(val) }" label="Palanca de Pruebas" />
        </div>
      </section>

      <!-- 2. Banco Inferior de Instrumentación -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 items-stretch min-h-[400px]">
        <CrtOscilloscope
          :history="history"
          :risk-status="effectiveRiskStatus"
          :predicted-ppm15m="telemetry.predicted_ppm_15m"
          :delta-ppm1m="telemetry.delta_ppm_1m"
          
        />
        <AlchemyMlBoard :sessions="sessions" :telemetry="telemetry"  />
        <GpsRadarMap
          :sessions="sessions"
          :selected-session-id="selectedSessionId"
          @select-session="selectSession"
          @open-create-modal="isModalOpen = true"
          
        />
      </section>
    </main>

    <!-- Modal de Guardar Lugar de Medición -->
    <NewCampaignModal :is-open="isModalOpen" @close="isModalOpen = false" @created="fetchSessions" />
  </div>
</template>