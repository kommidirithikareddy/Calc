import { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

// ── Formatters ─────────────────────────────────────────────
const fmt  = (n, sym = '$') => sym + Math.abs(Math.round(n)).toLocaleString()
const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

// ── Real world examples ────────────────────────────────────
const EXAMPLES = [
  { title: 'Stock Investment',  desc: 'Buy & hold index fund for 5 years', cost: 10000, returns: 16105, years: 5  },
  { title: 'Real Estate Flip',  desc: 'Buy, renovate and sell a property',  cost: 80000, returns: 112000, years: 1 },
  { title: 'Business Venture',  desc: 'Small business investment, 3 years', cost: 25000, returns: 38000, years: 3  },
]

// ── FAQ ────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is ROI and why does it matter?',
    a: 'ROI (Return on Investment) is a performance measure used to evaluate the efficiency of an investment. It compares the net profit relative to the cost, expressed as a percentage. A positive ROI means you made money; a negative ROI means you lost money. It\'s the most universal metric for comparing investment options because it works across asset classes — stocks, real estate, business, marketing spend, and more.',
  },
  {
    q: 'What is the difference between ROI and annualised ROI?',
    a: 'Simple ROI tells you the total return regardless of how long you held the investment. Annualised ROI (also called CAGR — Compound Annual Growth Rate) adjusts for time, giving you the equivalent yearly return. For example, a 60% total ROI over 4 years equals a 12.5% annualised ROI — not 15%. Annualised ROI is essential for comparing investments held for different durations.',
  },
  {
    q: 'What is a good ROI?',
    a: 'A "good" ROI depends entirely on the context and risk level. The S&P 500 averages ~10% annually — a reasonable benchmark for stock market investments. Real estate typically returns 8–12% annually. High-risk ventures may target 20%+ to justify the risk. Short-term projects should be measured against opportunity cost. As a rule: the higher the risk, the higher the expected ROI should be.',
  },
  {
    q: 'What are the limitations of ROI?',
    a: 'ROI has three main limitations. First, it ignores time — a 100% return over 20 years is far less impressive than 100% over 2 years. Second, it ignores risk — two investments with the same ROI may have vastly different risk profiles. Third, it doesn\'t account for cash flows during the holding period. For more precise analysis, consider IRR (Internal Rate of Return) or NPV alongside ROI.',
  },
  {
    q: 'How does ROI compare to other return metrics?',
    a: 'ROI is simpler but less precise than IRR (Internal Rate of Return), which accounts for the timing of cash flows. NPV (Net Present Value) factors in the time value of money. CAGR (Compound Annual Growth Rate) is the time-adjusted equivalent of ROI. For a single lump-sum investment with a single exit, ROI and CAGR together tell most of the story. For complex cash flow scenarios, use IRR.',
  },
  {
    q: 'Can ROI be negative?',
    a: 'Yes — a negative ROI means your investment lost value. You received less than you put in. For example, if you invested $10,000 and got back $8,000, your ROI is -20%. Negative ROI is common in early-stage investments, failed ventures, or market downturns. It\'s important to factor in all costs (transaction fees, taxes, maintenance) to get a true ROI figure.',
  },
]

// ── Glossary ───────────────────────────────────────────────
const GLOSSARY = [
  { term: 'ROI',              def: 'Return on Investment — net profit expressed as a percentage of the initial investment cost.' },
  { term: 'Net Profit',       def: 'The gain from an investment after subtracting all costs. Formula: Final Value − Initial Cost.' },
  { term: 'Annualised ROI',   def: 'The equivalent yearly return rate that would produce the same total ROI over the holding period. Also called CAGR.' },
  { term: 'CAGR',             def: 'Compound Annual Growth Rate — the rate at which an investment grows annually when compounded. Identical to annualised ROI for single lump-sum investments.' },
  { term: 'Opportunity Cost', def: 'The potential return you give up by choosing one investment over another. A 5% ROI looks poor if the alternative returns 12%.' },
  { term: 'IRR',              def: 'Internal Rate of Return — a more advanced metric than ROI that accounts for the timing of multiple cash flows.' },
  { term: 'Break-even',       def: 'The point where your investment returns exactly what you put in — ROI of 0%. Knowing your break-even helps assess downside risk.' },
  { term: 'Risk-adjusted ROI', def: 'ROI adjusted for the risk taken to achieve it. High ROI from a risky venture may be less attractive than moderate ROI from a safe investment.' },
]

