import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym = '$') => sym + Math.round(Math.max(0, n)).toLocaleString()

const EXAMPLES = [
  { title: 'Undergrad Federal', desc: 'Typical 4-year public university', balance: 30000, rate: 5.5, months: 120 },
  { title: 'Grad School Loan', desc: 'Graduate degree with higher balance', balance: 75000, rate: 7.05, months: 120 },
  { title: 'Private Loan', desc: 'Private lender, shorter term', balance: 45000, rate: 9.5, months: 84 },
]

const FAQ = [
  { q: 'What is the difference between federal and private student loans?', a: 'Federal loans are issued by the US government and offer income-driven repayment plans, deferment, forbearance, and forgiveness programs. Private loans are issued by banks and credit unions — they often have higher rates, less flexibility, and no forgiveness options. Always exhaust federal loans before turning to private lenders.' },
  { q: 'What is income-driven repayment (IDR)?', a: 'IDR plans cap your monthly payment at a percentage of your discretionary income (typically 5-20%). Plans include SAVE, PAYE, IBR, and ICR. After 10-25 years of payments (depending on the plan), remaining balances may be forgiven — though forgiven amounts may be taxable as income.' },
  { q: 'Should I pay off student loans early?', a: 'It depends on your interest rate and other financial goals. If your rate is above 6-7%, paying early saves significant interest. If your rate is low (under 5%), investing the extra money in a diversified portfolio may yield better long-term returns. Always eliminate high-interest debt first.' },
  { q: 'What is student loan refinancing?', a: 'Refinancing replaces your existing loans with a new private loan at a (hopefully) lower interest rate. It can reduce monthly payments and total interest — but refinancing federal loans into private means permanently losing federal protections like IDR and forgiveness. Only refinance federal loans if you are confident in your income stability.' },
  { q: 'How does the grace period work?', a: 'Most federal student loans have a 6-month grace period after graduation before repayment begins. Interest may still accrue during this period (for unsubsidised loans). Using this time to make interest-only payments prevents capitalisation — where unpaid interest gets added to your principal balance.' },
]

