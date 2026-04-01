import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6) return (val/1e6).toFixed(3) + ' M' + unit
  if (abs >= 1e3) return (val/1e3).toFixed(3) + ' k' + unit
  if (abs >= 1)   return val.toFixed(3) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(3) + ' m' + unit
  return val.toExponential(3) + ' ' + unit
}

const LOADING_CASES = [
  { id: 'simply_point_center', label: 'Simply supported — centre point load', icon: '🔻' },
  { id: 'simply_point_any',    label: 'Simply supported — off-centre point load', icon: '↓' },
  { id: 'simply_udl',          label: 'Simply supported — UDL', icon: '⬇️' },
  { id: 'cantilever_point',    label: 'Cantilever — end point load', icon: '↩' },
  { id: 'cantilever_udl',      label: 'Cantilever — UDL', icon: '⬅️' },
]

const BEAM_MATERIALS = [
  { name: 'Structural steel',   E: 200e9, fy: 250e6 },
  { name: 'Aluminium (6061)',   E: 69e9,  fy: 276e6 },
  { name: 'Concrete (C25)',     E: 30e9,  fy: 25e6  },
  { name: 'Douglas fir timber', E: 13e9,  fy: 38e6  },
  { name: 'Custom',             E: null,  fy: null   },
]

const FAQ = [
  { q: 'What is the difference between a simply supported and cantilever beam?', a: 'A simply supported beam rests freely on two supports — both ends can rotate. A cantilever beam is fixed at one end (wall mount) and free at the other. Cantilevers develop large bending moments at the fixed end, while simply supported beams develop maximum moment at or near midspan.' },
  { q: 'What is a UDL?', a: 'UDL (Uniformly Distributed Load) is a load spread evenly over the full length of a beam — like the weight of a floor slab, snow load, or self-weight. Units are force per unit length (kN/m or kN/ft). Total load = UDL × beam length. A point load is concentrated at one location.' },
  { q: 'How do I size a beam from bending moment?', a: 'Required section modulus S = M_max / f_allow, where f_allow is the allowable bending stress for your material (typically fy/1.5 for steel). For a rectangular section, S = b×h²/6. Choose a standard section (I-beam, channel) with S greater than your required value from steel/timber tables.' },
  { q: 'What is shear force?', a: 'Shear force is the internal transverse force resisting sliding between beam sections. For a simply supported beam with central point load P, shear = P/2 everywhere except at the load point where it jumps. Shear stress τ = V×Q/(I×b) must be checked against allowable shear stress, especially for deep beams.' },
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

export default function BeamLoadCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [caseId, setCaseId] = useState('simply_point_center')
  const [span, setSpan] = useState(6)
  const [load, setLoad] = useState(20)
  const [dist_a, setDist_a] = useState(2)
  const [matIdx, setMatIdx] = useState(0)
  const [customE, setCustomE] = useState(200e9)
  const [width, setWidth] = useState(200)
  const [depth, setDepth] = useState(400)
  const [openFaq, setOpenFaq] = useState(null)

  const mat = BEAM_MATERIALS[matIdx]
  const E = mat.E || customE
  const L = span
  const P = load * 1000 // kN to N
  const w = load * 1000 // kN/m to N/m for UDL
  const a = dist_a
  const b = L - a

  // Section properties (rectangular)
  const bw = width / 1000, d = depth / 1000
  const I = (bw * Math.pow(d, 3)) / 12
  const S = I / (d / 2)

  let Ra, Rb, Mmax, Vmax, defMax, Mmax_loc

  if (caseId === 'simply_point_center') {
    Ra = P / 2; Rb = P / 2
    Mmax = P * L / 4
    Vmax = P / 2
    defMax = P * Math.pow(L, 3) / (48 * E * I)
    Mmax_loc = L / 2
  } else if (caseId === 'simply_point_any') {
    Ra = P * b / L; Rb = P * a / L
    Mmax = Ra * a
    Vmax = Math.max(Ra, Rb)
    defMax = P * a * b * Math.sqrt(3 * a * (a + 2 * b)) / (27 * E * I * L)
    Mmax_loc = a
  } else if (caseId === 'simply_udl') {
    Ra = w * L / 2; Rb = w * L / 2
    Mmax = w * L * L / 8
    Vmax = w * L / 2
    defMax = 5 * w * Math.pow(L, 4) / (384 * E * I)
    Mmax_loc = L / 2
  } else if (caseId === 'cantilever_point') {
    Ra = P; Rb = 0
    Mmax = P * L
    Vmax = P
    defMax = P * Math.pow(L, 3) / (3 * E * I)
    Mmax_loc = 0
  } else { // cantilever_udl
    Ra = w * L; Rb = 0
    Mmax = w * L * L / 2
    Vmax = w * L
    defMax = w * Math.pow(L, 4) / (8 * E * I)
    Mmax_loc = 0
  }

  const bendingStress = Mmax / S
  const defLimit = L / 360
  const defOk = defMax <= defLimit
  const stressOk = mat.fy ? bendingStress <= mat.fy / 1.5 : true

  const hint = `M_max=${fmtSI(Mmax,'N·m')}, V_max=${fmtSI(Vmax,'N')}, δ_max=${(defMax*1000).toFixed(2)}mm (limit L/360=${(defLimit*1000).toFixed(1)}mm). ${defOk ? 'Deflection OK.' : '⚠️ Deflection exceeds L/360.'}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Beam Load Analysis</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Reactions · Shear · Bending Moment · Deflection</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'M_max', v: fmtSI(Mmax, 'N·m') }, { l: 'δ_max', v: `${(defMax*1000).toFixed(2)}mm` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading case selector */}
      <Sec title="Loading configuration" sub="Select beam type and loading">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LOADING_CASES.map(lc => (
            <button key={lc.id} onClick={() => setCaseId(lc.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${caseId === lc.id ? C : 'var(--border-2)'}`, background: caseId === lc.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>{lc.icon}</span>
              <span style={{ fontSize: 12, fontWeight: caseId === lc.id ? 700 : 500, color: caseId === lc.id ? C : 'var(--text)' }}>{lc.label}</span>
            </button>
          ))}
        </div>
      </Sec>

      <CalcShell
        left={<>
          {[['Beam span L (m)', span, setSpan, 0.1], [caseId.includes('udl') ? 'UDL w (kN/m)' : 'Point load P (kN)', load, setLoad, 0.001]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step="0.1" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          {caseId === 'simply_point_any' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Distance from left support (m)</label>
              <input type="number" step="0.1" value={dist_a} onChange={e => setDist_a(Math.min(span - 0.01, Math.max(0.01, +e.target.value)))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Beam material</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {BEAM_MATERIALS.map((m, i) => (
                <button key={i} onClick={() => setMatIdx(i)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${matIdx === i ? C : 'var(--border-2)'}`, background: matIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: matIdx === i ? 700 : 400, color: matIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                  {m.name}{m.E ? ` — E=${(m.E/1e9).toFixed(0)} GPa` : ''}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Width b (mm)', width, setWidth], ['Depth h (mm)', depth, setDepth]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Structural analysis results" rows={[
            { label: 'Reaction Ra', value: fmtSI(Ra, 'N'), bold: true, highlight: true, color: C },
            { label: 'Reaction Rb', value: fmtSI(Rb, 'N') },
            { label: 'Max shear force', value: fmtSI(Vmax, 'N') },
            { label: 'Max bending moment', value: fmtSI(Mmax, 'N·m'), bold: true },
            { label: 'M_max location', value: `${Mmax_loc.toFixed(2)} m from A` },
            { label: 'Max deflection', value: `${(defMax*1000).toFixed(3)} mm` },
            { label: 'L/360 limit', value: `${(defLimit*1000).toFixed(1)} mm` },
            { label: 'Bending stress', value: fmtSI(bendingStress, 'Pa') },
          ]} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={{ padding: '12px 13px', borderRadius: 9, background: defOk ? '#d1fae5' : '#fee2e2', border: `1px solid ${defOk ? '#10b98130' : '#ef444430'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: defOk ? '#065f46' : '#b91c1c' }}>{defOk ? '✓ Deflection OK' : '✗ Deflection High'}</div>
              <div style={{ fontSize: 10, color: defOk ? '#065f46' : '#b91c1c', marginTop: 2 }}>{(defMax*1000).toFixed(2)}mm vs {(defLimit*1000).toFixed(1)}mm limit</div>
            </div>
            <div style={{ padding: '12px 13px', borderRadius: 9, background: stressOk ? '#d1fae5' : '#fee2e2', border: `1px solid ${stressOk ? '#10b98130' : '#ef444430'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: stressOk ? '#065f46' : '#b91c1c' }}>{stressOk ? '✓ Stress OK' : '✗ Stress High'}</div>
              <div style={{ fontSize: 10, color: stressOk ? '#065f46' : '#b91c1c', marginTop: 2 }}>σ = {(bendingStress/1e6).toFixed(1)} MPa</div>
            </div>
          </div>

          {/* Simple beam diagram */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Beam diagram</div>
            <svg width="100%" height="60" viewBox="0 0 300 60">
              <line x1="20" y1="35" x2="280" y2="35" stroke={C} strokeWidth="3"/>
              {caseId.startsWith('simply') ? <>
                <polygon points="20,35 10,50 30,50" fill={C} opacity="0.6"/>
                <polygon points="280,35 270,50 290,50" fill={C} opacity="0.6"/>
              </> : <>
                <rect x="5" y="25" width="15" height="20" fill={C} opacity="0.6"/>
              </>}
              {caseId.includes('udl') ? (
                Array.from({length:12}, (_,i) => (
                  <line key={i} x1={20 + i*22} y1="20" x2={20 + i*22} y2="33" stroke={C} strokeWidth="1.5" markerEnd="url(#arr)"/>
                ))
              ) : (
                <line x1={caseId === 'simply_point_any' ? 20 + (dist_a/span)*260 : 150} y1="10" x2={caseId === 'simply_point_any' ? 20 + (dist_a/span)*260 : 150} y2="33" stroke={C} strokeWidth="2.5"/>
              )}
              <text x="150" y="58" textAnchor="middle" fontSize="9" fill="var(--text-3)">L = {span}m</text>
            </svg>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Common beam loading reference" sub="Standard formulas for all cases">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Case', 'R_A', 'M_max', 'δ_max'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[
                ['S.S. centre point', 'P/2', 'PL/4', 'PL³/48EI'],
                ['S.S. off-centre point', 'Pb/L', 'Pab/L', 'Pab(a+2b)√(3a(a+2b))/27EIL'],
                ['S.S. UDL', 'wL/2', 'wL²/8', '5wL⁴/384EI'],
                ['Cantilever end load', 'P', 'PL', 'PL³/3EI'],
                ['Cantilever UDL', 'wL', 'wL²/2', 'wL⁴/8EI'],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '8px 10px', fontSize: j === 0 ? 12 : 11, color: j === 0 ? 'var(--text)' : C, borderBottom: '0.5px solid var(--border)', fontFamily: j > 0 ? "'Space Grotesk',sans-serif" : 'inherit', fontWeight: j > 0 ? 600 : 400 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <FormulaCard
        formula={'M_max: various (see table)\nδ_max: various (see table)\nσ = M / S\nS = I / (d/2) = bd²/6'}
        variables={[
          { symbol: 'M', meaning: 'Bending moment (N·m)' },
          { symbol: 'V', meaning: 'Shear force (N)' },
          { symbol: 'δ', meaning: 'Deflection (m)' },
          { symbol: 'E', meaning: 'Elastic modulus (Pa)' },
          { symbol: 'I', meaning: 'Second moment of area (m⁴)' },
          { symbol: 'S', meaning: 'Section modulus (m³)' },
        ]}
        explanation="Beam analysis finds reactions at supports, then bending moment and shear force diagrams. Maximum deflection and bending stress are checked against serviceability (L/360) and strength limits. Larger I (deeper beam) dramatically reduces both deflection and stress."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
