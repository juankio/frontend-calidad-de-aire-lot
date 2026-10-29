<script setup lang="ts">
const props = defineProps<{ disabled: boolean }>()
const emit = defineEmits<{ (e: 'command', cmd: string, extra?: Record<string, unknown>): void }>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button type="button" :disabled="props.disabled" @click="emit('command', 'CALIBRATE_MPU')" class="min-h-[40px] px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-slate-900 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50">
      Calibrar MPU
    </button>
    <button type="button" :disabled="props.disabled" @click="emit('command', 'SET_VIEW_MODE', { view_mode: 'FACE' })" class="min-h-[40px] px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-slate-900 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50">
      Vista FACE
    </button>
    <button type="button" :disabled="props.disabled" @click="emit('command', 'SET_VIEW_MODE', { view_mode: 'HUD' })" class="min-h-[40px] px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-slate-900 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50">
      Vista HUD
    </button>
    <button type="button" :disabled="props.disabled" @click="emit('command', 'SET_EMOTION', { emotion: 'OPTIMAL', view_mode: 'FACE' })" class="min-h-[40px] px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-slate-900 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50">
      Emoción OK
    </button>
  </div>
</template>
