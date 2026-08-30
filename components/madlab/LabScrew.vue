<script setup lang="ts">
withDefaults(defineProps<{
  rotation?: number | string
}>(), {
  rotation: 35
})
</script>

<template>
  <div
    class="w-2.5 h-2.5 rounded-full p-[0.5px] bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#1c0d02] shadow-[0_1px_2px_rgba(0,0,0,0.85),inset_0_0.5px_0.5px_rgba(251,191,36,0.3)] flex items-center justify-center shrink-0 pointer-events-none select-none"
  >
    <!-- Cabeza circular biselada con gradiente metálico realista (#78350f a #fbbf24) -->
    <div
      class="w-full h-full rounded-full bg-gradient-to-br from-[#fbbf24] via-[#d97706] to-[#78350f] border border-[#78350f]/80 shadow-[inset_0_1px_1px_rgba(254,240,138,0.7),inset_0_-1px_1px_rgba(28,13,2,0.85)] flex items-center justify-center"
      :style="{ transform: `rotate(${rotation}deg)` }"
    >
      <!-- Ranura de destornillador grabada en bajo relieve con línea de sombra y brillo -->
      <div class="w-[68%] h-[1px] bg-[#140801] shadow-[0_0.75px_0_rgba(254,240,138,0.8),0_-0.5px_0_rgba(0,0,0,0.95)] rounded-full" />
    </div>
  </div>
</template>
