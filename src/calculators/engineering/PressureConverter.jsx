import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const UNITS = [
  { key: 'pa',   label: 'Pascals',        symbol: 'Pa',   factor: 1      },
  { key: 'kpa',  label: 'Kilopascals',    symbol: 'kPa',  factor: 1000   },
  { key: 'mpa',  label: 'Megapascals',    symbol: 'MPa',  factor: 1e6    },
  { key: 'bar',  label: 'Bar',            symbol: 'bar',  factor: 1e5    },
  { key: 'mbar', label: 'Millibar',       symbol: 'mbar', factor: 100    },
  { key: 'psi',  label: 'PSI',            symbol: 'psi',  factor: 6894.76},
  { key: 'ksi',  label: 'Kilopounds/in²', symbol: 'ksi',  factor: 6894760},
  { key: 'atm',  label: 'Atmospheres',    symbol: 'atm',  factor: 101325 },
  { key: 'mmhg', label: 'mmHg (Torr)',    symbol: 'mmHg', factor: 133.322},
  { key: 'inhg', label: 'Inches of Hg',  symbol: 'inHg', factor: 3386.39},
  { key: 'inwc', label: 'Inches water col',symbol: 'inWC',factor: 249.089},
]

const FAQ = [
  { q: 'What is atmospheric pressure?', a: 'Standard atmospheric pressure = 1 atm = 101,325 Pa = 1.01325 bar = 14.696 psi = 760 mmHg. This is the weight of the air column above you at sea level. It decreases with altitude — at the summit of Everest, pressure is about 33 kPa (0.33 atm).' },
  { q: 'What is gauge vs absolute pressure?', a: 'Absolute pressure = gauge pressure + atmospheric pressure. Gauge pressure is measured relative to atmosphere (0 psiG = 14.696 psia). Tire pressure is gauge: "30 psi" means 30 psi above atmospheric, or ~44.7 psia absolute. Always check which is meant in engineering specs.' },
]

function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}
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

export default function PressureConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(1)
  const [inputUnit, setInputUnit] = useState('bar')
  const [openFaq, setOpenFaq] = useState(null)

  const convert = (val, from, to) => {
    const base = val * (UNITS.find(u => u.key === from)?.factor || 1)
    return base / (UNITS.find(u => u.key === to)?.factor || 1)
  }
  const baseVal = inputVal * (UNITS.find(u => u.key === inputUnit)?.factor || 1)
  const fmt = v => {
    if (!isFinite(v) || isNaN(v)) return '—'
    const abs = Math.abs(v)
    if (abs === 0) return '0'
    if (abs >= 1e9 || abs < 1e-7) return v.toExponential(5)
    return parseFloat(v.toPrecision(7)).toString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Pressure Converter</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" value={inputVal} onChange={e => setInputVal(+e.target.value)}
            style={{ width: 160, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 22, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
          <select value={inputUnit} onChange={e => setInputUnit(e.target.value)}
            style={{ height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: C, fontWeight: 700, cursor: 'pointer' }}>
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label} ({u.symbol})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {UNITS.map(u => {
          const converted = baseVal / u.factor
          return (
            <div key={u.key} onClick={() => { setInputVal(parseFloat(converted.toPrecision(7))); setInputUnit(u.key) }}
              style={{ padding: '12px 14px', borderRadius: 10, background: inputUnit === u.key ? C + '15' : 'var(--bg-card)', border: `1px solid ${inputUnit === u.key ? C : 'var(--border)'}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{u.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: inputUnit === u.key ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>
                {fmt(converted)} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>{u.symbol}</span>
              </div>
            </div>
          )
        })}
      </div>

      

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
