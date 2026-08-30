<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  unit: string
  subtitle?: string
  trend?: number
  variant?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'neutral'
}>()
</script>

<template>
  <div class="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg backdrop-blur-sm transition-all hover:border-neutral-700">
    <div class="flex items-center justify-between text-xs text-neutral-400 font-medium">
      <span>{{ title }}</span>
      <span v-if="trend !== undefined" class="font-mono flex items-center gap-1 text-[11px]" :class="trend > 0 ? 'text-amber-400' : 'text-emerald-400'">
        <svg v-if="trend > 0" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
        {{ trend > 0 ? '+' : '' }}{{ trend.toFixed(1) }}/m
      </span>
    </div>

    <div class="my-3 flex items-baseline gap-2">
      <span class="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
        {{ value }}
      </span>
      <span class="text-xs text-neutral-400 font-mono">{{ unit }}</span>
    </div>

    <div v-if="subtitle" class="text-[11px] text-neutral-400 font-mono">
      {{ subtitle }}
    </div>
  </div>
</template>
