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
  { title: 'Entry Level',   desc: 'New grad, low state tax state',  salary: 45000, stateTax: 3,  k401: 6  },
  { title: 'Professional',  desc: 'Mid-career, California resident', salary: 95000, stateTax: 9,  k401: 10 },
  { title: 'High Earner',   desc: 'Senior role, NYC resident',       salary: 180000,stateTax: 10, k401: 15 },
]
const FAQ = [
  { q: 'Why is my take-home so much less than my salary?', a: 'Federal income tax alone takes 10-37% depending on your bracket. Add 7.65% for FICA (Social Security + Medicare), your state income tax (0-13%), and any pre-tax deductions (401k, health insurance), and it's normal to take home only 60-75% of your gross salary. Understanding this helps you budget realistically.' },
  { q: 'How does a 401(k) contribution affect take-home pay?', a: 'Traditional 401(k) contributions are pre-tax — they reduce your taxable income, so you pay less federal income tax. Contributing $5,000/year to a 401(k) doesn't reduce your take-home by $5,000 — it reduces it by about $3,500 because the tax savings partially offset the contribution. This is why 401(k)s are so powerful.' },
  { q: 'What is FICA?', a: 'FICA (Federal Insurance Contributions Act) consists of Social Security (6.2% up to $168,600 in 2024) and Medicare (1.45%, no cap). You pay 7.65% total; your employer matches it. If self-employed, you pay both sides — 15.3% — hence the self-employment tax.' },
  { q: 'How do I increase my take-home pay?', a: 'Legally increase take-home by: maximizing pre-tax deductions (401k, HSA, FSA), adjusting W-4 withholding to avoid overwithholding, contributing to a dependent care FSA if you have children, or moving to a lower-tax state. You cannot avoid FICA unless self-employed with specific strategies.' },
]
const GLOSSARY = [
  { term: 'Gross Salary',    def: 'Your total annual compensation before any taxes or deductions.' },
  { term: 'Net Pay',         def: 'Take-home pay after all taxes and pre-tax deductions are subtracted.' },
  { term: 'FICA',            def: 'Federal Insurance Contributions Act — Social Security (6.2%) + Medicare (1.45%) taxes.' },
  { term: 'Federal Bracket', def: 'The marginal tax rate applied to income in each bracket. You only pay the higher rate on income above each threshold.' },
  { term: 'Effective Tax Rate', def: 'Total taxes paid divided by gross income — always lower than your top marginal bracket rate.' },
  { term: 'Pre-tax Deductions', def: 'Amounts subtracted before taxes are calculated (401k, HSA, FSA) — reduce your taxable income.' },
]

function federalTax(income) {
  const brackets = [[11600, 0.10], [44725, 0.12], [95375, 0.22], [201050, 0.24], [383900, 0.32], [487450, 0.35], [Infinity, 0.37]]
  let tax = 0, prev = 0
  for (const [limit, rate] of brackets) {
    const taxable = Math.min(income, limit) - prev
    if (taxable <= 0) break
    tax += Math.max(0, taxable) * rate
    prev = limit
  }
  return tax
}

export default function TakeHomePay({ meta, category }) {
  const [salary, setSalary] = useState(75000)
  const [stateTax, setStateTax] = useState(5)
  const [k401, setK401] = useState(10)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const k401Amt = salary * k401 / 100
  const taxableIncome = salary - k401Amt
  const fedTax = federalTax(taxableIncome)
  const stTax = salary * stateTax / 100
  const socialSecurity = Math.min(salary, 168600) * 0.062
  const medicare = salary * 0.0145
  const totalDeductions = fedTax + stTax + socialSecurity + medicare + k401Amt
  const takeHome = salary - totalDeductions
  const effRate = salary > 0 ? (totalDeductions / salary * 100).toFixed(1) : 0

  function applyExample(ex) { setSalary(ex.salary); setStateTax(ex.stateTax); setK401(ex.k401) }
  const hint = `Gross: ${fmt(salary, sym)}/yr. Take-home: ${fmt(takeHome, sym)}/yr (${fmt(takeHome / 12, sym)}/month). Effective total deduction rate: ${effRate}%.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Income Details (US)</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Gross Salary" value={salary} onChange={setSalary} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="State Income Tax Rate" hint="Varies by state (0–13%)" value={stateTax} onChange={setStateTax} suffix="%" min={0} max={15} catColor={catColor} />
          <FieldInput label="401(k) Contribution" hint="Pre-tax deduction" value={k401} onChange={setK401} suffix="%" min={0} max={100} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setSalary(75000); setStateTax(5); setK401(10) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Annual Take-Home Pay" value={Math.round(takeHome)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`${fmt(takeHome / 12, sym)}/month · ${effRate}% effective deduction rate`} color={catColor} />
          <BreakdownTable title="Deductions Breakdown" rows={[
            { label: 'Gross Salary',        value: fmt(salary, sym) },
            { label: '401(k) Contribution', value: fmt(k401Amt, sym), color: '#3b82f6' },
            { label: 'Federal Income Tax',  value: fmt(fedTax, sym), color: '#ef4444' },
            { label: 'State Income Tax',    value: fmt(stTax, sym), color: '#ef4444' },
            { label: 'Social Security',     value: fmt(socialSecurity, sym), color: '#f59e0b' },
            { label: 'Medicare',            value: fmt(medicare, sym), color: '#f59e0b' },
            { label: 'Take-Home Pay',       value: fmt(takeHome, sym), color: catColor, bold: true, highlight: true },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How your take-home pay is calculated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Pre-tax Deductions',   formula: '401(k) = Salary × Contribution%' },
            { label: 'Federal Taxable Income', formula: 'Taxable = Salary − Pre-tax Deductions' },
            { label: 'FICA Taxes',            formula: 'Social Security = min(Salary, $168,600) × 6.2%  +  Medicare = Salary × 1.45%' },
            { label: 'Take-Home',             formula: 'Net = Salary − Federal Tax − State Tax − FICA − 401(k)' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Federal taxes use marginal brackets — you only pay the higher rate on income above each threshold, not your entire salary. A 22% bracket doesn't mean you pay 22% on everything. Pre-tax 401(k) contributions reduce your federal taxable income, which is why contributing to a 401(k) costs less than you think.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Salary', `${sym}${ex.salary.toLocaleString()}`], ['State Tax', `${ex.stateTax}%`], ['401(k)', `${ex.k401}%`]].map(([k, v]) => (
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

      <Section title="Frequently Asked Questions" subtitle="Everything about payroll taxes and take-home pay">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
