import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const PI = Math.PI
const fmt = (v, dp = 4) => isFinite(v) ? parseFloat(v.toFixed(dp)).toString() : '—'

// Standard unit circle angles with exact values
const ANGLES = [
  { deg: 0,   rad: 0,      label: '0',        cosX: '1',     sinY: '0',     cos: 1,            sin: 0,           tan: '0' },
  { deg: 30,  rad: PI/6,   label: 'π/6',      cosX: '√3/2',  sinY: '1/2',   cos: Math.sqrt(3)/2, sin: 0.5,       tan: '1/√3' },
  { deg: 45,  rad: PI/4,   label: 'π/4',      cosX: '√2/2',  sinY: '√2/2',  cos: Math.sqrt(2)/2, sin: Math.sqrt(2)/2, tan: '1' },
  { deg: 60,  rad: PI/3,   label: 'π/3',      cosX: '1/2',   sinY: '√3/2',  cos: 0.5,          sin: Math.sqrt(3)/2, tan: '√3' },
  { deg: 90,  rad: PI/2,   label: 'π/2',      cosX: '0',     sinY: '1',     cos: 0,            sin: 1,           tan: 'undef' },
  { deg: 120, rad: 2*PI/3, label: '2π/3',     cosX: '-1/2',  sinY: '√3/2',  cos: -0.5,         sin: Math.sqrt(3)/2, tan: '-√3' },
  { deg: 135, rad: 3*PI/4, label: '3π/4',     cosX: '-√2/2', sinY: '√2/2',  cos: -Math.sqrt(2)/2, sin: Math.sqrt(2)/2, tan: '-1' },
  { deg: 150, rad: 5*PI/6, label: '5π/6',     cosX: '-√3/2', sinY: '1/2',   cos: -Math.sqrt(3)/2, sin: 0.5,      tan: '-1/√3' },
  { deg: 180, rad: PI,     label: 'π',        cosX: '-1',    sinY: '0',     cos: -1,           sin: 0,           tan: '0' },
  { deg: 210, rad: 7*PI/6, label: '7π/6',     cosX: '-√3/2', sinY: '-1/2',  cos: -Math.sqrt(3)/2, sin: -0.5,     tan: '1/√3' },
  { deg: 225, rad: 5*PI/4, label: '5π/4',     cosX: '-√2/2', sinY: '-√2/2', cos: -Math.sqrt(2)/2, sin: -Math.sqrt(2)/2, tan: '1' },
  { deg: 240, rad: 4*PI/3, label: '4π/3',     cosX: '-1/2',  sinY: '-√3/2', cos: -0.5,         sin: -Math.sqrt(3)/2, tan: '√3' },
  { deg: 270, rad: 3*PI/2, label: '3π/2',     cosX: '0',     sinY: '-1',    cos: 0,            sin: -1,          tan: 'undef' },
  { deg: 300, rad: 5*PI/3, label: '5π/3',     cosX: '1/2',   sinY: '-√3/2', cos: 0.5,          sin: -Math.sqrt(3)/2, tan: '-√3' },
  { deg: 315, rad: 7*PI/4, label: '7π/4',     cosX: '√2/2',  sinY: '-√2/2', cos: Math.sqrt(2)/2, sin: -Math.sqrt(2)/2, tan: '-1' },
  { deg: 330, rad: 11*PI/6,label: '11π/6',    cosX: '√3/2',  sinY: '-1/2',  cos: Math.sqrt(3)/2, sin: -0.5,      tan: '-1/√3' },
]

const QUAD_COLORS = { I: '#10b981', II: '#3b82f6', III: '#f59e0b', IV: '#ef4444' }
function getQuad(deg) {
  if (deg < 90) return 'I'
  if (deg < 180) return 'II'
  if (deg < 270) return 'III'
  return 'IV'
}

