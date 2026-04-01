import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const UNITS = [
  { key: 'w',    label: 'Watts',           symbol: 'W',    factor: 1         },
  { key: 'kw',   label: 'Kilowatts',       symbol: 'kW',   factor: 1000      },
  { key: 'mw',   label: 'Megawatts',       symbol: 'MW',   factor: 1e6       },
  { key: 'hp',   label: 'Horsepower (mech)',symbol: 'HP',   factor: 745.699   },
  { key: 'hpm',  label: 'Horsepower (metric)',symbol: 'PS', factor: 735.499   },
  { key: 'btuhr',label: 'BTU/hour',        symbol: 'BTU/h',factor: 0.29307   },
  { key: 'calps',label: 'Calories/second', symbol: 'cal/s',factor: 4.184     },
  { key: 'ftlbs',label: 'Foot-lb/second',  symbol: 'ft·lb/s',factor: 1.35582 },
  { key: 'ton',  label: 'Refrigeration ton',symbol: 'RT',  factor: 3516.85   },
]

const FAQ = [
  { q: 'What is a refrigeration ton?', a: 'A refrigeration ton (RT) = the power required to freeze 1 short ton (2000 lb) of water at 0°C in 24 hours = 3,516.85 W ≈ 3.517 kW. HVAC systems in the US are often rated in tons. A 3-ton air conditioner moves about 10.55 kW of heat.' },
  { q: 'What is the difference between mechanical and metric horsepower?', a: 'Mechanical HP (used in US/UK) = 550 ft·lb/s = 745.699 W. Metric HP (PS, Pferdestärke, used in Europe) = 75 kgf·m/s = 735.499 W. The difference is about 1.4%. European car specs in PS are slightly lower than the equivalent US HP rating.' },
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

export default function PowerConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(1)
  const [inputUnit, setInputUnit] = useState('kw')
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
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Power Converter</div>
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
