import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const UNITS = [
  { key: 'ml',   label: 'Millilitres',    symbol: 'mL',  factor: 1e-6      },
  { key: 'l',    label: 'Litres',         symbol: 'L',   factor: 0.001     },
  { key: 'm3',   label: 'Cubic metres',   symbol: 'm³',  factor: 1         },
  { key: 'cm3',  label: 'Cubic cm (cc)',  symbol: 'cm³', factor: 1e-6      },
  { key: 'ft3',  label: 'Cubic feet',     symbol: 'ft³', factor: 0.0283168 },
  { key: 'in3',  label: 'Cubic inches',   symbol: 'in³', factor: 1.6387e-5 },
  { key: 'usgal',label: 'US gallons',     symbol: 'US gal',factor: 0.00378541},
  { key: 'ukgal',label: 'UK gallons',     symbol: 'UK gal',factor: 0.00454609},
  { key: 'floz', label: 'US fluid oz',    symbol: 'fl oz',factor: 2.9574e-5},
  { key: 'cup',  label: 'US cups',        symbol: 'cup', factor: 2.3659e-4 },
  { key: 'pt',   label: 'US pints',       symbol: 'pt',  factor: 4.7318e-4 },
  { key: 'qt',   label: 'US quarts',      symbol: 'qt',  factor: 9.4635e-4 },
  { key: 'bbl',  label: 'Oil barrels',    symbol: 'bbl', factor: 0.158987  },
]

const FAQ = [
  { q: 'Why are US and UK gallons different?', a: 'US gallon = 231 cubic inches = 3.785 L, defined in the early US. UK (imperial) gallon = 4.546 L, defined as 10 lb of water at 62°F. They differ by about 20%. 1 UK gallon = 1.2 US gallons. Always specify which gallon when discussing fuel economy across countries.' },
  { q: 'What is a barrel of oil?', a: 'A US oil barrel = 42 US gallons = 158.987 L. This arbitrary unit originated in the Pennsylvania oil fields in the 1860s when 42-gallon wooden whiskey barrels were used. Oil prices worldwide are quoted per barrel (bbl).' },
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

export default function VolumeConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(1)
  const [inputUnit, setInputUnit] = useState('l')
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
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Volume Converter</div>
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