// ── Field Input ────────────────────────────────────────────
function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
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
function ComparisonTool({ cost, returns, years, sym, catColor }) {
  const [activeIdx, setActiveIdx] = useState(2)

  function calcROI(c, r, y) {
    const net = r - c
    const roi = c > 0 ? (net / c) * 100 : 0
    const ann = y > 0 ? (Math.pow(1 + roi / 100, 1 / y) - 1) * 100 : roi
    return { roi, ann, net }
  }

  const base = calcROI(cost, returns, years)

  const scenarios = [
    { label: '10% more return',   emoji: '📈', desc: `Final value at ${sym}${Math.round(returns * 1.1).toLocaleString()}`,  c: cost,        r: returns * 1.1,  y: years       },
    { label: '10% less return',   emoji: '📉', desc: `Final value at ${sym}${Math.round(returns * 0.9).toLocaleString()}`,  c: cost,        r: returns * 0.9,  y: years       },
    { label: 'Current plan',      emoji: '📍', desc: `Your actual investment`,                                               c: cost,        r: returns,        y: years,       isCurrent: true },
    { label: '1 year shorter',    emoji: '⚡', desc: `Exit after ${Math.max(0.5, years - 1)} yr${years - 1 !== 1 ? 's' : ''}`, c: cost,    r: returns,        y: Math.max(0.5, years - 1) },
    { label: '2x the investment', emoji: '💰', desc: `Double your initial cost`,                                             c: cost * 2,    r: returns * 2,    y: years       },
    { label: 'Break-even only',   emoji: '🎯', desc: `Just getting your money back`,                                         c: cost,        r: cost,           y: years       },
  ]

  const active     = scenarios[activeIdx]
  const activeCalc = calcROI(active.c, active.r, active.y)
  const roiDiff    = activeCalc.roi - base.roi
  const better     = roiDiff >= 0

  const roiColor = (r) => r >= 0 ? '#10b981' : '#ef4444'

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        See how different outcomes, exit timings and investment sizes affect your ROI. Click any scenario to compare instantly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const r = calcROI(s.c, s.r, s.y)
          const isActive = activeIdx === i
          return (
            <button key={i} onClick={() => setActiveIdx(i)} style={{ padding: '12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${isActive ? catColor : 'var(--border)'}`, background: isActive ? catColor + '0d' : 'var(--bg-raised)', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
                {s.isCurrent && <span style={{ fontSize: 9, fontWeight: 700, background: catColor, color: '#fff', padding: '1px 5px', borderRadius: 6, marginLeft: 'auto' }}>YOU</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 7, lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: roiColor(r.roi), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {fmtP(r.roi)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                {fmtP(r.ann)}/yr
              </div>
            </button>
          )
        })}
      </div>

      {!active.isCurrent && (
        <div style={{ padding: '16px 18px', borderRadius: 12, background: better ? '#10b98108' : '#ef444408', border: `1.5px solid ${better ? '#10b98130' : '#ef444430'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{active.emoji} {active.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                {active.label === 'Break-even only'
                  ? `You\'d get your ${sym}${Math.round(active.c).toLocaleString()} back but earn nothing. ROI of 0% — no gain, no loss.`
                  : better
                    ? `This scenario gives you an ROI of ${fmtP(activeCalc.roi)} — ${roiDiff.toFixed(2)}% better than your current plan. Net profit: ${sym}${Math.round(activeCalc.net).toLocaleString()}.`
                    : `This scenario gives you an ROI of ${fmtP(activeCalc.roi)} — ${Math.abs(roiDiff).toFixed(2)}% worse than your current plan. Net profit: ${sym}${Math.round(activeCalc.net).toLocaleString()}.`
                }
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: roiColor(activeCalc.roi), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {fmtP(activeCalc.roi)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{fmtP(activeCalc.ann)}/yr annualised</div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `0.5px solid ${better ? '#10b98130' : '#ef444430'}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Your current plan', calc: base,       isCurrent: true  },
              { label: active.label,         calc: activeCalc, isCurrent: false },
            ].map((row, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: row.isCurrent ? catColor + '0d' : (better ? '#10b98108' : '#ef444408'), border: `1px solid ${row.isCurrent ? catColor + '30' : (better ? '#10b98130' : '#ef444430')}` }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: row.isCurrent ? catColor : roiColor(row.calc.roi), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {fmtP(row.calc.roi)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                  Net: {sym}{Math.round(row.calc.net).toLocaleString()} · {fmtP(row.calc.ann)}/yr
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.isCurrent && (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: catColor + '08', border: `1px solid ${catColor}25`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          📍 Your current investment returns {fmtP(base.roi)} total ({fmtP(base.ann)}/yr). Click any scenario above to explore how different outcomes affect your ROI.
        </div>
      )}
    </div>
  )
}

// ── ROI vs Benchmark chart ─────────────────────────────────
function BenchmarkChart({ roi, annRoi, years, sym, catColor }) {
  const benchmarks = [
    { name: 'Savings Account', annual: 4.5  },
    { name: 'Bonds',           annual: 5.0  },
    { name: 'Your ROI',        annual: annRoi, isYours: true },
    { name: 'S&P 500 avg',     annual: 10.0 },
    { name: 'Real Estate',     annual: 8.0  },
  ].sort((a, b) => a.annual - b.annual)

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
        How does your annualised ROI of <strong style={{ color: annRoi >= 0 ? '#10b981' : '#ef4444' }}>{fmtP(annRoi)}/yr</strong> compare to common benchmarks?
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={benchmarks} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 100 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} width={95} />
          <Tooltip formatter={v => [v.toFixed(2) + '%/yr', 'Annual Return']} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
          <ReferenceLine x={0} stroke="var(--border)" />
          <Bar dataKey="annual" radius={[0, 4, 4, 0]}>
            {benchmarks.map((entry, i) => (
              <Cell key={i} fill={entry.isYours ? (annRoi >= 0 ? catColor : '#ef4444') : 'var(--border-2)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main Calculator ────────────────────────────────────────
export default function ROICalculator({ meta, category }) {
  const [cost,     setCost]     = useState(10000)
  const [returns,  setReturns]  = useState(13500)
  const [years,    setYears]    = useState(1)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)

  const sym      = currency.symbol
  const catColor = category?.color || '#6366f1'

  const netProfit    = returns - cost
  const roi          = cost > 0 ? (netProfit / cost) * 100 : 0
  const annualisedRoi = years > 0 ? (Math.pow(1 + roi / 100, 1 / years) - 1) * 100 : roi
  const roiColor     = roi >= 0 ? '#10b981' : '#ef4444'
  const multiplier   = cost > 0 ? (returns / cost).toFixed(2) : '0.00'

  // Growth chart — value of investment year by year
  const chartData = Array.from({ length: Math.min(Math.ceil(years), 10) + 1 }, (_, i) => {
    const yr = i
    const projected = cost * Math.pow(1 + annualisedRoi / 100, yr)
    return { year: yr === 0 ? 'Start' : `Y${yr}`, value: Math.round(projected) }
  })
  // Add final year if not already included
  if (chartData[chartData.length - 1]?.value !== Math.round(returns)) {
    chartData[chartData.length - 1] = { year: `Y${years}`, value: Math.round(returns) }
  }

  const hint = roi >= 0
    ? `Your ROI of ${roi.toFixed(2)}% means every ${sym}1 invested returned ${sym}${multiplier}. Annualised over ${years} year${years > 1 ? 's' : ''} that's ${annualisedRoi.toFixed(2)}% per year.`
    : `Your investment lost ${Math.abs(roi).toFixed(2)}% of its value. You lost ${fmt(Math.abs(netProfit), sym)} on a ${fmt(cost, sym)} investment.`

  function applyExample(ex) {
    setCost(ex.cost); setReturns(ex.returns); setYears(ex.years)
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
                Investment Details
              </div>

              <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

              <FieldInput label="Initial Investment Cost" hint="Total amount invested" value={cost}    onChange={setCost}    prefix={sym} min={1}   catColor={catColor} />
              <FieldInput label="Final Value / Returns"   hint="Total value received" value={returns}  onChange={setReturns} prefix={sym} min={0}   catColor={catColor} />
              <FieldInput label="Time Period"             hint="For annualised ROI"   value={years}    onChange={setYears}   suffix="yrs" min={0.1} max={50} catColor={catColor} />

              {/* Live ROI preview */}
              <div style={{
                padding: '12px 14px', borderRadius: 10, marginBottom: 16,
                background: roi >= 0 ? '#10b98110' : '#ef444410',
                border: `1px solid ${roi >= 0 ? '#10b98130' : '#ef444430'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }}>Live ROI</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: roiColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {fmtP(roi)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }}>Annualised</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: roiColor, fontFamily: "'DM Sans', sans-serif" }}>
                    {fmtP(annualisedRoi)}/yr
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif" }}>Every {sym}1 invested returned</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: roiColor, fontFamily: "'DM Sans', sans-serif" }}>
                    {sym}{multiplier}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity .12s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Calculate →
                </button>
                <button onClick={() => { setCost(10000); setReturns(13500); setYears(1) }}
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
                label="Return on Investment"
                value={Math.round(Math.abs(roi) * 100) / 100}
                formatter={n => (roi >= 0 ? '+' : '-') + n.toFixed(2) + '%'}
                sub={`Net ${roi >= 0 ? 'profit' : 'loss'}: ${fmt(Math.abs(netProfit), sym)}`}
                color={roiColor}
              />

              <BreakdownTable title="Investment Summary" rows={[
                { label: 'Initial Cost',      value: fmt(cost, sym)                                                    },
                { label: 'Final Value',       value: fmt(returns, sym)                                                  },
                { label: 'Net Profit / Loss', value: (netProfit >= 0 ? '+' : '-') + fmt(Math.abs(netProfit), sym), color: roiColor },
                { label: 'Money Multiplier',  value: `${multiplier}×`,                                          color: catColor  },
                { label: 'Total ROI',         value: fmtP(roi),         color: roiColor, bold: true, highlight: true   },
                { label: `Annualised (${years}yr)`, value: fmtP(annualisedRoi), color: roiColor                        },
              ]} />

              {/* Investment growth chart */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Investment Growth
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={v => [sym + Math.round(v).toLocaleString(), 'Value']}
                      contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === chartData.length - 1 ? roiColor : roiColor + '66'} />
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
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: '14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[['Cost', `${sym}${ex.cost.toLocaleString()}`], ['Returns', `${sym}${ex.returns.toLocaleString()}`], ['Period', `${ex.years} yrs`]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                ROI: {fmtP(ex.cost > 0 ? ((ex.returns - ex.cost) / ex.cost) * 100 : 0)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: catColor, marginTop: 2 }}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Benchmark Comparison ── */}
      <Section title="How Does Your ROI Compare?" subtitle="Your annualised return vs common investment benchmarks">
        <BenchmarkChart roi={roi} annRoi={annualisedRoi} years={years} sym={sym} catColor={catColor} />
      </Section>

      {/* ── Formula Explained ── */}
      <Section title="Formula Explained" subtitle="The math behind ROI and annualised ROI">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Total ROI',      formula: 'ROI = (Final Value − Initial Cost) / Initial Cost × 100' },
            { label: 'Annualised ROI', formula: 'Ann. ROI = ((1 + ROI/100)^(1/years) − 1) × 100'          },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { symbol: 'ROI',        meaning: 'Total return as % of initial cost'            },
            { symbol: 'Net Profit', meaning: 'Final Value minus Initial Cost'               },
            { symbol: 'Ann. ROI',   meaning: 'Equivalent yearly return over the period'     },
            { symbol: 'years',      meaning: 'How long the investment was held'             },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 70, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          Simple ROI doesn't account for time — a 50% return over 10 years is far less impressive than 50% over 1 year. Annualised ROI fixes this by finding the equivalent yearly rate that compounds to your total return, making it possible to compare any two investments fairly.
        </p>
      </Section>

      {/* ── Key Terms ── */}
      <Section title="Key Terms" subtitle="ROI terminology explained — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      {/* ── Comparison ── */}
      <Section title="Explore Different Scenarios" subtitle="Click any scenario to instantly see how it changes your ROI">
        <ComparisonTool cost={cost} returns={returns} years={years} sym={sym} catColor={catColor} />
      </Section>

      {/* ── FAQ ── */}
      <Section title="Frequently Asked Questions" subtitle="Everything about ROI and investment returns">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>

    </div>
  )
}
