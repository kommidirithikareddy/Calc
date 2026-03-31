import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What should a professional invoice include?', a: 'A complete invoice should include: your business name and contact info, client name and address, unique invoice number, invoice date and due date, itemized list of services/products with quantities and prices, subtotal, any discounts or taxes, total amount due, and payment methods accepted.' },
  { q: 'What are standard payment terms?', a: 'Common payment terms: Net 30 (pay within 30 days), Net 60, Due on receipt (pay immediately). Many freelancers and small businesses use Net 14 or Net 30. Late payment penalties (typically 1.5–2% monthly) should be stated on the invoice to incentivize on-time payment.' },
  { q: 'Should I charge tax on my invoices?', a: 'It depends on your location and business type. In most countries, businesses registered for VAT/GST must charge it on qualifying sales. In the US, whether you collect sales tax depends on your state, your product/service type, and economic nexus. Consult a tax professional if unsure.' },
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

export default function InvoiceCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [items, setItems] = useState([
    { desc: 'Web design', qty: 1, rate: 1200 },
    { desc: 'SEO setup', qty: 1, rate: 400 },
    { desc: 'Hosting (months)', qty: 3, rate: 25 },
  ])
  const [discount, setDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [newDesc, setNewDesc] = useState(''), [newQty, setNewQty] = useState(1), [newRate, setNewRate] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const update = (i, f, v) => { const n = [...items]; n[i] = { ...n[i], [f]: v }; setItems(n) }
  const subtotal = items.reduce((s, it) => s + (+it.qty || 0) * (+it.rate || 0), 0)
  const discountAmt = subtotal * (discount / 100)
  const taxable = subtotal - discountAmt
  const taxAmt = taxable * (taxRate / 100)
  const total = taxable + taxAmt

  const hint = `Invoice subtotal: $${subtotal.toFixed(2)}, discount: $${discountAmt.toFixed(2)}, tax: $${taxAmt.toFixed(2)}, total: $${total.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Invoice Total</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Total = (Subtotal − Discount) + Tax</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${total.toFixed(2)}</div>
      </div>

      <Sec title="Line items">
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 80px 30px', gap: 0, background: 'var(--bg-raised)', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>
            <span>Description</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span><span />
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 80px 30px', gap: 0, padding: '8px 12px', borderTop: '0.5px solid var(--border)', alignItems: 'center' }}>
              <input value={it.desc} onChange={e => update(i, 'desc', e.target.value)}
                style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
              <input type="number" value={it.qty} onChange={e => update(i, 'qty', +e.target.value)}
                style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 6px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', textAlign: 'center', boxSizing: 'border-box' }} />
              <input type="number" value={it.rate} onChange={e => update(i, 'rate', +e.target.value)}
                style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', textAlign: 'right', boxSizing: 'border-box' }} />
              <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${((+it.qty || 0) * (+it.rate || 0)).toFixed(2)}</div>
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--bg-raised)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13 }}>×</button>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 80px 30px', gap: 0, padding: '8px 12px', borderTop: '0.5px solid var(--border)', alignItems: 'center' }}>
            <input placeholder="New item description" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
            <input type="number" placeholder="1" value={newQty} onChange={e => setNewQty(+e.target.value)}
              style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 6px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', textAlign: 'center', boxSizing: 'border-box' }} />
            <input type="number" placeholder="0.00" value={newRate} onChange={e => setNewRate(+e.target.value)}
              style={{ border: '1px solid var(--border-2)', borderRadius: 6, padding: '4px 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', textAlign: 'right', boxSizing: 'border-box' }} />
            <button onClick={() => { if (!newDesc) return; setItems([...items, { desc: newDesc, qty: newQty, rate: newRate }]); setNewDesc(''); setNewQty(1); setNewRate(0) }}
              style={{ gridColumn: '4 / 6', padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: C + '10', color: C, fontSize: 11, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>+ Add</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[['Discount (%)', discount, setDiscount], ['Tax rate (%)', taxRate, setTaxRate]].map(([l, v, set]) => (
            <div key={l}>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
              <input type="number" step="0.5" value={v} onChange={e => set(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        <BreakdownTable title="Invoice summary" rows={[
          { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
          ...(discount > 0 ? [{ label: `Discount (${discount}%)`, value: `−$${discountAmt.toFixed(2)}` }] : []),
          ...(taxRate > 0 ? [{ label: `Tax (${taxRate}%)`, value: `$${taxAmt.toFixed(2)}` }] : []),
          { label: 'TOTAL DUE', value: `$${total.toFixed(2)}`, bold: true, highlight: true, color: C },
        ]} />
        <AIHintCard hint={hint} />
      </Sec>
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
