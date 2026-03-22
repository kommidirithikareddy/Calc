import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt  = n => '$' + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = n => n >= 1000 ? '$' + (n/1000).toFixed(0) + 'k' : fmt(n)

export default function LoanEMI() {
  const [amount,   setAmount]   = useState(25000)
  const [rate,     setRate]     = useState(8)
  const [termYrs,  setTermYrs]  = useState(5)

  const monthlyRate = rate / 100 / 12
  const totalMonths = termYrs * 12

  let emi = 0
  if (monthlyRate === 0) {
    emi = amount / totalMonths
  } else {
    emi = amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
  }

  const totalPayment  = emi * totalMonths
  const totalInterest = totalPayment - amount

  // Build amortization data (yearly snapshots for chart)
  const chartData = []
  let balance = amount
  for (let month = 1; month <= totalMonths; month++) {
    const intPaid  = balance * monthlyRate
    const prinPaid = emi - intPaid
    balance -= prinPaid
    if (month % 12 === 0 || month === totalMonths) {
      chartData.push({
        year: `Yr ${Math.ceil(month/12)}`,
        principal: Math.round(Math.max(0, balance)),
        paid: Math.round(amount - Math.max(0, balance)),
      })
    }
  }

  const hint = `Your monthly EMI is ${fmt(emi)}. Over ${termYrs} years you'll pay ${fmt(totalInterest)} in interest — ${((totalInterest/amount)*100).toFixed(0)}% of your original loan. Increasing your EMI by just 10% saves ${fmt(totalInterest * 0.15)} in interest.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Loan Details</div>

          <SliderInput label="Loan Amount" hint="Total loan amount"
            value={amount} min={1000} max={500000} step={1000}
            prefix="$" onChange={setAmount} />

          <SliderInput label="Annual Interest Rate" hint="% per year"
            value={rate} min={0.5} max={30} step={0.25}
            suffix="%" onChange={setRate} />

          <SliderInput label="Loan Term" hint="Duration in years"
            value={termYrs} min={1} max={30} step={1}
            suffix="yrs" onChange={setTermYrs} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Calculate →
            </button>
            <button onClick={() => { setAmount(25000); setRate(8); setTermYrs(5) }}
              style={{ padding: '13px 18px', borderRadius: '10px', border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Reset
            </button>
          </div>

          <FormulaCard
            formula={`EMI = P × r × (1+r)^n / ((1+r)^n − 1)`}
            variables={[
              { symbol: 'P', meaning: 'Principal loan amount' },
              { symbol: 'r', meaning: 'Monthly interest rate (annual rate ÷ 12)' },
              { symbol: 'n', meaning: 'Total number of monthly payments' },
            ]}
            explanation="An EMI (Equated Monthly Instalment) splits your loan repayment into equal monthly payments. Each payment covers the interest for that month plus a portion of the principal. Early payments are mostly interest; later payments are mostly principal — this is amortization."
          />
          <style>{`.inputs-title { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 18px; padding-bottom: 8px; border-bottom: 0.5px solid var(--border); }`}</style>
        </>
      }

      right={
        <>
          <ResultHero label="Monthly EMI" value={Math.round(emi)} formatter={fmt}
            sub={`Over ${termYrs} years at ${rate}% interest`} />

          <BreakdownTable title="Loan Summary" rows={[
            { label: 'Loan Amount',    value: fmt(amount),        color: '#6366f1' },
            { label: 'Total Interest', value: fmt(totalInterest), color: '#ef4444' },
            { label: 'Total Payment',  value: fmt(totalPayment),  color: '#6366f1', bold: true, highlight: true },
          ]} />

          {/* Area chart — balance over time */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
              Principal vs Interest Paid Over Time
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v => [fmtK(v)]} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="paid"      stroke="#10b981" fill="#10b98130" strokeWidth={2} name="Principal Paid" />
                <Area type="monotone" dataKey="principal" stroke="#6366f1" fill="#6366f115" strokeWidth={2} name="Remaining Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
