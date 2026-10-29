<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue'
import { Usb, Zap, X, RefreshCw, Activity, Cpu } from 'lucide-vue-next'
import AmberTerminal from './AmberTerminal.vue'
import LinkStatusGrid from './LinkStatusGrid.vue'
import LinkCommandBar from './LinkCommandBar.vue'
import { useAirGuardian } from '~/composables/useAirGuardian'
import { animateModalOpenTransition } from '~/utils/modalAnimHelper'
import type { SerialLogItem } from '~/utils/webSerialProtocol'
import { formatSerialTimestamp } from '~/utils/webSerialProtocol'
interface LinkStatus {
  connected: boolean
  port: string | null
  baud: number
  baud_effective: number
  mot_hz: number
  tlm_hz: number
  mot_frames: number
  tlm_frames: number
  frames_received: number
  last_error: string | null
  last_mot_age_ms: number | null
  last_tlm_age_ms: number | null
}
interface LinkInfo {
  connected: boolean
  port: string | null
  baud: number
  motHz: number
  tlmHz: number
  motFrames: number
  tlmFrames: number
  lastError: string | null
}
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'status', payload: any): void }>()
const air = useAirGuardian()
const config = useRuntimeConfig()
const apiBase = computed(() => String(config.public?.apiBase || 'http://localhost:3002').replace(/\/+$/, ''))
const logs = ref<SerialLogItem[]>([])
let logId = 0
function pushLog(text: string, type: SerialLogItem['type'] = 'sys') {
  logs.value.push({ id: ++logId, text, time: formatSerialTimestamp(), type })
  if (logs.value.length > 200) logs.value.splice(0, logs.value.length - 200)
}
function clearLogs() { logs.value = [] }
const linkStatus = ref<LinkStatus | null>(null)
const isBusy = ref(false)
const statusNote = ref('')
const backdropRef = ref<HTMLElement | null>(null)
const modalCardRef = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null
const contractLinkInfo = computed<LinkInfo | null>(() => {
  const raw = (air as unknown as { localLinkInfo?: { value?: LinkInfo } }).localLinkInfo?.value
  return raw ?? null
})
const info = computed<LinkInfo>(() => {
  if (contractLinkInfo.value) return contractLinkInfo.value
  const ls = linkStatus.value
  return {
    connected: air.localLinkConnected.value,
    port: air.localLinkPort.value,
    baud: ls?.baud_effective ?? ls?.baud ?? 0,
    motHz: ls?.mot_hz ?? 0,
    tlmHz: ls?.tlm_hz ?? 0,
    motFrames: ls?.mot_frames ?? 0,
    tlmFrames: ls?.tlm_frames ?? 0,
    lastError: ls?.last_error ?? null,
  }
})
const connected = computed(() => info.value.connected)
const motAge = computed(() => linkStatus.value?.last_mot_age_ms ?? null)
const indicatorClass = computed(() => {
  if (!connected.value) return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
  if (motAge.value !== null && motAge.value > 1000) return 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
  return 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
})
async function refreshLink() {
  try {
    const res = await fetch(`${apiBase.value}/api/hardware/link`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { success?: boolean; data?: LinkStatus }
    if (json.success && json.data) {
      linkStatus.value = json.data
      if (typeof air.fetchLocalLinkStatus === 'function') air.fetchLocalLinkStatus()
      emit('status', json.data)
    }
  } catch (err) {
    pushLog(`Error consultando enlace: ${String(err)}`, 'sys')
  }
}
async function reconnect() {
  isBusy.value = true
  statusNote.value = ''
  pushLog('Solicitando reconexión del cable al backend...', 'tx')
  try {
    const res = await fetch(`${apiBase.value}/api/hardware/link/reconnect`, { method: 'POST' })
    const json = (await res.json()) as { success?: boolean; data?: LinkStatus; error?: string | null; message?: string }
    if (json.data) linkStatus.value = json.data
    if (typeof air.fetchLocalLinkStatus === 'function') air.fetchLocalLinkStatus()
    if (json.success) {
      statusNote.value = 'Enlace reconectado.'
      pushLog(json.message || 'Enlace reconectado.', 'sys')
    } else {
      statusNote.value = json.error || 'No se pudo reconectar.'
      pushLog(json.error || 'Fallo de reconexión.', 'sys')
    }
  } catch (err) {
    statusNote.value = 'Error de red al reconectar.'
    pushLog(`Error de red: ${String(err)}`, 'sys')
  } finally {
    isBusy.value = false
  }
}
async function sendCommand(cmd: string, extra: Record<string, unknown> = {}) {
  isBusy.value = true
  statusNote.value = ''
  pushLog(`TX ➜ ${JSON.stringify({ cmd, ...extra })}`, 'tx')
  try {
    const res = await fetch(`${apiBase.value}/api/hardware/link/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd, ...extra }),
    })
    const json = (await res.json()) as { success?: boolean; error?: string | null; message?: string }
    if (json.success) {
      statusNote.value = 'Comando entregado.'
      pushLog(json.message || 'Comando entregado al nodo.', 'sys')
    } else {
      statusNote.value = json.error || 'Comando no entregado.'
      pushLog(json.error || 'Fallo al entregar comando.', 'sys')
    }
  } catch (err) {
    statusNote.value = 'Error de red al enviar comando.'
    pushLog(`Error de red: ${String(err)}`, 'sys')
  } finally {
    isBusy.value = false
  }
}
watch(() => props.isOpen, async (open) => {
  if (open) {
    await nextTick()
    animateModalOpenTransition(backdropRef.value, modalCardRef.value)
    pushLog('Panel de enlace USB (backend) abierto.', 'sys')
    await refreshLink()
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(refreshLink, 1000)
  } else {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }
}, { immediate: true })
onUnmounted(() => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
})
</script>
<template>
  <div v-if="isOpen" ref="backdropRef" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md">
    <div ref="modalCardRef" class="bg-[#070b14]/95 border border-cyan-500/40 rounded-2xl w-full max-w-xl max-h-[90dvh] overflow-y-auto p-3.5 sm:p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono space-y-3">
      <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
            <Usb class="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-scifi font-bold text-white tracking-wider">ENLACE USB · BACKEND</h3>
            <p class="text-[8.5px] sm:text-[9px] text-slate-400">El navegador no abre el puerto: el backend es el dueño.</p>
          </div>
        </div>
        <button type="button" @click="emit('close')" aria-label="Cerrar modal" class="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-200 hover:bg-slate-900 cursor-pointer transition active:scale-90">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="w-2.5 h-2.5 rounded-full" :class="indicatorClass" />
        <span class="text-slate-300">{{ connected ? 'CABLE CONECTADO' : 'SIN ENLACE' }}</span>
        <span v-if="statusNote" class="text-slate-500 text-[10px]">· {{ statusNote }}</span>
      </div>
      <LinkStatusGrid :info="info" />
      <div class="flex flex-wrap gap-2">
        <button type="button" :disabled="isBusy" @click="reconnect" class="min-h-[40px] px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-slate-900 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50">
          <RefreshCw class="w-3.5 h-3.5" /><span>Reconectar cable</span>
        </button>
        <LinkCommandBar :disabled="isBusy || !connected" @command="(cmd, extra) => sendCommand(cmd, extra || {})" />
      </div>
      <AmberTerminal :logs="logs" :is-connected="connected" @clear="clearLogs" />
    </div>
  </div>
</template>
