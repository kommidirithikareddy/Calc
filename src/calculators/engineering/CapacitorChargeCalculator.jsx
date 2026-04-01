import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6)  return (val/1e6).toFixed(4) + ' M' + unit
  if (abs >= 1e3)  return (val/1e3).toFixed(4) + ' k' + unit
  if (abs >= 1)    return val.toFixed(4) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(4) + ' m' + unit
  if (abs >= 1e-6) return (val*1e6).toFixed(4) + ' μ' + unit
  if (abs >= 1e-9) return (val*1e9).toFixed(4) + ' n' + unit
  if (abs >= 1e-12) return (val*1e12).toFixed(4) + ' p' + unit
  return val.toExponential(3) + ' ' + unit
}

const CAP_TYPES = [
  { name: 'Ceramic', range: '1 pF – 100 μF', voltage: '6.3–50V typical', use: 'Decoupling, filtering, timing', color: '#f59e0b' },
  { name: 'Electrolytic (Al)', range: '1 μF – 100 mF', voltage: '6.3–450V', use: 'Power supply filtering, audio', color: '#3b82f6' },
  { name: 'Tantalum', range: '0.1–470 μF', voltage: '4–35V', use: 'SMD filtering, medical', color: '#ef4444' },
  { name: 'Film', range: '1 nF – 100 μF', voltage: 'Up to 1500V', use: 'Audio, power, precision timing', color: '#10b981' },
  { name: 'Supercapacitor', range: '0.1–3000 F', voltage: '2.7–5.5V', use: 'Energy storage, backup power', color: '#8b5cf6' },
]

