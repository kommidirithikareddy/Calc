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
  { title: 'Standard Retiree', desc: '30-year retirement, 4% SWR',    portfolio: 1000000, wr: 4,   returnRate: 7, inflation: 3 },
  { title: 'Early FIRE',       desc: '50-year retirement, conservative',portfolio: 1500000, wr: 3.5, returnRate: 7, inflation: 3 },
  { title: 'Aggressive Draw',  desc: 'High withdrawal, shorter horizon', portfolio: 800000,  wr: 5,   returnRate: 6, inflation: 3 },
]
const FAQ = [
  { q: 'What is the 4% rule?', a: 'The 4% rule comes from the 1994 Trinity Study and subsequent research. It found that a portfolio of 50-75% stocks historically survived 30-year retirements if annual withdrawals started at 4% of portfolio value and increased with inflation each year. It has a historical success rate of ~95% over 30-year periods.' },
  { q: 'Is the 4% rule still valid?', a: 'The 4% rule was based on historical US market data. Some researchers argue that today's lower expected returns and higher valuations make 3-3.5% more appropriate. Others argue it remains valid. Most financial planners use 4% as a starting point but recommend flexibility — spending less in bad markets extends portfolio life significantly.' },
  { q: 'What is the real return and why does it matter?', a: 'Real return = (1 + nominal return) / (1 + inflation) − 1. This is the growth rate that matters for sustainable withdrawals because it accounts for the fact that your withdrawals increase with inflation. A 7% nominal return with 3% inflation gives a real return of about 3.88% — this determines how long your money lasts.' },
  { q: 'What strategies extend portfolio longevity?', a: 'Flexible withdrawal strategies can dramatically extend portfolio life: spend less in bad market years (guardrails strategy), keep 1-2 years of cash to avoid selling in downturns, maintain a mix of assets (stocks + bonds + cash), consider part-time work for the first few years of retirement, and have a plan B (reduce spending if portfolio falls below a threshold).' },
]
const GLOSSARY = [
  { term: 'Safe Withdrawal Rate', def: 'The maximum annual withdrawal percentage that historically allows a portfolio to survive through retirement.' },
  { term: 'Sequence of Returns Risk', def: 'The danger that poor returns early in retirement permanently deplete your portfolio before markets recover.' },
  { term: 'Real Return',         def: '(1 + nominal return) / (1 + inflation) − 1. The growth rate above inflation — key for long-term planning.' },
  { term: 'Portfolio Duration',  def: 'How many years your portfolio lasts at a given withdrawal rate and return assumption.' },
  { term: 'Guardrails Strategy', def: 'Adjusting annual spending up or down based on portfolio performance to extend longevity.' },
  { term: 'Trinity Study',       def: 'The 1998 paper by Cooley, Hubbard and Walz establishing the empirical basis for the 4% withdrawal rule.' },
]
export default function SafeWithdrawal({ meta, category }) {
  const [portfolio, setPortfolio] = useState(1000000)
  const [wr, setWr] = useState(4)
  const [returnRate, setReturnRate] = useState(7)
  const [inflation, setInflation] = useState(3)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const annualWithdrawal = portfolio * wr / 100
  const monthly = annualWithdrawal / 12
  const realReturn = (1 + returnRate / 100) / (1 + inflation / 100) - 1

  let bal = portfolio, months = 0
  while (bal > 0 && months < 600) {
    bal = bal * (1 + realReturn / 12) - annualWithdrawal / 12
    months++
  }
  const portfolioLasts = months / 12
  const durColor = portfolioLasts > 40 ? '#10b981' : portfolioLasts > 25 ? catColor : '#ef4444'

  function applyExample(ex) { setPortfolio(ex.portfolio); setWr(ex.wr); setReturnRate(ex.returnRate); setInflation(ex.inflation) }
  const hint = `At ${wr}% SWR: ${fmt(annualWithdrawal, sym)}/year (${fmt(monthly, sym)}/month). With ${returnRate}% returns and ${inflation}% inflation, your ${fmt(portfolio, sym)} lasts ${portfolioLasts > 50 ? '50+ years (sustainable)' : portfolioLasts.toFixed(0) + ' years'}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Withdrawal Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Portfolio Value" value={portfolio} onChange={setPortfolio} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Withdrawal Rate" hint="4% = classic safe rate" value={wr} onChange={setWr} suffix="%" min={0.5} max={20} catColor={catColor} />
          <FieldInput label="Expected Annual Return" hint="Nominal (before inflation)" value={returnRate} onChange={setReturnRate} suffix="%" min={0} max={20} catColor={catColor} />
          <FieldInput label="Inflation Rate" value={inflation} onChange={setInflation} suffix="%" min={0} max={15} catColor={catColor} />
          <div style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Real return (after inflation)</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: catColor }}>{(realReturn * 100).toFixed(2)}%</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setPortfolio(1000000); setWr(4); setReturnRate(7); setInflation(3) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Portfolio Lasts" value={Math.min(50, Math.round(portfolioLasts))} formatter={n => portfolioLasts > 50 ? '50+ years' : n + ' years'} sub={`At ${fmt(annualWithdrawal, sym)}/yr (${fmt(monthly, sym)}/mo) withdrawal`} color={durColor} />
          <BreakdownTable title="Withdrawal Summary" rows={[
            { label: 'Portfolio',           value: fmt(portfolio, sym) },
            { label: 'Annual Withdrawal',   value: fmt(annualWithdrawal, sym), color: catColor },
            { label: 'Monthly Income',      value: fmt(monthly, sym), color: catColor },
            { label: 'Real Return',         value: `${(realReturn * 100).toFixed(2)}%` },
            { label: 'Portfolio Duration',  value: portfolioLasts > 50 ? 'Sustainable (50+ yrs)' : portfolioLasts.toFixed(0) + ' years', color: durColor, bold: true, highlight: true },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How portfolio longevity is calculated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Real Return Rate',    formula: 'Real Return = (1 + Nominal Rate) / (1 + Inflation) − 1' },
            { label: 'Monthly Balance',     formula: 'Balance = Previous Balance × (1 + real rate/12) − Monthly Withdrawal' },
            { label: 'Annual Withdrawal',   formula: 'Withdrawal = Portfolio × Withdrawal Rate' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>The simulation runs month by month: the portfolio earns its real return, then the monthly withdrawal is subtracted. When the balance hits zero, the simulation stops. The real return (nominal minus inflation) is used because withdrawals grow with inflation each year — this is the conservative, accurate approach.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Portfolio', `${sym}${ex.portfolio.toLocaleString()}`], ['SWR', `${ex.wr}%`], ['Return', `${ex.returnRate}%`]].map(([k, v]) => (
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

      <Section title="Portfolio Duration by Withdrawal Rate" subtitle="How different SWRs affect how long your money lasts">
        <div style={{ overflow: 'hidden', borderRadius: 10, border: '0.5px solid var(--border)' }}>
          {[3, 3.5, 4, 4.5, 5, 6].map((r, i) => {
            let b = portfolio, m = 0
            while (b > 0 && m < 600) { b = b * (1 + realReturn / 12) - portfolio * r / 100 / 12; m++ }
            const yrs = m / 12
            const isCurrent = r === wr
            return (
              <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: i < 5 ? '0.5px solid var(--border)' : 'none', background: isCurrent ? catColor + '08' : 'transparent' }}>
                <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{r}% SWR {isCurrent && '← You'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: yrs > 40 ? '#10b981' : yrs > 25 ? catColor : '#ef4444' }}>{yrs > 50 ? '50+ yrs (sustainable)' : yrs.toFixed(0) + ' years'}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about safe withdrawal rates">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
