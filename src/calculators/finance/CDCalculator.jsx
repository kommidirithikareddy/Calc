import { useState, useEffect } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'
const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, d = 2) => (Math.round(n * Math.pow(10,d)) / Math.pow(10,d)).toFixed(d)

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

const EXAMPLES = [
  { title: '1-Year CD',    desc: 'Short-term, top bank rate',   principal: 10000, apr: 5.25, months: 12, compounding: 12 },
  { title: '2-Year CD',    desc: 'Medium term, locked in rate', principal: 25000, apr: 4.8,  months: 24, compounding: 12 },
  { title: '5-Year Jumbo', desc: 'Long-term high-balance CD',   principal: 100000,apr: 4.5,  months: 60, compounding: 365 },
]
const FAQ = [
  { q: 'What is a CD?', a: 'A Certificate of Deposit (CD) is a federally insured time deposit offered by banks. You agree to leave your money deposited for a fixed term (3 months to 5 years) in exchange for a guaranteed fixed interest rate — typically higher than a regular savings account. Early withdrawal triggers a penalty, usually several months of interest.' },
  { q: 'What happens at CD maturity?', a: 'When a CD matures, you have a grace period (typically 7-10 days) to withdraw funds, renew the CD, or move to a different product. If you do nothing, most banks automatically renew at the current market rate — which may be higher or lower than your original rate. Set a calendar reminder before maturity.' },
  { q: 'What is the early withdrawal penalty?', a: 'Most CDs charge a penalty for withdrawing before maturity — typically 3 months of interest for short-term CDs and 6-12 months for longer ones. Before opening a CD, calculate the break-even point: if you might need the money, a no-penalty CD or high-yield savings account may be better despite a slightly lower rate.' },
  { q: 'Should I use a CD ladder strategy?', a: 'A CD ladder splits your money across multiple CDs with staggered maturities (e.g., 1-year, 2-year, 3-year). This gives you regular access to some funds as each CD matures while still earning higher long-term rates. When each CD matures, you renew at whatever the current long-term rate is.' },
]
const GLOSSARY = [
  { term: 'CD',             def: 'Certificate of Deposit — a bank account offering a fixed interest rate for a fixed term.' },
  { term: 'Maturity Value', def: 'The total amount you receive at the end of the CD term, including principal and all interest earned.' },
  { term: 'APY',            def: 'Annual Percentage Yield — the effective annual return accounting for compounding.' },
  { term: 'Grace Period',   def: 'A short window after CD maturity (typically 7-10 days) to withdraw or reinvest without penalty.' },
  { term: 'CD Ladder',      def: 'A strategy of splitting funds across CDs with staggered maturity dates for liquidity and rate optimization.' },
  { term: 'Early Withdrawal Penalty', def: 'A fee charged for accessing CD funds before the maturity date, usually 3-12 months of interest.' },
]

export default function CDCalculator({ meta, category }) {
  const [principal, setPrincipal] = useState(10000)
  const [apr, setApr] = useState(5.25)
  const [months, setMonths] = useState(12)
  const [compounding, setCompounding] = useState(12)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const yrs = months / 12
  const maturityValue = principal * Math.pow(1 + apr / 100 / compounding, compounding * yrs)
  const interest = maturityValue - principal
  const apy = (Math.pow(1 + apr / 100 / compounding, compounding) - 1) * 100

  function applyExample(ex) { setPrincipal(ex.principal); setApr(ex.apr); setMonths(ex.months); setCompounding(ex.compounding) }

  const hint = `Your ${fmt(principal, sym)} CD at ${apr}% APR matures to ${fmt(maturityValue, sym)} after ${months} months. Effective APY: ${fmtD(apy, 4)}%. Interest earned: ${fmt(interest, sym)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>CD Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Deposit Amount" value={principal} onChange={setPrincipal} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Annual Rate (APR)" hint="Rate offered by bank" value={apr} onChange={setApr} suffix="%" min={0} max={20} catColor={catColor} />
          <FieldInput label="Term" value={months} onChange={setMonths} suffix="months" min={1} max={120} catColor={catColor} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Compounding Frequency</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[{ label: 'Monthly', n: 12 }, { label: 'Quarterly', n: 4 }, { label: 'Daily', n: 365 }].map(f => (
                <button key={f.n} onClick={() => setCompounding(f.n)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: compounding === f.n ? catColor : 'var(--border)', background: compounding === f.n ? catColor : 'var(--bg-raised)', color: compounding === f.n ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setPrincipal(10000); setApr(5.25); setMonths(12); setCompounding(12) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="Maturity Value" value={Math.round(maturityValue)} formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()} sub={`After ${months} months at ${apr}% APR`} color={catColor} />
          <BreakdownTable title="CD Summary" rows={[
            { label: 'Principal',       value: fmt(principal, sym), color: catColor },
            { label: 'Interest Earned', value: fmt(interest, sym), color: '#10b981' },
            { label: 'Maturity Value',  value: fmt(maturityValue, sym), color: catColor, bold: true, highlight: true },
            { label: 'Effective APY',   value: `${fmtD(apy, 4)}%`, color: catColor },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How your CD balance compounds">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Maturity Value',  formula: 'FV = P × (1 + APR/n)^(n×t)' },
            { label: 'Effective APY',   formula: 'APY = (1 + APR/n)^n − 1' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['P', 'Principal — initial deposit amount'], ['APR', 'Annual rate offered by the bank'], ['n', 'Compounding periods per year'], ['t', 'Term in years = months ÷ 12']].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 24, flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Daily compounding produces slightly more than monthly compounding at the same APR. However, the quoted APY already accounts for compounding — when comparing CDs, compare APY directly. A CD quoting 5.10% APY beats one quoting 5.25% APR with monthly compounding (5.116% APY).</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Deposit', `${sym}${ex.principal.toLocaleString()}`], ['APR', `${ex.apr}%`], ['Term', `${ex.months} mo`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span><span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{v}</span></div>
              ))}
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: catColor }}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="CD Term Comparison" subtitle="How term length affects your return">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead><tr>{['Term', 'APY', 'Maturity Value', 'Interest'].map((h, i) => (
              <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[3, 6, 12, 24, 36, 60].map((m, i) => {
                const yrsM = m / 12
                const mv = principal * Math.pow(1 + apr / 100 / compounding, compounding * yrsM)
                const apyM = (Math.pow(1 + apr / 100 / compounding, compounding) - 1) * 100
                const isCurrent = m === months
                return (
                  <tr key={m} style={{ background: isCurrent ? catColor + '08' : i % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{m} months {isCurrent && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmtD(apyM, 4)}%</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: catColor, textAlign: 'right' }}>{fmt(mv, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#10b981', textAlign: 'right' }}>{fmt(mv - principal, sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about CDs">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
