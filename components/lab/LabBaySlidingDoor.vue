<script setup lang="ts">
defineProps<{
  isOpen: boolean
  isDragging: boolean
  computedTransform: string
  theme: 'graphite' | 'white-lab'
}>()

const emit = defineEmits<{
  (e: 'pointerDown', ev: MouseEvent | TouchEvent): void
}>()
</script>

<template>
  <div
    class="absolute inset-x-0 bottom-0 top-[49px] z-20 select-none touch-none transition-transform"
    :class="[
      isDragging ? 'cursor-grabbing duration-0' : 'cursor-grab duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
      isOpen ? 'shadow-2xl' : 'shadow-none'
    ]"
    :style="{ transform: computedTransform }"
    @mousedown="emit('pointerDown', $event)"
    @touchstart="emit('pointerDown', $event)"
  >
    <div
      class="w-full h-full relative border-t flex flex-col justify-between p-5 shadow-[inset_0_0_35px_rgba(0,0,0,0.85)]"
      :class="theme === 'white-lab' ? 'corrugated-metal-white border-slate-400' : 'corrugated-metal-bay border-slate-700/80'"
    >
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 opacity-60" />

      <div class="relative z-10 flex items-center justify-between">
        <div class="bg-slate-950/90 border border-slate-700/80 px-2.5 py-1 rounded shadow">
          <span class="text-[9px] font-mono font-bold text-slate-300 tracking-widest uppercase flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            PORTÓN CORRUGADO • ARRASTRA HACIA ARRIBA
          </span>
        </div>
        <span class="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          {{ theme === 'white-lab' ? 'ACERO ESMALTADO ASTM-A36' : 'TITANIO ASTM-B265' }}
        </span>
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center my-auto">
        <div class="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 via-[#10141e] to-slate-950 border-2 border-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center gap-2 group hover:border-cyan-500 transition cursor-grab active:cursor-grabbing">
          <div class="w-36 h-5 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 rounded border border-slate-400 shadow-md flex items-center justify-between px-2.5">
            <div class="w-2 h-2 rounded-full bg-slate-900" />
            <div class="w-12 h-2 bg-slate-900/80 rounded-sm flex items-center justify-center">
              <div class="w-8 h-0.5 bg-slate-400 rounded-full" />
            </div>
            <div class="w-2 h-2 rounded-full bg-slate-900" />
          </div>

          <div class="px-4 py-1.5 rounded bg-gradient-to-b from-slate-700 to-slate-800 text-slate-100 font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center gap-2 border border-slate-500">
            <svg class="w-3.5 h-3.5 text-cyan-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span>{{ isDragging ? 'ARRASTRANDO...' : (isOpen ? 'ARRASTRA PARA BAJAR ⯆' : 'ARRASTRA PARA SUBIR ⯅') }}</span>
          </div>

          <span class="text-[8px] font-mono text-cyan-300/80 font-bold">Haz clic y arrastra con el ratón hacia arriba/abajo</span>
        </div>
      </div>

      <div class="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span class="text-[8px] font-mono text-slate-500 font-bold uppercase">SISTEMA CORREDIZO</span>
        <div class="h-1.5 w-24 bg-slate-900 rounded-full border border-slate-800" />
        <span class="text-[8px] font-mono text-slate-500 font-bold uppercase">AIR GUARDIAN LAB</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.corrugated-metal-bay {
  background: repeating-linear-gradient(90deg, #0e1118 0px, #171c26 6px, #252c3b 12px, #151922 18px, #0c0e14 24px);
}
.corrugated-metal-white {
  background: repeating-linear-gradient(90deg, #cbd5e1 0px, #e2e8f0 6px, #f8fafc 12px, #e2e8f0 18px, #cbd5e1 24px);
}
</style>
