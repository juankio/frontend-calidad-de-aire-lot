<script setup lang="ts">
import { ref } from 'vue'
import { Eye } from 'lucide-vue-next'
import { useAirGuardian, type SessionData } from '~/composables/useAirGuardian'

import CyberCommandHeader from '~/components/mecha/CyberCommandHeader.vue'
import PredictionBanner from '~/components/PredictionBanner.vue'

import SensorMq135Card from '~/components/madlab/sensors/SensorMq135Card.vue'
import SensorMq7Card from '~/components/madlab/sensors/SensorMq7Card.vue'
import SensorDht11Card from '~/components/madlab/sensors/SensorDht11Card.vue'

import MascotChamber from '~/components/madlab/MascotChamber.vue'
import TimeSeriesChart from '~/components/TimeSeriesChart.vue'

import SensorMpu6050Card from '~/components/madlab/sensors/SensorMpu6050Card.vue'
import SystemEsp32TelemetryCard from '~/components/madlab/sensors/SystemEsp32TelemetryCard.vue'
import LocationsMapBoard from '~/components/madlab/LocationsMapBoard.vue'

import EditLocationModal from '~/components/madlab/EditLocationModal.vue'
import UsbWifiModal from '~/components/madlab/UsbWifiModal.vue'
import RealtimeSensorsModal from '~/components/madlab/RealtimeSensorsModal.vue'
import DataLakeModal from '~/components/madlab/DataLakeModal.vue'
import NewCampaignModal from '~/components/NewCampaignModal.vue'
import AcademicAuditoriumModal from '~/components/academic/AcademicAuditoriumModal.vue'
import MechaDigitalTwinModal from '~/components/mecha/MechaDigitalTwinModal.vue'

const isDigitalTwinModalOpen = ref(false)
const isAcademicModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isUsbModalOpen = ref(false)
const isSensorsModalOpen = ref(false)
const isDataLakeModalOpen = ref(false)
const editingSession = ref<SessionData | null>(null)

const {
  telemetry, history, sessions, selectedSessionId,
  operationMode, hardwareStatus, effectiveRiskStatus,
  isModalOpen, viewMode,
  setOperationMode, toggleViewMode, selectSession, fetchSessions,
  deleteSession
} = useAirGuardian()

function openEditModal(session: SessionData) {
  editingSession.value = session
  isEditModalOpen.value = true
}

async function handleDeleteSession(session: SessionData) {
  const id = session.id || (session as any).session_id
  if (id) await deleteSession(id)
}
</script>

