<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Usb, Zap, X, Eye, EyeOff, HelpCircle, Wifi, Server, Check, AlertTriangle, Disc, Info } from 'lucide-vue-next'
import anime from 'animejs'
import LabScrew from './LabScrew.vue'
import AmberTerminal from './AmberTerminal.vue'
import { useWebSerial } from '~/composables/useWebSerial'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { isSupported, isConnected, isConnecting, logs, connect, disconnect, sendLine, clearLogs } = useWebSerial()

const ssid = ref('')
const password = ref('')
const showPassword = ref(false)
const serverIp = ref(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? window.location.hostname : '192.168.1.19')
const isSending = ref(false)
const showHelp = ref(false)
const statusNote = ref('')
const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
const transmitBtnRef = ref<HTMLElement | null>(null)

const isReducedMotion = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

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

async function handleToggleConnect() {
  statusNote.value = ''
  if (isConnected.value) {
    await disconnect()
  } else {
    const ok = await connect(115200)
    if (!ok && isSupported.value) {
      statusNote.value = 'Apertura de puerto USB cancelada o no disponible.'
    } else if (ok) {
      statusNote.value = 'ESP32 conectado. Es normal si el chip se reinicia al abrir el puerto serie (señal DTR/RTS).'
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
  if (!ssid.value.trim()) {
    statusNote.value = 'El nombre de red (SSID) es requerido.'
    return
  }
  isSending.value = true
  statusNote.value = ''
  const payload = { cmd: 'SET_WIFI', ssid: ssid.value.trim(), pass: password.value, server: serverIp.value.trim() || '192.168.1.19' }
  const ok = await sendLine(JSON.stringify(payload))
  isSending.value = false
  statusNote.value = ok ? '¡Trama transmitida! Observa la respuesta en el terminal.' : 'Fallo al transmitir por el canal serie.'
}
</script>

<template>
  <div v-if="isOpen" ref="backdropRef" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xs pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]">
    <div ref="modalCardRef" class="bg-gradient-to-b from-[#1c150c] via-[#150f08] to-[#0c0906] border-2 border-[#854d0e] rounded-2xl w-full max-w-xl max-h-[90dvh] overflow-y-auto overscroll-contain p-3.5 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] relative select-none space-y-3">
      <LabScrew class="absolute top-2 left-2" :rotation="22" /><LabScrew class="absolute top-2 right-2" :rotation="-40" /><LabScrew class="absolute bottom-2 left-2" :rotation="65" /><LabScrew class="absolute bottom-2 right-2" :rotation="-18" />

      <!-- Cabecera Steampunk -->
      <div class="flex items-center justify-between border-b border-[#854d0e]/60 pb-2 px-1 sm:px-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded bg-[#2c1a0e] border border-[#854d0e] flex items-center justify-center text-amber-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] shrink-0">
            <Usb class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-journal font-bold text-[#fbbf24] flex items-center gap-1.5">
              <span>Aprovisionamiento Wi-Fi por USB</span>
            </h3>
            <p class="text-[8.5px] sm:text-[9px] font-mono text-stone-400">Web Serial Protocol @ 115200 Baudios</p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-1.5">
          <button type="button" @click="showHelp = !showHelp" class="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#1f1408] border border-[#854d0e]/60 text-amber-300 hover:text-amber-100 text-[10px] font-journal transition flex items-center gap-1 cursor-pointer active:scale-95" title="Instrucciones de conexión">
            <HelpCircle class="w-3.5 h-3.5 text-amber-400" /><span class="hidden sm:inline">Guía UX</span>
          </button>
          <button type="button" @click="emit('close')" aria-label="Cerrar modal" title="Cerrar modal" class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-400 hover:text-amber-200 hover:bg-stone-900/60 cursor-pointer transition active:scale-90">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Alerta de Compatibilidad Web Serial -->
      <div v-if="!isSupported" class="p-2 rounded-xl bg-amber-950/70 border border-amber-600/80 text-amber-200 text-[10px] font-mono flex items-start gap-2">
        <AlertTriangle class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>Web Serial API no detectada en este navegador. Utiliza Google Chrome, Microsoft Edge u Opera en PC o Mac con permisos USB.</span>
      </div>

      <!-- Panel Desplegable de Ayuda UX -->
      <div v-if="showHelp" class="p-2.5 rounded-xl bg-[#0c0906] border border-[#854d0e]/60 text-stone-300 text-[10.5px] font-journal space-y-1">
        <p class="text-amber-300 font-bold text-[11px] flex items-center gap-1"><Disc class="w-3 h-3 text-amber-400" /> Protocolo de Enlace Físico al Microcontrolador:</p>
        <ol class="list-decimal list-inside space-y-0.5 text-[10px] text-stone-300 font-mono">
          <li>Conecta el ESP32 al PC con un <span class="text-amber-300">cable USB de datos</span> (no solo de carga).</li>
          <li>Pulsa <span class="text-amber-300 font-bold">"Conectar ESP32 (USB)"</span> y selecciona el puerto serie (CP2102/CH340).</li>
          <li><span class="text-amber-300">Auto-reinicio:</span> El ESP32 se auto-reinicia por diseño al abrir el puerto serie (DTR/RTS).</li>
          <li>Digita tu SSID de 2.4 GHz, clave e IP de servidor y pulsa <span class="text-amber-300 font-bold">"Transmitir al ESP32"</span>.</li>
          <li>El ESP32 guardará la configuración en memoria flash NVS e iniciará el enlace Wi-Fi.</li>
        </ol>
      </div>

      <!-- Formulario de Configuración de Red (Anti Auto-Zoom en iOS: text-base sm:text-xs) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-journal">
        <div>
          <label class="block text-[10px] font-bold text-amber-200 mb-0.5 flex items-center gap-1"><Wifi class="w-3 h-3 text-amber-400" /> Red Wi-Fi (SSID)</label>
          <input v-model="ssid" type="text" placeholder="Mi_Red_WiFi" class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-amber-200 mb-0.5">Clave Wi-Fi</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-3 py-2 sm:py-1.5 pr-10 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono" />
            <button type="button" @click="showPassword = !showPassword" aria-label="Mostrar u ocultar contraseña" class="absolute right-0 top-0 bottom-0 min-w-[40px] flex items-center justify-center text-stone-400 hover:text-amber-300 cursor-pointer">
              <EyeOff v-if="showPassword" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-amber-200 mb-0.5 flex items-center gap-1"><Server class="w-3 h-3 text-amber-400" /> Servidor Backend</label>
          <input v-model="serverIp" type="text" placeholder="192.168.1.19" class="w-full bg-[#080604] border border-[#854d0e]/70 rounded-xl px-3 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-stone-600 focus:border-[#fbbf24] focus:outline-none font-mono" />
        </div>
      </div>

      <!-- Barra de Acciones USB & Transmisión -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
        <button
          type="button"
          :disabled="!isSupported || isConnecting"
          @click="handleToggleConnect"
          class="min-h-[42px] sm:min-h-[38px] px-3.5 py-2 sm:py-1.5 rounded-xl border text-xs font-bold font-journal transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
          :class="isConnected ? 'bg-[#451a03] border-rose-600 text-rose-200 hover:bg-rose-900/80 shadow-[0_2px_8px_rgba(225,29,72,0.4)]' : 'bg-gradient-to-r from-[#291e10] to-[#1c1409] border-[#854d0e] hover:border-[#fbbf24] text-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.6)]'"
        >
          <Usb class="w-3.5 h-3.5 shrink-0" :class="isConnected ? 'text-rose-400' : 'text-amber-400'" />
          <span>{{ isConnecting ? 'Enlazando...' : (isConnected ? 'Desconectar USB' : 'Conectar ESP32 (USB)') }}</span>
        </button>

        <button
          ref="transmitBtnRef"
          type="button"
          :disabled="!isConnected || isSending"
          @click="handleTransmit"
          class="min-h-[42px] sm:min-h-[38px] px-4 py-2 sm:py-1.5 bg-gradient-to-r from-[#b45309] to-[#78350f] hover:from-[#d97706] hover:to-[#92400e] border border-[#fbbf24]/80 text-[#fef3c7] rounded-xl text-xs font-bold font-journal transition shadow-[0_2px_10px_rgba(180,83,9,0.5)] cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <Zap class="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
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
