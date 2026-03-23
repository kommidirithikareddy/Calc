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
  { title: 'Cost of Living', desc: 'Annual COLA raise, keep pace with inflation', current: 65000, raisePct: 3,  years: 10 },
  { title: 'Performance',    desc: 'Strong performance review reward',             current: 75000, raisePct: 7,  years: 5  },
  { title: 'Promotion',      desc: 'Step up to senior role',                       current: 85000, raisePct: 15, years: 10 },
]
const FAQ = [
  { q: 'Is a 3% raise actually a raise?', a: 'If inflation is running at 3%, a 3% raise means your purchasing power stayed the same — you didn't get a real raise, you stayed flat. To actually increase your standard of living, your raise needs to exceed the current inflation rate. During periods of 4-6% inflation, a 3% raise is effectively a pay cut in real terms.' },
  { q: 'How do raises compound over time?', a: 'Each raise compounds on your previous salary. A 5% raise on $70,000 gives $73,500. Next year's 5% raise on $73,500 gives $77,175 — not $76,500 as linear thinking would suggest. Over a 20-year career, consistent raises compound dramatically. A 5% annual raise turns a $50,000 salary into $132,664.' },
  { q: 'What is a good raise?', a: 'Average US salary increase is 3-4%/year. Inflation is typically 2-3% in normal years. A "good" raise beats inflation and ideally exceeds the 3-4% average. Top performers typically receive 5-10%. Promotions typically come with 10-20% increases. Switching jobs often produces the largest raises — 15-20% on average for high performers.' },
  { q: 'How do I negotiate a raise effectively?', a: 'Gather market data (Glassdoor, LinkedIn, Levels.fyi for tech), document your achievements in quantified terms ($, %, units), time the conversation after a win or positive review, ask for a specific number and justify it, and be prepared to discuss your timeline if they say not now. Negotiating raises 15-20% more than initial offers on average.' },
]
const GLOSSARY = [
  { term: 'Base Salary',       def: 'Your current fixed annual compensation before the raise.' },
  { term: 'Raise Percentage',  def: 'The percentage increase applied to your base salary.' },
  { term: 'Compound Growth',   def: 'Each year's raise is applied to the previous year's salary, not the original — creating exponential growth.' },
  { term: 'Cost of Living Adjustment (COLA)', def: 'A raise intended to maintain purchasing power by matching inflation — not a real increase in wealth.' },
  { term: 'Real Wage Growth',  def: 'Salary increase above the inflation rate — the true improvement in standard of living.' },
  { term: 'Total Compensation', def: 'Salary + benefits + bonuses + equity. A lower salary with better benefits may be worth more.' },
]
export default function RaiseCalculator({ meta, category }) {
  const [current, setCurrent] = useState(65000)
  const [raisePct, setRaisePct] = useState(5)
  const [years, setYears] = useState(10)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const newSalary = current * (1 + raisePct / 100)
  const increase = newSalary - current
  const monthly = increase / 12
  const biweekly = increase / 26
  const hourly = increase / 2080
  const salaryInYears = current * Math.pow(1 + raisePct / 100, years)
  const totalExtra = Array.from({ length: years }, (_, i) => current * Math.pow(1 + raisePct / 100, i + 1) - current * Math.pow(1 + raisePct / 100, i)).reduce((a, b) => a + b, 0)

  function applyExample(ex) { setCurrent(ex.current); setRaisePct(ex.raisePct); setYears(ex.years) }
  const hint = `A ${raisePct}% raise on ${fmt(current, sym)} adds ${fmt(increase, sym)}/year (${fmt(monthly, sym)}/month). After ${years} years of ${raisePct}% annual raises, your salary reaches ${fmt(salaryInYears, sym)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Raise Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Current Salary" value={current} onChange={setCurrent} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Raise Percentage" value={raisePct} onChange={setRaisePct} suffix="%" min={0} max={100} catColor={catColor} />
          <FieldInput label="Years (compound projection)" value={years} onChange={setYears} suffix="yrs" min={1} max={40} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setCurrent(65000); setRaisePct(5); setYears(10) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="New Annual Salary" value={Math.round(newSalary)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`+${fmt(increase, sym)}/year (${raisePct}% raise)`} color={catColor} />
          <BreakdownTable title="Raise Breakdown" rows={[
            { label: 'Current Salary',       value: fmt(current, sym) },
            { label: 'Raise Amount/Year',    value: `+${fmt(increase, sym)}`, color: '#10b981' },
            { label: 'New Annual Salary',    value: fmt(newSalary, sym), color: catColor, bold: true },
            { label: 'Monthly Increase',     value: `+${fmt(monthly, sym)}` },
            { label: 'Bi-weekly Increase',   value: `+${fmt(biweekly, sym)}` },
            { label: `Salary in ${years} yrs`, value: fmt(salaryInYears, sym), color: catColor, highlight: true, bold: true },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How raises compound over your career">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'New Salary (year 1)',   formula: 'New Salary = Current × (1 + raise%)' },
            { label: 'Salary After N Years',  formula: 'Future Salary = Current × (1 + raise%)^N' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Raises compound on the previous year's salary — not your original salary. This exponential growth is why even small consistent raises add up dramatically over a career. A 5% annual raise on $50,000 reaches $81,444 in 10 years and $132,664 in 20 years. Early raises in your career are especially valuable because they compound for longer.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Current', `${sym}${ex.current.toLocaleString()}`], ['Raise', `${ex.raisePct}%`], ['Years', `${ex.years}`]].map(([k, v]) => (
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

      <Section title="Raise % Comparison" subtitle="10-year compounding effect of different raise rates">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Raise %', 'Year 1 Salary', '5-Year Salary', '10-Year Salary', 'vs No Raise'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[1, 2, 3, 5, 7, 10].map((r, i) => {
                const s1 = current * (1 + r / 100)
                const s5 = current * Math.pow(1 + r / 100, 5)
                const s10 = current * Math.pow(1 + r / 100, 10)
                const isCurrent = r === Math.round(raisePct)
                return (
                  <tr key={r} style={{ background: isCurrent ? catColor + '08' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{r}% {isCurrent && '← You'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(s1, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(s5, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: catColor, textAlign: 'right' }}>{fmt(s10, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', textAlign: 'right' }}>+{fmt(s10 - current, sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about salary raises">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
