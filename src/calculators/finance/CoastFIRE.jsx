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
  { title: 'Young Investor',   desc: 'Age 28, 37 years to retire at 65', currentAge: 28, retireAge: 65, expenses: 50000, currentSavings: 40000,  rate: 7, wr: 4 },
  { title: 'Mid-career',       desc: 'Age 38, already has good savings',  currentAge: 38, retireAge: 62, expenses: 60000, currentSavings: 180000, rate: 7, wr: 4 },
  { title: 'Conservative',     desc: 'Age 45, conservative assumptions',  currentAge: 45, retireAge: 67, expenses: 70000, currentSavings: 250000, rate: 6, wr: 3.5 },
]
const FAQ = [
  { q: 'What is Coast FIRE?', a: 'Coast FIRE is the point where you have enough invested that — even without adding another dollar — compound growth alone will carry you to your full FIRE number by traditional retirement age. Once you hit Coast FIRE, you can "coast" — work just enough to cover current expenses without contributing to retirement savings.' },
  { q: 'How is Coast FIRE different from regular FIRE?', a: 'Regular FIRE requires a portfolio large enough to sustain withdrawals immediately. Coast FIRE just requires enough that compound growth gets you there by a future date. Coast FIRE requires a much smaller portfolio but means you still need to work (or have some income) until your target retirement age.' },
  { q: 'What can I do after reaching Coast FIRE?', a: 'After reaching Coast FIRE, you have more flexibility. Options include: working part-time (Barista FIRE), pivoting to lower-paying but more fulfilling work, taking an extended sabbatical, freelancing, or simply having more job security knowing your retirement is funded. You no longer need to save aggressively for retirement.' },
  { q: 'What return rate should I use?', a: 'Use a conservative estimate — 6-7% nominal is commonly cited for diversified stock portfolios over long time horizons. More conservative assumptions (5-6%) provide a safety buffer. The higher your assumed return rate, the lower your Coast FIRE number — so using a conservative rate gives you a safer target.' },
]
const GLOSSARY = [
  { term: 'Coast FIRE',       def: 'Having enough invested today that compound growth alone reaches your FIRE number by retirement age — no further contributions needed.' },
  { term: 'FIRE Number',      def: 'The total portfolio needed to sustain your retirement withdrawals indefinitely — typically 25x annual expenses.' },
  { term: 'Coasting Period',  def: 'The years between hitting Coast FIRE and full retirement — when you cover expenses without investing for retirement.' },
  { term: 'Barista FIRE',     def: 'Working part-time after Coast FIRE to cover living expenses while your investments compound to the full FIRE number.' },
  { term: 'Compound Growth',  def: 'Investment returns earning returns on themselves. The force that carries your portfolio from Coast FIRE number to full FIRE number.' },
  { term: 'Contribution-free Growth', def: 'Portfolio growth without any new deposits — pure compounding on existing balance.' },
]
export default function CoastFIRE({ meta, category }) {
  const [currentAge, setCurrentAge] = useState(35)
  const [retireAge, setRetireAge] = useState(65)
  const [expenses, setExpenses] = useState(60000)
  const [currentSavings, setCurrentSavings] = useState(150000)
  const [rate, setRate] = useState(7)
  const [wr, setWr] = useState(4)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const years = retireAge - currentAge
  const fireNumber = expenses / (wr / 100)
  const coastFIRENumber = fireNumber / Math.pow(1 + rate / 100, years)
  const gap = Math.max(0, coastFIRENumber - currentSavings)
  const reached = currentSavings >= coastFIRENumber
  const projectedAtRetire = currentSavings * Math.pow(1 + rate / 100, years)
  const pct = Math.min(100, currentSavings / coastFIRENumber * 100)

  function applyExample(ex) { setCurrentAge(ex.currentAge); setRetireAge(ex.retireAge); setExpenses(ex.expenses); setCurrentSavings(ex.currentSavings); setRate(ex.rate); setWr(ex.wr) }
  const hint = reached
    ? `🌊 Coast FIRE reached! Your ${fmt(currentSavings, sym)} grows to ${fmt(projectedAtRetire, sym)} by age ${retireAge} — enough to fund ${fmt(expenses, sym)}/year in retirement without contributing another dollar.`
    : `You need ${fmt(coastFIRENumber, sym)} to Coast FIRE. You are ${pct.toFixed(0)}% there. ${fmt(gap, sym)} more and you can stop contributing aggressively to retirement.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Coast FIRE Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" min={18} max={70} catColor={catColor} />
          <FieldInput label="Target Retirement Age" value={retireAge} onChange={setRetireAge} suffix="yrs" min={currentAge + 1} max={80} catColor={catColor} />
          <FieldInput label="Annual Expenses in Retirement" value={expenses} onChange={setExpenses} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Current Portfolio" value={currentSavings} onChange={setCurrentSavings} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Expected Annual Return" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
          <FieldInput label="Safe Withdrawal Rate" value={wr} onChange={setWr} suffix="%" min={1} max={10} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setCurrentAge(35); setRetireAge(65); setExpenses(60000); setCurrentSavings(150000); setRate(7); setWr(4) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <div style={{ padding: '14px', borderRadius: 12, background: reached ? '#10b98108' : catColor + '0d', border: `1.5px solid ${reached ? '#10b98130' : catColor + '30'}`, textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.07em' }}>Coast FIRE Status</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: reached ? '#10b981' : catColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{reached ? '🌊 Reached!' : 'Not yet'}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Progress</span><span style={{ fontSize: 12, fontWeight: 700, color: catColor }}>{pct.toFixed(1)}%</span></div>
            <div style={{ height: 10, background: 'var(--bg-raised)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}><div style={{ height: '100%', width: `${pct}%`, background: reached ? '#10b981' : catColor, borderRadius: 5, transition: 'width .4s' }} /></div>
          </div>
          <BreakdownTable title="Coast FIRE Summary" rows={[
            { label: 'Full FIRE Number',       value: fmt(fireNumber, sym) },
            { label: 'Coast FIRE Number',       value: fmt(coastFIRENumber, sym), color: catColor, bold: true },
            { label: 'Current Portfolio',       value: fmt(currentSavings, sym), color: '#10b981' },
            { label: 'Gap to Coast FIRE',       value: fmt(gap, sym), color: gap > 0 ? '#ef4444' : '#10b981', highlight: true },
            { label: 'Projected at Retirement', value: fmt(projectedAtRetire, sym), color: catColor },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How the Coast FIRE number is derived">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Full FIRE Number',    formula: 'FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate' },
            { label: 'Coast FIRE Number',   formula: 'Coast FIRE = FIRE Number ÷ (1 + return)^years' },
            { label: 'Projected at Retire', formula: 'Future Value = Current Portfolio × (1 + return)^years' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>The Coast FIRE number is your full FIRE number discounted back to the present. If you need $1.5M at 65 and have 30 years at 7% returns, your Coast FIRE number is $1,500,000 ÷ (1.07)^30 = $197,327. Put that in your portfolio today and never touch it — it grows to $1.5M by retirement without another contribution.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Age', `${ex.currentAge} → ${ex.retireAge}`], ['Savings', `${sym}${ex.currentSavings.toLocaleString()}`], ['Return', `${ex.rate}%`]].map(([k, v]) => (
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

      <Section title="Frequently Asked Questions" subtitle="Everything about Coast FIRE">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
