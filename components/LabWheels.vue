<script setup lang="ts">
defineProps<{
  locked?: boolean
}>()
</script>

<template>
  <div class="relative w-full px-6 pt-2 pb-6 select-none">
    <!-- Reflejo y Sombra de Contacto sobre el Piso de Laboratorio -->
    <div class="absolute inset-x-8 bottom-3 h-4 bg-black/70 blur-md rounded-full pointer-events-none"></div>
    <div class="absolute inset-x-14 bottom-2 h-1.5 bg-neutral-950 blur-[2px] rounded-full pointer-events-none"></div>

    <!-- Estructura de 4 Ruedas de Laboratorio -->
    <div class="relative flex justify-between items-center max-w-5xl mx-auto z-10 px-4 sm:px-8">
      <div v-for="i in 4" :key="i" class="group relative flex flex-col items-center">
        <!-- Pletina de Montaje de Acero Inoxidable -->
        <div class="w-10 h-2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-sm border-t border-x border-slate-300 shadow-sm flex justify-around items-center px-1">
          <span class="w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
          <span class="w-1 h-1 rounded-full bg-slate-700 shadow-inner"></span>
        </div>

        <!-- Horquilla de Giro 360° con Rodamiento Central -->
        <div class="w-8 h-4 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-x border-slate-400 flex items-center justify-center relative shadow-sm">
          <div class="w-2 h-2 rounded-full bg-slate-600 border border-slate-400 shadow-inner"></div>
          
          <!-- Pedal de Freno Rojo Industrial (Bioquímica.cl Style) -->
          <div 
            class="absolute -right-3.5 -top-1 px-1 py-0.5 rounded-[2px] bg-red-600 hover:bg-red-500 border border-red-800 shadow-sm flex items-center justify-center transform -rotate-12 transition-all group-hover:scale-110 cursor-pointer"
            :title="locked ? 'Freno de Seguridad Activado' : 'Pedal de Bloqueo Mecánico'"
          >
            <span class="text-[6px] font-mono font-black text-white tracking-tighter uppercase leading-none">STOP</span>
          </div>
        </div>

        <!-- Rueda de Poliuretano Antiestática con Rin Metálico Cromado -->
        <div class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-900 border-2 border-slate-400 shadow-xl flex items-center justify-center ring-2 ring-neutral-950">
          <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-500 border border-slate-600 shadow-inner flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-400 shadow-sm"></div>
          </div>
          <!-- Banda de Rodadura Antideslizante -->
          <div class="absolute inset-0 rounded-full border border-dashed border-neutral-600/40 pointer-events-none"></div>
        </div>

        <!-- Sombra de Piso de la Rueda -->
        <div class="w-9 h-1 bg-black/80 blur-[1.5px] rounded-full mt-0.5"></div>
      </div>
    </div>
  </div>
</template>
