import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.abs(Math.round(n)).toLocaleString()
const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

const PRESET_EXAMPLES = [
  {
    title: '60/40 Portfolio',
    desc: 'Classic balanced — stocks & bonds',
    holdings: [
      { name: 'US Stocks', allocation: 40, returnPct: 12.5 },
      { name: 'Int\'l Stocks', allocation: 20, returnPct: 8.2 },
      { name: 'Bonds', allocation: 40, returnPct: 4.1 },
    ],
  },
  {
    title: 'Three-Fund',
    desc: 'Simple diversified index approach',
    holdings: [
      { name: 'US Large Cap', allocation: 50, returnPct: 12.5 },
      { name: 'International', allocation: 30, returnPct: 8.2 },
      { name: 'Bonds', allocation: 20, returnPct: 4.1 },
    ],
  },
  {
    title: '100% Equities',
    desc: 'All stocks — long horizon growth',
    holdings: [
      { name: 'US Large Cap', allocation: 40, returnPct: 12.5 },
      { name: 'International', allocation: 20, returnPct: 8.2 },
      { name: 'Real Estate', allocation: 10, returnPct: 9.8 },
      { name: 'Small Cap', allocation: 10, returnPct: 14.3 },
      { name: 'Emerging Mkts', allocation: 20, returnPct: 7.6 },
    ],
  },
]

const FAQ = [
  { q: 'What is weighted average return?', a: 'A weighted average return accounts for how much of your portfolio is allocated to each holding. A stock that is 40% of your portfolio has four times the impact on overall return compared to one that is 10%. Simply averaging returns without weighting would overstate smaller holdings and understate larger ones.' },
  { q: 'How should I think about portfolio diversification?', a: 'Diversification is about owning assets that do not all move together. A portfolio of 10 tech stocks is not well-diversified — they are highly correlated. Mix different sectors (tech, healthcare, consumer staples), asset classes (stocks, bonds, real estate), and geographies. True diversification reduces risk without proportionally reducing expected return.' },
  { q: 'What is the difference between time-weighted and money-weighted return?', a: 'Time-weighted return (TWR) measures pure investment performance independent of cash flows — it is how fund managers are typically evaluated. Money-weighted return (IRR) reflects your actual experience as an investor, including the timing of your contributions and withdrawals. This calculator computes a simplified weighted return.' },
  { q: 'How do I handle holdings with different time periods?', a: 'For accurate portfolio-level comparison, annualise each holding\'s return to a per-year figure (CAGR). Holdings held for only months should not be directly compared to holdings held for years without converting to annualised rates. This calculator uses each holding\'s return as entered — annualise manually before inputting if needed.' },
  { q: 'What is a good overall portfolio return?', a: 'A broadly diversified portfolio of global stocks has historically returned 7-10% per year nominal. Adding bonds reduces both expected return and volatility. Many investors target 6-8% real return (after inflation) as a long-term planning assumption. Returns well above 15% are possible but come with commensurate risk.' },
]

const GLOSSARY = [
  { term: 'Weighted Average Return', def: 'Portfolio return calculated by weighting each holding\'s return by its allocation percentage. The most accurate measure of portfolio performance.' },
  { term: 'Portfolio Allocation', def: 'The percentage of total portfolio value assigned to each holding. All allocations must sum to 100%.' },
  { term: 'Correlation', def: 'How closely two assets move together. Low-correlation assets provide better diversification than high-correlation ones.' },
  { term: 'Rebalancing', def: 'Periodically restoring portfolio allocations to target weights by selling over-performers and buying under-performers.' },
  { term: 'Benchmark', def: 'A reference index (e.g. S&P 500) used to evaluate whether your portfolio is outperforming or underperforming the market.' },
  { term: 'Alpha', def: 'Return above a benchmark index. Positive alpha means you outperformed the benchmark on a risk-adjusted basis.' },
]

const DEFAULT_HOLDINGS = [
  { name: 'US Large Cap', allocation: 40, returnPct: 12.5 },
  { name: 'International', allocation: 20, returnPct: 8.2 },
  { name: 'Bonds', allocation: 20, returnPct: 4.1 },
  { name: 'Real Estate', allocation: 10, returnPct: 9.8 },
  { name: 'Small Cap', allocation: 10, returnPct: 14.3 },
]

