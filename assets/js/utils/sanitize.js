/**
 * FYP Journey — Input Sanitizer (XSS Protection)
 * sanitize.js
 *
 * Lightweight DOMPurify-inspired sanitizer for untrusted strings.
 * NEVER insert user content via innerHTML — always use sanitize() first
 * or better yet, use element.textContent directly.
 */

'use strict'

const Sanitizer = (() => {
  // Dangerous HTML entities to encode
  const ENCODE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  /**
   * Escape HTML entities in a string.
   * Use when injecting text into HTML contexts via innerHTML (prefer textContent instead).
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML (str) {
    if (typeof str !== 'string') return ''
    return str.replace(/[&<>"'`=/]/g, char => ENCODE_MAP[char] || char)
  }

  /**
   * Strip all HTML tags from a string.
   * @param {string} str
   * @returns {string}
   */
  function stripTags (str) {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '')
  }

  /**
   * Sanitize a URL — block javascript:, data:, vbscript: etc.
   * @param {string} url
   * @returns {string} Safe URL or empty string
   */
  function sanitizeURL (url) {
    if (typeof url !== 'string') return ''
    const trimmed = url.trim().toLowerCase()
    const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:']
    if (dangerous.some(proto => trimmed.startsWith(proto))) return ''
    return url.trim()
  }

  /**
   * Sanitize user text input — strip tags, trim, limit length.
   * @param {string} input
   * @param {number} maxLength
   * @returns {string}
   */
  function sanitizeInput (input, maxLength = 1000) {
    if (typeof input !== 'string') return ''
    return stripTags(input.trim()).substring(0, maxLength)
  }

  /**
   * Set text content safely (preferred over innerHTML).
   * @param {HTMLElement} el
   * @param {string} text
   */
  function setTextSafe (el, text) {
    if (el && el instanceof HTMLElement) {
      el.textContent = typeof text === 'string' ? text : String(text)
    }
  }

  return { escapeHTML, stripTags, sanitizeURL, sanitizeInput, setTextSafe }
})()

export default Sanitizer
