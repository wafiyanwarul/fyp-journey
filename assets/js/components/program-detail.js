/**
 * FYP Journey — Program Detail Gallery
 * assets/js/components/program-detail.js
 *
 * Features:
 * - Click thumbnail → jump to slide
 * - Arrow button nav
 * - Keyboard left/right
 * - Mouse drag (horizontal)
 * - Touch swipe
 * - Auto-pause on hover
 * - Respects prefers-reduced-motion
 */

'use strict'

export function initProgramGallery () {
  const gallery = document.querySelector('.pd-gallery__main')
  if (!gallery) return

  const slides = gallery.querySelectorAll('.pd-gallery__slide')
  const thumbs = document.querySelectorAll('.pd-gallery__thumb')
  const prevBtn = gallery.querySelector('.pd-gallery__nav--prev')
  const nextBtn = gallery.querySelector('.pd-gallery__nav--next')
  const counter = gallery.querySelector('.pd-gallery__counter')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!slides.length) return

  let current = 0
  let timer = null
  const DELAY = 5000

  // ── Core: go to slide ─────────────────────────────────────
  function goTo (index) {
    slides[current].classList.remove('active')
    thumbs[current]?.classList.remove('active')

    current = (index + slides.length) % slides.length

    slides[current].classList.add('active')
    thumbs[current]?.classList.add('active')

    if (counter) {
      counter.textContent = `${current + 1} / ${slides.length}`
    }
  }

  // ── Auto play ─────────────────────────────────────────────
  function start () {
    if (reduced) return
    stop()
    timer = setInterval(() => goTo(current + 1), DELAY)
  }

  function stop () {
    clearInterval(timer)
    timer = null
  }

  // ── Thumbnail clicks ──────────────────────────────────────
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      goTo(i)
      start()
    })
  })

  // ── Arrow buttons ─────────────────────────────────────────
  prevBtn?.addEventListener('click', () => {
    goTo(current - 1)
    start()
  })
  nextBtn?.addEventListener('click', () => {
    goTo(current + 1)
    start()
  })

  // ── Keyboard ─────────────────────────────────────────────
  gallery.setAttribute('tabindex', '0')
  gallery.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      goTo(current - 1)
      start()
    }
    if (e.key === 'ArrowRight') {
      goTo(current + 1)
      start()
    }
  })

  // ── Mouse drag ───────────────────────────────────────────
  let dragStartX = 0
  let isDragging = false
  const THRESHOLD = 50

  gallery.addEventListener('mousedown', e => {
    isDragging = true
    dragStartX = e.clientX
  })
  gallery.addEventListener('mousemove', e => {
    if (isDragging) e.preventDefault()
  })
  gallery.addEventListener('mouseup', e => {
    if (!isDragging) return
    isDragging = false
    const diff = dragStartX - e.clientX
    if (Math.abs(diff) > THRESHOLD) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1)
      start()
    }
  })
  gallery.addEventListener('mouseleave', () => {
    isDragging = false
  })

  // ── Touch swipe ───────────────────────────────────────────
  let touchStartX = 0

  gallery.addEventListener(
    'touchstart',
    e => {
      touchStartX = e.touches[0].clientX
    },
    { passive: true }
  )

  gallery.addEventListener(
    'touchend',
    e => {
      const diff = touchStartX - e.changedTouches[0].clientX
      if (Math.abs(diff) > THRESHOLD) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1)
        start()
      }
    },
    { passive: true }
  )

  // ── Pause on hover ────────────────────────────────────────
  gallery.addEventListener('mouseenter', stop)
  gallery.addEventListener('mouseleave', start)

  // ── Visibility ────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start()
  })

  // ── Init ──────────────────────────────────────────────────
  goTo(0)
  start()
}

// ── Back button: scroll to top on homepage ────────────────────
export function initBackButton () {
  const backBtn = document.querySelector('.pd-back')
  if (!backBtn) return

  backBtn.addEventListener('click', e => {
    const href = backBtn.getAttribute('href')
    // If going back to homepage root, force scroll top via sessionStorage flag
    if (href === '/' || href === '/index.html' || href === '/#home') {
      sessionStorage.setItem('scrollToTop', '1')
    }
  })
}
