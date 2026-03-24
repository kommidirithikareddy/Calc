import { useState, useEffect } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'
const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, d = 2) => (Math.round(n * Math.pow(10,d)) / Math.pow(10,d)).toFixed(d)

function Section({ title, subtitle, children }) {
  return (<div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}><div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)' }}><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</div>{subtitle && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>}</div><div style={{ padding: '16px 18px' }}>{children}</div></div>)
}
function AccordionItem({ q, a, isOpen, onToggle, catColor }) {
  return (<div style={{ borderBottom: '0.5px solid var(--border)' }}><button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span><span style={{ fontSize: 18, color: catColor, flexShrink: 0, transition: 'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span></button>{isOpen && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 14px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}</div>)
}
function GlossaryTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (<div onClick={() => setOpen(o => !o)} style={{ padding: '9px 12px', borderRadius: 8, cursor: 'pointer', background: open ? catColor + '10' : 'var(--bg-raised)', border: `1px solid ${open ? catColor + '30' : 'var(--border)'}`, transition: 'all .15s' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: open ? catColor : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{term}</span><span style={{ fontSize: 14, color: catColor, flexShrink: 0 }}>{open ? '−' : '+'}</span></div>{open && <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '7px 0 0', fontFamily: "'DM Sans',sans-serif" }}>{def}</p>}</div>)
}
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value)); const [focused, setFocused] = useState(false)
  useEffect(() => { if (!focused) setRaw(String(value)) }, [value, focused])
  return (<div style={{ marginBottom: 14 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>{hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input,var(--bg-card))', border: `1.5px solid ${focused ? catColor : 'var(--border)'}`, borderRadius: 8, padding: '0 10px', height: 38, boxShadow: focused ? `0 0 0 3px ${catColor}18` : 'none' }}>{prefix && <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}<input type="text" inputMode="decimal" value={focused ? raw : value} onChange={e => { setRaw(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }} onFocus={() => { setFocused(true); setRaw(String(value)) }} onBlur={() => { setFocused(false); const v = parseFloat(raw); if (isNaN(v) || raw === '') { setRaw(String(min)); onChange(min) } else { const c = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v); setRaw(String(c)); onChange(c) } }} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, outline: 'none', minWidth: 0, fontFamily: "'DM Sans',sans-serif" }} />{suffix && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>{suffix}</span>}</div></div>)
}


const EXAMPLES = [
  { title: 'Lean FIRE',    desc: 'Frugal lifestyle, low expenses',      expenses: 30000, wr: 4,   portfolio: 150000 },
  { title: 'Regular FIRE', desc: 'Comfortable middle-class retirement', expenses: 60000, wr: 4,   portfolio: 300000 },
  { title: 'Fat FIRE',     desc: 'Luxurious early retirement',          expenses: 120000, wr: 3.5, portfolio: 500000 },
]
const FAQ = [
  { q: 'What is the FIRE number?', a: 'Your FIRE number is the total portfolio value at which you can retire. It comes from the 4% rule: if you can safely withdraw 4% of your portfolio annually without depleting it, you need 25x your annual expenses. FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate. At $50,000/year expenses and a 4% SWR, your FIRE number is $1,250,000.' },
  { q: 'Why 25x expenses?', a: 'The 25x rule comes directly from the 4% safe withdrawal rate — 1 ÷ 0.04 = 25. The 4% rule emerged from the Trinity Study, which found that a portfolio of 50-75% stocks historically survived 30-year retirements with a 4% annual withdrawal adjusted for inflation. So your portfolio needs to be large enough that 4% of it covers all expenses.' },
  { q: 'Should I use 4% or a more conservative rate?', a: 'The 4% rule was designed for 30-year retirements. Early retirees may have 40-60 year retirements, which requires more conservative rates. Many FIRE advocates use 3-3.5% (FIRE number = 29-33x expenses) for early retirement. More conservative = larger FIRE number needed but safer long-term.' },
  { q: 'Does the FIRE number account for inflation?', a: 'Yes, indirectly. The 4% withdrawal in year 1 is then inflation-adjusted each year — so you withdraw 4% in year 1, then increase that amount by inflation each subsequent year. The Trinity Study’s findings already baked this in. Your target should be based on current annual expenses, not future inflated amounts.' },
]
const GLOSSARY = [
  { term: 'FIRE Number',       def: 'The portfolio size at which you can retire. Typically 25x annual expenses (based on the 4% rule).' },
  { term: 'Safe Withdrawal Rate', def: 'The percentage of portfolio you can withdraw annually. 4% is standard for 30-yr retirements.' },
  { term: 'Trinity Study',     def: '1998 research paper that established the 4% rule by analyzing historical stock and bond returns.' },
  { term: '25x Rule',          def: 'Shorthand for the 4% SWR — you need 25 times your annual expenses to retire.' },
  { term: 'Lean FIRE',         def: 'FIRE with minimal expenses, typically under $40k/year. Requires the smallest FIRE number.' },
  { term: 'Fat FIRE',          def: 'FIRE with high expenses ($100k+/year). Requires a very large portfolio — $2.5M+ at 4% SWR.' },
]
export default function FIRENumber({ meta, category }) {
  const [expenses, setExpenses] = useState(60000)
  const [wr, setWr] = useState(4)
  const [portfolio, setPortfolio] = useState(300000)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const fireNumber = expenses / (wr / 100)
  const gap = Math.max(0, fireNumber - portfolio)
  const pct = portfolio > 0 ? Math.min(100, portfolio / fireNumber * 100) : 0
  const fireType = expenses < 40000 ? 'Lean FIRE' : expenses < 80000 ? 'Regular FIRE' : 'Fat FIRE'

  function applyExample(ex) { setExpenses(ex.expenses); setWr(ex.wr); setPortfolio(ex.portfolio) }
  const hint = `Your FIRE number at ${wr}% SWR is ${fmt(fireNumber, sym)} (${expenses.toLocaleString()} × ${(100/wr).toFixed(0)}). You are ${pct.toFixed(1)}% there. Still needed: ${fmt(gap, sym)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>FIRE Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Expenses" hint="In today's dollars" value={expenses} onChange={setExpenses} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Safe Withdrawal Rate" hint="4% is standard; 3-3.5% for early retirement" value={wr} onChange={setWr} suffix="%" min={1} max={10} catColor={catColor} />
          <FieldInput label="Current Portfolio" hint="Total investments today" value={portfolio} onChange={setPortfolio} prefix={sym} min={0} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setExpenses(60000); setWr(4); setPortfolio(300000) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Your FIRE Number" value={Math.round(fireNumber)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`${fireType} · ${fmt(expenses, sym)}/yr ÷ ${wr}% SWR`} color={catColor} />
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Progress to FIRE</span><span style={{ fontSize: 12, fontWeight: 700, color: catColor }}>{pct.toFixed(1)}%</span></div>
            <div style={{ height: 10, background: 'var(--bg-raised)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}><div style={{ height: '100%', width: `${pct}%`, background: catColor, borderRadius: 5, transition: 'width .4s' }} /></div>
          </div>
          <BreakdownTable title="FIRE Summary" rows={[
            { label: 'Annual Expenses',   value: fmt(expenses, sym) },
            { label: 'Multiplier',        value: `${(100/wr).toFixed(1)}x` },
            { label: 'FIRE Number',       value: fmt(fireNumber, sym), color: catColor, bold: true },
            { label: 'Current Portfolio', value: fmt(portfolio, sym), color: '#10b981' },
            { label: 'Gap Remaining',     value: fmt(gap, sym), color: gap > 0 ? '#ef4444' : '#10b981', highlight: true },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How your FIRE number is derived from the 4% rule">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'FIRE Number (standard)',    formula: 'FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate' },
            { label: 'Simplified (4% rule)',      formula: 'FIRE Number = Annual Expenses × 25' },
            { label: 'Progress to FIRE',          formula: 'Progress (%) = Current Portfolio ÷ FIRE Number × 100' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>The 4% rule means: if you withdraw 4% of your portfolio in year 1, then adjust for inflation each year, your portfolio has historically survived 30+ years of retirement in most market scenarios. This means you need a portfolio 25 times your annual expenses. Use 3-3.5% (28-33x) for longer early retirements.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Expenses', `${sym}${ex.expenses.toLocaleString()}/yr`], ['SWR', `${ex.wr}%`], ['FIRE #', `${sym}${Math.round(ex.expenses/(ex.wr/100)).toLocaleString()}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span><span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span></div>
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

      <Section title="FIRE Number at Different Withdrawal Rates" subtitle="How your target changes with different SWRs">
        <div style={{ overflow: 'hidden', borderRadius: 10, border: '0.5px solid var(--border)' }}>
          {[3, 3.5, 4, 4.5, 5].map((r, i) => {
            const fn = expenses / (r / 100)
            const isCurrent = r === wr
            return (
              <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: i < 4 ? '0.5px solid var(--border)' : 'none', background: isCurrent ? catColor + '08' : 'transparent' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{r}% SWR {isCurrent && '← You'}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 8 }}>({(100/r).toFixed(1)}x multiplier)</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? catColor : 'var(--text)' }}>{fmt(fn, sym)}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about your FIRE number">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
