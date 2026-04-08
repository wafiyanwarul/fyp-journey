/**
 * FYP Journey — Main Entry Point
 * main.js
 *
 * Bootstraps all page modules after components (header/footer) are injected.
 * Each module is imported and initialized here — add new modules in the
 * appropriate phase without touching other files.
 */

'use strict'

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

  const observer = new IntersectionObserver(
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

  elements.forEach(el => observer.observe(el))
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

// ── Phase 2+: Module Imports ──────────────────────────────────
import { initHeroSlider } from './components/hero-slider.js'

// ── Boot: wait for components to be ready ───────────────────
document.addEventListener('components:ready', () => {
  initScrollReveal()
  initSmoothScroll()

  // Phase 2+ modules will be imported and called here
  // Phase 2
  initHeroSlider()
  // Example: initHeroSlider(), initFAQ(), initContactParallax()
})

// Hide loader on window load (all assets ready)
window.addEventListener('load', hidePageLoader)

// Fallback: hide loader after 3s regardless
setTimeout(hidePageLoader, 3000)
