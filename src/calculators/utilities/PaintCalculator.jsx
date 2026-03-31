import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How much paint do I need for a room?', a: 'A standard coat covers about 350 sq ft per gallon. Calculate wall area (perimeter × height), subtract windows (~15 sq ft each) and doors (~20 sq ft each), divide by 350. Buy 10% extra for touch-ups.' },
  { q: 'What paint finish should I use?', a: 'Flat/matte for ceilings and low-traffic walls. Eggshell for living rooms and bedrooms. Satin for kitchens and hallways. Semi-gloss for trim, doors, and bathrooms. Glossier = more washable but shows imperfections.' },
  { q: 'Do I need primer?', a: 'Primer is needed when painting bare drywall, going dark to light or light to dark, covering stains, or painting over gloss. It improves adhesion and can reduce coats needed.' },
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

function NumField({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
    </div>
  )
}

export default function PaintCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [l, setL] = useState(14), [w, setW] = useState(12), [h, setH] = useState(9)
  const [doors, setDoors] = useState(1), [windows, setWindows] = useState(2), [coats, setCoats] = useState(2)
  const [ppg, setPpg] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const wallArea = 2 * (l + w) * h
  const deductions = doors * 20 + windows * 15
  const paintable = Math.max(0, wallArea - deductions) * coats
  const gallons = paintable / 350
  const cost = ppg ? Math.ceil(gallons) * parseFloat(ppg) : null

  const hint = `Room ${l}×${w} ft, ${h}ft ceiling: ${Math.ceil(gallons)} gallons needed for ${coats} coat(s). Paintable area: ${paintable.toFixed(0)} sq ft.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Paint Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Gallons = Paintable Area ÷ 350</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{Math.ceil(gallons)} gal</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <NumField label="Length (ft)" value={l} onChange={setL} />
            <NumField label="Width (ft)" value={w} onChange={setW} />
            <NumField label="Height (ft)" value={h} onChange={setH} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <NumField label="Doors" value={doors} onChange={setDoors} />
            <NumField label="Windows" value={windows} onChange={setWindows} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Coats</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setCoats(n)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${coats === n ? C : 'var(--border-2)'}`, background: coats === n ? C + '12' : 'var(--bg-raised)', fontSize: 14, fontWeight: coats === n ? 700 : 500, color: coats === n ? C : 'var(--text-2)', cursor: 'pointer' }}>
                  {n} coat{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Price per gallon ($) — optional</label>
            <input type="number" value={ppg} onChange={e => setPpg(e.target.value)} placeholder="e.g. 45"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 15, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Paint estimate" rows={[
            { label: 'Wall area', value: `${wallArea} sq ft` },
            { label: 'Deductions (doors/windows)', value: `−${deductions} sq ft` },
            { label: `Paintable area (${coats} coat${coats > 1 ? 's' : ''})`, value: `${paintable.toFixed(0)} sq ft` },
            { label: 'Gallons (exact)', value: gallons.toFixed(2) },
            { label: 'Gallons to buy', value: Math.ceil(gallons), bold: true, highlight: true, color: C },
            ...(cost ? [{ label: 'Material cost', value: `$${cost.toFixed(2)}`, color: C }] : []),
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>FINISH GUIDE</div>
            {['Flat/matte → ceilings & low-traffic walls', 'Eggshell → living rooms & bedrooms', 'Satin → kitchens, kids rooms, hallways', 'Semi-gloss → trim, doors, bathrooms'].map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>· {t}</div>
            ))}
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
