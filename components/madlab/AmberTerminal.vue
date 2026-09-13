<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Terminal, Trash2, Activity } from 'lucide-vue-next'
import type { SerialLogItem } from '~/composables/useWebSerial'

const props = defineProps<{
  logs: SerialLogItem[]
  isConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

watch(() => props.logs.length, async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
})
</script>

<template>
  <div class="relative bg-[#060402] border border-[#854d0e]/80 rounded-xl p-2.5 shadow-[inset_0_0_20px_rgba(245,158,11,0.12),0_4px_12px_rgba(0,0,0,0.8)] flex flex-col font-mono select-text">
    <!-- Barra Superior del Monitor CRT -->
    <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#854d0e]/40 select-none">
      <div class="flex items-center gap-2">
        <Terminal class="w-3.5 h-3.5 text-amber-400" />
        <span class="text-[10px] font-bold text-amber-300 tracking-wider font-journal">
          MONITOR SERIE FÓSFORO ÁMBAR
        </span>
        <span class="text-[8.5px] px-1.5 py-0.5 rounded bg-[#1c1208] border border-[#854d0e]/60 text-amber-200/80 font-mono">
          115200 • 8N1
        </span>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 text-[8.5px] font-mono">
          <span
            class="w-2 h-2 rounded-full transition-all"
            :class="isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-stone-600'"
          />
          <span :class="isConnected ? 'text-emerald-400 font-bold' : 'text-stone-500'">
            {{ isConnected ? 'RX/TX VIVO' : 'SIN ENLACE' }}
          </span>
        </div>

        <button
          type="button"
          @click="emit('clear')"
          class="p-1 text-stone-500 hover:text-amber-300 hover:bg-[#1f1408] rounded transition cursor-pointer"
          title="Limpiar pantalla del terminal"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Área de Visualización Fosfórica CRT -->
    <div
      ref="scrollContainer"
      class="h-44 overflow-y-auto space-y-1 text-[10.5px] leading-relaxed pr-1 scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-black"
    >
      <div v-if="logs.length === 0" class="text-amber-500/60 italic py-6 text-center space-y-1 select-none">
        <Activity class="w-5 h-5 mx-auto text-amber-600/50 animate-pulse" />
        <p class="text-[10px]">> Terminal de fósforo ámbar en espera de telemetría.</p>
        <p class="text-[9px] text-stone-500">> Conecta el ESP32 por USB para capturar tramas de depuración en vivo.</p>
      </div>

      <div
        v-for="item in logs"
        :key="item.id"
        class="flex items-start gap-1.5 font-mono break-all"
        :class="{
          'text-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.3)]': item.type === 'rx',
          'text-emerald-300 font-bold': item.type === 'tx',
          'text-amber-500/80 italic text-[9.5px]': item.type === 'sys'
        }"
      >
        <span class="text-amber-600/60 shrink-0 text-[9px] select-none">[{{ item.time }}]</span>
        <span v-if="item.type === 'tx'" class="text-emerald-400 shrink-0 text-[9px] select-none font-bold">TX ➜</span>
        <span v-else-if="item.type === 'rx'" class="text-amber-500 shrink-0 text-[9px] select-none">RX ◀</span>
        <span v-else class="text-amber-600 shrink-0 text-[9px] select-none font-bold">●</span>
        <span>{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>
