import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const AWG_DATA = [
  { awg: 18, dia_mm: 1.02, area_mm2: 0.823, r_per_m: 0.0209, ampacity_open: 7,   ampacity_conduit: 7   },
  { awg: 16, dia_mm: 1.29, area_mm2: 1.31,  r_per_m: 0.0132, ampacity_open: 10,  ampacity_conduit: 10  },
  { awg: 14, dia_mm: 1.63, area_mm2: 2.08,  r_per_m: 0.00826,ampacity_open: 20,  ampacity_conduit: 15  },
  { awg: 12, dia_mm: 2.05, area_mm2: 3.31,  r_per_m: 0.00519,ampacity_open: 25,  ampacity_conduit: 20  },
  { awg: 10, dia_mm: 2.59, area_mm2: 5.26,  r_per_m: 0.00327,ampacity_open: 40,  ampacity_conduit: 30  },
  { awg:  8, dia_mm: 3.26, area_mm2: 8.37,  r_per_m: 0.00205,ampacity_open: 55,  ampacity_conduit: 40  },
  { awg:  6, dia_mm: 4.11, area_mm2: 13.3,  r_per_m: 0.00129,ampacity_open: 75,  ampacity_conduit: 55  },
  { awg:  4, dia_mm: 5.19, area_mm2: 21.2,  r_per_m: 0.000812,ampacity_open: 95, ampacity_conduit: 70  },
  { awg:  2, dia_mm: 6.54, area_mm2: 33.6,  r_per_m: 0.000511,ampacity_open: 130,ampacity_conduit: 95  },
  { awg:  1, dia_mm: 7.35, area_mm2: 42.4,  r_per_m: 0.000405,ampacity_open: 150,ampacity_conduit: 110 },
]

const FAQ = [
  { q: 'What is ampacity?', a: 'Ampacity is the maximum continuous current a conductor can carry without exceeding its temperature rating. It depends on wire gauge, insulation type, ambient temperature, and installation method. Wires in conduit or bundles have lower ampacity because heat can\'t dissipate as easily. NEC ampacity tables (310.15) are the authoritative reference.' },
  { q: 'What is the difference between AWG and mm²?', a: 'AWG (American Wire Gauge) uses a reverse scale — larger numbers mean thinner wire (AWG 22 is thinner than AWG 12). European and international standards use direct cross-sectional area in mm². This calculator shows both. Common equivalents: AWG 14 ≈ 2.5mm², AWG 12 ≈ 4mm², AWG 10 ≈ 6mm².' },
  { q: 'Should I use copper or aluminum wire?', a: 'Copper carries more current per area (lower resistance) and is standard for most applications. Aluminum is used for large service entrance conductors and long feeders where the weight and cost savings justify going up 2 gauge sizes compared to copper. Never mix aluminum and copper conductors without approved anti-oxidant compound and rated connectors.' },
  { q: 'What about temperature derating?', a: 'Standard NEC ampacity assumes 30°C ambient and 75°C rated insulation. For higher ambient temperatures, apply derating factors: 40°C ambient × 0.91, 45°C × 0.87, 50°C × 0.82. For bundled cables (more than 3 current-carrying conductors), multiply by 0.70 for 4–6 conductors, 0.50 for 7–9.' },
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

export default function WireGaugeCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [current, setCurrent] = useState(20)
  const [length, setLength] = useState(30)
  const [voltage, setVoltage] = useState(120)
  const [inConduit, setInConduit] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  const minAWG = AWG_DATA.find(w => (inConduit ? w.ampacity_conduit : w.ampacity_open) >= current)

  const results = AWG_DATA.map(w => {
    const r = w.r_per_m * length * 2
    const vdrop = current * r
    const pct = voltage > 0 ? vdrop / voltage * 100 : 0
    const ampacity = inConduit ? w.ampacity_conduit : w.ampacity_open
    const ok_amp = ampacity >= current
    const ok_vdrop = pct <= 3
    return { ...w, r, vdrop, pct, ampacity, ok_amp, ok_vdrop }
  })

  const recommended = results.find(w => w.ok_amp && w.ok_vdrop) || minAWG

  const hint = `For ${current}A, ${length}m run: minimum AWG ${minAWG?.awg} for ampacity. ${recommended ? `AWG ${recommended.awg} meets both ampacity and 3% voltage drop.` : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Wire Gauge Selection</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Ampacity + 3% voltage drop check</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>AWG {recommended?.awg || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>recommended minimum</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Load current (A)', current, setCurrent, 0.1, 200], ['One-way length (m)', length, setLength, 1, 1000], ['System voltage (V)', voltage, setVoltage, 1, 600]].map(([l, v, set, min, max]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setInConduit(!inConduit)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 9, border: `1.5px solid ${inConduit ? C : 'var(--border-2)'}`, background: inConduit ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${inConduit ? C : 'var(--border-2)'}`, background: inConduit ? C : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {inConduit && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>In conduit / bundles (lower ampacity)</span>
            </button>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Recommendation" rows={[
            { label: 'Load current', value: `${current} A` },
            { label: 'Min for ampacity', value: `AWG ${minAWG?.awg || '—'}` },
            { label: 'Min for 3% V-drop', value: `AWG ${results.find(w => w.ok_vdrop)?.awg || '—'}` },
            { label: 'Recommended', value: `AWG ${recommended?.awg || '—'}`, bold: true, highlight: true, color: C },
            { label: 'Ampacity', value: `${recommended?.ampacity || '—'} A` },
            { label: 'Voltage drop', value: `${results.find(w => w.awg === recommended?.awg)?.pct.toFixed(2) || '—'}%` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="All gauges comparison" sub="Click row to select gauge">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['AWG', 'mm²', 'Ampacity', 'V Drop', '% Drop', 'Status'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {results.map((w, i) => {
                const isRec = w.awg === recommended?.awg
                return (
                  <tr key={i} style={{ background: isRec ? C + '10' : 'transparent' }}>
                    <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: isRec ? 700 : 400, color: isRec ? C : 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>AWG {w.awg}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{w.area_mm2}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: w.ok_amp ? '#10b981' : '#ef4444', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{w.ampacity}A</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: w.ok_vdrop ? '#10b981' : '#ef4444', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{w.vdrop.toFixed(3)}V</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: w.ok_vdrop ? '#10b981' : '#ef4444', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{w.pct.toFixed(2)}%</td>
                    <td style={{ padding: '8px 10px', borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: (w.ok_amp && w.ok_vdrop) ? '#d1fae5' : w.ok_amp ? '#fef3c7' : '#fee2e2', color: (w.ok_amp && w.ok_vdrop) ? '#065f46' : w.ok_amp ? '#92400e' : '#b91c1c', fontWeight: 600 }}>
                        {(w.ok_amp && w.ok_vdrop) ? '✓ OK' : w.ok_amp ? '⚠ Vdrop' : '✗ Low'}
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
        formula={'VDrop = I × R_total\nR_total = ρ × 2L / A\nAmpacity from NEC Table 310.15'}
        variables={[
          { symbol: 'I', meaning: 'Load current (A)' },
          { symbol: 'ρ', meaning: 'Copper resistivity = 1.724×10⁻⁸ Ω·m' },
          { symbol: 'L', meaning: 'One-way conductor length (m)' },
          { symbol: 'A', meaning: 'Cross-sectional area (m²)' },
        ]}
        explanation="Wire selection requires two checks: (1) Ampacity — the wire must handle the load current continuously without overheating. (2) Voltage drop — should be ≤3% per NEC recommendation. Often the voltage drop check requires a larger wire than the minimum ampacity check."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
