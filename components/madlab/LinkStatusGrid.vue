<script setup lang="ts">
interface LinkInfo {
  connected: boolean
  port: string | null
  baud: number
  motHz: number
  tlmHz: number
  motFrames: number
  tlmFrames: number
  lastError: string | null
}

defineProps<{ info: LinkInfo }>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">Puerto</div>
      <div class="text-cyan-300 font-bold truncate">{{ info.port || '—' }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">Baudios</div>
      <div class="text-cyan-300 font-bold">{{ info.baud }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">MOT Hz</div>
      <div class="text-cyan-300 font-bold">{{ info.motHz }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">TLM Hz</div>
      <div class="text-cyan-300 font-bold">{{ info.tlmHz }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">MOT frames</div>
      <div class="text-cyan-300 font-bold">{{ info.motFrames }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2">
      <div class="text-slate-500">TLM frames</div>
      <div class="text-cyan-300 font-bold">{{ info.tlmFrames }}</div>
    </div>
    <div class="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-2 col-span-2">
      <div class="text-slate-500">Último error</div>
      <div class="text-rose-300 font-bold truncate">{{ info.lastError || '—' }}</div>
    </div>
  </div>
</template>
