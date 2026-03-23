import { useState, useCallback, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const FREQ_OPTIONS = [
  { label: 'Annually',  n: 1   },
  { label: 'Quarterly', n: 4   },
  { label: 'Monthly',   n: 12  },
  { label: 'Daily',     n: 365 },
]

// ── Real world examples ────────────────────────────────────
const EXAMPLES = [
  {
    title: 'College Student',
    desc: 'Saving $100/month from age 20',
    principal: 1000, rate: 7, years: 40, monthly: 100, freqIdx: 2,
  },
  {
    title: 'Mid-Career Investor',
    desc: '$50k lump sum, 20 years to go',
    principal: 50000, rate: 8, years: 20, monthly: 500, freqIdx: 2,
  },
  {
    title: 'Retirement Planning',
    desc: 'Conservative approach at 55',
    principal: 200000, rate: 5, years: 10, monthly: 1000, freqIdx: 2,
  },
]

// ── FAQ ────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is compound interest?',
    a: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only grows linearly, compound interest grows exponentially — your interest earns interest. This is why Einstein reportedly called it the eighth wonder of the world.',
  },
  {
    q: 'Why does compounding frequency matter?',
    a: 'The more frequently interest compounds, the more you earn. Daily compounding produces slightly more than monthly, which produces more than annual. For a $10,000 investment at 7% over 10 years: annual compounding gives $19,672, while daily compounding gives $20,138 — a meaningful difference at larger amounts.',
  },
  {
    q: 'What is the Rule of 72?',
    a: 'The Rule of 72 is a quick mental math shortcut: divide 72 by your annual interest rate to find how many years it takes to double your money. At 6% it doubles in 12 years (72÷6=12). At 9% it doubles in 8 years. This works because of how exponential growth behaves.',
  },
  {
    q: 'How does this calculator handle monthly contributions?',
    a: 'The calculator uses the future value of an annuity formula alongside the lump sum formula. Your monthly contributions are compounded at the same rate as your principal, added at the end of each period. This shows the combined power of a starting investment plus consistent saving.',
  },
  {
    q: 'What interest rate should I use?',
    a: 'For savings accounts, use the actual APY offered by your bank (typically 0.5–5%). For investment portfolios like index funds, the historical S&P 500 average is ~10% nominal or ~7% after inflation. For retirement planning, most advisors use 6–7%.',
  },
  {
    q: 'What is the difference between APR and APY?',
    a: 'APR (Annual Percentage Rate) is the simple annual rate without compounding. APY (Annual Percentage Yield) accounts for compounding and represents your actual return. At 7% APR compounded monthly, the APY is 7.23%. Banks advertise APY for savings and APR for loans.',
  },
]

// ── Glossary ───────────────────────────────────────────────
const GLOSSARY = [
  { term: 'Principal',           def: 'The initial amount of money you invest or deposit before any interest is earned.' },
  { term: 'Interest Rate',       def: 'The annual percentage rate at which your investment grows. Also called the nominal rate.' },
  { term: 'Compounding',         def: 'The process of reinvesting earned interest so it also earns interest in future periods.' },
  { term: 'APY',                 def: 'Annual Percentage Yield — the real rate of return accounting for compounding frequency.' },
  { term: 'APR',                 def: 'Annual Percentage Rate — the simple yearly rate without accounting for compounding.' },
  { term: 'Time Value of Money', def: 'The concept that money available today is worth more than the same amount in the future due to its earning potential.' },
  { term: 'Future Value',        def: 'The value of a current asset at a future date, based on an assumed rate of growth.' },
  { term: 'Rule of 72',          def: 'A shortcut formula: divide 72 by the interest rate to estimate how many years it takes to double your money.' },
]

// ── Formatters ─────────────────────────────────────────────
function fmt(n, sym) {
  return sym + Math.round(Math.max(0, n)).toLocaleString()
}
function fmtK(n, sym) {
  return n >= 1000 ? sym + (n / 1000).toFixed(0) + 'k' : fmt(n, sym)
}

