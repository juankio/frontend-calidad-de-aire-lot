import * as THREE from 'three'
import {
  createDht11GrillTexture,
  createGoldPinMaterial,
  createHeaderPinRow,
  createPcbMaterial,
  createSmdChipMaterial,
  createSolderMaterial,
  createStainlessMeshTexture
} from './materials'
import { buildDht11Module, buildGc9a01Module, buildMqSensorModule } from './sensorModules'
import type { MechaSceneContext } from './types'

const SCREW_POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [-24, 30],
  [24, 30],
  [-26, -32],
  [26, -32]
]

export function buildMpu6050Module(internalPcbList: THREE.Object3D[]): THREE.Group {
  const mpuGroup = new THREE.Group()
  mpuGroup.position.set(15.0, -24.0, 11.5)

  const mpuPcbGeo = new THREE.BoxGeometry(18.0, 14.0, 1.5)
  const mpuPcb = new THREE.Mesh(mpuPcbGeo, createPcbMaterial(0x2563eb, 0.42, 0.28))
  mpuGroup.add(mpuPcb)

  const memsChipGeo = new THREE.BoxGeometry(4.0, 4.0, 1.0)
  const memsChip = new THREE.Mesh(memsChipGeo, createSmdChipMaterial())
  memsChip.position.set(0, 0.5, -1.0)
  mpuGroup.add(memsChip)

  const mpuLedGeo = new THREE.BoxGeometry(1.5, 1.0, 0.7)
  const mpuLed = new THREE.Mesh(mpuLedGeo, new THREE.MeshBasicMaterial({ color: 0x4ade80 }))
  mpuLed.position.set(-5.5, 3.8, -1.0)
  mpuGroup.add(mpuLed)

  const smdCapGeo = new THREE.BoxGeometry(1.5, 0.85, 0.65)
  const smdCapMat = createPcbMaterial(0xd97706, 0.4, 0.3)
  for (let c = 0; c < 3; c++) {
    const cap = new THREE.Mesh(smdCapGeo, smdCapMat)
    cap.position.set(4.5, -2.2 + c * 2.2, -1.0)
    mpuGroup.add(cap)
  }

  mpuGroup.add(createHeaderPinRow(8, 0.36, 4.0, 2.18, createGoldPinMaterial(), -5.2, 2.0, -7.62))
  internalPcbList.push(mpuGroup)
  return mpuGroup
}

export function buildEsp32Module(internalPcbList: THREE.Object3D[]): {
  group: THREE.Group
  blueLedMat: THREE.MeshBasicMaterial
} {
  const esp32Group = new THREE.Group()
  esp32Group.position.set(0, -6.0, 31.0)

  const goldPinMat = createGoldPinMaterial()
  const darkIcMat = createSmdChipMaterial()
  const stainlessMat = createSolderMaterial()

  const espPcbGeo = new THREE.BoxGeometry(26.5, 46.0, 1.5)
  esp32Group.add(new THREE.Mesh(espPcbGeo, createPcbMaterial(0x0f172a, 0.52, 0.25)))

  const wroomShieldGeo = new THREE.BoxGeometry(16.8, 17.5, 2.6)
  const wroomShield = new THREE.Mesh(wroomShieldGeo, stainlessMat)
  wroomShield.position.set(0, 8.0, -1.8)
  esp32Group.add(wroomShield)

  const antBaseGeo = new THREE.BoxGeometry(16.8, 5.4, 0.8)
  const antBase = new THREE.Mesh(antBaseGeo, createPcbMaterial(0x090d16, 0.6, 0.1))
  antBase.position.set(0, 19.6, -1.0)
  esp32Group.add(antBase)

  const traceGeo = new THREE.BoxGeometry(1.1, 3.8, 0.9)
  for (let a = -6; a <= 6; a += 3) {
    const trace = new THREE.Mesh(traceGeo, goldPinMat)
    trace.position.set(a, 19.8, -1.1)
    esp32Group.add(trace)
  }

  const cp2102 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.8, 1.0), darkIcMat)
  cp2102.position.set(0, -10.5, -1.1)
  esp32Group.add(cp2102)

  const btnBaseGeo = new THREE.BoxGeometry(3.4, 2.6, 1.3)
  const btnCapGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.75, 12)
  btnCapGeo.rotateX(Math.PI / 2)

  for (const bx of [-7.5, 7.5]) {
    const btn = new THREE.Mesh(btnBaseGeo, stainlessMat)
    btn.position.set(bx, -17.5, -1.2)
    const cap = new THREE.Mesh(btnCapGeo, darkIcMat)
    cap.position.set(bx, -17.5, -1.9)
    esp32Group.add(btn, cap)
  }

  const ledGeo = new THREE.BoxGeometry(1.5, 1.0, 0.75)
  const pwrLed = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  pwrLed.position.set(-4.5, -14.5, -1.1)
  const blueLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const gpio2Led = new THREE.Mesh(ledGeo, blueLedMat)
  gpio2Led.position.set(4.5, -14.5, -1.1)
  esp32Group.add(pwrLed, gpio2Led)

  const espPinGeo = new THREE.CylinderGeometry(0.36, 0.36, 4.8, 8)
  espPinGeo.rotateX(Math.PI / 2)
  for (let row = 0; row < 15; row++) {
    const py = -16.5 + row * 2.35
    const leftPin = new THREE.Mesh(espPinGeo, goldPinMat)
    leftPin.position.set(-11.6, py, 2.0)
    const rightPin = new THREE.Mesh(espPinGeo, goldPinMat)
    rightPin.position.set(11.6, py, 2.0)
    esp32Group.add(leftPin, rightPin)
  }

  const usbPort = new THREE.Mesh(new THREE.BoxGeometry(7.6, 5.0, 2.8), stainlessMat)
  usbPort.position.set(0, -22.5, -1.8)
  esp32Group.add(usbPort)

  internalPcbList.push(esp32Group)
  return { group: esp32Group, blueLedMat }
}

export function buildM3Bolts(): THREE.Group {
  const boltsGroup = new THREE.Group()
  const stainlessMat = createSolderMaterial()
  const darkIcMat = createSmdChipMaterial()

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
    boltsGroup.add(screwUnit)
  }

  return boltsGroup
}

export function buildElectronicsGroup(ctx: MechaSceneContext): THREE.Group {
  const group = new THREE.Group()
  ctx.internalPcbList = []
  ctx.meshGrillTexture = createStainlessMeshTexture()
  ctx.dhtGrillTexture = createDht11GrillTexture()

  const { pcbGroup, screenMesh } = buildGc9a01Module(ctx)
  ctx.gc9a01PcbGroup = pcbGroup
  ctx.screenMesh = screenMesh
  group.add(pcbGroup)

  group.add(buildMqSensorModule(true, ctx.meshGrillTexture, ctx.internalPcbList))
  group.add(buildMqSensorModule(false, ctx.meshGrillTexture, ctx.internalPcbList))
  group.add(buildDht11Module(ctx.dhtGrillTexture, ctx.internalPcbList))
  group.add(buildMpu6050Module(ctx.internalPcbList))

  const esp32 = buildEsp32Module(ctx.internalPcbList)
  ctx.esp32Group = esp32.group
  ctx.esp32BlueLedMat = esp32.blueLedMat
  group.add(esp32.group)

  group.add(buildM3Bolts())
  return group
}
