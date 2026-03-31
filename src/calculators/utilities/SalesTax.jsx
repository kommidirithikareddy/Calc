import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const US_STATES = [
  { name: 'California', rate: 7.25 }, { name: 'Texas', rate: 6.25 }, { name: 'Florida', rate: 6.0 },
  { name: 'New York', rate: 4.0 }, { name: 'Washington', rate: 6.5 }, { name: 'Illinois', rate: 6.25 },
  { name: 'Pennsylvania', rate: 6.0 }, { name: 'Ohio', rate: 5.75 }, { name: 'Georgia', rate: 4.0 },
  { name: 'North Carolina', rate: 4.75 }, { name: 'Oregon', rate: 0 }, { name: 'Montana', rate: 0 },
  { name: 'New Hampshire', rate: 0 }, { name: 'Delaware', rate: 0 }, { name: 'Alaska', rate: 0 },
]

const FAQ = [
  { q: 'Which US states have no sales tax?', a: 'Five states have no statewide sales tax: Oregon, Montana, New Hampshire, Delaware, and Alaska. However, Alaska allows local municipalities to levy their own sales taxes, so some areas in Alaska do have a local tax.' },
  { q: 'Is sales tax charged on services?', a: 'It depends on the state. Most states tax tangible personal property (physical goods) but may or may not tax services. Some services like haircuts, legal fees, and repairs are taxed in certain states. Always check your specific state rules.' },
  { q: 'What is the difference between sales tax and VAT?', a: 'Sales tax is only collected at the final point of sale to the consumer. VAT (Value Added Tax) is collected at every stage of the supply chain. Most countries outside the US use VAT. The end consumer pays approximately the same total under both systems for most purchases.' },
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

export default function SalesTax({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [mode, setMode]       = useState('add')
  const [price, setPrice]     = useState(100)
  const [rate, setRate]       = useState(8.5)
  const [state, setState]     = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const preTax  = mode === 'add' ? price : price / (1 + rate / 100)
  const taxAmt  = preTax * (rate / 100)
  const total   = preTax + taxAmt

  const handleState = e => {
    const s = US_STATES.find(x => x.name === e.target.value)
    setState(e.target.value)
    if (s) setRate(s.rate)
  }

  const hint = `${mode === 'add' ? 'Pre-tax' : 'Total'} $${price.toFixed(2)}, ${rate}% tax = $${taxAmt.toFixed(2)} tax, total $${total.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Sales Tax</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Tax = Pre-tax price × Tax rate</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${total.toFixed(2)}</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Mode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['add', 'Add tax to price'], ['remove', 'Remove tax from price']].map(([m, l]) => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 6px', borderRadius: 8, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode === m ? 700 : 500, color: mode === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{mode === 'add' ? 'Pre-tax price ($)' : 'Total price incl. tax ($)'}</label>
            <input type="number" value={price} onChange={e => setPrice(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Tax rate: {rate}%</label>
            <input type="range" min="0" max="20" step="0.25" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Quick — US state rates</label>
            <select value={state} onChange={handleState}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}>
              <option value="">Select state…</option>
              {US_STATES.map(s => <option key={s.name} value={s.name}>{s.name} ({s.rate}%)</option>)}
            </select>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Tax breakdown" rows={[
            { label: 'Pre-tax price', value: `$${preTax.toFixed(2)}` },
            { label: `Tax (${rate}%)`,   value: `$${taxAmt.toFixed(2)}`, color: C },
            { label: 'Total',         value: `$${total.toFixed(2)}`, bold: true, highlight: true, color: C },
          ]} />
          {rate === 0 && <div style={{ marginTop: 12, padding: '10px 13px', background: '#d1fae5', borderRadius: 9, fontSize: 12, color: '#065f46' }}>✓ No sales tax! This state has 0% sales tax.</div>}
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="US state sales tax rates" sub="Statewide base rates (local rates may vary)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {US_STATES.map(s => (
            <button key={s.name} onClick={() => { setRate(s.rate); setState(s.name) }}
              style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${state === s.name ? C : 'var(--border)'}`, background: state === s.name ? C + '12' : 'var(--bg-raised)', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: state === s.name ? C : 'var(--text)' }}>{s.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.rate === 0 ? '#10b981' : C, fontFamily: "'Space Grotesk',sans-serif" }}>{s.rate}%</div>
            </button>
          ))}
        </div>
      </Sec>
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
