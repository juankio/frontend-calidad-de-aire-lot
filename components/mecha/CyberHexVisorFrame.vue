<script setup lang="ts">
defineProps<{
  primaryColor: string
  secondaryColor: string
}>()
</script>

<template>
  <svg class="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" viewBox="0 0 300 300">
    <defs>
      <!-- Gradiente de titanio grafito para el bisel mecha -->
      <linearGradient id="mecha-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="45%" stop-color="#0f172a" />
        <stop offset="85%" stop-color="#020617" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>

      <!-- Gradiente dinámico de energía HUD -->
      <linearGradient id="mecha-energy" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="primaryColor" />
        <stop offset="100%" :stop-color="secondaryColor" />
      </linearGradient>

      <!-- Resplandor cibernético del visor -->
      <filter id="mecha-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Apertura circular táctica para la pantalla / modelo 3D central -->
      <mask id="mecha-bezel-aperture">
        <rect width="300" height="300" fill="white" />
        <circle cx="150" cy="150" r="116" fill="black" />
      </mask>
    </defs>

    <!-- 1. Estructura Exterior Hexagonal del Visor Mecha (Bisel con apertura central) -->
    <g mask="url(#mecha-bezel-aperture)">
      <polygon points="292,150 221,273 79,273 8,150 79,27 221,27" fill="url(#mecha-bevel)" stroke="#1e293b" stroke-width="3" />
      <polygon points="284,150 216,266 84,266 16,150 84,34 216,34" fill="#050811" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.2" />
    </g>

    <!-- Muescas de fijación mecha en los 6 vértices -->
    <g v-for="(pt, i) in [{x:284,y:150},{x:216,y:266},{x:84,y:266},{x:16,y:150},{x:84,y:34},{x:216,y:34}]" :key="i">
      <circle :cx="pt.x" :cy="pt.y" r="4.5" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <circle :cx="pt.x" :cy="pt.y" r="1.5" :fill="primaryColor" />
    </g>

    <!-- 2. Arcos de Energía SVG Reactivos con el color del riesgo -->
    <path d="M 100 24 L 200 24" fill="none" stroke="url(#mecha-energy)" stroke-width="2.5" stroke-linecap="round" filter="url(#mecha-glow)" />
    <path d="M 100 276 L 200 276" fill="none" stroke="url(#mecha-energy)" stroke-width="2.5" stroke-linecap="round" filter="url(#mecha-glow)" />
    <path d="M 18 140 L 18 160" fill="none" stroke="url(#mecha-energy)" stroke-width="3" stroke-linecap="round" />
    <path d="M 282 140 L 282 160" fill="none" stroke="url(#mecha-energy)" stroke-width="3" stroke-linecap="round" />

    <!-- 3. Anillos Holográficos HUD Giratorios (Orbit Ring & Radar Ticks) -->
    <g class="hud-orbit-ring" transform-origin="150 150">
      <circle cx="150" cy="150" r="126" fill="none" :stroke="primaryColor" stroke-width="1.2" stroke-dasharray="8, 14" opacity="0.65" />
      <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.75" stroke-dasharray="2, 6" />
    </g>

    <!-- Anillo interior con contra-rotación -->
    <g class="hud-orbit-reverse" transform-origin="150 150">
      <circle cx="150" cy="150" r="118" fill="none" :stroke="secondaryColor" stroke-width="1.5" stroke-dasharray="32, 58" opacity="0.8" />
    </g>

    <!-- Marcadores cardinales mecha (0°, 90°, 180°, 270°) -->
    <line x1="150" y1="20" x2="150" y2="30" :stroke="primaryColor" stroke-width="1.5" />
    <line x1="150" y1="270" x2="150" y2="280" :stroke="primaryColor" stroke-width="1.5" />
    <line x1="20" y1="150" x2="30" y2="150" :stroke="primaryColor" stroke-width="1.5" />
    <line x1="270" y1="150" x2="280" y2="150" :stroke="primaryColor" stroke-width="1.5" />

    <!-- Reflejo óptico angular sci-fi -->
    <polygon points="80,38 220,38 180,95 65,95" fill="rgba(255, 255, 255, 0.04)" />
  </svg>
</template>

<style scoped>
@keyframes hud-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes hud-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.hud-orbit-ring {
  animation: hud-spin 22s linear infinite;
}
.hud-orbit-reverse {
  animation: hud-spin-reverse 16s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hud-orbit-ring,
  .hud-orbit-reverse {
    animation: none;
  }
}
</style>