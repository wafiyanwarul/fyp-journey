/**
 * FYP Journey — Form Validator
 * validator.js
 */

'use strict'

const Validator = (() => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  const PHONE_REGEX = /^(\+62|62|0)[0-9]{8,13}$/
  const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'\-]{2,80}$/

  function isValidEmail (email) {
    return typeof email === 'string' && EMAIL_REGEX.test(email.trim())
  }

  function isValidPhone (phone) {
    return (
      typeof phone === 'string' && PHONE_REGEX.test(phone.replace(/\s/g, ''))
    )
  }

  function isValidName (name) {
    return typeof name === 'string' && NAME_REGEX.test(name.trim())
  }

  function isNotEmpty (value) {
    return typeof value === 'string' && value.trim().length > 0
  }

  function isWithinLength (value, min = 1, max = 1000) {
    const len = String(value).trim().length
    return len >= min && len <= max
  }

  /**
   * Validate a full form object.
   * @param {Object} fields - { fieldName: value }
   * @param {Object} rules  - { fieldName: ['required', 'email', ...] }
   * @returns {{ valid: boolean, errors: Object }}
   */
  function validateForm (fields, rules) {
    const errors = {}

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = fields[field] ?? ''

      for (const rule of fieldRules) {
        if (rule === 'required' && !isNotEmpty(value)) {
          errors[field] = 'Kolom ini wajib diisi.'
          break
        }
        if (rule === 'email' && value && !isValidEmail(value)) {
          errors[field] = 'Format email tidak valid.'
          break
        }
        if (rule === 'phone' && value && !isValidPhone(value)) {
          errors[field] = 'Format nomor telepon tidak valid.'
          break
        }
        if (rule === 'name' && value && !isValidName(value)) {
          errors[field] = 'Nama hanya boleh berisi huruf.'
          break
        }
        if (typeof rule === 'object' && rule.maxLength) {
          if (!isWithinLength(value, 1, rule.maxLength)) {
            errors[field] = `Maksimal ${rule.maxLength} karakter.`
            break
          }
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  return {
    isValidEmail,
    isValidPhone,
    isValidName,
    isNotEmpty,
    isWithinLength,
    validateForm
  }
})()

export default Validator
