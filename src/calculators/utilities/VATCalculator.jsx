import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const VAT_RATES = [
  { country: 'UK',        rate: 20,   note: 'Standard rate' },
  { country: 'Germany',   rate: 19,   note: 'Mehrwertsteuer (MwSt)' },
  { country: 'France',    rate: 20,   note: 'TVA standard' },
  { country: 'Australia', rate: 10,   note: 'GST rate' },
  { country: 'Canada',    rate: 5,    note: 'Federal GST (+ provincial)' },
  { country: 'India',     rate: 18,   note: 'Standard GST' },
  { country: 'Japan',     rate: 10,   note: 'Consumption tax' },
  { country: 'Singapore', rate: 9,    note: 'GST rate' },
  { country: 'South Africa', rate: 15, note: 'VAT rate' },
  { country: 'Brazil',    rate: 17,   note: 'ICMS average' },
]

const FAQ = [
  { q: 'What is the difference between VAT and sales tax?', a: 'VAT (Value Added Tax) is collected at every stage of production and distribution. Sales tax is only collected at the final point of sale. The end consumer pays approximately the same, but VAT provides a paper trail for each transaction. Most countries outside the US use VAT.' },
  { q: 'How do I remove VAT from a price?', a: 'To find the pre-VAT price from a VAT-inclusive price: Pre-VAT price = VAT-inclusive price ÷ (1 + VAT rate). Example: £120 ÷ 1.20 = £100 pre-VAT. The VAT amount = £120 − £100 = £20. This calculator does this automatically in "remove VAT" mode.' },
  { q: 'What does "VAT-inclusive" mean on a price tag?', a: 'VAT-inclusive (or "inc. VAT") means the displayed price already includes VAT — what you pay is what is shown. VAT-exclusive (or "ex. VAT", "+VAT") means VAT must be added on top. Business-to-business prices are often shown ex-VAT since businesses reclaim the VAT.' },
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

export default function VATCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [mode, setMode] = useState('add')
  const [price, setPrice] = useState(100)
  const [rate, setRate] = useState(20)
  const [openFaq, setOpenFaq] = useState(null)

  const preTax = mode === 'add' ? price : price / (1 + rate / 100)
  const vatAmt = preTax * rate / 100
  const total = preTax + vatAmt

  const hint = `${mode === 'add' ? 'Ex-VAT' : 'Inc-VAT'} price: ${price.toFixed(2)}, VAT (${rate}%): ${vatAmt.toFixed(2)}, ${mode === 'add' ? 'Inc-VAT' : 'Ex-VAT'}: ${mode === 'add' ? total.toFixed(2) : preTax.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>VAT Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {mode === 'add' ? 'Inc. VAT = Ex-VAT × (1 + VAT%)' : 'Ex-VAT = Inc. VAT ÷ (1 + VAT%)'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {mode === 'add' ? total.toFixed(2) : preTax.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{mode === 'add' ? 'inc. VAT' : 'ex. VAT'}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Mode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['add', 'Add VAT'], ['remove', 'Remove VAT']].map(([m, l]) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: mode === m ? 700 : 500, color: mode === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{mode === 'add' ? 'Price excluding VAT' : 'Price including VAT'}</label>
            <input type="number" value={price} onChange={e => setPrice(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>VAT rate: {rate}%</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[5, 10, 15, 18, 20, 25].map(r => (
                <button key={r} onClick={() => setRate(r)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${rate === r ? C : 'var(--border-2)'}`, background: rate === r ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: rate === r ? 700 : 500, color: rate === r ? C : 'var(--text-2)', cursor: 'pointer' }}>{r}%</button>
              ))}
            </div>
            <input type="range" min="0" max="30" step="1" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Country rates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {VAT_RATES.slice(0, 6).map(v => (
                <button key={v.country} onClick={() => setRate(v.rate)}
                  style={{ padding: '6px 10px', borderRadius: 7, border: `1px solid ${rate === v.rate ? C : 'var(--border)'}`, background: rate === v.rate ? C + '10' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{v.country}</div>
                  <div style={{ fontSize: 12, color: C, fontWeight: 700 }}>{v.rate}%</div>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <BreakdownTable title="VAT calculation" rows={[
            { label: 'Ex-VAT price', value: `${preTax.toFixed(2)}` },
            { label: `VAT (${rate}%)`, value: `${vatAmt.toFixed(2)}`, color: C },
            { label: 'Inc-VAT price', value: `${total.toFixed(2)}`, bold: true, highlight: true, color: C },
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>VAT RATES AROUND THE WORLD</div>
            {VAT_RATES.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text)' }}>{v.country}</span>
                <span style={{ fontWeight: 700, color: C }}>{v.rate}%</span>
              </div>
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
