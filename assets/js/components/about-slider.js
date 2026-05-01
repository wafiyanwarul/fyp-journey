/**
 * FYP Journey — About Story Slider
 * assets/js/components/about-slider.js
 *
 * Horizontal story carousel for:
 * - About overview
 * - Meet the Founder
 * - Logo philosophy
 */

'use strict'

export function initAboutSlider () {
  const carousel = document.querySelector('.about__carousel')
  if (!carousel) return

  const track = carousel.querySelector('.about__track')
  const slides = carousel.querySelectorAll('.about__slide')
  const dots = carousel.querySelectorAll('.about__dot')
  const prev = document.querySelector('.about__arrow--prev')
  const next = document.querySelector('.about__arrow--next')

  if (!track || !slides.length) return

  let current = 0
  let timer = null
  const DELAY = 6000
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function syncUI () {
    track.style.transform = `translateX(-${current * 100}%)`

    slides.forEach((slide, index) => {
      const active = index === current
      slide.classList.toggle('is-active', active)
      slide.setAttribute('aria-hidden', active ? 'false' : 'true')
    })

    dots.forEach((dot, index) => {
      const active = index === current
      dot.classList.toggle('is-active', active)
      dot.setAttribute('aria-selected', active ? 'true' : 'false')
      dot.tabIndex = active ? 0 : -1
    })
  }

  function goTo (index) {
    current = (index + slides.length) % slides.length
    syncUI()
  }

  function stopAutoPlay () {
    if (!timer) return
    clearInterval(timer)
    timer = null
  }

  function startAutoPlay () {
    if (reduced) return
    stopAutoPlay()
    timer = setInterval(() => goTo(current + 1), DELAY)
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index)
      if (Number.isNaN(index)) return
      goTo(index)
      startAutoPlay()
    })
  })

  prev?.addEventListener('click', () => {
    goTo(current - 1)
    startAutoPlay()
  })

  next?.addEventListener('click', () => {
    goTo(current + 1)
    startAutoPlay()
  })

  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      goTo(current - 1)
      startAutoPlay()
    }

    if (event.key === 'ArrowRight') {
      goTo(current + 1)
      startAutoPlay()
    }
  })

  carousel.addEventListener('mouseenter', stopAutoPlay)
  carousel.addEventListener('mouseleave', startAutoPlay)
  carousel.addEventListener('focusin', stopAutoPlay)
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoPlay()
    }
  })

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoPlay() : startAutoPlay()
  })

  syncUI()
  startAutoPlay()
}
