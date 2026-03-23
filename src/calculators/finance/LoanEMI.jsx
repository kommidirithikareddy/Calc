import { useState, useCallback, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

// ── Real world examples ────────────────────────────────────
const EXAMPLES = [
  {
    title: 'Car Loan',
    desc: 'Financing a new mid-range car',
    amount: 25000, rate: 8, termYrs: 5,
  },
  {
    title: 'Personal Loan',
    desc: 'Home renovation or emergency',
    amount: 10000, rate: 12, termYrs: 3,
  },
  {
    title: 'Home Loan',
    desc: 'Long-term property mortgage',
    amount: 300000, rate: 6.5, termYrs: 20,
  },
]

// ── FAQ ────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is an EMI?',
    a: 'EMI stands for Equated Monthly Instalment — a fixed amount you pay your lender every month for the entire loan tenure. Each EMI covers both the interest accrued for that month and a portion of the principal. The split between interest and principal changes every month, but the EMI amount stays the same.',
  },
  {
    q: 'How is the interest calculated in each EMI?',
    a: 'Interest is calculated on the outstanding principal balance each month. In the early months, most of your EMI goes toward interest because the balance is high. As you repay principal, the interest portion shrinks and the principal portion grows. This is called an amortizing loan.',
  },
  {
    q: 'What happens if I make extra payments?',
    a: 'Extra payments reduce your outstanding principal directly, which means less interest accrues in subsequent months. Even small additional payments can significantly reduce your total interest cost and shorten your loan tenure. Most lenders allow prepayment, though some charge a penalty.',
  },
  {
    q: 'What is the difference between flat rate and reducing balance rate?',
    a: 'A flat rate charges interest on the original loan amount throughout the tenure. A reducing balance rate charges interest only on the outstanding balance, which decreases as you repay. Reducing balance is far cheaper — a 10% flat rate is roughly equivalent to 18-20% reducing balance. This calculator uses the reducing balance method.',
  },
  {
    q: 'Should I choose a shorter or longer loan term?',
    a: 'A shorter term means higher EMIs but significantly less total interest paid. A longer term means lower EMIs (easier on monthly cash flow) but much more total interest. The best approach is to choose the shortest term your budget comfortably allows — even 1-2 years shorter can save thousands in interest.',
  },
  {
    q: 'What is an amortization schedule?',
    a: 'An amortization schedule is a complete table of every monthly payment over the life of your loan, showing how much of each payment goes to interest, how much goes to principal, and what your remaining balance is. It makes visible how much of your early payments are interest-heavy versus principal-heavy.',
  },
]

// ── Glossary ───────────────────────────────────────────────
const GLOSSARY = [
  { term: 'EMI',                  def: 'Equated Monthly Instalment — the fixed amount paid every month to repay a loan over its tenure.' },
  { term: 'Principal',            def: 'The original loan amount borrowed, before any interest is added.' },
  { term: 'Interest Rate',        def: 'The annual percentage charged by the lender on the outstanding loan balance.' },
  { term: 'Loan Tenure',          def: 'The total duration of the loan — how many months or years you have to repay it.' },
  { term: 'Amortization',         def: 'The process of paying off a loan through regular installments that cover both principal and interest.' },
  { term: 'Outstanding Balance',  def: 'The remaining principal amount still owed at any point during the loan tenure.' },
  { term: 'Prepayment',           def: 'Making additional payments beyond the required EMI to reduce principal faster and save on interest.' },
  { term: 'Processing Fee',       def: 'A one-time charge by the lender for processing your loan application, typically 0.5–2% of the loan amount.' },
]

// ── Formatters ─────────────────────────────────────────────
const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = (n, sym = '$') => n >= 1000 ? sym + (n / 1000).toFixed(0) + 'k' : fmt(n, sym)

