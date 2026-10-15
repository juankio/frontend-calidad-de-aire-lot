<script setup lang="ts">
withDefaults(defineProps<{
  rotation?: number | string
}>(), {
  rotation: 0
})
</script>

<template>
  <div
    class="w-2.5 h-2.5 flex items-center justify-center shrink-0 pointer-events-none select-none"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <!-- Remache mecha hexagonal de titanio aeroespacial con micro-diodo cian -->
    <svg class="w-full h-full" viewBox="0 0 10 10">
      <polygon points="5,0.8 8.8,3 8.8,7 5,9.2 1.2,7 1.2,3" fill="#0f172a" stroke="#06b6d4" stroke-width="0.8" stroke-opacity="0.7" />
      <circle cx="5" cy="5" r="1.2" fill="#22d3ee" fill-opacity="0.8" />
    </svg>
  </div>
</template>