const FAQ = [
  { q: 'What is the unit circle?', a: 'The unit circle is a circle of radius 1 centered at the origin (0,0). For any angle θ, the point on the unit circle is (cos θ, sin θ). This makes the unit circle the foundation of trigonometry — all six trig functions can be read directly from it.' },
  { q: 'Why do we use radians on the unit circle?', a: 'On the unit circle (radius=1), the arc length equals the angle in radians: s = rθ = 1×θ = θ. So 90° = π/2 rad means the arc length from 0 to the top is exactly π/2. This makes calculus and analysis elegant — derivatives of trig functions require radians.' },
  { q: 'How do I remember the values?', a: 'For the first quadrant, sin increases from 0 to 1 as you go from 0° to 90°: sin(0°)=0, sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1. Cos follows the reverse. Remember the "0,1,2,3,4 under the square root divided by 2" pattern: √0/2, √1/2, √2/2, √3/2, √4/2.' },
  { q: 'What does ASTC / CAST mean?', a: 'ASTC (All Students Take Calculus) shows which trig functions are positive in each quadrant: Quadrant I — All positive; II — Sine positive; III — Tan positive; IV — Cos positive. This is because signs of coordinates depend on the quadrant.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function UnitCircleReferenceCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [selected, setSelected] = useState(ANGLES[2]) // 45° default
  const [showDeg, setShowDeg] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  const R = 110 // SVG circle radius
  const CX = 140, CY = 140 // SVG center
  const rad = selected.rad
  const px = CX + R * Math.cos(-rad)
  const py = CY + R * Math.sin(-rad)
  const quad = getQuad(selected.deg)
  const quadColor = QUAD_COLORS[quad]

  const hint = `At ${selected.deg}° (${selected.label} rad): cos=${selected.cosX}, sin=${selected.sinY}, tan=${selected.tan}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Unit Circle</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>(cos θ, sin θ) — radius = 1</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'cos θ', v: selected.cosX }, { l: 'sin θ', v: selected.sinY }, { l: 'tan θ', v: selected.tan }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: interactive circle */}
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Interactive circle</div>
            <button onClick={() => setShowDeg(!showDeg)}
              style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}40`, background: C + '12', fontSize: 11, color: C, fontWeight: 600, cursor: 'pointer' }}>
              {showDeg ? 'Show rad' : 'Show deg'}
            </button>
          </div>
          <svg width="100%" viewBox="0 0 280 280" style={{ display: 'block' }}>
            {/* Quadrant backgrounds */}
            <rect x={CX} y={0} width={CX} height={CY} fill="#10b98108" rx="2" />
            <rect x={0} y={0} width={CX} height={CY} fill="#3b82f608" rx="2" />
            <rect x={0} y={CY} width={CX} height={CY} fill="#f59e0b08" rx="2" />
            <rect x={CX} y={CY} width={CX} height={CY} fill="#ef444408" rx="2" />

            {/* Quadrant labels */}
            {[{ q: 'I', x: CX+60, y: 28, c: '#10b981' }, { q: 'II', x: CX-60, y: 28, c: '#3b82f6' }, { q: 'III', x: CX-60, y: 270, c: '#f59e0b' }, { q: 'IV', x: CX+60, y: 270, c: '#ef4444' }].map(q => (
              <text key={q.q} x={q.x} y={q.y} textAnchor="middle" fontSize="11" fontWeight="700" fill={q.c} opacity="0.6">{q.q}</text>
            ))}

            {/* Axes */}
            <line x1={0} y1={CY} x2={280} y2={CY} stroke="var(--text-3)" strokeWidth="1" />
            <line x1={CX} y1={0} x2={CX} y2={280} stroke="var(--text-3)" strokeWidth="1" />

            {/* Circle */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="1.5" />

            {/* Angle arc */}
            {selected.deg > 0 && (() => {
              const endRad = -rad
              const endX = CX + 30 * Math.cos(0)
              const endY = CY + 30 * Math.sin(0)
              const arcX = CX + 30 * Math.cos(endRad)
              const arcY = CY + 30 * Math.sin(endRad)
              const largeArc = selected.deg > 180 ? 1 : 0
              return <path d={`M ${endX} ${endY} A 30 30 0 ${largeArc} 0 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`} fill="none" stroke={quadColor} strokeWidth="2" />
            })()}

            {/* Radius line */}
            <line x1={CX} y1={CY} x2={px.toFixed(2)} y2={py.toFixed(2)} stroke={quadColor} strokeWidth="2" strokeLinecap="round" />

            {/* Cos & Sin lines */}
            <line x1={px.toFixed(2)} y1={py.toFixed(2)} x2={px.toFixed(2)} y2={CY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
            <line x1={CX} y1={CY} x2={px.toFixed(2)} y2={CY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />

            {/* Point */}
            <circle cx={px.toFixed(2)} cy={py.toFixed(2)} r="6" fill={quadColor} stroke="white" strokeWidth="2" />

            {/* Coordinate label — positioned to avoid overflow */}
            {(() => {
              const offsetX = px > CX ? 8 : -8
              const anchorX = px > CX ? 'start' : 'end'
              const labelX = Math.max(40, Math.min(240, px + offsetX))
              const labelY = Math.max(20, Math.min(260, py - 10))
              return (
                <text x={labelX} y={labelY} textAnchor={anchorX} fontSize="10" fontWeight="700" fill={quadColor} fontFamily="monospace">
                  ({selected.cosX}, {selected.sinY})
                </text>
              )
            })()}

            {/* Angle label */}
            {(() => {
              const midRad = -rad / 2
              const lx = CX + 42 * Math.cos(midRad)
              const ly = CY + 42 * Math.sin(midRad)
              return <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" fontSize="10" fontWeight="700" fill={quadColor}>{showDeg ? selected.deg + '°' : selected.label}</text>
            })()}

            {/* Axis labels */}
            {[{x:CX+R+10,y:CY+4,t:'1'},{x:CX-R-8,y:CY+4,t:'-1'},{x:CX+4,y:16,t:'1'},{x:CX+4,y:CY+CY-4,t:'-1'}].map((l,i)=>(
              <text key={i} x={l.x} y={l.y} textAnchor={i < 2 ? 'middle' : 'start'} fontSize="9" fill="var(--text-3)">{l.t}</text>
            ))}
          </svg>
        </div>

        {/* Right: angle picker + values */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '13px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Select angle</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {ANGLES.map((a, i) => (
                <button key={i} onClick={() => setSelected(a)}
                  style={{ padding: '7px 8px', borderRadius: 7, border: `1.5px solid ${selected.deg === a.deg ? QUAD_COLORS[getQuad(a.deg)] : 'var(--border-2)'}`, background: selected.deg === a.deg ? QUAD_COLORS[getQuad(a.deg)] + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: selected.deg === a.deg ? QUAD_COLORS[getQuad(a.deg)] : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{showDeg ? a.deg + '°' : a.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '13px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Values at {selected.deg}° ({selected.label} rad)</div>
            {[
              { l: 'cos θ', v: selected.cosX, n: fmt(selected.cos), c: '#10b981' },
              { l: 'sin θ', v: selected.sinY, n: fmt(selected.sin), c: '#ef4444' },
              { l: 'tan θ', v: selected.tan,  n: selected.tan === 'undef' ? 'undefined' : fmt(Math.tan(selected.rad)), c: '#f59e0b' },
              { l: 'cot θ', v: selected.tan === 'undef' ? '0' : selected.cos === 0 ? 'undef' : null, n: selected.sin !== 0 ? fmt(selected.cos / selected.sin) : 'undefined', c: '#8b5cf6' },
              { l: 'sec θ', v: null, n: selected.cos !== 0 ? fmt(1 / selected.cos) : 'undefined', c: '#3b82f6' },
              { l: 'csc θ', v: null, n: selected.sin !== 0 ? fmt(1 / selected.sin) : 'undefined', c: '#6366f1' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: row.c, fontWeight: 600 }}>{row.l}</span>
                <div style={{ textAlign: 'right' }}>
                  {row.v && <div style={{ fontSize: 13, fontWeight: 700, color: row.c, fontFamily: "'Space Grotesk',sans-serif" }}>{row.v}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>≈ {row.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full reference table */}
      <Sec title="Complete unit circle reference table">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Degrees', 'Radians', 'cos θ', 'sin θ', 'tan θ'].map(h => (
                <th key={h} style={{ padding: '8px 10px', background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-3)', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {ANGLES.map((a, i) => {
                const qc = QUAD_COLORS[getQuad(a.deg)]
                const isSelected = selected.deg === a.deg
                return (
                  <tr key={i} onClick={() => setSelected(a)} style={{ cursor: 'pointer', background: isSelected ? qc + '10' : 'transparent' }}>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, color: qc, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.deg}°</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.label}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#10b981', fontWeight: 600, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.cosX}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#ef4444', fontWeight: 600, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.sinY}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#f59e0b', fontWeight: 600, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.tan}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="ASTC — sign rules by quadrant">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { q: 'Quadrant I', range: '0° – 90°', pos: 'sin ✓ cos ✓ tan ✓', color: '#10b981' },
            { q: 'Quadrant II', range: '90° – 180°', pos: 'sin ✓ cos ✗ tan ✗', color: '#3b82f6' },
            { q: 'Quadrant III', range: '180° – 270°', pos: 'sin ✗ cos ✗ tan ✓', color: '#f59e0b' },
            { q: 'Quadrant IV', range: '270° – 360°', pos: 'sin ✗ cos ✓ tan ✗', color: '#ef4444' },
          ].map((qd, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: qd.color + '08', border: `1px solid ${qd.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: qd.color, marginBottom: 3 }}>{qd.q}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 5 }}>{qd.range}</div>
              <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{qd.pos}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Point on unit circle: (cos θ, sin θ)\ntan θ = sin θ / cos θ\ncot θ = cos θ / sin θ\nsec θ = 1/cos θ\ncsc θ = 1/sin θ'}
        variables={[
          { symbol: 'θ', meaning: 'Angle measured from positive x-axis' },
          { symbol: 'cos θ', meaning: 'x-coordinate of point on unit circle' },
          { symbol: 'sin θ', meaning: 'y-coordinate of point on unit circle' },
          { symbol: 'r', meaning: 'Radius = 1 (unit circle)' },
        ]}
        explanation="The unit circle defines all six trig functions geometrically. Any angle θ corresponds to a unique point (cos θ, sin θ) on the circle. The x-coordinate is cosine, y-coordinate is sine. Tan = sin/cos is the slope of the radius line. All exact values shown use simplified radical form."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>

      <AIHintCard hint={hint} />
    </div>
  )
}
