import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const SHAPES = [
  { id: 'box',      label: 'Box/Cube',    icon: '📦', fields: [['l','Length'],['w','Width'],['h','Height']], defaults: {l:5,w:4,h:3}, calc: v => v.l*v.w*v.h, formula:'V = l × w × h' },
  { id: 'cylinder', label: 'Cylinder',    icon: '🥫', fields: [['r','Radius'],['h','Height']], defaults: {r:3,h:8}, calc: v => Math.PI*v.r*v.r*v.h, formula:'V = πr²h' },
  { id: 'sphere',   label: 'Sphere',      icon: '⚽', fields: [['r','Radius']], defaults: {r:5}, calc: v => (4/3)*Math.PI*v.r*v.r*v.r, formula:'V = ⁴⁄₃πr³' },
  { id: 'cone',     label: 'Cone',        icon: '🍦', fields: [['r','Radius'],['h','Height']], defaults: {r:4,h:10}, calc: v => (1/3)*Math.PI*v.r*v.r*v.h, formula:'V = ⅓πr²h' },
  { id: 'pyramid',  label: 'Pyramid',     icon: '🔺', fields: [['l','Base length'],['w','Base width'],['h','Height']], defaults: {l:6,w:6,h:8}, calc: v => (1/3)*v.l*v.w*v.h, formula:'V = ⅓ × l × w × h' },
]

const FAQ = [
  { q: 'How do I convert cubic feet to gallons?', a: '1 cubic foot = 7.481 gallons (US). So multiply cubic feet by 7.481. Example: a 10 ft³ tank holds about 74.8 gallons. For liters: 1 ft³ = 28.317 liters.' },
  { q: 'What is the difference between volume and capacity?', a: 'Volume is the amount of 3D space an object occupies (in cubic units). Capacity is the amount a container can hold (in liquid units like gallons or liters). They measure the same thing but are used in different contexts. A 2-liter bottle has a capacity of 2 liters and a volume of 2,000 cubic centimeters.' },
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

export default function VolumeCalculatorUtil({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [shapeId, setShapeId] = useState('box')
  const [vals, setVals] = useState({ l: 5, w: 4, h: 3, r: 3 })
  const [unit, setUnit] = useState('ft')
  const [openFaq, setOpenFaq] = useState(null)

  const shape = SHAPES.find(s => s.id === shapeId)
  const cubicUnits = shape.calc(vals)
  const cubicFt = unit === 'ft' ? cubicUnits : unit === 'in' ? cubicUnits / 1728 : unit === 'm' ? cubicUnits * 35.315 : cubicUnits
  const gallons = cubicFt * 7.481
  const liters = cubicFt * 28.317

  const hint = `${shape.label}: ${cubicUnits.toFixed(2)} cubic ${unit}. = ${gallons.toFixed(1)} gallons / ${liters.toFixed(1)} liters.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{shape.label} — {shape.formula}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{shape.formula}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{cubicUnits.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>cubic {unit}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Shape</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SHAPES.map(s => (
                <button key={s.id} onClick={() => { setShapeId(s.id); setVals(v => ({ ...v, ...s.defaults })) }}
                  style={{ padding: '8px 10px', borderRadius: 9, border: `1.5px solid ${shapeId === s.id ? C : 'var(--border-2)'}`, background: shapeId === s.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: shapeId === s.id ? 700 : 500, color: shapeId === s.id ? C : 'var(--text-2)' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Units</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['ft', 'feet'], ['in', 'inches'], ['m', 'meters'], ['cm', 'cm']].map(([k, l]) => (
                <button key={k} onClick={() => setUnit(k)}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: `1.5px solid ${unit === k ? C : 'var(--border-2)'}`, background: unit === k ? C + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: unit === k ? 700 : 500, color: unit === k ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>

          {shape.fields.map(([k, l]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l} ({unit})</label>
              <input type="number" value={vals[k] || 0} onChange={e => setVals(v => ({ ...v, [k]: Math.max(0.01, +e.target.value) }))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
        </>}
        right={<>
          <BreakdownTable title="Volume results" rows={[
            { label: `Cubic ${unit}`, value: `${cubicUnits.toFixed(2)} ${unit}³`, bold: true, highlight: true, color: C },
            { label: 'Cubic feet', value: `${cubicFt.toFixed(2)} ft³` },
            { label: 'Gallons (US)', value: `${gallons.toFixed(2)} gal` },
            { label: 'Liters', value: `${liters.toFixed(2)} L` },
            { label: 'Cubic meters', value: `${(cubicFt / 35.315).toFixed(4)} m³` },
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
