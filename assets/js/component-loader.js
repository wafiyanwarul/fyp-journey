/**
 * FYP Journey — Component Loader
 * component-loader.js
 *
 * Dynamically injects header.html and footer.html partials
 * into every page. Handles path differences between:
 *   - Root pages  : index.html       → partials/ is at ../partials/ or ./partials/
 *   - Sub-pages   : programs/*.html  → partials/ is at ../partials/
 */

'use strict'

/**
 * Detect base path relative to current page location.
 * Works for both root-level pages and pages inside subdirectories.
 */
function getBasePath () {
  const path = window.location.pathname

  // Count how many directories deep we are from root
  // Remove leading slash, split by '/', remove last element (filename)
  const parts = path.replace(/^\//, '').split('/').filter(Boolean)
  const depth = parts.length > 1 ? parts.length - 1 : 0

  // Each level up = '../'
  return depth > 0 ? '../'.repeat(depth) : './'
}

/**
 * Fetch and inject a partial HTML file into a target element.
 * @param {string} partialPath - Path to the partial HTML file
 * @param {string} targetSelector - CSS selector of the target element
 * @param {'beforeend'|'afterbegin'|'replace'} position - Where to inject
 * @returns {Promise<boolean>} Success status
 */
async function loadPartial (partialPath, targetSelector, position = 'replace') {
  const target = document.querySelector(targetSelector)

  if (!target) {
    console.warn(`[ComponentLoader] Target "${targetSelector}" not found.`)
    return false
  }

  try {
    const response = await fetch(partialPath, {
      method: 'GET',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      // Prevent caching of partials during development
      cache: 'no-cache'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    if (position === 'replace') {
      target.innerHTML = html
    } else {
      target.insertAdjacentHTML(position, html)
    }

    // Dispatch custom event so other scripts know component is ready
    target.dispatchEvent(
      new CustomEvent('component:loaded', {
        bubbles: true,
        detail: { partial: partialPath, selector: targetSelector }
      })
    )

    return true
  } catch (err) {
    console.error(`[ComponentLoader] Failed to load "${partialPath}":`, err)
    return false
  }
}

/**
 * Set active nav link based on current page URL.
 * Called after header is injected.
 */
function setActiveNavLink () {
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll(
    '.navbar__link, .navbar__mobile-link'
  )

  navLinks.forEach(link => {
    const href = link.getAttribute('href') || ''

    // Resolve the full href relative to current page
    const linkUrl = new URL(href, window.location.href)

    // Match by pathname — handle both exact and hash-based routing
    const isHome = currentPath === '/' || currentPath.endsWith('index.html')
    const isLinkHome =
      linkUrl.pathname === '/' || linkUrl.pathname.endsWith('index.html')

    if (isHome && isLinkHome) {
      link.classList.add('active')
    } else if (!isLinkHome && currentPath.includes(linkUrl.pathname)) {
      link.classList.add('active')
    }
  })
}

/**
 * Fix all relative asset/link paths inside an injected partial.
 * Ensures images, hrefs, and srcs resolve correctly from any page depth.
 * @param {string} containerId - Container that received the partial
 */
function fixPartialPaths (containerId) {
  const basePath = getBasePath()
  const container = document.getElementById(containerId)
  if (!container) return

  // Fix anchor hrefs with relative paths (not starting with /, #, http)
  container.querySelectorAll('a[href]').forEach(el => {
    const href = el.getAttribute('href')
    if (
      href &&
      !href.startsWith('/') &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel')
    ) {
      // Already prefixed? skip
      if (!href.startsWith('./') && !href.startsWith('../')) {
        el.setAttribute('href', basePath + href)
      }
    }
  })

  // Fix img src
  container.querySelectorAll('img[src]').forEach(el => {
    const src = el.getAttribute('src')
    if (
      src &&
      !src.startsWith('/') &&
      !src.startsWith('http') &&
      !src.startsWith('data:')
    ) {
      if (!src.startsWith('./') && !src.startsWith('../')) {
        el.setAttribute('src', basePath + src)
      }
    }
  })
}

/**
 * Initialize the mobile hamburger menu toggle.
 * Called after header partial is injected.
 */
function initMobileMenu () {
  const hamburger = document.querySelector('.navbar__hamburger')
  const mobileMenu = document.querySelector('.navbar__mobile')
  const mobileLinks = document.querySelectorAll('.navbar__mobile-link')

  if (!hamburger || !mobileMenu) return

  const closeMenu = () => {
    hamburger.classList.remove('open')
    mobileMenu.classList.remove('open')
    hamburger.setAttribute('aria-expanded', 'false')
    hamburger.setAttribute('aria-label', 'Buka menu')
  }

  const openMenu = () => {
    hamburger.classList.add('open')
    mobileMenu.classList.add('open')
    hamburger.setAttribute('aria-expanded', 'true')
    hamburger.setAttribute('aria-label', 'Tutup menu')
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open')
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu()
    })
  })

  document.addEventListener('click', e => {
    const clickedInsideMenu = mobileMenu.contains(e.target)
    const clickedHamburger = hamburger.contains(e.target)

    if (!clickedInsideMenu && !clickedHamburger) {
      closeMenu()
    }
  })

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu()
    }
  })
}

/**
 * Initialize navbar scroll behavior.
 * Called after header partial is injected.
 */
function initNavbarScroll () {
  const navbar = document.querySelector('.navbar')
  if (!navbar) return

  let ticking = false

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('navbar--scrolled', window.scrollY > 48)
          ticking = false
        })
        ticking = true
      }
    },
    { passive: true }
  )
}

/**
 * Main loader — loads header + footer, then initializes UI.
 */
async function initComponents () {
  const basePath = getBasePath()

  // Load header and footer in parallel
  const [headerOk, footerOk] = await Promise.all([
    loadPartial(`${basePath}partials/header.html`, '#site-header'),
    loadPartial(`${basePath}partials/footer.html`, '#site-footer')
  ])

  if (headerOk) {
    fixPartialPaths('site-header')
    setActiveNavLink()
    initMobileMenu()
    initNavbarScroll()
  }

  if (footerOk) {
    fixPartialPaths('site-footer')

    // Update copyright year automatically
    const yearEl = document.getElementById('footer-year')
    if (yearEl) yearEl.textContent = new Date().getFullYear()
  }

  // Signal all components are ready
  document.dispatchEvent(new CustomEvent('components:ready'))
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents)
} else {
  initComponents()
}
