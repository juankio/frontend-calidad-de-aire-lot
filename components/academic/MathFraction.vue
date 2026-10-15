<script setup lang="ts">
defineProps<{
  num: string
  den: string
}>()
</script>

<template>
  <span class="inline-flex flex-col items-center justify-center align-middle mx-1 font-mono text-center text-amber-200">
    <span class="border-b border-amber-400/80 px-1.5 leading-none pb-0.5 text-[0.9em] text-[#fbbf24] font-semibold">{{ num }}</span>
    <span class="px-1.5 leading-none pt-0.5 text-[0.85em] text-amber-100/90 font-medium">{{ den }}</span>
  </span>
</template>
