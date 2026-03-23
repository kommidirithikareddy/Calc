import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = (n, sym = '$') => n >= 1000 ? sym + (n / 1000).toFixed(0) + 'k' : fmt(n, sym)

const FREQ = [
  { label: 'Annually',  n: 1   },
  { label: 'Quarterly', n: 4   },
  { label: 'Monthly',   n: 12  },
  { label: 'Daily',     n: 365 },
]

const EXAMPLES = [
  { title: 'Retirement Fund',  desc: '$5k/yr for 30 years at 7%',   pv: 10000, pmt: 5000, rate: 7,   years: 30, freqIdx: 0 },
  { title: 'College Savings',  desc: '$200/mo for 18 years at 6%',  pv: 1000,  pmt: 200,  rate: 6,   years: 18, freqIdx: 2 },
  { title: 'Short-term Goal',  desc: '$500/mo for 5 years at 4.5%', pv: 0,     pmt: 500,  rate: 4.5, years: 5,  freqIdx: 2 },
]

const FAQ = [
  { q: 'What is Future Value?', a: 'Future Value (FV) is the value of a current asset at a specified date in the future, based on an assumed rate of growth. It tells you how much a sum of money invested today will be worth later, accounting for compound interest and any regular contributions.' },
  { q: 'How does compounding frequency affect future value?', a: 'The more frequently interest compounds, the higher your future value. Daily compounding produces more than monthly, which produces more than annual. For a $10,000 investment at 7% for 10 years: annually gives $19,672, monthly gives $20,097, and daily gives $20,138.' },
  { q: 'What is the difference between FV and compound interest?', a: 'Compound interest is the mechanism — interest earned on both principal and previously earned interest. Future Value is the result — the total amount your investment grows to, including your original principal, all compound interest, and any regular contributions.' },
  { q: 'Should I include regular contributions?', a: 'Yes, if you plan to make regular deposits. Even small regular contributions dramatically increase the final value. A $10,000 lump sum at 7% for 30 years becomes $76,123. Adding just $100/month turns it into $218,756.' },
  { q: 'What rate of return should I use?', a: 'Use a conservative estimate based on your investment type. Savings accounts: 4–5%. Bonds: 4–6%. Balanced portfolio: 6–7%. Index funds (long-term): 7–10%. For planning, most advisors recommend 6–7% for stock-heavy portfolios.' },
  { q: 'How is FV different from Present Value?', a: 'They are inverses of each other. Future Value asks: "What will my money be worth later?" Present Value asks: "What is a future amount worth in today\'s dollars?" FV grows money forward, PV discounts money backward using the same interest rate logic.' },
]

