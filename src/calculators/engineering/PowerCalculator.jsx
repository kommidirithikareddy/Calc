import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6) return (val / 1e6).toFixed(4) + ' M' + unit
  if (abs >= 1e3) return (val / 1e3).toFixed(4) + ' k' + unit
  if (abs >= 1)   return val.toFixed(4) + ' ' + unit
  if (abs >= 1e-3) return (val * 1e3).toFixed(4) + ' m' + unit
  return val.toExponential(3) + ' ' + unit
}

const SOLVE_FOR = [
  { label: 'Power (P)', key: 'P', unit: 'W', color: '#10b981' },
  { label: 'Voltage (V)', key: 'V', unit: 'V', color: '#f59e0b' },
  { label: 'Current (I)', key: 'I', unit: 'A', color: '#3b82f6' },
  { label: 'Resistance (R)', key: 'R', unit: 'Ω', color: '#6366f1' },
]

const APPLIANCES = [
  { name: 'LED bulb', watts: 10, icon: '💡' },
  { name: 'Laptop', watts: 65, icon: '💻' },
  { name: 'Hair dryer', watts: 1500, icon: '💇' },
  { name: 'Microwave', watts: 1000, icon: '🍲' },
  { name: 'Air conditioner', watts: 1500, icon: '❄️' },
  { name: 'Electric kettle', watts: 1800, icon: '☕' },
  { name: 'Refrigerator', watts: 150, icon: '🧊' },
  { name: 'Washing machine', watts: 500, icon: '🫧' },
  { name: 'Television', watts: 120, icon: '📺' },
  { name: 'Space heater', watts: 1500, icon: '🔥' },
]

const POWER_TIERS = [
  { range: '< 1W', examples: 'Phone charger standby, LED indicators', color: '#10b981' },
  { range: '1–50W', examples: 'LED lighting, phone charging, small electronics', color: '#3b82f6' },
  { range: '50–500W', examples: 'Computers, monitors, small appliances', color: '#f59e0b' },
  { range: '500–2000W', examples: 'Hair dryers, microwaves, kitchen appliances', color: '#f59e0b' },
  { range: '2–10kW', examples: 'Water heaters, EV charging, ovens', color: '#ef4444' },
  { range: '> 10kW', examples: 'Industrial equipment, HVAC systems', color: '#dc2626' },
]

