import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is break-even analysis used for?', a: 'Break-even analysis tells you the exact sales volume where your business stops losing money and starts making profit. It is used to price products, evaluate new product launches, justify business decisions, and set sales targets.' },
  { q: 'What are fixed vs variable costs?', a: 'Fixed costs stay the same regardless of how much you sell: rent, salaries, insurance, loan payments. Variable costs change with sales volume: raw materials, packaging, shipping, sales commissions. Understanding this split is critical for pricing.' },
  { q: 'How do I use break-even to set a sales target?', a: 'Calculate your break-even units. Then set a profit target (e.g. $50,000). Target units = (Fixed costs + Profit target) ÷ Contribution margin per unit. This tells you exactly how many units to sell for your desired profit.' },
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

export default function BreakEvenCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [fixedCosts, setFixedCosts] = useState(50000)
  const [pricePerUnit, setPricePerUnit] = useState(100)
  const [variablePerUnit, setVariablePerUnit] = useState(40)
  const [targetProfit, setTargetProfit] = useState(20000)
  const [openFaq, setOpenFaq] = useState(null)

  const contributionMargin = pricePerUnit - variablePerUnit
  const cmRatio = pricePerUnit > 0 ? contributionMargin / pricePerUnit : 0
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0
  const breakEvenRevenue = breakEvenUnits * pricePerUnit
  const targetUnits = contributionMargin > 0 ? Math.ceil((fixedCosts + targetProfit) / contributionMargin) : 0
  const targetRevenue = targetUnits * pricePerUnit

  const scenarios = [100, 200, 300, 500].map(units => ({
    units,
    revenue: units * pricePerUnit,
    totalCost: fixedCosts + units * variablePerUnit,
    profit: units * pricePerUnit - fixedCosts - units * variablePerUnit,
  }))

  const hint = `Break-even: ${breakEvenUnits} units / $${breakEvenRevenue.toLocaleString()} revenue. Contribution margin: $${contributionMargin}/unit (${(cmRatio * 100).toFixed(1)}%).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Break-Even Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Units = Fixed Costs ÷ (Price − Variable Cost)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{breakEvenUnits.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>break-even units</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Fixed costs ($)', fixedCosts, setFixedCosts], ['Price per unit ($)', pricePerUnit, setPricePerUnit], ['Variable cost per unit ($)', variablePerUnit, setVariablePerUnit], ['Profit target ($)', targetProfit, setTargetProfit]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
        </>}
        right={<>
          <BreakdownTable title="Break-even analysis" rows={[
            { label: 'Contribution margin/unit', value: `$${contributionMargin.toFixed(2)}` },
            { label: 'CM ratio', value: `${(cmRatio * 100).toFixed(1)}%` },
            { label: 'Break-even units', value: breakEvenUnits.toLocaleString(), bold: true, highlight: true, color: C },
            { label: 'Break-even revenue', value: `$${breakEvenRevenue.toLocaleString()}`, color: C },
            { label: `Units for $${targetProfit.toLocaleString()} profit`, value: targetUnits.toLocaleString() },
            { label: 'Revenue for profit target', value: `$${targetRevenue.toLocaleString()}` },
          ]} />

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginTop: 14 }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Profit scenarios</div>
            {scenarios.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '0.5px solid var(--border)', background: s.units >= breakEvenUnits ? '#d1fae510' : '#fee2e210' }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{s.units} units</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.profit >= 0 ? '#10b981' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>
                  {s.profit >= 0 ? '+' : ''}${s.profit.toLocaleString()}
                </span>
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