const GLOSSARY = [
  { term: 'Future Value (FV)',   def: 'The value of a current investment at a future date, based on an assumed growth rate.' },
  { term: 'Present Value (PV)',  def: 'The starting amount — what you invest today before any growth occurs.' },
  { term: 'PMT',                 def: 'Periodic payment — a fixed amount contributed at regular intervals.' },
  { term: 'Compounding',         def: 'Earning interest on both the principal and previously accumulated interest.' },
  { term: 'Nominal Rate',        def: 'The stated annual interest rate before accounting for compounding frequency.' },
  { term: 'Effective Rate',      def: 'The actual annual return after accounting for compounding frequency — always ≥ nominal rate.' },
  { term: 'Time Value of Money', def: 'The principle that money today is worth more than the same amount in the future due to its earning potential.' },
  { term: 'Annuity',             def: 'A series of equal payments made at regular intervals — what the PMT field represents.' },
]

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input,var(--bg-card))', border: `1.5px solid ${focused ? catColor : 'var(--border)'}`, borderRadius: 8, padding: '0 10px', height: 38, boxShadow: focused ? `0 0 0 3px ${catColor}18` : 'none' }}>
        {prefix && <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={focused ? raw : value}
          onChange={e => { setRaw(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
          onFocus={() => { setFocused(true); setRaw(String(value)) }}
          onBlur={() => { setFocused(false); const v = parseFloat(raw); if (isNaN(v) || raw === '') { setRaw(String(min)); onChange(min) } else { const c = max !== undefined ? Math.min(max, Math.max(min, v)) : Math.max(min, v); setRaw(String(c)); onChange(c) } }}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, outline: 'none', minWidth: 0, fontFamily: "'DM Sans', sans-serif" }} />
        {suffix && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  )
}

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

function ComparisonTool({ pv, pmt, rate, years, freqIdx, sym, catColor }) {
  const [activeIdx, setActiveIdx] = useState(2)

  function calcFV(p, m, r, y, fi) {
    const n = FREQ[fi].n
    const mr = r / 100 / n
    const periods = n * y
    const fvL = p * Math.pow(1 + mr, periods)
    const fvP = mr > 0 ? m * (Math.pow(1 + mr, periods) - 1) / mr : m * periods
    return Math.round(fvL + fvP)
  }

  const base = calcFV(pv, pmt, rate, years, freqIdx)
  const scenarios = [
    { label: '5 yrs longer',    emoji: '📅', desc: `Invest for ${years + 5} years`,         p: pv, m: pmt,     r: rate,     y: years + 5,            fi: freqIdx },
    { label: '2% higher rate',  emoji: '📈', desc: `Rate at ${rate + 2}%`,                  p: pv, m: pmt,     r: rate + 2, y: years,                fi: freqIdx },
    { label: 'Current plan',    emoji: '📍', desc: `${sym}${pv.toLocaleString()} + contributions`, p: pv, m: pmt, r: rate, y: years,                fi: freqIdx, isCurrent: true },
    { label: 'Double PMT',      emoji: '💰', desc: `${sym}${pmt * 2}/period`,                p: pv, m: pmt * 2, r: rate,     y: years,                fi: freqIdx },
    { label: 'Monthly compound',emoji: '⚡', desc: 'Switch to monthly compounding',          p: pv, m: pmt,     r: rate,     y: years,                fi: 2       },
    { label: '5 yrs shorter',   emoji: '⏩', desc: `Exit at ${Math.max(1, years - 5)} yrs`, p: pv, m: pmt,     r: rate,     y: Math.max(1, years - 5), fi: freqIdx },
  ]

  const active    = scenarios[activeIdx]
  const activeVal = calcFV(active.p, active.m, active.r, active.y, active.fi)
  const diff      = activeVal - base
  const better    = diff >= 0

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Time, rate, and contributions are the three levers of future value. See how tweaking each one changes your final balance.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
        {scenarios.map((s, i) => {
          const val = calcFV(s.p, s.m, s.r, s.y, s.fi)
          const d   = val - base
          const isActive = activeIdx === i
          return (
            <button key={i} onClick={() => setActiveIdx(i)} style={{ padding: '12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${isActive ? catColor : 'var(--border)'}`, background: isActive ? catColor + '0d' : 'var(--bg-raised)', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{s.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? catColor : 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
                {s.isCurrent && <span style={{ fontSize: 9, fontWeight: 700, background: catColor, color: '#fff', padding: '1px 5px', borderRadius: 6, marginLeft: 'auto' }}>YOU</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 7 }}>{s.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? catColor : 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sym}{val.toLocaleString()}</div>
              {!s.isCurrent && <div style={{ fontSize: 10, fontWeight: 600, color: d >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>{d >= 0 ? '+' : ''}{sym}{Math.abs(d).toLocaleString()}</div>}
            </button>
          )
        })}
      </div>
      {!active.isCurrent ? (
        <div style={{ padding: '16px 18px', borderRadius: 12, background: better ? '#10b98108' : '#ef444408', border: `1.5px solid ${better ? '#10b98130' : '#ef444430'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{active.emoji} {active.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                {better ? `Your future value grows to ${sym}${activeVal.toLocaleString()} — ${sym}${Math.abs(diff).toLocaleString()} more than your current plan.`
                        : `Your future value drops to ${sym}${activeVal.toLocaleString()} — ${sym}${Math.abs(diff).toLocaleString()} less than your current plan.`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: better ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{better ? '+' : '−'}{sym}{Math.abs(diff).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>vs your plan</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', borderRadius: 10, background: catColor + '08', border: `1px solid ${catColor}25`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          📍 Your current plan grows to {sym}{base.toLocaleString()}. Click any scenario above to explore how changes affect your future value.
        </div>
      )}
    </div>
  )
}

export default function FutureValue({ meta, category }) {
  const [pv,       setPv]       = useState(10000)
  const [pmt,      setPmt]      = useState(200)
  const [rate,     setRate]     = useState(7)
  const [years,    setYears]    = useState(10)
  const [freqIdx,  setFreqIdx]  = useState(2)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)

  const sym      = currency.symbol
  const catColor = category?.color || '#6366f1'
  const n        = FREQ[freqIdx].n
  const mr       = rate / 100 / n
  const periods  = n * years
  const fvLump   = pv * Math.pow(1 + mr, periods)
  const fvPmt    = mr > 0 ? pmt * (Math.pow(1 + mr, periods) - 1) / mr : pmt * periods
  const fv       = fvLump + fvPmt
  const totalContrib = pmt * periods
  const interest = Math.max(0, fv - pv - totalContrib)

  const chartData = Array.from({ length: Math.min(years, 30) }, (_, i) => {
    const yr = Math.round((i + 1) * years / Math.min(years, 30))
    const p  = n * yr
    const fl = pv * Math.pow(1 + mr, p)
    const fp = mr > 0 ? pmt * (Math.pow(1 + mr, p) - 1) / mr : pmt * p
    return { year: `Y${yr}`, value: Math.round(fl + fp) }
  })

  const hint = `Your ${sym}${pv.toLocaleString()} investment grows to ${fmt(fv, sym)} over ${years} years at ${rate}%. You contribute ${fmt(totalContrib, sym)} and earn ${fmt(interest, sym)} in interest.`

  function applyExample(ex) {
    setPv(ex.pv); setPmt(ex.pmt); setRate(ex.rate); setYears(ex.years); setFreqIdx(ex.freqIdx)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Investment Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Present Value (PV)"   hint="Starting amount"  value={pv}    onChange={setPv}    prefix={sym} min={0}   catColor={catColor} />
            <FieldInput label="Regular Contribution" hint="Per period (PMT)" value={pmt}   onChange={setPmt}   prefix={sym} min={0}   catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="Expected return"  value={rate}  onChange={setRate}  suffix="%"   min={0} max={50} catColor={catColor} />
            <FieldInput label="Time Period"          hint="Years"            value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Compounding Frequency</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FREQ.map((f, i) => (
                  <button key={f.label} onClick={() => setFreqIdx(i)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: freqIdx === i ? catColor : 'var(--border)', background: freqIdx === i ? catColor : 'var(--bg-raised)', color: freqIdx === i ? '#fff' : 'var(--text-2)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .12s' }}>{f.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setPv(10000); setPmt(200); setRate(7); setYears(10); setFreqIdx(2) }}
                style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Future Value" value={Math.round(fv)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`After ${years} years at ${rate}% — ${FREQ[freqIdx].label.toLowerCase()} compounding`} color={catColor} />
            <BreakdownTable title="Breakdown" rows={[
              { label: 'Initial Investment',  value: fmt(pv, sym),           color: catColor  },
              { label: 'Total Contributions', value: fmt(totalContrib, sym), color: '#3b82f6' },
              { label: 'Interest Earned',     value: fmt(interest, sym),     color: '#10b981' },
              { label: 'Future Value',        value: fmt(fv, sym),           color: catColor, bold: true, highlight: true },
            ]} />
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>Growth Over Time</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={v => [fmtK(v, sym), 'Value']} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="value" stroke={catColor} fill={catColor + '20'} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: '14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['PV', `${sym}${ex.pv.toLocaleString()}`], ['PMT', `${sym}${ex.pmt}`], ['Rate', `${ex.rate}%`], ['Years', `${ex.years}`]].map(([k, v]) => (
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

      <Section title="Formula Explained" subtitle="The math behind Future Value">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Lump Sum',  formula: 'FV = PV × (1 + r/n)^(n×t)' },
            { label: 'With PMT', formula: 'FV = FV_lump + PMT × [((1 + r/n)^(n×t) − 1) / (r/n)]' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { symbol: 'FV',  meaning: 'Future Value — what your money grows to'  },
            { symbol: 'PV',  meaning: 'Present Value — your starting amount'      },
            { symbol: 'PMT', meaning: 'Regular contribution per period'          },
            { symbol: 'r',   meaning: 'Annual interest rate (as decimal)'        },
            { symbol: 'n',   meaning: 'Compounding periods per year'             },
            { symbol: 't',   meaning: 'Time in years'                            },
          ].map(v => (
            <div key={v.symbol} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 36, flexShrink: 0 }}>{v.symbol}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{v.meaning}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Key Terms" subtitle="Future Value terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Explore Scenarios" subtitle="Click any scenario to instantly compare">
        <ComparisonTool pv={pv} pmt={pmt} rate={rate} years={years} freqIdx={freqIdx} sym={sym} catColor={catColor} />
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about Future Value">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
