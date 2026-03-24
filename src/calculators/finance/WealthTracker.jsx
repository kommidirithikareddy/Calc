import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(2) + '%'

const EXAMPLES = [
  { title:'Early Saver',      desc:'Starting at 25 with modest savings',    current:10000,  monthly:500,  rate:7,  years:35 },
  { title:'Mid-Career',       desc:'At 40 with solid investment base',       current:150000, monthly:2000, rate:7,  years:25 },
  { title:'Aggressive Saver', desc:'High savings rate, FIRE target',         current:80000,  monthly:4000, rate:8,  years:20 },
]

const FAQ = [
  { q: 'How does compound growth build wealth over time?', a: 'Compound growth means you earn returns not just on your original investment but on all previously accumulated returns. At 7% annual growth, money doubles approximately every 10 years (Rule of 72). The longer your time horizon, the more powerful compounding becomes — the last decade before retirement often contributes more growth than the first two decades combined.' },
  { q: 'What return rate should I use?', a: 'The US stock market (S&P 500) has historically averaged ~10% nominal (7% real after inflation). A diversified portfolio of 70-80% stocks and 20-30% bonds has averaged around 7-8% nominal. For conservative planning, 6-7% is reasonable. For inflation-adjusted projections, use 4-5%.' },
  { q: 'How much should I save monthly to reach my goal?', a: 'Working backwards from a target: if you want $1M in 30 years at 7%, you need to save approximately $820/month starting from $0. This calculator shows your projected endpoint; adjust monthly savings until the projected value meets your goal.' },
  { q: 'When do I hit my first million?', a: 'This depends on starting balance, monthly contributions and return rate. At $500/month with 7% returns from $0, it takes about 30 years. At $2,000/month with $50,000 starting, about 17 years. The milestone table in this calculator shows you the exact year you hit each major milestone.' },
  { q: 'Should I account for inflation?', a: 'Yes — $1M in 30 years buys significantly less than $1M today. At 3% inflation, $1M in 30 years is worth about $412,000 in today\'s dollars. For retirement planning, subtract 2-3% from your expected return rate to get a real (inflation-adjusted) return and use that to project your actual purchasing power.' },
]

