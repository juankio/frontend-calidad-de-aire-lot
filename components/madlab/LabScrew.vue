<script setup lang="ts">
withDefaults(defineProps<{
  rotation?: number | string
}>(), {
  rotation: 35
})
</script>

<template>
  <div
    class="w-3 h-3 rounded-full bg-[#fbbf24] border-[1.5px] border-[#451a03] flex items-center justify-center shrink-0 pointer-events-none select-none shadow-[1px_1px_0px_#451a03]"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <!-- Simple ranura tipo cruz o plana, hagamosla plana gruesa -->
    <div class="w-[60%] h-[1.5px] bg-[#451a03] rounded-full" />
  </div>
</template>
