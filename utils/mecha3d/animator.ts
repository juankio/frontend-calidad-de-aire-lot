import {
  normalizeGc9a01Emotion,
  renderGc9a01Display,
  stepSharedGc9a01Animation,
  type Gc9a01Emotion
} from '~/utils/gc9a01Renderer'
import { updateParticles } from './particlesAndLights'
import type { MechaSceneContext, MechaSceneOptions } from './types'

export function resolveActiveEmotion(options: MechaSceneOptions): Gc9a01Emotion {
  const raw = options.deviceEmotion || options.riskStatus || 'OPTIMAL'
  return normalizeGc9a01Emotion(raw, options.isShaking)
}

export function stepMechaFrame(ctx: MechaSceneContext): void {
  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const timeSec = nowMs * 0.001
  const opts = ctx.options

  const activeEmotion = resolveActiveEmotion(opts)
  const renderParams = {
    ppm: opts.ppm ?? 420,
    riskStatus: opts.riskStatus ?? 'OPTIMAL',
    temperature: opts.temperature ?? 24.5,
    humidity: opts.humidity ?? 48,
    emotion: activeEmotion,
    viewMode: opts.screenViewMode ?? 'FACE',
    eyeX: opts.eyeX ?? 0,
    eyeY: opts.eyeY ?? 0,
    isShaking: opts.isShaking ?? false,
    nowMs
  }

  stepSharedGc9a01Animation(renderParams)
  if (ctx.screenCtx && ctx.screenTexture) {
    renderGc9a01Display(ctx.screenCtx, renderParams)
    ctx.screenTexture.needsUpdate = true
  }

  if (ctx.esp32BlueLedMat) {
    const pulse = 0.45 + 0.55 * Math.sin(timeSec * 6.0)
    ctx.esp32BlueLedMat.color.setRGB(0.1 * pulse, 0.65 * pulse, 1.0 * pulse)
  }

  if (!ctx.isDragging && opts.autoRotate === true) {
    ctx.targetRotationY += 0.005
  }

  ctx.currentRotationY += (ctx.targetRotationY - ctx.currentRotationY) * 0.12
  ctx.currentRotationX += (ctx.targetRotationX - ctx.currentRotationX) * 0.12

  if (ctx.mechaPivotGroup) {
    ctx.mechaPivotGroup.rotation.y = ctx.currentRotationY
    ctx.mechaPivotGroup.rotation.x = ctx.currentRotationX
  }

  if (ctx.assemblyGroup) {
    const isDizzyOrShaking =
      Boolean(opts.isShaking) ||
      opts.deviceEmotion === 'DIZZY' ||
      opts.riskStatus === 'DIZZY'

    if (opts.autoRotate !== true) {
      let pitchDeg = 0
      let rollDeg = 0

      if ((opts.pitch !== undefined && opts.pitch !== 0) || (opts.roll !== undefined && opts.roll !== 0)) {
        pitchDeg = opts.pitch ?? 0
        rollDeg = opts.roll ?? 0
      } else if (opts.eyeX !== undefined || opts.eyeY !== undefined) {
        rollDeg = (opts.eyeX ?? 0) * 9.0
        pitchDeg = (opts.eyeY ?? 0) * 9.0
      } else if (opts.ax !== undefined && opts.ay !== undefined && opts.az !== undefined) {
        const ax = opts.ax
        const ay = opts.ay
        const az = opts.az || 9.8
        pitchDeg = (Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * 180) / Math.PI
        rollDeg = (Math.atan2(ay, az) * 180) / Math.PI
      }

      const targetPitchRad = (pitchDeg * Math.PI) / 180
      const targetRollRad = -(rollDeg * Math.PI) / 180

      const deltaPitch = Math.atan2(
        Math.sin(targetPitchRad - ctx.assemblyGroup.rotation.x),
        Math.cos(targetPitchRad - ctx.assemblyGroup.rotation.x)
      )
      const deltaRoll = Math.atan2(
        Math.sin(targetRollRad - ctx.assemblyGroup.rotation.z),
        Math.cos(targetRollRad - ctx.assemblyGroup.rotation.z)
      )

      ctx.assemblyGroup.rotation.x += deltaPitch * 0.28
      ctx.assemblyGroup.rotation.z += deltaRoll * 0.28
    } else {
      const deltaPitch = Math.atan2(
        Math.sin(0 - ctx.assemblyGroup.rotation.x),
        Math.cos(0 - ctx.assemblyGroup.rotation.x)
      )
      const deltaRoll = Math.atan2(
        Math.sin(0 - ctx.assemblyGroup.rotation.z),
        Math.cos(0 - ctx.assemblyGroup.rotation.z)
      )
      ctx.assemblyGroup.rotation.x += deltaPitch * 0.25
      ctx.assemblyGroup.rotation.z += deltaRoll * 0.25
    }

    if (isDizzyOrShaking) {
      const shakeWave = Math.sin(timeSec * 38) * 2.2
      ctx.assemblyGroup.position.x = shakeWave
      ctx.assemblyGroup.rotation.z += (shakeWave * Math.PI) / 180
    } else {
      ctx.assemblyGroup.position.x += (0 - ctx.assemblyGroup.position.x) * 0.2
    }
  }

  ctx.cameraDistance += (ctx.targetCameraDistance - ctx.cameraDistance) * 0.12
  if (ctx.camera) {
    ctx.camera.position.set(0, 10, ctx.cameraDistance)
    ctx.camera.lookAt(0, 4, 0)
  }

  updateParticles(ctx)

  if (ctx.renderer && ctx.scene && ctx.camera) {
    ctx.renderer.render(ctx.scene, ctx.camera)
  }
}
