import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = (n, sym = '$') => n >= 1000 ? sym + (n / 1000).toFixed(0) + 'k' : fmt(n, sym)

// ── Real world examples ────────────────────────────────────
const EXAMPLES = [
  { title: 'Emergency Fund',    desc: '3 months of expenses saved in 1 year', goal: 10000, current: 500,  rate: 4,   months: 12  },
  { title: 'Down Payment',      desc: 'House deposit in 3 years',             goal: 60000, current: 5000, rate: 5,   months: 36  },
  { title: 'Dream Vacation',    desc: 'Travel fund in 18 months',             goal: 8000,  current: 1000, rate: 3.5, months: 18  },
]

// ── FAQ ────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'How is the required monthly saving calculated?',
    a: 'The calculator uses the future value of an annuity formula, solving backwards for the monthly payment (PMT). It accounts for the fact that your current savings will also grow with interest during the period. So the formula considers: how much will my existing savings grow to? Then it calculates what monthly contribution is needed to bridge the gap to your goal.',
  },
  {
    q: 'What interest rate should I use?',
    a: 'Use the actual rate offered by your savings vehicle. High-yield savings accounts currently offer 4–5% APY. Money market accounts offer similar rates. Index funds have historically returned ~10% annually but with higher volatility. For a conservative short-term goal (under 2 years), use 4–5%. For a long-term goal where you can invest in diversified funds, 6–8% is reasonable.',
  },
  {
    q: 'What if I can\'t save the required monthly amount?',
    a: 'You have three levers: extend the timeline (more months), reduce the goal, or increase your current savings (a lump sum boost). Even small changes to these inputs can dramatically reduce the required monthly saving. This calculator makes it easy to experiment — try adding 6 months to your timeline or starting with a larger initial amount.',
  },
  {
    q: 'Should I use a savings account or invest toward my goal?',
    a: 'It depends on your timeline and risk tolerance. For goals under 2–3 years, keep money in a high-yield savings account or money market — you can\'t afford a market downturn. For goals 5+ years away, investing in diversified funds typically makes more sense because the expected returns significantly outpace savings account rates over long periods.',
  },
  {
    q: 'How does compound interest help my savings goal?',
    a: 'Compound interest earns interest on your interest — your balance grows faster over time. The earlier you start and the higher the rate, the more compound interest helps. On a 36-month goal at 5%, interest contributes a modest boost. On a 10-year goal at 7%, interest can contribute more than half your final balance. This is why time is the most powerful variable in savings.',
  },
  {
    q: 'What is the difference between saving monthly vs lump sum?',
    a: 'A lump sum invested upfront benefits from more time in the market and maximises compound growth. Regular monthly savings (dollar-cost averaging) reduces timing risk and fits most people\'s cash flow better. This calculator assumes regular monthly contributions. If you have a lump sum available, increase your "current savings" field — it will reduce your required monthly saving significantly.',
  },
]

// ── Glossary ───────────────────────────────────────────────
const GLOSSARY = [
  { term: 'Savings Goal',        def: 'The target amount you want to accumulate by a specific date.' },
  { term: 'Present Value (PV)',  def: 'The current value of your savings — the starting point for growth calculations.' },
  { term: 'Future Value (FV)',   def: 'The value your savings will grow to at the end of the period, including interest.' },
  { term: 'PMT',                 def: 'Payment — the fixed monthly amount you contribute toward your goal.' },
  { term: 'APY',                 def: 'Annual Percentage Yield — the real rate of return on your savings, accounting for compounding.' },
  { term: 'Compounding',         def: 'Earning interest on both your principal and previously earned interest. More frequent compounding = more growth.' },
  { term: 'Emergency Fund',      def: 'A savings goal specifically for unexpected expenses — typically 3–6 months of living expenses.' },
  { term: 'Dollar-Cost Averaging', def: 'Investing a fixed amount regularly regardless of market conditions, reducing the impact of volatility.' },
]