const GLOSSARY = [
  { term: 'Compound Growth',  def: 'Growth where returns are reinvested, generating further returns. The engine of long-term wealth building.' },
  { term: 'CAGR',             def: 'Compound Annual Growth Rate — the steady annual return that would produce the same result as the actual variable returns.' },
  { term: 'Future Value',     def: 'The projected worth of your portfolio at a future date, given contributions and growth rate.' },
  { term: 'Real Return',      def: 'Return after subtracting inflation. A 7% nominal return with 3% inflation gives a 4% real return.' },
  { term: 'Rule of 72',       def: 'Divide 72 by your annual return rate to estimate years to double. At 7%, money doubles every ~10.3 years.' },
  { term: 'Time Horizon',     def: 'The number of years you plan to invest. Longer horizons allow compounding to work most powerfully.' },
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

export default function WealthTracker({ meta, category }) {
  const [current, setCurrent] = useState(10000)
  const [monthly, setMonthly] = useState(500)
  const [rate,    setRate]    = useState(7)
  const [years,   setYears]   = useState(35)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const r = rate / 100 / 12
  const n = years * 12
  const fvLump    = current * Math.pow(1 + r, n)
  const fvMonthly = r > 0 ? monthly * (Math.pow(1 + r, n) - 1) / r : monthly * n
  const futureValue = fvLump + fvMonthly
  const totalContributions = current + monthly * n
  const totalGrowth = futureValue - totalContributions
  const doublingYears = rate > 0 ? 72 / rate : Infinity

  // Build year-by-year projection
  const projection = []
  for (let y = 0; y <= years; y++) {
    const ny = y * 12
    const fvL = current * Math.pow(1 + r, ny)
    const fvM = r > 0 ? monthly * (Math.pow(1 + r, ny) - 1) / r : monthly * ny
    projection.push({ year: y, value: fvL + fvM })
  }

  // Milestones
  const milestones = [100000, 250000, 500000, 1000000, 2000000, 5000000]
  const milestoneHits = milestones.map(m => {
    const hit = projection.find(p => p.value >= m)
    return { amount: m, year: hit ? hit.year : null }
  })

  function applyExample(ex) {
    setCurrent(ex.current); setMonthly(ex.monthly); setRate(ex.rate); setYears(ex.years)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Your Wealth Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Current Net Worth / Savings" value={current} onChange={setCurrent} prefix={sym} catColor={catColor} />
            <FieldInput label="Monthly Contribution"        value={monthly} onChange={setMonthly} prefix={sym} catColor={catColor} />
            <FieldInput label="Expected Annual Return"      value={rate}    onChange={setRate}    suffix="%" max={20} catColor={catColor} hint="Historical avg ~7%" />
            <FieldInput label="Time Horizon"                value={years}   onChange={setYears}   suffix="years" max={60} catColor={catColor} />

            <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans',sans-serif" }}>Projected Wealth in {years}y</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: catColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmt(futureValue, sym)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Growth: {fmt(totalGrowth, sym)}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Money doubles every ~{doublingYears.toFixed(1)}y</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setCurrent(10000); setMonthly(500); setRate(7); setYears(35) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label={`Wealth in ${years} Years`} value={futureValue} formatter={n => fmt(n, sym)} sub={`${fmt(totalGrowth, sym)} from compound growth`} color={catColor} />
            <BreakdownTable title="Wealth Breakdown" rows={[
              { label: 'Starting Balance',     value: fmt(current, sym),           color: catColor },
              { label: 'Total Contributions',  value: fmt(monthly * n, sym) },
              { label: 'Total Invested',        value: fmt(totalContributions, sym) },
              { label: 'Growth from Returns',  value: fmt(totalGrowth, sym),        color: '#10b981', bold: true },
              { label: 'Final Portfolio Value', value: fmt(futureValue, sym),        bold: true, highlight: true },
              { label: 'Return Contribution',  value: `${(totalGrowth / futureValue * 100).toFixed(0)}% of total` },
              { label: 'Money Doubles Every',  value: `~${doublingYears.toFixed(1)} years` },
            ]} />
            <AIHintCard hint={`Starting with ${fmt(current, sym)} and saving ${fmt(monthly, sym)}/month at ${fmtP(rate)}, your wealth grows to ${fmt(futureValue, sym)} in ${years} years. Compound growth contributes ${fmt(totalGrowth, sym)} — ${(totalGrowth / futureValue * 100).toFixed(0)}% of your final balance.`} />
          </>}
        />
      </div>

      {/* Milestone tracker */}
      <Section title="Wealth Milestones" subtitle="When you hit each major milestone at current trajectory">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {milestoneHits.map((m, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: m.year !== null ? catColor + '0d' : 'var(--bg-raised)', border: `1px solid ${m.year !== null ? catColor + '30' : 'var(--border)'}` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: m.year !== null ? catColor : 'var(--text-3)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmt(m.amount, sym)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {m.year !== null ? `Year ${m.year} (in ${m.year} years)` : 'Beyond horizon'}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Growth table */}
      <Section title="Year-by-Year Growth" subtitle="Portfolio value at key checkpoints">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Year', 'Portfolio Value', 'Total Invested', 'Growth'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[1, 3, 5, 10, 15, 20, 25, 30, years].filter((y, i, a) => a.indexOf(y) === i && y <= years).map((y, i) => {
                const p = projection[y]
                const invested = current + monthly * y * 12
                const growth = p.value - invested
                return (
                  <tr key={y} style={{ background: i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Year {y}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: catColor, textAlign: 'right' }}>{fmt(p.value, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{fmt(invested, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>{fmt(growth, sym)}</td>
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
              {[['Start', fmt(ex.current, sym)], ['Monthly', fmt(ex.monthly, sym)], ['Rate', fmtP(ex.rate)], ['Years', ex.years]].map(([k, v]) => (
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
          FV = PV × (1+r)ⁿ + PMT × [(1+r)ⁿ − 1] / r{'\n'}
          r = annual rate / 12 (monthly){'\n'}
          n = years × 12 (months)
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          Future value combines two components: lump-sum growth (your starting balance compounding over time) and annuity growth (monthly contributions each compounding for the remainder of the period). Together they produce the total projected wealth, with compound interest doing the heavy lifting in later years.
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