// ── Number input field ─────────────────────────────────────
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, step = 1, catColor = '#6366f1' }) {
  // Use string state so user can freely delete/edit without being blocked
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)

  // Sync when parent resets value externally
  useEffect(() => {
    if (!focused) setRaw(String(value))
  }, [value, focused])

  function handleChange(e) {
    const str = e.target.value
    setRaw(str)
    const v = parseFloat(str)
    if (!isNaN(v) && str !== '' && str !== '-') {
      onChange(v)
    }
  }

  function handleBlur() {
    setFocused(false)
    const v = parseFloat(raw)
    if (isNaN(v) || raw === '') {
      setRaw(String(min))
      onChange(min)
    } else {
      const clamped = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v)
      setRaw(String(clamped))
      onChange(clamped)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </label>
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
        {prefix && (
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0, userSelect: 'none' }}>
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={focused ? raw : value}
          onChange={handleChange}
          onFocus={() => { setFocused(true); setRaw(String(value)) }}
          onBlur={handleBlur}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 600, color: 'var(--text)',
            padding: '0', outline: 'none', minWidth: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {suffix && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0, userSelect: 'none' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Accordion item ─────────────────────────────────────────
function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '14px 0', background: 'none',
          border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
          {q}
        </span>
        <span style={{
          fontSize: 18, color: '#6366f1', flexShrink: 0, fontWeight: 400,
          transition: 'transform .2s',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
          display: 'inline-block',
        }}>+</span>
      </button>
      {isOpen && (
        <p style={{
          fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75,
          margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif",
        }}>
          {a}
        </p>
      )}
    </div>
  )
}

