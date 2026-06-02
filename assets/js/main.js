/**
 * FYP Journey — Main Entry Point
 * main.js
 *
 * Bootstraps all page modules after components (header/footer) are injected.
 * Each module is imported and initialized here — add new modules in the
 * appropriate phase without touching other files.
 */

'use strict'

function isReloadNavigation () {
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0]

  if (navigationEntry) {
    return navigationEntry.type === 'reload'
  }

  return performance.navigation?.type === performance.navigation.TYPE_RELOAD
}

function forceReloadToStartAtTop () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  if (!isReloadNavigation()) return

  const cleanUrl = `${window.location.pathname}${window.location.search}`

  if (window.location.hash) {
    history.replaceState(null, document.title, cleanUrl)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  scrollToTop()
  requestAnimationFrame(scrollToTop)
  window.addEventListener('load', scrollToTop, { once: true })
  window.addEventListener('pageshow', scrollToTop, { once: true })
}

// ── Page Loader ──────────────────────────────────────────────
function hidePageLoader () {
  const loader = document.getElementById('page-loader')
  if (!loader) return

  // Small delay so fonts render before fade-out
  setTimeout(() => {
    loader.classList.add('hidden')
    // Remove from DOM after transition
    loader.addEventListener('transitionend', () => loader.remove(), {
      once: true
    })
  }, 400)
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initScrollReveal () {
  const elements = document.querySelectorAll('.reveal')
  if (!elements.length) return

  let observer = null

  const revealInViewport = element => {
    if (element.classList.contains('visible')) return true

    const rect = element.getBoundingClientRect()
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight
    const revealOffset = Math.min(96, viewportHeight * 0.12)
    // Elemen dianggap terlihat jika bagian atasnya sudah masuk viewport (melewati batas offset bawah)
    // atau jika posisinya sudah berada di atas viewport (telah di-scroll oleh user)
    const isVisible = rect.top <= viewportHeight - revealOffset

    if (isVisible) {
      element.classList.add('visible')
      observer?.unobserve(element)
    }

    return isVisible
  }

  const revealVisibleElements = () => {
    elements.forEach(revealInViewport)
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
      }
    )

    elements.forEach(el => {
      if (!revealInViewport(el)) {
        observer.observe(el)
      }
    })
  } else {
    revealVisibleElements()
    window.addEventListener('scroll', scheduleRevealCheck, { passive: true })
  }

  const scheduleRevealCheck = () => {
    requestAnimationFrame(revealVisibleElements)
  }

  scheduleRevealCheck()
  window.addEventListener('load', scheduleRevealCheck, { once: true })
  window.addEventListener('pageshow', scheduleRevealCheck)
  window.addEventListener('resize', scheduleRevealCheck, { passive: true })
  setTimeout(scheduleRevealCheck, 150)
  setTimeout(scheduleRevealCheck, 500)

  // Jaring pengaman (fallback): tampilkan semua konten setelah 1.5s jika scroll/observer gagal
  setTimeout(() => {
    elements.forEach(el => {
      if (!el.classList.contains('visible')) {
        el.classList.add('visible')
      }
    })
  }, 1500)
}

// ── Smooth scroll for anchor links ───────────────────────────
function initSmoothScroll () {
  document.querySelectorAll('a[href^="#"], a[href*="/#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href')
      const hash = href.includes('#') ? '#' + href.split('#')[1] : href
      const target = document.querySelector(hash)

      if (target) {
        e.preventDefault()
        const navbarHeight =
          document.querySelector('.navbar')?.offsetHeight || 80
        const offsetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight -
          16

        window.scrollTo({ top: offsetTop, behavior: 'smooth' })
      }
    })
  })
}

// ── FAQ Accordion (exclusive — hanya 1 item terbuka) ──────────
function initFaqAccordion () {
  const accordion = document.querySelector('.faq__accordion')
  if (!accordion) return

  const items = accordion.querySelectorAll('.faq__item')
  const buttons = accordion.querySelectorAll('.faq__question[aria-expanded]')

  function openItem (item) {
    item.classList.add('is-open')
    const btn = item.querySelector('.faq__question')
    if (btn) btn.setAttribute('aria-expanded', 'true')
  }

  function closeItem (item) {
    item.classList.remove('is-open')
    const btn = item.querySelector('.faq__question')
    if (btn) btn.setAttribute('aria-expanded', 'false')
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq__item')
      const isOpen = parentItem.classList.contains('is-open')

      // Tutup semua item terlebih dahulu
      items.forEach(closeItem)

      // Jika sebelumnya tertutup, buka item ini
      if (!isOpen) openItem(parentItem)
    })
  })
}

// ── Phase 2+: Module Imports ──────────────────────────────────
import { initAboutSlider } from './components/about-slider.js'
import { initHeroSlider } from './components/hero-slider.js'
import { initContactParallax } from './components/contact-parallax.js'
import { initContactForm } from './components/contact-form.js'

// ── Boot ─────────────────────────────────────────────────────
forceReloadToStartAtTop()
initScrollReveal()

const startApp = () => {
  initSmoothScroll()
  initFaqAccordion()

  // Phase 2+ modules will be imported and called here
  // Phase 2
  initAboutSlider()
  initHeroSlider()
  initContactParallax()
  initContactForm()
}

// Atasi race condition components:ready
if (window.componentsReady) {
  startApp()
} else {
  document.addEventListener('components:ready', startApp)
}

// Sembunyikan loader lebih cepat demi UX yang instant
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hidePageLoader)
} else {
  hidePageLoader()
}

// Backup event load & fallback pengaman 1.5 detik
window.addEventListener('load', hidePageLoader)
setTimeout(hidePageLoader, 1500)
