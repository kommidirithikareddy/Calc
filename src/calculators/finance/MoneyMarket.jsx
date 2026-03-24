import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, sym = '$') => sym + (Math.round(n * 100) / 100).toFixed(2)
const fmtP = n => n.toFixed(3) + '%'

const TIERS = [
  { label: 'Basic',    minBal: 0,       rate: 4.50 },
  { label: 'Plus',     minBal: 10000,   rate: 4.75 },
  { label: 'Premium',  minBal: 50000,   rate: 5.00 },
  { label: 'Elite',    minBal: 100000,  rate: 5.25 },
]

const COMPOUND_FREQS = [
  { label: 'Daily',     n: 365 },
  { label: 'Monthly',   n: 12  },
  { label: 'Quarterly', n: 4   },
  { label: 'Annually',  n: 1   },
]

const EXAMPLES = [
  { title: 'Emergency Fund',   desc: 'Park 6 months of expenses',     balance: 18000, rate: 4.75, months: 12, freq: 365 },
  { title: 'Short-term Goal',  desc: 'House down payment savings',    balance: 50000, rate: 5.00, months: 24, freq: 365 },
  { title: 'Cash Reserve',     desc: 'Business operating reserve',    balance: 100000,rate: 5.25, months: 6,  freq: 365 },
]

const FAQ = [
  { q: 'What is a money market account?', a: 'A money market account (MMA) is a bank deposit account that typically offers higher interest rates than regular savings accounts in exchange for a higher minimum balance requirement. MMAs are FDIC-insured up to $250,000, offer check-writing and debit card access (usually limited to 6 transactions/month), and are ideal for emergency funds and short-term savings.' },
  { q: 'What is the difference between APR and APY?', a: 'APR (Annual Percentage Rate) is the stated interest rate without accounting for compounding. APY (Annual Percentage Yield) includes the effect of compounding — it is the rate you actually earn. Daily compounding turns a 5.00% APR into a 5.127% APY. Always compare APY when evaluating savings accounts.' },
  { q: 'How do tiered interest rates work?', a: 'Many money market accounts pay different rates based on your balance. Higher balances qualify for higher rate tiers. Importantly, the higher rate typically applies only to the portion of the balance in that tier (marginal), not the entire balance. Some accounts pay the highest qualifying rate on the full balance (blended).' },
  { q: 'How does money market compare to a CD?', a: 'A CD (Certificate of Deposit) typically offers a slightly higher rate but locks your money for a fixed term with early withdrawal penalties. A money market account offers flexibility — you can access funds anytime (with transaction limits). For emergency funds, the MMA flexibility is worth the small rate difference.' },
  { q: 'Is a money market account the same as a money market fund?', a: 'No. A money market account is an FDIC-insured bank deposit (principal guaranteed). A money market fund is a type of mutual fund that invests in short-term securities — not FDIC insured, though it aims to maintain $1/share value. Bank MMAs are safer; money market funds may offer slightly higher yields.' },
]

