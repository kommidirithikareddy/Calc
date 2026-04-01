import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e3)  return (val/1e3).toFixed(2) + ' k' + unit
  if (abs >= 1)    return val.toFixed(2) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(2) + ' m' + unit
  return val.toExponential(2) + ' ' + unit
}

// Nearest standard resistor from E24
const E24 = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1]
function nearestE24(val) {
  let best = E24[0], bestDiff = Infinity
  for (const p of [1,10,100,1000,10000]) for (const e of E24) {
    const r = e * p; const diff = Math.abs(r - val)
    if (diff < bestDiff) { bestDiff = diff; best = r }
  }
  return best
}

const LED_PRESETS = [
  { name: 'Red',         vf: 2.0, if_mA: 20, color: '#ef4444', hex: '#ef4444' },
  { name: 'Orange',      vf: 2.1, if_mA: 20, color: '#f97316', hex: '#f97316' },
  { name: 'Yellow',      vf: 2.2, if_mA: 20, color: '#fbbf24', hex: '#fbbf24' },
  { name: 'Green',       vf: 2.2, if_mA: 20, color: '#22c55e', hex: '#22c55e' },
  { name: 'Blue',        vf: 3.2, if_mA: 20, color: '#3b82f6', hex: '#3b82f6' },
  { name: 'White',       vf: 3.2, if_mA: 20, color: '#f9fafb', hex: '#f9fafb' },
  { name: 'UV',          vf: 3.4, if_mA: 20, color: '#7c3aed', hex: '#7c3aed' },
  { name: 'IR',          vf: 1.5, if_mA: 50, color: '#dc2626', hex: '#dc2626' },
]

