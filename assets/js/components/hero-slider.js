/**
 * FYP Journey — Hero Image Slider
 * assets/js/components/hero-slider.js
 *
 * Auto-play image carousel with:
 * - Smooth crossfade transition
 * - Dot navigation (clickable)
 * - Pause on hover / focus
 * - Keyboard accessible
 * - Respects prefers-reduced-motion
 */

'use strict'

export function initHeroSlider () {
  const slider = document.querySelector('.hero__slider')
  if (!slider) return

  const slides = slider.querySelectorAll('.hero__slide')
  const dots = slider.querySelectorAll('.hero__dot')

  if (!slides.length) return

  let current = 0
  let timer = null
  const DELAY = 4500 // ms between slides
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Activate a specific slide ─────────────────────────────
  function goTo (index) {
    // Deactivate current
    slides[current].classList.remove('active')
    dots[current]?.classList.remove('active')
    dots[current]?.setAttribute('aria-selected', 'false')

    // Activate next
    current = (index + slides.length) % slides.length
    slides[current].classList.add('active')
    dots[current]?.classList.add('active')
    dots[current]?.setAttribute('aria-selected', 'true')
  }

  // ── Auto-play ─────────────────────────────────────────────
  function startAutoPlay () {
    if (reduced) return // respect user preference
    stopAutoPlay()
    timer = setInterval(() => goTo(current + 1), DELAY)
  }

  function stopAutoPlay () {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // ── Dot click navigation ──────────────────────────────────
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10)
      if (!isNaN(index)) {
        goTo(index)
        startAutoPlay() // reset timer on manual nav
      }
    })
  })

  // ── Keyboard navigation ───────────────────────────────────
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      goTo(current - 1)
      startAutoPlay()
    }
    if (e.key === 'ArrowRight') {
      goTo(current + 1)
      startAutoPlay()
    }
  })

  // ── Pause on hover ────────────────────────────────────────
  slider.addEventListener('mouseenter', stopAutoPlay)
  slider.addEventListener('mouseleave', startAutoPlay)

  // ── Pause when tab loses focus ────────────────────────────
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoPlay() : startAutoPlay()
  })

  // ── Boot ─────────────────────────────────────────────────
  startAutoPlay()
}
