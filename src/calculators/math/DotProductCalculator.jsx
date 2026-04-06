import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = v => (v === null || isNaN(v)) ? '—' : parseFloat(v.toFixed(6)).toString()

function VecInput({ label, vec, onChange, color, dim = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color, display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {['x', 'y', 'z'].slice(0, dim).map((ax, i) => (
          <div key={ax} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginBottom: 3 }}>{ax}</div>
            <input type="number" value={vec[i]}
              onChange={e => { const v = [...vec]; v[i] = +e.target.value; onChange(v) }}
              style={{ width: '100%', height: 44, border: `1.5px solid ${color}40`, borderRadius: 9, textAlign: 'center', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = color}
              onBlur={e => e.target.style.borderColor = color + '40'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function VecDisplay({ label, vec, color }) {
  return (
    <div style={{ background: color + '08', border: `1.5px solid ${color}30`, borderRadius: 12, padding: '13px 16px', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 20, color: 'var(--text-3)' }}>[</span>
        {vec.map((v, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: `1px solid ${color}25` }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 2 }}>{['x', 'y', 'z'][i]}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(v)}</div>
          </div>
        ))}
        <span style={{ fontSize: 20, color: 'var(--text-3)' }}>]</span>
      </div>
    </div>
  )
}

const FAQ = [
  { q: 'What does the dot product tell you?', a: 'The dot product a·b = |a||b|cos(θ) measures how much two vectors "agree" in direction. When θ=0°, cos(θ)=1 — maximum positive (same direction). When θ=90°, cos(θ)=0 — vectors are perpendicular (orthogonal). When θ=180°, cos(θ)=-1 — opposite directions. A zero dot product proves perpendicularity.' },
  { q: 'What is the dot product used for?', a: 'Key applications: (1) Angle between vectors — θ = arccos(a·b / |a||b|). (2) Projection — how much of vector b is in the direction of a. (3) Work — W = F·d (force dot displacement). (4) Machine learning — neural network weight calculations. (5) Checking perpendicularity.' },
  { q: 'How is dot product different from cross product?', a: 'Dot product: scalar result, works in any dimension, tells you about alignment. Cross product: vector result, only in 3D, gives a vector perpendicular to both inputs. |a×b| = |a||b|sin(θ), so it is zero when vectors are parallel (sin 0° = 0), maximum when perpendicular.' },
  { q: 'What does a negative dot product mean?', a: 'A negative dot product means the angle between the vectors is greater than 90° (obtuse). The vectors point in "opposite enough" directions that their projections conflict. In physics, negative work happens when force and displacement have an obtuse angle (e.g., friction opposing motion).' },
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

export default function DotProductCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [a, setA] = useState([3, 4, 0])
  const [b, setB] = useState([1, 0, 0])
  const [openFaq, setOpenFaq] = useState(null)

  const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
  const magA = Math.sqrt(a[0]**2 + a[1]**2 + a[2]**2)
  const magB = Math.sqrt(b[0]**2 + b[1]**2 + b[2]**2)
  const cosTheta = magA > 0 && magB > 0 ? dot / (magA * magB) : null
  const theta = cosTheta !== null ? Math.acos(Math.min(1, Math.max(-1, cosTheta))) * 180 / Math.PI : null
  const isPerp = Math.abs(dot) < 1e-9
  const projAonB = magB > 0 ? dot / magB : null
  const projBonA = magA > 0 ? dot / magA : null

  // Step-by-step
  const steps = [
    `a·b = (${a[0]})(${b[0]}) + (${a[1]})(${b[1]}) + (${a[2]})(${b[2]})`,
    `     = ${a[0]*b[0]} + ${a[1]*b[1]} + ${a[2]*b[2]}`,
    `     = ${dot}`,
  ]

  const hint = `a·b = ${dot.toFixed(4)}. Angle = ${theta?.toFixed(2)}°. ${isPerp ? 'Vectors are PERPENDICULAR.' : `|a|=${fmt(magA)}, |b|=${fmt(magB)}.`}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Dot Product</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>a · b = |a||b|cos(θ)</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', background: isPerp ? '#d1fae5' : C + '15', borderRadius: 10, textAlign: 'center', border: `1px solid ${isPerp ? '#10b98140' : C + '30'}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: isPerp ? '#10b981' : C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(dot)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>a · b</div>
          </div>
          {theta !== null && (
            <div style={{ padding: '10px 16px', background: 'var(--bg-raised)', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{theta.toFixed(2)}°</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>angle θ</div>
            </div>
          )}
        </div>
      </div>

      <CalcShell
        left={<>
          <VecInput label="Vector a" vec={a} onChange={setA} color={C} />
          <VecInput label="Vector b" vec={b} onChange={setB} color="#ef4444" />

          {/* Presets */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Try these</div>
            {[
              { l: 'Perpendicular', a: [1, 0, 0], b: [0, 1, 0] },
              { l: 'Parallel', a: [1, 2, 3], b: [2, 4, 6] },
              { l: 'Opposite', a: [1, 0, 0], b: [-1, 0, 0] },
              { l: '45° apart', a: [1, 1, 0], b: [1, 0, 0] },
            ].map((p, i) => (
              <button key={i} onClick={() => { setA(p.a); setB(p.b) }}
                style={{ display: 'block', width: '100%', padding: '7px 12px', marginBottom: 5, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: 'var(--text)' }}>
                {p.l} — a={JSON.stringify(p.a)}, b={JSON.stringify(p.b)}
              </button>
            ))}
          </div>
        </>}

        right={<>
          {/* Perpendicular badge */}
          {isPerp && (
            <div style={{ padding: '12px 15px', background: '#d1fae5', borderRadius: 10, border: '1px solid #10b98130', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>✓ Vectors are PERPENDICULAR</div>
              <div style={{ fontSize: 12, color: '#065f46', marginTop: 2 }}>a · b = 0 → θ = 90°</div>
            </div>
          )}

          {/* Step-by-step */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Step-by-step calculation</div>
            {steps.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: i === steps.length - 1 ? C : 'var(--text-2)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4, fontWeight: i === steps.length - 1 ? 700 : 400 }}>{s}</div>
            ))}
          </div>

          <BreakdownTable title="Results" rows={[
            { label: 'Dot product a·b', value: fmt(dot), bold: true, highlight: true, color: C },
            { label: 'Angle θ', value: theta !== null ? `${theta.toFixed(4)}°` : '—' },
            { label: 'cos(θ)', value: cosTheta !== null ? fmt(cosTheta) : '—' },
            { label: '|a| magnitude', value: fmt(magA) },
            { label: '|b| magnitude', value: fmt(magB) },
            { label: 'proj of b onto a', value: projBonA !== null ? fmt(projBonA) : '—' },
            { label: 'proj of a onto b', value: projAonB !== null ? fmt(projAonB) : '—' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Visual angle diagram */}
      <Sec title="Angle visualization" sub={theta !== null ? `${theta.toFixed(2)}° between vectors` : ''}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="240" height="200" viewBox="0 0 240 200">
            <line x1="120" y1="150" x2="210" y2="150" stroke={C} strokeWidth="2.5" markerEnd="url(#arrowA)" />
            {theta !== null && (() => {
              const ang = theta * Math.PI / 180
              const ex = 120 + 80 * Math.cos(-ang)
              const ey = 150 + 80 * Math.sin(-ang)
              return <line x1="120" y1="150" x2={ex.toFixed(1)} y2={ey.toFixed(1)} stroke="#ef4444" strokeWidth="2.5" />
            })()}
            {theta !== null && theta > 0 && (() => {
              const ang = theta * Math.PI / 180
              const largeArc = theta > 180 ? 1 : 0
              const arcX = 120 + 30 * Math.cos(-ang)
              const arcY = 150 + 30 * Math.sin(-ang)
              return <path d={`M 150 150 A 30 30 0 ${largeArc} 0 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            })()}
            <text x="120" y="170" textAnchor="middle" fontSize="11" fill="var(--text-3)">O</text>
            <text x="215" y="148" fontSize="12" fontWeight="700" fill={C}>a</text>
            <text x="120" y="60" fontSize="12" fontWeight="700" fill="#ef4444">b</text>
            {theta !== null && <text x="155" y="138" fontSize="11" fill="#f59e0b">{theta.toFixed(1)}°</text>}
            <defs>
              <marker id="arrowA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={C} />
              </marker>
            </defs>
          </svg>
        </div>
      </Sec>

      <FormulaCard
        formula={'a·b = a₁b₁ + a₂b₂ + a₃b₃\na·b = |a||b|cos(θ)\nθ = arccos(a·b / |a||b|)\nIf a·b = 0 → vectors are perpendicular'}
        variables={[
          { symbol: 'a·b', meaning: 'Dot product — scalar result' },
          { symbol: 'θ', meaning: 'Angle between vectors (0° to 180°)' },
          { symbol: '|a|', meaning: 'Magnitude of vector a = √(a₁²+a₂²+a₃²)' },
        ]}
        explanation="The dot product combines two vectors into a single number. It measures alignment: positive when vectors point in similar directions, zero when perpendicular, negative when pointing in opposite directions. It is the fundamental tool for finding angles between vectors and computing projections."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
