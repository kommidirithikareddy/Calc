import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtP = n => n.toFixed(2) + '%'

// 2024 federal brackets (single)
const BRACKETS_SINGLE = [
  { min: 0,       max: 11600,  rate: 0.10 },
  { min: 11600,   max: 47150,  rate: 0.12 },
  { min: 47150,   max: 100525, rate: 0.22 },
  { min: 100525,  max: 191950, rate: 0.24 },
  { min: 191950,  max: 243725, rate: 0.32 },
  { min: 243725,  max: 609350, rate: 0.35 },
  { min: 609350,  max: Infinity,rate: 0.37 },
]
const BRACKETS_MFJ = [
  { min: 0,       max: 23200,  rate: 0.10 },
  { min: 23200,   max: 94300,  rate: 0.12 },
  { min: 94300,   max: 201050, rate: 0.22 },
  { min: 201050,  max: 383900, rate: 0.24 },
  { min: 383900,  max: 487450, rate: 0.32 },
  { min: 487450,  max: 731200, rate: 0.35 },
  { min: 731200,  max: Infinity,rate: 0.37 },
]
const STD_DEDUCTION = { single: 14600, mfj: 29200 }

function calcTax(income, brackets) {
  let tax = 0
  for (const b of brackets) {
    if (income <= b.min) break
    const taxable = Math.min(income, b.max) - b.min
    tax += taxable * b.rate
  }
  return tax
}

function getMarginalRate(income, brackets) {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) return brackets[i].rate
  }
  return brackets[0].rate
}

const FILING_STATUS = [
  { key: 'single', label: 'Single' },
  { key: 'mfj',    label: 'Married Filing Jointly' },
]

const EXAMPLES = [
  { title: 'Mid-level Employee', desc: 'Annual performance bonus',   salary: 75000,  bonus: 10000, filing: 'single' },
  { title: 'Senior Manager',     desc: 'Quarterly bonus payout',     salary: 150000, bonus: 25000, filing: 'single' },
  { title: 'Executive',          desc: 'Annual incentive bonus',     salary: 250000, bonus: 75000, filing: 'mfj'    },
]

const FAQ = [
  { q: 'Why is my bonus taxed at a higher rate?', a: 'Your bonus is not taxed at a higher rate — it is withheld at a higher rate. The IRS treats bonuses as "supplemental wages." Employers use the flat 22% supplemental withholding rate (or aggregate the bonus with your regular salary and withhold based on the combined income). Neither method determines your actual tax owed — that is settled when you file your return.' },
  { q: 'What is the flat rate vs aggregate method?', a: 'Flat rate: The employer withholds exactly 22% federal tax from the bonus (plus FICA). Simple and predictable. Aggregate method: The employer adds the bonus to your most recent paycheck amount, calculates withholding on the combined amount, then subtracts what was already withheld. This typically results in more withheld and is more accurate.' },
  { q: 'Will I get a refund if too much is withheld from my bonus?', a: 'Likely yes, if your total annual tax bill is lower than total withholdings. The 22% flat withholding on a bonus may over-withhold if your marginal rate is lower (e.g., 12% or 22%). You will receive the excess back as a tax refund when you file your return. Conversely, if your marginal rate is 32%+, you may owe more.' },
  { q: 'How can I reduce taxes on my bonus?', a: 'Contribute more to your 401(k) before or after receiving the bonus (up to the annual limit). If your employer allows it, defer part of the bonus to next year. Contribute to an HSA or FSA. If you expect to be in a lower bracket next year, consider whether deferral makes sense. These reduce your taxable income dollar-for-dollar.' },
  { q: 'Are bonuses subject to Social Security and Medicare tax?', a: 'Yes. Bonuses are subject to FICA taxes just like regular wages. Social Security tax (6.2%) applies up to the annual wage base ($168,600 in 2024). Medicare tax (1.45%) applies to all wages with an additional 0.9% surtax on wages above $200,000 (single) or $250,000 (MFJ).' },
]

const GLOSSARY = [
  { term: 'Supplemental Wages',   def: 'IRS term for payments made in addition to regular wages — includes bonuses, commissions, overtime. Taxed differently at source.' },
  { term: 'Flat Rate Method',     def: 'Withholding bonuses at a flat 22% federal rate, regardless of your actual marginal rate.' },
  { term: 'Aggregate Method',     def: 'Combining bonus with regular wages to determine withholding based on your total income bracket.' },
  { term: 'Marginal Rate',        def: 'The tax rate applied to your last dollar of income — the rate that applies to the bonus under the aggregate method.' },
  { term: 'Effective Rate',       def: 'Your average overall tax rate: total tax owed divided by total taxable income.' },
  { term: 'FICA',                 def: 'Federal Insurance Contributions Act taxes: 6.2% Social Security (up to wage base) + 1.45% Medicare.' },
]

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

