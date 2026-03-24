import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()
const fmtD = (n, d = 2) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)

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
  { title: 'Car Loan',       desc: 'Auto financing with origination fee', loanAmt: 25000, payment: 490, months: 60,  fees: 500 },
  { title: 'Personal Loan', desc: 'Online lender with 2% origination',  loanAmt: 15000, payment: 350, months: 48,  fees: 300 },
  { title: 'Mortgage',      desc: 'Home loan with 1pt origination fee', loanAmt: 300000,payment: 1900,months: 360, fees: 3000 },
]
const FAQ = [
  { q: 'What is APR?', a: 'APR (Annual Percentage Rate) is the true annual cost of borrowing — it includes both the interest rate and lender fees (origination, discount points, broker fees) expressed as a single percentage. It is always higher than the stated interest rate when fees are involved. Federal law (TILA) requires lenders to disclose APR.' },
  { q: 'Why is APR higher than the interest rate?', a: 'Fees reduce the amount you actually receive while you still repay the full loan. If you borrow $20,000 but pay a $500 origination fee, you effectively receive $19,500 but repay based on $20,000. Calculating the rate on $19,500 gives a higher effective rate — that’s the APR.' },
  { q: 'When should I use APR to compare loans?', a: 'Always. Two loans with the same interest rate can have very different APRs if one has higher fees. APR standardises the comparison. For short-term loans, fees have a larger APR impact. For long-term loans (30yr mortgage), the APR and rate converge because fees are spread over many payments.' },
  { q: 'What fees are included in APR?', a: 'Included: origination fees, discount points, broker fees, mortgage insurance (PMI). Not included: appraisal, title insurance, attorney fees, recording fees, credit report. This inconsistency means APR is still not a perfect comparison tool — always read the full Loan Estimate.' },
]
const GLOSSARY = [
  { term: 'APR', def: 'Annual Percentage Rate — the true annual cost of borrowing including interest plus all lender fees.' },
  { term: 'Origination Fee', def: 'A lender charge for processing the loan, typically 0.5–2% of the loan amount.' },
  { term: 'Discount Points', def: 'Optional upfront fees (1 point = 1% of loan) that buy down your interest rate.' },
  { term: 'TILA', def: 'Truth in Lending Act — federal law requiring lenders to disclose APR and total loan cost.' },
  { term: 'Loan Estimate', def: 'A standardised 3-page form lenders must provide within 3 days of application, showing APR and all costs.' },
  { term: 'Net Disbursed', def: 'Amount actually received after fees are deducted upfront from the loan amount.' },
]

function findMonthlyRate(pv, pmt, n) {
  let r = 0.05 / 12
  for (let i = 0; i < 200; i++) {
    const f = pmt - pv * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    const df = -pv * (Math.pow(1 + r, n) * (1 + r * n) - Math.pow(1 + r, n)) / Math.pow(Math.pow(1 + r, n) - 1, 2)
    const r2 = r - f / df
    if (Math.abs(r2 - r) < 1e-9) return r2
    r = r2 < 0 ? 0.001 : r2
  }
  return r
}

export default function APRCalculator({ meta, category }) {
  const [loanAmt, setLoanAmt] = useState(25000)
  const [payment, setPayment] = useState(490)
  const [months, setMonths] = useState(60)
  const [fees, setFees] = useState(500)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq, setOpenFaq] = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const netAmt = loanAmt - fees
  const statedRate = findMonthlyRate(loanAmt, payment, months) * 12 * 100
  const aprWithFees = findMonthlyRate(netAmt, payment, months) * 12 * 100
  const totalPaid = payment * months
  const totalInt = totalPaid - loanAmt

  function applyExample(ex) { setLoanAmt(ex.loanAmt); setPayment(ex.payment); setMonths(ex.months); setFees(ex.fees) }

  const hint = `Stated rate: ${statedRate.toFixed(2)}%. True APR (with ${sym}${fees} fees): ${aprWithFees.toFixed(2)}%. Total interest: ${fmt(totalInt, sym)} on a ${fmt(loanAmt, sym)} loan.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Loan Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Loan Amount" value={loanAmt} onChange={setLoanAmt} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Monthly Payment" value={payment} onChange={setPayment} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Loan Term" value={months} onChange={setMonths} suffix="mo" min={1} max={360} catColor={catColor} />
          <FieldInput label="Total Fees" hint="Origination, points, etc." value={fees} onChange={setFees} prefix={sym} min={0} catColor={catColor} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
            <button onClick={() => { setLoanAmt(25000); setPayment(490); setMonths(60); setFees(500) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <ResultHero label="True APR (with fees)" value={Math.round(aprWithFees * 100) / 100} formatter={n => n.toFixed(2) + '%'} sub={`vs stated rate of ${statedRate.toFixed(2)}%`} color={catColor} />
          <BreakdownTable title="APR Summary" rows={[
            { label: 'Loan Amount',        value: fmt(loanAmt, sym) },
            { label: 'Fees',               value: fmt(fees, sym), color: '#f59e0b' },
            { label: 'Net Disbursed',       value: fmt(netAmt, sym), color: '#10b981' },
            { label: 'Stated Rate',         value: `${statedRate.toFixed(2)}%` },
            { label: 'True APR (w/ fees)',  value: `${aprWithFees.toFixed(2)}%`, color: '#ef4444', bold: true, highlight: true },
            { label: 'Total Interest',      value: fmt(totalInt, sym), color: '#ef4444' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Section title="Formula Explained" subtitle="How APR is calculated with fees">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Stated Rate (no fees)', formula: 'Solve: Loan = Payment × (1-(1+r)^-n) / r' },
            { label: 'True APR (with fees)',  formula: 'Solve: Net Amount = Payment × (1-(1+r)^-n) / r' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: catColor, fontWeight: 600, overflowX: 'auto', whiteSpace: 'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>Fees reduce the amount you receive (net amount) while you still make the same payments on the full loan. Recalculating the rate using net amount instead of loan amount gives the true APR — higher than the stated rate because you're effectively paying more to borrow less.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => applyExample(ex)} style={{ padding: 14, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ex.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.4 }}>{ex.desc}</div>
              {[['Amount', `${sym}${ex.loanAmt.toLocaleString()}`], ['Payment', `${sym}${ex.payment}/mo`], ['Fees', `${sym}${ex.fees}`]].map(([k, v]) => (
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

      <Section title="Frequently Asked Questions" subtitle="Everything about APR">
        {FAQ.map((item, i) => <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
