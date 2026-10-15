import type * as THREE from 'three'

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

export interface MechaParticleState {
  mesh: THREE.Points
  material: THREE.PointsMaterial
  positions: Float32Array
  angles: Float32Array
  radii: Float32Array
  heights: Float32Array
  speeds: Float32Array
  liftSpeeds: Float32Array
}

export interface MechaSceneContext {
  container: HTMLElement | null
  renderer: THREE.WebGLRenderer | null
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  rootGroup: THREE.Group | null
  assemblyGroup: THREE.Group | null
  mechaPivotGroup: THREE.Group | null
  subAssemblyGroup: THREE.Group | null
  electronicsGroup: THREE.Group | null
  esp32Group: THREE.Group | null
  gc9a01PcbGroup: THREE.Group | null
  internalPcbList: THREE.Object3D[]
  frontMesh: THREE.Mesh | null
  backMesh: THREE.Mesh | null
  visorMesh: THREE.Mesh | null
  screenMesh: THREE.Mesh | null
  frontMaterial: THREE.MeshStandardMaterial | null
  backMaterial: THREE.MeshStandardMaterial | null
  visorMaterial: THREE.MeshStandardMaterial | null
  screenMaterial: THREE.MeshBasicMaterial | null
  esp32BlueLedMat: THREE.MeshBasicMaterial | null
  screenCanvas: HTMLCanvasElement | null
  screenCtx: CanvasRenderingContext2D | null
  screenTexture: THREE.CanvasTexture | null
  meshGrillTexture: THREE.CanvasTexture | null
  dhtGrillTexture: THREE.CanvasTexture | null
  visorPointLight: THREE.PointLight | null
  particles: MechaParticleState | null
  isDragging: boolean
  prevPointerX: number
  prevPointerY: number
  targetRotationY: number
  targetRotationX: number
  currentRotationY: number
  currentRotationX: number
  cameraDistance: number
  targetCameraDistance: number
  options: MechaSceneOptions
}

export const DEFAULT_MECHA_OPTIONS: MechaSceneOptions = {
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

export function createInitialMechaContext(): MechaSceneContext {
  return {
    container: null,
    renderer: null,
    scene: null,
    camera: null,
    rootGroup: null,
    assemblyGroup: null,
    mechaPivotGroup: null,
    subAssemblyGroup: null,
    electronicsGroup: null,
    esp32Group: null,
    gc9a01PcbGroup: null,
    internalPcbList: [],
    frontMesh: null,
    backMesh: null,
    visorMesh: null,
    screenMesh: null,
    frontMaterial: null,
    backMaterial: null,
    visorMaterial: null,
    screenMaterial: null,
    esp32BlueLedMat: null,
    screenCanvas: null,
    screenCtx: null,
    screenTexture: null,
    meshGrillTexture: null,
    dhtGrillTexture: null,
    visorPointLight: null,
    particles: null,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    targetRotationY: 0,
    targetRotationX: 0,
    currentRotationY: 0,
    currentRotationX: 0,
    cameraDistance: 172,
    targetCameraDistance: 172,
    options: { ...DEFAULT_MECHA_OPTIONS }
  }
}
