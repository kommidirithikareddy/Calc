import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = (n, sym = '$') => n >= 1000 ? sym + (n / 1000).toFixed(0) + 'k' : fmt(n, sym)

// ── Real world examples ────────────────────────────────────
const EXAMPLES = [
  { title: 'First Home',       desc: 'Starter home, 10% down',          price: 280000, down: 10, rate: 6.5,  termYrs: 30, tax: 200, insurance: 80  },
  { title: 'Family Home',      desc: 'Suburban 4-bed, 20% down',        price: 450000, down: 20, rate: 6.5,  termYrs: 30, tax: 350, insurance: 120 },
  { title: 'Luxury Property',  desc: 'High-end property, 25% down',     price: 900000, down: 25, rate: 6.75, termYrs: 30, tax: 800, insurance: 250 },
]

// ── FAQ ────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is included in a monthly mortgage payment?',
    a: 'A full mortgage payment typically has four components — called PITI: Principal (paying down the loan balance), Interest (cost of borrowing), Taxes (property tax, usually 1/12th of the annual bill), and Insurance (homeowner\'s insurance). If your down payment is under 20%, PMI (Private Mortgage Insurance) is also added, typically 0.5–1% of the loan per year.',
  },
  {
    q: 'What is PMI and how do I avoid it?',
    a: 'PMI (Private Mortgage Insurance) protects the lender if you default. It\'s required when your down payment is less than 20% of the home price and typically costs 0.5–1% of the loan amount per year. You can avoid it by putting 20% down, using a piggyback loan (80/10/10), or requesting cancellation once your equity reaches 20% (required by law at 22% equity).',
  },
  {
    q: 'Should I choose a 15-year or 30-year mortgage?',
    a: 'A 15-year mortgage has higher monthly payments but you pay dramatically less interest — often 50–60% less total interest than a 30-year. A 30-year mortgage offers lower monthly payments and flexibility. The right choice depends on your cash flow: if you can comfortably afford the 15-year payment, it builds equity faster and saves a substantial amount in interest.',
  },
  {
    q: 'What is the difference between interest rate and APR?',
    a: 'The interest rate is the annual cost of the loan itself. APR (Annual Percentage Rate) includes the interest rate plus all lender fees — origination fees, points, mortgage broker fees — expressed as a yearly rate. APR is always equal to or higher than the interest rate and is the true cost of the loan for comparison purposes.',
  },
  {
    q: 'How does a down payment affect my mortgage?',
    a: 'A larger down payment reduces your loan amount (meaning lower monthly payments), eliminates PMI when 20% or more, reduces total interest paid over the loan life, and gives you immediate equity. However, it also reduces your liquid savings. The sweet spot for most buyers is 20% — enough to avoid PMI without over-depleting savings.',
  },
  {
    q: 'What is amortization and why does it matter?',
    a: 'Amortization is the process of paying off a loan through scheduled payments. Because interest is calculated on the outstanding balance, early payments are mostly interest — on a 30-year mortgage, your first payment might be 85% interest and only 15% principal. As the balance decreases, more of each payment goes to principal. This is why making extra payments early has an outsized impact on total interest paid.',
  },
]

// ── Glossary ───────────────────────────────────────────────
const GLOSSARY = [
  { term: 'Principal',         def: 'The outstanding loan balance — the amount you still owe to the lender, excluding interest.' },
  { term: 'Amortization',      def: 'The process of paying off a loan through regular installments that cover both principal and interest over the loan term.' },
  { term: 'PMI',               def: 'Private Mortgage Insurance — required when down payment is under 20%. Protects the lender, not you. Costs 0.5–1% of loan annually.' },
  { term: 'Down Payment',      def: 'The upfront cash payment toward the home purchase. Expressed as a percentage of the purchase price.' },
  { term: 'Equity',            def: 'Your ownership stake in the property — the difference between the home\'s current value and your outstanding mortgage balance.' },
  { term: 'Escrow',            def: 'An account held by the lender where property taxes and insurance premiums are collected monthly alongside your mortgage payment.' },
  { term: 'APR',               def: 'Annual Percentage Rate — the true yearly cost of the mortgage including interest and all lender fees.' },
  { term: 'LTV Ratio',         def: 'Loan-to-Value ratio — your loan amount divided by the home\'s value. Below 80% LTV eliminates PMI requirement.' },
]