function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-input,var(--bg-card))', border: `1.5px solid ${focused ? catColor : 'var(--border)'}`, borderRadius: 8, padding: '0 9px', height: 36, boxShadow: focused ? `0 0 0 3px ${catColor}18` : 'none' }}>
        {prefix && <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}
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

export default function PortfolioReturn({ meta, category }) {
  const catColor = category?.color || '#6366f1'
  const calcRef = useRef(null)

  const [currency, setCurrency] = useState(CURRENCIES[0])
  const sym = currency.symbol
  const [holdings, setHoldings] = useState(DEFAULT_HOLDINGS)
  const [totalValue, setTotalValue] = useState(100000)
  const [openFaq, setOpenFaq] = useState(null)

  const updateHolding = (i, field, val) =>
    setHoldings(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h))
  const removeHolding = i => setHoldings(prev => prev.filter((_, idx) => idx !== i))
  const addHolding = () => setHoldings(prev => [...prev, { name: 'New Holding', allocation: 0, returnPct: 0 }])

  const totalAlloc = holdings.reduce((a, h) => a + h.allocation, 0)
  const weightedReturn = holdings.reduce((a, h) => a + (h.allocation / 100) * h.returnPct, 0)
  const isBalanced = Math.abs(totalAlloc - 100) < 0.1
  const annualGain = totalValue * (weightedReturn / 100)
  const bestHolding = [...holdings].sort((a, b) => b.returnPct - a.returnPct)[0]
  const worstHolding = [...holdings].sort((a, b) => a.returnPct - b.returnPct)[0]

  function applyExample(ex) {
    setHoldings(ex.holdings)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleReset() {
    setHoldings(DEFAULT_HOLDINGS)
    setTotalValue(100000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
              Portfolio Details
            </div>

            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Total Portfolio Value" hint="Your total invested amount" value={totalValue} onChange={setTotalValue} prefix={sym} min={1} catColor={catColor} />

            {/* Holdings header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 6 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Holdings</div>
                <div style={{ fontSize: 10, color: !isBalanced ? '#ef4444' : '#10b981', marginTop: 1 }}>
                  {totalAlloc.toFixed(1)}% allocated {!isBalanced ? '⚠️ must equal 100%' : '✓'}
                </div>
              </div>
              <button onClick={addHolding} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${catColor}50`, background: catColor + '10', color: catColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                + Add
              </button>
            </div>

            {/* Holdings list */}
            {holdings.map((h, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < holdings.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <input
                    value={h.name}
                    onChange={e => updateHolding(i, 'name', e.target.value)}
                    style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", flex: 1 }}
                  />
                  {holdings.length > 1 && (
                    <button onClick={() => removeHolding(i)} style={{ fontSize: 16, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <FieldInput label="Allocation" value={h.allocation} onChange={v => updateHolding(i, 'allocation', v)} suffix="%" min={0} max={100} catColor={catColor} />
                  <FieldInput label="Return" value={h.returnPct} onChange={v => updateHolding(i, 'returnPct', v)} suffix="%" min={-100} max={1000} catColor={catColor} />
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Calculate →
              </button>
              <button onClick={handleReset} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>
                Reset
              </button>
            </div>
          </>}

          right={<>
            <ResultHero
              label="Weighted Portfolio Return"
              value={`${weightedReturn.toFixed(2)}%`}
              sub={isBalanced ? `${fmt(annualGain, sym)} estimated annual gain` : '⚠️ Allocations must sum to 100%'}
              color={!isBalanced ? '#f59e0b' : weightedReturn >= 0 ? catColor : '#ef4444'}
            />
            <BreakdownTable title="Portfolio Summary" rows={[
              { label: 'Portfolio Value', value: fmt(totalValue, sym), highlight: true },
              { label: 'Weighted Return', value: `${weightedReturn.toFixed(2)}%`, bold: true, color: catColor },
              { label: 'Estimated Annual Gain', value: fmt(annualGain, sym), color: '#10b981' },
              { label: 'Total Allocation', value: `${totalAlloc.toFixed(1)}%`, color: isBalanced ? '#10b981' : '#ef4444' },
              { label: 'Best Performer', value: `${bestHolding?.name} (${fmtP(bestHolding?.returnPct || 0)})`, color: catColor },
              { label: 'Worst Performer', value: `${worstHolding?.name} (${fmtP(worstHolding?.returnPct || 0)})`, color: '#f59e0b' },
              { label: 'Number of Holdings', value: String(holdings.length), bold: true, highlight: true },
            ]} />
            <AIHintCard
              hint={`Your portfolio's weighted return is ${weightedReturn.toFixed(2)}%. ${bestHolding?.name} is your top performer at ${fmtP(bestHolding?.returnPct || 0)}. ${!isBalanced ? 'Adjust allocations to total 100% for accurate results.' : `At ${sym}${totalValue.toLocaleString()}, that's an estimated ${fmt(annualGain, sym)} annual gain.`}`}
            />
          </>}
        />
      </div>

      {/* Formula */}
      <Section title="Formula Explained" subtitle="The math behind weighted portfolio return">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'pre', lineHeight: 1.9 }}>
          {`Portfolio Return = Σ (Weight_i × Return_i)\nAnnual Gain = Portfolio Value × Return`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            ['Σ', 'Sum across all holdings'],
            ['Weight_i', 'Holding allocation ÷ 100'],
            ['Return_i', 'Each holding\'s return %'],
            ['Annual Gain', 'Portfolio value × weighted return'],
          ].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          Weighted average return sums each holding's return multiplied by its weight (allocation ÷ 100). A holding with 40% allocation and 12% return contributes 4.8 percentage points to the overall portfolio return. Weights must sum to 100% for the result to be meaningful.
        </p>
      </Section>

      {/* Holdings Breakdown */}
      <Section title="Holdings Breakdown" subtitle="Each holding's contribution to total portfolio return">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>
                {['Holding', 'Allocation', 'Return', 'Contribution', 'Weight'].map((h, i) => (
                  <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const contribution = (h.allocation / 100) * h.returnPct
                const barPct = Math.max(0, Math.min(100, Math.abs(h.returnPct) / Math.max(...holdings.map(x => Math.abs(x.returnPct)), 1) * 100))
                const isBest = h.name === bestHolding?.name
                return (
                  <tr key={i} style={{ background: isBest ? catColor + '08' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isBest ? 700 : 400, color: isBest ? catColor : 'var(--text)' }}>{h.name} {isBest && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{h.allocation}%</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: h.returnPct >= 0 ? catColor : '#ef4444', textAlign: 'right' }}>{fmtP(h.returnPct)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: contribution >= 0 ? catColor : '#ef4444', textAlign: 'right' }}>{contribution.toFixed(2)}%</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                      <div style={{ height: 7, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden', minWidth: 50 }}>
                        <div style={{ width: `${barPct}%`, height: '100%', background: h.returnPct >= 0 ? catColor : '#ef4444', borderRadius: 4, opacity: 0.75, transition: 'width .4s' }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Preset Examples */}
      <Section title="Portfolio Presets" subtitle="Click any strategy to load it into the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {PRESET_EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)}
              style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {ex.holdings.map((h, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{h.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{h.allocation}%</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: catColor }}>Apply strategy →</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Common Strategies Context */}
      <Section title="Common Portfolio Strategies" subtitle="How different allocations compare historically">
        {[
          { label: '60/40 Portfolio', note: '60% stocks / 40% bonds. Classic balanced allocation targeting ~7-8% annualised return with moderate volatility.' },
          { label: 'Three-Fund Portfolio', note: 'US stocks + Int\'l stocks + Bonds. Simple, diversified, low-cost indexing approach favoured by passive investors.' },
          { label: '100% Equities', note: 'All stocks — higher expected return (~10%) with higher volatility. Best suited for 10+ year horizons.' },
        ].map((ex, i, arr) => (
          <div key={i} style={{ padding: '9px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{ex.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{ex.note}</div>
          </div>
        ))}
      </Section>

      {/* Glossary */}
      <Section title="Key Terms" subtitle="Portfolio terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Frequently Asked Questions" subtitle="Everything about portfolio returns">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>
    </div>
  )
}
