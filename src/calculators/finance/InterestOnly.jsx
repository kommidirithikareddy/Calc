import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()

const EXAMPLES = [
  { title: 'Starter Home', desc: 'Interest-only phase on a small mortgage', loanAmt: 300000, rate: 6.5, ioYears: 5, totalYears: 30 },
  { title: 'Investment Property', desc: 'Maximise cash flow on a rental', loanAmt: 500000, rate: 7.0, ioYears: 10, totalYears: 30 },
  { title: 'Jumbo Mortgage', desc: 'High-value home, interest-only bridge', loanAmt: 1000000, rate: 7.25, ioYears: 7, totalYears: 30 },
]

const FAQ = [
  { q: 'What is an interest-only loan?', a: 'An interest-only loan requires payments that cover only the interest for a set period (typically 5-10 years). During this phase, the principal balance does not decrease. After the interest-only period ends, payments reset to cover both principal and interest, which significantly increases the monthly payment.' },
  { q: 'Who benefits from an interest-only mortgage?', a: 'Interest-only loans can benefit investors who want to maximise cash flow on rental properties, borrowers who expect income to rise significantly, or those who plan to sell before the interest-only period ends. They are also used in high-cost markets where full P&I payments are unaffordable initially.' },
  { q: 'What are the risks of interest-only loans?', a: 'The biggest risk is payment shock — when the interest-only period ends, payments jump substantially because you now pay principal over a shorter remaining term. Additionally, you build no equity during the IO period, leaving you vulnerable if property values drop. You could owe more than the property is worth.' },
  { q: 'How does equity build differently?', a: 'With a standard mortgage, every payment builds equity through principal paydown. With interest-only, equity grows only through property appreciation during the IO period — not through your payments. Once the IO period ends and P&I payments begin, equity starts building through paydown.' },
  { q: 'Can I pay extra principal during the interest-only period?', a: 'Yes — most interest-only loans allow voluntary extra principal payments. Making extra principal payments during the IO period reduces the balance on which future interest accrues, lowers your post-IO payment, and builds equity. This combines the low minimum payment flexibility with meaningful principal reduction.' },
]

