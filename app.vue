<script setup lang="ts">
import { ref, computed } from 'vue'
import { FlaskConical, Eye, GraduationCap, Radio, MapPin, Usb, Activity, Cpu } from 'lucide-vue-next'
import { useAirGuardian, type SessionData } from '~/composables/useAirGuardian'
import TeslaAntenna from '~/components/madlab/TeslaAntenna.vue'
import MascotChamber from '~/components/madlab/MascotChamber.vue'
import AlchemyFlask from '~/components/madlab/AlchemyFlask.vue'
import AnalogPressureGauge from '~/components/madlab/AnalogPressureGauge.vue'
import FrankensteinSwitch from '~/components/madlab/FrankensteinSwitch.vue'
import CrtOscilloscope from '~/components/madlab/CrtOscilloscope.vue'
import AlchemyMlBoard from '~/components/madlab/AlchemyMlBoard.vue'
import LocationsMapBoard from '~/components/madlab/LocationsMapBoard.vue'
import EditLocationModal from '~/components/madlab/EditLocationModal.vue'
import UsbWifiModal from '~/components/madlab/UsbWifiModal.vue'
import RealtimeSensorsModal from '~/components/madlab/RealtimeSensorsModal.vue'
import LabScrew from '~/components/madlab/LabScrew.vue'
import NewCampaignModal from '~/components/NewCampaignModal.vue'
import AcademicAuditoriumModal from '~/components/academic/AcademicAuditoriumModal.vue'

const isAcademicModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isUsbModalOpen = ref(false)
const isSensorsModalOpen = ref(false)
const editingSession = ref<SessionData | null>(null)

const {
  telemetry, history, sessions, selectedSessionId,
  operationMode, isSimulatorRunning, hardwareStatus, effectiveRiskStatus,
  lastPacketAgeSec, isModalOpen, viewMode,
  setOperationMode, toggleViewMode, selectSession, fetchSessions,
  updateSession, deleteSession
} = useAirGuardian()

function openEditModal(session: SessionData) {
  editingSession.value = session
  isEditModalOpen.value = true
}

async function handleDeleteSession(session: SessionData) {
  const id = session.id || (session as any).session_id
  if (id) await deleteSession(id)
}

