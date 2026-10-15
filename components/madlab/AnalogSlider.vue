<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min: number
  max: number
  step?: number
  label: string
  sublabel?: string
  unit?: string
  color?: 'amber' | 'emerald' | 'rose' | 'copper'
}>(), {
  step: 1,
  sublabel: '',
  unit: '',
  color: 'amber'
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const colorStyles = computed(() => {
  switch (props.color) {
    case 'emerald':
      return {
        badgeBg: 'bg-[#062413] border-emerald-600/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]',
        thumbColor: 'emerald',
        trackFill: 'bg-emerald-500/40'
      }
    case 'rose':
      return {
        badgeBg: 'bg-[#240a12] border-rose-600/60 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.25)]',
        thumbColor: 'rose',
        trackFill: 'bg-rose-500/40'
      }
    case 'copper':
      return {
        badgeBg: 'bg-[#241306] border-[#d97706]/70 text-[#fde68a] shadow-[0_0_8px_rgba(217,119,6,0.3)]',
        thumbColor: 'copper',
        trackFill: 'bg-amber-600/40'
      }
    case 'amber':
    default:
      return {
        badgeBg: 'bg-[#20140a] border-amber-600/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
        thumbColor: 'amber',
        trackFill: 'bg-amber-500/40'
      }
  }
})

const percentage = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  const pct = ((props.modelValue - props.min) / range) * 100
  return Math.max(0, Math.min(100, pct))
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="p-2.5 rounded-xl bg-gradient-to-b from-[#160f0a] via-[#100b07] to-[#080503] border-2 border-[#854d0e]/60 shadow-[inset_0_1px_2px_rgba(251,191,36,0.15),0_4px_12px_rgba(0,0,0,0.7)] flex flex-col gap-1.5 select-none group">
    <!-- Header del potenciómetro -->
    <div class="flex items-center justify-between text-[10px] font-mono">
      <span class="text-[#fbbf24] font-bold tracking-wide flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-[#fbbf24]/70 shadow-[0_0_4px_#fbbf24]" />
        {{ label }}
      </span>
      <div
        class="font-mono text-[11px] font-black px-2 py-0.5 rounded-md border tracking-wider flex items-center gap-0.5"
        :class="colorStyles.badgeBg"
      >
        <span>{{ typeof modelValue === 'number' && modelValue % 1 !== 0 ? modelValue.toFixed(2) : modelValue }}{{ unit ? ` ${unit}` : '' }}</span>
      </div>
    </div>

    <!-- Pista analógica con marcas de graduación grabadas -->
    <div class="relative flex items-center py-1.5">
      <!-- Fondo de pista hundida tipo canaleta de bronce -->
      <div class="w-full h-2.5 rounded-full bg-gradient-to-b from-[#050302] via-[#0d0906] to-[#1a1109] border border-[#451a03] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] overflow-hidden relative">
        <!-- Relleno de señal activa -->
        <div
          class="h-full transition-all duration-75"
          :class="colorStyles.trackFill"
          :style="{ width: `${percentage}%` }"
        />
      </div>

      <!-- Marcas de graduación impresas en metal (ticks mecánicos) -->
      <div class="absolute inset-x-1.5 -bottom-2 flex justify-between pointer-events-none opacity-40">
        <span v-for="i in 9" :key="i" class="w-[1px] bg-[#fbbf24]" :class="i % 2 === 1 ? 'h-1.5' : 'h-1 opacity-50'" />
      </div>

      <!-- Input de rango nativo con perilla estilo potenciómetro industrial -->
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="handleInput"
        class="analog-range-slider absolute inset-0 w-full opacity-0 cursor-ew-resize z-20"
        :aria-label="label"
      >

      <!-- Perilla física (Thumb visual con relieve y ranura de latón moleteado) -->
      <div
        class="absolute pointer-events-none z-10 -ml-2.5 w-5 h-5 rounded-full bg-gradient-to-tr from-[#451a03] via-[#b45309] to-[#fbbf24] border-[1.5px] border-[#fbbf24] shadow-[0_2px_8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.6)] flex items-center justify-center transition-transform duration-75 group-hover:scale-110"
        :style="{ left: `calc(${percentage}% + ${(0.5 - percentage / 100) * 8}px)` }"
      >
        <!-- Hendidura / estría de la perilla -->
        <div class="w-0.5 h-2.5 bg-[#451a03] rounded-full shadow-inner" />
      </div>
    </div>

    <!-- Subtexto o leyenda física grabada -->
    <div class="flex items-center justify-between text-[7.5px] font-mono text-stone-400 mt-1">
      <span>Min: {{ min }}</span>
      <span v-if="sublabel" class="font-mono text-[#d97706] font-semibold">{{ sublabel }}</span>
      <span>Max: {{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.analog-range-slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
</style>
