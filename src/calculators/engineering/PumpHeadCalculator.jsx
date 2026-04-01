import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

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

const FAQ = [
  { q: "What is Total Dynamic Head (TDH)?", a: "TDH is the total equivalent height of fluid a pump must raise. It includes: static head (vertical distance), pressure head (pressure difference converted to meters), velocity head (change in kinetic energy), and friction head (pipe losses). TDH is the fundamental parameter for pump selection from manufacturer curves." },
  { q: "How does pipe friction add to pump head?", a: "Friction losses from pipe flow (Darcy-Weisbach), fittings (K-factor), and equipment pressure drops all translate to additional head the pump must overcome. 1 meter of water head = 9.81 kPa = 0.0981 bar. So a pump overcoming 50m TDH must develop 491 kPa of pressure." },
  { q: "What happens if I undersize pump head?", a: "If TDH is underestimated, the pump operates beyond its design point toward the right of its characteristic curve — delivering more flow at lower head. This increases shaft power (risk of motor overload), reduces efficiency, and can cause cavitation. Always add a 10-15% head margin." },
]

export default function PumpHeadCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [staticHead, setStaticHead] = useState(10)
  const [pressureHead, setPressureHead] = useState(5)
  const [frictionHead, setFrictionHead] = useState(8)
  const [velocityHead, setVelocityHead] = useState(0.5)
  const [fittingsHead, setFittingsHead] = useState(3)
  const [margin, setMargin] = useState(15)
  const [openFaq, setOpenFaq] = useState(null)

  const TDH_base = staticHead + pressureHead + frictionHead + velocityHead + fittingsHead
  const TDH_design = TDH_base * (1 + margin / 100)
  const pressure_kPa = TDH_design * 9.81
  const pressure_bar = pressure_kPa / 100
  const pressure_psi = pressure_kPa * 0.1450

  const hint = `TDH = ${TDH_design.toFixed(1)}m (with ${margin}% margin) = ${pressure_kPa.toFixed(0)} kPa = ${pressure_bar.toFixed(2)} bar = ${pressure_psi.toFixed(1)} psi.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Pump Total Dynamic Head</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>TDH = Hstatic + Hpressure + Hfriction + Hvelocity</div>
        </div>
        <div style={{ textAlign: 'right', padding: '8px 18px', background: `${C}15`, borderRadius: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{TDH_design.toFixed(1)} m</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>design TDH</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[
            ['Static head (m)', staticHead, setStaticHead, 0, 500],
            ['Pressure head (m)', pressureHead, setPressureHead, 0, 200],
            ['Pipe friction head (m)', frictionHead, setFrictionHead, 0, 100],
            ['Velocity head (m)', velocityHead, setVelocityHead, 0, 10],
            ['Fittings head (m)', fittingsHead, setFittingsHead, 0, 50],
          ].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{l}</label>
              <input type="number" step="0.5" value={v} onChange={e => set(Math.max(min, +e.target.value))}
                style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Safety margin: {margin}%</label>
            <input type="range" min="5" max="30" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-raised)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Head component breakdown</div>
            {[
              { l: 'Static head', v: staticHead, pct: staticHead/TDH_base*100 },
              { l: 'Pressure head', v: pressureHead, pct: pressureHead/TDH_base*100 },
              { l: 'Friction head', v: frictionHead, pct: frictionHead/TDH_base*100 },
              { l: 'Velocity head', v: velocityHead, pct: velocityHead/TDH_base*100 },
              { l: 'Fittings head', v: fittingsHead, pct: fittingsHead/TDH_base*100 },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-2)' }}>{item.l}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.v.toFixed(1)}m ({item.pct.toFixed(0)}%)</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, background: C, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <BreakdownTable title="Results" rows={[
            { label: 'Base TDH', value: `${TDH_base.toFixed(2)} m` },
            { label: `Design TDH (+${margin}%)`, value: `${TDH_design.toFixed(2)} m`, bold: true, highlight: true, color: C },
            { label: 'Pressure (kPa)', value: `${pressure_kPa.toFixed(0)} kPa` },
            { label: 'Pressure (bar)', value: `${pressure_bar.toFixed(3)} bar` },
            { label: 'Pressure (psi)', value: `${pressure_psi.toFixed(1)} psi` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <FormulaCard
        formula={'TDH = H_static + H_pressure + H_friction + H_velocity + H_fittings\nPressure (Pa) = ρ × g × TDH'}
        variables={[
          { symbol: 'H_static', meaning: 'Elevation difference between suction and discharge (m)' },
          { symbol: 'H_pressure', meaning: 'Pressure difference converted to head (m)' },
          { symbol: 'H_friction', meaning: 'Pipe friction losses (Darcy-Weisbach) (m)' },
          { symbol: 'H_velocity', meaning: 'Velocity head change = (v²/2g) (m)' },
        ]}
        explanation="TDH is the sum of all head components a pump must overcome. It is used to select pump from manufacturer curves. Always add a 10-15% design margin. TDH × ρg gives discharge pressure in Pascals."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
