/**
 * FYP Journey — About Story Slider
 * assets/js/components/about-slider.js
 *
 * Horizontal story carousel for:
 * - About overview
 * - Meet the Founder
 * - Logo philosophy
 *
 * Updated with:
 * - Touch swipe (mobile)
 * - Mouse drag swipe (desktop) with visual grab cursor
 * - Uninterrupted auto-play (removes pause-on-hover for large sections)
 */

'use strict'

export function initAboutSlider () {
  const carousel = document.querySelector('.about__carousel')
  if (!carousel) return

  const track = carousel.querySelector('.about__track')
  const slides = carousel.querySelectorAll('.about__slide')
  const dots = carousel.querySelectorAll('.about__dot')

  if (!track || !slides.length) return

  let current = 0
  let timer = null
  const DELAY = 6000 // Auto-swipe setiap 6 detik
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function syncUI () {
    // Kembalikan transisi transisi halus untuk perpindahan slide normal
    track.style.transition = 'transform 750ms var(--ease-out)'
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

  // ── Touch and Mouse Drag Swiping ──────────────────────────
  let startX = 0
  let diffX = 0
  let isDragging = false

  // Set cursor grab awal pada track
  track.style.cursor = 'grab'
  track.style.userSelect = 'none'
  track.style.webkitUserSelect = 'none'

  const getEventX = event => {
    return event.touches && event.touches.length ? event.touches[0].pageX : event.pageX
  }

  const dragStart = event => {
    // Hanya proses seret mouse jika klik kiri
    if (event.type === 'mousedown') {
      if (event.button !== 0) return
      event.preventDefault() // Mencegah highlight teks / drag gambar bawaan browser
    }
    
    isDragging = true
    startX = getEventX(event)
    diffX = 0
    stopAutoPlay()

    // Nonaktifkan transisi agar pergeseran mengikuti kursor secara instan
    track.style.transition = 'none'
    track.style.cursor = 'grabbing'
  }

  const dragMove = event => {
    if (!isDragging) return
    
    const currentX = getEventX(event)
    diffX = currentX - startX

    const trackWidth = track.offsetWidth || 1
    const dragPercent = (diffX / trackWidth) * 100
    
    // Geser posisi track secara real-time mengikuti gerakan mouse/jari
    track.style.transform = `translateX(calc(-${current * 100}% + ${dragPercent}%))`
  }

  const dragEnd = () => {
    if (!isDragging) return
    isDragging = false

    // Kembalikan cursor dan transisi halus
    track.style.cursor = 'grab'
    track.style.transition = 'transform 750ms var(--ease-out)'

    const threshold = 50 // Minimum jarak seret (dalam pixel) untuk memicu pindah slide
    if (diffX > threshold) {
      goTo(current - 1)
    } else if (diffX < -threshold) {
      goTo(current + 1)
    } else {
      goTo(current) // Kembali ke posisi slide aktif jika tarikan terlalu pendek
    }

    startAutoPlay()
  }

  // Event handler untuk layar sentuh (mobile)
  track.addEventListener('touchstart', dragStart, { passive: true })
  track.addEventListener('touchmove', dragMove, { passive: true })
  track.addEventListener('touchend', dragEnd)

  // Event handler untuk mouse (desktop)
  track.addEventListener('mousedown', dragStart)
  window.addEventListener('mousemove', dragMove)
  window.addEventListener('mouseup', dragEnd)

  // Klik Navigasi Bulatan (Dots)
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index)
      if (Number.isNaN(index)) return
      goTo(index)
      startAutoPlay()
    })
  })

  // Navigasi Keyboard (Panah Kiri & Kanan)
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

  // Otomatis matikan/hidupkan interval ketika tab tidak aktif untuk efisiensi CPU
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoPlay() : startAutoPlay()
  })

  syncUI()
  startAutoPlay()
}