const GLOSSARY = [
  { term: 'Interest-Only Period', def: 'The phase of the loan where payments cover only interest, not principal. The balance stays flat during this time.' },
  { term: 'Payment Shock', def: 'The sudden increase in monthly payment when the interest-only period ends and principal repayment begins.' },
  { term: 'Amortisation', def: 'The gradual reduction of loan principal through scheduled payments. Does not occur during the interest-only phase.' },
  { term: 'Principal', def: 'The original loan amount. Does not decrease during the interest-only period (unless extra payments are made).' },
  { term: 'LTV Ratio', def: 'Loan-to-Value ratio — the loan amount divided by the property value. IO loans can result in LTV staying high.' },
  { term: 'Equity', def: 'The portion of the property you own outright. During IO period, equity only grows through price appreciation.' },
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

export default function InterestOnly({ meta, category }) {
  const catColor = category?.color || '#6366f1'
  const calcRef = useRef(null)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const sym = currency.symbol
  const [loanAmt, setLoanAmt] = useState(300000)
  const [rate, setRate] = useState(6.5)
  const [ioYears, setIoYears] = useState(5)
  const [totalYears, setTotalYears] = useState(30)
  const [openFaq, setOpenFaq] = useState(null)

  const mr = rate / 100 / 12
  const ioPayment = loanAmt * mr
  const remainingMonths = (totalYears - ioYears) * 12
  const piPayment = remainingMonths > 0 && mr > 0
    ? loanAmt * mr * Math.pow(1 + mr, remainingMonths) / (Math.pow(1 + mr, remainingMonths) - 1)
    : loanAmt / remainingMonths
  const stdPayment = totalYears > 0 && mr > 0
    ? loanAmt * mr * Math.pow(1 + mr, totalYears * 12) / (Math.pow(1 + mr, totalYears * 12) - 1)
    : loanAmt / (totalYears * 12)

  const totalIoInterest = ioPayment * ioYears * 12
  const totalPiInterest = piPayment * remainingMonths - loanAmt
  const totalInterest = totalIoInterest + totalPiInterest
  const totalPaid = loanAmt + totalInterest
  const paymentJump = piPayment - ioPayment
  const paymentJumpPct = ioPayment > 0 ? (paymentJump / ioPayment * 100).toFixed(1) : 0

  function applyExample(ex) {
    setLoanAmt(ex.loanAmt); setRate(ex.rate); setIoYears(ex.ioYears); setTotalYears(ex.totalYears)
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div ref={calcRef} style={{ scrollMarginTop: 80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
              Loan Details
            </div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Loan Amount" hint="Principal borrowed" value={loanAmt} onChange={setLoanAmt} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="APR" value={rate} onChange={setRate} suffix="%" min={0.1} max={30} catColor={catColor} />

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Interest-Only Period</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[1, 3, 5, 7, 10].map(y => (
                  <button key={y} onClick={() => setIoYears(y)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: ioYears === y ? catColor : 'var(--border)', background: ioYears === y ? catColor : 'var(--bg-raised)', color: ioYears === y ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>{y}yr</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Total Loan Term</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[15, 20, 25, 30].map(y => (
                  <button key={y} onClick={() => setTotalYears(y)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: totalYears === y ? catColor : 'var(--border)', background: totalYears === y ? catColor : 'var(--bg-raised)', color: totalYears === y ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>{y}yr</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setLoanAmt(300000); setRate(6.5); setIoYears(5); setTotalYears(30) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>Reset</button>
            </div>
          </>}

          right={<>
            <ResultHero
              label="Interest-Only Payment"
              value={Math.round(ioPayment)}
              formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
              sub={`Jumps to ${fmt(piPayment, sym)}/mo after ${ioYears}yr IO period`}
              color={catColor}
            />
            <BreakdownTable title="Payment Summary" rows={[
              { label: 'Loan Amount', value: fmt(loanAmt, sym), highlight: true },
              { label: 'IO Monthly Payment', value: fmt(ioPayment, sym), color: catColor, bold: true },
              { label: 'P&I Payment (after IO)', value: fmt(piPayment, sym), color: '#f59e0b', bold: true },
              { label: 'Payment Increase', value: `+${fmt(paymentJump, sym)}/mo`, color: '#ef4444', note: `+${paymentJumpPct}% jump` },
              { label: 'Standard P&I (comparison)', value: fmt(stdPayment, sym), note: 'no IO period' },
              { label: 'Total Interest Paid', value: fmt(totalInterest, sym), color: '#ef4444' },
              { label: 'Total Amount Paid', value: fmt(totalPaid, sym), bold: true, highlight: true },
            ]} />
            <AIHintCard
              hint={`During the ${ioYears}-year IO period you pay ${fmt(ioPayment, sym)}/month. After that, payments jump to ${fmt(piPayment, sym)}/month — a ${paymentJumpPct}% increase. Plan for this payment shock. Total interest over ${totalYears} years: ${fmt(totalInterest, sym)}.`}
              color={catColor}
            />
          </>}
        />
      </div>

      <Section title="Formula Explained" subtitle="How interest-only payments are calculated">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, lineHeight: 1.9, whiteSpace: 'pre' }}>
          {`IO Payment  = Principal × (Rate ÷ 12 ÷ 100)\nP&I Payment = P × r × (1+r)^n / ((1+r)^n − 1)`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['IO', 'Interest-only monthly payment'], ['P&I', 'Principal & interest payment post-IO'], ['r', 'Monthly rate = APR ÷ 12 ÷ 100'], ['n', 'Remaining months after IO period']].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          The interest-only payment is simply the loan balance multiplied by the monthly rate. After the IO period, the same original balance must be repaid over the remaining (shorter) term — which is why P&I payments are always higher than a standard loan's payment for the same balance and rate.
        </p>
      </Section>

      <Section title="IO Period Comparison" subtitle="How interest-only period length affects your payments">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>{['IO Period', 'IO Payment', 'Post-IO Payment', 'Payment Jump', 'Total Interest'].map((h, i) => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[1, 3, 5, 7, 10].map(ioy => {
                const r = rate / 100 / 12
                const ioPmt = loanAmt * r
                const remMo = (totalYears - ioy) * 12
                const piPmt = remMo > 0 && r > 0 ? loanAmt * r * Math.pow(1 + r, remMo) / (Math.pow(1 + r, remMo) - 1) : loanAmt / remMo
                const totInt = ioPmt * ioy * 12 + piPmt * remMo - loanAmt
                const jump = piPmt - ioPmt
                const isCurrent = ioy === ioYears
                return (
                  <tr key={ioy} style={{ background: isCurrent ? catColor + '08' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{ioy} years {isCurrent && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(ioPmt, sym)}/mo</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: '#f59e0b', textAlign: 'right' }}>{fmt(piPmt, sym)}/mo</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#ef4444', textAlign: 'right' }}>+{fmt(jump, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(totInt, sym)}</td>
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
              {[['Loan', `${sym}${ex.loanAmt.toLocaleString()}`], ['Rate', `${ex.rate}%`], ['IO', `${ex.ioYears}yr`], ['Term', `${ex.totalYears}yr`]].map(([k, v]) => (
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

      <Section title="Key Terms" subtitle="Interest-only loan terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about interest-only loans">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>
    </div>
  )
}
