import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function Sec({ title, children }) {
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

const SOLVE = ['Young\'s Modulus (E)', 'Stress (σ)', 'Strain (ε)']
const MATERIALS = [
  { name: 'Structural steel', E: 200, yield: 250, uts: 400 },
  { name: 'Stainless steel', E: 193, yield: 207, uts: 515 },
  { name: 'Aluminum alloy', E: 69, yield: 275, uts: 310 },
  { name: 'Copper', E: 117, yield: 70, uts: 220 },
  { name: 'Titanium', E: 116, yield: 880, uts: 950 },
  { name: 'Cast iron', E: 170, yield: null, uts: 200 },
  { name: 'Concrete (compression)', E: 30, yield: null, uts: 40 },
  { name: 'HDPE plastic', E: 0.8, yield: 20, uts: 35 },
  { name: 'Carbon fibre (CFRP)', E: 70, yield: null, uts: 600 },
  { name: 'Glass (window)', E: 70, yield: null, uts: 50 },
]

const FAQ = [
  { q: 'What is Young\'s Modulus?', a: 'Young\'s Modulus (E) is the ratio of stress to strain in the linear elastic region of a material\'s stress-strain curve. It measures stiffness — how much a material resists elastic deformation. Steel (200 GPa) is much stiffer than rubber (0.01 GPa). The higher E, the stiffer the material.' },
  { q: 'What is the difference between stress and strain?', a: 'Stress (σ = F/A) is force per unit area — what is applied to the material (MPa or N/mm²). Strain (ε = ΔL/L) is the fractional change in length — dimensionless ratio typically 0.001 to 0.01 in practice. Young\'s Modulus relates them: E = σ/ε, valid only in the elastic (linear) region.' },
  { q: 'What happens beyond the elastic limit?', a: 'Beyond the yield strength, plastic deformation begins — the material does not return to its original shape when load is removed. Further loading leads to necking and ultimate failure at the ultimate tensile strength (UTS). Engineers design for stresses well below yield strength, typically applying a safety factor of 2–4.' },
]

export default function YoungsModulusCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [E_GPa, setE_GPa] = useState(200)
  const [stress_MPa, setStress] = useState(100)
  const [strain, setStrain] = useState(0.0005)
  const [matIdx, setMatIdx] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  let E, sigma, epsilon
  if (solveIdx === 0) { sigma = stress_MPa; epsilon = strain; E = sigma / epsilon / 1000 }
  else if (solveIdx === 1) { E = E_GPa; epsilon = strain; sigma = E * 1000 * epsilon }
  else { E = E_GPa; sigma = stress_MPa; epsilon = sigma / (E * 1000) }

  const mat = MATERIALS[matIdx]
  const fos = mat.yield ? mat.yield / sigma : null

  const hint = `E=${E.toFixed(1)} GPa, σ=${sigma.toFixed(1)} MPa, ε=${epsilon.toFixed(6)}. ${fos ? `Factor of safety vs yield: ${fos.toFixed(2)}` : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Young's Modulus / Elastic Modulus</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>E = σ / ε (Stress / Strain)</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'E (GPa)', v: E.toFixed(1) }, { l: 'σ (MPa)', v: sigma.toFixed(1) }, { l: 'ε', v: epsilon.toExponential(2) }].map((m, i) => (
            <div key={i} style={{ padding: '6px 10px', background: C + '15', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SOLVE.map((s, i) => (
                <button key={i} onClick={() => setSolveIdx(i)} style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${solveIdx === i ? C : 'var(--border-2)'}`, background: solveIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
              ))}
            </div>
          </div>

          {solveIdx !== 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Young's Modulus E (GPa)</label>
              <input type="number" step="1" value={E_GPa} onChange={e => setE_GPa(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          {solveIdx !== 1 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Stress σ (MPa)</label>
              <input type="number" step="any" value={stress_MPa} onChange={e => setStress(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
          {solveIdx !== 2 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Strain ε (dimensionless)</label>
              <input type="number" step="0.0001" value={strain} onChange={e => setStrain(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Material presets (load E value)</label>
            <select value={matIdx} onChange={e => { setMatIdx(+e.target.value); setE_GPa(MATERIALS[+e.target.value].E) }} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name} — E={m.E} GPa</option>)}
            </select>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Results" rows={[
            { label: 'Young\'s Modulus E', value: `${E.toFixed(1)} GPa`, bold: true, highlight: true, color: C },
            { label: 'Stress σ', value: `${sigma.toFixed(2)} MPa` },
            { label: 'Strain ε', value: epsilon.toFixed(6) },
            { label: 'Deformation (1m rod)', value: `${(epsilon * 1000).toFixed(3)} mm/m` },
            ...(mat.yield ? [{ label: 'Yield strength', value: `${mat.yield} MPa` }, { label: 'Factor of safety', value: fos.toFixed(2), color: fos >= 2 ? '#10b981' : '#ef4444' }] : []),
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Material stiffness comparison (E in GPa)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MATERIALS.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => { setMatIdx(i); setE_GPa(m.E) }}>
              <span style={{ fontSize: 12, color: i === matIdx ? C : 'var(--text)', minWidth: 160, fontWeight: i === matIdx ? 700 : 400 }}>{m.name}</span>
              <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, m.E / 200 * 100)}%`, background: i === matIdx ? C : 'var(--text-3)', borderRadius: 5 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C, minWidth: 60, fontFamily: "'Space Grotesk',sans-serif" }}>{m.E} GPa</span>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={"E = σ / ε\nσ = F / A (stress)\nε = ΔL / L (strain)\nΔL = σ × L / E"}
        variables={[
          { symbol: 'E', meaning: 'Young\'s Modulus / Elastic Modulus (Pa or GPa)' },
          { symbol: 'σ', meaning: 'Normal stress (Pa or MPa)' },
          { symbol: 'ε', meaning: 'Strain (dimensionless ratio ΔL/L)' },
        ]}
        explanation="Young's Modulus is the slope of the stress-strain curve in the linear elastic region. It is a fundamental material property — independent of geometry. Higher E means stiffer material (more stress for same strain). Valid only below the proportional limit (elastic region)."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
