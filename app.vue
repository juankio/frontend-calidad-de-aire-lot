<script setup lang="ts">
import { ref } from 'vue'
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
  wsConnected, usbConnected, operationMode, hardwareStatus, effectiveRiskStatus,
  lastPacketAgeSec, isModalOpen, viewMode,
  setOperationMode, toggleViewMode, selectSession, fetchSessions,
  deleteSession, setManualGyro, triggerGyroShake
} = useAirGuardian()

function openEditModal(session: SessionData) {
  editingSession.value = session
  isEditModalOpen.value = true
}

async function handleDeleteSession(session: SessionData & { session_id?: string | number }) {
  const id = session.id || session.session_id
  if (id) await deleteSession(id)
}
</script>

<template>
  <div class="h-screen max-h-screen overflow-hidden flex flex-col bg-[#030712] text-slate-100 font-sans p-2 sm:p-2.5 gap-2 select-none">
    <CyberCommandHeader
      class="shrink-0"
      :operation-mode="operationMode"
      :hardware-status="hardwareStatus"
      :ws-connected="wsConnected"
      :usb-connected="usbConnected"
      :last-packet-age-sec="lastPacketAgeSec"
      @set-operation-mode="setOperationMode"
      @open-digital-twin="isDigitalTwinModalOpen = true"
      @open-academic="isAcademicModalOpen = true"
      @open-usb="isUsbModalOpen = true"
      @open-data-lake="isDataLakeModalOpen = true"
      @open-sensors="isSensorsModalOpen = true"
      @open-mark-location="isModalOpen = true"
    />

    <PredictionBanner
      :risk-status="effectiveRiskStatus"
      :predicted-ppm15m="telemetry.predicted_ppm_15m"
      :delta-ppm1m="telemetry.delta_ppm_1m"
      theme="graphite"
      class="shrink-0"
    />

    <main class="flex-1 min-h-0 w-full max-w-[1850px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch overflow-hidden">
      <section class="lg:col-span-3 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <SensorMq135Card class="flex-1 min-h-0" :ppm="telemetry.ppm" :raw-adc="telemetry.raw_adc" :delta-ppm="telemetry.delta_ppm_1m" />
        <SensorMq7Card class="flex-1 min-h-0" :co-ppm="telemetry.co_ppm" :raw-adc="telemetry.raw_adc7" />
        <SensorDht11Card class="flex-1 min-h-0" :temperature="telemetry.temperature" :humidity="telemetry.humidity" />
      </section>

      <section class="lg:col-span-5 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <div class="flex-[1.25] min-h-0 relative bg-slate-900/70 border border-cyan-500/25 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden">
          <MascotChamber
            :ppm="telemetry.ppm"
            :co-ppm="telemetry.co_ppm"
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
            :risk-status="effectiveRiskStatus"
            :device-emotion="telemetry.device_emotion"
            :view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'"
            :pitch="telemetry.pitch"
            :roll="telemetry.roll"
            :eye-x="telemetry.eye_x"
            :eye-y="telemetry.eye_y"
            :is-shaking="telemetry.is_shaking"
            :mpu-connected="telemetry.mpu_connected"
            :ax="telemetry.ax"
            :ay="telemetry.ay"
            :az="telemetry.az"
            :operation-mode="operationMode"
            :hardware-status="hardwareStatus"
            :ws-connected="wsConnected"
            :usb-connected="usbConnected"
            :last-packet-age-sec="lastPacketAgeSec"
            @toggle-screen-mode="toggleViewMode"
            @shake-device="triggerGyroShake"
            @open-3d-modal="isDigitalTwinModalOpen = true"
            @switch-to-local="setOperationMode('LOCAL')"
          />
        </div>

        <TimeSeriesChart
          class="flex-1 min-h-0"
          :history="history"
          :current-ppm="telemetry.ppm"
          :delta-ppm="telemetry.delta_ppm_1m"
          :predicted-ppm="telemetry.predicted_ppm_15m"
          theme="graphite"
        />
      </section>

      <section class="lg:col-span-4 h-full min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        <SensorMpu6050Card
          class="flex-1 min-h-0"
          :mpu-connected="telemetry.mpu_connected"
          :eye-x="telemetry.eye_x"
          :eye-y="telemetry.eye_y"
          :pitch="telemetry.pitch"
          :roll="telemetry.roll"
          :is-shaking="telemetry.is_shaking"
          :device-emotion="telemetry.device_emotion"
          :is-hardware-online="operationMode === 'LOCAL' || hardwareStatus === 'ONLINE'"
          @update-gyro="(x, y) => setManualGyro(x, y)"
          @shake="triggerGyroShake"
        />
        <SystemEsp32TelemetryCard
          class="flex-1 min-h-0"
          :uptime-s="telemetry.uptime_s"
          :free-heap="telemetry.free_heap"
          :offline-pending="telemetry.offline_pending"
          :device-emotion="telemetry.device_emotion"
          :view-mode="viewMode"
          :is-hardware-online="operationMode === 'LOCAL' || hardwareStatus === 'ONLINE'"
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

    <MechaDigitalTwinModal
      v-if="isDigitalTwinModalOpen"
      :is-open="isDigitalTwinModalOpen"
      :ppm="telemetry.ppm"
      :risk-status="effectiveRiskStatus"
      :device-emotion="telemetry.device_emotion"
      :screen-view-mode="viewMode === 'HUD' ? 'HUD' : 'FACE'"
      :pitch="telemetry.pitch"
      :roll="telemetry.roll"
      :eye-x="telemetry.eye_x"
      :eye-y="telemetry.eye_y"
      :is-shaking="telemetry.is_shaking"
      :ax="telemetry.ax"
      :ay="telemetry.ay"
      :az="telemetry.az"
      :temperature="telemetry.temperature"
      :humidity="telemetry.humidity"
      @close="isDigitalTwinModalOpen = false"
    />
    <NewCampaignModal v-if="isModalOpen" :is-open="isModalOpen" @created="fetchSessions" @close="isModalOpen = false" />
    <EditLocationModal v-if="isEditModalOpen" :is-open="isEditModalOpen" :session="editingSession" @close="isEditModalOpen = false" @saved="() => { isEditModalOpen = false; fetchSessions(); }" />
    <AcademicAuditoriumModal v-if="isAcademicModalOpen" :is-open="isAcademicModalOpen" :current-sensor-ppm="telemetry.ppm" @close="isAcademicModalOpen = false" />
    <UsbWifiModal :is-open="isUsbModalOpen" @close="isUsbModalOpen = false" />
    <RealtimeSensorsModal v-if="isSensorsModalOpen" :is-open="isSensorsModalOpen" :telemetry="telemetry" @close="isSensorsModalOpen = false" />
    <DataLakeModal v-if="isDataLakeModalOpen" :is-open="isDataLakeModalOpen" :sessions="sessions" :telemetry="telemetry" @close="isDataLakeModalOpen = false" />
  </div>
</template>
