<script setup lang="ts">
import { AlertTriangle, Disc, Check, Info } from 'lucide-vue-next'

defineProps<{
  isSupported: boolean
  showHelp: boolean
  deviceStatus: any
  statusNote: string
  isConnected: boolean
  mode: 'top' | 'bottom'
}>()
</script>

<template>
  <template v-if="mode === 'top'">
    <div v-if="!isSupported" class="p-2 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 text-[10px] font-mono flex items-start gap-2">
      <AlertTriangle class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
      <span>Web Serial API no detectada en este navegador. Utiliza Google Chrome, Microsoft Edge u Opera en PC o Mac con permisos USB.</span>
    </div>

    <div v-if="showHelp" class="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-slate-300 text-[10.5px] font-sans space-y-1">
      <p class="text-cyan-300 font-mono font-bold text-[11px] flex items-center gap-1">
        <Disc class="w-3 h-3 text-cyan-400" /> Protocolo de Enlace Físico al Microcontrolador:
      </p>
      <ol class="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300 font-mono">
        <li>Conecta el ESP32 al PC con un <span class="text-cyan-300">cable USB de datos</span> (no solo de carga).</li>
        <li>Pulsa <span class="text-cyan-300 font-bold">"Conectar ESP32 (USB)"</span> y selecciona el puerto serie (CP2102/CH340).</li>
        <li><span class="text-cyan-300">Auto-reinicio:</span> El ESP32 se auto-reinicia por diseño al abrir el puerto serie (DTR/RTS).</li>
        <li>Digita tu SSID de 2.4 GHz, clave y servidor y pulsa <span class="text-cyan-300 font-bold">"Transmitir al ESP32"</span>.</li>
        <li>El enlace USB permanecerá activo en segundo plano al cerrar este modal.</li>
      </ol>
    </div>

    <div v-if="deviceStatus" class="p-2 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-[10px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
      <div><span class="text-slate-500">CO₂e:</span> <span class="text-emerald-400 font-bold">{{ Number(deviceStatus.sensors?.ppm ?? deviceStatus.ppm ?? 0).toFixed(0) }} PPM</span></div>
      <div><span class="text-slate-500">CO:</span> <span class="text-cyan-300 font-bold">{{ Number(deviceStatus.sensors?.co_ppm ?? deviceStatus.co_ppm ?? 0).toFixed(1) }} PPM</span></div>
      <div><span class="text-slate-500">Gyro:</span> <span class="text-amber-300 font-bold">{{ Number(deviceStatus.sensors?.eye_x ?? 0).toFixed(1) }}, {{ Number(deviceStatus.sensors?.eye_y ?? 0).toFixed(1) }}</span></div>
      <div><span class="text-slate-500">Wi-Fi:</span> <span :class="deviceStatus.network?.connected ? 'text-emerald-400' : 'text-amber-400'">{{ deviceStatus.network?.connected ? (deviceStatus.network?.ip || 'ONLINE') : 'USB DIRECTO' }}</span></div>
    </div>
  </template>

  <template v-else>
    <div v-if="statusNote" class="text-[10px] font-mono px-2.5 py-1.5 rounded-xl bg-[#0a0805] border border-amber-900/50 text-amber-300/90 flex items-center gap-1.5">
      <Check class="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span class="break-words">{{ statusNote }}</span>
    </div>
    <div v-else-if="isConnected" class="text-[9.5px] font-mono px-2.5 py-1.5 rounded-xl bg-[#0a0805]/80 border border-amber-900/40 text-amber-300/80 flex items-center gap-1.5">
      <Info class="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>El ESP32 se auto-reinicia por diseño (DTR/RTS) al abrir el puerto. Espera a que termine de bootear.</span>
    </div>
  </template>
</template>