const FAQ = [
  { q: 'Why does an LED need a current-limiting resistor?', a: 'LEDs are diodes — they have a very low dynamic resistance once forward voltage is exceeded. Without a resistor, even a tiny extra voltage causes a huge current increase, instantly destroying the LED. The resistor drops the excess voltage and limits current to a safe level. Always use a resistor unless using a constant-current LED driver.' },
  { q: 'How do I choose resistor wattage?', a: 'Power dissipated in the resistor = (Vsupply − Vforward)² / R = (Vsupply − Vforward) × Iforward. Choose a resistor rated at least 2× the calculated power. For a 5V supply, 3.2V LED, 20mA: P = 1.8V × 20mA = 36mW. A 1/8W (125mW) resistor is adequate with good margin.' },
  { q: 'Can I connect multiple LEDs in series?', a: 'Yes — add up all forward voltages and ensure the supply is higher: Vsupply > ΣVforward. The same resistor formula applies: R = (Vsupply − ΣVforward) / Iforward. All LEDs in series carry the same current. Series is more efficient than parallel (no current imbalance between LEDs).' },
  { q: 'What if I do not have the exact calculated resistor value?', a: 'Use the nearest standard E24 resistor value that is equal to or larger than the calculated value. A larger resistor means slightly less current and slightly dimmer LED — this is safe. Using a smaller resistor can over-drive the LED. This calculator shows the nearest E24 value automatically.' },
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

export default function LEDResistorCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [vsupply, setVsupply] = useState(5)
  const [vforward, setVforward] = useState(2.0)
  const [iForward_mA, setIForward_mA] = useState(20)
  const [numSeries, setNumSeries] = useState(1)
  const [selectedLED, setSelectedLED] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const totalVF = vforward * numSeries
  const vDrop = vsupply - totalVF
  const iForward = iForward_mA / 1000
  const rExact = vDrop > 0 ? vDrop / iForward : null
  const rNearest = rExact ? nearestE24(rExact) : null
  const powerInResistor = rExact ? vDrop * iForward : null
  const powerInLED = vforward * iForward
  const efficiency = rExact ? powerInLED / (vsupply * iForward) * 100 : null

  const hint = rExact ? `R = ${rExact.toFixed(1)}Ω (use ${rNearest}Ω standard). Power in R: ${(powerInResistor * 1000).toFixed(1)}mW. LED power: ${(powerInLED * 1000).toFixed(1)}mW.` : 'Increase supply voltage — it must exceed total forward voltage.'

  const isValid = vDrop > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>LED Resistor Formula</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>R = (Vs − Vf × n) / If</div>
        </div>
        {isValid ? (
          <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{rNearest ? `${rNearest < 1000 ? rNearest : rNearest / 1000 + 'k'}Ω` : '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>nearest E24 value</div>
          </div>
        ) : (
          <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>⚠️ Supply must exceed {totalVF}V</div>
        )}
      </div>

      {/* LED Color Picker */}
      <Sec title="Select LED type" sub="Click to load typical values">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {LED_PRESETS.map((led, i) => (
            <button key={i} onClick={() => { setSelectedLED(i); setVforward(led.vf); setIForward_mA(led.if_mA) }}
              style={{ padding: '10px 8px', borderRadius: 9, border: `1.5px solid ${selectedLED === i ? C : 'var(--border-2)'}`, background: selectedLED === i ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: led.hex, margin: '0 auto 6px', boxShadow: `0 0 8px ${led.hex}80`, border: '1px solid #00000015' }} />
              <div style={{ fontSize: 11, fontWeight: selectedLED === i ? 700 : 500, color: selectedLED === i ? C : 'var(--text-2)' }}>{led.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{led.vf}V</div>
            </button>
          ))}
        </div>
      </Sec>

      <CalcShell
        left={<>
          {[['Supply voltage (V)', vsupply, setVsupply, 0.1, 48], ['LED forward voltage (V)', vforward, setVforward, 0.5, 5], ['Forward current (mA)', iForward_mA, setIForward_mA, 1, 200]].map(([l, v, set, min, max]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step={l.includes('mA') ? 1 : 0.1} value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>LEDs in series</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setNumSeries(n)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${numSeries === n ? C : 'var(--border-2)'}`, background: numSeries === n ? C + '12' : 'var(--bg-raised)', fontSize: 14, fontWeight: numSeries === n ? 700 : 500, color: numSeries === n ? C : 'var(--text-2)', cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
            {numSeries > 1 && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Total Vf: {totalVF}V — supply must be &gt; {totalVF}V</div>}
          </div>

          {/* Common supply voltages */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Common supply voltages</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[3.3, 5, 9, 12, 24].map(v => (
                <button key={v} onClick={() => setVsupply(v)}
                  style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${vsupply === v ? C : 'var(--border-2)'}`, background: vsupply === v ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: vsupply === v ? 700 : 500, color: vsupply === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{v}V</button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {isValid ? (
            <>
              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ l: 'Exact resistor', v: `${rExact?.toFixed(1)}Ω`, c: 'var(--text)' }, { l: 'Use standard', v: `${rNearest && rNearest < 1000 ? rNearest + 'Ω' : (rNearest / 1000).toFixed(1) + 'kΩ'}`, c: C }, { l: 'Resistor power', v: `${(powerInResistor * 1000).toFixed(1)}mW` }, { l: 'LED power', v: `${(powerInLED * 1000).toFixed(1)}mW` }, { l: 'Efficiency', v: `${efficiency?.toFixed(1)}%` }, { l: 'Voltage drop', v: `${vDrop.toFixed(2)}V` }].map((m, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{m.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: m.c, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: '10px 13px', background: '#d1fae5', borderRadius: 9, fontSize: 12, color: '#065f46' }}>
                  💡 Use a resistor rated at least <strong>{((powerInResistor || 0) * 2 * 1000).toFixed(0)}mW</strong> (2× safety margin)
                </div>
              </div>
              <BreakdownTable title="Circuit summary" rows={[
                { label: 'Supply voltage', value: `${vsupply}V` },
                { label: `LED Vf (×${numSeries})`, value: `${totalVF}V` },
                { label: 'Voltage across R', value: `${vDrop.toFixed(2)}V` },
                { label: 'LED current', value: `${iForward_mA}mA` },
                { label: 'Resistor (exact)', value: `${rExact?.toFixed(1)}Ω` },
                { label: 'Resistor (E24)', value: `${rNearest}Ω`, bold: true, highlight: true, color: C },
              ]} />
            </>
          ) : (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#ef4444', fontSize: 13, background: '#fee2e2', borderRadius: 14, marginBottom: 14, border: '1px solid #ef444430' }}>
              ⚠️ Supply voltage ({vsupply}V) must be greater than total forward voltage ({totalVF}V)
            </div>
          )}
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="All LED types — typical values" sub="Reference for common LED specifications">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['LED', 'Vf typical', 'Vf range', 'If typical', 'Notes'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[...LED_PRESETS, { name: 'High-power (1W)', vf: 3.2, if_mA: 350, color: '#f59e0b' }, { name: 'RGB (each)', vf: 2.0, if_mA: 20, color: '#8b5cf6' }].map((led, i) => (
                <tr key={i} style={{ cursor: 'pointer', background: selectedLED === i ? C + '08' : 'transparent' }} onClick={() => { if (i < LED_PRESETS.length) { setSelectedLED(i); setVforward(led.vf); setIForward_mA(led.if_mA) } }}>
                  <td style={{ padding: '8px 10px', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: led.hex || led.color, boxShadow: `0 0 4px ${led.hex || led.color}60` }} />
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>{led.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: C, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{led.vf}V</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{led.vf - 0.3}–{led.vf + 0.3}V</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{led.if_mA}mA</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>
                    {i < LED_PRESETS.length ? `R = ${((vsupply - led.vf) / (led.if_mA / 1000)).toFixed(0)}Ω at ${vsupply}V` : 'Use constant current driver'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <FormulaCard
        formula={'R = (Vs − Vf × n) / If\nP_resistor = (Vs − Vf)² / R\nP_LED = Vf × If'}
        variables={[
          { symbol: 'R', meaning: 'Current limiting resistor (Ω)' },
          { symbol: 'Vs', meaning: 'Supply voltage (V)' },
          { symbol: 'Vf', meaning: 'LED forward voltage (V)' },
          { symbol: 'If', meaning: 'LED forward current (A)' },
          { symbol: 'n', meaning: 'Number of LEDs in series' },
        ]}
        explanation="The resistor drops the excess voltage (Vs − Vf) while limiting current to the safe forward current If. Power dissipated in the resistor = (Vs − Vf) × If and must not exceed the resistor's power rating. Always use a resistor rated at 2× the calculated dissipation."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