// ── Field Input ────────────────────────────────────────────
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, step = 1, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)
  useEffect(() => { if (!focused) setRaw(String(value)) }, [value, focused])
  return (
    <div style={{ marginBottom: 14 }}>
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
        <input type="text" inputMode="decimal"
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
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: catColor, flexShrink: 0, transition: 'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span>
      </button>
      {isOpen && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>{a}</p>}
    </div>
  )
}

// ── Glossary Term ──────────────────────────────────────────
function GlossaryTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ padding: '9px 12px', borderRadius: 8, cursor: 'pointer', background: open ? catColor + '10' : 'var(--bg-raised)', border: `1px solid ${open ? catColor + '30' : 'var(--border)'}`, transition: 'all .15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: open ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{term}</span>
        <span style={{ fontSize: 14, color: catColor, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '7px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{def}</p>}
    </div>
  )
}

// ── Section ────────────────────────────────────────────────
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
function ComparisonTool({ price, down, rate, termYrs, tax, insurance, sym, catColor }) {
  const [activeIdx, setActiveIdx] = useState(2)

  function calc(p, d, r, t) {
    const loan = p * (1 - d / 100)
    const mr = r / 100 / 12
    const n = t * 12
    const pi = mr === 0 ? loan / n : loan * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1)
    const pmi = d < 20 ? loan * 0.005 / 12 : 0
    const totalInt = pi * n - loan
    return { monthly: pi + tax + insurance + pmi, pi, totalInt, loan }
  }

  const base = calc(price, down, rate, termYrs)

  const scenarios = [
    { label: '15-year term',    emoji: '⚡', desc: 'Pay off in half the time',              p: price, d: down,     r: rate,       t: 15           },
    { label: '1% lower rate',   emoji: '📉', desc: `Rate at ${Math.max(0.5, rate - 1)}%`,  p: price, d: down,     r: Math.max(0.5, rate - 1), t: termYrs },
    { label: 'Current plan',    emoji: '📍', desc: `${sym}${price.toLocaleString()} home`,  p: price, d: down,     r: rate,       t: termYrs, isCurrent: true },
    { label: '5% more down',    emoji: '💰', desc: `${down + 5}% down payment`,             p: price, d: down + 5, r: rate,       t: termYrs      },
    { label: '1% higher rate',  emoji: '📈', desc: `Rate at ${rate + 1}%`,                  p: price, d: down,     r: rate + 1,   t: termYrs      },
    { label: '30-year vs 15yr', emoji: '📅', desc: 'Compare both terms side by side',       p: price, d: down,     r: rate,       t: termYrs === 30 ? 15 : 30 },
  ]

  const active   = scenarios[activeIdx]
  const activeR  = calc(active.p, active.d, active.r, active.t)
  const monthlyDiff = activeR.monthly - base.monthly
  const intDiff     = activeR.totalInt - base.totalInt
  const saved       = intDiff < 0

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Small changes to rate, term or down payment can mean tens of thousands of dollars difference over the life of your mortgage. Click any scenario to see the impact instantly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const r = calc(s.p, s.d, s.r, s.t)
          const iD = r.totalInt - base.totalInt
          const isActive = activeIdx === i
          return (
            <button key={i} onClick={() => setActiveIdx(i)} style={{ padding: '12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${isActive ? catColor : 'var(--border)'}`, background: isActive ? catColor + '0d' : 'var(--bg-raised)', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
                {s.isCurrent && <span style={{ fontSize: 9, fontWeight: 700, background: catColor, color: '#fff', padding: '1px 5px', borderRadius: 6, marginLeft: 'auto' }}>YOU</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 7, lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? catColor : 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {sym}{Math.round(r.monthly).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {!s.isCurrent && (
                <div style={{ fontSize: 10, fontWeight: 600, color: iD <= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {iD <= 0 ? 'Save ' : 'Pay '}{sym}{Math.abs(Math.round(iD)).toLocaleString()} interest
                </div>
              )}
            </button>
          )
        })}
      </div>

      {!active.isCurrent && (
        <div style={{ padding: '16px 18px', borderRadius: 12, background: saved ? '#10b98108' : '#ef444408', border: `1.5px solid ${saved ? '#10b98130' : '#ef444430'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{active.emoji} {active.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                {saved
                  ? `Your monthly payment would be ${sym}${Math.round(activeR.monthly).toLocaleString()} and you'd save ${sym}${Math.abs(Math.round(intDiff)).toLocaleString()} in total interest over the life of the loan.`
                  : `Your monthly payment would be ${sym}${Math.round(activeR.monthly).toLocaleString()} — ${sym}${Math.abs(Math.round(monthlyDiff)).toLocaleString()} more per month — but you'd pay ${sym}${Math.abs(Math.round(intDiff)).toLocaleString()} more in total interest.`
                }
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: saved ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {saved ? 'Save ' : 'Extra '}{sym}{Math.abs(Math.round(intDiff)).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>in total interest</div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${saved ? '#10b98130' : '#ef444430'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Your current plan', r: base,    isCurrent: true  },
              { label: active.label,         r: activeR, isCurrent: false },
            ].map((row, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: row.isCurrent ? catColor + '0d' : (saved ? '#10b98108' : '#ef444408'), border: `1px solid ${row.isCurrent ? catColor + '30' : (saved ? '#10b98130' : '#ef444430')}` }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: row.isCurrent ? catColor : (saved ? '#10b981' : '#ef4444'), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {sym}{Math.round(row.r.monthly).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>Total interest: {sym}{Math.round(row.r.totalInt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.isCurrent && (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: catColor + '08', border: `1px solid ${catColor}25`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          📍 This is your current mortgage plan — {sym}{Math.round(base.monthly).toLocaleString()}/month with {sym}{Math.round(base.totalInt).toLocaleString()} in total interest. Click any scenario above to explore how changes affect your total cost.
        </div>
      )}
    </div>
  )
}

// ── Amortization Schedule ──────────────────────────────────
function AmortizationTable({ loanAmt, rate, termYrs, sym, catColor }) {
  const [showAll, setShowAll] = useState(false)
  const mr = rate / 100 / 12
  const tm = termYrs * 12
  const emi = mr === 0 ? loanAmt / tm : loanAmt * mr * Math.pow(1 + mr, tm) / (Math.pow(1 + mr, tm) - 1)
  const rows = []
  let balance = loanAmt, cumInt = 0, cumPrin = 0
  for (let m = 1; m <= tm; m++) {
    const intPaid  = balance * mr
    const prinPaid = Math.min(emi - intPaid, balance)
    balance = Math.max(0, balance - prinPaid)
    cumInt  += intPaid
    cumPrin += prinPaid
    if (m % 12 === 0 || m === tm) {
      rows.push({ period: `Year ${Math.ceil(m / 12)}`, emi: Math.round(emi), principal: Math.round(cumPrin), interest: Math.round(cumInt), balance: Math.round(balance) })
      cumInt = 0; cumPrin = 0
    }
  }
  const visible = showAll ? rows : rows.slice(0, 5)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr>{['Period','P&I Payment','Principal','Interest','Balance'].map((h, i) => (
            <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk', sans-serif" }}>{h}</th>
          ))}</tr>
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
        <button onClick={() => setShowAll(s => !s)} style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 8, border: `1px solid ${catColor}40`, background: catColor + '08', color: catColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          {showAll ? 'Show less ↑' : `Show all ${rows.length} years ↓`}
        </button>
      )}
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────
export default function MortgageCalculator({ meta, category }) {
  const [price,     setPrice]     = useState(350000)
  const [down,      setDown]      = useState(20)       // always stored as %
  const [downMode,  setDownMode]  = useState('pct')    // 'pct' | 'amt'
  const [rate,      setRate]      = useState(6.5)
  const [termYrs,   setTermYrs]   = useState(30)
  const [tax,       setTax]       = useState(300)
  const [insurance, setInsurance] = useState(100)
  const [currency,  setCurrency]  = useState(CURRENCIES[0])
  const [openFaq,   setOpenFaq]   = useState(null)
  const calcRef = useRef(null)

  const sym      = currency.symbol
  const catColor = category?.color || '#6366f1'

  // down is always stored as %, compute amount from it
  const downAmt  = Math.round(price * down / 100)
  const downPct  = down

  const loanAmt = price * (1 - down / 100)
  const r       = rate / 100 / 12
  const n       = termYrs * 12
  const pi      = r === 0 ? loanAmt / n : loanAmt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const pmi     = down < 20 ? loanAmt * 0.005 / 12 : 0
  const totalMonthly = pi + tax + insurance + pmi
  const totalPaid    = pi * n
  const totalInt     = totalPaid - loanAmt
  const ltv          = ((loanAmt / price) * 100).toFixed(1)

  // Chart data
  const chartData = []
  let bal = loanAmt
  for (let m = 1; m <= n; m++) {
    const intPaid  = bal * r
    const prinPaid = pi - intPaid
    bal -= prinPaid
    if (m % 12 === 0 || m === n) {
      chartData.push({ year: `Y${Math.ceil(m / 12)}`, principal: Math.round(Math.max(0, bal)), paid: Math.round(loanAmt - Math.max(0, bal)) })
    }
  }

  // Monthly breakdown for pie
  const pieData = [
    { name: 'Principal & Interest', value: Math.round(pi),        color: catColor   },
    { name: 'Property Tax',         value: Math.round(tax),       color: '#10b981'  },
    { name: 'Insurance',            value: Math.round(insurance), color: '#f59e0b'  },
    ...(pmi > 0 ? [{ name: 'PMI', value: Math.round(pmi), color: '#ef4444' }] : []),
  ]

  const hint = `Your monthly mortgage payment is ${fmt(pi, sym)} (P&I). With taxes and insurance, total monthly cost is ${fmt(totalMonthly, sym)}. Over ${termYrs} years you pay ${fmt(totalInt, sym)} in interest — ${((totalInt / loanAmt) * 100).toFixed(0)}% of the loan amount. LTV ratio: ${ltv}%.`

  function applyExample(ex) {
    setPrice(ex.price); setDown(ex.down); setRate(ex.rate)
    setTermYrs(ex.termYrs); setTax(ex.tax); setInsurance(ex.insurance)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Main calc ── */}
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
                Mortgage Details
              </div>

              <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

              <FieldInput label="Home Price"           hint="Purchase price"        value={price}     onChange={setPrice}     prefix={sym} min={10000}  catColor={catColor} />

              {/* Down Payment — toggle between % and fixed amount */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                    Down Payment
                  </label>
                  <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${catColor}40` }}>
                    {[['pct', '%'], ['amt', sym]].map(([mode, label]) => (
                      <button key={mode}
                        onClick={() => setDownMode(mode)}
                        style={{
                          padding: '3px 10px', fontSize: 11, fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                          background: downMode === mode ? catColor : 'transparent',
                          color: downMode === mode ? '#fff' : catColor,
                          transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-input, var(--bg-card))',
                  border: `1.5px solid var(--border)`,
                  borderRadius: 8, padding: '0 10px', height: 38,
                }}>
                  {downMode === 'amt' && (
                    <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{sym}</span>
                  )}
                  <input
                    type="text"
                    inputMode="decimal"
                    key={downMode}
                    defaultValue={downMode === 'pct' ? down : downAmt}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (isNaN(v) || v < 0) return
                      if (downMode === 'pct') {
                        setDown(Math.min(100, v))
                      } else {
                        if (price > 0) setDown(Math.min(100, (v / price) * 100))
                      }
                    }}
                    style={{
                      flex: 1, border: 'none', background: 'transparent',
                      fontSize: 13, fontWeight: 600, color: 'var(--text)',
                      padding: 0, outline: 'none', minWidth: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  {downMode === 'pct' && (
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>%</span>
                  )}
                </div>

                {/* Live conversion hint */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'DM Sans', sans-serif" }}>
                    {downMode === 'pct'
                      ? `Amount: ${sym}${downAmt.toLocaleString()}`
                      : `Percentage: ${downPct.toFixed(1)}%`
                    }
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: down < 20 ? '#ef4444' : '#10b981', fontFamily: "'DM Sans', sans-serif" }}>
                    {down < 20 ? `${(20 - down).toFixed(1)}% more to avoid PMI` : '✓ No PMI required'}
                  </span>
                </div>
              </div>
              <FieldInput label="Annual Interest Rate" hint="Fixed rate"            value={rate}      onChange={setRate}      suffix="%"   min={0} max={20}  step={0.125} catColor={catColor} />
              <FieldInput label="Loan Term"            hint="Years"                 value={termYrs}   onChange={setTermYrs}   suffix="yrs" min={1} max={30} catColor={catColor} />
              <FieldInput label="Monthly Property Tax" hint="Estimate"              value={tax}       onChange={setTax}       prefix={sym} min={0} catColor={catColor} />
              <FieldInput label="Monthly Insurance"    hint="Homeowner's insurance" value={insurance} onChange={setInsurance} prefix={sym} min={0} catColor={catColor} />

              {/* PMI notice */}
              {down < 20 && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#ef444410', border: '1px solid #ef444430', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', marginBottom: 2 }}>⚠️ PMI Required</div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Down payment under 20% — PMI of {sym}{Math.round(pmi)}/mo added ({ltv}% LTV). Put 20% down to eliminate it.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity .12s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Calculate →
                </button>
                <button onClick={() => { setPrice(350000); setDown(20); setDownMode('pct'); setRate(6.5); setTermYrs(30); setTax(300); setInsurance(100) }}
                  style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>
                  Reset
                </button>
              </div>
            </>
          }

          right={
            <>
              <ResultHero
                label="Total Monthly Payment"
                value={Math.round(totalMonthly)}
                formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
                sub={`P&I: ${fmt(pi, sym)} · Tax: ${fmt(tax, sym)} · Ins: ${fmt(insurance, sym)}${pmi > 0 ? ` · PMI: ${fmt(pmi, sym)}` : ''}`}
                color={catColor}
              />

              <BreakdownTable title="Loan Summary" rows={[
                { label: 'Home Price',              value: fmt(price, sym)                                          },
                { label: `Down (${down}%)`,         value: fmt(price * down / 100, sym), color: '#10b981'          },
                { label: 'Loan Amount',             value: fmt(loanAmt, sym)                                        },
                { label: 'Monthly P&I',             value: fmt(pi, sym),                 color: catColor, bold: true },
                { label: 'Total Interest',          value: fmt(totalInt, sym),           color: '#ef4444'            },
                { label: 'Total Cost',              value: fmt(totalPaid + tax * n + insurance * n, sym), color: catColor, highlight: true, bold: true },
              ]} />

              {/* Monthly payment pie breakdown */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Monthly Payment Breakdown
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <PieChart width={90} height={90}>
                    <Pie data={pieData} cx={40} cy={40} innerRadius={25} outerRadius={42} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{sym}{d.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amortization chart */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Equity vs Balance Over Time
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={chartData.filter((_, i) => i % 2 === 0 || i === chartData.length - 1)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis hide />
                    <Tooltip formatter={v => [fmtK(v, sym)]} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="paid"      stroke="#10b981"  fill="#10b98125" strokeWidth={2} name="Equity Built" />
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
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: '14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[['Price', `${sym}${ex.price.toLocaleString()}`], ['Down', `${ex.down}%`], ['Rate', `${ex.rate}%`], ['Term', `${ex.termYrs} yrs`]].map(([k, v]) => (
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
      <Section title="Formula Explained" subtitle="The math behind your mortgage payment">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          M = P × r(1+r)^n / ((1+r)^n − 1)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { symbol: 'M', meaning: 'Monthly principal & interest payment'    },
            { symbol: 'P', meaning: 'Loan amount (home price − down payment)' },
            { symbol: 'r', meaning: 'Monthly rate = Annual rate ÷ 12 ÷ 100'  },
            { symbol: 'n', meaning: 'Total payments = Years × 12'             },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 20, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          This formula calculates only the principal and interest portion. Your actual monthly payment also includes property tax, homeowner's insurance, and PMI (if down payment is under 20%). These additional costs are added on top of the P&I payment.
        </p>
      </Section>

      {/* ── Key Terms ── */}
      <Section title="Key Terms" subtitle="Mortgage terminology explained — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      {/* ── Amortization Schedule ── */}
      <Section title="Amortization Schedule" subtitle="Year-by-year breakdown of principal, interest and remaining balance">
        <AmortizationTable loanAmt={loanAmt} rate={rate} termYrs={termYrs} sym={sym} catColor={catColor} />
      </Section>

      {/* ── Comparison ── */}
      <Section title="How Small Changes Make a Big Difference" subtitle="Click any scenario to instantly compare">
        <ComparisonTool price={price} down={down} rate={rate} termYrs={termYrs} tax={tax} insurance={insurance} sym={sym} catColor={catColor} />
      </Section>

      {/* ── FAQ ── */}
      <Section title="Frequently Asked Questions" subtitle="Everything about mortgages and home buying">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>

    </div>
  )
}
