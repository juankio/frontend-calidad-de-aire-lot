<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="relative w-full overflow-hidden rounded-2xl bg-[#0c0e14] border-2 border-slate-800/80 shadow-[0_20px_40px_rgba(0,0,0,0.85)] select-none">
    <!-- Dintel Superior / Guía de Rodamiento del Portón -->
    <div class="h-6 bg-gradient-to-r from-slate-900 via-[#141824] to-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 relative">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="isOpen ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'" />
        <span class="text-[9px] font-mono text-slate-300 font-bold uppercase tracking-wider">
          PORTÓN BLINDADO • {{ isOpen ? 'ABIERTO / ACCESO TOTAL' : 'ENCLAVADO / PROTECCIÓN' }}
        </span>
      </div>
      <button 
        @click="emit('toggle')" 
        class="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border transition active:scale-95"
        :class="isOpen ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-cyan-950/80 border-cyan-700 text-cyan-300 hover:bg-cyan-900'"
      >
        {{ isOpen ? 'BAJAR PORTÓN ⯆' : 'LEVANTAR PORTÓN ⯅' }}
      </button>
    </div>

    <!-- Contenedor Interior (El Gabinete que se revela al subir el portón) -->
    <div class="relative w-full min-h-[480px] bg-[#0c0e14] p-4 sm:p-5 transition-opacity duration-500" :class="isOpen ? 'opacity-100' : 'opacity-20 pointer-events-none'">
      <!-- Tubo Fluorescente Superior -->
      <div class="w-full h-1.5 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 rounded-full mb-4 shadow-[0_0_15px_#38bdf8]" :class="isOpen ? 'opacity-100 animate-pulse' : 'opacity-10'" />
      
      <!-- Ranura de contenido interior (Repisas I, II, III) -->
      <slot />
    </div>

    <!-- EL PORTÓN METÁLICO CORRUGADO (Se desliza hacia arriba) -->
    <div 
      class="absolute inset-x-0 bottom-0 top-6 z-30 cursor-pointer transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="isOpen ? '-translate-y-[93%] shadow-2xl pointer-events-none' : 'translate-y-0 shadow-none'"
      @click="!isOpen && emit('toggle')"
    >
      <!-- Chapa Acanalada / Textura Titanio Corrugado Industrial -->
      <div class="w-full h-full relative border-t-2 border-slate-700/80 corrugated-metal flex flex-col justify-between p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
        <!-- Perfilería Metálica y Refuerzos Diagonales -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#475569" stroke-width="1.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#475569" stroke-width="1.5" />
          <line x1="0" y1="0" x2="100" y2="50" stroke="#334155" stroke-width="1" />
          <line x1="100" y1="50" x2="0" y2="100" stroke="#334155" stroke-width="1" />
          <line x1="0" y1="50" x2="100" y2="100" stroke="#334155" stroke-width="1" />
        </svg>

        <!-- Cabecera del Portón (Placas de Advertencia y Remaches) -->
        <div class="relative z-10 flex items-center justify-between">
          <div class="bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded shadow-md">
            <span class="text-[10px] font-mono font-black tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SENTINEL BIO-WORKSHOP • AIR LAB
            </span>
          </div>
          <span class="text-[9px] font-mono text-slate-400 bg-slate-950/90 px-2.5 py-1 rounded border border-slate-800">
            TITANIO ASTM-B265
          </span>
        </div>

        <!-- Centro del Portón: Cerrojo / Pasador de Seguridad con Manija -->
        <div class="relative z-10 flex flex-col items-center justify-center my-auto">
          <div class="p-4 rounded-xl bg-gradient-to-b from-slate-900 via-[#10141e] to-slate-950 border-2 border-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center gap-2.5 group hover:border-cyan-500/70 transition">
            <!-- Pasador corredizo metálico -->
            <div class="w-32 h-6 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 rounded border border-slate-500 shadow-md flex items-center justify-between px-2.5">
              <div class="w-2 h-2 rounded-full bg-slate-900" />
              <div class="w-8 h-3 bg-slate-900 rounded-sm" />
              <div class="w-2 h-2 rounded-full bg-slate-900" />
            </div>

            <!-- Manija de Agarre para levantar -->
            <button 
              @click.stop="emit('toggle')"
              class="px-5 py-2 rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 hover:from-cyan-700 hover:to-cyan-900 text-slate-100 font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg active:scale-95 transition flex items-center gap-2 border border-slate-500 hover:border-cyan-400"
            >
              <span>{{ isOpen ? '🔽 BAJAR PORTÓN' : '🔼 LEVANTAR PORTÓN' }}</span>
            </button>
            <span class="text-[8px] font-mono text-slate-400">Presiona para desacoplar el blindaje</span>
          </div>
        </div>

        <!-- Base Inferior del Portón con Tirador de Goma -->
        <div class="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span class="text-[9px] font-mono text-slate-500 font-bold uppercase">BLINDAJE NIVEL 3</span>
          <div class="h-2 w-32 bg-slate-950 rounded-full border border-slate-800 mx-auto" />
          <span class="text-[9px] font-mono text-slate-500 font-bold uppercase">ESP32-S3 IOT</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.corrugated-metal {
  background: repeating-linear-gradient(
    90deg,
    #0e1118 0px,
    #171c26 6px,
    #252c3b 12px,
    #151922 18px,
    #0c0e14 24px
  );
}
</style>
