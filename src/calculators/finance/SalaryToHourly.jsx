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
  { title: 'Entry Level',   desc: 'Full-time, standard 40hr week', salary: 45000, hoursPerWeek: 40, weeksPerYear: 52 },
  { title: 'Professional',  desc: 'Full-time with 2 weeks vacation', salary: 85000, hoursPerWeek: 40, weeksPerYear: 50 },
  { title: 'Contractor',    desc: 'Part-time, 30hr/week', salary: 60000, hoursPerWeek: 30, weeksPerYear: 48 },
]
const FAQ = [
  { q: 'Why does my hourly rate matter?', a: 'Knowing your hourly rate helps you evaluate whether side projects or overtime are worthwhile, compare job offers that mix salary and hours differently, and negotiate freelance rates. A $100k salary sounds impressive, but at 60 hours/week it’s only $32/hour — less than many $70k jobs requiring 40 hours.' },
  { q: 'What should I include in "weeks per year"?', a: 'Standard US full-time is 52 weeks. If you take unpaid vacation or have unpaid days off, subtract those weeks. Paid vacation is included since you still receive your salary. The more accurate your week count, the more accurate your hourly rate — important for freelance comparison.' },
  { q: 'How do I compare a salary to a freelance rate?', a: 'Freelance rates must be higher than equivalent salary rates because you pay both sides of FICA (15.3% vs 7.65%), cover your own benefits (health, retirement), and have unpaid time between projects. A general rule: multiply your equivalent salary hourly rate by 1.5-2x to get a comparable freelance rate.' },
  { q: 'What is the standard full-time hourly rate formula?', a: 'Annual salary ÷ 2,080 (standard full-time hours: 40hr/week × 52 weeks). This gives a rough hourly rate. For more accuracy, adjust for actual hours worked and weeks paid. A quick estimate: divide your salary by 1,000 to get rough bi-weekly pay, or by 2,000 for hourly.' },
]
const GLOSSARY = [
  { term: 'Base Salary',     def: 'Your fixed annual compensation before bonuses, overtime, benefits or deductions.' },
  { term: 'Hourly Rate',     def: 'Your effective pay per hour worked — salary divided by total hours worked annually.' },
  { term: 'Gross Pay',       def: 'Total earnings before any tax deductions — what your employer pays you.' },
  { term: 'Net Pay',         def: 'Take-home pay after all taxes and deductions — what you actually receive.' },
  { term: 'Total Compensation', def: 'Salary plus all benefits: health insurance, 401k match, PTO, bonuses. Can add $20-40k+.' },
  { term: 'Opportunity Cost', def: 'The value of what you give up — a lower-salary high-hours job may cost more than a higher-salary reasonable-hours alternative.' },
]
export default function SalaryToHourly({ meta, category }) {
  const [salary, setSalary] = useState(75000)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [weeksPerYear, setWeeksPerYear] = useState(52)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const totalHours = hoursPerWeek * weeksPerYear
  const hourly = totalHours > 0 ? salary / totalHours : 0
  const daily = hourly * hoursPerWeek / 5
  const weekly = weeksPerYear > 0 ? salary / weeksPerYear : 0
  const biweekly = weekly * 2
  const monthly = salary / 12

  function applyExample(ex) { setSalary(ex.salary); setHoursPerWeek(ex.hoursPerWeek); setWeeksPerYear(ex.weeksPerYear) }
  const hint = `${sym}${salary.toLocaleString()}/year ÷ ${totalHours.toLocaleString()} hours = ${sym}${fmtD(hourly)}/hour. Monthly: ${fmt(monthly, sym)}. Bi-weekly: ${fmt(biweekly, sym)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Salary Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Salary" value={salary} onChange={setSalary} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Hours Per Week" value={hoursPerWeek} onChange={setHoursPerWeek} suffix="hrs" min={1} max={168} catColor={catColor} />
          <FieldInput label="Weeks Per Year" hint="Paid weeks (52 = no unpaid leave)" value={weeksPerYear} onChange={setWeeksPerYear} suffix="wks" min={1} max={52} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Convert →</button>
            <button onClick={() => { setSalary(75000); setHoursPerWeek(40); setWeeksPerYear(52) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Hourly Rate" value={Math.round(hourly * 100) / 100} formatter={n => sym + n.toFixed(2)} sub={`Based on ${hoursPerWeek}hrs/week × ${weeksPerYear} weeks`} color={catColor} />
          <BreakdownTable title="Salary Breakdown" rows={[
            { label: 'Hourly',          value: sym + fmtD(hourly), color: catColor, bold: true, highlight: true },
            { label: 'Daily (8hrs)',     value: sym + fmtD(daily) },
            { label: 'Weekly',          value: fmt(weekly, sym) },
            { label: 'Bi-weekly',       value: fmt(biweekly, sym) },
            { label: 'Monthly',         value: fmt(monthly, sym) },
            { label: 'Annual',          value: fmt(salary, sym), color: catColor, bold: true },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How salary converts to other pay periods">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Hourly Rate',  formula: 'Hourly = Annual Salary ÷ (Hours/Week × Weeks/Year)' },
            { label: 'Daily Rate',   formula: 'Daily = Hourly × Hours per Day (typically 8)' },
            { label: 'Monthly',      formula: 'Monthly = Annual Salary ÷ 12' },
            { label: 'Bi-weekly',    formula: 'Bi-weekly = Annual Salary ÷ 26' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>The standard 40hr/week × 52 weeks = 2,080 hours per year. Many people use 2,080 as a quick divisor. But if you regularly work more than 40 hours, your true hourly rate is lower. Always calculate with your actual hours to get an honest comparison when evaluating job offers.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Salary', `${sym}${ex.salary.toLocaleString()}`], ['Hours', `${ex.hoursPerWeek}/wk`], ['Weeks', `${ex.weeksPerYear}`]].map(([k, v]) => (
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

      <Section title="Salary Comparison at Different Hours" subtitle="Same salary, different hours = very different hourly rate">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Hours/Week', 'Total Hours', 'Hourly Rate', 'Monthly'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[35, 40, 45, 50, 55, 60].map((h, i) => {
                const total = h * weeksPerYear
                const hr = salary / total
                const isCurrent = h === hoursPerWeek
                return (
                  <tr key={h} style={{ background: isCurrent ? catColor + '08' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{h} hours {isCurrent && '← You'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{total.toLocaleString()}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: catColor, textAlign: 'right' }}>{sym}{fmtD(hr)}/hr</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(salary / 12, sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Salary conversion and pay rate questions">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