const GLOSSARY = [
  { term: 'Principal', def: 'The original amount borrowed, excluding interest. Your monthly payments first cover interest, then reduce principal.' },
  { term: 'Capitalisation', def: 'When unpaid interest is added to your loan principal. This increases the amount you owe and the interest charged going forward.' },
  { term: 'Grace Period', def: 'A period after leaving school (typically 6 months) before loan repayment is required. Interest may still accrue.' },
  { term: 'Forbearance', def: 'A temporary pause or reduction of payments, usually due to financial hardship. Interest typically continues to accrue.' },
  { term: 'Loan Forgiveness', def: 'Cancellation of remaining loan balance after meeting certain criteria, such as Public Service Loan Forgiveness (PSLF) after 10 years of qualifying payments.' },
  { term: 'Amortisation', def: 'The process of paying off a loan through scheduled payments that cover both interest and principal over a set period.' },
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

export default function StudentLoan({ meta, category }) {
  const catColor = category?.color || '#6366f1'
  const calcRef = useRef(null)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const sym = currency.symbol
  const [balance, setBalance] = useState(30000)
  const [rate, setRate] = useState(5.5)
  const [months, setMonths] = useState(120)
  const [openFaq, setOpenFaq] = useState(null)

  const mr = rate / 100 / 12
  const emi = mr === 0 ? balance / months : balance * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1)
  const totalPaid = emi * months
  const totalInt = totalPaid - balance
  const intPct = balance > 0 ? (totalInt / balance * 100).toFixed(1) : 0

  function applyExample(ex) {
    setBalance(ex.balance); setRate(ex.rate); setMonths(ex.months)
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
            <FieldInput label="Loan Balance" hint="Total amount owed" value={balance} onChange={setBalance} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="APR" value={rate} onChange={setRate} suffix="%" min={0} max={30} catColor={catColor} />

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Repayment Term</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[60, 84, 120, 180, 240, 300].map(m => (
                  <button key={m} onClick={() => setMonths(m)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1.5px solid', borderColor: months === m ? catColor : 'var(--border)', background: months === m ? catColor : 'var(--bg-raised)', color: months === m ? '#fff' : 'var(--text-2)', cursor: 'pointer', transition: 'all .12s' }}>{m / 12}yr</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: catColor, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Calculate →</button>
              <button onClick={() => { setBalance(30000); setRate(5.5); setMonths(120) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}>Reset</button>
            </div>
          </>}

          right={<>
            <ResultHero
              label="Monthly Payment"
              value={Math.round(emi)}
              formatter={n => sym + Math.round(Math.max(0, n)).toLocaleString()}
              sub={`Over ${months / 12} years at ${rate}% APR`}
              color={catColor}
            />
            <BreakdownTable title="Loan Summary" rows={[
              { label: 'Loan Balance', value: fmt(balance, sym), highlight: true },
              { label: 'Monthly Payment', value: fmt(emi, sym), color: catColor, bold: true },
              { label: 'Total Interest', value: fmt(totalInt, sym), color: '#ef4444', note: `${intPct}% of principal` },
              { label: 'Total Paid', value: fmt(totalPaid, sym), bold: true, highlight: true },
              { label: 'Repayment Term', value: `${months / 12} years (${months} mo)` },
              { label: 'Interest Rate', value: `${rate}% APR` },
            ]} />
            <AIHintCard
              hint={`Your ${fmt(balance, sym)} loan at ${rate}% over ${months / 12} years costs ${fmt(emi, sym)}/month. You'll pay ${fmt(totalInt, sym)} in interest — ${intPct}% on top of your principal. Paying an extra ${sym}50/month would save significant interest and shorten your term.`}
              color={catColor}
            />
          </>}
        />
      </div>

      <Section title="Formula Explained" subtitle="The math behind your student loan payment">
        <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontFamily: 'monospace', fontSize: 13, color: catColor, fontWeight: 600, lineHeight: 1.9, whiteSpace: 'pre' }}>
          {`EMI = P × r × (1+r)^n / ((1+r)^n − 1)\nTotal Interest = (EMI × n) − P`}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['P', 'Principal — total loan balance'], ['r', 'Monthly rate = APR ÷ 12 ÷ 100'], ['n', 'Total months of repayment term'], ['EMI', 'Equated Monthly Instalment']].map(([s, m]) => (
            <div key={s} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: catColor, fontFamily: 'monospace', flexShrink: 0 }}>{s}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          Early payments are mostly interest — principal paydown accelerates over time. This is called amortisation. Making extra principal payments early in the loan has an outsized effect on total interest paid because it reduces the balance on which future interest accrues.
        </p>
      </Section>

      <Section title="Term Comparison" subtitle="How repayment term affects monthly payment and total interest">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>{['Term', 'Monthly Payment', 'Total Interest', 'Total Paid'].map((h, i) => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: i === 0 ? 'left' : 'right', borderBottom: '1px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[60, 84, 120, 180, 240, 300].map(m => {
                const r = rate / 100 / 12
                const e = r === 0 ? balance / m : balance * r * Math.pow(1 + r, m) / (Math.pow(1 + r, m) - 1)
                const ti = e * m - balance
                const isCurrent = m === months
                return (
                  <tr key={m} style={{ background: isCurrent ? catColor + '08' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? catColor : 'var(--text)' }}>{m / 12} years {isCurrent && '✓'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>{fmt(e, sym)}/mo</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: '#ef4444', textAlign: 'right' }}>{fmt(ti, sym)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{fmt(balance + ti, sym)}</td>
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
              {[['Balance', `${sym}${ex.balance.toLocaleString()}`], ['Rate', `${ex.rate}%`], ['Term', `${ex.months / 12}yr`]].map(([k, v]) => (
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

      <Section title="Key Terms" subtitle="Student loan terminology — click any term">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {GLOSSARY.map((item, i) => <GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about student loans">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Section>
    </div>
  )
}
