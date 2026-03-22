import { useEffect, useRef, useState } from 'react'

/**
 * ResultHero — gradient result card
 * Props:
 *   label     {string}   e.g. "Final Balance"
 *   value     {number}   raw number to animate to
 *   formatter {function} e.g. n => `$${n.toLocaleString()}`
 *   sub       {string}   subtitle below the value
 *   color     {string}   accent color (default indigo)
 */
export default function ResultHero({ label, value, formatter, sub, color = '#6366f1' }) {
  const [display, setDisplay] = useState(formatter ? formatter(0) : '0')
  const rafRef      = useRef(null)
  const prevValRef  = useRef(null)

  useEffect(() => {
    if (value === prevValRef.current) return
    prevValRef.current = value

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(formatter ? formatter(value) : String(value))
      return
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const duration = 700

    function step(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const cur = Math.round(value * eased)
      setDisplay(formatter ? formatter(cur) : String(cur))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, formatter])

  // Build gradient from color
  const lighter = color + 'cc'

  return (
    <>
      <div className="result-hero-card" style={{ '--rc': color, '--rc-light': lighter }}>
        <div className="rhc-label">{label}</div>
        <div className="rhc-value" key={value}>{display}</div>
        {sub && <div className="rhc-sub">{sub}</div>}
      </div>

      <style>{`
        .result-hero-card {
          background: linear-gradient(135deg, var(--rc), var(--rc-light));
          border-radius: 14px;
          padding: 22px 20px;
          text-align: center;
          animation: fadeUp 0.4s ease both;
        }
        .rhc-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.7);
          margin-bottom: 7px;
        }
        .rhc-value {
          font-family: 'Syne', sans-serif;
          font-size: 38px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1.5px;
          line-height: 1;
          margin-bottom: 6px;
          animation: countUp 0.5s ease both;
        }
        .rhc-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.72);
          line-height: 1.4;
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
