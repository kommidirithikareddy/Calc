import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, sym = '$') => sym + (Math.round(n * 100) / 100).toFixed(2)
const fmtP = n => n.toFixed(1) + '%'

const EXAMPLES = [
  { title: 'Designer',        desc: 'Graphic designer going freelance',  salary: 65000,  expenses: 3000,  billable: 1200, vacWeeks: 4,  benefits: 8000  },
  { title: 'Developer',       desc: 'Software engineer freelancing',     salary: 120000, expenses: 5000,  billable: 1600, vacWeeks: 3,  benefits: 15000 },
  { title: 'Consultant',      desc: 'Strategy consultant, high rate',    salary: 180000, expenses: 8000,  billable: 1400, vacWeeks: 4,  benefits: 20000 },
]

const FAQ = [
  { q: 'Why do I need to charge so much more than my salary equivalent?', a: 'As a freelancer, you pay both the employer and employee portions of Social Security and Medicare — 15.3% self-employment tax on net earnings. You also have no paid vacation, sick leave, or employer-sponsored benefits. You must cover health insurance, retirement contributions, and business expenses yourself. When all these are factored in, freelancers typically need to charge 1.5-2× their salary equivalent just to break even.' },
  { q: 'What is a billable hour ratio?', a: 'Not every hour you work is billable. Admin, sales, marketing, professional development and project gaps mean you realistically bill 60-80% of your working hours. If you work 2,000 hours/year and bill 70%, you have 1,400 billable hours. Divide your total income target by billable hours to get your minimum rate.' },
  { q: 'How do I account for taxes as a freelancer?', a: 'Self-employed individuals pay 15.3% self-employment tax (12.4% Social Security + 2.9% Medicare) on net earnings, plus federal and state income tax. Set aside 25-35% of every payment for taxes. Make quarterly estimated tax payments to the IRS to avoid underpayment penalties.' },
  { q: 'Should I charge by the hour or by the project?', a: 'Project-based pricing rewards efficiency — if you complete work faster than expected, your effective hourly rate increases. Hourly billing protects you from scope creep. Most successful freelancers use project pricing for defined deliverables and hourly for ongoing or open-ended work. This calculator gives your floor rate regardless of how you structure billing.' },
  { q: 'How do I find my target salary?', a: 'Your target salary equivalent should be your current salary (if transitioning from employment) or the market rate for your skills. Add 20-30% to account for employment taxes your employer previously paid on your behalf, plus the value of benefits you are no longer receiving.' },
]

