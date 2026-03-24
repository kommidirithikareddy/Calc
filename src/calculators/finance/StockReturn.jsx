import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.abs(Math.round(n)).toLocaleString()
const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
const fmtD = (n, sym = '$') => (n >= 0 ? sym : '-' + sym) + Math.abs(n).toFixed(2)

const EXAMPLES = [
  { title: 'Long-term Hold', desc: 'Buy & hold 5 years with reinvested dividends', buyPrice: 50, sellPrice: 92, shares: 100, divPerShare: 1.80, years: 5 },
  { title: 'Short-term Trade', desc: '1 year trade on a growth stock', buyPrice: 120, sellPrice: 165, shares: 50, divPerShare: 0, years: 1 },
  { title: 'REIT Investment', desc: 'High-dividend real estate trust', buyPrice: 40, sellPrice: 44, shares: 200, divPerShare: 3.20, years: 3 },
]

const FAQ = [
  { q: 'What is total return vs price return?', a: 'Price return measures only the capital gain (or loss) from buying and selling a stock. Total return also includes dividends received. Over long periods, dividends account for a significant portion of stock market returns — historically around 40% of the S&P 500\'s total return. Always compare total returns when evaluating investments.' },
  { q: 'What is annualised return and why does it matter?', a: 'Annualised return (CAGR) converts total return into a per-year figure, making it possible to compare investments held for different periods. A 50% gain over 5 years sounds better than a 40% gain over 3 years, but the 3-year investment has a higher CAGR (11.9% vs 8.4%) — it grew faster per year.' },
  { q: 'How are dividends factored into stock return?', a: 'This calculator assumes dividends are paid annually and collected as cash (not reinvested). If you reinvest dividends (DRIP), your actual return will be higher than shown, because you are purchasing additional shares with each dividend payment, which then generate their own dividends.' },
  { q: 'What is a realistic stock return to expect?', a: 'The US stock market (S&P 500) has historically returned approximately 10% per year nominal (7% real, inflation-adjusted). Individual stocks vary enormously. Diversified index funds over 10+ year periods have reliably delivered returns in this range, though past performance does not guarantee future results.' },
  { q: 'How is ROI different from CAGR?', a: 'ROI (Return on Investment) is a simple total return percentage — it does not account for how long the investment was held. CAGR (Compound Annual Growth Rate) normalises the return to a per-year rate. A 100% ROI over 1 year is spectacular; the same 100% ROI over 20 years is about 3.5% CAGR — very modest.' },
]

const GLOSSARY = [
  { term: 'Total Return', def: 'Capital gain plus dividends received, expressed as a percentage of the initial investment.' },
  { term: 'CAGR', def: 'Compound Annual Growth Rate — the rate at which an investment would have grown each year to reach its final value.' },
  { term: 'Capital Gain', def: 'The increase in value of an investment from purchase to sale price. Taxable in most jurisdictions when realised.' },
  { term: 'Dividend-Adjusted Return', def: 'Total return including dividend income, the most accurate measure of investment performance.' },
  { term: 'Cost Basis', def: 'The original purchase price of an investment, used to calculate capital gains for tax purposes.' },
  { term: 'Holding Period', def: 'The length of time an investment is held. Affects both CAGR calculation and tax treatment of gains.' },
]

