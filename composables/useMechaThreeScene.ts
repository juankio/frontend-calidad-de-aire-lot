import { ref, type Ref } from 'vue'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

export interface MechaSceneOptions {
  wireframe?: boolean
  clamshellDistance?: number
  compact?: boolean
  ppm?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING'
  pitch?: number
  roll?: number
  ax?: number
  ay?: number
  az?: number
  autoRotate?: boolean
}

const PARTICLE_COUNT = 150

export function useMechaThreeScene() {
  const isLoading = ref(true)
  const loadProgress = ref(0)
  const hasError = ref(false)
  const errorMessage = ref('')

  let container: HTMLElement | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let animId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  // Grupos estructurales
  let rootGroup: THREE.Group | null = null
  let imuGroup: THREE.Group | null = null
  let mechaPivotGroup: THREE.Group | null = null
  let subAssemblyGroup: THREE.Group | null = null

  // Meshes y partes
  let frontMesh: THREE.Mesh | null = null
  let backMesh: THREE.Mesh | null = null
  let visorMesh: THREE.Mesh | null = null

  // Materiales PBR
  let frontMaterial: THREE.MeshStandardMaterial | null = null
  let backMaterial: THREE.MeshStandardMaterial | null = null
  let visorMaterial: THREE.MeshStandardMaterial | null = null

  // Luces dinámicas
  let visorPointLight: THREE.PointLight | null = null

  // Partículas de vórtice
  let particlesMesh: THREE.Points | null = null
  let particleMaterial: THREE.PointsMaterial | null = null
  let particlePositions: Float32Array | null = null
  let particleAngles: Float32Array | null = null
  let particleRadii: Float32Array | null = null
  let particleHeights: Float32Array | null = null
  let particleSpeeds: Float32Array | null = null
  let particleLiftSpeeds: Float32Array | null = null

  // Variables de control de cámara e interacción
  let isDragging = false
  let prevPointerX = 0
  let prevPointerY = 0
  let targetRotationY = 0
  let targetRotationX = 0
  let currentRotationY = 0
  let currentRotationX = 0
  let lastUserInteractionTime = Date.now()
  let cameraDistance = 180
  let targetCameraDistance = 180

  // Estado inercial y opciones actuales
  let currentOptions: MechaSceneOptions = {
    wireframe: false,
    clamshellDistance: 0,
    compact: false,
    ppm: 420,
    riskStatus: 'OPTIMAL',
    pitch: 0,
    roll: 0,
    autoRotate: true
  }

  function getStatusColor(status?: string, ppmVal: number = 420): THREE.Color {
    if (status === 'CRITICAL' || ppmVal >= 1100) return new THREE.Color(0xef4444)
    if (status === 'WARNING_PREDICTIVE' || ppmVal >= 750) return new THREE.Color(0xf59e0b)
    if (status === 'RECOVERY') return new THREE.Color(0x38bdf8)
    if (status === 'SLEEPING') return new THREE.Color(0x475569)
    return new THREE.Color(0x06b6d4)
  }

  function setupParticles() {
    particlePositions = new Float32Array(PARTICLE_COUNT * 3)
    particleAngles = new Float32Array(PARTICLE_COUNT)
    particleRadii = new Float32Array(PARTICLE_COUNT)
    particleHeights = new Float32Array(PARTICLE_COUNT)
    particleSpeeds = new Float32Array(PARTICLE_COUNT)
    particleLiftSpeeds = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 28 + Math.random() * 55
      const height = -45 + Math.random() * 95
      const speed = 0.012 + Math.random() * 0.022
      const lift = 0.18 + Math.random() * 0.35

      particleAngles[i] = angle
      particleRadii[i] = radius
      particleHeights[i] = height
      particleSpeeds[i] = speed
      particleLiftSpeeds[i] = lift

      particlePositions[i * 3] = Math.cos(angle) * radius
      particlePositions[i * 3 + 1] = height
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    particleMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 2.8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    particlesMesh = new THREE.Points(geometry, particleMaterial)
    if (rootGroup) rootGroup.add(particlesMesh)
  }

  async function loadMechaSTL(): Promise<void> {
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
            loadProgress.value = Math.round((completed / models.length) * 100)
            resolve(geometry)
          },
          undefined,
          (err) => reject(err)
        )
      })
    }

    const [frontGeom, backGeom, visorGeom] = await Promise.all(models.map(loadPromise))

    // 1. Frente: Aleación titanio oscura
    frontMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.82,
      roughness: 0.32,
      wireframe: !!currentOptions.wireframe
    })
    frontMesh = new THREE.Mesh(frontGeom, frontMaterial)

    // 2. Espalda: Armadura Mecha naranja óxido con QR grabado
    backMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      metalness: 0.4,
      roughness: 0.45,
      wireframe: !!currentOptions.wireframe
    })
    backMesh = new THREE.Mesh(backGeom, backMaterial)
    backMesh.rotation.y = Math.PI
    backMesh.position.set(0, 0, 42)

    // 3. Visor: Emisivo neón reactivo
    const statusColor = getStatusColor(currentOptions.riskStatus, currentOptions.ppm)
    visorMaterial = new THREE.MeshStandardMaterial({
      color: statusColor,
      emissive: statusColor,
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.1,
      wireframe: !!currentOptions.wireframe
    })
    visorMesh = new THREE.Mesh(visorGeom, visorMaterial)
    visorMesh.position.set(0, 12, -1.5)

    // Sub-ensamble para orientación y pivote
    subAssemblyGroup = new THREE.Group()
    subAssemblyGroup.add(frontMesh, backMesh, visorMesh)
    subAssemblyGroup.rotation.y = Math.PI
    // Desplazamiento centroidal exacto calculado
    subAssemblyGroup.position.set(0, -0.5, 22.32)

    if (mechaPivotGroup) {
      mechaPivotGroup.add(subAssemblyGroup)
    }

    applyClamshellDistance(currentOptions.clamshellDistance ?? 0)
  }

  function applyClamshellDistance(dist: number) {
    if (!frontMesh || !backMesh || !visorMesh) return
    const d = Math.max(0, Math.min(dist, 60))
    // Frente avanza en Z local
    frontMesh.position.set(0, 0, -d * 0.5)
    // Visor proyecta por delante del frente
    visorMesh.position.set(0, 12, -1.5 - d * 0.75)
    // Espalda retrocede en Z local
    backMesh.position.set(0, 0, 42 + d * 0.5)
  }

  function onPointerDown(e: MouseEvent | TouchEvent) {
    isDragging = true
    lastUserInteractionTime = Date.now()
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
    prevPointerX = cx
    prevPointerY = cy
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return
    lastUserInteractionTime = Date.now()
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaX = cx - prevPointerX
    const deltaY = cy - prevPointerY
    prevPointerX = cx
    prevPointerY = cy

    targetRotationY += deltaX * 0.008
    targetRotationX = Math.max(-0.85, Math.min(0.85, targetRotationX + deltaY * 0.008))
  }

  function onPointerUp() {
    isDragging = false
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    lastUserInteractionTime = Date.now()
    targetCameraDistance = Math.max(90, Math.min(320, targetCameraDistance + e.deltaY * 0.15))
  }

  function renderLoop() {
    animId = requestAnimationFrame(renderLoop)

    const now = Date.now()
    const idleTime = now - lastUserInteractionTime

    // Auto-rotación inactiva suave después de 1.8 segundos
    if (!isDragging && currentOptions.autoRotate !== false && idleTime > 1800) {
      targetRotationY += 0.006
    }

    // Suavizado inercial de rotación de usuario
    currentRotationY += (targetRotationY - currentRotationY) * 0.1
    currentRotationX += (targetRotationX - currentRotationX) * 0.1

    if (mechaPivotGroup) {
      mechaPivotGroup.rotation.y = currentRotationY
      mechaPivotGroup.rotation.x = currentRotationX
    }

    // Horizonte artificial / Inclinación inercial IMU
    if (imuGroup) {
      let targetPitch = 0
      let targetRoll = 0

      if (currentOptions.pitch !== undefined && currentOptions.roll !== undefined) {
        targetPitch = (currentOptions.pitch * Math.PI) / 180
        targetRoll = (currentOptions.roll * Math.PI) / 180
      } else if (
        currentOptions.ax !== undefined &&
        currentOptions.ay !== undefined &&
        currentOptions.az !== undefined
      ) {
        const ax = currentOptions.ax
        const ay = currentOptions.ay
        const az = currentOptions.az || 9.8
        targetPitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az))
        targetRoll = Math.atan2(ay, az)
      }

      imuGroup.rotation.x += (targetPitch - imuGroup.rotation.x) * 0.08
      imuGroup.rotation.z += (targetRoll - imuGroup.rotation.z) * 0.08
    }

    // Zoom suave
    cameraDistance += (targetCameraDistance - cameraDistance) * 0.1
    if (camera) {
      camera.position.z = cameraDistance
      camera.lookAt(0, 0, 0)
    }

    // Animación de partículas de vórtice
    if (
      particlesMesh &&
      particlePositions &&
      particleAngles &&
      particleRadii &&
      particleHeights &&
      particleSpeeds &&
      particleLiftSpeeds
    ) {
      const ppmVal = currentOptions.ppm ?? 420
      const speedMultiplier = Math.max(0.6, Math.min(4.5, (ppmVal / 400) * 1.3))

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particleAngles[i] += particleSpeeds[i] * speedMultiplier
        particleHeights[i] += particleLiftSpeeds[i] * speedMultiplier

        if (particleHeights[i] > 65) {
          particleHeights[i] = -55
        }

        particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i]
        particlePositions[i * 3 + 1] = particleHeights[i]
        particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i]
      }

      const geom = particlesMesh.geometry as THREE.BufferGeometry
      geom.attributes.position.needsUpdate = true

      // Actualizar color y resplandor
      const targetColor = getStatusColor(currentOptions.riskStatus, ppmVal)
      if (particleMaterial) {
        particleMaterial.color.lerp(targetColor, 0.05)
      }
      if (visorMaterial) {
        visorMaterial.color.lerp(targetColor, 0.05)
        visorMaterial.emissive.lerp(targetColor, 0.05)
      }
      if (visorPointLight) {
        visorPointLight.color.lerp(targetColor, 0.05)
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  function handleResize() {
    if (!container || !camera || !renderer) return
    const width = container.clientWidth || 300
    const height = container.clientHeight || 300
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  function init(targetContainer: HTMLElement, options: MechaSceneOptions = {}) {
    if (typeof window === 'undefined') return
    container = targetContainer
    currentOptions = { ...currentOptions, ...options }

    const width = container.clientWidth || 300
    const height = container.clientHeight || 300

    // 1. Escena y Niebla suave
    scene = new THREE.Scene()

    // 2. Cámara
    const fov = currentOptions.compact ? 42 : 45
    camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000)
    targetCameraDistance = currentOptions.compact ? 175 : 170
    cameraDistance = targetCameraDistance
    camera.position.set(0, 8, cameraDistance)
    camera.lookAt(0, 0, 0)

    // 3. Renderer WebGL
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 4. Luces Tácticas PBR
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.85)
    const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.2)
    mainDirLight.position.set(60, 90, 80)
    const frontKeyLight = new THREE.DirectionalLight(0xe0f2fe, 1.8)
    frontKeyLight.position.set(0, 30, 140)
    const rimDirLight = new THREE.DirectionalLight(0x06b6d4, 2.0)
    rimDirLight.position.set(-80, 50, -60)
    const fillDirLight = new THREE.DirectionalLight(0xfb923c, 1.2)
    fillDirLight.position.set(70, -40, -50)

    const initialColor = getStatusColor(currentOptions.riskStatus, currentOptions.ppm)
    visorPointLight = new THREE.PointLight(initialColor, 2.8, 140)
    visorPointLight.position.set(0, 12, 22)

    scene.add(ambientLight, mainDirLight, frontKeyLight, rimDirLight, fillDirLight, visorPointLight)

    // 5. Estructura de Grupos
    rootGroup = new THREE.Group()
    imuGroup = new THREE.Group()
    mechaPivotGroup = new THREE.Group()

    scene.add(rootGroup)
    rootGroup.add(imuGroup)
    imuGroup.add(mechaPivotGroup)

    // 6. Vórtice de partículas
    setupParticles()

    // 7. Carga de modelos STL
    isLoading.value = true
    loadMechaSTL()
      .then(() => {
        isLoading.value = false
      })
      .catch((err) => {
        console.error('Error cargando STLs de Cyber Mecha:', err)
        hasError.value = true
        errorMessage.value = String(err?.message || err)
        isLoading.value = false
      })

    // 8. Event listeners
    container.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    container.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp, { passive: true })

    container.addEventListener('wheel', onWheel, { passive: false })

    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Iniciar bucle
    renderLoop()
  }

  function resetCamera() {
    targetRotationX = 0
    targetRotationY = 0
    targetCameraDistance = currentOptions.compact ? 220 : 180
    lastUserInteractionTime = Date.now()
  }

  function updateOptions(options: Partial<MechaSceneOptions>) {
    currentOptions = { ...currentOptions, ...options }

    if (options.wireframe !== undefined) {
      if (frontMaterial) {
        frontMaterial.wireframe = options.wireframe
        frontMaterial.needsUpdate = true
      }
      if (backMaterial) {
        backMaterial.wireframe = options.wireframe
        backMaterial.needsUpdate = true
      }
      if (visorMaterial) {
        visorMaterial.wireframe = options.wireframe
        visorMaterial.needsUpdate = true
      }
    }

    if (options.clamshellDistance !== undefined) {
      applyClamshellDistance(options.clamshellDistance)
    }
  }

  function dispose() {
    if (animId !== null) {
      cancelAnimationFrame(animId)
      animId = null
    }

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    if (container) {
      container.removeEventListener('mousedown', onPointerDown)
      container.removeEventListener('touchstart', onPointerDown)
      container.removeEventListener('wheel', onWheel)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
    }

    // Deshacer geometrías y materiales
    const disposeObj = (obj: THREE.Object3D) => {
      if ('geometry' in obj && (obj as any).geometry) {
        (obj as any).geometry.dispose()
      }
      if ('material' in obj && (obj as any).material) {
        const mat = (obj as any).material
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose())
        } else {
          mat.dispose()
        }
      }
    }

    if (scene) {
      scene.traverse(disposeObj)
      scene.clear()
      scene = null
    }

    if (renderer) {
      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
      renderer = null
    }

    frontMesh = null
    backMesh = null
    visorMesh = null
    frontMaterial = null
    backMaterial = null
    visorMaterial = null
    particlesMesh = null
    rootGroup = null
    imuGroup = null
    mechaPivotGroup = null
    subAssemblyGroup = null
  }

  return {
    isLoading,
    loadProgress,
    hasError,
    errorMessage,
    init,
    updateOptions,
    resetCamera,
    dispose
  }
}
