import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, d = 2) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function AccordionItem({ q, a, isOpen, onToggle, catColor }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: catColor, flexShrink: 0, transition: 'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span>
      </button>
      {isOpen && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 14px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlossaryTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ padding: '9px 12px', borderRadius: 8, cursor: 'pointer', background: open ? catColor + '10' : 'var(--bg-raised)', border: `1px solid ${open ? catColor + '30' : 'var(--border)'}`, transition: 'all .15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: open ? catColor : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{term}</span>
        <span style={{ fontSize: 14, color: catColor, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '7px 0 0', fontFamily: "'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)
  useEffect(() => { if (!focused) setRaw(String(value)) }, [value, focused])
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input,var(--bg-card))', border: `1.5px solid ${focused ? catColor : 'var(--border)'}`, borderRadius: 8, padding: '0 10px', height: 38, boxShadow: focused ? `0 0 0 3px ${catColor}18` : 'none' }}>
        {prefix && <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={focused ? raw : value}
          onChange={e => { setRaw(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
          onFocus={() => { setFocused(true); setRaw(String(value)) }}
          onBlur={() => { setFocused(false); const v = parseFloat(raw); if (isNaN(v) || raw === '') { setRaw(String(min)); onChange(min) } else { const c = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v); setRaw(String(c)); onChange(c) } }}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, outline: 'none', minWidth: 0, fontFamily: "'DM Sans',sans-serif" }} />
        {suffix && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  )
}

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const EXAMPLES = [
  { title: 'Emergency Fund',   desc: 'What $20k saves will buy later',    amount: 20000, inflation: 3,   years: 10 },
  { title: 'Retirement Income',desc: 'Salary purchasing power at 65',     amount: 60000, inflation: 3.5, years: 25 },
  { title: 'High Inflation',   desc: 'Impact of elevated 6% inflation',   amount: 50000, inflation: 6,   years: 10 },
]
const FAQ = [
  { q: 'What is inflation?', a: 'Inflation is the rate at which the general price level of goods and services rises over time, eroding purchasing power. If inflation is 3%, something that costs $100 today will cost $103 next year. Central banks like the Federal Reserve target 2% annual inflation as ideal for economic stability.' },
  { q: 'How does inflation affect my savings?', a: 'If your savings account earns less than the inflation rate, you are effectively losing money in real terms. A savings account at 2% APY during 4% inflation means your purchasing power shrinks by about 2% per year. Your investments must beat inflation to grow your actual wealth.' },
  { q: 'What is real vs nominal return?', a: 'Nominal return is the stated percentage gain on an investment. Real return adjusts for inflation: Real Return ≈ Nominal Return − Inflation Rate. If your portfolio returns 8% and inflation is 3%, your real return is about 5%. Long-term financial planning should always use real returns.' },
  { q: 'What causes inflation?', a: 'Inflation can be caused by demand-pull (consumers buying more than supply allows), cost-push (rising production costs), built-in inflation (wage-price spiral), or monetary policy (too much money in circulation). Understanding the cause helps predict duration — supply shocks tend to be temporary, monetary inflation more persistent.' },
]
const GLOSSARY = [
  { term: 'Inflation Rate',     def: 'The annual percentage increase in the general price level of goods and services.' },
  { term: 'Purchasing Power',   def: 'The quantity of goods and services a unit of currency can buy. Eroded by inflation.' },
  { term: 'CPI',                def: 'Consumer Price Index — the most common measure of inflation, tracking a basket of consumer goods.' },
  { term: 'Real Return',        def: 'Investment return after subtracting inflation. The actual increase in purchasing power.' },
  { term: 'Nominal Return',     def: 'The stated investment return before adjusting for inflation.' },
  { term: 'Rule of 72',         def: 'Divide 72 by the inflation rate to find how many years until prices double. At 3%: 72/3 = 24 years.' },
]

export default function InflationCalculator({ meta, category }) {
  const [amount, setAmount] = useState(10000)
  const [inflation, setInflation] = useState(3)
  const [years, setYears] = useState(20)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const futurePrice = amount * Math.pow(1 + inflation / 100, years)
  const purchasingPower = amount / Math.pow(1 + inflation / 100, years)
  const loss = amount - purchasingPower
  const lossPct = amount > 0 ? (loss / amount * 100).toFixed(1) : 0
  const doublingYears = inflation > 0 ? (72 / inflation).toFixed(1) : '∞'

  const chartData = Array.from({ length: years + 1 }, (_, i) => ({
    year: `Y${i}`,
    power: Math.round(amount / Math.pow(1 + inflation / 100, i)),
    price: Math.round(amount * Math.pow(1 + inflation / 100, i)),
  }))

  function applyExample(ex) { setAmount(ex.amount); setInflation(ex.inflation); setYears(ex.years) }

  const hint = `At ${inflation}% inflation, ${fmt(amount, sym)} today has the purchasing power of only ${fmt(purchasingPower, sym)} in ${years} years — a ${lossPct}% loss. Prices double every ${doublingYears} years at this rate.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Inflation Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Current Amount" value={amount} onChange={setAmount} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Annual Inflation Rate" value={inflation} onChange={setInflation} suffix="%" min={0} max={30} catColor={catColor} />
          <FieldInput label="Time Period" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setAmount(10000); setInflation(3); setYears(20) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Purchasing Power in Future" value={Math.round(purchasingPower)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`What ${fmt(amount, sym)} buys in ${years} years`} color={'#ef4444'} />
          <BreakdownTable title="Inflation Impact" rows={[
            { label: 'Amount Today',         value: fmt(amount, sym) },
            { label: 'Future Cost of Same',  value: fmt(futurePrice, sym), color: '#ef4444' },
            { label: 'Purchasing Power',     value: fmt(purchasingPower, sym), color: '#ef4444' },
            { label: 'Real Value Lost',      value: fmt(loss, sym), color: '#ef4444' },
            { label: '% of Value Lost',      value: `${lossPct}%`, color: '#ef4444', bold: true, highlight: true },
            { label: 'Prices double in',     value: `${doublingYears} years` },
          ]} />
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Purchasing Power Over Time</div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide />
                <Tooltip formatter={v => [fmt(v, sym), 'Value']} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="power" stroke="#ef4444" fill="#ef444420" strokeWidth={2} name="Purchasing Power" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How inflation erodes purchasing power">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Future Price (what something costs)', formula: 'Future Price = Amount × (1 + inflation)^years' },
            { label: 'Future Purchasing Power',             formula: 'Purchasing Power = Amount ÷ (1 + inflation)^years' },
            { label: 'Doubling Time (Rule of 72)',          formula: 'Years to Double = 72 ÷ Inflation Rate' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Inflation works in two directions: it tells you what something will cost in the future, and what your current money will be worth. At 3% inflation over 25 years, your $100,000 has the purchasing power of only $47,760 — less than half. Your investments must outpace inflation just to maintain real wealth.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Amount', `${sym}${ex.amount.toLocaleString()}`], ['Inflation', `${ex.inflation}%`], ['Years', `${ex.years}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: catColor }}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Inflation Rate Comparison" subtitle="How different inflation rates affect your money over 20 years">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Rate', 'Purchasing Power', 'Value Lost', 'Prices Double'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[2, 3, 4, 6, 8].map((r, i) => {
                const pwr = amount / Math.pow(1 + r / 100, 20)
                const lost = amount - pwr
                const isYours = r === Math.round(inflation)
                return (
                  <tr key={r} style={{ background: isYours ? catColor + '08' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isYours ? 700 : 400, color: isYours ? catColor : 'var(--text)' }}>{r}% {isYours && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(pwr, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#ef4444', textAlign: 'right' }}>{fmt(lost, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{(72 / r).toFixed(0)} years</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about inflation">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