// ── Field Input ────────────────────────────────────────────
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, step = 1, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => { if (!focused) setRaw(String(value)) }, [value, focused])

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--bg-input, var(--bg-card))',
        border: `1.5px solid ${focused ? catColor : 'var(--border)'}`,
        borderRadius: 8, padding: '0 10px', height: 38,
        transition: 'border-color .12s',
        boxShadow: focused ? `0 0 0 3px ${catColor}18` : 'none',
      }}>
        {prefix && <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}
        <input
          type="text" inputMode="decimal"
          value={focused ? raw : value}
          onChange={e => { setRaw(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
          onFocus={() => { setFocused(true); setRaw(String(value)) }}
          onBlur={() => {
            setFocused(false)
            const v = parseFloat(raw)
            if (isNaN(v) || raw === '') { setRaw(String(min)); onChange(min) }
            else { const c = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v); setRaw(String(c)); onChange(c) }
          }}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, outline: 'none', minWidth: 0, fontFamily: "'DM Sans', sans-serif" }}
        />
        {suffix && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  )
}

// ── Accordion ──────────────────────────────────────────────
function AccordionItem({ q, a, isOpen, onToggle, catColor }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 0', background: 'none',
        border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: catColor, flexShrink: 0, fontWeight: 400, transition: 'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span>
      </button>
      {isOpen && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>{a}</p>}
    </div>
  )
}

