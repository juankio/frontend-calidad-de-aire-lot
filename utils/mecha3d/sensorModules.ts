import * as THREE from 'three'
import { renderGc9a01Display } from '~/utils/gc9a01Renderer'
import { resolveActiveEmotion } from './animator'
import {
  createGoldPinMaterial,
  createHeaderPinRow,
  createPcbMaterial,
  createSmdChipMaterial,
  createSolderMaterial
} from './materials'
import type { MechaSceneContext } from './types'

export function buildGc9a01Module(ctx: MechaSceneContext): {
  pcbGroup: THREE.Group
  screenMesh: THREE.Mesh | null
} {
  const pcbGroup = new THREE.Group()
  pcbGroup.position.set(0, 12, 2.8)

  const bezelRingGeo = new THREE.RingGeometry(16.4, 17.8, 64)
  const bezelRingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.75,
    roughness: 0.3,
    side: THREE.DoubleSide
  })
  const bezelRing = new THREE.Mesh(bezelRingGeo, bezelRingMat)
  bezelRing.position.set(0, 0, -2.9)
  pcbGroup.add(bezelRing)

  const gc9a01BackParts = new THREE.Group()
  const displayPcbGeo = new THREE.CylinderGeometry(17.5, 17.5, 1.5, 48)
  displayPcbGeo.rotateX(Math.PI / 2)
  gc9a01BackParts.add(new THREE.Mesh(displayPcbGeo, createPcbMaterial(0x1e3a8a, 0.45, 0.3)))

  const headerPlastic = new THREE.Mesh(new THREE.BoxGeometry(19.0, 2.4, 2.2), createSmdChipMaterial())
  headerPlastic.position.set(0, -13.5, 1.6)
  gc9a01BackParts.add(headerPlastic)
  gc9a01BackParts.add(createHeaderPinRow(8, 0.38, 4.5, 2.54, createGoldPinMaterial(), -13.5, 3.4, -8.89))

  pcbGroup.add(gc9a01BackParts)
  ctx.internalPcbList.push(gc9a01BackParts)

  let screenMesh: THREE.Mesh | null = null
  if (typeof document !== 'undefined') {
    ctx.screenCanvas = document.createElement('canvas')
    ctx.screenCanvas.width = 240
    ctx.screenCanvas.height = 240
    ctx.screenCtx = ctx.screenCanvas.getContext('2d')

    if (ctx.screenCtx) {
      renderGc9a01Display(ctx.screenCtx, {
        ppm: ctx.options.ppm ?? 420,
        temperature: ctx.options.temperature ?? 24.5,
        humidity: ctx.options.humidity ?? 48,
        emotion: resolveActiveEmotion(ctx.options),
        viewMode: ctx.options.screenViewMode ?? 'FACE',
        eyeX: ctx.options.eyeX ?? 0,
        eyeY: ctx.options.eyeY ?? 0,
        isShaking: ctx.options.isShaking ?? false
      })
    }

    ctx.screenTexture = new THREE.CanvasTexture(ctx.screenCanvas)
    ctx.screenTexture.colorSpace = THREE.SRGBColorSpace
    ctx.screenTexture.minFilter = THREE.LinearFilter
    ctx.screenTexture.magFilter = THREE.LinearFilter

    ctx.screenMaterial = new THREE.MeshBasicMaterial({ map: ctx.screenTexture, side: THREE.DoubleSide })
    screenMesh = new THREE.Mesh(new THREE.CircleGeometry(16.6, 64), ctx.screenMaterial)
    screenMesh.position.set(0, 12, -0.35)
    screenMesh.rotation.y = Math.PI
  }

  return { pcbGroup, screenMesh }
}

