import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const PIPE_SCHEDULES = [
  { name: 'Schedule 40', wall_factor: 0.10 },
  { name: 'Schedule 80', wall_factor: 0.15 },
  { name: 'Schedule 160', wall_factor: 0.22 },
]

const STANDARD_SIZES = [
  { dn: 15, id: 15.8 }, { dn: 20, id: 20.4 }, { dn: 25, id: 26.6 },
  { dn: 32, id: 35.1 }, { dn: 40, id: 40.9 }, { dn: 50, id: 52.5 },
  { dn: 65, id: 68.8 }, { dn: 80, id: 80.9 }, { dn: 100, id: 105.3 },
  { dn: 125, id: 131.7 }, { dn: 150, id: 159.3 },
]

const FAQ = [
  { q: 'What is the ideal flow velocity in pipes?', a: 'ASHRAE recommends 0.9–3.0 m/s for water in supply pipes. Too high: erosion, noise, high pressure drop. Too low: sedimentation, poor mixing. For suction pipes to pumps, keep under 1.5 m/s to avoid cavitation. Drain lines need ≥0.6 m/s minimum self-cleansing velocity.' },
  { q: 'What is DN vs NPS pipe sizing?', a: 'DN (Diameter Nominal) is the metric designation in millimetres used in ISO standards. NPS (Nominal Pipe Size) is the imperial designation in inches used in ANSI standards. They are not exact conversions — DN 50 ≈ NPS 2, but actual dimensions depend on the schedule/pressure class.' },
  { q: 'When should I use Schedule 80 vs Schedule 40?', a: 'Schedule 40 is standard for most water and low-pressure applications. Schedule 80 has thicker walls for higher pressure ratings (approx 1.5× the pressure rating). Use Sch 80 for steam, high-pressure water, chemical lines, or corrosive environments where extra wall thickness provides both strength and corrosion allowance.' },
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
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

export default function PipeSizingCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [flowRate_ls, setFlowRate_ls] = useState(3)
  const [maxVelocity, setMaxVelocity] = useState(2.0)
  const [fluid, setFluid] = useState('water')
  const [openFaq, setOpenFaq] = useState(null)

  const Q = flowRate_ls / 1000 // m3/s
  const dMin_m = 2 * Math.sqrt(Q / (Math.PI * maxVelocity))
  const dMin_mm = dMin_m * 1000
  const area = Math.PI * (dMin_m / 2) ** 2
  const velocity = Q / area

  // Find nearest standard size
  const nearest = STANDARD_SIZES.find(s => s.id >= dMin_mm) || STANDARD_SIZES[STANDARD_SIZES.length - 1]
  const nearestArea = Math.PI * ((nearest.id / 1000) / 2) ** 2
  const nearestVelocity = Q / nearestArea

  const hint = `Q=${flowRate_ls} L/s → min. diameter=${dMin_mm.toFixed(1)}mm → use DN${nearest.dn} (ID=${nearest.id}mm), actual velocity=${nearestVelocity.toFixed(2)}m/s.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Pipe Sizing</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>d = 2√(Q / πv)</div>
        </div>
        <div style={{ textAlign: 'right', padding: '8px 18px', background: C + '15', borderRadius: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>DN {nearest.dn}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>min. pipe size</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Flow rate (L/s)', flowRate_ls, setFlowRate_ls, 0.001, 1000, 0.01], ['Max velocity (m/s)', maxVelocity, setMaxVelocity, 0.1, 10, 0.1]].map(([l, v, set, min, max, step]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step={step} value={v} onChange={e => set(Math.max(min, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Recommended max velocity</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['Chilled water supply', 2.0], ['Hot water supply', 1.5], ['Condensate return', 1.0], ['Cold water (domestic)', 2.5], ['Steam (low pressure)', 30]].map(([l, v]) => (
                <button key={l} onClick={() => setMaxVelocity(v)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, border: `1px solid ${maxVelocity === v ? C : 'var(--border-2)'}`, background: maxVelocity === v ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: maxVelocity === v ? C : 'var(--text)' }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v} m/s</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Sizing results" rows={[
            { label: 'Min. diameter required', value: `${dMin_mm.toFixed(1)} mm` },
            { label: 'Selected pipe (DN)', value: `DN ${nearest.dn}`, bold: true, highlight: true, color: C },
            { label: 'Internal diameter', value: `${nearest.id} mm` },
            { label: 'Actual velocity', value: `${nearestVelocity.toFixed(3)} m/s` },
            { label: 'Flow rate', value: `${flowRate_ls} L/s = ${(flowRate_ls * 3.6).toFixed(2)} m³/h` },
            { label: 'Cross-section area', value: `${(nearestArea * 1e6).toFixed(2)} mm²` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="All standard sizes at current flow" sub="Click to select target velocity">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['DN', 'ID (mm)', 'Velocity', 'Status'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {STANDARD_SIZES.map((p, i) => {
                const a = Math.PI * ((p.id / 1000) / 2) ** 2
                const v = Q / a
                const ok = v >= 0.5 && v <= 3
                const isSelected = p.dn === nearest.dn
                return (
                  <tr key={i} style={{ background: isSelected ? C + '10' : 'transparent', cursor: 'pointer' }} onClick={() => setMaxVelocity(v)}>
                    <td style={{ padding: '7px 10px', fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isSelected ? C : 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>DN {p.dn}</td>
                    <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{p.id}</td>
                    <td style={{ padding: '7px 10px', fontSize: 13, fontWeight: 600, color: v < 0.5 ? '#3b82f6' : ok ? '#10b981' : '#ef4444', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{v.toFixed(3)} m/s</td>
                    <td style={{ padding: '7px 10px', borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: ok ? '#d1fae5' : v < 0.5 ? '#dbeafe' : '#fee2e2', color: ok ? '#065f46' : v < 0.5 ? '#1e40af' : '#b91c1c', fontWeight: 600 }}>
                        {v < 0.5 ? '↓ Too slow' : ok ? '✓ OK' : '↑ Too fast'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sec>

      <FormulaCard
        formula={'d = 2√(Q / πv)\nA = π/4 × d²\nQ = A × v'}
        variables={[
          { symbol: 'd', meaning: 'Minimum pipe diameter (m)' },
          { symbol: 'Q', meaning: 'Volumetric flow rate (m³/s)' },
          { symbol: 'v', meaning: 'Maximum allowable velocity (m/s)' },
          { symbol: 'A', meaning: 'Pipe cross-sectional area (m²)' },
        ]}
        explanation="Pipe sizing starts with a target velocity constraint and solves for the minimum diameter that keeps velocity below the maximum. Then the nearest standard pipe size larger than the calculated minimum is selected."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
