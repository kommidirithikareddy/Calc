import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

const MATERIALS = [
  { name: 'Copper', k: 385 }, { name: 'Aluminum', k: 205 }, { name: 'Steel (carbon)', k: 50 },
  { name: 'Stainless steel', k: 16 }, { name: 'Concrete', k: 1.7 }, { name: 'Glass', k: 1.0 },
  { name: 'Wood (pine)', k: 0.12 }, { name: 'Fiberglass insulation', k: 0.04 }, { name: 'Polyurethane foam', k: 0.025 },
]

const FAQ = [
  { q: 'What is thermal conductivity (k)?', a: 'Thermal conductivity (W/m·K) measures how readily a material conducts heat. Metals have high k (copper=385, aluminum=205). Insulators have low k (fiberglass=0.04). The higher k is, the more heat flows through for a given temperature difference and geometry.' },
  { q: 'What is the difference between conduction, convection, and radiation?', a: 'Conduction: heat transfer through a solid material by molecular vibration (Q=kAΔT/L). Convection: heat transfer between a surface and moving fluid (Q=hAΔT). Radiation: heat transfer by electromagnetic waves — all objects emit thermal radiation (Q=εσAT⁴), dominant at high temperatures.' },
  { q: 'What is R-value in building insulation?', a: 'R-value = L/k (thickness/conductivity), measuring thermal resistance per unit area. Higher R = better insulation. US uses ft²·°F·hr/BTU; SI uses m²·K/W (multiply by 0.176 to convert). A typical wall has R-13 to R-21. R-value is the reciprocal of U-value (heat transfer coefficient).' },
]

export default function HeatTransferCalculator({ meta, category }) {
  const C = category?.color || "#f59e0b"
  const [mode, setMode] = useState("conduction")
  const [area, setArea] = useState(1.0)
  const [dT, setDT] = useState(30)
  const [thickness, setThickness] = useState(0.1)
  const [matIdx, setMatIdx] = useState(0)
  const [h, setH] = useState(10)
  const [epsilon, setEpsilon] = useState(0.9)
  const [T_surface, setT_surface] = useState(100)
  const [openFaq, setOpenFaq] = useState(null)

  const mat = MATERIALS[matIdx]
  const Q_cond = mat.k * area * dT / thickness
  const Q_conv = h * area * dT
  const sigma = 5.67e-8
  const T_amb = T_surface - dT
  const Q_rad = epsilon * sigma * area * (Math.pow(T_surface + 273, 4) - Math.pow(T_amb + 273, 4))

  const Q = mode === "conduction" ? Q_cond : mode === "convection" ? Q_conv : Q_rad
  const R_thermal = mode === "conduction" ? thickness / (mat.k * area) : 1 / (h * area)

  const hint = `${mode.charAt(0).toUpperCase() + mode.slice(1)}: Q = ${Q.toFixed(1)} W. R_thermal = ${R_thermal.toFixed(4)} K/W.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Heat Transfer</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Q = kAΔT/L · Q = hAΔT · Q = εσAT⁴</div>
        </div>
        <div style={{ textAlign: 'right', padding: '8px 18px', background: `${C}15`, borderRadius: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{Q.toFixed(1)} W</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>heat flow rate</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Heat transfer mode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['conduction', 'convection', 'radiation'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: mode === m ? 700 : 400, color: mode === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
          </div>

          {[['Surface area (m²)', area, setArea, 0.001], ['Temperature diff ΔT (°C)', dT, setDT, 0.01]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{l}</label>
              <input type="number" step="any" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          {mode === 'conduction' && <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Thickness (m)</label>
              <input type="number" step="0.001" value={thickness} onChange={e => setThickness(Math.max(0.001, +e.target.value))} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Material</label>
              <select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
                {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name} (k={m.k} W/m·K)</option>)}
              </select>
            </div>
          </>}
          {mode === 'convection' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Convection coeff. h (W/m²·K)</label>
              <input type="number" value={h} onChange={e => setH(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {[['Free air', 5], ['Forced air', 25], ['Water', 2000], ['Boiling water', 8000]].map(([l, v]) => (
                  <button key={l} onClick={() => setH(v)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${h === v ? C : 'var(--border-2)'}`, background: h === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: h === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
            </div>
          )}
          {mode === 'radiation' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Emissivity ε (0-1): {epsilon}</label>
                <input type="range" min="0.01" max="1" step="0.01" value={epsilon} onChange={e => setEpsilon(+e.target.value)} style={{ width: '100%', accentColor: C }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Surface temperature (°C)</label>
                <input type="number" value={T_surface} onChange={e => setT_surface(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}
        </>}
        right={<>
          <BreakdownTable title="Heat transfer results" rows={[
            { label: 'Mode', value: mode.charAt(0).toUpperCase() + mode.slice(1) },
            { label: 'Heat flow rate (Q)', value: `${Q.toFixed(2)} W`, bold: true, highlight: true, color: C },
            { label: 'Q in kW', value: `${(Q/1000).toFixed(4)} kW` },
            { label: 'Q in BTU/hr', value: `${(Q * 3.412).toFixed(2)} BTU/hr` },
            ...(mode === 'conduction' ? [{ label: 'Thermal resistance', value: `${R_thermal.toFixed(4)} K/W` }, { label: 'k value', value: `${mat.k} W/m·K` }] : []),
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Convection coefficient reference h (W/m²·K)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Free convection (air)', '2–10'], ['Forced convection (air)', '10–100'], ['Forced convection (water)', '500–10,000'], ['Boiling water', '3,000–60,000'], ['Condensing steam', '5,000–100,000'], ['Liquid metals', '10,000–100,000']].map(([name, v], i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v} W/m²·K</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={"Q_cond = k × A × ΔT / LQ_conv = h × A × ΔTQ_rad = ε × σ × A × (T₁⁴ - T₂⁴)"}
        variables={[
          { symbol: 'k', meaning: 'Thermal conductivity (W/m·K)' },
          { symbol: 'h', meaning: 'Convection heat transfer coefficient (W/m²·K)' },
          { symbol: 'ε', meaning: 'Surface emissivity (0–1)' },
          { symbol: 'σ', meaning: 'Stefan-Boltzmann constant = 5.67×10⁻⁸ W/m²·K⁴' },
        ]}
        explanation="Three fundamental heat transfer mechanisms: Conduction through solids uses Fourier's law (proportional to conductivity and temperature gradient). Convection between surface and fluid uses Newton's cooling law. Radiation uses Stefan-Boltzmann law — dominant at high temperatures."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