const headerStatusBadge = computed(() => {
  if (operationMode.value === 'LOCAL') return { label: '🧪 MODO LOCAL (DATOS SIMULADOS)', dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse', text: 'text-amber-400' }
  if (hardwareStatus.value === 'ONLINE') return { label: '🟢 ESP32 EN LÍNEA (TELEMETRÍA OK)', dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse', text: 'text-emerald-400' }
  return { label: '🔴 ESP32 DESCONECTADO (SIN SEÑAL)', dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', text: 'text-rose-400' }
})
</script>

<template>
  <div class="min-h-screen lg:h-screen flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#07090e] text-slate-100 font-sans p-2.5 sm:p-4 gap-3 select-none">
    <!-- Header de Latón / Cobre con Tipografía de Científico Loco -->
    <header class="relative shrink-0 rounded-2xl bg-gradient-to-r from-[#1c150c] via-[#2a1d10] to-[#1c150c] border-2 border-[#854d0e]/80 p-2.5 sm:px-4 sm:py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
      <LabScrew class="absolute top-1.5 left-2" :rotation="24" /><LabScrew class="absolute top-1.5 right-2" :rotation="-38" />
      <LabScrew class="absolute bottom-1.5 left-2" :rotation="72" /><LabScrew class="absolute bottom-1.5 right-2" :rotation="-15" />

      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-2.5 max-w-full">
        <!-- Marca e Identidad del Laboratorio -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#78350f] to-[#fbbf24] p-0.5 shadow flex items-center justify-center shrink-0">
              <div class="w-full h-full bg-[#0a0705] rounded-[6px] flex items-center justify-center text-[#fbbf24]">
                <FlaskConical class="w-4 h-4 text-[#fbbf24]" />
              </div>
            </div>
            <div>
              <h1 class="flex items-center gap-2">
                <span class="font-mad text-base sm:text-xl md:text-2xl text-[#fbbf24] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">DR. AIR GUARDIAN</span>
                <span class="text-[#f59e0b] hidden sm:inline">•</span>
                <span class="text-amber-200/90 text-xs sm:text-sm font-journal font-bold tracking-wide hidden sm:inline">Laboratorio de Monitoreo de Aire</span>
              </h1>
              <div class="text-[8.5px] font-journal text-amber-400/90 tracking-wide sm:hidden">Laboratorio de Monitoreo de Aire</div>
            </div>
          </div>

          <!-- Badge de Estado Compacto Móvil / Tablet (<1024px) -->
          <div class="flex lg:hidden items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0c0906] border border-[#854d0e]/60 font-mono text-[8px] shrink-0">
            <span class="w-1.5 h-1.5 rounded-full" :class="headerStatusBadge.dot" />
            <span class="font-bold truncate max-w-[120px]" :class="headerStatusBadge.text">
              {{ operationMode === 'LOCAL' ? 'MODO LOCAL' : hardwareStatus === 'ONLINE' ? 'ESP32 ON' : 'ESP32 OFF' }}
            </span>
          </div>
        </div>

        <!-- Consola de Control de Expedición y Modos -->
        <div class="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-1.5 lg:pt-0 border-t border-[#854d0e]/30 lg:border-t-0">
          <!-- Selector Dual: Conmutador Galvánico (Modo Local vs En Vivo ESP32 1-a-1) -->
          <div class="flex items-center bg-gradient-to-r from-[#181109] to-[#0d0905] border-2 border-[#854d0e] rounded-xl p-0.5 sm:p-1 font-mono text-[9px] sm:text-[9.5px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] shrink-0">
            <button
              type="button"
              @click="setOperationMode('LOCAL')"
              class="min-h-[36px] sm:min-h-0 px-2 sm:px-2.5 py-1 rounded-lg font-bold font-journal transition flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95"
              :class="operationMode === 'LOCAL' ? 'bg-[#d97706] bg-gradient-to-r from-[#d97706] to-[#b45309] text-black shadow-[0_0_8px_#f59e0b]' : 'text-stone-400 hover:text-amber-200'"
              title="Probar dashboard sin hardware (datos simulados y quemados)"
            >
              <FlaskConical class="w-3.5 h-3.5" />
              <span>Modo Local</span>
            </button>
            <button
              type="button"
              @click="setOperationMode('LIVE')"
              class="min-h-[36px] sm:min-h-0 px-2 sm:px-2.5 py-1 rounded-lg font-bold font-journal transition flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95"
              :class="operationMode === 'LIVE' ? 'bg-emerald-600 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-[0_0_8px_#10b981]' : 'text-stone-400 hover:text-emerald-200'"
              title="Vincular telemetría en tiempo real 1-a-1 con el ESP32"
            >
              <Radio class="w-3.5 h-3.5" />
              <span>En Vivo</span>
            </button>
          </div>

          <!-- Badge Desktop de Estado de Telemetría -->
          <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c0906] border border-[#854d0e]/60 font-mono text-[9.5px]">
            <span class="w-2 h-2 rounded-full" :class="headerStatusBadge.dot" />
            <span class="font-bold" :class="headerStatusBadge.text">{{ headerStatusBadge.label }}</span>
          </div>

          <!-- Grupo de Acciones Rápidas (Cátedra EDO, USB ESP32, Marcar Lugar) -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <!-- Botón de Exposición Universitaria: EDO & Análisis Numérico -->
            <button
              type="button"
              @click="isAcademicModalOpen = true"
              class="min-h-[36px] sm:min-h-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#4c1d95] to-[#2e1065] hover:from-[#4c1d95] hover:to-[#2e1065] border-2 border-[#fbbf24]/80 text-[#fef3c7] text-[11px] sm:text-xs font-journal font-bold transition flex items-center gap-1.5 shadow-[0_4px_14px_rgba(76,29,149,0.5),0_0_10px_rgba(251,191,36,0.3)] cursor-pointer active:scale-95 shrink-0"
              title="Auditorio Universitario: Deducción de EDO y Métodos Numéricos (Euler vs RK4)"
            >
              <GraduationCap class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fbbf24] animate-bounce shrink-0" />
              <span class="tracking-wide">
                <span class="sm:hidden">Cátedra EDO</span>
                <span class="hidden sm:inline">Cátedra EDO & Numérico</span>
              </span>
            </button>

            <!-- Botón Enlace USB ESP32 (Web Serial Mad Lab) -->
            <button
              type="button"
              @click="isUsbModalOpen = true"
              class="min-h-[36px] sm:min-h-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#2a1708] via-[#3b200c] to-[#2a1708] hover:from-[#3b200c] hover:to-[#2a1708] border border-[#d97706]/80 hover:border-[#fbbf24] text-amber-200 text-[11px] sm:text-xs font-journal font-bold transition flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] cursor-pointer active:scale-95 shrink-0"
              title="Conectar y aprovisionar ESP32 por cable USB con Web Serial"
            >
              <Usb class="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
              <span>USB ESP32</span>
            </button>

            <!-- Botón Sensores en Vivo (Telemetría de Sensores Individuales) -->
            <button
              type="button"
              @click="isSensorsModalOpen = true"
              class="min-h-[36px] sm:min-h-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554] hover:from-[#1e3a8a] hover:to-[#172554] border border-[#38bdf8]/80 hover:border-[#7dd3fc] text-[#e0f2fe] text-[11px] sm:text-xs font-journal font-bold transition flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_10px_rgba(56,189,248,0.3)] cursor-pointer active:scale-95 shrink-0"
              title="Visualización en tiempo real de todos los sensores individuales (MQ-135, MQ-7, DHT11, MPU-6050, ESP32)"
            >
              <Activity class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8] animate-pulse shrink-0" />
              <span class="tracking-wide">
                <span class="sm:hidden">Sensores</span>
                <span class="hidden sm:inline">🔬 Sensores en Vivo</span>
              </span>
            </button>

            <!-- Botón Marcar Lugar -->
            <button
              type="button"
              @click="isModalOpen = true"
              class="min-h-[36px] sm:min-h-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#92400e] via-[#b45309] to-[#78350f] hover:from-[#b45309] hover:to-[#92400e] border border-[#fbbf24]/70 text-[#fef3c7] text-[11px] sm:text-xs font-journal font-bold transition flex items-center gap-1.5 shadow-[0_4px_12px_rgba(180,83,9,0.3)] cursor-pointer active:scale-95 shrink-0"
            >
              <MapPin class="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
              <span>Marcar Lugar</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- App Shell Zero Scroll: Mesa Superior + Banco Inferior -->
    <main class="flex-1 flex flex-col gap-3 w-full max-w-[1750px] mx-auto min-h-0">
      <!-- 1. Mesa Superior de Instrumentos (Fluida y Orgánica) -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 shrink-0 items-center">
        <!-- Antena Tesla Receptora -->
        <div class="md:col-span-1 lg:col-span-3 flex justify-center w-full">
          <TeslaAntenna :status="hardwareStatus" :rssi="-64" :battery="88" :last-packet-sec="lastPacketAgeSec" class="w-full max-w-md md:max-w-none" />
        </div>

        <!-- Cápsula Central de la Mascota Centinela -->
        <div class="md:col-span-1 lg:col-span-4 flex flex-col items-center justify-center w-full">
          <MascotChamber
            :ppm="telemetry.ppm"
            :co-ppm="telemetry.co_ppm"
            :temperature="telemetry.temperature"
            :humidity="telemetry.humidity"
            :risk-status="effectiveRiskStatus"
            :view-mode="viewMode"
          />
          <div class="w-full flex justify-center mt-1">
            <button
              type="button"
              @click="toggleViewMode"
              class="min-h-[38px] px-4 py-1.5 rounded-full bg-[#1c150c] border border-[#854d0e] hover:border-[#fbbf24] hover:bg-[#2b1d10] text-[10px] font-journal font-bold text-[#fbbf24] transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 w-full max-w-[210px]"
            >
              <Eye class="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span class="truncate">Vista: {{ viewMode === 'FACE' ? 'Mascota Expresiva' : 'Manómetro Digital' }}</span>
            </button>
          </div>
        </div>

        <!-- Trío de Instrumentos Físicos (Matraz, Manómetro y Palanca) -->
        <div class="md:col-span-2 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-2 w-full">
          <AlchemyFlask :ppm="telemetry.ppm" :temperature="telemetry.temperature" label="Matraz de Aire" />
          <AnalogPressureGauge :value="telemetry.ppm" :min="300" :max="2000" title="Manómetro CO2" unit="PPM" />
          <FrankensteinSwitch
            :model-value="operationMode === 'LOCAL'"
            :hardware-status="hardwareStatus"
            @update:model-value="(val) => setOperationMode(val ? 'LOCAL' : 'LIVE')"
            label="Palanca Modo Local"
          />
        </div>
      </section>

      <!-- 2. Banco Inferior de Instrumentación (Apilado y Bento en Tablet / Mobile) -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[300px] lg:flex-1 lg:min-h-0 items-stretch">
        <CrtOscilloscope
          :history="history"
          :risk-status="effectiveRiskStatus"
          :predicted-ppm15m="telemetry.predicted_ppm_15m"
          :delta-ppm1m="telemetry.delta_ppm_1m"
        />
        <AlchemyMlBoard :sessions="sessions" :telemetry="telemetry" />
        <LocationsMapBoard
          class="md:col-span-2 lg:col-span-1"
          :sessions="sessions"
          :selected-session-id="selectedSessionId"
          @select-session="selectSession"
          @open-create-modal="isModalOpen = true"
          @edit-session="openEditModal"
          @delete-session="handleDeleteSession"
        />
      </section>
    </main>

    <!-- Modales del Laboratorio Steampunk -->
    <NewCampaignModal v-if="isModalOpen" :is-open="isModalOpen" @close="isModalOpen = false" @created="fetchSessions" />
    <EditLocationModal v-if="isEditModalOpen" :is-open="isEditModalOpen" :session="editingSession" @close="isEditModalOpen = false" @saved="() => { isEditModalOpen = false; fetchSessions(); }" />
    <AcademicAuditoriumModal v-if="isAcademicModalOpen" :is-open="isAcademicModalOpen" :current-sensor-ppm="telemetry.ppm" @close="isAcademicModalOpen = false" />
    <UsbWifiModal v-if="isUsbModalOpen" :is-open="isUsbModalOpen" @close="isUsbModalOpen = false" />
    <RealtimeSensorsModal v-if="isSensorsModalOpen" :is-open="isSensorsModalOpen" :telemetry="telemetry" @close="isSensorsModalOpen = false" />
  </div>
</template>