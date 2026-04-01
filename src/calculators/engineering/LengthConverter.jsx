import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const UNITS = [
  { key: 'mm',  label: 'Millimetres', symbol: 'mm',   factor: 0.001 },
  { key: 'cm',  label: 'Centimetres', symbol: 'cm',   factor: 0.01  },
  { key: 'm',   label: 'Metres',      symbol: 'm',    factor: 1     },
  { key: 'km',  label: 'Kilometres',  symbol: 'km',   factor: 1000  },
  { key: 'in',  label: 'Inches',      symbol: 'in',   factor: 0.0254},
  { key: 'ft',  label: 'Feet',        symbol: 'ft',   factor: 0.3048},
  { key: 'yd',  label: 'Yards',       symbol: 'yd',   factor: 0.9144},
  { key: 'mi',  label: 'Miles',       symbol: 'mi',   factor: 1609.344},
  { key: 'nmi', label: 'Nautical miles', symbol: 'nmi', factor: 1852 },
  { key: 'um',  label: 'Micrometres', symbol: 'μm',   factor: 1e-6  },
  { key: 'nm',  label: 'Nanometres',  symbol: 'nm',   factor: 1e-9  },
  { key: 'ly',  label: 'Light-years', symbol: 'ly',   factor: 9.461e15 },
]

const REFERENCES = [
  { name: 'Height of Burj Khalifa', value: 828, unit: 'm' },
  { name: 'Length of football field', value: 100, unit: 'm' },
  { name: 'Earth to Moon', value: 384400, unit: 'km' },
  { name: 'Width of human hair', value: 70, unit: 'μm' },
  { name: 'A4 paper width', value: 210, unit: 'mm' },
  { name: 'Marathon distance', value: 42.195, unit: 'km' },
]

const FAQ = [
  { q: 'How do I convert feet and inches to metres?', a: 'Convert feet to metres: multiply by 0.3048. Convert inches to metres: multiply by 0.0254. For 5 feet 11 inches: (5 × 0.3048) + (11 × 0.0254) = 1.524 + 0.2794 = 1.8034 m.' },
  { q: 'What is the difference between a nautical mile and a statute mile?', a: 'A statute mile = 1,609.344 m (land measurement). A nautical mile = 1,852 m, defined as 1 minute of arc along a meridian of Earth. Nautical miles are used in aviation and maritime navigation. 1 knot = 1 nautical mile per hour.' },
  { q: 'How small is a nanometre?', a: 'A nanometre (nm) = 10⁻⁹ metres. A human hair is ~70,000 nm wide. A DNA strand is ~2 nm. Modern microchips have transistors as small as 3–5 nm. It\'s the length scale of atoms and molecules.' },
]

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

export default function LengthConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(1)
  const [inputUnit, setInputUnit] = useState('m')
  const [openFaq, setOpenFaq] = useState(null)

  const baseVal = inputVal * (UNITS.find(u => u.key === inputUnit)?.factor || 1)
  const fmt = v => {
    if (v === 0) return '0'
    const abs = Math.abs(v)
    if (abs >= 1e9 || abs < 1e-6) return v.toExponential(6)
    return parseFloat(v.toPrecision(8)).toString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Length Converter</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" value={inputVal} onChange={e => setInputVal(+e.target.value)}
            style={{ width: 160, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 22, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
          <select value={inputUnit} onChange={e => setInputUnit(e.target.value)}
            style={{ height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: C, fontWeight: 700, cursor: 'pointer' }}>
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label} ({u.symbol})</option>)}
          </select>
          <span style={{ fontSize: 14, color: 'var(--text-3)' }}>= {fmt(baseVal)} m (base)</span>
        </div>
      </div>

      {/* All conversions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {UNITS.map(u => {
          const converted = baseVal / u.factor
          return (
            <div key={u.key} onClick={() => { setInputVal(parseFloat(converted.toPrecision(8))); setInputUnit(u.key) }}
              style={{ padding: '12px 14px', borderRadius: 10, background: inputUnit === u.key ? C + '15' : 'var(--bg-card)', border: `1px solid ${inputUnit === u.key ? C : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{u.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: inputUnit === u.key ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>{fmt(converted)} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>{u.symbol}</span></div>
            </div>
          )
        })}
      </div>

      {/* Quick conversion reference */}
      <Sec title="Common length conversions" sub="Quick reference table">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['', 'mm', 'cm', 'm', 'km', 'inch', 'foot', 'mile'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', padding: '7px 8px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[['1 mm', 1, 0.1, 0.001, 1e-6, 0.03937, 0.003281, 6.21e-7],
                ['1 cm', 10, 1, 0.01, 1e-5, 0.3937, 0.03281, 6.21e-6],
                ['1 m', 1000, 100, 1, 0.001, 39.37, 3.281, 6.214e-4],
                ['1 km', 1e6, 1e5, 1000, 1, 39370, 3281, 0.6214],
                ['1 inch', 25.4, 2.54, 0.0254, 2.54e-5, 1, 0.0833, 1.578e-5],
                ['1 foot', 304.8, 30.48, 0.3048, 3.048e-4, 12, 1, 1.894e-4],
                ['1 mile', 1.609e6, 160934, 1609.34, 1.609, 63360, 5280, 1]
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '7px 8px', fontSize: 11, fontWeight: 700, color: C, borderBottom: '0.5px solid var(--border)', whiteSpace: 'nowrap' }}>{row[0]}</td>
                  {row.slice(1).map((v, j) => (
                    <td key={j} style={{ padding: '7px 8px', fontSize: 11, color: 'var(--text)', textAlign: 'right', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>
                      {typeof v === 'number' && (v >= 0.001 && v < 1e6) ? parseFloat(v.toPrecision(4)) : v.toExponential(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Real-world reference lengths">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {REFERENCES.map((r, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{r.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.value} {r.unit}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Value (m) = Value (unit) × Conversion factor\n1 inch = 25.4 mm exactly\n1 foot = 0.3048 m exactly\n1 mile = 1,609.344 m exactly'}
        variables={[
          { symbol: '1 in', meaning: '= 25.4 mm = 2.54 cm = 0.0254 m' },
          { symbol: '1 ft', meaning: '= 304.8 mm = 12 in = 0.3048 m' },
          { symbol: '1 mi', meaning: '= 5,280 ft = 1,760 yd = 1,609.344 m' },
          { symbol: '1 nmi', meaning: '= 1,852 m = 1.151 miles' },
        ]}
        explanation="All length conversions use metres as the SI base unit. Imperial units are now defined in terms of metric: 1 inch = 25.4 mm exactly (by international agreement since 1959). All other imperial lengths follow from this definition."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
