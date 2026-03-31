import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

const FAQ = [
  { q: 'How do I split a bill when people ordered different amounts?', a: 'The fairest way is itemised splitting — each person pays for exactly what they ordered, then tip is split evenly or proportionally. If you cannot itemise, split by percentage based on rough estimates of each person\'s share.' },
  { q: 'Should tax be split equally or proportionally?', a: 'Tax should be split in the same proportion as the food — if you ordered more expensive items, you pay more tax. In practice, splitting tax equally works fine for bills where everyone ordered similarly priced items.' },
  { q: 'What is the easiest way to split a restaurant bill?', a: 'For groups of 2–4, use this calculator. For larger groups, ask the restaurant for separate checks — most can accommodate this before orders are placed. Alternatively, one person pays the full bill and others transfer their share via payment apps.' },
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

export default function SplitBill({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [mode, setMode]       = useState('total')
  const [bill, setBill]       = useState(120)
  const [tax, setTax]         = useState(8.5)
  const [tip, setTip]         = useState(18)
  const [people, setPeople]   = useState(3)
  const [items, setItems]     = useState([
    { name: 'Pasta', amount: 22 },
    { name: 'Steak', amount: 38 },
    { name: 'Salad', amount: 14 },
  ])
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt]   = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const itemsSubtotal = items.reduce((s, i) => s + (+i.amount || 0), 0)
  const base     = mode === 'itemized' ? itemsSubtotal : bill
  const taxAmt   = base * (tax / 100)
  const tipAmt   = base * (tip / 100)
  const total    = base + taxAmt + tipAmt
  const perPerson = people > 0 ? total / people : 0

  const addItem = () => {
    if (!newName) return
    setItems([...items, { name: newName, amount: +newAmt || 0 }])
    setNewName(''); setNewAmt('')
  }

  const hint = `Bill $${base.toFixed(2)} + tax ${tax}% ($${taxAmt.toFixed(2)}) + tip ${tip}% ($${tipAmt.toFixed(2)}) = $${total.toFixed(2)} total. Each of ${people} people pays $${perPerson.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Split Bill Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Per person = (Bill + Tax + Tip) ÷ People</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${perPerson.toFixed(2)}</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Bill entry mode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['total', 'itemized'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode === m ? 700 : 500, color: mode === m ? C : 'var(--text-2)', cursor: 'pointer', textTransform: 'capitalize' }}>
                  {m === 'total' ? 'Enter total' : 'Itemize'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'total' ? (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Subtotal ($)</label>
              <input type="number" value={bill} onChange={e => setBill(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Items</label>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input value={it.name} onChange={e => { const n = [...items]; n[i].name = e.target.value; setItems(n) }}
                    style={{ flex: 1, height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }} />
                  <input type="number" value={it.amount} onChange={e => { const n = [...items]; n[i].amount = +e.target.value; setItems(n) }}
                    style={{ width: 90, height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }} />
                  <button onClick={() => setItems(items.filter((_, j) => j !== i))}
                    style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-raised)', cursor: 'pointer', fontSize: 16, color: 'var(--text-3)' }}>×</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input placeholder="Item name" value={newName} onChange={e => setNewName(e.target.value)}
                  style={{ flex: 1, height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }} />
                <input type="number" placeholder="$0" value={newAmt} onChange={e => setNewAmt(e.target.value)}
                  style={{ width: 90, height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }} />
                <button onClick={addItem} style={{ padding: '0 14px', height: 38, borderRadius: 7, border: `1px solid ${C}`, background: C + '10', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)', textAlign: 'right' }}>Subtotal: <strong style={{ color: 'var(--text)' }}>${itemsSubtotal.toFixed(2)}</strong></div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Tax rate: {tax}%</label>
            <input type="range" min="0" max="20" step="0.5" value={tax} onChange={e => setTax(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Tip: {tip}%</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[0, 10, 15, 18, 20, 25].map(p => (
                <button key={p} onClick={() => setTip(p)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${tip === p ? C : 'var(--border-2)'}`, background: tip === p ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: tip === p ? 700 : 500, color: tip === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p}%</button>
              ))}
            </div>
            <input type="range" min="0" max="40" step="1" value={tip} onChange={e => setTip(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Number of people</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setPeople(clamp(people - 1, 1, 20))}
                style={{ width: 40, height: 40, borderRadius: 8, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', fontSize: 20, cursor: 'pointer', color: 'var(--text)' }}>−</button>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", minWidth: 30, textAlign: 'center' }}>{people}</span>
              <button onClick={() => setPeople(clamp(people + 1, 1, 20))}
                style={{ width: 40, height: 40, borderRadius: 8, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', fontSize: 20, cursor: 'pointer', color: 'var(--text)' }}>+</button>
            </div>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Each person pays</div>
            <div style={{ fontSize: 52, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>${perPerson.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>split {people} ways</div>
          </div>

          <BreakdownTable title="Bill breakdown" rows={[
            { label: 'Subtotal',    value: `$${base.toFixed(2)}` },
            { label: `Tax (${tax}%)`,  value: `$${taxAmt.toFixed(2)}` },
            { label: `Tip (${tip}%)`,  value: `$${tipAmt.toFixed(2)}`, color: C },
            { label: 'Total',       value: `$${total.toFixed(2)}`, bold: true, highlight: true, color: C },
            { label: `Per person (÷${people})`, value: `$${perPerson.toFixed(2)}`, bold: true },
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
