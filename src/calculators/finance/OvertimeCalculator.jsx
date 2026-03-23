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
  { title: 'Retail Worker',    desc: 'Hourly worker, standard OT',    hourly: 18,  regularHrs: 40, overtimeHrs: 8,  otRate: 1.5 },
  { title: 'Nurse',            desc: 'Healthcare shift, double time', hourly: 38,  regularHrs: 36, overtimeHrs: 12, otRate: 2   },
  { title: 'Construction',     desc: 'Long site week, time-and-half', hourly: 28,  regularHrs: 40, overtimeHrs: 15, otRate: 1.5 },
]
const FAQ = [
  { q: 'Who is entitled to overtime pay?', a: 'Under the Fair Labor Standards Act (FLSA), non-exempt employees must receive 1.5x their regular rate for all hours worked beyond 40 in a workweek. Exempt employees (generally salaried professionals earning over $684/week) are not entitled to FLSA overtime. Some states have stricter rules — California requires daily OT for hours over 8 in a day.' },
  { q: 'What is double time vs time-and-a-half?', a: 'Time-and-a-half (1.5x) is the federal minimum for overtime. Double time (2x) is not federally required but is mandated in some states (California requires double time for hours over 12 in a day) and many union contracts. Some employers offer double time as a benefit or for holiday work.' },
  { q: 'How is overtime calculated for salaried non-exempt employees?', a: 'First, calculate the regular rate: divide weekly salary by hours worked. Then apply 1.5x to overtime hours. For example, a $800/week salary working 50 hours: regular rate = $800/40 = $20/hr. Overtime = 10 hours × $20 × 0.5 = $100 extra (the half-time premium — they already received straight time as part of their salary).' },
  { q: 'Can I waive my right to overtime?', a: 'No. Under the FLSA, non-exempt employees cannot legally waive their right to overtime pay, even if they sign an agreement saying they will. Employers who fail to pay required overtime can face back wages, penalties and lawsuits. If you believe you're owed overtime, contact the Department of Labor Wage and Hour Division.' },
]
const GLOSSARY = [
  { term: 'Overtime',          def: 'Hours worked beyond 40 in a workweek (federal standard). Must be paid at 1.5x for non-exempt employees.' },
  { term: 'Regular Rate',      def: 'Your standard hourly pay rate — the base for calculating overtime premiums.' },
  { term: 'FLSA',              def: 'Fair Labor Standards Act — US federal law setting minimum wage, overtime requirements and child labor standards.' },
  { term: 'Exempt Employee',   def: 'Salaried employees earning above the FLSA threshold who are not entitled to overtime pay.' },
  { term: 'Non-exempt Employee', def: 'Employees (hourly or salaried below threshold) entitled to FLSA overtime protections.' },
  { term: 'Double Time',       def: 'Pay at 2x the regular rate — required in some states and union contracts for extended or holiday hours.' },
]
export default function OvertimeCalculator({ meta, category }) {
  const [hourly, setHourly] = useState(25)
  const [regularHrs, setRegularHrs] = useState(40)
  const [overtimeHrs, setOvertimeHrs] = useState(10)
  const [otRate, setOtRate] = useState(1.5)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const regularPay = hourly * regularHrs
  const overtimePay = hourly * otRate * overtimeHrs
  const totalWeekly = regularPay + overtimePay
  const totalAnnual = totalWeekly * 52
  const overtimeRate = hourly * otRate
  const effectiveHourly = totalWeekly / (regularHrs + overtimeHrs)

  function applyExample(ex) { setHourly(ex.hourly); setRegularHrs(ex.regularHrs); setOvertimeHrs(ex.overtimeHrs); setOtRate(ex.otRate) }
  const hint = `Regular pay: ${fmt(regularPay, sym)}. Overtime (${otRate}x): ${fmt(overtimePay, sym)}. Total weekly: ${fmt(totalWeekly, sym)}. Annual (52 weeks): ${fmt(totalAnnual, sym)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Work Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Regular Hourly Rate" value={hourly} onChange={setHourly} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Regular Hours/Week" value={regularHrs} onChange={setRegularHrs} suffix="hrs" min={0} max={168} catColor={catColor} />
          <FieldInput label="Overtime Hours/Week" value={overtimeHrs} onChange={setOvertimeHrs} suffix="hrs" min={0} max={100} catColor={catColor} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Overtime Multiplier</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ label: '1.5x (time-and-a-half)', v: 1.5 }, { label: '2x (double time)', v: 2 }].map(r => (
                <button key={r.v} onClick={() => setOtRate(r.v)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${otRate === r.v ? catColor : 'var(--border)'}`, background: otRate === r.v ? catColor + '0d' : 'var(--bg-raised)', color: otRate === r.v ? catColor : 'var(--text-2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{r.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setHourly(25); setRegularHrs(40); setOvertimeHrs(10); setOtRate(1.5) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Total Weekly Pay" value={Math.round(totalWeekly)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`${regularHrs + overtimeHrs} hrs at effective ${sym}${fmtD(effectiveHourly)}/hr`} color={catColor} />
          <BreakdownTable title="Pay Breakdown" rows={[
            { label: 'Regular Pay',          value: fmt(regularPay, sym), color: 'var(--text)' },
            { label: `Overtime Pay (${otRate}x)`, value: fmt(overtimePay, sym), color: '#10b981', bold: true },
            { label: 'Total Weekly',         value: fmt(totalWeekly, sym), color: catColor, highlight: true, bold: true },
            { label: 'Overtime Rate',        value: `${sym}${fmtD(overtimeRate)}/hr` },
            { label: 'Effective Hourly Rate',value: `${sym}${fmtD(effectiveHourly)}/hr` },
            { label: 'Annual (52 weeks)',    value: fmt(totalAnnual, sym), color: catColor },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How overtime pay is calculated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Regular Pay',     formula: 'Regular Pay = Hourly Rate × Regular Hours' },
            { label: 'Overtime Rate',   formula: 'OT Rate = Hourly Rate × Multiplier (1.5x or 2x)' },
            { label: 'Overtime Pay',    formula: 'OT Pay = OT Rate × Overtime Hours' },
            { label: 'Total Weekly Pay', formula: 'Total = Regular Pay + Overtime Pay' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Under FLSA, non-exempt employees must receive at least 1.5x their regular rate for hours over 40 per week. The overtime rate is calculated on the "regular rate of pay" — which includes all compensation except overtime premiums, certain bonuses, and expense reimbursements.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Rate', `${sym}${ex.hourly}/hr`], ['OT Hours', `${ex.overtimeHrs}/wk`], ['Multiplier', `${ex.otRate}x`]].map(([k, v]) => (
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

      <Section title="Frequently Asked Questions" subtitle="Frequently Asked Questions" subtitle="Overtime rules and pay calculations">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
