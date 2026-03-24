import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
const fmt = n => Math.round(n).toLocaleString()

const EXAMPLES = [
  { title: 'Savings Account', desc: 'Typical high-yield savings rate', rate: 4.5 },
  { title: 'Stock Market', desc: 'Historical S&P 500 average return', rate: 10 },
  { title: 'Real Estate', desc: 'Average property appreciation', rate: 7 },
]

const FAQ = [
  { q: 'What is the Rule of 72?', a: 'The Rule of 72 is a simple mental math shortcut to estimate how long it takes for an investment to double at a fixed annual return. Divide 72 by the annual interest rate and you get the approximate number of years to double your money. At 6%, money doubles in about 12 years (72 ÷ 6 = 12).' },
  { q: 'How accurate is the Rule of 72?', a: 'It is most accurate for interest rates between 6% and 10%. For very low rates (under 3%) or very high rates (over 20%), the approximation becomes less precise. The exact calculation uses the natural logarithm: Years = ln(2) / ln(1 + r). The Rule of 72 is a close approximation of this.' },
  { q: 'Can I use it for inflation too?', a: 'Yes — the Rule of 72 works for any exponential growth or decay. Divide 72 by the inflation rate to see how long until prices double, or by an interest rate to see how long until debt doubles if unpaid. At 3% inflation, prices double every 24 years.' },
  { q: 'What is the Rule of 69 and 70?', a: 'Rule of 69 is more accurate for continuously compounded interest. Rule of 70 is a middle ground often used for quick mental math on inflation. Rule of 72 is most popular for annual compounding because 72 has many integer factors (2, 3, 4, 6, 8, 9, 12), making mental division easy.' },
  { q: 'How does compounding frequency affect doubling time?', a: 'More frequent compounding (monthly vs annual) reduces doubling time slightly. At 6% annual compounding, money doubles in ~12 years. At 6% monthly compounding, it doubles in ~11.6 years. The Rule of 72 assumes annual compounding — for monthly compounding, use 72 divided by the annual rate still gives a good approximation.' },
]