export default function BonusTax({ meta, category }) {
  const [salary,  setSalary]  = useState(75000)
  const [bonus,   setBonus]   = useState(10000)
  const [filing,  setFiling]  = useState('single')
  const [pre401k, setPre401k] = useState(0)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const brackets  = filing === 'single' ? BRACKETS_SINGLE : BRACKETS_MFJ
  const stdDed    = filing === 'single' ? STD_DEDUCTION.single : STD_DEDUCTION.mfj
  const SS_WAGE_BASE = 168600

  // Taxable income without bonus
  const taxableBase  = Math.max(0, salary - pre401k - stdDed)
  const taxBase      = calcTax(taxableBase, brackets)
  const effectiveBase = taxableBase > 0 ? taxBase / taxableBase * 100 : 0

  // Taxable income with bonus
  const taxableTotal = Math.max(0, salary + bonus - pre401k - stdDed)
  const taxTotal     = calcTax(taxableTotal, brackets)
  const marginalRate = getMarginalRate(taxableTotal, brackets) * 100

  // Bonus tax impact
  const taxOnBonus_agg  = taxTotal - taxBase                    // aggregate method
  const taxOnBonus_flat = bonus * 0.22                          // flat 22%

  // FICA on bonus
  const ssAlreadyPaid = Math.min(salary, SS_WAGE_BASE)
  const ssOnBonus     = Math.max(0, Math.min(bonus, SS_WAGE_BASE - ssAlreadyPaid)) * 0.062
  const medicareOnBonus = bonus * 0.0145
  const ficaOnBonus   = ssOnBonus + medicareOnBonus

  // Take-home
  const takeHome_agg  = bonus - taxOnBonus_agg  - ficaOnBonus
  const takeHome_flat = bonus - taxOnBonus_flat - ficaOnBonus

  function applyExample(ex) {
    setSalary(ex.salary); setBonus(ex.bonus); setFiling(ex.filing); setPre401k(0)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Income Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Filing Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {FILING_STATUS.map(f => (
                  <button key={f.key} onClick={() => setFiling(f.key)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${filing === f.key ? catColor : 'var(--border)'}`, background: filing === f.key ? catColor + '15' : 'var(--bg-raised)', color: filing === f.key ? catColor : 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>{f.label}</button>
                ))}
              </div>
            </div>

            <FieldInput label="Annual Base Salary" value={salary} onChange={setSalary} prefix={sym} catColor={catColor} />
            <FieldInput label="Bonus Amount"        value={bonus}  onChange={setBonus}  prefix={sym} catColor={catColor} />
            <FieldInput label="Pre-Tax 401(k) Contribution" hint="Reduces taxable income" value={pre401k} onChange={setPre401k} prefix={sym} max={23000} catColor={catColor} />

            <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans',sans-serif" }}>Your Marginal Rate</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: catColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmtP(marginalRate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Flat withholding: 22%</span>
                <span style={{ fontSize: 10, color: marginalRate > 22 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{marginalRate > 22 ? 'May owe more at filing' : 'May get refund at filing'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setSalary(75000); setBonus(10000); setFiling('single'); setPre401k(0) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Bonus Take-Home (Aggregate)" value={takeHome_agg} formatter={n => fmt(n, sym)} sub={`Federal tax: ${fmt(taxOnBonus_agg, sym)} + FICA: ${fmt(ficaOnBonus, sym)}`} color={catColor} />
            <BreakdownTable title="Bonus Tax Breakdown" rows={[
              { label: 'Gross Bonus',                  value: fmt(bonus, sym),            color: catColor },
              { label: 'Marginal Federal Rate',        value: fmtP(marginalRate) },
              { label: 'Federal Tax (Aggregate)',      value: fmt(taxOnBonus_agg, sym),   color: '#ef4444' },
              { label: 'Federal Tax (Flat 22%)',       value: fmt(taxOnBonus_flat, sym),  color: '#f59e0b' },
              { label: 'Social Security',              value: fmt(ssOnBonus, sym) },
              { label: 'Medicare',                     value: fmt(medicareOnBonus, sym) },
              { label: 'Total FICA',                   value: fmt(ficaOnBonus, sym),      color: '#ef4444' },
              { label: 'Take-Home (Aggregate method)', value: fmt(takeHome_agg, sym),     bold: true, highlight: true },
              { label: 'Take-Home (Flat 22% method)',  value: fmt(takeHome_flat, sym),    bold: true },
            ]} />
            <AIHintCard hint={`Your marginal rate is ${fmtP(marginalRate)}. ${marginalRate > 22 ? `The 22% flat withholding under-withholds by ${fmt(taxOnBonus_agg - taxOnBonus_flat, sym)} — you may owe more at filing.` : `The 22% flat rate over-withholds by ${fmt(taxOnBonus_flat - taxOnBonus_agg, sym)} — you'll likely get a refund.`} Take-home on ${fmt(bonus, sym)} bonus: ${fmt(takeHome_agg, sym)}.`} />
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Salary', fmt(ex.salary, sym)], ['Bonus', fmt(ex.bonus, sym)], ['Filing', ex.filing === 'single' ? 'Single' : 'MFJ']].map(([k, v]) => (
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

      <Section title="Formula Explained">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 12, color: catColor, lineHeight: 1.9 }}>
          Aggregate: Tax on Bonus = Tax(Salary+Bonus) − Tax(Salary){'\n'}
          Flat Rate: Tax on Bonus = Bonus × 22%{'\n'}
          FICA: SS (6.2% up to $168,600) + Medicare (1.45%)
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          The aggregate method uses your total annual income to determine the bonus tax — the most accurate approach. The flat 22% method is simpler and used by many employers. Either way, actual tax owed is determined when you file your return, not at withholding time.
        </p>
      </Section>

      <Section title="Key Terms">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GLOSSARY.map(g => <GlossaryTerm key={g.term} {...g} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="FAQ">
        {FAQ.map((f, i) => <AccordionItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