// ── Glossary Term ──────────────────────────────────────────
function GlossaryTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
      background: open ? catColor + '10' : 'var(--bg-raised)',
      border: `1px solid ${open ? catColor + '30' : 'var(--border)'}`,
      transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: open ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{term}</span>
        <span style={{ fontSize: 14, color: catColor, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '7px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{def}</p>}
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

// ── Comparison Tool ────────────────────────────────────────
function ComparisonTool({ amount, rate, termYrs, sym, catColor }) {
  const [activeIdx, setActiveIdx] = useState(2)

  function calcEMI(a, r, t) {
    const mr = r / 100 / 12
    const tm = t * 12
    if (mr === 0) return a / tm
    return a * mr * Math.pow(1 + mr, tm) / (Math.pow(1 + mr, tm) - 1)
  }

  const baseEMI   = calcEMI(amount, rate, termYrs)
  const baseTotalInterest = baseEMI * termYrs * 12 - amount

  const scenarios = [
    { label: '2% lower rate',    emoji: '📉', desc: `Same loan at ${Math.max(0.5, rate - 2)}%`,         amt: amount, r: Math.max(0.5, rate - 2),  t: termYrs },
    { label: '1% lower rate',    emoji: '⬇️', desc: `Same loan at ${Math.max(0.5, rate - 1)}%`,         amt: amount, r: Math.max(0.5, rate - 1),  t: termYrs },
    { label: 'Current plan',     emoji: '📍', desc: `${sym}${amount.toLocaleString()} at ${rate}% for ${termYrs} yrs`, amt: amount, r: rate,                  t: termYrs, isCurrent: true },
    { label: '5 yrs shorter',    emoji: '⚡', desc: `Pay off ${Math.max(1, termYrs - 5)} yrs instead`,  amt: amount, r: rate,                  t: Math.max(1, termYrs - 5) },
    { label: '5 yrs longer',     emoji: '📅', desc: `Spread over ${termYrs + 5} yrs instead`,           amt: amount, r: rate,                  t: termYrs + 5 },
    { label: 'Extra 10% EMI',    emoji: '🚀', desc: 'Pay 10% more each month',                           amt: amount, r: rate,                  t: termYrs, extraPct: 10 },
  ]

  const active = scenarios[activeIdx]

  // For extra payment scenario — calculate effective term reduction
  let activeEMI, activeTotalInterest, activeMonths
  if (active.extraPct) {
    const baseM = calcEMI(active.amt, active.r, active.t)
    const extraEMI = baseM * (1 + active.extraPct / 100)
    const mr = active.r / 100 / 12
    // Solve for reduced months: n = -ln(1 - P*r/EMI) / ln(1+r)
    activeMonths = mr > 0 ? Math.ceil(-Math.log(1 - active.amt * mr / extraEMI) / Math.log(1 + mr)) : active.t * 12
    activeEMI = extraEMI
    activeTotalInterest = extraEMI * activeMonths - active.amt
  } else {
    activeEMI = calcEMI(active.amt, active.r, active.t)
    activeMonths = active.t * 12
    activeTotalInterest = activeEMI * activeMonths - active.amt
  }

  const interestDiff = activeTotalInterest - baseTotalInterest
  const emiDiff      = activeEMI - baseEMI
  const saved        = interestDiff < 0

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Small changes in rate, tenure or EMI amount have a massive impact on total interest paid. Click any scenario to instantly see how your loan changes.
      </p>

      {/* Scenario cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const sEMI = s.extraPct
            ? calcEMI(s.amt, s.r, s.t) * (1 + s.extraPct / 100)
            : calcEMI(s.amt, s.r, s.t)
          const sTm  = s.extraPct
            ? (() => { const mr = s.r/100/12; return mr > 0 ? Math.ceil(-Math.log(1 - s.amt*mr/sEMI)/Math.log(1+mr)) : s.t*12 })()
            : s.t * 12
          const sTotalInt = sEMI * sTm - s.amt
          const intD = sTotalInt - baseTotalInterest
          const isActive = activeIdx === i
          return (
            <button key={i} onClick={() => setActiveIdx(i)} style={{
              padding: '12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
              border: `1.5px solid ${isActive ? catColor : 'var(--border)'}`,
              background: isActive ? catColor + '0d' : 'var(--bg-raised)',
              transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
                {s.isCurrent && <span style={{ fontSize: 9, fontWeight: 700, background: catColor, color: '#fff', padding: '1px 5px', borderRadius: 6, marginLeft: 'auto' }}>YOU</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 7, lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? catColor : 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {sym}{Math.round(sEMI).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {!s.isCurrent && (
                <div style={{ fontSize: 10, fontWeight: 600, color: intD <= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {intD <= 0 ? 'Save ' : 'Pay '}{sym}{Math.abs(Math.round(intD)).toLocaleString()} interest
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Result story */}
      {!active.isCurrent && (
        <div style={{
          padding: '16px 18px', borderRadius: 12,
          background: saved ? '#10b98108' : '#ef444408',
          border: `1.5px solid ${saved ? '#10b98130' : '#ef444430'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                {active.emoji} {active.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                {saved
                  ? `With this scenario your EMI is ${sym}${Math.round(activeEMI).toLocaleString()}/month and you save ${sym}${Math.abs(Math.round(interestDiff)).toLocaleString()} in total interest over ${Math.round(activeMonths / 12 * 10) / 10} years.`
                  : `With this scenario your EMI drops to ${sym}${Math.round(activeEMI).toLocaleString()}/month but you pay ${sym}${Math.abs(Math.round(interestDiff)).toLocaleString()} more in total interest.`
                }
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: saved ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {saved ? 'Save ' : 'Extra '}{sym}{Math.abs(Math.round(interestDiff)).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>in total interest</div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${saved ? '#10b98130' : '#ef444430'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Your current plan', emi: baseEMI,   interest: baseTotalInterest,   isCurrent: true  },
              { label: active.label,         emi: activeEMI, interest: activeTotalInterest, isCurrent: false },
            ].map((r, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 8,
                background: r.isCurrent ? catColor + '0d' : (saved ? '#10b98108' : '#ef444408'),
                border: `1px solid ${r.isCurrent ? catColor + '30' : (saved ? '#10b98130' : '#ef444430')}`,
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: r.isCurrent ? catColor : (saved ? '#10b981' : '#ef4444'), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {sym}{Math.round(r.emi).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                  Total interest: {sym}{Math.round(r.interest).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.isCurrent && (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: catColor + '08', border: `1px solid ${catColor}25`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          📍 This is your current loan — {sym}{Math.round(baseEMI).toLocaleString()}/month, {sym}{Math.round(baseTotalInterest).toLocaleString()} total interest. Click any scenario above to see how changing the rate, tenure or EMI affects your total cost.
        </div>
      )}
    </div>
  )
}

// ── Full amortization table ────────────────────────────────
function AmortizationTable({ amount, rate, termYrs, sym, catColor }) {
  const [showAll, setShowAll] = useState(false)
  const mr = rate / 100 / 12
  const tm = termYrs * 12
  const emi = mr === 0 ? amount / tm : amount * mr * Math.pow(1 + mr, tm) / (Math.pow(1 + mr, tm) - 1)

  const rows = []
  let balance = amount
  let cumInterest = 0
  let cumPrincipal = 0

  for (let m = 1; m <= tm; m++) {
    const intPaid  = balance * mr
    const prinPaid = Math.min(emi - intPaid, balance)
    balance        = Math.max(0, balance - prinPaid)
    cumInterest   += intPaid
    cumPrincipal  += prinPaid
    if (m % 12 === 0 || m === tm) {
      rows.push({
        period:       `Year ${Math.ceil(m / 12)}`,
        emi:          Math.round(emi),
        principal:    Math.round(cumPrincipal),
        interest:     Math.round(cumInterest),
        balance:      Math.round(balance),
      })
      cumInterest  = 0
      cumPrincipal = 0
    }
  }

  const visible = showAll ? rows : rows.slice(0, 5)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr>
            {['Period', 'EMI', 'Principal', 'Interest', 'Balance'].map((h, i) => (
              <th key={h} style={{
                padding: '9px 12px', fontSize: 11, fontWeight: 700,
                color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right',
                borderBottom: '1px solid var(--border)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
              <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: catColor }}>{r.period}</td>
              <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{sym}{r.emi.toLocaleString()}</td>
              <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', textAlign: 'right' }}>{sym}{r.principal.toLocaleString()}</td>
              <td style={{ padding: '9px 12px', fontSize: 12, color: '#ef4444', textAlign: 'right' }}>{sym}{r.interest.toLocaleString()}</td>
              <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{sym}{r.balance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && (
        <button onClick={() => setShowAll(s => !s)} style={{
          marginTop: 12, width: '100%', padding: '9px', borderRadius: 8,
          border: `1px solid ${catColor}40`, background: catColor + '08',
          color: catColor, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {showAll ? 'Show less ↑' : `Show all ${rows.length} years ↓`}
        </button>
      )}
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────
export default function LoanEMI({ meta, category }) {
  const [amount,   setAmount]   = useState(25000)
  const [rate,     setRate]     = useState(8)
  const [termYrs,  setTermYrs]  = useState(5)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)

  const sym      = currency.symbol
  const catColor = category?.color || '#6366f1'

  const monthlyRate = rate / 100 / 12
  const totalMonths = termYrs * 12

  const emi = monthlyRate === 0
    ? amount / totalMonths
    : amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

  const totalPayment  = emi * totalMonths
  const totalInterest = totalPayment - amount

  // Chart data — yearly amortization
  const chartData = []
  let balance = amount
  for (let month = 1; month <= totalMonths; month++) {
    const intPaid  = balance * monthlyRate
    const prinPaid = emi - intPaid
    balance -= prinPaid
    if (month % 12 === 0 || month === totalMonths) {
      chartData.push({
        year:      `Y${Math.ceil(month / 12)}`,
        principal: Math.round(Math.max(0, balance)),
        paid:      Math.round(amount - Math.max(0, balance)),
      })
    }
  }

  const hint = `Your monthly EMI is ${fmt(emi, sym)}. Over ${termYrs} years you'll pay ${fmt(totalInterest, sym)} in interest — ${((totalInterest / amount) * 100).toFixed(0)}% of your original loan. Paying even 10% extra monthly saves approximately ${fmt(totalInterest * 0.18, sym)} in interest.`

  function applyExample(ex) {
    setAmount(ex.amount)
    setRate(ex.rate)
    setTermYrs(ex.termYrs)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Main calc ── */}
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 18, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
                Loan Details
              </div>

              <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

              <FieldInput label="Loan Amount"          hint="Total amount borrowed" value={amount}  onChange={setAmount}  prefix={sym} min={100}   catColor={catColor} />
              <FieldInput label="Annual Interest Rate" hint="% per year"            value={rate}    onChange={setRate}    suffix="%"   min={0} max={50} step={0.25} catColor={catColor} />
              <FieldInput label="Loan Term"            hint="Duration in years"     value={termYrs} onChange={setTermYrs} suffix="yrs" min={1} max={30} catColor={catColor} />

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button style={{
                  flex: 1, padding: 13, borderRadius: 10, border: 'none',
                  background: catColor, color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity .12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Calculate →
                </button>
                <button onClick={() => { setAmount(25000); setRate(8); setTermYrs(5) }}
                  style={{
                    padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)',
                    background: 'var(--bg-raised)', color: 'var(--text-2)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  Reset
                </button>
              </div>
            </>
          }

          right={
            <>
              <ResultHero
                label="Monthly EMI"
                value={Math.round(emi)}
                formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
                sub={`Over ${termYrs} years at ${rate}% interest`}
                color={catColor}
              />

              <BreakdownTable title="Loan Summary" rows={[
                { label: 'Loan Amount',    value: fmt(amount, sym),        color: catColor },
                { label: 'Total Interest', value: fmt(totalInterest, sym), color: '#ef4444' },
                { label: 'Total Payment',  value: fmt(totalPayment, sym),  color: catColor, bold: true, highlight: true },
              ]} />

              {/* Area chart */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Principal vs Balance Over Time
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={v => [fmtK(v, sym)]}
                      contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="paid"      stroke="#10b981" fill="#10b98130" strokeWidth={2} name="Principal Paid" />
                    <Area type="monotone" dataKey="principal" stroke={catColor} fill={catColor + '15'} strokeWidth={2} name="Remaining Balance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <AIHintCard hint={hint} />
            </>
          }
        />
      </div>

      {/* ── Real World Examples ── */}
      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{
              padding: '14px', borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left',
              transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  ['Amount',  `${sym}${ex.amount.toLocaleString()}`],
                  ['Rate',    `${ex.rate}%`],
                  ['Term',    `${ex.termYrs} yrs`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: catColor }}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Formula Explained ── */}
      <Section title="Formula Explained" subtitle="The math behind EMI calculation">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { symbol: 'EMI', meaning: 'Equated Monthly Instalment — your fixed monthly payment' },
            { symbol: 'P',   meaning: 'Principal — the original loan amount'                    },
            { symbol: 'r',   meaning: 'Monthly interest rate = Annual rate ÷ 12 ÷ 100'         },
            { symbol: 'n',   meaning: 'Total number of monthly payments = Years × 12'           },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 40, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          An EMI splits your loan into equal monthly payments that cover both interest and principal. Early payments are interest-heavy — as the balance reduces, more of each EMI goes toward principal. This is called an amortizing loan structure.
        </p>
      </Section>

      {/* ── Key Terms ── */}
      <Section title="Key Terms" subtitle="Loan and EMI terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => (
            <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />
          ))}
        </div>
      </Section>

      {/* ── Amortization Schedule ── */}
      <Section title="Amortization Schedule" subtitle="Year-by-year breakdown of principal, interest and balance">
        <AmortizationTable amount={amount} rate={rate} termYrs={termYrs} sym={sym} catColor={catColor} />
      </Section>

      {/* ── Comparison ── */}
      <Section title="How Small Changes Make a Big Difference" subtitle="Click any scenario to instantly compare">
        <ComparisonTool amount={amount} rate={rate} termYrs={termYrs} sym={sym} catColor={catColor} />
      </Section>

      {/* ── FAQ ── */}
      <Section title="Frequently Asked Questions" subtitle="Everything about EMI and loan repayment">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>

      {/* ── Glossary already shown above in Key Terms ── */}

    </div>
  )
}