const GLOSSARY = [
  { term: 'Rule of 72', def: 'A mental math shortcut: divide 72 by the annual return % to estimate years to double an investment.' },
  { term: 'Doubling Time', def: 'The number of years required for an investment to grow to twice its original value at a given rate.' },
  { term: 'Compound Interest', def: 'Interest calculated on both the principal and accumulated interest — the engine behind exponential growth.' },
  { term: 'CAGR', def: 'Compound Annual Growth Rate — the rate at which an investment grows year over year, assuming reinvestment.' },
  { term: 'Exponential Growth', def: 'Growth where the rate of increase is proportional to the current value — produces a J-shaped curve over time.' },
  { term: 'Real Return', def: 'Investment return after subtracting inflation. If your return is 7% and inflation is 3%, your real return is ~4%.' },
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

export default function RuleOf72({ meta, category }) {
  const catColor = category?.color || '#6366f1'
  const calcRef = useRef(null)
  const [rate, setRate] = useState(7)
  const [principal, setPrincipal] = useState(10000)
  const [openFaq, setOpenFaq] = useState(null)

  const yearsRule72 = rate > 0 ? 72 / rate : 0
  const yearsExact = rate > 0 ? Math.log(2) / Math.log(1 + rate / 100) : 0
  const doubledValue = principal * 2
  const tripleYears = rate > 0 ? Math.log(3) / Math.log(1 + rate / 100) : 0
  const tenxYears = rate > 0 ? Math.log(10) / Math.log(1 + rate / 100) : 0

  function applyExample(ex) {
    setRate(ex.rate)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
              Investment Details
            </div>
            <FieldInput label="Annual Interest Rate" hint="APR / expected return" value={rate} onChange={setRate} suffix="%" min={0.1} max={100} catColor={catColor} />
            <FieldInput label="Initial Investment" hint="Starting amount" value={principal} onChange={setPrincipal} prefix="$" min={1} catColor={catColor} />

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Common Rates</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[2, 4, 6, 8, 10, 12].map(r => (
                  <button key={r} onClick={() => setRate(r)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: rate === r ? catColor : 'var(--border)', background: rate === r ? catColor : 'var(--bg-raised)', color: rate === r ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>{r}%</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setRate(7); setPrincipal(10000) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>Reset</button>
            </div>
          </>}

          right={<>
            <ResultHero
              label="Years to Double"
              value={yearsRule72.toFixed(1)}
              sub={`Exact: ${yearsExact.toFixed(2)} years · $${fmt(principal)} → $${fmt(doubledValue)}`}
              color={catColor}
            />
            <BreakdownTable title="Growth Milestones" rows={[
              { label: 'Initial Investment', value: `$${fmt(principal)}`, highlight: true },
              { label: 'Double (2×)', value: `$${fmt(doubledValue)}`, color: catColor, note: `${yearsExact.toFixed(1)} years` },
              { label: 'Triple (3×)', value: `$${fmt(principal * 3)}`, color: catColor, note: `${tripleYears.toFixed(1)} years` },
              { label: '10× Growth', value: `$${fmt(principal * 10)}`, color: catColor, note: `${tenxYears.toFixed(1)} years` },
              { label: 'Rule of 72 estimate', value: `${yearsRule72.toFixed(2)} yrs`, bold: true },
              { label: 'Exact doubling time', value: `${yearsExact.toFixed(2)} yrs`, bold: true, highlight: true },
              { label: 'Difference (error)', value: `${Math.abs(yearsRule72 - yearsExact).toFixed(3)} yrs`, note: 'approximation accuracy' },
            ]} />
            <AIHintCard
              hint={`At ${rate}%, your money doubles every ${yearsRule72.toFixed(1)} years (Rule of 72). The exact answer is ${yearsExact.toFixed(2)} years — the rule is off by only ${Math.abs(yearsRule72 - yearsExact).toFixed(2)} years. In ${Math.round(yearsExact * 2)} years your $${fmt(principal)} would grow to roughly $${fmt(principal * 4)}.`}
              color={catColor}
            />
          </>}
        />
      </div>

      <Section title="Formula Explained" subtitle="The math behind the Rule of 72">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, lineHeight: 1.9, whiteSpace: 'pre' }}>
          {`Rule of 72:  Years ≈ 72 ÷ Rate\nExact:       Years = ln(2) ÷ ln(1 + r)`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['72', 'Magic constant (approximates 100 × ln 2)'], ['Rate', 'Annual return or interest rate (%)'], ['ln(2)', 'Natural log of 2 ≈ 0.693'], ['r', 'Decimal rate = Rate ÷ 100']].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          The number 72 is chosen because it has many divisors (2, 3, 4, 6, 8, 9, 12, 24, 36) making mental math easy. It is a close approximation of 100 × ln(2) ≈ 69.3. The rule is most accurate between 6–10% annual returns.
        </p>
      </Section>

      <Section title="Rate Comparison" subtitle="How doubling time changes across different rates">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>{['Rate', 'Rule of 72', 'Exact Years', '$10k grows to', 'After 30 yrs'].map((h, i) => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[2, 4, 6, 8, 10, 12].map(r => {
                const y72 = 72 / r
                const yEx = Math.log(2) / Math.log(1 + r / 100)
                const val30 = 10000 * Math.pow(1 + r / 100, 30)
                const isCurrent = r === rate
                return (
                  <tr key={r} style={{ background: isCurrent ? catColor + '08' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{r}% {isCurrent && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{y72.toFixed(1)} yrs</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>{yEx.toFixed(2)} yrs</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: catColor, textAlign: 'right' }}>${fmt(20000)} (2×)</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: catColor, textAlign: 'right' }}>${fmt(val30)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)}
              style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Rate', `${ex.rate}%`], ['Doubles in', `${(72 / ex.rate).toFixed(1)} yrs`]].map(([k, v]) => (
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

      <Section title="Key Terms" subtitle="Rule of 72 terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about the Rule of 72">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>
    </div>
  )
}
