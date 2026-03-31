import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const PATTERNS = [
  { id: 'straight',    label: 'Straight',    waste: 10, desc: 'Standard install, minimal cuts' },
  { id: 'diagonal',    label: 'Diagonal',    waste: 15, desc: 'Angled cuts at corners' },
  { id: 'herringbone', label: 'Herringbone', waste: 20, desc: 'Complex pattern, most waste' },
]

const FAQ = [
  { q: 'Why do I need extra flooring beyond measured area?', a: 'Flooring must be cut at walls, around obstacles, and to match patterns. Offcuts are wasted. Diagonal and herringbone patterns generate more waste because cuts are angled. You also need spare material for future repairs.' },
  { q: 'How do I measure a room for flooring?', a: 'Measure the longest length and widest width of each room. For L-shaped rooms, divide into rectangles, measure each, and add them together. Always measure at the widest points even if the room tapers. Include areas under appliances.' },
  { q: 'Should I buy flooring from one batch?', a: 'Yes — always buy all the flooring for one project from the same batch (dye lot). Different batches can have subtle colour variations that become obvious once installed. Note the batch number on all boxes before purchase.' },
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

export default function FlooringCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [rooms, setRooms] = useState([{ name: 'Living Room', l: 18, w: 14 }, { name: 'Bedroom', l: 12, w: 10 }])
  const [pattern, setPattern] = useState('straight')
  const [ppSqFt, setPpSqFt] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const pat = PATTERNS.find(p => p.id === pattern)
  const totalSqFt = rooms.reduce((s, r) => s + r.l * r.w, 0)
  const withWaste = totalSqFt * (1 + pat.waste / 100)
  const cost = ppSqFt ? Math.ceil(withWaste) * parseFloat(ppSqFt) : null

  const update = (i, f, v) => { const n = [...rooms]; n[i] = { ...n[i], [f]: v }; setRooms(n) }
  const hint = `Total area: ${totalSqFt.toFixed(0)} sq ft. With ${pat.waste}% waste (${pattern}): order ${Math.ceil(withWaste)} sq ft.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Flooring Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Order = Total Area × (1 + Waste%)</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{Math.ceil(withWaste)} sq ft</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Rooms</label>
              <button onClick={() => setRooms([...rooms, { name: `Room ${rooms.length + 1}`, l: 10, w: 10 }])}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            {rooms.map((r, i) => (
              <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '12px', marginBottom: 8, border: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={r.name} onChange={e => update(i, 'name', e.target.value)}
                    style={{ flex: 1, height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }} />
                  {rooms.length > 1 && <button onClick={() => setRooms(rooms.filter((_, j) => j !== i))}
                    style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-3)' }}>×</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                  {[['Length', 'l'], ['Width', 'w']].map(([lbl, fld]) => (
                    <div key={fld}>
                      <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{lbl} (ft)</label>
                      <input type="number" value={r[fld]} onChange={e => update(i, fld, +e.target.value)}
                        style={{ width: '100%', height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ height: 38, padding: '0 10px', background: C + '10', borderRadius: 7, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: C }}>
                    {(r.l * r.w).toFixed(0)} sf
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Install pattern</label>
            {PATTERNS.map(p => (
              <button key={p.id} onClick={() => setPattern(p.id)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 9, border: `1.5px solid ${pattern === p.id ? C : 'var(--border-2)'}`, background: pattern === p.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: pattern === p.id ? 700 : 500, color: pattern === p.id ? C : 'var(--text)' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.desc}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: pattern === p.id ? C : 'var(--text-2)' }}>+{p.waste}%</div>
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Price per sq ft ($) — optional</label>
            <input type="number" value={ppSqFt} onChange={e => setPpSqFt(e.target.value)} placeholder="e.g. 3.50"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 15, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Flooring estimate" rows={[
            { label: 'Net floor area',           value: `${totalSqFt.toFixed(1)} sq ft` },
            { label: `Waste (+${pat.waste}%)`,   value: `+${(totalSqFt * pat.waste / 100).toFixed(1)} sq ft` },
            { label: 'Total to order',           value: `${Math.ceil(withWaste)} sq ft`, bold: true, highlight: true, color: C },
            ...(cost ? [{ label: 'Material cost', value: `$${cost.toFixed(2)}`, color: C }] : []),
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              💡 Always buy all flooring from the same <strong>batch/dye lot</strong> — subtle colour differences between batches become very visible after installation.
            </p>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