const GLOSSARY = [
  { term: 'Self-Employment Tax', def: '15.3% tax (12.4% Social Security + 2.9% Medicare) paid by self-employed individuals — both employer and employee shares.' },
  { term: 'Billable Hours',      def: 'Hours actually charged to clients. Typically 60-75% of total working hours after admin, sales, and downtime.' },
  { term: 'Overhead',            def: 'Business expenses required to operate: software, equipment, home office, insurance, professional development.' },
  { term: 'Effective Rate',      def: 'Your actual hourly earnings after accounting for non-billable time. Always lower than your quoted rate.' },
  { term: 'Salary Equivalent',   def: 'The gross employment salary that would provide the same take-home pay as your freelance target income.' },
  { term: 'Buffer Rate',         def: 'Additional markup on your minimum rate to account for business risk, irregular income, and growth.' },
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

export default function FreelanceRate({ meta, category }) {
  const [salary,    setSalary]    = useState(65000)
  const [expenses,  setExpenses]  = useState(3000)
  const [billable,  setBillable]  = useState(1200)
  const [vacWeeks,  setVacWeeks]  = useState(4)
  const [benefits,  setBenefits]  = useState(8000)
  const [currency,  setCurrency]  = useState(CURRENCIES[0])
  const [openFaq,   setOpenFaq]   = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  // Total annual target
  const selfEmpTax   = salary * 0.153 * 0.9235          // SE tax on 92.35% of net
  const totalTarget  = salary + expenses + benefits + selfEmpTax
  const minRate      = billable > 0 ? totalTarget / billable : 0
  const recommendedRate = minRate * 1.20                  // +20% buffer
  const weeklyHours  = 40
  const workWeeks    = 52 - vacWeeks
  const totalHours   = weeklyHours * workWeeks
  const billableHours = billable
  const billableRatio = totalHours > 0 ? billableHours / totalHours * 100 : 0
  const salaryEquivHourly = salary / totalHours

  function applyExample(ex) {
    setSalary(ex.salary); setExpenses(ex.expenses); setBillable(ex.billable)
    setVacWeeks(ex.vacWeeks); setBenefits(ex.benefits)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Income Target</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Target Annual Salary"     hint="What you want to earn" value={salary}   onChange={setSalary}   prefix={sym} catColor={catColor} />
            <FieldInput label="Annual Business Expenses" hint="Software, equipment, etc." value={expenses} onChange={setExpenses} prefix={sym} catColor={catColor} />
            <FieldInput label="Benefits Value"           hint="Health ins, retirement, etc." value={benefits} onChange={setBenefits} prefix={sym} catColor={catColor} />

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', margin: '16px 0 14px', paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Working Hours</div>
            <FieldInput label="Billable Hours per Year"  hint="Realistic client hours"  value={billable}  onChange={setBillable}  suffix="hrs" max={2500} catColor={catColor} />
            <FieldInput label="Vacation Weeks"           value={vacWeeks}  onChange={setVacWeeks}  suffix="weeks" max={12} catColor={catColor} />

            <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans',sans-serif" }}>Minimum Hourly Rate</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: catColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmtD(minRate, sym)}/hr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Billable ratio: {fmtP(billableRatio)}</span>
                <span style={{ fontSize: 10, color: catColor, fontWeight: 600 }}>Recommended: {fmtD(recommendedRate, sym)}/hr</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setSalary(65000); setExpenses(3000); setBillable(1200); setVacWeeks(4); setBenefits(8000) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Recommended Hourly Rate" value={recommendedRate} formatter={n => fmtD(n, sym) + '/hr'} sub={`Minimum: ${fmtD(minRate, sym)}/hr (20% buffer added)`} color={catColor} />
            <BreakdownTable title="Rate Breakdown" rows={[
              { label: 'Target Salary',          value: fmt(salary, sym),          color: catColor },
              { label: 'Business Expenses',      value: fmt(expenses, sym) },
              { label: 'Benefits (self-funded)',  value: fmt(benefits, sym) },
              { label: 'Self-Employment Tax',    value: fmt(selfEmpTax, sym),       color: '#ef4444' },
              { label: 'Total Annual Target',    value: fmt(totalTarget, sym),      bold: true },
              { label: 'Billable Hours/Year',    value: `${billable} hrs` },
              { label: 'Billable Ratio',         value: fmtP(billableRatio) },
              { label: 'Minimum Rate',           value: fmtD(minRate, sym) + '/hr' },
              { label: 'Recommended Rate (+20%)',value: fmtD(recommendedRate, sym) + '/hr', bold: true, highlight: true, color: catColor },
              { label: 'Employee equiv. rate',   value: fmtD(salaryEquivHourly, sym) + '/hr', note: 'what employer pays' },
            ]} />
            <AIHintCard hint={`To match a ${fmt(salary, sym)} salary after expenses and taxes, you need to charge at least ${fmtD(minRate, sym)}/hr. The recommended rate is ${fmtD(recommendedRate, sym)}/hr — ${fmtP(((recommendedRate / salaryEquivHourly) - 1) * 100)} higher than the employee equivalent of ${fmtD(salaryEquivHourly, sym)}/hr.`} />
          </>}
        />
      </div>

      {/* Rate comparison table */}
      <Section title="Rate vs Annual Income" subtitle="What different hourly rates yield at your billable hours">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Hourly Rate', 'Gross Revenue', 'After Expenses', 'After SE Tax', 'vs Target'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[minRate * 0.8, minRate, recommendedRate, minRate * 1.5, minRate * 2].map((r, i) => {
                const gross = r * billable
                const afterExp = gross - expenses - benefits
                const seT = afterExp * 0.9235 * 0.153
                const net = afterExp - seT
                const diff = net - salary
                const isMin = Math.abs(r - minRate) < 0.01
                const isRec = Math.abs(r - recommendedRate) < 0.01
                return (
                  <tr key={i} style={{ background: isRec ? catColor + '12' : isMin ? '#f59e0b12' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isRec || isMin ? 700 : 500, color: isRec ? catColor : isMin ? '#f59e0b' : 'var(--text)' }}>
                      {fmtD(r, sym)}/hr{isMin ? ' (min)' : ''}{isRec ? ' (rec)' : ''}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(gross, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(afterExp, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>{fmt(net, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, textAlign: 'right', color: diff >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{diff >= 0 ? '+' : ''}{fmt(diff, sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Target', fmt(ex.salary, sym)], ['Billable', `${ex.billable}h`], ['Min Rate', fmtD(ex.salary / ex.billable * 1.4, sym) + '/hr']].map(([k, v]) => (
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
          Total Target = Salary + Expenses + Benefits + SE Tax{'\n'}
          SE Tax ≈ Net Earnings × 0.9235 × 15.3%{'\n'}
          Min Rate = Total Target / Billable Hours
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          Freelancers need to cover self-employment tax (15.3%), business expenses, benefits, and the reality that not every working hour is billable. The minimum rate is the floor — anything below it means earning less than your target after all costs. A 20% buffer on top protects against slow months and unexpected expenses.
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