const FAQ = [
  { q: 'What is the difference between watts, volt-amps and kilowatt-hours?', a: 'Watts (W) measure real power — actual work done. Volt-amps (VA) measure apparent power in AC circuits — includes reactive loads like motors. Kilowatt-hours (kWh) measure energy over time: 1 kW running for 1 hour = 1 kWh. Your electricity bill is in kWh. For purely resistive loads (heaters, incandescent bulbs), watts = volt-amps.' },
  { q: 'Why does power = V² / R and also P = I²R?', a: 'Both come from substituting Ohm\'s Law (V = IR) into P = VI. Replacing I with V/R gives P = V²/R. Replacing V with IR gives P = I²R. All three forms (P=VI, P=V²/R, P=I²R) are equivalent — you choose the one that uses your two known values.' },
  { q: 'What is power factor?', a: 'Power factor (PF) is the ratio of real power (watts) to apparent power (VA). Purely resistive loads (heaters, incandescent bulbs) have PF=1. Inductive loads (motors, transformers) and capacitive loads have PF<1, meaning they draw more current than their watt rating suggests. Low PF wastes energy and stresses wiring.' },
  { q: 'How does power relate to heat generation?', a: 'Every watt of power dissipated in a resistor becomes heat. This is called Joule heating. In electronics, managing heat dissipation is critical — a transistor handling 2W needs a heatsink capable of dissipating 2W. Temperature rise depends on thermal resistance (°C/W) of the heatsink.' },
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

export default function PowerCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [vals, setVals] = useState({ V: '', I: '', R: '', P: '' })
  const [hours, setHours] = useState(8)
  const [days, setDays] = useState(30)
  const [rate, setRate] = useState(0.13)
  const [openFaq, setOpenFaq] = useState(null)

  const n = k => parseFloat(vals[k]) || null
  const V = n('V'), I = n('I'), R = n('R'), P = n('P')
  const solveKey = SOLVE_FOR[solveIdx].key

  let result = null
  if (solveKey === 'P') {
    if (V && I) result = V * I
    else if (V && R) result = V * V / R
    else if (I && R) result = I * I * R
  } else if (solveKey === 'V') {
    if (P && I) result = P / I
    else if (P && R) result = Math.sqrt(P * R)
    else if (I && R) result = I * R
  } else if (solveKey === 'I') {
    if (P && V) result = P / V
    else if (V && R) result = V / R
    else if (P && R) result = Math.sqrt(P / R)
  } else if (solveKey === 'R') {
    if (V && I) result = V / I
    else if (V && P) result = V * V / P
    else if (P && I) result = P / (I * I)
  }

  // Derive all values
  let dV = V, dI = I, dR = R, dP = P
  if (result !== null) {
    if (solveKey === 'P') dP = result
    if (solveKey === 'V') dV = result
    if (solveKey === 'I') dI = result
    if (solveKey === 'R') dR = result
    if (!dP && dV && dI) dP = dV * dI
    if (!dP && dV && dR) dP = dV * dV / dR
    if (!dP && dI && dR) dP = dI * dI * dR
  }

  const kWh = dP ? dP / 1000 * hours * days : null
  const energyCost = kWh ? kWh * rate : null

  const hint = result !== null ? `${SOLVE_FOR[solveIdx].label}: ${fmtSI(result, SOLVE_FOR[solveIdx].unit)}. ${dP ? `Power: ${fmtSI(dP, 'W')}` : ''}` : 'Enter 2 known values to calculate.'

  const inputKeys = SOLVE_FOR.filter((_, i) => i !== solveIdx).map(s => s.key)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Electrical Power</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>P = V × I = V² / R = I² × R</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{result !== null ? fmtSI(result, SOLVE_FOR[solveIdx].unit) : '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{SOLVE_FOR[solveIdx].label}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SOLVE_FOR.map((s, i) => (
                <button key={s.key} onClick={() => setSolveIdx(i)}
                  style={{ padding: '9px 8px', borderRadius: 8, border: `1.5px solid ${solveIdx === i ? s.color : 'var(--border-2)'}`, background: solveIdx === i ? s.color + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: solveIdx === i ? 700 : 500, color: solveIdx === i ? s.color : 'var(--text-2)', cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Enter 2 known values</div>
          {inputKeys.map(k => {
            const sf = SOLVE_FOR.find(s => s.key === k)
            return (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 5, background: sf.color + '20', color: sf.color, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</span>
                  {sf.label}
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="number" value={vals[k]} onChange={e => setVals(v => ({ ...v, [k]: e.target.value }))} placeholder="Enter value"
                    style={{ flex: 1, height: 44, border: `1.5px solid var(--border-2)`, borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: sf.color, minWidth: 20 }}>{sf.unit}</span>
                </div>
              </div>
            )
          })}

          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Quick examples</div>
            {APPLIANCES.slice(0, 5).map((a, i) => (
              <button key={i} onClick={() => { setVals({ V: '120', I: (a.watts / 120).toFixed(2), R: '', P: '' }); setSolveIdx(0) }}
                style={{ display: 'block', width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', marginBottom: 5, fontSize: 12, color: 'var(--text)' }}>
                {a.icon} {a.name} — {a.watts}W
              </button>
            ))}
          </div>
        </>}

        right={<>
          {result !== null ? (
            <div style={{ background: SOLVE_FOR[solveIdx].color + '15', border: `1.5px solid ${SOLVE_FOR[solveIdx].color}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>{SOLVE_FOR[solveIdx].label}</div>
              <div style={{ fontSize: 48, fontWeight: 700, color: SOLVE_FOR[solveIdx].color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{fmtSI(result, SOLVE_FOR[solveIdx].unit)}</div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, background: 'var(--bg-raised)', borderRadius: 14, marginBottom: 14, border: '1px dashed var(--border)' }}>Enter 2 values to calculate</div>
          )}

          {/* All 4 values */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {SOLVE_FOR.map(s => (
              <div key={s.key} style={{ padding: '11px 13px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {fmtSI(s.key === 'V' ? dV : s.key === 'I' ? dI : s.key === 'R' ? dR : dP, s.unit)}
                </div>
              </div>
            ))}
          </div>

          {/* Energy cost calc */}
          {dP && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>💰 Energy cost estimator</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[['Hours/day', hours, setHours], ['Days/month', days, setDays], ['$/kWh', rate, setRate]].map(([l, v, set]) => (
                  <div key={l}>
                    <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input type="number" step={l === '$/kWh' ? 0.01 : 1} value={v} onChange={e => set(+e.target.value)}
                      style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              {[{ l: 'kWh/month', v: kWh?.toFixed(2) + ' kWh' }, { l: 'Monthly cost', v: '$' + energyCost?.toFixed(2), c: C }].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-2)' }}>{m.l}</span>
                  <span style={{ fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</span>
                </div>
              ))}
            </div>
          )}

          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Power reference table" sub="Common household loads">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {APPLIANCES.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setVals({ V: '120', I: (a.watts / 120).toFixed(2), R: '', P: '' }); setSolveIdx(0) }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{a.watts} W</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{(a.watts / 120).toFixed(2)} A @ 120V</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Power scale reference">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {POWER_TIERS.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ width: 70, fontWeight: 700, color: t.color, fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, flexShrink: 0 }}>{t.range}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.examples}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'P = V × I\nP = V² / R\nP = I² × R\nEnergy (kWh) = P(kW) × t(hrs)'}
        variables={[
          { symbol: 'P', meaning: 'Power in Watts (W)' },
          { symbol: 'V', meaning: 'Voltage in Volts (V)' },
          { symbol: 'I', meaning: 'Current in Amperes (A)' },
          { symbol: 'R', meaning: 'Resistance in Ohms (Ω)' },
        ]}
        explanation="The three power formulas are all equivalent — derived by substituting Ohm's Law (V = IR) into P = VI. Choose the formula that uses your two known quantities. Energy in kWh = Power in kW × time in hours, which is what electricity meters measure."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