// ── Glossary term ──────────────────────────────────────────
function GlossaryTerm({ term, def, catColor = '#6366f1' }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
        background: open ? catColor + '10' : 'var(--bg-raised)',
        border: `1px solid ${open ? catColor + '30' : 'var(--border)'}`,
        transition: 'all .15s',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: open ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
          {term}
        </span>
        <span style={{ fontSize: 14, color: catColor, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '7px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
          {def}
        </p>
      )}
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

// ── Interactive Comparison Tool ────────────────────────────
function ComparisonTool({ principal, monthly, n, sym, catColor, currentYears, currentRate }) {
  const [activeIdx, setActiveIdx] = useState(1) // default = current plan

  function calcAt(yrs, rate) {
    const r = rate / 100
    const f = Math.pow(1 + r / n, n * yrs)
    return Math.round(principal * f + (r > 0 ? monthly * (f - 1) / (r / n) : monthly * n * yrs))
  }

  const base = calcAt(currentYears, currentRate)

  const scenarios = [
    {
      label: '10 years earlier',
      emoji: '🚀',
      desc: `Started at ${Math.max(1, currentYears - 10)} yrs ago instead`,
      yrs: currentYears + 10,
      rate: currentRate,
    },
    {
      label: '5 years earlier',
      emoji: '⏩',
      desc: `Started 5 years sooner`,
      yrs: currentYears + 5,
      rate: currentRate,
    },
    {
      label: 'Current plan',
      emoji: '📍',
      desc: `Your plan: ${currentYears} yrs at ${currentRate}%`,
      yrs: currentYears,
      rate: currentRate,
      isCurrent: true,
    },
    {
      label: '5 years later',
      emoji: '⏪',
      desc: `Started 5 years later`,
      yrs: Math.max(1, currentYears - 5),
      rate: currentRate,
    },
    {
      label: '1% higher rate',
      emoji: '📈',
      desc: `Same plan at ${currentRate + 1}% rate`,
      yrs: currentYears,
      rate: currentRate + 1,
    },
    {
      label: '1% lower rate',
      emoji: '📉',
      desc: `Same plan at ${Math.max(0.5, currentRate - 1)}% rate`,
      yrs: currentYears,
      rate: Math.max(0.5, currentRate - 1),
    },
  ]

  const active = scenarios[activeIdx]
  const activeVal = calcAt(active.yrs, active.rate)
  const diff = activeVal - base
  const diffPct = base > 0 ? ((diff / base) * 100).toFixed(1) : '0'
  const gained = diff >= 0

  return (
    <div>
      {/* Intro text */}
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Timing is everything with compound interest. See what happens to your final balance if you had started earlier, waited longer, or earned a slightly different rate. Click any scenario below to instantly compare.
      </p>

      {/* Scenario cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const val = calcAt(s.yrs, s.rate)
          const d = val - base
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
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {s.label}
                </span>
                {s.isCurrent && (
                  <span style={{ fontSize: 9, fontWeight: 700, background: catColor, color: '#fff', padding: '1px 5px', borderRadius: 6, marginLeft: 'auto' }}>
                    YOU
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 7, lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? catColor : 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {sym}{val.toLocaleString()}
              </div>
              {!s.isCurrent && (
                <div style={{ fontSize: 10, fontWeight: 600, color: d >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {d >= 0 ? '+' : ''}{sym}{Math.abs(d).toLocaleString()}
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
          background: gained ? '#10b98108' : '#ef444408',
          border: `1.5px solid ${gained ? '#10b98130' : '#ef444430'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                {active.emoji} {active.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", maxWidth: 480 }}>
                {gained
                  ? `If you invested for ${active.yrs} years at ${active.rate}%, you'd end up with ${sym}${activeVal.toLocaleString()} — that's ${sym}${Math.abs(diff).toLocaleString()} more than your current plan. Starting early is the single most powerful move in investing.`
                  : `If you invested for ${active.yrs} years at ${active.rate}%, you'd end up with ${sym}${activeVal.toLocaleString()} — that's ${sym}${Math.abs(diff).toLocaleString()} less than your current plan. Every year you delay costs you more than you think.`
                }
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: gained ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {gained ? '+' : ''}{sym}{Math.abs(diff).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: gained ? '#10b981' : '#ef4444', background: gained ? '#10b98115' : '#ef444415', padding: '2px 10px', borderRadius: 20, marginTop: 4, display: 'inline-block' }}>
                {gained ? '+' : ''}{diffPct}% vs your plan
              </div>
            </div>
          </div>

          {/* Mini comparison table */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${gained ? '#10b98130' : '#ef444430'}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Your current plan', val: base,      years: currentYears, rate: currentRate, isCurrent: true  },
                { label: active.label,         val: activeVal, years: active.yrs,   rate: active.rate, isCurrent: false },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: r.isCurrent ? catColor + '0d' : (gained ? '#10b98108' : '#ef444408'),
                  border: `1px solid ${r.isCurrent ? catColor + '30' : (gained ? '#10b98130' : '#ef444430')}`,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: r.isCurrent ? catColor : (gained ? '#10b981' : '#ef4444'), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {sym}{r.val.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{r.years} yrs · {r.rate}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active.isCurrent && (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: catColor + '08', border: `1px solid ${catColor}25`,
          fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif",
        }}>
          📍 This is your current plan — {sym}{base.toLocaleString()} after {currentYears} years at {currentRate}%. Click any other scenario above to see how timing and rate affect your outcome.
        </div>
      )}
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────
export default function CompoundInterest({ meta, category }) {
  const [principal, setPrincipal] = useState(10000)
  const [rate,      setRate]      = useState(7)
  const [years,     setYears]     = useState(10)
  const [monthly,   setMonthly]   = useState(200)
  const [freqIdx,   setFreqIdx]   = useState(2)
  const [currency,  setCurrency]  = useState(CURRENCIES[0])
  const [openFaq,   setOpenFaq]   = useState(null)
  const calcRef = useRef(null)

  const n = FREQ_OPTIONS[freqIdx].n
  const sym = currency.symbol

  const compute = useCallback(() => {
    const r = rate / 100
    const factor = Math.pow(1 + r / n, n * years)
    const fromPrincipal = principal * factor
    const fromMonthly = r > 0 ? monthly * (factor - 1) / (r / n) : monthly * n * years
    const total = fromPrincipal + fromMonthly
    const totalContribs = monthly * 12 * years
    const interest = Math.max(0, total - principal - totalContribs)
    return { total, totalContribs, interest }
  }, [principal, rate, years, monthly, n])

  const { total, totalContribs, interest } = compute()

  // Chart data
  const chartData = Array.from({ length: Math.min(years, 20) }, (_, i) => {
    const yr = Math.round((i + 1) * years / Math.min(years, 20))
    const r = rate / 100
    const f = Math.pow(1 + r / n, n * yr)
    const t = principal * f + (r > 0 ? monthly * (f - 1) / (r / n) : monthly * n * yr)
    return { year: `Y${yr}`, value: Math.round(t) }
  })

  // Comparison data — start 5 yrs earlier / later
  const computeAt = (yrs) => {
    const r = rate / 100
    const f = Math.pow(1 + r / n, n * yrs)
    const t = principal * f + (r > 0 ? monthly * (f - 1) / (r / n) : monthly * n * yrs)
    return Math.round(t)
  }
  const earlier = computeAt(years + 5)
  const current = computeAt(years)
  const later   = computeAt(Math.max(1, years - 5))

  const doublingYrs = rate > 0 ? (72 / rate).toFixed(1) : '∞'
  const hint = `At ${rate}% your money doubles in ~${doublingYrs} years (Rule of 72). Adding ${sym}${monthly.toLocaleString()}/month contributes ${sym}${Math.round(totalContribs).toLocaleString()} extra to your final balance.`

  const catColor = category?.color || '#6366f1'

  function applyExample(ex) {
    setPrincipal(ex.principal)
    setRate(ex.rate)
    setYears(ex.years)
    setMonthly(ex.monthly)
    setFreqIdx(ex.freqIdx)
    // Scroll to calculator
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Main calc shell ── */}
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
      <CalcShell
        left={
          <>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: 18, paddingBottom: 8, borderBottom: '0.5px solid var(--border)',
            }}>
              Enter Your Values
            </div>

            {/* Currency selector */}
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            <FieldInput label="Principal Amount"     hint="Starting investment"  value={principal} onChange={setPrincipal} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="% per year"           value={rate}      onChange={setRate}      suffix="%" min={0} max={50} step={0.1} catColor={catColor} />
            <FieldInput label="Time Period"          hint="Number of years"      value={years}     onChange={setYears}     suffix="yrs" min={1} max={50} catColor={catColor} />
            <FieldInput label="Monthly Contribution" hint="Optional top-up"     value={monthly}   onChange={setMonthly}   prefix={sym} min={0} catColor={catColor} />

            {/* Compounding frequency */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 9, fontFamily: "'DM Sans', sans-serif" }}>
                Compounding Frequency
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FREQ_OPTIONS.map((f, i) => (
                  <button key={f.label} onClick={() => setFreqIdx(i)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    border: '1.5px solid',
                    borderColor: freqIdx === i ? catColor : 'var(--border)',
                    background: freqIdx === i ? catColor : 'var(--bg-raised)',
                    color: freqIdx === i ? '#fff' : 'var(--text-2)',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .12s',
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
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
              <button style={{
                padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)',
                background: 'var(--bg-raised)', color: 'var(--text-2)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all .12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
                onClick={() => { setPrincipal(10000); setRate(7); setYears(10); setMonthly(200); setFreqIdx(2) }}
              >
                Reset
              </button>
            </div>
          </>
        }

        right={
          <>
            <ResultHero
              label="Final Balance"
              value={Math.round(total)}
              formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
              sub={`After ${years} yrs at ${rate}% compounded ${FREQ_OPTIONS[freqIdx].label.toLowerCase()}`}
              color={catColor}
            />

            <BreakdownTable
              title="Breakdown"
              rows={[
                { label: 'Initial Principal',   value: fmt(principal, sym),    color: catColor },
                { label: 'Total Contributions', value: fmt(totalContribs, sym),color: '#3b82f6' },
                { label: 'Interest Earned',     value: fmt(interest, sym),     color: '#10b981' },
                { label: 'Total Balance',       value: fmt(total, sym),        color: catColor, bold: true, highlight: true },
              ]}
            />

            {/* Growth chart */}
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                Growth Over Time
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={v => [fmtK(v, sym), 'Balance']}
                    contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === chartData.length - 1 ? catColor : catColor + '88'} />
                    ))}
                  </Bar>
                </BarChart>
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
                  [`Principal`, `${sym}${ex.principal.toLocaleString()}`],
                  [`Rate`,      `${ex.rate}%`],
                  [`Period`,    `${ex.years} yrs`],
                  [`Monthly`,   `${sym}${ex.monthly}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: catColor }}>
                Apply example →
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Formula Explained ── */}
      <Section title="Formula Explained" subtitle="The math behind compound interest">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          A = P(1 + r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)]
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { symbol: 'A',   meaning: 'Final amount (what you end up with)' },
            { symbol: 'P',   meaning: 'Principal — your starting amount'    },
            { symbol: 'r',   meaning: 'Annual interest rate as a decimal'   },
            { symbol: 'n',   meaning: 'Compounding periods per year'        },
            { symbol: 't',   meaning: 'Time in years'                       },
            { symbol: 'PMT', meaning: 'Regular monthly contribution'        },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 32, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif" }}>
          Compound interest earns interest on your interest — not just your original deposit. The more frequently it compounds and the longer the time period, the more dramatic the growth. This is why starting early matters far more than the amount you invest.
        </p>
      </Section>

      {/* ── Key Terms Glossary ── */}
      <Section title="Key Terms" subtitle="Compound interest terminology explained — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => (
            <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />
          ))}
        </div>
      </Section>

      {/* ── Interactive Comparison ── */}
      <Section title="What If I Started Earlier or Later?" subtitle="Click any scenario to instantly see the difference">
        <ComparisonTool
          principal={principal}
          monthly={monthly}
          n={n}
          sym={sym}
          catColor={catColor}
          currentYears={years}
          currentRate={rate}
        />
      </Section>

      {/* ── FAQ Accordion ── */}
      <Section title="Frequently Asked Questions" subtitle="Everything about compound interest">
        <div>
          {FAQ.map((item, i) => (
            <AccordionItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </Section>

    </div>
  )
}
