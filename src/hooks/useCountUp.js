import { useEffect, useRef, useState } from 'react'

/**
 * useCountUp — animates a number from 0 to target
 * @param {number} target  — the final value
 * @param {number} duration — animation duration in ms (default 800)
 * @param {function} formatter — optional format function e.g. (n) => `$${n.toLocaleString()}`
 * @returns {string} — the current animated display value
 *
 * Usage:
 *   const display = useCountUp(44539, 800, n => `$${n.toLocaleString()}`)
 *   <span>{display}</span>
 */
export function useCountUp(target, duration = 800, formatter = null) {
  const [display, setDisplay] = useState(formatter ? formatter(0) : '0')
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const prevTargetRef = useRef(null)

  useEffect(() => {
    // Don't animate on first render or if value hasn’t changed
    if (target === prevTargetRef.current) return
    prevTargetRef.current = target

    const startValue = 0
    const endValue = target

    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplay(formatter ? formatter(endValue) : String(endValue))
      return
    }

    startTimeRef.current = null

    function step(timestamp) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * eased)

      setDisplay(formatter ? formatter(current) : String(current))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, formatter])

  return display
}
