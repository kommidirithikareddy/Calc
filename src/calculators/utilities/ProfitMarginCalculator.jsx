import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const BENCHMARKS = [
  { industry: 'Software (SaaS)', gross: '70–80%', net: '15–30%' },
  { industry: 'Retail (general)', gross: '25–50%', net: '2–6%' },
  { industry: 'Restaurants', gross: '60–70%', net: '3–9%' },
  { industry: 'Manufacturing', gross: '25–40%', net: '5–12%' },
  { industry: 'Consulting', gross: '60–70%', net: '15–25%' },
  { industry: 'Grocery', gross: '20–30%', net: '1–3%' },
]

const FAQ = [
  { q: 'What is the difference between gross profit and net profit margin?', a: 'Gross profit margin = (Revenue − COGS) ÷ Revenue. It shows how efficiently you produce your product. Net profit margin = Net income ÷ Revenue. It shows what percentage of revenue becomes actual profit after ALL expenses — COGS, operating costs, interest, and taxes.' },
  { q: 'What is a good profit margin?', a: 'It depends entirely on the industry. Software companies routinely achieve 15–30% net margins. Grocery stores operate on 1–3%. A restaurant making 5% net margin is doing well. Compare against industry benchmarks, not absolute numbers.' },
  { q: 'What is the difference between markup and margin?', a: 'Markup is calculated from cost: if you buy for $60 and sell for $100, markup = ($100−$60)/$60 = 66.7%. Margin is calculated from revenue: ($100−$60)/$100 = 40%. A 40% margin equals a 66.7% markup. Confusing these is a very common (and costly) mistake.' },
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

export default function ProfitMarginCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [revenue, setRevenue] = useState(100000)
  const [cogs, setCogs] = useState(40000)
  const [opex, setOpex] = useState(25000)
  const [taxes, setTaxes] = useState(5000)
  const [openFaq, setOpenFaq] = useState(null)

  const grossProfit = revenue - cogs
  const grossMargin = revenue > 0 ? grossProfit / revenue * 100 : 0
  const operatingProfit = grossProfit - opex
  const operatingMargin = revenue > 0 ? operatingProfit / revenue * 100 : 0
  const netProfit = operatingProfit - taxes
  const netMargin = revenue > 0 ? netProfit / revenue * 100 : 0

  const marginColor = netMargin >= 20 ? '#10b981' : netMargin >= 10 ? '#3b82f6' : netMargin >= 5 ? '#f59e0b' : '#ef4444'
  const hint = `Revenue $${revenue.toLocaleString()}: Gross margin ${grossMargin.toFixed(1)}%, Operating margin ${operatingMargin.toFixed(1)}%, Net margin ${netMargin.toFixed(1)}%.`

  const bars = [
    { label: 'Revenue', val: revenue, pct: 100, color: '#6366f1' },
    { label: 'Gross Profit', val: grossProfit, pct: Math.max(0, grossMargin), color: '#3b82f6' },
    { label: 'Operating Profit', val: operatingProfit, pct: Math.max(0, operatingMargin), color: '#10b981' },
    { label: 'Net Profit', val: netProfit, pct: Math.max(0, netMargin), color: marginColor },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Profit Margin</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Net Margin = Net Profit ÷ Revenue × 100</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: marginColor, fontFamily: "'Space Grotesk',sans-serif" }}>{netMargin.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>net margin</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Revenue ($)', revenue, setRevenue], ['Cost of Goods Sold ($)', cogs, setCogs], ['Operating Expenses ($)', opex, setOpex], ['Taxes ($)', taxes, setTaxes]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Waterfall chart</div>
            <div style={{ padding: '12px 14px' }}>
              {bars.map((b, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{b.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>${Math.max(0, b.val).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(b.pct, 100)}%`, background: b.color, borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{b.pct.toFixed(1)}% of revenue</div>
                </div>
              ))}
            </div>
          </div>
          <BreakdownTable title="Profit summary" rows={[
            { label: 'Revenue', value: `$${revenue.toLocaleString()}` },
            { label: 'Gross profit', value: `$${grossProfit.toLocaleString()}` },
            { label: 'Gross margin', value: `${grossMargin.toFixed(1)}%` },
            { label: 'Operating margin', value: `${operatingMargin.toFixed(1)}%` },
            { label: 'Net profit', value: `$${netProfit.toLocaleString()}`, bold: true, highlight: true, color: marginColor },
            { label: 'Net margin', value: `${netMargin.toFixed(1)}%`, color: marginColor },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Industry benchmarks" sub="Net margin by sector">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BENCHMARKS.map((b, i) => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{b.industry}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Gross: {b.gross}</div>
              <div style={{ fontSize: 11, color: C, fontWeight: 600 }}>Net: {b.net}</div>
            </div>
          ))}
        </div>
      </Sec>
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
