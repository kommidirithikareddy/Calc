import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const ROOM_TYPES = [
  { name: 'Master Bedroom', l: 14, w: 12 },
  { name: 'Living Room', l: 18, w: 15 },
  { name: 'Kitchen', l: 12, w: 10 },
  { name: 'Bathroom', l: 8, w: 6 },
  { name: 'Garage', l: 20, w: 20 },
]

const FAQ = [
  { q: 'How do I measure square footage of a house?', a: 'Measure each room individually (length × width), add them all up, and include all habitable areas: living rooms, bedrooms, kitchen, bathrooms, hallways. In the US, garages, unfinished basements, and exterior areas are typically excluded from the official square footage.' },
  { q: 'Why does square footage matter?', a: 'Square footage affects property value, property taxes, and utility costs. When buying or renting, cost per square foot lets you compare different properties fairly. A $400,000 home at 2,000 sq ft is $200/sq ft, while a $300,000 home at 1,200 sq ft is $250/sq ft — despite the lower price.' },
  { q: 'What is a good square footage per person?', a: 'The average US home is about 2,400 sq ft. Minimalists often aim for 100–400 sq ft per person. European apartments average 450–900 sq ft total. The "right" size depends entirely on lifestyle, family size, and priorities.' },
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

export default function SquareFootage({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [rooms, setRooms] = useState([{ name: 'Living Room', l: 18, w: 15 }, { name: 'Master Bedroom', l: 14, w: 12 }, { name: 'Kitchen', l: 12, w: 10 }])
  const [ppSqFt, setPpSqFt] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const update = (i, f, v) => { const n = [...rooms]; n[i] = { ...n[i], [f]: v }; setRooms(n) }
  const roomAreas = rooms.map(r => ({ ...r, area: r.l * r.w }))
  const totalSqFt = roomAreas.reduce((s, r) => s + r.area, 0)
  const sqM = totalSqFt * 0.0929
  const costEst = ppSqFt ? totalSqFt * parseFloat(ppSqFt) : null
  const maxArea = Math.max(...roomAreas.map(r => r.area))

  const hint = `Total: ${totalSqFt} sq ft (${sqM.toFixed(1)} m²) across ${rooms.length} room(s).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Square Footage</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Total = Sum of all room areas</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{totalSqFt} ft²</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Rooms</label>
            <button onClick={() => setRooms([...rooms, { name: `Room ${rooms.length + 1}`, l: 10, w: 10 }])}
              style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add room</button>
          </div>
          {rooms.map((r, i) => (
            <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input value={r.name} onChange={e => update(i, 'name', e.target.value)}
                  style={{ flex: 1, height: 32, border: '1px solid var(--border-2)', borderRadius: 6, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }} />
                {rooms.length > 1 && <button onClick={() => setRooms(rooms.filter((_, j) => j !== i))}
                  style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13 }}>×</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                {[['L (ft)', 'l'], ['W (ft)', 'w']].map(([l, f]) => (
                  <div key={f}>
                    <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input type="number" value={r[f]} onChange={e => update(i, f, +e.target.value)}
                      style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 13, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ height: 36, padding: '0 8px', background: C + '10', borderRadius: 7, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: C, whiteSpace: 'nowrap' }}>{r.l * r.w} ft²</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>QUICK ADD</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROOM_TYPES.map((r, i) => (
                <button key={i} onClick={() => setRooms([...rooms, { name: r.name, l: r.l, w: r.w }])}
                  style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>{r.name}</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Value per sq ft ($) — optional</label>
            <input type="number" value={ppSqFt} onChange={e => setPpSqFt(e.target.value)} placeholder="e.g. 200"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 15, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Room breakdown</div>
            {roomAreas.map((r, i) => (
              <div key={i} style={{ padding: '8px 14px', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{r.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C }}>{r.area} ft²</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${maxArea > 0 ? (r.area / maxArea * 100).toFixed(0) : 0}%`, background: C, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <BreakdownTable title="Totals" rows={[
            { label: 'Total sq ft', value: `${totalSqFt} ft²`, bold: true, highlight: true, color: C },
            { label: 'Square meters', value: `${sqM.toFixed(1)} m²` },
            { label: 'Square yards', value: `${(totalSqFt / 9).toFixed(1)} yd²` },
            ...(costEst ? [{ label: 'Estimated value', value: `$${costEst.toLocaleString()}`, color: C }] : []),
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
