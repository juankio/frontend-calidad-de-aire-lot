import anime from 'animejs'

export function isReducedMotionPreferred(): boolean {
  return typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

export function animateButtonPulse(btnEl: HTMLElement | null) {
  if (!btnEl || isReducedMotionPreferred()) return
  anime.remove(btnEl)
  anime({
    targets: btnEl,
    scale: [1, 0.94, 1.02, 1],
    filter: ['brightness(1)', 'brightness(1.4) drop-shadow(0 0 14px rgba(251,191,36,0.8))', 'brightness(1)'],
    duration: 400,
    easing: 'easeOutQuad'
  })
}

export function animateModalOpenTransition(
  backdropEl: HTMLElement | null,
  cardEl: HTMLElement | null,
  opts?: { cardDuration?: number; backdropDuration?: number; translateY?: number; initialScale?: number }
) {
  if (isReducedMotionPreferred() || !cardEl) return
  if (backdropEl) {
    anime.remove(backdropEl)
    anime({
      targets: backdropEl,
      opacity: [0, 1],
      duration: opts?.backdropDuration ?? 250,
      easing: 'easeOutQuad'
    })
  }
  anime.remove(cardEl)
  anime({
    targets: cardEl,
    opacity: [0, 1],
    scale: [opts?.initialScale ?? 0.94, 1],
    translateY: [opts?.translateY ?? 15, 0],
    duration: opts?.cardDuration ?? 350,
    easing: 'cubicBezier(0.16, 1, 0.3, 1)'
  })
}

export function animateModalCloseTransition(
  backdropEl: HTMLElement | null,
  cardEl: HTMLElement | null,
  onComplete: () => void
) {
  if (isReducedMotionPreferred() || !cardEl || !backdropEl) {
    onComplete()
    return
  }
  anime.remove([cardEl, backdropEl])
  anime({
    targets: cardEl,
    opacity: [1, 0],
    scale: [1, 0.95],
    translateY: [0, 12],
    duration: 180,
    easing: 'easeInQuad'
  })
  anime({
    targets: backdropEl,
    opacity: [1, 0],
    duration: 200,
    easing: 'easeInQuad',
    complete: onComplete
  })
}
