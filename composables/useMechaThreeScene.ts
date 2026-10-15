import { ref } from 'vue'
import * as THREE from 'three'
import { stepMechaFrame } from '~/utils/mecha3d/animator'
import { createParticles, setupLightsAndGrid } from '~/utils/mecha3d/particlesAndLights'
import { applyClamshellDistance, loadChassisStls, syncFrontShellAppearance } from '~/utils/mecha3d/stlLoader'
import { createInitialMechaContext, type MechaSceneOptions } from '~/utils/mecha3d/types'

export type { MechaSceneOptions }

export function useMechaThreeScene() {
  const isLoading = ref(true)
  const loadProgress = ref(0)
  const hasError = ref(false)
  const errorMessage = ref('')

  const ctx = createInitialMechaContext()
  let animId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  function onPointerDown(e: MouseEvent | TouchEvent) {
    ctx.isDragging = true
    ctx.prevPointerX = 'touches' in e ? e.touches[0].clientX : e.clientX
    ctx.prevPointerY = 'touches' in e ? e.touches[0].clientY : e.clientY
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!ctx.isDragging) return
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaX = cx - ctx.prevPointerX
    const deltaY = cy - ctx.prevPointerY
    ctx.prevPointerX = cx
    ctx.prevPointerY = cy
    ctx.targetRotationY += deltaX * 0.008
    ctx.targetRotationX = Math.max(-0.85, Math.min(0.85, ctx.targetRotationX + deltaY * 0.008))
  }

  function onPointerUp() {
    ctx.isDragging = false
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    ctx.targetCameraDistance = Math.max(95, Math.min(310, ctx.targetCameraDistance + e.deltaY * 0.14))
  }

  function animate() {
    animId = requestAnimationFrame(animate)
    stepMechaFrame(ctx)
  }

  function handleResize() {
    if (!ctx.container || !ctx.camera || !ctx.renderer) return
    const width = ctx.container.clientWidth || 300
    const height = ctx.container.clientHeight || 300
    ctx.camera.aspect = width / height
    ctx.camera.updateProjectionMatrix()
    ctx.renderer.setSize(width, height)
  }

  function init(targetContainer: HTMLElement, options: MechaSceneOptions = {}) {
    if (typeof window === 'undefined') return
    ctx.container = targetContainer
    ctx.options = { ...ctx.options, ...options, autoRotate: options.autoRotate ?? false }

    const width = ctx.container.clientWidth || 300
    const height = ctx.container.clientHeight || 300
    ctx.scene = new THREE.Scene()

    const fov = ctx.options.compact ? 42 : 45
    ctx.camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000)
    ctx.targetCameraDistance = ctx.options.compact ? 176 : 172
    ctx.cameraDistance = ctx.targetCameraDistance
    ctx.camera.position.set(0, 10, ctx.cameraDistance)
    ctx.camera.lookAt(0, 4, 0)

    ctx.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    ctx.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    ctx.renderer.setSize(width, height)
    ctx.renderer.toneMapping = THREE.ACESFilmicToneMapping
    ctx.renderer.toneMappingExposure = 1.22
    ctx.container.innerHTML = ''
    ctx.container.appendChild(ctx.renderer.domElement)

    ctx.visorPointLight = setupLightsAndGrid(ctx.scene, ctx.options)

    ctx.rootGroup = new THREE.Group()
    ctx.assemblyGroup = new THREE.Group()
    ctx.mechaPivotGroup = new THREE.Group()
    ctx.scene.add(ctx.rootGroup)
    ctx.rootGroup.add(ctx.assemblyGroup)
    ctx.assemblyGroup.add(ctx.mechaPivotGroup)

    ctx.particles = createParticles(ctx.rootGroup)

    isLoading.value = true
    loadChassisStls(ctx, (pct) => { loadProgress.value = pct })
      .then(() => { isLoading.value = false })
      .catch((err: unknown) => {
        hasError.value = true
        errorMessage.value = err instanceof Error ? err.message : String(err)
        isLoading.value = false
      })

    ctx.container.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
    ctx.container.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp, { passive: true })
    ctx.container.addEventListener('wheel', onWheel, { passive: false })

    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ctx.container)
    animate()
  }

  function resetCamera() {
    ctx.targetRotationX = 0
    ctx.targetRotationY = 0
    ctx.targetCameraDistance = ctx.options.compact ? 176 : 172
  }

  function updateOptions(options: Partial<MechaSceneOptions>) {
    ctx.options = { ...ctx.options, ...options }
    if (options.wireframe !== undefined || options.xray !== undefined) {
      syncFrontShellAppearance(ctx)
      if (ctx.backMaterial && options.wireframe !== undefined) {
        ctx.backMaterial.wireframe = Boolean(options.wireframe)
        ctx.backMaterial.needsUpdate = true
      }
      if (ctx.visorMaterial && options.wireframe !== undefined) {
        ctx.visorMaterial.wireframe = Boolean(options.wireframe)
        ctx.visorMaterial.needsUpdate = true
      }
    }
    if (options.clamshellDistance !== undefined) {
      applyClamshellDistance(ctx, options.clamshellDistance)
    }
  }

  function dispose() {
    if (animId !== null) cancelAnimationFrame(animId)
    animId = null
    resizeObserver?.disconnect()
    resizeObserver = null

    ctx.container?.removeEventListener('mousedown', onPointerDown)
    ctx.container?.removeEventListener('touchstart', onPointerDown)
    ctx.container?.removeEventListener('wheel', onWheel)
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
    }

    ctx.screenTexture?.dispose()
    ctx.meshGrillTexture?.dispose()
    ctx.dhtGrillTexture?.dispose()

    ctx.scene?.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material?.dispose()
      }
    })
    ctx.scene?.clear()
    ctx.renderer?.dispose()
    ctx.renderer?.domElement?.parentElement?.removeChild(ctx.renderer.domElement)
    Object.assign(ctx, createInitialMechaContext())
  }

  return { isLoading, loadProgress, hasError, errorMessage, init, updateOptions, resetCamera, dispose }
}
