import anime from 'animejs'

export function useAcademicMotion() {
  const isReducedMotion = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const animateStepChange = (
    formulaEl: HTMLElement | null,
    cardsEl: HTMLElement | null,
    bannerEl?: HTMLElement | null
  ) => {
    if (isReducedMotion()) return

    const targets: HTMLElement[] = [formulaEl, cardsEl, bannerEl].filter(Boolean) as HTMLElement[]
    if (targets.length) {
      anime.remove(targets)
    }

    if (formulaEl) {
      anime({
        targets: formulaEl,
        opacity: [0.15, 1],
        translateY: [6, 0],
        duration: 250,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)'
      })
    }

    if (cardsEl) {
      const cards = cardsEl.querySelectorAll('.step-card')
      anime({
        targets: cards.length ? cards : cardsEl,
        opacity: [0.2, 1],
        translateY: [6, 0],
        delay: anime.stagger(45),
        duration: 270,
        easing: 'cubicBezier(0.22, 1, 0.36, 1)'
      })
    }

    if (bannerEl) {
      anime({
        targets: bannerEl,
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 280,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)'
      })
    }
  }

  const animateVariableChange = (
    badgeEl: HTMLElement | null,
    detailsEl: HTMLElement | null
  ) => {
    if (isReducedMotion()) return

    const targets: HTMLElement[] = [badgeEl, detailsEl].filter(Boolean) as HTMLElement[]
    if (targets.length) {
      anime.remove(targets)
    }

    if (badgeEl) {
      anime({
        targets: badgeEl,
        scale: [0.88, 1.04, 1],
        opacity: [0.5, 1],
        duration: 240,
        easing: 'easeOutQuad'
      })
    }

    if (detailsEl) {
      const cards = detailsEl.querySelectorAll('.var-card')
      anime({
        targets: cards.length ? cards : detailsEl,
        opacity: [0.2, 1],
        translateY: [5, 0],
        delay: anime.stagger(40),
        duration: 250,
        easing: 'cubicBezier(0.22, 1, 0.36, 1)'
      })
    }
  }

  const animatePulse = (el: HTMLElement | null) => {
    if (!el || isReducedMotion()) return
    anime.remove(el)
    anime({
      targets: el,
      scale: [0.94, 1.03, 1],
      duration: 220,
      easing: 'easeOutCubic'
    })
  }

  return {
    isReducedMotion,
    animateStepChange,
    animateVariableChange,
    animatePulse
  }
}
