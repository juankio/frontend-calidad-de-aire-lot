import { ref } from 'vue'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import {
  normalizeGc9a01Emotion,
  renderGc9a01Display,
  stepSharedGc9a01Animation,
  type Gc9a01Emotion
} from '~/utils/gc9a01Renderer'

export interface MechaSceneOptions {
  wireframe?: boolean
  xray?: boolean
  clamshellDistance?: number
  compact?: boolean
  ppm?: number
  temperature?: number
  humidity?: number
  riskStatus?: 'OPTIMAL' | 'WARNING_PREDICTIVE' | 'CRITICAL' | 'RECOVERY' | 'SLEEPING' | 'DIZZY'
  deviceEmotion?: string
  screenViewMode?: 'FACE' | 'HUD'
  pitch?: number
  roll?: number
  eyeX?: number
  eyeY?: number
  ax?: number
  ay?: number
  az?: number
  isShaking?: boolean
  autoRotate?: boolean
}

const PARTICLE_COUNT = 150

const SCREW_POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [-24, 30],
  [24, 30],
  [-26, -32],
  [26, -32]
]

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

  let rootGroup: THREE.Group | null = null
  let assemblyGroup: THREE.Group | null = null
  let mechaPivotGroup: THREE.Group | null = null
  let subAssemblyGroup: THREE.Group | null = null
  let electronicsGroup: THREE.Group | null = null
  let esp32Group: THREE.Group | null = null
  let gc9a01PcbGroup: THREE.Group | null = null

  let frontMesh: THREE.Mesh | null = null
  let backMesh: THREE.Mesh | null = null
  let visorMesh: THREE.Mesh | null = null
  let screenMesh: THREE.Mesh | null = null

  let frontMaterial: THREE.MeshStandardMaterial | null = null
  let backMaterial: THREE.MeshStandardMaterial | null = null
  let visorMaterial: THREE.MeshStandardMaterial | null = null
  let screenMaterial: THREE.MeshBasicMaterial | null = null
  let esp32BlueLedMat: THREE.MeshBasicMaterial | null = null

  let screenCanvas: HTMLCanvasElement | null = null
  let screenCtx: CanvasRenderingContext2D | null = null
  let screenTexture: THREE.CanvasTexture | null = null
  let meshGrillTexture: THREE.CanvasTexture | null = null
  let dhtGrillTexture: THREE.CanvasTexture | null = null

  let visorPointLight: THREE.PointLight | null = null

  let particlesMesh: THREE.Points | null = null
  let particleMaterial: THREE.PointsMaterial | null = null
  let particlePositions: Float32Array | null = null
  let particleAngles: Float32Array | null = null
  let particleRadii: Float32Array | null = null
  let particleHeights: Float32Array | null = null
  let particleSpeeds: Float32Array | null = null
  let particleLiftSpeeds: Float32Array | null = null

  let isDragging = false
  let prevPointerX = 0
  let prevPointerY = 0
  let targetRotationY = 0
  let targetRotationX = 0
  let currentRotationY = 0
  let currentRotationX = 0
  let cameraDistance = 172
  let targetCameraDistance = 172

  let currentOptions: MechaSceneOptions = {
    wireframe: false,
    xray: false,
    clamshellDistance: 0,
    compact: false,
    ppm: 420,
    temperature: 24.5,
    humidity: 48,
    riskStatus: 'OPTIMAL',
    deviceEmotion: 'OPTIMAL',
    screenViewMode: 'FACE',
    pitch: 0,
    roll: 0,
    eyeX: 0,
    eyeY: 0,
    isShaking: false,
    autoRotate: false
  }

  function resolveActiveEmotion(): Gc9a01Emotion {
    const raw = currentOptions.deviceEmotion || currentOptions.riskStatus || 'OPTIMAL'
    return normalizeGc9a01Emotion(raw, currentOptions.isShaking)
  }

  function getStatusColor(status?: string, ppmVal: number = 420, shaking?: boolean): THREE.Color {
    const normalized = normalizeGc9a01Emotion(status, shaking)
    if (normalized === 'DIZZY') return new THREE.Color(0xeab308)
    if (normalized === 'CRITICAL' || ppmVal >= 1100) return new THREE.Color(0xf43f5e)
    if (normalized === 'WARNING_PREDICTIVE' || ppmVal >= 750) return new THREE.Color(0xf59e0b)
    if (normalized === 'RECOVERY') return new THREE.Color(0x38bdf8)
    if (normalized === 'SLEEPING') return new THREE.Color(0x64748b)
    return new THREE.Color(0x10b981)
  }

  function createStainlessMeshTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#475569'
    ctx.fillRect(0, 0, 128, 128)

    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    const step = 8
    for (let i = -128; i < 256; i += step) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + 128, 128)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(i + 128, 0)
      ctx.lineTo(i, 128)
      ctx.stroke()
    }

    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let y = 0; y < 128; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(128, y)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 3)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  function createDht11GrillTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#0284c7'
    ctx.fillRect(0, 0, 128, 128)

    ctx.fillStyle = '#082f49'
    for (let y = 16; y <= 108; y += 14) {
      ctx.fillRect(16, y, 40, 6)
      ctx.fillRect(72, y, 40, 6)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  function createGc9a01ScreenMesh(): THREE.Mesh | null {
    if (typeof document === 'undefined') return null
    screenCanvas = document.createElement('canvas')
    screenCanvas.width = 240
    screenCanvas.height = 240
    screenCtx = screenCanvas.getContext('2d')

    if (screenCtx) {
      renderGc9a01Display(screenCtx, {
        ppm: currentOptions.ppm ?? 420,
        temperature: currentOptions.temperature ?? 24.5,
        humidity: currentOptions.humidity ?? 48,
        emotion: resolveActiveEmotion(),
        viewMode: currentOptions.screenViewMode ?? 'FACE',
        eyeX: currentOptions.eyeX ?? 0,
        eyeY: currentOptions.eyeY ?? 0,
        isShaking: currentOptions.isShaking ?? false
      })
    }

    screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.colorSpace = THREE.SRGBColorSpace
    screenTexture.minFilter = THREE.LinearFilter
    screenTexture.magFilter = THREE.LinearFilter

    const screenGeo = new THREE.CircleGeometry(16.6, 64)
    screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(screenGeo, screenMaterial)
    mesh.position.set(0, 12, -0.35)
    mesh.rotation.y = Math.PI
    return mesh
  }

  function buildMqSensorModule(isLeft: boolean): THREE.Group {
    const group = new THREE.Group()
    group.position.set(isLeft ? -42 : 42, 26, 0)
    group.rotation.z = ((isLeft ? 35 : -35) * Math.PI) / 180

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      map: meshGrillTexture,
      metalness: 0.85,
      roughness: 0.28
    })
    const cupolaGeo = new THREE.CylinderGeometry(9.6, 9.6, 11.5, 32)
    cupolaGeo.rotateX(Math.PI / 2)
    const cupolaMesh = new THREE.Mesh(cupolaGeo, steelMat)
    cupolaMesh.position.set(0, 0, 2.5)
    group.add(cupolaMesh)

    const capRingGeo = new THREE.TorusGeometry(8.2, 0.85, 16, 32)
    const capRingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.92,
      roughness: 0.18
    })
    const capRing = new THREE.Mesh(capRingGeo, capRingMat)
    capRing.position.set(0, 0, -3.2)
    group.add(capRing)

    const bakeliteGeo = new THREE.CylinderGeometry(10.2, 10.2, 3.0, 32)
    bakeliteGeo.rotateX(Math.PI / 2)
    const bakeliteMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.15,
      roughness: 0.7
    })
    const bakeliteMesh = new THREE.Mesh(bakeliteGeo, bakeliteMat)
    bakeliteMesh.position.set(0, 0, 8.5)
    group.add(bakeliteMesh)

    const pcbGeo = new THREE.BoxGeometry(32.5, 20.5, 1.6)
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.25,
      roughness: 0.45
    })
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat)
    pcbMesh.position.set(0, 0, 10.8)
    group.add(pcbMesh)

    const potGeo = new THREE.BoxGeometry(6.8, 6.8, 3.8)
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.1
    })
    const potMesh = new THREE.Mesh(potGeo, potMat)
    potMesh.position.set(8.5, 4.2, 13.2)
    group.add(potMesh)

    const screwGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16)
    screwGeo.rotateX(Math.PI / 2)
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2
    })
    const potScrew = new THREE.Mesh(screwGeo, brassMat)
    potScrew.position.set(8.5, 4.2, 15.2)
    group.add(potScrew)

    const icGeo = new THREE.BoxGeometry(5.0, 4.0, 1.4)
    const icMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.5,
      metalness: 0.2
    })
    const icMesh = new THREE.Mesh(icGeo, icMat)
    icMesh.position.set(-7.5, -3.5, 12.2)
    group.add(icMesh)

    const greenLedGeo = new THREE.BoxGeometry(1.8, 1.2, 0.9)
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e })
    const greenLed = new THREE.Mesh(greenLedGeo, greenLedMat)
    greenLed.position.set(-11.5, 5.5, 12.0)
    group.add(greenLed)

    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const redLed = new THREE.Mesh(greenLedGeo, redLedMat)
    redLed.position.set(-11.5, 2.2, 12.0)
    group.add(redLed)

    const pinGeo = new THREE.CylinderGeometry(0.45, 0.45, 6.5, 12)
    pinGeo.rotateX(Math.PI / 2)
    for (let p = 0; p < 4; p++) {
      const pin = new THREE.Mesh(pinGeo, brassMat)
      pin.position.set(13.5, -3.8 + p * 2.54, 14.5)
      group.add(pin)
    }

    return group
  }

  function buildElectronicsGroup(): THREE.Group {
    const group = new THREE.Group()
    meshGrillTexture = createStainlessMeshTexture()
    dhtGrillTexture = createDht11GrillTexture()

    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.92,
      roughness: 0.2
    })
    const darkIcMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.2,
      roughness: 0.55
    })
    const stainlessMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.88,
      roughness: 0.24
    })

    gc9a01PcbGroup = new THREE.Group()
    gc9a01PcbGroup.position.set(0, 12, 2.8)

    const displayPcbGeo = new THREE.CylinderGeometry(18, 18, 1.5, 48)
    displayPcbGeo.rotateX(Math.PI / 2)
    const displayPcbMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.3,
      roughness: 0.45
    })
    const displayPcb = new THREE.Mesh(displayPcbGeo, displayPcbMat)
    gc9a01PcbGroup.add(displayPcb)

    const bezelRingGeo = new THREE.RingGeometry(16.4, 17.8, 64)
    const bezelRingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.75,
      roughness: 0.3,
      side: THREE.DoubleSide
    })
    const bezelRing = new THREE.Mesh(bezelRingGeo, bezelRingMat)
    bezelRing.position.set(0, 0, -2.9)
    gc9a01PcbGroup.add(bezelRing)

    const headerPlasticGeo = new THREE.BoxGeometry(20.4, 2.5, 2.4)
    const headerPlastic = new THREE.Mesh(headerPlasticGeo, darkIcMat)
    headerPlastic.position.set(0, -15, 1.8)
    gc9a01PcbGroup.add(headerPlastic)

    const spiPinGeo = new THREE.CylinderGeometry(0.4, 0.4, 6.0, 10)
    spiPinGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 8; i++) {
      const pin = new THREE.Mesh(spiPinGeo, goldPinMat)
      pin.position.set(-8.89 + i * 2.54, -15, 3.8)
      gc9a01PcbGroup.add(pin)
    }
    group.add(gc9a01PcbGroup)

    group.add(buildMqSensorModule(true))
    group.add(buildMqSensorModule(false))

    const dhtGroup = new THREE.Group()
    dhtGroup.position.set(0, -25, 4.5)

    const dhtBodyGeo = new THREE.BoxGeometry(12.6, 16.0, 5.8)
    const dhtBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      map: dhtGrillTexture,
      roughness: 0.38,
      metalness: 0.1
    })
    const dhtBody = new THREE.Mesh(dhtBodyGeo, dhtBodyMat)
    dhtGroup.add(dhtBody)

    const dhtPcbGeo = new THREE.BoxGeometry(16.0, 27.5, 1.6)
    const dhtPcbMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.48,
      metalness: 0.25
    })
    const dhtPcb = new THREE.Mesh(dhtPcbGeo, dhtPcbMat)
    dhtPcb.position.set(0, -2.5, 3.7)
    dhtGroup.add(dhtPcb)

    const dhtPinGeo = new THREE.CylinderGeometry(0.4, 0.4, 5.5, 10)
    for (let i = -1; i <= 1; i++) {
      const pin = new THREE.Mesh(dhtPinGeo, stainlessMat)
      pin.position.set(i * 2.54, -16.5, 3.7)
      dhtGroup.add(pin)
    }
    group.add(dhtGroup)

    const mpuGroup = new THREE.Group()
    mpuGroup.position.set(16, -34, 6.0)

    const mpuPcbGeo = new THREE.BoxGeometry(20.5, 15.6, 1.6)
    const mpuPcbMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.42,
      metalness: 0.28
    })
    const mpuPcb = new THREE.Mesh(mpuPcbGeo, mpuPcbMat)
    mpuGroup.add(mpuPcb)

    const memsChipGeo = new THREE.BoxGeometry(4.2, 4.2, 1.0)
    const memsChip = new THREE.Mesh(memsChipGeo, darkIcMat)
    memsChip.position.set(0, 0.5, -1.1)
    mpuGroup.add(memsChip)

    const mpuLedGeo = new THREE.BoxGeometry(1.6, 1.0, 0.8)
    const mpuLedMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    const mpuLed = new THREE.Mesh(mpuLedGeo, mpuLedMat)
    mpuLed.position.set(-6.5, 4.2, -1.0)
    mpuGroup.add(mpuLed)

    const smdCapGeo = new THREE.BoxGeometry(1.6, 0.9, 0.7)
    const smdCapMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.3,
      roughness: 0.4
    })
    for (let c = 0; c < 3; c++) {
      const cap = new THREE.Mesh(smdCapGeo, smdCapMat)
      cap.position.set(5.2, -2.5 + c * 2.6, -1.0)
      mpuGroup.add(cap)
    }

    const mpuPinGeo = new THREE.CylinderGeometry(0.38, 0.38, 5.2, 10)
    mpuPinGeo.rotateX(Math.PI / 2)
    for (let i = 0; i < 8; i++) {
      const pin = new THREE.Mesh(mpuPinGeo, goldPinMat)
      pin.position.set(-8.89 + i * 2.54, -6.2, 2.2)
      mpuGroup.add(pin)
    }
    group.add(mpuGroup)

    esp32Group = new THREE.Group()
    esp32Group.position.set(0, -10, 30)

    const espPcbGeo = new THREE.BoxGeometry(28.5, 51.5, 1.6)
    const espPcbMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.52,
      metalness: 0.25
    })
    const espPcb = new THREE.Mesh(espPcbGeo, espPcbMat)
    esp32Group.add(espPcb)

    const wroomShieldGeo = new THREE.BoxGeometry(18.0, 19.5, 2.8)
    const wroomShieldMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.86,
      roughness: 0.22
    })
    const wroomShield = new THREE.Mesh(wroomShieldGeo, wroomShieldMat)
    wroomShield.position.set(0, 9.5, -2.0)
    esp32Group.add(wroomShield)

    const antBaseGeo = new THREE.BoxGeometry(18.0, 6.2, 0.8)
    const antBaseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.6
    })
    const antBase = new THREE.Mesh(antBaseGeo, antBaseMat)
    antBase.position.set(0, 22.4, -1.0)
    esp32Group.add(antBase)

    for (let a = -6; a <= 6; a += 3) {
      const traceGeo = new THREE.BoxGeometry(1.2, 4.4, 0.9)
      const trace = new THREE.Mesh(traceGeo, goldPinMat)
      trace.position.set(a, 22.6, -1.1)
      esp32Group.add(trace)
    }

    const cp2102Geo = new THREE.BoxGeometry(5.2, 5.2, 1.1)
    const cp2102 = new THREE.Mesh(cp2102Geo, darkIcMat)
    cp2102.position.set(0, -11.5, -1.2)
    esp32Group.add(cp2102)

    const btnBaseGeo = new THREE.BoxGeometry(3.6, 2.8, 1.4)
    const btnCapGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 12)
    btnCapGeo.rotateX(Math.PI / 2)

    const bootBtn = new THREE.Mesh(btnBaseGeo, stainlessMat)
    bootBtn.position.set(-8.2, -19.5, -1.3)
    const bootCap = new THREE.Mesh(btnCapGeo, darkIcMat)
    bootCap.position.set(-8.2, -19.5, -2.1)

    const enBtn = new THREE.Mesh(btnBaseGeo, stainlessMat)
    enBtn.position.set(8.2, -19.5, -1.3)
    const enCap = new THREE.Mesh(btnCapGeo, darkIcMat)
    enCap.position.set(8.2, -19.5, -2.1)

    esp32Group.add(bootBtn, bootCap, enBtn, enCap)

    const pwrLedGeo = new THREE.BoxGeometry(1.6, 1.0, 0.8)
    const pwrLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const pwrLed = new THREE.Mesh(pwrLedGeo, pwrLedMat)
    pwrLed.position.set(-5.0, -16.0, -1.2)
    esp32Group.add(pwrLed)

    esp32BlueLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const gpio2Led = new THREE.Mesh(pwrLedGeo, esp32BlueLedMat)
    gpio2Led.position.set(5.0, -16.0, -1.2)
    esp32Group.add(gpio2Led)

    const espPinGeo = new THREE.CylinderGeometry(0.38, 0.38, 6.2, 8)
    espPinGeo.rotateX(Math.PI / 2)
    for (let row = 0; row < 15; row++) {
      const py = -17.78 + row * 2.54
      const leftPin = new THREE.Mesh(espPinGeo, goldPinMat)
      leftPin.position.set(-12.7, py, 2.2)
      const rightPin = new THREE.Mesh(espPinGeo, goldPinMat)
      rightPin.position.set(12.7, py, 2.2)
      esp32Group.add(leftPin, rightPin)
    }

    const usbPortGeo = new THREE.BoxGeometry(8.2, 6.2, 3.2)
    const usbPort = new THREE.Mesh(usbPortGeo, stainlessMat)
    usbPort.position.set(0, -25.5, -2.1)
    esp32Group.add(usbPort)

    group.add(esp32Group)

    const screwShaftGeo = new THREE.CylinderGeometry(1.45, 1.45, 18.0, 18)
    screwShaftGeo.rotateX(Math.PI / 2)
    const screwHeadGeo = new THREE.CylinderGeometry(2.8, 2.8, 2.6, 24)
    screwHeadGeo.rotateX(Math.PI / 2)
    const hexSocketGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 6)
    hexSocketGeo.rotateX(Math.PI / 2)

    for (const [sx, sy] of SCREW_POSITIONS) {
      const screwUnit = new THREE.Group()
      screwUnit.position.set(sx, sy, 22.0)

      const shaft = new THREE.Mesh(screwShaftGeo, stainlessMat)
      const head = new THREE.Mesh(screwHeadGeo, stainlessMat)
      head.position.set(0, 0, 9.5)
      const socket = new THREE.Mesh(hexSocketGeo, darkIcMat)
      socket.position.set(0, 0, 10.6)

      screwUnit.add(shaft, head, socket)
      group.add(screwUnit)
    }

    return group
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
      const radius = 34 + Math.random() * 54
      const height = -45 + Math.random() * 95
      const speed = 0.01 + Math.random() * 0.02
      const lift = 0.16 + Math.random() * 0.32

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
      color: 0x10b981,
      size: 2.5,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    particlesMesh = new THREE.Points(geometry, particleMaterial)
    if (rootGroup) rootGroup.add(particlesMesh)
  }

  function syncFrontShellAppearance() {
    if (!frontMaterial) return
    const d = Math.max(0, Math.min(currentOptions.clamshellDistance ?? 0, 60))
    const isXray = Boolean(currentOptions.xray)
    const shouldConfigureTransparency = isXray || d > 4

    frontMaterial.wireframe = Boolean(currentOptions.wireframe)
    frontMaterial.transparent = shouldConfigureTransparency
    frontMaterial.opacity = isXray ? 0.24 : 1.0
    frontMaterial.depthWrite = !isXray
    frontMaterial.needsUpdate = true
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

    frontMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.38,
      wireframe: Boolean(currentOptions.wireframe)
    })
    frontMesh = new THREE.Mesh(frontGeom, frontMaterial)
    frontMesh.position.set(0, 0, 0)
    frontMesh.rotation.set(0, 0, 0)

    backMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      metalness: 0.2,
      roughness: 0.45,
      wireframe: Boolean(currentOptions.wireframe)
    })
    backMesh = new THREE.Mesh(backGeom, backMaterial)
    backMesh.rotation.set(0, Math.PI, 0)
    backMesh.position.set(0, 0, 42)

    const statusColor = getStatusColor(
      currentOptions.deviceEmotion || currentOptions.riskStatus,
      currentOptions.ppm,
      currentOptions.isShaking
    )
    visorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: statusColor,
      emissiveIntensity: 0.45,
      roughness: 0.28,
      metalness: 0.25,
      wireframe: Boolean(currentOptions.wireframe)
    })
    visorMesh = new THREE.Mesh(visorGeom, visorMaterial)
    visorMesh.position.set(0, 12, -1.6)

    screenMesh = createGc9a01ScreenMesh()
    electronicsGroup = buildElectronicsGroup()

    subAssemblyGroup = new THREE.Group()
    subAssemblyGroup.rotation.y = Math.PI
    subAssemblyGroup.position.set(0, 0, 18)

    subAssemblyGroup.add(frontMesh, backMesh, visorMesh, electronicsGroup)
    if (screenMesh) {
      subAssemblyGroup.add(screenMesh)
    }

    if (mechaPivotGroup) {
      mechaPivotGroup.add(subAssemblyGroup)
    }

    syncFrontShellAppearance()
    applyClamshellDistance(currentOptions.clamshellDistance ?? 0)
  }

  function applyClamshellDistance(dist: number) {
    if (!frontMesh || !backMesh || !visorMesh) return
    const d = Math.max(0, Math.min(dist, 60))

    frontMesh.position.set(0, 0, 0)
    frontMesh.rotation.set(0, 0, 0)

    visorMesh.position.set(0, 12, -1.6 - d * 0.55)

    backMesh.position.set(0, 0, 42 + d * 0.9)
    backMesh.rotation.set(0, Math.PI, 0)

    if (screenMesh) {
      screenMesh.position.set(0, 12, -0.35 - d * 0.25)
    }

    if (esp32Group) {
      esp32Group.position.set(0, -10, 30 + d * 0.6)
    }

    syncFrontShellAppearance()
  }

  function onPointerDown(e: MouseEvent | TouchEvent) {
    isDragging = true
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY
    prevPointerX = cx
    prevPointerY = cy
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return
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
    targetCameraDistance = Math.max(95, Math.min(310, targetCameraDistance + e.deltaY * 0.14))
  }

  function animate() {
    animId = requestAnimationFrame(animate)

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const timeSec = nowMs * 0.001

    const activeEmotion = resolveActiveEmotion()
    const renderParams = {
      ppm: currentOptions.ppm ?? 420,
      temperature: currentOptions.temperature ?? 24.5,
      humidity: currentOptions.humidity ?? 48,
      emotion: activeEmotion,
      viewMode: currentOptions.screenViewMode ?? 'FACE',
      eyeX: currentOptions.eyeX ?? 0,
      eyeY: currentOptions.eyeY ?? 0,
      isShaking: currentOptions.isShaking ?? false,
      nowMs
    }

    stepSharedGc9a01Animation(renderParams)
    if (screenCtx && screenTexture) {
      renderGc9a01Display(screenCtx, renderParams)
      screenTexture.needsUpdate = true
    }

    if (esp32BlueLedMat) {
      const pulse = 0.45 + 0.55 * Math.sin(timeSec * 6.0)
      esp32BlueLedMat.color.setRGB(0.1 * pulse, 0.65 * pulse, 1.0 * pulse)
    }

    if (!isDragging && currentOptions.autoRotate === true) {
      targetRotationY += 0.005
    }

    currentRotationY += (targetRotationY - currentRotationY) * 0.12
    currentRotationX += (targetRotationX - currentRotationX) * 0.12

    if (mechaPivotGroup) {
      mechaPivotGroup.rotation.y = currentRotationY
      mechaPivotGroup.rotation.x = currentRotationX
    }

    if (assemblyGroup) {
      const isDizzyOrShaking =
        Boolean(currentOptions.isShaking) ||
        currentOptions.deviceEmotion === 'DIZZY' ||
        currentOptions.riskStatus === 'DIZZY'

      if (currentOptions.autoRotate !== true) {
        let pitchDeg = 0
        let rollDeg = 0

        if (
          (currentOptions.pitch !== undefined && currentOptions.pitch !== 0) ||
          (currentOptions.roll !== undefined && currentOptions.roll !== 0)
        ) {
          pitchDeg = currentOptions.pitch ?? 0
          rollDeg = currentOptions.roll ?? 0
        } else if (currentOptions.eyeX !== undefined || currentOptions.eyeY !== undefined) {
          rollDeg = (currentOptions.eyeX ?? 0) * 3.5
          pitchDeg = -(currentOptions.eyeY ?? 0) * 3.5
        } else if (
          currentOptions.ax !== undefined &&
          currentOptions.ay !== undefined &&
          currentOptions.az !== undefined
        ) {
          const ax = currentOptions.ax
          const ay = currentOptions.ay
          const az = currentOptions.az || 9.8
          pitchDeg = (Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * 180) / Math.PI
          rollDeg = (Math.atan2(ay, az) * 180) / Math.PI
        }

        const pitchRad = (pitchDeg * Math.PI) / 180
        const rollRad = (rollDeg * Math.PI) / 180

        assemblyGroup.rotation.x += (pitchRad - assemblyGroup.rotation.x) * 0.12
        assemblyGroup.rotation.z += (-rollRad - assemblyGroup.rotation.z) * 0.12
      } else {
        assemblyGroup.rotation.x += (0 - assemblyGroup.rotation.x) * 0.12
        assemblyGroup.rotation.z += (0 - assemblyGroup.rotation.z) * 0.12
      }

      if (isDizzyOrShaking) {
        const shakeWave = Math.sin(timeSec * 38) * 2.2
        assemblyGroup.position.x = shakeWave
        assemblyGroup.rotation.z += (shakeWave * Math.PI) / 180
      } else {
        assemblyGroup.position.x += (0 - assemblyGroup.position.x) * 0.2
      }
    }

    cameraDistance += (targetCameraDistance - cameraDistance) * 0.12
    if (camera) {
      camera.position.set(0, 10, cameraDistance)
      camera.lookAt(0, 4, 0)
    }

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
      const speedMultiplier = Math.max(0.6, Math.min(4.2, (ppmVal / 400) * 1.25))

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

      const geom = particlesMesh.geometry
      geom.attributes.position.needsUpdate = true

      const targetColor = getStatusColor(
        currentOptions.deviceEmotion || currentOptions.riskStatus,
        ppmVal,
        currentOptions.isShaking
      )
      if (particleMaterial) {
        particleMaterial.color.lerp(targetColor, 0.08)
      }
      if (visorMaterial) {
        visorMaterial.emissive.lerp(targetColor, 0.08)
      }
      if (visorPointLight) {
        visorPointLight.color.lerp(targetColor, 0.08)
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
    currentOptions = {
      ...currentOptions,
      ...options,
      autoRotate: options.autoRotate ?? false
    }

    const width = container.clientWidth || 300
    const height = container.clientHeight || 300

    scene = new THREE.Scene()

    const fov = currentOptions.compact ? 42 : 45
    camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1000)
    targetCameraDistance = currentOptions.compact ? 176 : 172
    cameraDistance = targetCameraDistance
    camera.position.set(0, 10, cameraDistance)
    camera.lookAt(0, 4, 0)

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.22
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xe2e8f0, 1.05)
    const mainDirLight = new THREE.DirectionalLight(0xffffff, 2.3)
    mainDirLight.position.set(55, 85, 95)
    const frontKeyLight = new THREE.DirectionalLight(0xe0f2fe, 1.9)
    frontKeyLight.position.set(0, 25, 150)
    const rimDirLight = new THREE.DirectionalLight(0x38bdf8, 1.8)
    rimDirLight.position.set(-85, 50, -65)
    const fillDirLight = new THREE.DirectionalLight(0xf97316, 1.25)
    fillDirLight.position.set(75, -35, -55)

    const initialColor = getStatusColor(
      currentOptions.deviceEmotion || currentOptions.riskStatus,
      currentOptions.ppm,
      currentOptions.isShaking
    )
    visorPointLight = new THREE.PointLight(initialColor, 2.2, 130)
    visorPointLight.position.set(0, 12, 26)

    scene.add(ambientLight, mainDirLight, frontKeyLight, rimDirLight, fillDirLight, visorPointLight)

    rootGroup = new THREE.Group()
    assemblyGroup = new THREE.Group()
    mechaPivotGroup = new THREE.Group()

    scene.add(rootGroup)
    rootGroup.add(assemblyGroup)
    assemblyGroup.add(mechaPivotGroup)

    setupParticles()

    isLoading.value = true
    loadMechaSTL()
      .then(() => {
        isLoading.value = false
      })
      .catch((err: unknown) => {
        hasError.value = true
        errorMessage.value = err instanceof Error ? err.message : String(err)
        isLoading.value = false
      })

    container.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    container.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp, { passive: true })

    container.addEventListener('wheel', onWheel, { passive: false })

    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    animate()
  }

  function resetCamera() {
    targetRotationX = 0
    targetRotationY = 0
    targetCameraDistance = currentOptions.compact ? 176 : 172
  }

  function updateOptions(options: Partial<MechaSceneOptions>) {
    currentOptions = { ...currentOptions, ...options }

    if (options.wireframe !== undefined || options.xray !== undefined) {
      syncFrontShellAppearance()
      if (backMaterial && options.wireframe !== undefined) {
        backMaterial.wireframe = Boolean(options.wireframe)
        backMaterial.needsUpdate = true
      }
      if (visorMaterial && options.wireframe !== undefined) {
        visorMaterial.wireframe = Boolean(options.wireframe)
        visorMaterial.needsUpdate = true
      }
    }

    if (options.clamshellDistance !== undefined) {
      applyClamshellDistance(options.clamshellDistance)
    }
  }

  function disposeMaterial(mat: THREE.Material) {
    mat.dispose()
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

    if (screenTexture) {
      screenTexture.dispose()
      screenTexture = null
    }
    if (meshGrillTexture) {
      meshGrillTexture.dispose()
      meshGrillTexture = null
    }
    if (dhtGrillTexture) {
      dhtGrillTexture.dispose()
      dhtGrillTexture = null
    }

    if (scene) {
      scene.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          if (obj.geometry) {
            obj.geometry.dispose()
          }
          if (Array.isArray(obj.material)) {
            obj.material.forEach(disposeMaterial)
          } else if (obj.material) {
            disposeMaterial(obj.material)
          }
        }
      })
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
    screenMesh = null
    frontMaterial = null
    backMaterial = null
    visorMaterial = null
    screenMaterial = null
    esp32BlueLedMat = null
    particlesMesh = null
    rootGroup = null
    assemblyGroup = null
    mechaPivotGroup = null
    subAssemblyGroup = null
    electronicsGroup = null
    esp32Group = null
    gc9a01PcbGroup = null
    screenCanvas = null
    screenCtx = null
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
