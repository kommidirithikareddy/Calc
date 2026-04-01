import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function toC(val, from) {
  if (from === 'C') return val
  if (from === 'F') return (val - 32) * 5/9
  if (from === 'K') return val - 273.15
  if (from === 'R') return (val - 491.67) * 5/9
}
function fromC(val, to) {
  if (to === 'C') return val
  if (to === 'F') return val * 9/5 + 32
  if (to === 'K') return val + 273.15
  if (to === 'R') return (val + 273.15) * 9/5
}

const UNITS = [
  { key: 'C', label: 'Celsius',    symbol: '°C' },
  { key: 'F', label: 'Fahrenheit', symbol: '°F' },
  { key: 'K', label: 'Kelvin',     symbol: 'K'  },
  { key: 'R', label: 'Rankine',    symbol: '°R' },
]

const REFS = [
  { name: 'Absolute zero', C: -273.15 }, { name: 'Water freezes', C: 0 },
  { name: 'Room temperature', C: 20 }, { name: 'Body temperature', C: 37 },
  { name: 'Water boils', C: 100 }, { name: 'Oven (medium)', C: 180 },
]

function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

const FAQ = [
  { q: 'What is absolute zero?', a: 'Absolute zero is the lowest possible temperature: 0 K = −273.15°C = −459.67°F. At this temperature, atomic motion stops. It is theoretically impossible to reach exactly 0 K.' },
  { q: 'How do I convert Celsius to Fahrenheit?', a: 'F = C × 9/5 + 32. Quick mental math: double the Celsius, subtract 10%, add 32. Room temperature (20°C) → 36 − 3.6 + 32 = 64.4°F ≈ 68°F.' },
  { q: 'What is Kelvin used for?', a: 'Kelvin is the SI absolute temperature scale used in science. 0 K is absolute zero — there are no negative Kelvin values. Gas laws, thermodynamics, and black body radiation all require absolute (Kelvin) temperature. Convert: K = °C + 273.15.' },
]

export default function TemperatureConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(100)
  const [inputUnit, setInputUnit] = useState('C')
  const [openFaq, setOpenFaq] = useState(null)
  const celsiusVal = toC(inputVal, inputUnit)
  const fmt = v => isFinite(v) ? parseFloat(v.toPrecision(7)).toString() : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Temperature Converter</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" step="any" value={inputVal} onChange={e => setInputVal(+e.target.value)}
            style={{ width: 160, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 22, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
          <select value={inputUnit} onChange={e => setInputUnit(e.target.value)}
            style={{ height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: C, fontWeight: 700, cursor: 'pointer' }}>
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label} ({u.symbol})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {UNITS.map(u => {
          const v = fromC(celsiusVal, u.key)
          return (
            <div key={u.key} onClick={() => { setInputVal(parseFloat(v.toPrecision(7))); setInputUnit(u.key) }}
              style={{ padding: '14px 16px', borderRadius: 12, background: inputUnit === u.key ? C + '15' : 'var(--bg-card)', border: `1.5px solid ${inputUnit === u.key ? C : 'var(--border)'}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{u.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: inputUnit === u.key ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
                {fmt(v)}<span style={{ fontSize: 14, marginLeft: 4, fontWeight: 500, color: 'var(--text-3)' }}>{u.symbol}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Reference temperatures</div>
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {REFS.map((r, i) => (
            <div key={i} onClick={() => { setInputVal(r.C); setInputUnit('C') }}
              style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['C','F','K'].map(u => <span key={u} style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(fromC(r.C, u))}{u === 'C' ? '°C' : u === 'F' ? '°F' : 'K'}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FormulaCard
        formula={"°F = °C × 9/5 + 32\n°C = (°F − 32) × 5/9\nK = °C + 273.15\n°R = °F + 459.67"}
        variables={[
          { symbol: '°C', meaning: 'Celsius — 0 = water freezes, 100 = water boils' },
          { symbol: '°F', meaning: 'Fahrenheit — 32 = freezes, 212 = boils' },
          { symbol: 'K', meaning: 'Kelvin — absolute scale, 0 = absolute zero' },
          { symbol: '°R', meaning: 'Rankine — absolute Fahrenheit scale' },
        ]}
        explanation="Celsius and Kelvin have the same degree size; Kelvin just starts at absolute zero. Fahrenheit and Rankine are related similarly. To convert any temperature, first convert to Celsius, then to the target scale."
      />
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Frequently asked questions</div>
        <div style={{ padding: '16px 18px' }}>{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</div>
      </div>
    </div>
  )
}
