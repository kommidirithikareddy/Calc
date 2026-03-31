import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is the fastest way to calculate square footage?', a: 'Measure length and width in feet (using a tape measure or laser measurer), then multiply: Length × Width = Square feet. For irregular rooms, divide them into rectangles, calculate each, and add the totals together.' },
  { q: 'How do I convert square feet to square meters?', a: '1 square foot = 0.0929 square meters. To convert: sq ft × 0.0929 = sq meters. Or: sq meters ÷ 0.0929 = sq ft. A 1,000 sq ft home is about 93 square meters.' },
  { q: 'How many square feet are in a square yard?', a: '1 square yard = 9 square feet (because 1 yard = 3 feet, and 3 × 3 = 9). Carpet and some flooring materials are sold by the square yard. Divide your square footage by 9 to get square yards.' },
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

const SHAPES = [
  { id: 'rectangle', label: 'Rectangle',  calc: (v) => v.l * v.w, fields: [['l','Length (ft)'],['w','Width (ft)']], defaults: { l: 20, w: 15 } },
  { id: 'circle',    label: 'Circle',     calc: (v) => Math.PI * v.r * v.r, fields: [['r','Radius (ft)']], defaults: { r: 10 } },
  { id: 'triangle',  label: 'Triangle',   calc: (v) => 0.5 * v.b * v.h, fields: [['b','Base (ft)'],['h','Height (ft)']], defaults: { b: 20, h: 15 } },
]

export default function AreaCalculatorUtil({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [shapeId, setShapeId] = useState('rectangle')
  const [vals, setVals] = useState({ l: 20, w: 15, r: 10, b: 20, h: 15 })
  const [rooms, setRooms] = useState([{ name: 'Room 1', sqft: 300 }, { name: 'Room 2', sqft: 200 }])
  const [ppSqFt, setPpSqFt] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const shape = SHAPES.find(s => s.id === shapeId)
  const area = shape.calc(vals)
  const sqM = area * 0.0929
  const sqYd = area / 9
  const cost = ppSqFt ? area * parseFloat(ppSqFt) : null

  const hint = `${shape.label}: ${area.toFixed(2)} sq ft = ${sqM.toFixed(2)} m² = ${sqYd.toFixed(2)} sq yd.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Area Calculator</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Square footage with unit conversions</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{area.toFixed(1)} ft²</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Shape</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {SHAPES.map(s => (
                <button key={s.id} onClick={() => setShapeId(s.id)}
                  style={{ flex: 1, padding: '8px 6px', borderRadius: 8, border: `1.5px solid ${shapeId === s.id ? C : 'var(--border-2)'}`, background: shapeId === s.id ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: shapeId === s.id ? 700 : 500, color: shapeId === s.id ? C : 'var(--text-2)', cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
          </div>
          {shape.fields.map(([k, l]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={vals[k] || 0} onChange={e => setVals(v => ({ ...v, [k]: Math.max(0.1, +e.target.value) }))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Price per sq ft ($) — optional</label>
            <input type="number" value={ppSqFt} onChange={e => setPpSqFt(e.target.value)} placeholder="e.g. 150"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 15, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Area results" rows={[
            { label: 'Square feet', value: `${area.toFixed(2)} ft²`, bold: true, highlight: true, color: C },
            { label: 'Square meters', value: `${sqM.toFixed(2)} m²` },
            { label: 'Square yards', value: `${sqYd.toFixed(2)} yd²` },
            { label: 'Square inches', value: `${(area * 144).toFixed(0)} in²` },
            ...(cost ? [{ label: 'Value estimate', value: `$${cost.toFixed(2)}`, color: C }] : []),
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
