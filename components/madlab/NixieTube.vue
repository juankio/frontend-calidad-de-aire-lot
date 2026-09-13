<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: string | number
  label: string
  sublabel?: string
  color?: 'orange' | 'amber' | 'emerald' | 'cyan'
}>(), {
  sublabel: '',
  color: 'orange'
})

const colorTheme = computed(() => {
  switch (props.color) {
    case 'emerald':
      return {
        text: 'text-emerald-400 drop-shadow-[0_0_8px_#10b981]',
        dotGrid: 'bg-[radial-gradient(#10b981_1px,transparent_1px)]',
        accentBorder: 'border-emerald-500/30'
      }
    case 'cyan':
      return {
        text: 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]',
        dotGrid: 'bg-[radial-gradient(#06b6d4_1px,transparent_1px)]',
        accentBorder: 'border-cyan-500/30'
      }
    case 'amber':
      return {
        text: 'text-amber-300 drop-shadow-[0_0_8px_#f59e0b]',
        dotGrid: 'bg-[radial-gradient(#f59e0b_1px,transparent_1px)]',
        accentBorder: 'border-amber-500/30'
      }
    case 'orange':
    default:
      return {
        text: 'text-[#ff9933] drop-shadow-[0_0_10px_#ea580c]',
        dotGrid: 'bg-[radial-gradient(#f97316_1px,transparent_1px)]',
        accentBorder: 'border-[#ea580c]/40'
      }
  }
})
</script>

<template>
  <div class="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-[#1c130b] via-[#120c07] to-[#080503] border-2 border-[#854d0e]/70 shadow-[inset_0_1px_2px_rgba(251,191,36,0.2),0_4px_12px_rgba(0,0,0,0.8)] relative select-none">
    <!-- Cúpula de cristal de tubo de vacío Nixie -->
    <div
      class="relative w-full h-14 rounded-t-xl bg-gradient-to-b from-[#080604] via-[#020202] to-[#0d0906] border flex items-center justify-center overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.9)]"
      :class="colorTheme.accentBorder"
    >
      <!-- Rejilla metálica / Calla de cátodo de fondo -->
      <div
        class="absolute inset-0 [background-size:4px_4px] opacity-20 pointer-events-none"
        :class="colorTheme.dotGrid"
      />

      <!-- Reflejo curvo especular del vidrio -->
      <div class="absolute top-1 left-1.5 w-1 h-10 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full pointer-events-none" />
      <div class="absolute top-1 right-1.5 w-0.5 h-6 bg-gradient-to-b from-white/25 to-transparent rounded-full pointer-events-none" />

      <!-- Valor con brillo de filamento de gas neón -->
      <span
        class="text-base sm:text-lg font-mono font-black tracking-wider z-10 px-1 truncate"
        :class="colorTheme.text"
      >
        {{ value }}
      </span>
    </div>

    <!-- Zócalo de baquelita y latón con etiqueta grabada -->
    <div class="w-full mt-1.5 pt-1 border-t border-[#854d0e]/50 text-center">
      <div class="text-[9px] font-journal font-bold text-[#fbbf24] tracking-wide truncate">
        {{ label }}
      </div>
      <div v-if="sublabel" class="text-[7.5px] font-mono text-stone-400 truncate">
        {{ sublabel }}
      </div>
    </div>
  </div>
</template>