const FAQ = [
  { q: 'What is an RC time constant?', a: 'The RC time constant τ (tau) = R × C, measured in seconds. It represents the time for a capacitor to charge to 63.2% of the supply voltage through a resistor (or discharge to 36.8%). After 5τ, the capacitor is considered fully charged (99.3%). Doubling either R or C doubles the time constant.' },
  { q: 'Why is charge energy ½CV² and not CV²?', a: 'When charging a capacitor through a resistor, exactly half the energy from the source is dissipated as heat in the resistor, regardless of resistance value. Only half reaches the capacitor. The factor of ½ in E = ½CV² reflects this fundamental physical constraint — it is not an approximation.' },
  { q: 'What is capacitor ESR?', a: 'Equivalent Series Resistance (ESR) is the parasitic resistance inherent in every capacitor. Low ESR is critical in power supply bypass capacitors — high ESR causes ripple, heat, and reduced effectiveness. Electrolytic capacitors have higher ESR than ceramic or tantalum types, which is why they are being replaced in modern PSU designs.' },
  { q: 'How do capacitors behave in AC circuits?', a: 'Capacitive reactance Xc = 1/(2πfC) decreases as frequency increases — capacitors pass high frequencies and block DC. This makes them useful as high-pass filters (blocking low-frequency signals), bypass capacitors (passing high-frequency noise to ground), and in RC and LC filter networks.' },
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

export default function CapacitorChargeCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [capF, setCapF] = useState(100e-6)
  const [capUnit, setCapUnit] = useState('μF')
  const [capDisp, setCapDisp] = useState(100)
  const [voltage, setVoltage] = useState(12)
  const [resistance, setResistance] = useState(1000)
  const [freq, setFreq] = useState(1000)
  const [openFaq, setOpenFaq] = useState(null)

  const unitMultipliers = { 'pF': 1e-12, 'nF': 1e-9, 'μF': 1e-6, 'mF': 1e-3, 'F': 1 }
  const capacitance = capDisp * (unitMultipliers[capUnit] || 1e-6)

  const charge = capacitance * voltage
  const energy = 0.5 * capacitance * voltage * voltage
  const tau = resistance * capacitance
  const reactance = 1 / (2 * Math.PI * freq * capacitance)

  // Charge curve points (% time constants)
  const curvePoints = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(t => ({
    t,
    v: voltage * (1 - Math.exp(-t)),
    pct: (1 - Math.exp(-t)) * 100,
  }))

  const hint = `C=${fmtSI(capacitance,'F')}, V=${voltage}V: Q=${fmtSI(charge,'C')}, E=${fmtSI(energy,'J')}, τ=${fmtSI(tau,'s')}, Xc@${freq}Hz=${fmtSI(reactance,'Ω')}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Capacitor Analysis</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Q = CV · E = ½CV² · τ = RC</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ l: 'Charge', v: fmtSI(charge, 'C') }, { l: 'Energy', v: fmtSI(energy, 'J') }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Capacitance</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={capDisp} onChange={e => setCapDisp(+e.target.value)} style={{ flex: 1, height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
              <select value={capUnit} onChange={e => setCapUnit(e.target.value)} style={{ height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}>
                {['pF', 'nF', 'μF', 'mF', 'F'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          {[['Voltage (V)', voltage, setVoltage, 0.001, 1000], ['Series resistance (Ω)', resistance, setResistance, 0.001, 1e9]].map(([l, v, set, min, max]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Frequency for Xc (Hz)</label>
            <input type="number" value={freq} onChange={e => setFreq(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
        </>}

        right={<>
          <BreakdownTable title="Results" rows={[
            { label: 'Capacitance', value: fmtSI(capacitance, 'F'), bold: true, highlight: true, color: C },
            { label: 'Charge (Q = CV)', value: fmtSI(charge, 'C') },
            { label: 'Energy (E = ½CV²)', value: fmtSI(energy, 'J') },
            { label: 'RC time constant (τ)', value: fmtSI(tau, 's') },
            { label: 'Fully charged (5τ)', value: fmtSI(tau * 5, 's') },
            { label: `Reactance at ${freq}Hz`, value: fmtSI(reactance, 'Ω') },
          ]} />

          {/* Charge curve */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>RC charging curve (time constants)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {curvePoints.filter(p => p.t <= 5).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 24 }}>{p.t}τ</span>
                  <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: `hsl(${38 + p.pct * 0.8},90%,50%)`, borderRadius: 5, transition: 'width .4s' }} />
                  </div>
                  <span style={{ fontSize: 10, color: C, fontWeight: 700, minWidth: 36, fontFamily: "'Space Grotesk',sans-serif" }}>{p.pct.toFixed(1)}%</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 50 }}>{(voltage * (1 - Math.exp(-p.t))).toFixed(2)}V</span>
                </div>
              ))}
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Capacitor types" sub="Choose the right type for your application">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CAP_TYPES.map((ct, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 9, background: ct.color + '08', border: `1px solid ${ct.color}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ct.color }}>{ct.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{ct.range}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{ct.use} · {ct.voltage}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Capacitive reactance vs frequency" sub="How Xc changes with frequency">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[10, 100, 1000, 10000, 100000, 1000000].map(f => {
            const xc = 1 / (2 * Math.PI * f * capacitance)
            return (
              <div key={f} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9, textAlign: 'center', border: f === freq ? `1.5px solid ${C}` : '0.5px solid var(--border)', cursor: 'pointer' }} onClick={() => setFreq(f)}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{f >= 1000 ? f / 1000 + 'kHz' : f + 'Hz'}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmtSI(xc, 'Ω')}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <FormulaCard
        formula={'Q = C × V\nE = ½ × C × V²\nτ = R × C\nXc = 1 / (2πfC)'}
        variables={[
          { symbol: 'Q', meaning: 'Charge in Coulombs (C)' },
          { symbol: 'C', meaning: 'Capacitance in Farads (F)' },
          { symbol: 'V', meaning: 'Voltage in Volts (V)' },
          { symbol: 'τ', meaning: 'RC time constant in seconds' },
          { symbol: 'Xc', meaning: 'Capacitive reactance in Ohms (Ω)' },
        ]}
        explanation="A capacitor stores charge proportional to voltage. Energy stored is ½CV² — not CV² because half the energy is lost charging through any resistance. The time constant τ tells you how quickly a capacitor charges through a series resistor. Reactance Xc describes opposition to AC current — inversely proportional to frequency."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