const GLOSSARY = [
  { term: 'APY',              def: 'Annual Percentage Yield — the actual return earned when compounding is factored in. Always higher than APR for the same rate.' },
  { term: 'APR',              def: 'Annual Percentage Rate — the stated rate before compounding. Use APY for fair comparisons.' },
  { term: 'Tiered Rate',      def: 'Different interest rates for different balance ranges. Higher balances unlock higher rates.' },
  { term: 'Compounding',      def: 'Earning interest on previously earned interest. Daily compounding maximises the effective yield.' },
  { term: 'FDIC Insurance',   def: 'Federal Deposit Insurance Corporation — insures bank deposits up to $250,000 per account type per bank.' },
  { term: 'Liquidity',        def: 'How easily an asset can be converted to cash. MMAs offer high liquidity with up to 6 free withdrawals/month.' },
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

export default function MoneyMarket({ meta, category }) {
  const [balance,  setBalance]  = useState(18000)
  const [apr,      setApr]      = useState(4.75)
  const [months,   setMonths]   = useState(12)
  const [freqIdx,  setFreqIdx]  = useState(0)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const freq   = COMPOUND_FREQS[freqIdx]
  const n      = freq.n
  const t      = months / 12
  const apy    = (Math.pow(1 + apr / 100 / n, n) - 1) * 100
  const fv     = balance * Math.pow(1 + apr / 100 / n, n * t)
  const interest = fv - balance
  const monthly  = interest / months
  const activeTier = [...TIERS].reverse().find(t => balance >= t.minBal) || TIERS[0]

  function applyExample(ex) {
    setBalance(ex.balance); setApr(ex.rate); setMonths(ex.months)
    setFreqIdx(COMPOUND_FREQS.findIndex(f => f.n === ex.freq))
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Account Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Deposit Balance" value={balance} onChange={setBalance} prefix={sym} catColor={catColor} />
            <FieldInput label="Annual Interest Rate (APR)" value={apr} onChange={setApr} suffix="%" max={20} catColor={catColor} hint="Check current rates" />
            <FieldInput label="Holding Period" value={months} onChange={setMonths} suffix="months" max={120} catColor={catColor} />

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Compounding Frequency</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {COMPOUND_FREQS.map((f, i) => (
                  <button key={i} onClick={() => setFreqIdx(i)} style={{ padding: '6px 12px', borderRadius: 7, border: `1.5px solid ${freqIdx === i ? catColor : 'var(--border)'}`, background: freqIdx === i ? catColor + '15' : 'var(--bg-raised)', color: freqIdx === i ? catColor : 'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>{f.label}</button>
                ))}
              </div>
            </div>

            {/* Tier indicator */}
            <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: catColor + '0d', border: `1px solid ${catColor}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'DM Sans',sans-serif" }}>Rate Tier: {activeTier.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: catColor, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>APY {fmtP(apy)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>APR {fmtP(apr)} → APY {fmtP(apy)}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Compounding: {freq.label}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setBalance(18000); setApr(4.75); setMonths(12); setFreqIdx(0) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Interest Earned" value={interest} formatter={n => fmtD(n, sym)} sub={`${fmtD(monthly, sym)}/month avg over ${months} months`} color={catColor} />
            <BreakdownTable title="Earnings Summary" rows={[
              { label: 'Opening Balance',       value: fmt(balance, sym),     color: catColor },
              { label: 'APR (stated rate)',      value: fmtP(apr) },
              { label: 'APY (effective yield)',  value: fmtP(apy),            color: '#10b981', bold: true },
              { label: 'Compounding',            value: freq.label },
              { label: 'Holding Period',         value: `${months} months` },
              { label: 'Total Interest Earned',  value: fmtD(interest, sym),  color: catColor, bold: true },
              { label: 'Closing Balance',        value: fmtD(fv, sym),        highlight: true },
            ]} />
            <AIHintCard hint={`At ${fmtP(apr)} APR with ${freq.label.toLowerCase()} compounding, your effective APY is ${fmtP(apy)}. ${fmt(balance, sym)} over ${months} months earns ${fmtD(interest, sym)} in interest.`} />
          </>}
        />
      </div>

      {/* Tiered rates table */}
      <Section title="Illustrative Rate Tiers" subtitle="Example tiered structure — check your bank for actual rates">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Tier', 'Min Balance', 'APR', 'APY (Daily)', 'Your Status'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {TIERS.map((t, i) => {
                const apyT = (Math.pow(1 + t.rate / 100 / 365, 365) - 1) * 100
                const isActive = t.label === activeTier.label
                return (
                  <tr key={i} style={{ background: isActive ? catColor + '12' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? catColor : 'var(--text)' }}>{t.label}{isActive ? ' ✓' : ''}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{t.minBal === 0 ? 'Any' : fmt(t.minBal, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmtP(t.rate)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>{fmtP(apyT)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, textAlign: 'right', color: isActive ? catColor : 'var(--text-3)', fontWeight: isActive ? 700 : 400 }}>{balance >= t.minBal ? '✓ Eligible' : `Need ${fmt(t.minBal - balance, sym)} more`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Rate comparison */}
      <Section title="Compounding Frequency Comparison" subtitle={`How ${fmtP(apr)} APR becomes different APYs`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Frequency', 'APY', `Interest on ${fmt(balance, sym)}/yr`, 'vs Daily'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {COMPOUND_FREQS.map((f, i) => {
                const apyF = (Math.pow(1 + apr / 100 / f.n, f.n) - 1) * 100
                const intF = balance * apyF / 100
                const intDaily = balance * ((Math.pow(1 + apr / 100 / 365, 365) - 1))
                const diff = intF - intDaily
                const isSelected = i === freqIdx
                return (
                  <tr key={i} style={{ background: isSelected ? catColor + '12' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? catColor : 'var(--text)' }}>{f.label}{isSelected ? ' ✓' : ''}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', textAlign: 'right' }}>{fmtP(apyF)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmtD(intF, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, textAlign: 'right', color: diff >= 0 ? 'var(--text-3)' : '#ef4444' }}>{diff >= 0 ? 'Best' : fmtD(diff, sym)}</td>
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
              {[['Balance', fmt(ex.balance, sym)], ['Rate', fmtP(ex.rate)], ['Period', `${ex.months}mo`]].map(([k, v]) => (
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
          APY = (1 + APR/n)ⁿ − 1{'\n'}
          FV  = Balance × (1 + APR/n)^(n×t){'\n'}
          Interest = FV − Opening Balance
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          APY converts the stated APR into the true annual yield by accounting for compounding. Daily compounding (n=365) produces the highest APY for a given APR. The difference between daily and annual compounding is small for typical rates but meaningful on large balances held long-term.
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
