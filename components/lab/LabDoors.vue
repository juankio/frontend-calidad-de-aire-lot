<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  defaultOpen?: boolean
}>(), {
  modelValue: undefined,
  defaultOpen: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'toggle', val: boolean): void
}>()

const localOpen = ref(props.defaultOpen)
const isOpen = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : localOpen.value,
  set: (val: boolean) => {
    localOpen.value = val
    emit('update:modelValue', val)
    emit('toggle', val)
  }
})
const toggleDoors = () => { isOpen.value = !isOpen.value }
</script>

<template>
  <div class="relative w-full rounded-2xl bg-neutral-950 border-2 border-slate-700 shadow-2xl p-1 select-none [perspective:1400px]">
    <!-- Luz Fluorescente Interior de Techo (Ilumina al abrir) -->
    <div class="relative w-full rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-slate-800 transition-all duration-500 min-h-[360px] flex flex-col justify-between" :class="isOpen ? 'shadow-[inset_0_20px_40px_rgba(255,255,255,0.15)] ring-1 ring-cyan-400/30' : ''">
      <!-- Tubo LED Fluorescente Blanco -->
      <div class="w-full h-2 transition-all duration-500 flex items-center justify-center px-8" :class="isOpen ? 'bg-white shadow-[0_0_20px_#ffffff,0_0_35px_#38bdf8]' : 'bg-slate-800/80'">
        <div class="w-2/3 h-0.5 bg-cyan-200/90 rounded-full" v-if="isOpen"></div>
      </div>

      <!-- Contenido Interior / Slot Revelado -->
      <div class="relative z-0 p-4 sm:p-6 flex-1 flex flex-col justify-center">
        <slot :is-open="isOpen" :toggle="toggleDoors" />
      </div>

      <!-- Barra de Estado Inferior Interna -->
      <div class="px-4 py-1.5 bg-neutral-950 border-t border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-500">
        <span>GABINETE INTERIOR BIO-CLINIC</span>
        <button @click="toggleDoors" class="hover:text-slate-300 font-bold uppercase transition flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full" :class="isOpen ? 'bg-amber-400' : 'bg-emerald-400'"></span>
          {{ isOpen ? 'Cerrar Puertas' : 'Abrir Puertas' }}
        </button>
      </div>

      <!-- PUERTAS BATIENTES 3D (Capa Frontal) -->
      <div class="absolute inset-0 z-20 pointer-events-none flex [transform-style:preserve-3d]">
        <!-- Puerta Izquierda (Giro -115deg) -->
        <div 
          class="w-1/2 h-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border-r border-y-2 border-l-2 border-slate-300 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.15),5px_0_15px_rgba(0,0,0,0.3)] origin-left transition-transform duration-700 ease-in-out pointer-events-auto flex flex-col justify-between p-4"
          :style="{ transform: isOpen ? 'rotateY(-115deg)' : 'rotateY(0deg)' }"
        >
          <!-- Bisagras de Acero Superior e Inferior -->
          <div class="absolute left-1 top-4 w-2 h-6 rounded bg-slate-400 border border-slate-500 shadow-sm"></div>
          <div class="absolute left-1 bottom-4 w-2 h-6 rounded bg-slate-400 border border-slate-500 shadow-sm"></div>

          <!-- Tornillos y Placa Serigrafiada Superior -->
          <div class="flex items-center justify-between border-b border-slate-300 pb-2">
            <div class="w-2 h-2 rounded-full bg-slate-400 border border-slate-500"></div>
            <span class="text-[8px] font-mono font-bold tracking-widest text-slate-600 uppercase">AIR GUARDIAN S3</span>
          </div>

          <!-- Placa Serigrafiada Principal del Laboratorio -->
          <div class="my-auto p-3 rounded-lg bg-white/70 border border-slate-300 shadow-inner flex flex-col items-center text-center">
            <div class="w-7 h-7 rounded-full bg-emerald-600/10 border border-emerald-500/40 flex items-center justify-center text-emerald-700 font-black text-xs font-mono mb-1">AG</div>
            <span class="font-mono font-black text-xs text-slate-800 tracking-wider uppercase">SENTINEL LAB</span>
            <span class="text-[8px] font-mono text-slate-500 mt-0.5">UNIDAD DE BIOQUÍMICA & AI</span>
          </div>

          <!-- Manija Tubular de Acero Inoxidable Izquierda -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer" @click="toggleDoors" title="Tirar para abrir">
            <div class="w-3 h-20 rounded-full bg-gradient-to-r from-slate-400 via-white to-slate-400 border border-slate-400 shadow-lg flex items-center justify-center">
              <div class="w-1 h-12 bg-slate-300/80 rounded-full"></div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-slate-300 pt-2">
            <span class="text-[8px] font-mono text-slate-500">ISO-9001 BIO</span>
            <div class="w-2 h-2 rounded-full bg-slate-400 border border-slate-500"></div>
          </div>
        </div>

        <!-- Puerta Derecha (Giro 115deg) -->
        <div 
          class="w-1/2 h-full bg-gradient-to-bl from-slate-100 via-slate-200 to-slate-300 border-l border-y-2 border-r-2 border-slate-300 shadow-[inset_2px_0_4px_rgba(0,0,0,0.15),-5px_0_15px_rgba(0,0,0,0.3)] origin-right transition-transform duration-700 ease-in-out pointer-events-auto flex flex-col justify-between p-4"
          :style="{ transform: isOpen ? 'rotateY(115deg)' : 'rotateY(0deg)' }"
        >
          <!-- Bisagras de Acero Superior e Inferior -->
          <div class="absolute right-1 top-4 w-2 h-6 rounded bg-slate-400 border border-slate-500 shadow-sm"></div>
          <div class="absolute right-1 bottom-4 w-2 h-6 rounded bg-slate-400 border border-slate-500 shadow-sm"></div>

          <!-- Tornillos y Placa Serigrafiada Superior -->
          <div class="flex items-center justify-between border-b border-slate-300 pb-2">
            <span class="text-[8px] font-mono font-bold tracking-widest text-slate-600 uppercase">CHASIS ACERO ASTM</span>
            <div class="w-2 h-2 rounded-full bg-slate-400 border border-slate-500"></div>
          </div>

          <!-- Placa de Advertencia Serigrafiada -->
          <div class="my-auto p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col items-center text-center">
            <span class="font-mono font-bold text-[9px] text-amber-700 tracking-wider uppercase">ACCESO RESTRINGIDO</span>
            <span class="text-[8px] font-mono text-slate-600 mt-1">MUESTREO ACTIVO MQ-135 / S3</span>
          </div>

          <!-- Manija Derecha & Cerradura Central de Seguridad -->
          <div class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer" @click="toggleDoors" title="Girar cerradura para abrir">
            <!-- Cerradura / Pestillo Negro con Ranura -->
            <div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-500 shadow-md flex items-center justify-center">
              <div class="w-1 h-3 bg-slate-300 rounded-sm"></div>
            </div>
            <!-- Manija Tubular Derecha -->
            <div class="w-3 h-20 rounded-full bg-gradient-to-r from-slate-400 via-white to-slate-400 border border-slate-400 shadow-lg flex items-center justify-center">
              <div class="w-1 h-12 bg-slate-300/80 rounded-full"></div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-slate-300 pt-2">
            <div class="w-2 h-2 rounded-full bg-slate-400 border border-slate-500"></div>
            <span class="text-[8px] font-mono text-slate-500">ZONE CONTROL</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
