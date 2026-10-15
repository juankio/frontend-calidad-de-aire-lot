<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Usb, Zap, X, Eye, EyeOff, HelpCircle, Wifi, Server, Check, AlertTriangle, Disc, Info } from 'lucide-vue-next'
import anime from 'animejs'
import AmberTerminal from './AmberTerminal.vue'
import { useWebSerial } from '~/composables/useWebSerial'
import { useAirGuardian } from '~/composables/useAirGuardian'

const DEFAULT_SERVER_URL = 'https://servidor-taller.tailf19567.ts.net:10000'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'status', payload: any): void }>()

const { isSupported, isConnected, isConnecting, logs, connect, disconnect, sendLine, clearLogs, onSerialLine } = useWebSerial()
const { ingestUsbSerialStatus, usbConnected } = useAirGuardian()

const form = reactive({
  ssid: '',
  pass: '',
  server: DEFAULT_SERVER_URL
})
const deviceStatus = ref<any>(null)
const showPassword = ref(false)
const isSending = ref(false)
const showHelp = ref(false)
const statusNote = ref('')
const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const transmitBtnRef = ref<HTMLElement | null>(null)

let statusPollTimer: ReturnType<typeof setInterval> | null = null
let unsubscribeSerialLine: (() => void) | null = null

const isReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

function startStatusPolling() {
  if (statusPollTimer) clearInterval(statusPollTimer)
  statusPollTimer = setInterval(() => {
    if (isConnected.value && !isSending.value) {
      sendLine(JSON.stringify({ cmd: 'GET_STATUS' }), true)
    }
  }, 400)
}

function stopStatusPolling() {
  if (statusPollTimer) {
    clearInterval(statusPollTimer)
    statusPollTimer = null
  }
}

watch(isConnected, (connected) => {
  usbConnected.value = connected
  if (connected) {
    startStatusPolling()
    sendLine(JSON.stringify({ cmd: 'GET_STATUS' }), true)
  } else {
    stopStatusPolling()
  }
}, { immediate: true })

onMounted(() => {
  unsubscribeSerialLine = onSerialLine((line) => {
    if (!line.startsWith('{')) return
    try {
      const parsed = JSON.parse(line)
      if (parsed && parsed.cmd === 'STATUS') {
        deviceStatus.value = parsed
        ingestUsbSerialStatus(parsed)
        emit('status', parsed)
      } else if (parsed && parsed.cmd === 'WIFI_ACK' && parsed.status === 'OK') {
        statusNote.value = parsed.message || 'Credenciales Wi-Fi guardadas en memoria NVS del ESP32.'
      }
    } catch {}
  })
})

onUnmounted(() => {
  if (unsubscribeSerialLine) {
    unsubscribeSerialLine()
    unsubscribeSerialLine = null
  }
})

watch(() => props.isOpen, async (open) => {
  if (open) {
    await nextTick()
    if (isReducedMotion() || !modalCardRef.value) return
    if (backdropRef.value) {
      anime.remove(backdropRef.value)
      anime({ targets: backdropRef.value, opacity: [0, 1], duration: 250, easing: 'easeOutQuad' })
    }
    anime.remove(modalCardRef.value)
    anime({ targets: modalCardRef.value, opacity: [0, 1], scale: [0.94, 1], translateY: [15, 0], duration: 350, easing: 'cubicBezier(0.16, 1, 0.3, 1)' })
  }
}, { immediate: true })

function handleCloseModal() {
  emit('close')
}

async function handleToggleConnect() {
  statusNote.value = ''
  if (isConnected.value) {
    stopStatusPolling()
    usbConnected.value = false
    await disconnect()
  } else {
    const ok = await connect(115200)
    if (!ok && isSupported.value) {
      statusNote.value = 'Apertura de puerto USB cancelada o no disponible.'
    } else if (ok) {
      usbConnected.value = true
      startStatusPolling()
      statusNote.value = 'ESP32 conectado por USB (400ms Live Stream activo). Seguirá enlazado en segundo plano al cerrar este modal.'
    }
  }
}

