// assets/js/components/contact-parallax.js

export function initContactParallax () {
  const section = document.querySelector('.contact__container')
  const images = document.querySelectorAll('.parallax-img')
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches

  if (!section || images.length === 0 || prefersReducedMotion || !hasFinePointer) {
    return
  }

  const handlePointerMove = e => {
    const rect = section.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    images.forEach((img, index) => {
      const speed = (index + 1) * -0.035
      const x = mouseX * speed
      const y = mouseY * speed

      img.style.transform = `translate(${x}px, ${y}px) rotate(var(--rot, 0deg))`
    })
  }

  const resetParallax = () => {
    images.forEach(img => {
      img.style.transform = `translate(0px, 0px) rotate(var(--rot, 0deg))`
    })
  }

  section.addEventListener('pointermove', handlePointerMove)
  section.addEventListener('pointerleave', resetParallax)
}