function FieldInput({ label, hint, value, onChange, prefix, suffix, min = 0, max, catColor = '#6366f1' }) {
  const [raw, setRaw] = useState(String(value))
  const [focused, setFocused] = useState(false)
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

export default function StockReturn({ meta, category }) {
  const catColor = category?.color || '#6366f1'
  const calcRef = useRef(null)

  const [currency, setCurrency] = useState(CURRENCIES[0])
  const sym = currency.symbol

  const [buyPrice, setBuyPrice] = useState(50)
  const [sellPrice, setSellPrice] = useState(92)
  const [shares, setShares] = useState(100)
  const [divPerShare, setDivPerShare] = useState(1.80)
  const [years, setYears] = useState(5)
  const [openFaq, setOpenFaq] = useState(null)

  // Calculations
  const initialInvestment = buyPrice * shares
  const saleProceeds = sellPrice * shares
  const capitalGain = saleProceeds - initialInvestment
  const totalDividends = divPerShare * shares * years
  const totalReturn = capitalGain + totalDividends
  const totalReturnPct = initialInvestment > 0 ? (totalReturn / initialInvestment) * 100 : 0
  const capitalGainPct = initialInvestment > 0 ? (capitalGain / initialInvestment) * 100 : 0
  const dividendReturnPct = initialInvestment > 0 ? (totalDividends / initialInvestment) * 100 : 0
  const cagr = years > 0 && initialInvestment > 0 ? (Math.pow((initialInvestment + totalReturn) / initialInvestment, 1 / years) - 1) * 100 : 0
  const annualDivYield = buyPrice > 0 ? (divPerShare / buyPrice) * 100 : 0
  const isPositive = totalReturn >= 0

  const hint = `Your ${years}-year total return is ${fmtP(totalReturnPct)} (CAGR: ${fmtP(cagr)}). ${totalDividends > 0 ? `Dividends contributed ${fmtP(dividendReturnPct)} of your return — ${Math.round(dividendReturnPct / Math.max(0.01, Math.abs(totalReturnPct)) * 100)}% of total gains.` : 'Adding a dividend-paying stock would further boost returns.'}`

  function applyExample(ex) {
    setBuyPrice(ex.buyPrice)
    setSellPrice(ex.sellPrice)
    setShares(ex.shares)
    setDivPerShare(ex.divPerShare)
    setYears(ex.years)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleReset() {
    setBuyPrice(50)
    setSellPrice(92)
    setShares(100)
    setDivPerShare(1.80)
    setYears(5)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
              Stock & Investment Details
            </div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Buy Price per Share" hint="Purchase price" value={buyPrice} onChange={setBuyPrice} prefix={sym} min={0.01} catColor={catColor} />
            <FieldInput label="Number of Shares" hint="shares" value={shares} onChange={setShares} min={1} catColor={catColor} />
            <FieldInput label="Sell Price per Share" hint="Exit price" value={sellPrice} onChange={setSellPrice} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Annual Dividend per Share" hint="0 if no dividend" value={divPerShare} onChange={setDivPerShare} prefix={sym} min={0} catColor={catColor} />

            {/* Holding period toggle */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Holding Period</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[1, 2, 3, 5, 10, 20].map(y => (
                  <button key={y} onClick={() => setYears(y)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: years === y ? catColor : 'var(--border)', background: years === y ? catColor : 'var(--bg-raised)', color: years === y ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>
                    {y}yr
                  </button>
                ))}
              </div>
              <FieldInput label="Custom Years" value={years} onChange={setYears} min={0.1} suffix="years" catColor={catColor} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
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
              label="Total Return"
              value={fmtP(totalReturnPct)}
              sub={`${isPositive ? '+' : ''}${fmt(totalReturn, sym)} over ${years} year${years !== 1 ? 's' : ''}`}
              color={isPositive ? catColor : '#ef4444'}
            />
            <BreakdownTable title="Return Summary" rows={[
              { label: 'Initial Investment', value: fmt(initialInvestment, sym), highlight: true },
              { label: 'Sale Proceeds', value: fmt(saleProceeds, sym) },
              { label: 'Capital Gain / Loss', value: fmtD(capitalGain, sym), color: capitalGain >= 0 ? catColor : '#ef4444', note: `${fmtP(capitalGainPct)} price return` },
              { label: 'Total Dividends Collected', value: fmt(totalDividends, sym), color: '#10b981', note: `${fmtP(dividendReturnPct)} dividend return` },
              { label: 'Total Return', value: fmtD(totalReturn, sym), bold: true, color: isPositive ? catColor : '#ef4444' },
              { label: 'CAGR (Annualised)', value: fmtP(cagr), color: cagr >= 0 ? catColor : '#ef4444', bold: true, highlight: true },
              { label: 'Annual Dividend Yield', value: fmtP(annualDivYield), note: 'on cost' },
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* Formula */}
      <Section title="Formula Explained" subtitle="The math behind your stock return">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'pre', lineHeight: 1.9 }}>
          {`Capital Gain = (Sell − Buy) × Shares\nTotal Dividends = Div/share × Shares × Years\nTotal Return = Capital Gain + Dividends\nCAGR = (End / Start)^(1/Years) − 1`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            ['Capital Gain', 'Profit from price appreciation only'],
            ['Dividends', 'Annual income paid per share × years'],
            ['Total Return', 'Combined gain from price + dividends'],
            ['CAGR', 'Annualised compounding growth rate'],
          ].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: catColor, fontFamily: 'monospace', flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          Total stock return combines two sources: capital appreciation (price growth) and dividend income. CAGR converts the total return into an annualised rate, enabling fair comparison across different holding periods. Most professional performance measurement uses total return, as dividends are a core part of stock investing.
        </p>
      </Section>

      {/* Return Breakdown Visual */}
      <Section title="Return Breakdown" subtitle="How your gains are split between price and dividends">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>
                {['Source', 'Amount', 'Return %', 'Share of Total'].map((h, i) => (
                  <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Capital Gain', value: capitalGain, pct: capitalGainPct, color: capitalGain >= 0 ? catColor : '#ef4444' },
                { label: 'Dividends', value: totalDividends, pct: dividendReturnPct, color: '#10b981' },
                { label: 'Total Return', value: totalReturn, pct: totalReturnPct, color: isPositive ? catColor : '#ef4444', bold: true },
              ].map((row, i) => (
                <tr key={i} style={{ background: row.bold ? catColor + '08' : 'transparent' }}>
                  <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: row.bold ? 700 : 400, color: row.bold ? catColor : 'var(--text)' }}>{row.label} {row.bold && '✓'}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: row.color, textAlign: 'right' }}>{fmtD(row.value, sym)}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: row.color, textAlign: 'right' }}>{fmtP(row.pct)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <div style={{ height: 7, background: 'var(--bg-raised)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, Math.abs(row.pct) / Math.max(1, Math.abs(totalReturnPct)) * 100))}%`, height: '100%', background: row.color, borderRadius: 4, transition: 'width .4s' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Real World Examples */}
      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)}
              style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Buy', `${sym}${ex.buyPrice}`], ['Sell', `${sym}${ex.sellPrice}`], ['Div/sh', `${sym}${ex.divPerShare}`], ['Hold', `${ex.years}yr`]].map(([k, v]) => (
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

      {/* Real World Context */}
      <Section title="Real World Context" subtitle="How does your return compare?">
        {[
          { label: 'S&P 500 historical average', note: '~10% annualised total return (includes dividends)' },
          { label: 'Dividend contribution', note: 'Dividends account for ~40% of S&P 500 long-run total return' },
          { label: '20-year holding period', note: '$10,000 at 10% CAGR grows to ~$67,000' },
        ].map((ex, i, arr) => (
          <div key={i} style={{ padding: '9px 0', borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{ex.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{ex.note}</div>
          </div>
        ))}
      </Section>

      {/* Glossary */}
      <Section title="Key Terms" subtitle="Stock return terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Frequently Asked Questions" subtitle="Everything about stock returns">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>
    </div>
  )
}
