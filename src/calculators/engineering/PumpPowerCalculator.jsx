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
  { q: 'What is hydraulic power vs shaft power?', a: 'Hydraulic power (P_hyd = ρgQH) is the power actually transferred to the fluid. Shaft power (P_shaft = P_hyd/η_pump) is what the pump\'s impeller requires, accounting for pump inefficiency. Motor power (P_motor = P_shaft/η_motor) is what you pay for from the electrical supply. Always size motors for shaft power with a safety factor.' },
  { q: 'What is a typical pump efficiency?', a: 'Small centrifugal pumps: 40–60%. Large HVAC pumps: 70–85%. High-efficiency industrial pumps: 85–92%. Always request the pump curve from the manufacturer showing efficiency vs flow rate — pumps operate at peak efficiency only at their Best Efficiency Point (BEP).' },
  { q: 'What motor size should I select?', a: 'Standard practice: select the next standard motor size above calculated shaft power, then apply a service factor of 1.15–1.25. If the pump will operate over a wide flow range, check power at maximum flow (which may exceed design point). Never undersize the motor — pump overload can burn it out.' },
]

export default function PumpPowerCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [flowRate, setFlowRate] = useState(10)
  const [head, setHead] = useState(20)
  const [pumpEff, setPumpEff] = useState(75)
  const [motorEff, setMotorEff] = useState(90)
  const [density, setDensity] = useState(1000)
  const [openFaq, setOpenFaq] = useState(null)

  const Q = flowRate / 1000 // L/s to m3/s
  const g = 9.81
  const P_hydraulic = density * g * Q * head // W
  const P_shaft = P_hydraulic / (pumpEff / 100)
  const P_motor = P_shaft / (motorEff / 100)
  const overall_eff = (P_hydraulic / P_motor) * 100

  const STANDARD_MOTORS = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110]
  const recommended_motor = STANDARD_MOTORS.find(m => m * 1000 >= P_motor * 1.15) || STANDARD_MOTORS[STANDARD_MOTORS.length - 1]

  const hint = `Q=${flowRate} L/s, H=${head}m: P_hydraulic=${(P_hydraulic/1000).toFixed(2)}kW, P_shaft=${(P_shaft/1000).toFixed(2)}kW, P_motor=${(P_motor/1000).toFixed(2)}kW. Use ${recommended_motor}kW motor.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Pump Power</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>P_hyd = ρgQH</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Hydraulic', v: `${(P_hydraulic/1000).toFixed(2)} kW` }, { l: 'Motor req.', v: `${(P_motor/1000).toFixed(2)} kW` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Flow rate (L/s)', flowRate, setFlowRate, 0.01, 10000, 0.1], ['Total head (m)', head, setHead, 0.1, 500, 0.5], ['Fluid density (kg/m³)', density, setDensity, 100, 15000, 10]].map(([l, v, set, min, max, step]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step={step} value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Pump η (%)', pumpEff, setPumpEff], ['Motor η (%)', motorEff, setMotorEff]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{l}: {v}%</label>
                <input type="range" min="30" max="98" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', accentColor: C }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Common fluids</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['Water', 1000], ['Sea water', 1025], ['Glycol 50%', 1065], ['Oil', 870]].map(([l, v]) => (
                <button key={l} onClick={() => setDensity(v)} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${density === v ? C : 'var(--border-2)'}`, background: density === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: density === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Power breakdown" rows={[
            { label: 'Hydraulic power', value: `${(P_hydraulic/1000).toFixed(3)} kW` },
            { label: 'Shaft power', value: `${(P_shaft/1000).toFixed(3)} kW` },
            { label: 'Motor input power', value: `${(P_motor/1000).toFixed(3)} kW`, bold: true, highlight: true, color: C },
            { label: 'Overall efficiency', value: `${overall_eff.toFixed(1)}%` },
            { label: 'Recommended motor', value: `${recommended_motor} kW`, color: C },
            { label: 'Annual energy (8760h)', value: `${(P_motor / 1000 * 8760).toFixed(0)} kWh` },
          ]} />

          <div style={{ padding: '12px 14px', background: C + '10', borderRadius: 10, marginTop: 12, border: `1px solid ${C}25` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C, marginBottom: 4 }}>⚡ Motor Selection</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>Use <strong>{recommended_motor} kW</strong> standard IEC motor</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>Based on shaft power × 1.15 service factor</div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Pump efficiency by type" sub="Typical ranges at BEP">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Small centrifugal (<10 kW)', '40–60%', '#f59e0b'], ['Medium centrifugal (10–100 kW)', '65–80%', '#10b981'], ['Large centrifugal (>100 kW)', '75–88%', '#10b981'], ['Axial flow pump', '80–90%', '#10b981'], ['Gear pump', '70–85%', '#3b82f6'], ['Submersible pump', '40–70%', '#f59e0b']].map(([name, eff, c], i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'Space Grotesk',sans-serif" }}>{eff}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'P_hydraulic = ρ × g × Q × H\nP_shaft = P_hydraulic / η_pump\nP_motor = P_shaft / η_motor'}
        variables={[
          { symbol: 'ρ', meaning: 'Fluid density (kg/m³)' },
          { symbol: 'g', meaning: 'Gravitational acceleration = 9.81 m/s²' },
          { symbol: 'Q', meaning: 'Flow rate (m³/s)' },
          { symbol: 'H', meaning: 'Total head (m)' },
          { symbol: 'η', meaning: 'Efficiency (0–1)' },
        ]}
        explanation="Hydraulic power is the energy transferred to the fluid per second. Shaft power accounts for pump mechanical losses. Motor input power adds motor winding and bearing losses. Always size the motor for shaft power plus a safety margin, not hydraulic power."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
