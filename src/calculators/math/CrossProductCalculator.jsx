import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = v => (v === null || isNaN(v)) ? '—' : parseFloat(v.toFixed(6)).toString()

function VecInput({ label, vec, onChange, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color, display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {['x', 'y', 'z'].map((ax, i) => (
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
  { q: 'What is the cross product?', a: 'The cross product a×b produces a vector perpendicular to both a and b. Its magnitude = |a||b|sin(θ), which equals the area of the parallelogram formed by the two vectors. Unlike the dot product, the cross product only works in 3D space.' },
  { q: 'What does the direction of the cross product tell you?', a: 'Direction follows the right-hand rule: curl your fingers from a toward b, and your thumb points in the direction of a×b. Important: a×b = -(b×a). The cross product is anticommutative — swapping the order reverses the direction.' },
  { q: 'When is the cross product zero?', a: 'a×b = 0 when the vectors are parallel or anti-parallel (θ = 0° or 180°), because sin(0°) = sin(180°) = 0. If a×b = 0 and both vectors are nonzero, they must be scalar multiples of each other.' },
  { q: 'What is the cross product used for?', a: 'Key applications: (1) Finding normal vectors to planes. (2) Computing torque: τ = r×F. (3) Area of a parallelogram/triangle. (4) Angular momentum in physics. (5) Detecting if two vectors are parallel. (6) Computer graphics and 3D rotation.' },
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

export default function CrossProductCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [a, setA] = useState([1, 0, 0])
  const [b, setB] = useState([0, 1, 0])
  const [openFaq, setOpenFaq] = useState(null)

  const cx = a[1]*b[2] - a[2]*b[1]
  const cy = a[2]*b[0] - a[0]*b[2]
  const cz = a[0]*b[1] - a[1]*b[0]
  const cross = [cx, cy, cz]

  const magA = Math.sqrt(a.reduce((s, v) => s + v*v, 0))
  const magB = Math.sqrt(b.reduce((s, v) => s + v*v, 0))
  const magC = Math.sqrt(cx*cx + cy*cy + cz*cz)

  const sinTheta = magA > 0 && magB > 0 ? magC / (magA * magB) : null
  const theta = sinTheta !== null ? Math.asin(Math.min(1, Math.abs(sinTheta))) * 180 / Math.PI : null
  const areaParallelogram = magC
  const areaTriangle = magC / 2
  const isParallel = magC < 1e-9

  const steps = [
    { label: 'x component', calc: `(${a[1]})(${b[2]}) − (${a[2]})(${b[1]}) = ${a[1]*b[2]} − ${a[2]*b[1]} = ${cx}` },
    { label: 'y component', calc: `(${a[2]})(${b[0]}) − (${a[0]})(${b[2]}) = ${a[2]*b[0]} − ${a[0]*b[2]} = ${cy}` },
    { label: 'z component', calc: `(${a[0]})(${b[1]}) − (${a[1]})(${b[0]}) = ${a[0]*b[1]} − ${a[1]*b[0]} = ${cz}` },
  ]

  const hint = `a×b = [${fmt(cx)}, ${fmt(cy)}, ${fmt(cz)}]. |a×b| = ${fmt(magC)}. Parallelogram area = ${fmt(areaParallelogram)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Cross Product</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>a × b = |a||b|sin(θ) n̂</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 14px', background: isParallel ? '#d1fae5' : C + '15', borderRadius: 10, textAlign: 'center', border: `1px solid ${isParallel ? '#10b981' : C}30` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: isParallel ? '#10b981' : C, fontFamily: "'Space Grotesk',sans-serif" }}>[{fmt(cx)}, {fmt(cy)}, {fmt(cz)}]</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>result vector</div>
          </div>
          <div style={{ padding: '8px 14px', background: 'var(--bg-raised)', borderRadius: 10, textAlign: 'center', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(magC)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>magnitude |a×b|</div>
          </div>
        </div>
      </div>

      <CalcShell
        left={<>
          <VecInput label="Vector a" vec={a} onChange={setA} color={C} />
          <VecInput label="Vector b" vec={b} onChange={setB} color="#ef4444" />

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Try these</div>
            {[
              { l: 'i × j = k (standard basis)', a: [1,0,0], b: [0,1,0] },
              { l: 'j × k = i', a: [0,1,0], b: [0,0,1] },
              { l: 'Parallel (result = 0)', a: [1,2,3], b: [2,4,6] },
              { l: 'Torque example', a: [0,0,1], b: [1,0,0] },
            ].map((p, i) => (
              <button key={i} onClick={() => { setA(p.a); setB(p.b) }}
                style={{ display: 'block', width: '100%', padding: '7px 12px', marginBottom: 5, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: 'var(--text)' }}>
                {p.l}
              </button>
            ))}
          </div>
        </>}

        right={<>
          {isParallel && (
            <div style={{ padding: '12px 15px', background: '#d1fae5', borderRadius: 10, border: '1px solid #10b98130', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Vectors are PARALLEL</div>
              <div style={{ fontSize: 12, color: '#065f46', marginTop: 2 }}>a×b = [0,0,0]</div>
            </div>
          )}

          <VecDisplay label="Result: a × b" vec={cross} color={C} />

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Step-by-step (cofactor expansion)</div>
            {steps.map((s, i) => (
              <div key={i} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 7, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{s.calc}</div>
              </div>
            ))}
          </div>

          <BreakdownTable title="Derived values" rows={[
            { label: '|a × b| magnitude', value: fmt(magC), bold: true, highlight: true, color: C },
            { label: 'sin(θ)', value: sinTheta !== null ? fmt(sinTheta) : '—' },
            { label: 'Angle θ', value: theta !== null ? `${theta.toFixed(4)}°` : '—' },
            { label: 'Parallelogram area', value: fmt(areaParallelogram) },
            { label: 'Triangle area (½|a×b|)', value: fmt(areaTriangle) },
            { label: '|a|', value: fmt(magA) },
            { label: '|b|', value: fmt(magB) },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Right-hand rule visual */}
      <Sec title="Right-hand rule" sub="Direction of the cross product">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* a */}
            <line x1="80" y1="100" x2="140" y2="100" stroke={C} strokeWidth="2.5" markerEnd="url(#arrA)" />
            <text x="148" y="104" fontSize="12" fontWeight="700" fill={C}>a</text>
            {/* b */}
            <line x1="80" y1="100" x2="80" y2="40" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrB)" />
            <text x="70" y="34" fontSize="12" fontWeight="700" fill="#ef4444">b</text>
            {/* c = a×b (out of page) */}
            <circle cx="80" cy="100" r="12" fill="none" stroke="#10b981" strokeWidth="2" />
            <circle cx="80" cy="100" r="3" fill="#10b981" />
            <text x="98" y="122" fontSize="10" fill="#10b981" fontWeight="700">a×b</text>
            <text x="98" y="133" fontSize="9" fill="var(--text-3)">(out of page)</text>
            <defs>
              <marker id="arrA" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={C} /></marker>
              <marker id="arrB" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#ef4444" /></marker>
            </defs>
          </svg>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>How to apply the right-hand rule</div>
            {['Point fingers in direction of a', 'Curl toward direction of b', 'Thumb points in direction of a×b'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: C + '18', color: C, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Sec>

      <FormulaCard
        formula={'a×b = [a₂b₃−a₃b₂, a₃b₁−a₁b₃, a₁b₂−a₂b₁]\n|a×b| = |a||b|sin(θ)\nArea of parallelogram = |a×b|\nArea of triangle = ½|a×b|'}
        variables={[
          { symbol: 'a×b', meaning: 'Cross product — vector perpendicular to both a and b' },
          { symbol: 'θ', meaning: 'Angle between vectors a and b' },
          { symbol: 'n̂', meaning: 'Unit normal vector (right-hand rule direction)' },
        ]}
        explanation="The cross product is computed using the 2×2 cofactor expansion of a 3×3 determinant with i,j,k basis vectors. The result is always perpendicular to both input vectors. The magnitude equals the area of the parallelogram spanned by the two vectors."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
