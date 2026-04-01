import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e3) return (val/1e3).toFixed(4) + ' k' + unit
  if (abs >= 1)   return val.toFixed(4) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(4) + ' m' + unit
  if (abs >= 1e-6) return (val*1e6).toFixed(4) + ' μ' + unit
  return val.toExponential(3) + ' ' + unit
}

const PIPE_SIZES = [
  { dn: 15,  od_mm: 21.3, id_mm: 15.8, label: '½" (DN15)'   },
  { dn: 20,  od_mm: 26.9, id_mm: 20.4, label: '¾" (DN20)'   },
  { dn: 25,  od_mm: 33.7, id_mm: 26.6, label: '1" (DN25)'   },
  { dn: 32,  od_mm: 42.4, id_mm: 35.1, label: '1¼" (DN32)' },
  { dn: 40,  od_mm: 48.3, id_mm: 40.9, label: '1½" (DN40)'  },
  { dn: 50,  od_mm: 60.3, id_mm: 52.5, label: '2" (DN50)'   },
  { dn: 65,  od_mm: 76.1, id_mm: 68.8, label: '2½" (DN65)'  },
  { dn: 80,  od_mm: 88.9, id_mm: 80.9, label: '3" (DN80)'   },
  { dn: 100, od_mm: 114.3,id_mm: 105.3,label: '4" (DN100)'  },
  { dn: 150, od_mm: 168.3,id_mm: 159.3,label: '6" (DN150)'  },
]

const SOLVE_FOR = ['Flow Rate (Q)', 'Velocity (v)', 'Pipe Diameter (d)']