export function buildMqSensorModule(
  isLeft: boolean,
  meshGrillTexture: THREE.CanvasTexture | null,
  internalPcbList: THREE.Object3D[]
): THREE.Group {
  const group = new THREE.Group()
  group.position.set(isLeft ? -42 : 42, 26, 0)
  group.rotation.z = ((isLeft ? 35 : -35) * Math.PI) / 180

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    map: meshGrillTexture,
    metalness: 0.85,
    roughness: 0.28
  })
  const cupolaGeo = new THREE.CylinderGeometry(9.2, 9.2, 8.6, 32)
  cupolaGeo.rotateX(Math.PI / 2)
  const cupolaMesh = new THREE.Mesh(cupolaGeo, steelMat)
  cupolaMesh.position.set(0, 0, 4.8)
  group.add(cupolaMesh)

  const capRingMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.92,
    roughness: 0.18,
    side: THREE.DoubleSide
  })
  const capRing = new THREE.Mesh(new THREE.RingGeometry(6.8, 9.2, 32), capRingMat)
  capRing.position.set(0, 0, 0.45)
  group.add(capRing)

  const bakeliteGeo = new THREE.CylinderGeometry(9.5, 9.5, 2.4, 32)
  bakeliteGeo.rotateX(Math.PI / 2)
  const bakeliteMesh = new THREE.Mesh(bakeliteGeo, createPcbMaterial(0x0f172a, 0.7, 0.15))
  bakeliteMesh.position.set(0, 0, 9.5)
  group.add(bakeliteMesh)

  const mqPcbBackGroup = new THREE.Group()
  const pcbMesh = new THREE.Mesh(new THREE.BoxGeometry(17.5, 26.0, 1.5), createPcbMaterial(0x1d4ed8, 0.45, 0.25))
  pcbMesh.position.set(0, -1.5, 11.2)
  mqPcbBackGroup.add(pcbMesh)

  const potMesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.2, 3.0), createPcbMaterial(0x0284c7, 0.4, 0.1))
  potMesh.position.set(4.2, -7.5, 13.0)
  mqPcbBackGroup.add(potMesh)

  const brassMat = createGoldPinMaterial()
  const screwGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16)
  screwGeo.rotateX(Math.PI / 2)
  const potScrew = new THREE.Mesh(screwGeo, brassMat)
  potScrew.position.set(4.2, -7.5, 14.6)
  mqPcbBackGroup.add(potScrew)

  const icMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.6, 1.2), createSmdChipMaterial())
  icMesh.position.set(-4.0, -6.5, 12.4)
  mqPcbBackGroup.add(icMesh)

  const ledGeo = new THREE.BoxGeometry(1.6, 1.1, 0.8)
  const greenLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }))
  greenLed.position.set(-5.5, -10.5, 12.2)
  const redLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  redLed.position.set(-2.0, -10.5, 12.2)
  mqPcbBackGroup.add(greenLed, redLed)
  mqPcbBackGroup.add(createHeaderPinRow(4, 0.4, 4.5, 2.54, brassMat, -11.5, 14.0, -3.81))

  group.add(mqPcbBackGroup)
  internalPcbList.push(mqPcbBackGroup)
  return group
}

export function buildDht11Module(
  dhtGrillTexture: THREE.CanvasTexture | null,
  internalPcbList: THREE.Object3D[]
): THREE.Group {
  const dhtGroup = new THREE.Group()
  dhtGroup.position.set(0, -23.5, 5.5)

  const dhtBodyMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    map: dhtGrillTexture,
    roughness: 0.38,
    metalness: 0.1
  })
  dhtGroup.add(new THREE.Mesh(new THREE.BoxGeometry(12.2, 15.2, 5.2), dhtBodyMat))

  const dhtBackParts = new THREE.Group()
  const dhtPcb = new THREE.Mesh(new THREE.BoxGeometry(14.0, 19.0, 1.4), createPcbMaterial(0x0f172a, 0.48, 0.25))
  dhtPcb.position.set(0, -1.0, 3.4)
  dhtBackParts.add(dhtPcb)
  dhtBackParts.add(createHeaderPinRow(3, 0.38, 4.0, 2.54, createSolderMaterial(), -9.5, 4.8, -2.54))

  dhtGroup.add(dhtBackParts)
  internalPcbList.push(dhtBackParts)
  return dhtGroup
}
