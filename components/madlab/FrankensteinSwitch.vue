<script setup lang="ts">
import { Zap, Power } from 'lucide-vue-next'
import MadLabContainer from './MadLabContainer.vue'

defineProps<{
  modelValue: boolean
  label?: string
  hardwareStatus?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggleSwitch() {
  emit('update:modelValue', !arguments[0])
}
</script>

<template>
  <MadLabContainer no-padding class="cursor-pointer group active:scale-[0.99]" @click="emit('update:modelValue', !modelValue)">
    <div class="p-3 w-full flex-1 transition flex flex-col justify-between">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-1.5 border-b border-[#854d0e]/40 mb-1">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 transition-colors" :class="modelValue ? 'text-cyan-400 animate-pulse' : 'text-stone-500'" />
          <span class="text-[10px] font-journal font-bold tracking-wide text-[#fbbf24]">{{ label || 'Simulador de Datos' }}</span>
        </div>
        <div class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors"
          :class="modelValue ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-stone-900 border-stone-700 text-stone-500'">
          {{ modelValue ? 'SIMULACIÓN ACTIVA' : 'SISTEMA INACTIVO' }}
        </div>
      </div>

      <!-- El Switch Visual -->
      <div class="flex-1 flex items-center justify-center relative py-2">
        <div class="w-24 h-10 rounded-full bg-black/60 border-2 border-[#1c150c] shadow-inner relative flex items-center px-1 transition-colors"
             :class="modelValue ? 'border-cyan-900/50' : ''">
          <div class="w-8 h-8 rounded-full shadow-md transition-all duration-300 ease-out flex items-center justify-center border-2"
               :class="modelValue ? 'bg-cyan-500 border-cyan-300 translate-x-14 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-stone-600 border-stone-400 translate-x-0'">
            <Power class="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <!-- Footer descriptivo -->
      <div class="text-[8.5px] font-journal text-center mt-1 px-2 py-1 rounded bg-black/40 border border-[#854d0e]/20"
           :class="modelValue ? 'text-cyan-300' : 'text-amber-500/70'">
        {{ modelValue ? '⚡ Inyectando datos sintéticos al sistema' : 'Haz clic para iniciar simulación de prueba' }}
      </div>
    </div>
  </MadLabContainer>
</template>
