<script setup lang="ts">
import { Sparkles, MessageSquareQuote } from 'lucide-vue-next'
import LabScrew from '~/components/madlab/LabScrew.vue'

defineProps<{
  h: number
  eulerMae: number
  rk4Mae: number
}>()
</script>

<template>
  <div class="relative rounded-2xl p-3.5 bg-gradient-to-b from-[#18120b] to-[#0a0704] border-2 border-[#854d0e]/70 space-y-2 shadow-md">
    <LabScrew class="absolute bottom-2 right-2" :rotation="22" />

    <div class="flex items-center justify-between border-b border-white/10 pb-1">
      <div class="flex items-center gap-1.5 font-mono font-bold text-xs text-[#fbbf24]">
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        <span>Diagnóstico Numérico en Tiempo Real</span>
      </div>
      <span class="text-[8.5px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-black/60 border border-amber-800/50">
        Paso h = {{ h.toFixed(2) }} min
      </span>
    </div>

    <p class="font-mono text-stone-300 text-[10.5px] leading-relaxed">
      Miren el salto de precisión. Con un paso h = {{ h.toFixed(2) }} min, Euler se desfasa {{ eulerMae.toFixed(2) }} PPM de media porque trunca en primer orden. RK4, en cambio, promedia cuatro pendientes intermedias con la regla de Simpson y tumba el error medio a apenas {{ rk4Mae.toFixed(4) }} PPM. Una diferencia abismal.
    </p>

    <div class="p-2.5 rounded-xl bg-black/70 border border-amber-700/40 flex items-start gap-2 font-mono text-[9px] text-amber-200">
      <MessageSquareQuote class="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
      <div>
        <strong class="text-[#fbbf24] block font-mono text-[10px]">Argumento para el Profesor de Análisis Numérico:</strong>
        "Profe, fíjese en el orden de convergencia: si partimos el paso h a la mitad, el error de Euler apenas baja a la mitad (O(h)), mientras que en RK4 el error se desploma por un factor de 2⁴ = 16 (O(h⁴)). Por eso RK4 no tiene rival para integrar series temporales continuas."
      </div>
    </div>
  </div>
</template>
