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

const MATERIALS = [
  { name: 'Aluminum', alpha: 23.1e-6, color: '#9ca3af' },
  { name: 'Copper', alpha: 17.0e-6, color: '#d97706' },
  { name: 'Steel (carbon)', alpha: 11.7e-6, color: '#6366f1' },
  { name: 'Stainless steel', alpha: 17.2e-6, color: '#6366f1' },
  { name: 'Cast iron', alpha: 10.8e-6, color: '#374151' },
  { name: 'Concrete', alpha: 12.0e-6, color: '#78716c' },
  { name: 'Brass', alpha: 19.0e-6, color: '#d4af37' },
  { name: 'Glass (plate)', alpha: 9.0e-6, color: '#93c5fd' },
  { name: 'PVC', alpha: 52.0e-6, color: '#fbbf24' },
  { name: 'HDPE', alpha: 120e-6, color: '#34d399' },
]

const FAQ = [
  { q: 'Why does thermal expansion matter in engineering?', a: 'Thermal expansion causes structures to change size as temperature changes. Bridges need expansion joints to avoid buckling. Pipelines need expansion loops. Rail tracks can buckle if joints are too tight. Even small temperature changes can generate large forces in constrained structures — thermal stress = E × α × ΔT.' },
  { q: 'What is the difference between linear and volumetric expansion?', a: 'Linear expansion (ΔL = αLΔT) applies to one dimension. Volumetric expansion (ΔV = βVΔT) applies to 3D objects where β ≈ 3α for isotropic materials. For fluids, only volumetric expansion applies. Water is unusual — it expands when freezing due to crystal structure changes.' },
  { q: 'How do I calculate thermal stress when expansion is constrained?', a: 'Thermal stress σ = E × α × ΔT, where E is Young\'s modulus. For steel: σ = 200 GPa × 11.7×10⁻⁶ × ΔT = 2.34 MPa per °C temperature change. A 50°C change in a fully constrained steel pipe develops 117 MPa — significant and potentially damaging.' },
]

export default function ThermalExpansionCalculator({ meta, category }) {
  const C = category?.color || "#f59e0b"
  const [matIdx, setMatIdx] = useState(2)
  const [length, setLength] = useState(10)
  const [T1, setT1] = useState(20)
  const [T2, setT2] = useState(80)
  const [E_GPa, setE_GPa] = useState(200)
  const [openFaq, setOpenFaq] = useState(null)

  const mat = MATERIALS[matIdx]
  const dT = T2 - T1
  const dL = mat.alpha * length * dT
  const newLength = length + dL
  const thermalStress = E_GPa * 1e9 * mat.alpha * Math.abs(dT) / 1e6 // MPa
  const strain = mat.alpha * Math.abs(dT)

  const hint = `${mat.name}, L=${length}m, ΔT=${dT}°C: ΔL=${(dL*1000).toFixed(2)}mm. New length=${newLength.toFixed(4)}m. Thermal stress (constrained)=${thermalStress.toFixed(1)} MPa.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Thermal Expansion</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>ΔL = α × L₀ × ΔT</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Expansion', v: `${(dL*1000).toFixed(2)} mm` }, { l: 'Thermal stress', v: `${thermalStress.toFixed(0)} MPa` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: dT < 0 ? '#3b82f6' : C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Material</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MATERIALS.map((m, i) => (
                <button key={i} onClick={() => setMatIdx(i)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${matIdx === i ? C : 'var(--border-2)'}`, background: matIdx === i ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: matIdx === i ? C : 'var(--text)' }}>{m.name}</span>
                  <span style={{ fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--text-3)' }}>α={m.alpha * 1e6}×10⁻⁶/°C</span>
                </button>
              ))}
            </div>
          </div>
          {[['Initial length (m)', length, setLength, 0.001], ['T1 - Initial temp (°C)', T1, setT1, -273], ['T2 - Final temp (°C)', T2, setT2, -273], ['Young\'s modulus E (GPa)', E_GPa, setE_GPa, 1]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{l}</label>
              <input type="number" step="any" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
        </>}
        right={<>
          <BreakdownTable title="Expansion results" rows={[
            { label: 'Material', value: mat.name },
            { label: 'α (coefficient)', value: `${(mat.alpha * 1e6).toFixed(1)} × 10⁻⁶ /°C` },
            { label: 'Temperature change ΔT', value: `${dT > 0 ? '+' : ''}${dT}°C` },
            { label: 'Length change ΔL', value: `${(dL * 1000).toFixed(3)} mm`, bold: true, highlight: true, color: dT >= 0 ? C : '#3b82f6' },
            { label: 'New length', value: `${newLength.toFixed(4)} m` },
            { label: 'Thermal strain', value: strain.toFixed(6) },
            { label: 'Thermal stress (constrained)', value: `${thermalStress.toFixed(1)} MPa` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="All materials at your current settings">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Material', 'α (10⁻⁶/°C)', 'ΔL (mm)', 'Stress (MPa)'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {MATERIALS.map((m, i) => {
                const dl = m.alpha * length * dT * 1000
                const s = E_GPa * 1e9 * m.alpha * Math.abs(dT) / 1e6
                return (
                  <tr key={i} style={{ background: i === matIdx ? C + '10' : 'transparent', cursor: 'pointer' }} onClick={() => setMatIdx(i)}>
                    <td style={{ padding: '7px 10px', fontSize: 12, color: i === matIdx ? C : 'var(--text)', fontWeight: i === matIdx ? 700 : 400, borderBottom: '0.5px solid var(--border)' }}>{m.name}</td>
                    <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{(m.alpha * 1e6).toFixed(1)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600, color: C, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{dl.toFixed(2)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 12, color: s > 200 ? '#ef4444' : 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{s.toFixed(0)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sec>

      <FormulaCard
        formula={"ΔL = α × L₀ × ΔTε_thermal = α × ΔTσ_thermal = E × α × ΔT"}
        variables={[
          { symbol: 'α', meaning: 'Coefficient of linear expansion (1/°C)' },
          { symbol: 'L₀', meaning: 'Initial length (m)' },
          { symbol: 'ΔT', meaning: 'Temperature change T₂ − T₁ (°C)' },
          { symbol: 'E', meaning: 'Young\'s modulus (Pa)' },
        ]}
        explanation="Linear thermal expansion describes how materials change length with temperature. Positive ΔT = expansion; negative ΔT = contraction. When expansion is constrained, thermal stress develops equal to E × α × ΔT. Engineers design expansion joints to accommodate this movement."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
