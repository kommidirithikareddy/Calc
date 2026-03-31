import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const DEPTHS = [
  { in: 2, label: '2"', note: 'Minimum — light coverage' },
  { in: 3, label: '3"', note: 'Recommended — good weed suppression' },
  { in: 4, label: '4"', note: 'Heavy — maximum benefit' },
  { in: 6, label: '6"', note: 'Very deep — special situations only' },
]

const MULCH_TYPES = [
  { id: 'wood',  label: 'Wood chips', ppBag: 6.99,  cuFtBag: 2, icon: '🪵' },
  { id: 'bark',  label: 'Bark mulch', ppBag: 7.99,  cuFtBag: 2, icon: '🟫' },
  { id: 'cedar', label: 'Cedar',      ppBag: 9.99,  cuFtBag: 2, icon: '🌲' },
  { id: 'pine',  label: 'Pine straw', ppBag: 4.99,  cuFtBag: 3, icon: '🌿' },
]

const FAQ = [
  { q: 'How deep should mulch be?', a: 'The sweet spot is 2–4 inches deep. Less than 2 inches offers poor weed suppression. More than 4 inches can suffocate roots by blocking water and oxygen. Keep mulch 2–3 inches away from plant stems and tree trunks — "volcano mulching" against the trunk causes rot.' },
  { q: 'How much does a cubic yard of mulch cover?', a: 'One cubic yard (27 cubic feet) covers: 108 sq ft at 3 inches deep, 162 sq ft at 2 inches, or 81 sq ft at 4 inches deep. Bulk delivery is more economical than bags for jobs over 3–4 cubic yards.' },
  { q: 'How often should I replace mulch?', a: 'Most organic mulches decompose over 1–3 years and should be refreshed annually. Each spring, check existing depth and add only what is needed to bring it back to 2–4 inches. Old mulch often needs only a top-up, not full replacement.' },
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

export default function MulchCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [beds, setBeds] = useState([{ name: 'Front bed', l: 12, w: 4 }, { name: 'Side bed', l: 20, w: 3 }])
  const [depth, setDepth] = useState(3)
  const [mulchType, setMulchType] = useState('wood')
  const [openFaq, setOpenFaq] = useState(null)

  const mt = MULCH_TYPES.find(m => m.id === mulchType)
  const totalSqFt = beds.reduce((s, b) => s + b.l * b.w, 0)
  const cubicFt = totalSqFt * (depth / 12)
  const cubicYards = cubicFt / 27
  const bags = Math.ceil(cubicFt / mt.cuFtBag)
  const cost = bags * mt.ppBag

  const update = (i, f, v) => { const n = [...beds]; n[i] = { ...n[i], [f]: v }; setBeds(n) }
  const hint = `${totalSqFt} sq ft of beds at ${depth}" deep = ${cubicYards.toFixed(2)} cu yd. Need ${bags} bags of ${mt.label} (~$${cost.toFixed(0)}).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Mulch Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Cu ft = Area (sq ft) × Depth (ft)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>1 cubic yard = 27 cubic feet</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{bags} bags</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{cubicYards.toFixed(2)} cu yd</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Garden beds</label>
              <button onClick={() => setBeds([...beds, { name: `Bed ${beds.length + 1}`, l: 10, w: 3 }])}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add bed</button>
            </div>
            {beds.map((b, i) => (
              <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={b.name} onChange={e => update(i, 'name', e.target.value)}
                    style={{ flex: 1, height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }} />
                  {beds.length > 1 && <button onClick={() => setBeds(beds.filter((_, j) => j !== i))}
                    style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-3)' }}>×</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                  {[['Length (ft)', 'l'], ['Width (ft)', 'w']].map(([lbl, fld]) => (
                    <div key={fld}>
                      <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{lbl}</label>
                      <input type="number" value={b[fld]} onChange={e => update(i, fld, +e.target.value)}
                        style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 13, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ height: 36, padding: '0 8px', background: C + '10', borderRadius: 7, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: C }}>{(b.l * b.w).toFixed(0)} sf</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Depth</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {DEPTHS.map(d => (
                <button key={d.in} onClick={() => setDepth(d.in)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${depth === d.in ? C : 'var(--border-2)'}`, background: depth === d.in ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: depth === d.in ? C : 'var(--text)' }}>{d.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{d.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Mulch type</label>
            {MULCH_TYPES.map(m => (
              <button key={m.id} onClick={() => setMulchType(m.id)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 6, borderRadius: 9, border: `1.5px solid ${mulchType === m.id ? C : 'var(--border-2)'}`, background: mulchType === m.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                <span>{m.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: mulchType === m.id ? 700 : 500, color: mulchType === m.id ? C : 'var(--text)' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>${m.ppBag}/bag · {m.cuFtBag} cu ft/bag</div>
                </div>
              </button>
            ))}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Mulch estimate" rows={[
            { label: 'Total bed area', value: `${totalSqFt} sq ft` },
            { label: `Depth (${depth}")`, value: `${(depth / 12).toFixed(3)} ft` },
            { label: 'Volume (cu ft)', value: cubicFt.toFixed(1) },
            { label: 'Volume (cu yd)', value: cubicYards.toFixed(2) },
            { label: 'Bags needed', value: bags, bold: true, highlight: true, color: C },
            { label: 'Est. cost', value: `$${cost.toFixed(2)}`, color: C },
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>
              💡 Keep mulch 2–3 inches away from plant stems and tree trunks to prevent rot.
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