<template>
  <div class="h-screen max-h-screen overflow-hidden flex flex-col bg-[#030712] text-slate-100 font-sans p-2 sm:p-2.5 gap-2 select-none">
    <!-- Barra de Comando Aeroespacial Cyber-Mecha -->
    <CyberCommandHeader
      class="shrink-0"
      :operation-mode="operationMode"
      :hardware-status="hardwareStatus"
      @set-operation-mode="setOperationMode"
      @open-digital-twin="isDigitalTwinModalOpen = true"
      @open-academic="isAcademicModalOpen = true"
      @open-usb="isUsbModalOpen = true"
      @open-data-lake="isDataLakeModalOpen = true"
      @open-sensors="isSensorsModalOpen = true"
      @open-mark-location="isModalOpen = true"
    />

    <!-- Alerta Temprana Predictiva Compacta -->
    <PredictionBanner
      :risk-status="effectiveRiskStatus"
      :predicted-ppm15m="telemetry.predicted_ppm_15m"
      :delta-ppm1m="telemetry.delta_ppm_1m"
      theme="graphite"
      class="shrink-0"
    />

    <!-- Matriz Táctica Principal: Tri-Panel Grid 12 Columnas -->
    <main class="flex-1 min-h-0 w-full max-w-[1850px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch overflow-hidden">
      <!-- PANEL IZQUIERDO (lg:col-span-3): Sensores Químicos & Clima -->
      <section class="lg:col-span-3 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <SensorMq135Card
          class="flex-1 min-h-0"
          :ppm="telemetry.ppm"
          :raw-adc="telemetry.raw_adc"
          :delta-ppm="telemetry.delta_ppm_1m"
        />
        <SensorMq7Card
          class="flex-1 min-h-0"
          :co-ppm="telemetry.co_ppm"
          :raw-adc="telemetry.raw_adc7"
        />
        <SensorDht11Card
          class="flex-1 min-h-0"
          :temperature="telemetry.temperature"
          :humidity="telemetry.humidity"
        />
      </section>

      <!-- PANEL CENTRAL (lg:col-span-5): Núcleo Operativo Centinela & Gráfica Predictiva -->
      <section class="lg:col-span-5 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <!-- Visor Hexagonal Mecha de la Mascota Centinela -->
        <div class="flex-1 min-h-0 relative bg-slate-900/70 border border-cyan-500/25 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden">
          <MascotChamber
            :ppm="telemetry.ppm"
            :co-ppm="telemetry.co_ppm"
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
            :risk-status="effectiveRiskStatus"
            :view-mode="viewMode"
            :pitch="telemetry.pitch"
            :roll="telemetry.roll"
            :ax="telemetry.ax"
            :ay="telemetry.ay"
            :az="telemetry.az"
          />
          <div class="w-full flex justify-center mt-1 shrink-0">
            <button
              type="button"
              @click="toggleViewMode"
              class="min-h-[30px] px-3 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-300 hover:bg-slate-900 text-[10px] font-mono font-bold text-cyan-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 w-full max-w-[240px]"
            >
              <Eye class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span class="truncate">MODO: {{ viewMode === 'FACE' ? 'CENTINELA EXPRESIVO' : (viewMode === 'HUD' ? 'TACÓMETRO HUD' : 'GEMELO 3D') }}</span>
            </button>
          </div>
        </div>

        <!-- Serie Temporal Chart.js en Vivo -->
        <TimeSeriesChart
          class="flex-1 min-h-0"
          :history="history"
          :current-ppm="telemetry.ppm"
          :delta-ppm="telemetry.delta_ppm_1m"
          :predicted-ppm="telemetry.predicted_ppm_15m"
          theme="graphite"
        />
      </section>

      <!-- PANEL DERECHO (lg:col-span-4): Cinética, Hardware & Geolocalización -->
      <section class="lg:col-span-4 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <SensorMpu6050Card
          class="flex-1 min-h-0"
          :mpu-connected="telemetry.mpu_connected"
          :eye-x="telemetry.eye_x"
          :eye-y="telemetry.eye_y"
        />
        <SystemEsp32TelemetryCard
          class="flex-1 min-h-0"
          :uptime-s="telemetry.uptime_s"
          :free-heap="telemetry.free_heap"
          :offline-pending="telemetry.offline_pending"
          :device-emotion="telemetry.device_emotion"
          :view-mode="viewMode"
        />
        <LocationsMapBoard
          class="flex-1 min-h-0"
          :sessions="sessions"
          :selected-session-id="selectedSessionId"
          @select-session="selectSession"
          @open-create-modal="isModalOpen = true"
          @edit-session="openEditModal"
          @delete-session="handleDeleteSession"
        />
      </section>
    </main>

    <!-- Modales Tácticos de Comando -->
    <MechaDigitalTwinModal
      v-if="isDigitalTwinModalOpen"
      :is-open="isDigitalTwinModalOpen"
      :ppm="telemetry.ppm"
      :risk-status="effectiveRiskStatus"
      :pitch="telemetry.pitch"
      :roll="telemetry.roll"
      :ax="telemetry.ax"
      :ay="telemetry.ay"
      :az="telemetry.az"
      :temperature="telemetry.temperature"
      :humidity="telemetry.humidity"
      @close="isDigitalTwinModalOpen = false"
    />
    <NewCampaignModal v-if="isModalOpen" :is-open="isModalOpen" @close="isModalOpen = false" @created="fetchSessions" />
    <EditLocationModal v-if="isEditModalOpen" :is-open="isEditModalOpen" :session="editingSession" @close="isEditModalOpen = false" @saved="() => { isEditModalOpen = false; fetchSessions(); }" />
    <AcademicAuditoriumModal v-if="isAcademicModalOpen" :is-open="isAcademicModalOpen" :current-sensor-ppm="telemetry.ppm" @close="isAcademicModalOpen = false" />
    <UsbWifiModal v-if="isUsbModalOpen" :is-open="isUsbModalOpen" @close="isUsbModalOpen = false" />
    <RealtimeSensorsModal v-if="isSensorsModalOpen" :is-open="isSensorsModalOpen" :telemetry="telemetry" @close="isSensorsModalOpen = false" />
    <DataLakeModal v-if="isDataLakeModalOpen" :is-open="isDataLakeModalOpen" :sessions="sessions" :telemetry="telemetry" @close="isDataLakeModalOpen = false" />
  </div>
</template>