async function handleTransmit() {
  if (transmitBtnRef.value && !isReducedMotion()) {
    anime.remove(transmitBtnRef.value)
    anime({
      targets: transmitBtnRef.value,
      scale: [1, 0.94, 1.02, 1],
      filter: ['brightness(1)', 'brightness(1.4) drop-shadow(0 0 14px rgba(251,191,36,0.8))', 'brightness(1)'],
      duration: 400,
      easing: 'easeOutQuad'
    })
  }
  if (!isConnected.value) {
    statusNote.value = 'Conecta el ESP32 por USB antes de transmitir.'
    return
  }
  if (!form.ssid.trim()) {
    statusNote.value = 'El nombre de red (SSID) es requerido.'
    return
  }
  isSending.value = true
  statusNote.value = ''
  const payload = {
    cmd: 'SET_WIFI',
    ssid: form.ssid.trim(),
    pass: form.pass,
    server: form.server.trim() || DEFAULT_SERVER_URL
  }
  const ok = await sendLine(JSON.stringify(payload))
  isSending.value = false
  statusNote.value = ok ? '¡Trama transmitida! Observa la respuesta en el terminal.' : 'Fallo al transmitir por el canal serie.'
}
</script>

<template>
  <div v-if="isOpen" ref="backdropRef" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div ref="modalCardRef" class="bg-[#070b14]/95 border border-cyan-500/40 rounded-2xl w-full max-w-xl max-h-[90dvh] overflow-y-auto overscroll-contain p-3.5 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.15)] relative select-none space-y-3 font-mono">
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

      <!-- Cabecera Táctica -->
      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2 px-1 sm:px-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
            <Usb class="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-scifi font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>APROVISIONAMIENTO WI-FI POR USB</span>
            </h3>
            <p class="text-[8.5px] sm:text-[9px] font-mono text-slate-400">Web Serial Protocol @ 115200 Baudios</p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-1.5">
          <button type="button" @click="showHelp = !showHelp" class="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 text-[10px] transition flex items-center gap-1 cursor-pointer active:scale-95" title="Instrucciones de conexión">
            <HelpCircle class="w-3.5 h-3.5 text-cyan-400" /><span class="hidden sm:inline">Guía UX</span>
          </button>
          <button type="button" @click="handleCloseModal" aria-label="Cerrar modal" title="Cerrar modal" class="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-200 hover:bg-slate-900 cursor-pointer transition active:scale-90">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Alerta de Compatibilidad Web Serial -->
      <div v-if="!isSupported" class="p-2 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-[10px] font-mono flex items-start gap-2">
        <AlertTriangle class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>Web Serial API no detectada en este navegador. Utiliza Google Chrome, Microsoft Edge u Opera en PC o Mac con permisos USB.</span>
      </div>

      <!-- Panel Desplegable de Ayuda UX -->
      <div v-if="showHelp" class="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-300 text-[10.5px] font-sans space-y-1">
        <p class="text-cyan-300 font-mono font-bold text-[11px] flex items-center gap-1"><Disc class="w-3 h-3 text-cyan-400" /> Protocolo de Enlace Físico al Microcontrolador:</p>
        <ol class="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300 font-mono">
          <li>Conecta el ESP32 al PC con un <span class="text-cyan-300">cable USB de datos</span> (no solo de carga).</li>
          <li>Pulsa <span class="text-cyan-300 font-bold">"Conectar ESP32 (USB)"</span> y selecciona el puerto serie (CP2102/CH340).</li>
          <li><span class="text-cyan-300">Auto-reinicio:</span> El ESP32 se auto-reinicia por diseño al abrir el puerto serie (DTR/RTS).</li>
          <li>Digita tu SSID de 2.4 GHz, clave y servidor y pulsa <span class="text-cyan-300 font-bold">"Transmitir al ESP32"</span>.</li>
          <li>El enlace USB permanecerá activo en segundo plano al cerrar este modal.</li>
        </ol>
      </div>

      <!-- Formulario de Configuración de Red -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
        <div>
          <label class="block text-[10px] font-bold text-slate-300 mb-0.5 flex items-center gap-1"><Wifi class="w-3 h-3 text-cyan-400" /> Red Wi-Fi (SSID)</label>
          <input v-model="form.ssid" type="text" placeholder="Mi_Red_WiFi" class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-300 mb-0.5">Clave Wi-Fi</label>
          <div class="relative">
            <input v-model="form.pass" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 pr-10 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono" />
            <button type="button" @click="showPassword = !showPassword" aria-label="Mostrar u ocultar contraseña" class="absolute right-0 top-0 bottom-0 min-w-[40px] flex items-center justify-center text-slate-400 hover:text-cyan-300 cursor-pointer">
              <EyeOff v-if="showPassword" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-300 mb-0.5 flex items-center gap-1"><Server class="w-3 h-3 text-cyan-400" /> Servidor Backend (Tailscale Funnel o IP Local)</label>
          <input v-model="form.server" type="text" placeholder="https://servidor-taller.tailf19567.ts.net:10000" class="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none font-mono" />
        </div>
      </div>

      <!-- Estado en Vivo recibido por USB -->
      <div v-if="deviceStatus" class="p-2 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-[10px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
        <div><span class="text-slate-500">CO₂e:</span> <span class="text-emerald-400 font-bold">{{ Number(deviceStatus.sensors?.ppm ?? deviceStatus.ppm ?? 0).toFixed(0) }} PPM</span></div>
        <div><span class="text-slate-500">CO:</span> <span class="text-cyan-300 font-bold">{{ Number(deviceStatus.sensors?.co_ppm ?? deviceStatus.co_ppm ?? 0).toFixed(1) }} PPM</span></div>
        <div><span class="text-slate-500">Gyro:</span> <span class="text-amber-300 font-bold">{{ Number(deviceStatus.sensors?.eye_x ?? 0).toFixed(1) }}, {{ Number(deviceStatus.sensors?.eye_y ?? 0).toFixed(1) }}</span></div>
        <div><span class="text-slate-500">Wi-Fi:</span> <span :class="deviceStatus.network?.connected ? 'text-emerald-400' : 'text-amber-400'">{{ deviceStatus.network?.connected ? (deviceStatus.network?.ip || 'ONLINE') : 'USB DIRECTO' }}</span></div>
      </div>

      <!-- Barra de Acciones USB & Transmisión -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 font-mono">
        <button
          type="button"
          :disabled="!isSupported || isConnecting"
          @click="handleToggleConnect"
          class="min-h-[42px] sm:min-h-[38px] px-3.5 py-2 sm:py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          :class="isConnected ? 'bg-rose-950/70 border-rose-500 text-rose-300 hover:bg-rose-900/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'"
        >
          <Usb class="w-3.5 h-3.5 shrink-0" :class="isConnected ? 'text-rose-400' : 'text-cyan-400'" />
          <span>{{ isConnecting ? 'Enlazando...' : (isConnected ? 'Desconectar USB' : 'Conectar ESP32 (USB)') }}</span>
        </button>

        <button
          ref="transmitBtnRef"
          type="button"
          :disabled="!isConnected || isSending"
          @click="handleTransmit"
          class="min-h-[42px] sm:min-h-[38px] px-4 py-2 sm:py-1.5 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white rounded-xl text-xs font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <Zap class="w-3.5 h-3.5 text-white shrink-0" />
          <span>{{ isSending ? 'Transmitiendo...' : 'Transmitir al ESP32' }}</span>
        </button>
      </div>

      <!-- Nota de Estado o Aviso de Auto-reinicio de Hardware -->
      <div v-if="statusNote" class="text-[10px] font-mono px-2.5 py-1.5 rounded-xl bg-[#0a0805] border border-amber-900/50 text-amber-300/90 flex items-center gap-1.5">
        <Check class="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span class="break-words">{{ statusNote }}</span>
      </div>
      <div v-else-if="isConnected" class="text-[9.5px] font-mono px-2.5 py-1.5 rounded-xl bg-[#0a0805]/80 border border-amber-900/40 text-amber-300/80 flex items-center gap-1.5">
        <Info class="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>El ESP32 se auto-reinicia por diseño (DTR/RTS) al abrir el puerto. Espera a que termine de bootear.</span>
      </div>

      <!-- Monitor Serie Fósforo Ámbar -->
      <AmberTerminal :logs="logs" :is-connected="isConnected" @clear="clearLogs" />
    </div>
  </div>
</template>
