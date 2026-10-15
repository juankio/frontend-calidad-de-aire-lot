import * as THREE from 'three'
import { resolveEnergyColor } from './materials'
import type { MechaParticleState, MechaSceneContext, MechaSceneOptions } from './types'

export const PARTICLE_COUNT = 150

export function setupLightsAndGrid(scene: THREE.Scene, options: MechaSceneOptions): THREE.PointLight {
  const ambientLight = new THREE.AmbientLight(0xe2e8f0, 1.05)
  const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.3)
  mainDirLight.position.set(55, 85, 95)

  const frontKeyLight = new THREE.DirectionalLight(0xe0f2fe, 1.9)
  frontKeyLight.position.set(0, 25, 150)

  const rimDirLight = new THREE.DirectionalLight(0x38bdf8, 1.8)
  rimDirLight.position.set(-85, 50, -65)

  const fillDirLight = new THREE.DirectionalLight(0xf97316, 1.25)
  fillDirLight.position.set(75, -35, -55)

  const initialColor = resolveEnergyColor(
    options.deviceEmotion || options.riskStatus,
    options.ppm,
    options.isShaking
  )
  const visorPointLight = new THREE.PointLight(initialColor, 2.2, 130)
  visorPointLight.position.set(0, 12, 26)

  scene.add(ambientLight, mainDirLight, frontKeyLight, rimDirLight, fillDirLight, visorPointLight)
  return visorPointLight
}

export function createParticles(rootGroup: THREE.Group): MechaParticleState {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const angles = new Float32Array(PARTICLE_COUNT)
  const radii = new Float32Array(PARTICLE_COUNT)
  const heights = new Float32Array(PARTICLE_COUNT)
  const speeds = new Float32Array(PARTICLE_COUNT)
  const liftSpeeds = new Float32Array(PARTICLE_COUNT)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 34 + Math.random() * 54
    const height = -45 + Math.random() * 95
    const speed = 0.01 + Math.random() * 0.02
    const lift = 0.16 + Math.random() * 0.32

    angles[i] = angle
    radii[i] = radius
    heights[i] = height
    speeds[i] = speed
    liftSpeeds[i] = lift

    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = height
    positions[i * 3 + 2] = Math.sin(angle) * radius
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0x10b981,
    size: 2.5,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const mesh = new THREE.Points(geometry, material)
  rootGroup.add(mesh)

  return {
    mesh,
    material,
    positions,
    angles,
    radii,
    heights,
    speeds,
    liftSpeeds
  }
}

export function updateParticles(ctx: MechaSceneContext): void {
  const p = ctx.particles
  if (!p) return

  const ppmVal = ctx.options.ppm ?? 420
  const speedMultiplier = Math.max(0.6, Math.min(4.2, (ppmVal / 400) * 1.25))

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    p.angles[i] += p.speeds[i] * speedMultiplier
    p.heights[i] += p.liftSpeeds[i] * speedMultiplier

    if (p.heights[i] > 65) {
      p.heights[i] = -55
    }

    p.positions[i * 3] = Math.cos(p.angles[i]) * p.radii[i]
    p.positions[i * 3 + 1] = p.heights[i]
    p.positions[i * 3 + 2] = Math.sin(p.angles[i]) * p.radii[i]
  }

  p.mesh.geometry.attributes.position.needsUpdate = true

  const targetColor = resolveEnergyColor(
    ctx.options.deviceEmotion || ctx.options.riskStatus,
    ppmVal,
    ctx.options.isShaking
  )
  p.material.color.lerp(targetColor, 0.08)
  if (ctx.visorMaterial) {
    ctx.visorMaterial.emissive.lerp(targetColor, 0.08)
  }
  if (ctx.visorPointLight) {
    ctx.visorPointLight.color.lerp(targetColor, 0.08)
  }
}
