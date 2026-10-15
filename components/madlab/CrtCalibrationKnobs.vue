<script setup lang="ts">
defineProps<{
  expanded: boolean
}>()

const knobs = ['TIEMPO', 'SENSIBILIDAD', 'DISPARO', 'FOCO']
</script>

<template>
  <div
    class="grid grid-cols-4 gap-2 mt-auto border-t border-cyan-500/20 text-center font-mono shrink-0 transition-all"
    :class="expanded ? 'pt-3 pb-1' : 'pt-2'"
  >
    <div v-for="knob in knobs" :key="knob" class="flex flex-col items-center">
      <div
        class="rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-inner relative transition-all group-hover:border-cyan-400"
        :class="expanded ? 'w-8 h-8' : 'w-5 h-5'"
      >
        <div
          class="bg-cyan-400 absolute rounded-full shadow-[0_0_6px_#06b6d4]"
          :class="expanded ? 'w-0.5 h-3 top-0.5' : 'w-0.5 h-2 top-0.5'"
        />
        <div
          class="rounded-full bg-slate-950 border border-cyan-500/60"
          :class="expanded ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'"
        />
      </div>
      <span
        class="font-mono font-bold text-cyan-400 mt-1"
        :class="expanded ? 'text-[9px]' : 'text-[7.5px]'"
      >
        {{ knob }}
      </span>
    </div>
  </div>
</template>
