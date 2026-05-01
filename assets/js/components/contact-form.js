/**
 * FYP Journey - Contact form handoff
 *
 * Keeps the static website independent from a paid form backend by turning
 * validated questions into a WhatsApp message for the official admin number.
 */

'use strict'

import Sanitizer from '../utils/sanitize.js'
import Validator from '../utils/validator.js'

const WHATSAPP_NUMBER = '6287779415292'

function buildWhatsAppMessage ({ name, email, message }) {
  return [
    'Halo Kak Fitri, saya ingin bertanya tentang FYP Journey.',
    '',
    `Nama: ${name}`,
    `Email: ${email}`,
    '',
    `Pertanyaan: ${message}`
  ].join('\n')
}

function setFormStatus (form, message, type = 'info') {
  const status = form.querySelector('[data-form-status]')
  if (!status) return

  status.textContent = message
  status.dataset.status = type
}

export function initContactForm () {
  const form = document.getElementById('contactForm')
  if (!form) return

  form.addEventListener('submit', event => {
    event.preventDefault()

    const honeypot = form.querySelector('[name="_honey"]')
    if (honeypot?.value) return

    const fields = {
      name: Sanitizer.sanitizeInput(form.elements.name?.value, 80),
      email: Sanitizer.sanitizeInput(form.elements.email?.value, 120),
      message: Sanitizer.sanitizeInput(form.elements.message?.value, 1000)
    }

    const result = Validator.validateForm(fields, {
      name: ['required', 'name', { maxLength: 80 }],
      email: ['required', 'email', { maxLength: 120 }],
      message: ['required', { maxLength: 1000 }]
    })

    if (!result.valid) {
      const firstError = Object.values(result.errors)[0]
      setFormStatus(form, firstError || 'Mohon cek kembali isian formulir.', 'error')
      form.reportValidity()
      return
    }

    const text = encodeURIComponent(buildWhatsAppMessage(fields))
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`

    setFormStatus(form, 'Membuka WhatsApp untuk mengirim pertanyaanmu...', 'success')
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  })
}
