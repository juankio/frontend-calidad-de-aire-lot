import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { buildElectronicsGroup } from './boardModules'
import { resolveEnergyColor } from './materials'
import type { MechaSceneContext } from './types'

export function syncFrontShellAppearance(ctx: MechaSceneContext): void {
  const d = Math.max(0, Math.min(ctx.options.clamshellDistance ?? 0, 60))
  const isXray = Boolean(ctx.options.xray)
  const showInternalPcbs = isXray || d >= 1

  for (const obj of ctx.internalPcbList) {
    obj.visible = showInternalPcbs
  }

  if (!ctx.frontMaterial) return
  const shouldConfigureTransparency = isXray || d > 4

  ctx.frontMaterial.wireframe = Boolean(ctx.options.wireframe)
  ctx.frontMaterial.transparent = shouldConfigureTransparency
  ctx.frontMaterial.opacity = isXray ? 0.24 : 1.0
  ctx.frontMaterial.depthWrite = !isXray
  ctx.frontMaterial.needsUpdate = true
}

export function applyClamshellDistance(ctx: MechaSceneContext, dist: number): void {
  if (!ctx.frontMesh || !ctx.backMesh || !ctx.visorMesh) return
  const d = Math.max(0, Math.min(dist, 60))

  ctx.frontMesh.position.set(0, 0, 0)
  ctx.frontMesh.rotation.set(0, 0, 0)

  ctx.visorMesh.position.set(0, 12, -1.6 - d * 0.55)

  ctx.backMesh.position.set(0, 0, 42 + d * 0.9)
  ctx.backMesh.rotation.set(0, Math.PI, 0)

  if (ctx.screenMesh) {
    ctx.screenMesh.position.set(0, 12, -0.35 - d * 0.25)
  }

  if (ctx.esp32Group) {
    ctx.esp32Group.position.set(0, -6.0, 31.0 + d * 0.65)
  }

  syncFrontShellAppearance(ctx)
}

export async function loadChassisStls(
  ctx: MechaSceneContext,
  onProgress: (pct: number) => void
): Promise<void> {
  const loader = new STLLoader()
  const models = [
    { url: '/models/cyber_mecha_front.stl', key: 'front' },
    { url: '/models/cyber_mecha_back.stl', key: 'back' },
    { url: '/models/cyber_mecha_visor.stl', key: 'visor' }
  ]

  let completed = 0

  const loadPromise = (item: { url: string; key: string }) => {
    return new Promise<THREE.BufferGeometry>((resolve, reject) => {
      loader.load(
        item.url,
        (geometry) => {
          geometry.computeVertexNormals()
          completed++
          onProgress(Math.round((completed / models.length) * 100))
          resolve(geometry)
        },
        undefined,
        (err) => reject(err)
      )
    })
  }

  const [frontGeom, backGeom, visorGeom] = await Promise.all(models.map(loadPromise))

  ctx.frontMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.45,
    roughness: 0.38,
    wireframe: Boolean(ctx.options.wireframe)
  })
  ctx.frontMesh = new THREE.Mesh(frontGeom, ctx.frontMaterial)
  ctx.frontMesh.position.set(0, 0, 0)
  ctx.frontMesh.rotation.set(0, 0, 0)

  ctx.backMaterial = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    metalness: 0.2,
    roughness: 0.45,
    wireframe: Boolean(ctx.options.wireframe)
  })
  ctx.backMesh = new THREE.Mesh(backGeom, ctx.backMaterial)
  ctx.backMesh.rotation.set(0, Math.PI, 0)
  ctx.backMesh.position.set(0, 0, 42)

  const statusColor = resolveEnergyColor(
    ctx.options.deviceEmotion || ctx.options.riskStatus,
    ctx.options.ppm,
    ctx.options.isShaking
  )
  ctx.visorMaterial = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: statusColor,
    emissiveIntensity: 0.45,
    roughness: 0.28,
    metalness: 0.25,
    wireframe: Boolean(ctx.options.wireframe)
  })
  ctx.visorMesh = new THREE.Mesh(visorGeom, ctx.visorMaterial)
  ctx.visorMesh.position.set(0, 12, -1.6)

  ctx.electronicsGroup = buildElectronicsGroup(ctx)

  ctx.subAssemblyGroup = new THREE.Group()
  ctx.subAssemblyGroup.rotation.y = Math.PI
  ctx.subAssemblyGroup.position.set(0, 0, 18)

  ctx.subAssemblyGroup.add(ctx.frontMesh, ctx.backMesh, ctx.visorMesh, ctx.electronicsGroup)
  if (ctx.screenMesh) {
    ctx.subAssemblyGroup.add(ctx.screenMesh)
  }

  if (ctx.mechaPivotGroup) {
    ctx.mechaPivotGroup.add(ctx.subAssemblyGroup)
  }

  syncFrontShellAppearance(ctx)
  applyClamshellDistance(ctx, ctx.options.clamshellDistance ?? 0)
}
