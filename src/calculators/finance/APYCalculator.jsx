import { useState, useEffect } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n) => (Math.round(n * 10000) / 10000).toFixed(4)

const EXAMPLES = [
  { title: 'High-Yield Savings', desc: 'Top online savings account rate', apr: 5.0, principal: 10000 },
  { title: 'CD Investment',      desc: '12-month certificate of deposit', apr: 5.25, principal: 25000 },
  { title: 'Money Market',       desc: 'Money market account average',   apr: 4.5, principal: 5000 },
]
const FREQS = [
  { label: 'Annually',      n: 1 },
  { label: 'Semi-annually', n: 2 },
  { label: 'Quarterly',     n: 4 },
  { label: 'Monthly',       n: 12 },
  { label: 'Daily',         n: 365 },
  { label: 'Continuously',  n: Infinity },
]
const FAQ = [
  { q: 'What is the difference between APR and APY?', a: 'APR (Annual Percentage Rate) is the stated interest rate without accounting for compounding. APY (Annual Percentage Yield) includes compounding and reflects what you actually earn. For the same APR, more frequent compounding gives a higher APY. Always compare savings accounts using APY — it\'s the true measure of what you earn.' },
  { q: 'Why does compounding frequency matter?', a: 'When interest is added to your balance more frequently, it starts earning interest itself sooner. Daily compounding earns slightly more than monthly, which earns more than annual. At 5% APR: annual compounding gives 5% APY; monthly gives 5.1162% APY; daily gives 5.1267% APY. The difference compounds significantly over years.' },
  { q: 'What is continuous compounding?', a: 'Continuous compounding is the mathematical limit of compounding infinitely frequently. The formula is APY = e^(APR) − 1, where e ≈ 2.718. In practice, no bank compounds continuously — daily is the most frequent you\'ll find. Continuous compounding is mainly used in theoretical finance and options pricing.' },
  { q: 'How do I compare savings accounts using APY?', a: 'Always compare accounts using APY, not APR. A bank advertising 5% APR with monthly compounding has a 5.116% APY. Another offering 5.05% APR with daily compounding has a 5.178% APY — actually better despite the lower headline rate. APY standardises the comparison regardless of compounding frequency.' },
]
const GLOSSARY = [
  { term: 'APR', def: 'Annual Percentage Rate — the stated interest rate without adjusting for how often interest compounds.' },
  { term: 'APY', def: 'Annual Percentage Yield — the true effective rate including compounding. Always higher than APR.' },
  { term: 'Compounding', def: 'Earning interest on previously earned interest. The more frequent the compounding, the higher your effective return.' },
  { term: 'Daily Periodic Rate', def: 'APR ÷ 365. The rate applied to your balance each day for daily-compounding accounts.' },
  { term: 'Continuous Compounding', def: 'The theoretical limit of compounding — APY = e^APR − 1. Used in finance theory.' },
  { term: 'Nominal Rate', def: 'The stated rate before compounding adjustments — equivalent to APR in this context.' },
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

export default function APYCalculator({ meta, category }) {
  const [apr, setApr] = useState(5.0)
  const [principal, setPrincipal] = useState(10000)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const calcAPY = (n) => n === Infinity ? Math.exp(apr / 100) - 1 : (Math.pow(1 + apr / 100 / n, n) - 1)
  const monthlyAPY = calcAPY(12)
  const monthlyInterest = principal * monthlyAPY

  function applyExample(ex) { setApr(ex.apr); setPrincipal(ex.principal) }

  const hint = `APR of ${apr}% compounds to ${fmtD(monthlyAPY * 100)}% APY (monthly). On ${fmt(principal, sym)}, that earns ${fmt(monthlyInterest, sym)}/year vs ${fmt(principal * apr / 100, sym)} with no compounding.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Rate Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Percentage Rate (APR)" value={apr} onChange={setApr} suffix="%" min={0} max={50} catColor={catColor} />
          <FieldInput label="Principal Amount" value={principal} onChange={setPrincipal} prefix={sym} min={1} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setApr(5.0); setPrincipal(10000) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="APY (Monthly Compounding)" value={Math.round(monthlyAPY * 1000000) / 10000} formatter={n => n.toFixed(4) + '%'} sub={`On ${fmt(principal, sym)}: ${fmt(monthlyInterest, sym)}/year`} color={catColor} />
          <BreakdownTable title="APR vs APY Summary" rows={[
            { label: 'Your APR',           value: `${apr}%` },
            { label: 'APY (monthly)',       value: `${fmtD(calcAPY(12) * 100)}%`, color: catColor, bold: true, highlight: true },
            { label: 'APY (daily)',         value: `${fmtD(calcAPY(365) * 100)}%`, color: catColor },
            { label: 'Interest (monthly compounding)', value: fmt(monthlyInterest, sym), color: '#10b981' },
            { label: 'Interest (no compounding)',      value: fmt(principal * apr / 100, sym) },
            { label: 'Compounding bonus',  value: fmt(monthlyInterest - principal * apr / 100, sym), color: '#10b981' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How APR converts to APY">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Standard Compounding', formula: 'APY = (1 + APR/n)^n − 1' },
            { label: 'Continuous Compounding', formula: 'APY = e^APR − 1' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['APR', 'Annual Percentage Rate — stated rate'], ['n', 'Compounding periods per year'], ['APY', 'Annual Percentage Yield — true earned rate'], ['e', 'Euler\'s number ≈ 2.71828']].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', minWidth: 28, flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>APY is always higher than APR (except for annual compounding where they are equal). The more frequently interest compounds, the higher the APY. Use APY to compare savings accounts — it accounts for compounding frequency and gives the true annual return.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['APR', `${ex.apr}%`], ['Principal', `${sym}${ex.principal.toLocaleString()}`], ['APY (monthly)', `${fmtD(calcAPY(12) * 100)}%`]].map(([k, v]) => (
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

      <Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="APY by Compounding Frequency" subtitle="See how compounding frequency affects your actual return">
        <div style={{ overflow: 'hidden', borderRadius: 10, border: '0.5px solid var(--border)' }}>
          {FREQS.map((f, i) => {
            const apy = calcAPY(f.n) * 100
            const interest = principal * calcAPY(f.n)
            const isMost = f.n === 12
            return (
              <div key={f.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < FREQS.length - 1 ? '0.5px solid var(--border)' : 'none', background: isMost ? catColor + '08' : 'transparent' }}>
                <span style={{ fontSize: 12, color: isMost ? catColor : 'var(--text-2)', fontWeight: isMost ? 700 : 400 }}>{f.label} {isMost && '← Most common'}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isMost ? catColor : 'var(--text)' }}>{fmtD(apy)}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{fmt(interest, sym)}/yr</div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about APY and compounding">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
