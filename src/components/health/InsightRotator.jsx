import { useState, useEffect, useRef } from 'react'

/**
 * InsightRotator — rotating insight card for health calculators
 *
 * USAGE:
 *   import InsightRotator from '../path/to/InsightRotator'
 *
 *   <InsightRotator
 *     catColor="#10b981"
 *     title="Frame Size"
 *     slides={[
 *       { label:'Your result',   content:<YourComponent/> },
 *       { label:'What it means', content:<AnotherComponent/> },
 *       { label:'Population',    content:<PopComponent/> },
 *       { label:'Impact',        content:<ImpactComponent/> },
 *     ]}
 *   />
 *
 * Props:
 *   catColor   string   accent colour hex
 *   title      string   card header title
 *   slides     Array<{ label: string, content: ReactNode }>
 *   autoMs     number   auto-rotate interval ms (default 3500)
 */
export default function InsightRotator({ catColor = '#10b981', title = 'Results', slides = [], autoMs = 3500 }) {
  const [cur, setCur]   = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)
  const total = slides.length

  function goTo(i) { setCur((i + total) % total) }

  useEffect(() => {
    if (paused || total <= 1) return
    timerRef.current = setInterval(() => setCur(c => (c + 1) % total), autoMs)
    return () => clearInterval(timerRef.current)
  }, [paused, total, autoMs])

  if (!slides.length) return null

  return (
    <div
      style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* header */}
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif" }}>
          {slides[cur]?.label} · {cur + 1}/{total}
        </span>
      </div>

      {/* slide content */}
      <div style={{ padding:'16px 18px', minHeight:160 }}>
        {slides[cur]?.content}
      </div>

      {/* dot nav */}
      <div style={{ padding:'0 18px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <button
          onClick={() => goTo(cur - 1)}
          style={{ background:'none', border:'0.5px solid var(--border)', borderRadius:7, padding:'3px 10px', fontSize:12, color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit' }}
        >←</button>
        <div style={{ flex:1, display:'flex', justifyContent:'center', gap:6 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === cur ? 18 : 7, height:7, borderRadius:4,
                background: i === cur ? catColor : 'var(--border)',
                cursor:'pointer', transition:'all .25s ease', flexShrink:0,
              }}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(cur + 1)}
          style={{ background:'none', border:'0.5px solid var(--border)', borderRadius:7, padding:'3px 10px', fontSize:12, color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit' }}
        >→</button>
      </div>
    </div>
  )
}
