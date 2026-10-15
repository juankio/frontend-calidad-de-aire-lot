import * as THREE from 'three'
import { normalizeGc9a01Emotion } from '~/utils/gc9a01Renderer'

export function createPcbMaterial(color: number = 0x0f172a, roughness: number = 0.48, metalness: number = 0.25): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

export function createGoldPinMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.92,
    roughness: 0.2
  })
}

export function createSolderMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.24
  })
}

export function createSmdChipMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.2,
    roughness: 0.55
  })
}

export function createHeaderPinRow(
  count: number,
  radius: number,
  length: number,
  pitch: number,
  material: THREE.Material,
  yPos: number,
  zPos: number,
  startX?: number
): THREE.Group {
  const rowGroup = new THREE.Group()
  const pinGeo = new THREE.CylinderGeometry(radius, radius, length, 10)
  pinGeo.rotateX(Math.PI / 2)
  const x0 = startX !== undefined ? startX : -((count - 1) * pitch) / 2
  for (let i = 0; i < count; i++) {
    const pin = new THREE.Mesh(pinGeo, material)
    pin.position.set(x0 + i * pitch, yPos, zPos)
    rowGroup.add(pin)
  }
  return rowGroup
}

export function resolveEnergyColor(status?: string, ppmVal: number = 420, shaking?: boolean): THREE.Color {
  const normalized = normalizeGc9a01Emotion(status, shaking)
  if (normalized === 'DIZZY') return new THREE.Color(0xeab308)
  if (normalized === 'CRITICAL' || ppmVal >= 1100) return new THREE.Color(0xf43f5e)
  if (normalized === 'WARNING_PREDICTIVE' || ppmVal >= 750) return new THREE.Color(0xf59e0b)
  if (normalized === 'RECOVERY') return new THREE.Color(0x38bdf8)
  if (normalized === 'SLEEPING') return new THREE.Color(0x64748b)
  return new THREE.Color(0x10b981)
}

export function createStainlessMeshTexture(): THREE.CanvasTexture | null {
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

export function createDht11GrillTexture(): THREE.CanvasTexture | null {
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