// ── Field Input ────────────────────────────────────────────
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
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
function ComparisonTool({ goal, current, rate, months, sym, catColor }) {
  const [activeIdx, setActiveIdx] = useState(2)

  function calcMonthly(g, c, r, m) {
    const mr = r / 100 / 12
    if (mr === 0) return Math.max(0, (g - c) / m)
    const factor = (Math.pow(1 + mr, m) - 1) / mr
    const growthOnCurrent = c * Math.pow(1 + mr, m)
    return Math.max(0, (g - growthOnCurrent) / factor)
  }

  const base = calcMonthly(goal, current, rate, months)

  const scenarios = [
    { label: '6 months sooner',  emoji: '🚀', desc: `Reach goal in ${Math.max(1, months - 6)} months`,     g: goal,        c: current, r: rate,       m: Math.max(1, months - 6) },
    { label: '6 months later',   emoji: '📅', desc: `Extend to ${months + 6} months`,                      g: goal,        c: current, r: rate,       m: months + 6              },
    { label: 'Current plan',     emoji: '📍', desc: `${sym}${goal.toLocaleString()} in ${months} months`,   g: goal,        c: current, r: rate,       m: months, isCurrent: true  },
    { label: '1% higher rate',   emoji: '📈', desc: `Rate at ${rate + 1}%`,                                 g: goal,        c: current, r: rate + 1,   m: months                  },
    { label: '10% bigger goal',  emoji: '🎯', desc: `Target ${sym}${Math.round(goal * 1.1).toLocaleString()}`, g: goal * 1.1, c: current, r: rate,    m: months                  },
    { label: 'Double start',     emoji: '💰', desc: `Start with ${sym}${Math.round(current * 2).toLocaleString()}`, g: goal, c: current * 2, r: rate, m: months                  },
  ]

  const active      = scenarios[activeIdx]
  const activeMonthly = calcMonthly(active.g, active.c, active.r, active.m)
  const diff        = activeMonthly - base
  const easier      = diff <= 0

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Small changes to your timeline, interest rate or starting amount can dramatically lower your required monthly saving. Click any scenario to see the impact instantly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const m = calcMonthly(s.g, s.c, s.r, s.m)
          const d = m - base
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
                {sym}{Math.round(m).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {!s.isCurrent && (
                <div style={{ fontSize: 10, fontWeight: 600, color: d <= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {d <= 0 ? `Save ${sym}${Math.abs(Math.round(d)).toLocaleString()} less/mo` : `${sym}${Math.abs(Math.round(d)).toLocaleString()} more/mo`}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {!active.isCurrent && (
        <div style={{ padding: '16px 18px', borderRadius: 12, background: easier ? '#10b98108' : '#ef444408', border: `1.5px solid ${easier ? '#10b98130' : '#ef444430'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{active.emoji} {active.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                {easier
                  ? `With this scenario you only need to save ${sym}${Math.round(activeMonthly).toLocaleString()}/month — that's ${sym}${Math.abs(Math.round(diff)).toLocaleString()} less per month than your current plan.`
                  : `This scenario requires ${sym}${Math.round(activeMonthly).toLocaleString()}/month — ${sym}${Math.abs(Math.round(diff)).toLocaleString()} more per month than your current plan.`
                }
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: easier ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {easier ? '−' : '+'}{sym}{Math.abs(Math.round(diff)).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>per month</div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${easier ? '#10b98130' : '#ef444430'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Your current plan', monthly: base,          isCurrent: true  },
              { label: active.label,         monthly: activeMonthly, isCurrent: false },
            ].map((row, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: row.isCurrent ? catColor + '0d' : (easier ? '#10b98108' : '#ef444408'), border: `1px solid ${row.isCurrent ? catColor + '30' : (easier ? '#10b98130' : '#ef444430')}` }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: row.isCurrent ? catColor : (easier ? '#10b981' : '#ef4444'), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {sym}{Math.round(row.monthly).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>/mo</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                  Total: {sym}{Math.round(row.monthly * (active.m || months)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.isCurrent && (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: catColor + '08', border: `1px solid ${catColor}25`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          📍 Your current plan requires {sym}{Math.round(base).toLocaleString()}/month to reach {sym}{goal.toLocaleString()} in {months} months. Click any scenario above to explore how changes affect your required saving.
        </div>
      )}
    </div>
  )
}

// ── Progress Tracker ───────────────────────────────────────
function ProgressTracker({ goal, current, monthly, months, rate, sym, catColor }) {
  const pct = Math.min(100, goal > 0 ? (current / goal) * 100 : 0)
  const remaining = Math.max(0, goal - current)
  const mr = rate / 100 / 12

  // Milestones: 25%, 50%, 75%, 100%
  const milestones = [25, 50, 75, 100].map(p => {
    const target = goal * p / 100
    if (current >= target) return { pct: p, reached: true, months: 0 }
    const gap = target - current
    // How many months to reach this milestone?
    let m = 0
    if (mr === 0) {
      m = Math.ceil(gap / monthly)
    } else {
      // Solve: current*(1+r)^m + monthly*((1+r)^m-1)/r = target
      // Approximate numerically
      let bal = current
      while (bal < target && m < 1200) { bal = bal * (1 + mr) + monthly; m++ }
      m = Math.min(m, months)
    }
    return { pct: p, reached: false, months: m, date: new Date(Date.now() + m * 30.44 * 24 * 3600 * 1000).toLocaleDateString('en', { month: 'short', year: 'numeric' }) }
  })

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
            {sym}{Math.round(current).toLocaleString()} saved
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: catColor, fontFamily: "'DM Sans', sans-serif" }}>
            {pct.toFixed(1)}% of {sym}{goal.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 10, background: 'var(--bg-raised)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: catColor, borderRadius: 5, transition: 'width .4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>0</span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{sym}{goal.toLocaleString()}</span>
        </div>
      </div>

      {/* Milestone timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 10, textAlign: 'center', background: m.reached ? catColor + '15' : 'var(--bg-raised)', border: `1px solid ${m.reached ? catColor + '40' : 'var(--border)'}` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: m.reached ? catColor : 'var(--text-3)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 3 }}>
              {m.pct}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.reached ? catColor : 'var(--text)', fontFamily: "'DM Sans', sans-serif", marginBottom: 2 }}>
              {sym}{Math.round(goal * m.pct / 100).toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: m.reached ? catColor : 'var(--text-3)' }}>
              {m.reached ? '✓ Reached' : m.date || `~${m.months} mo`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────
export default function SavingsGoal({ meta, category }) {
  const [goal,     setGoal]     = useState(20000)
  const [current,  setCurrent]  = useState(2000)
  const [rate,     setRate]     = useState(4)
  const [months,   setMonths]   = useState(24)
  const [timeMode, setTimeMode] = useState('months') // 'months' | 'years'
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)

  const sym      = currency.symbol
  const catColor = category?.color || '#6366f1'

  const r         = rate / 100 / 12
  const remaining = Math.max(0, goal - current)

  let monthly = 0
  if (r === 0) {
    monthly = remaining / months
  } else {
    const factor = (Math.pow(1 + r, months) - 1) / r
    const growthOnCurrent = current * Math.pow(1 + r, months)
    monthly = Math.max(0, (goal - growthOnCurrent) / factor)
  }

  const totalSaved     = monthly * months
  const interestEarned = Math.max(0, goal - current - totalSaved)
  const yrs            = months / 12

  // Chart data
  const chartData = Array.from({ length: Math.min(months, 36) }, (_, i) => {
    const m = Math.round((i + 1) * months / Math.min(months, 36))
    const v = r === 0
      ? current + monthly * m
      : current * Math.pow(1 + r, m) + monthly * (Math.pow(1 + r, m) - 1) / r
    return { month: m > 12 ? `Y${Math.ceil(m / 12)}` : `M${m}`, value: Math.round(Math.min(v, goal * 1.02)) }
  })

  const hint = `Save ${fmt(monthly, sym)}/month for ${months} months to reach your ${fmt(goal, sym)} goal. You'll contribute ${fmt(totalSaved, sym)} and earn ${fmt(interestEarned, sym)} in interest.`

  function applyExample(ex) {
    setGoal(ex.goal); setCurrent(ex.current); setRate(ex.rate); setMonths(ex.months)
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
                Your Savings Goal
              </div>

              <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

              <FieldInput label="Goal Amount"           hint="Target savings"    value={goal}    onChange={setGoal}    prefix={sym} min={1}   catColor={catColor} />
              <FieldInput label="Current Savings"       hint="Already saved"    value={current} onChange={setCurrent} prefix={sym} min={0}   catColor={catColor} />
              <FieldInput label="Annual Interest Rate"  hint="Expected return"  value={rate}    onChange={setRate}    suffix="%"   min={0} max={30} step={0.25} catColor={catColor} />

              {/* Time to reach goal — Month / Year toggle */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                    Time to Reach Goal
                  </label>
                  {/* Mode toggle */}
                  <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${catColor}40` }}>
                    {[['months', 'Months'], ['years', 'Years']].map(([mode, label]) => (
                      <button key={mode} onClick={() => setTimeMode(mode)} style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: timeMode === mode ? catColor : 'transparent',
                        color: timeMode === mode ? '#fff' : catColor,
                        transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-input, var(--bg-card))',
                  border: `1.5px solid var(--border)`,
                  borderRadius: 8, overflow: 'hidden', height: 38,
                }}>
                  {/* − button */}
                  <button
                    onClick={() => {
                      if (timeMode === 'months') setMonths(m => Math.max(1, m - 1))
                      else setMonths(m => Math.max(12, m - 12))
                    }}
                    style={{ width: 38, height: '100%', border: 'none', background: catColor + '12', color: catColor, fontWeight: 700, cursor: 'pointer', fontSize: 16, flexShrink: 0, borderRight: `1px solid var(--border)` }}>
                    −
                  </button>

                  <input
                    type="text" inputMode="numeric"
                    key={timeMode}
                    value={timeMode === 'months' ? months : Math.round(months / 12 * 10) / 10}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (isNaN(v) || v <= 0) return
                      setMonths(timeMode === 'months' ? Math.round(v) : Math.round(v * 12))
                    }}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}
                  />

                  <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, paddingRight: 8 }}>
                    {timeMode === 'months' ? 'mo' : 'yrs'}
                  </span>

                  {/* + button */}
                  <button
                    onClick={() => {
                      if (timeMode === 'months') setMonths(m => m + 1)
                      else setMonths(m => m + 12)
                    }}
                    style={{ width: 38, height: '100%', border: 'none', background: catColor + '12', color: catColor, fontWeight: 700, cursor: 'pointer', fontSize: 16, flexShrink: 0, borderLeft: `1px solid var(--border)` }}>
                    +
                  </button>
                </div>

                {/* Conversion hint */}
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
                  {timeMode === 'months'
                    ? `= ${yrs < 1 ? `${months} months` : yrs % 1 === 0 ? `${yrs} year${yrs > 1 ? 's' : ''}` : `${yrs.toFixed(1)} years`}`
                    : `= ${months} months`
                  }
                </div>
              </div>

              {/* Live preview */}
              <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }}>Monthly saving needed</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: catColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {sym}{Math.round(monthly).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (current / goal) * 100)}%`, background: catColor, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                  {((current / goal) * 100).toFixed(1)}% saved · {sym}{Math.round(remaining).toLocaleString()} to go
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity .12s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Calculate →
                </button>
                <button onClick={() => { setGoal(20000); setCurrent(2000); setRate(4); setMonths(24) }}
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
                label="Monthly Saving Needed"
                value={Math.round(monthly)}
                formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
                sub={`To reach ${fmt(goal, sym)} in ${months} months`}
                color={catColor}
              />

              <BreakdownTable title="Savings Plan" rows={[
                { label: 'Goal Amount',         value: fmt(goal, sym)                              },
                { label: 'Already Saved',        value: fmt(current, sym),       color: catColor   },
                { label: 'Still Needed',         value: fmt(remaining, sym)                        },
                { label: 'Monthly Saving',       value: fmt(monthly, sym),       color: catColor, bold: true },
                { label: 'Total Contributions',  value: fmt(totalSaved, sym)                       },
                { label: 'Interest Earned',      value: fmt(interestEarned, sym),color: '#10b981'  },
              ]} />

              {/* Savings progress chart */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Savings Progress
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis hide />
                    <Tooltip formatter={v => [fmtK(v, sym), 'Balance']} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="value" stroke={catColor} fill={catColor + '20'} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <AIHintCard hint={hint} />
            </>
          }
        />
      </div>

      {/* ── Progress Tracker ── */}
      <Section title="Goal Progress Tracker" subtitle="Milestones on your way to the finish line">
        <ProgressTracker goal={goal} current={current} monthly={monthly} months={months} rate={rate} sym={sym} catColor={catColor} />
      </Section>

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
                {[['Goal', `${sym}${ex.goal.toLocaleString()}`], ['Saved', `${sym}${ex.current.toLocaleString()}`], ['Rate', `${ex.rate}%`], ['Time', `${ex.months} mo`]].map(([k, v]) => (
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
      <Section title="Formula Explained" subtitle="The math behind your required monthly saving">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          PMT = (Goal − PV × (1+r)^n) / [((1+r)^n − 1) / r]
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { symbol: 'PMT',  meaning: 'Required monthly saving'                 },
            { symbol: 'Goal', meaning: 'Target savings amount'                   },
            { symbol: 'PV',   meaning: 'Current savings (present value)'         },
            { symbol: 'r',    meaning: 'Monthly rate = Annual rate ÷ 12 ÷ 100'  },
            { symbol: 'n',    meaning: 'Number of months to reach goal'          },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 36, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          This formula solves for the monthly payment needed so that your existing savings (growing with interest) plus regular contributions (also growing with interest) exactly equal your goal at the end of the period. It uses the future value of an annuity formula, solved backwards for PMT.
        </p>
      </Section>

      {/* ── Key Terms ── */}
      <Section title="Key Terms" subtitle="Savings terminology explained — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      {/* ── Comparison ── */}
      <Section title="Explore Different Scenarios" subtitle="Click any scenario to see how changes affect your monthly saving">
        <ComparisonTool goal={goal} current={current} rate={rate} months={months} sym={sym} catColor={catColor} />
      </Section>

      {/* ── FAQ ── */}
      <Section title="Frequently Asked Questions" subtitle="Everything about savings goals and compound interest">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>

    </div>
  )
}