const FAQ = [
  { q: 'What is the continuity equation in fluid mechanics?', a: 'The continuity equation states that for incompressible flow, Q = A × v (flow rate = area × velocity). Since mass must be conserved, if a pipe gets narrower, velocity must increase to maintain the same flow rate. This is why water speeds up at a nozzle.' },
  { q: 'What is the recommended flow velocity for pipes?', a: 'ASHRAE recommends: water in supply pipes 0.9–3.0 m/s (3–10 ft/s), suction pipes 0.6–1.5 m/s, drain lines 0.6–1.2 m/s. Too high velocity causes noise, erosion, and pressure drop. Too low allows sediment settling in drain lines.' },
  { q: 'How do I convert between flow units?', a: '1 L/s = 0.001 m³/s = 60 L/min = 15.85 US gpm. 1 m³/h = 0.2778 L/s = 4.403 US gpm. This calculator shows all common units simultaneously.' },
  { q: 'What is mass flow rate vs volumetric flow rate?', a: 'Volumetric flow rate (Q) measures volume per time (m³/s, L/min). Mass flow rate (ṁ) measures mass per time (kg/s): ṁ = ρ × Q. For incompressible liquids, volumetric flow is constant in a pipe system. For gases (compressible), volumetric flow changes with pressure but mass flow is conserved.' },
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

export default function FlowRateCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [diameter, setDiameter] = useState(50)
  const [velocity, setVelocity] = useState(1.5)
  const [flowRate_ls, setFlowRate_ls] = useState(3)
  const [density, setDensity] = useState(1000)
  const [selectedPipe, setSelectedPipe] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  const d_m = diameter / 1000
  const area = Math.PI * (d_m / 2) ** 2

  let Q_m3s, v_ms, d_calc
  if (solveIdx === 0) { // solve Q
    Q_m3s = area * velocity
    v_ms = velocity
    d_calc = diameter
  } else if (solveIdx === 1) { // solve v
    Q_m3s = flowRate_ls / 1000
    v_ms = Q_m3s / area
    d_calc = diameter
  } else { // solve d
    Q_m3s = flowRate_ls / 1000
    const dCalc = 2 * Math.sqrt(Q_m3s / (Math.PI * velocity))
    d_calc = dCalc * 1000
    v_ms = velocity
  }

  const Q_ls = Q_m3s * 1000
  const Q_lmin = Q_ls * 60
  const Q_m3h = Q_m3s * 3600
  const Q_gpm = Q_m3s * 264.172
  const massFlow = Q_m3s * density

  const velColor = v_ms < 0.6 ? '#3b82f6' : v_ms <= 3.0 ? '#10b981' : v_ms <= 5 ? '#f59e0b' : '#ef4444'
  const velLabel = v_ms < 0.6 ? 'Too slow' : v_ms <= 3.0 ? 'Recommended' : v_ms <= 5 ? 'Elevated' : 'Too fast'

  const hint = `Q=${Q_ls.toFixed(3)} L/s = ${Q_m3h.toFixed(2)} m³/h = ${Q_gpm.toFixed(2)} gpm. Velocity=${v_ms.toFixed(3)} m/s in ⌀${d_calc.toFixed(1)}mm pipe. ${velLabel}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Flow Rate (Continuity Equation)</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Q = A × v = (π/4) × d² × v</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{Q_ls.toFixed(3)} L/s</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{Q_m3h.toFixed(2)} m³/h · {Q_gpm.toFixed(1)} gpm</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SOLVE_FOR.map((s, i) => (
                <button key={i} onClick={() => setSolveIdx(i)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${solveIdx === i ? C : 'var(--border-2)'}`, background: solveIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
              ))}
            </div>
          </div>

          {solveIdx !== 2 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Pipe internal diameter (mm)</label>
              <input type="number" value={diameter} onChange={e => setDiameter(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {(solveIdx === 0 || solveIdx === 2) && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Flow velocity (m/s)</label>
              <input type="number" step="0.1" value={velocity} onChange={e => setVelocity(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {(solveIdx === 1 || solveIdx === 2) && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Flow rate (L/s)</label>
              <input type="number" step="0.01" value={flowRate_ls} onChange={e => setFlowRate_ls(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Fluid density (kg/m³)</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {[['Water', 1000], ['Sea water', 1025], ['Air', 1.2], ['Oil', 870]].map(([l, v]) => (
                <button key={l} onClick={() => setDensity(v)} style={{ padding: '5px 8px', borderRadius: 7, border: `1px solid ${density === v ? C : 'var(--border-2)'}`, background: density === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: density === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
            <input type="number" value={density} onChange={e => setDensity(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Standard pipe picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Standard pipe sizes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PIPE_SIZES.map((p, i) => (
                <button key={i} onClick={() => { setDiameter(p.id_mm); setSelectedPipe(i) }}
                  style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${selectedPipe === i ? C : 'var(--border-2)'}`, background: selectedPipe === i ? C + '12' : 'var(--bg-raised)', fontSize: 10, color: selectedPipe === i ? C : 'var(--text-2)', cursor: 'pointer' }}>{p.label}</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${velColor}40`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ l: 'Flow rate', v: `${Q_ls.toFixed(4)} L/s`, c: C }, { l: 'Velocity', v: `${v_ms.toFixed(3)} m/s`, c: velColor }, { l: 'm³/h', v: Q_m3h.toFixed(4) }, { l: 'US gpm', v: Q_gpm.toFixed(3) }, { l: 'Mass flow', v: `${massFlow.toFixed(3)} kg/s` }, { l: 'Pipe area', v: `${(area * 1e6).toFixed(2)} mm²` }].map((m, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{m.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '8px 12px', background: velColor + '15', borderRadius: 8, border: `1px solid ${velColor}30`, fontSize: 12, color: velColor, fontWeight: 600 }}>
              Velocity: {velLabel} ({v_ms.toFixed(2)} m/s)
            </div>
          </div>
          <BreakdownTable title="Flow unit conversions" rows={[
            { label: 'L/s', value: Q_ls.toFixed(5), bold: true, highlight: true, color: C },
            { label: 'm³/s', value: Q_m3s.toFixed(6) },
            { label: 'm³/h', value: Q_m3h.toFixed(4) },
            { label: 'L/min', value: Q_lmin.toFixed(3) },
            { label: 'US gpm', value: Q_gpm.toFixed(3) },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Recommended flow velocities" sub="ASHRAE / industry guidelines">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ app: 'Water — supply pipes', v: '0.9–3.0 m/s', note: 'Higher end for short runs', ok: v_ms >= 0.9 && v_ms <= 3.0 },
            { app: 'Water — suction pipes', v: '0.6–1.5 m/s', note: 'Low velocity to prevent cavitation', ok: v_ms >= 0.6 && v_ms <= 1.5 },
            { app: 'HVAC chilled water', v: '1.0–3.0 m/s', note: 'Typically 1.5–2.5 m/s', ok: v_ms >= 1.0 && v_ms <= 3.0 },
            { app: 'Air in ducts', v: '3–10 m/s', note: 'Low noise ≤6 m/s', ok: v_ms >= 3 && v_ms <= 10 },
            { app: 'Steam pipes', v: '25–40 m/s', note: 'High velocity due to low density', ok: v_ms >= 25 && v_ms <= 40 },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{r.app}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.note}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Q = A × v\nA = (π/4) × d²\nṁ = ρ × Q\nQ₁A₁ = Q₂A₂ (continuity)'}
        variables={[
          { symbol: 'Q', meaning: 'Volumetric flow rate (m³/s)' },
          { symbol: 'A', meaning: 'Pipe cross-sectional area (m²)' },
          { symbol: 'v', meaning: 'Mean flow velocity (m/s)' },
          { symbol: 'ṁ', meaning: 'Mass flow rate (kg/s)' },
          { symbol: 'ρ', meaning: 'Fluid density (kg/m³)' },
        ]}
        explanation="The continuity equation (Q = Av) is fundamental to fluid mechanics. For incompressible flow, flow rate is constant throughout a pipe — so velocity increases where the pipe narrows. Mass flow rate adds the density term: ṁ = ρQ, conserved even for compressible fluids."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
