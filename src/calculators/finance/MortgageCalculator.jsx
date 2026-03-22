import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt  = n => '$' + Math.round(Math.max(0,n)).toLocaleString()
const fmtK = n => n >= 1000 ? '$'+(n/1000).toFixed(0)+'k' : fmt(n)

export default function MortgageCalculator() {
  const [price,      setPrice]      = useState(350000)
  const [down,       setDown]       = useState(20)        // percent
  const [rate,       setRate]       = useState(6.5)
  const [termYrs,    setTermYrs]    = useState(30)
  const [tax,        setTax]        = useState(300)       // monthly
  const [insurance,  setInsurance]  = useState(100)       // monthly

  const loanAmt    = price * (1 - down / 100)
  const r          = rate / 100 / 12
  const n          = termYrs * 12
  const pi         = r === 0 ? loanAmt / n : loanAmt * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1)
  const pmi        = down < 20 ? loanAmt * 0.005 / 12 : 0
  const totalMonthly = pi + tax + insurance + pmi
  const totalPaid  = pi * n
  const totalInt   = totalPaid - loanAmt

  // Amortization chart data (yearly)
  const chartData = []
  let bal = loanAmt
  for (let m = 1; m <= n; m++) {
    const intPaid = bal * r
    const prinPaid = pi - intPaid
    bal -= prinPaid
    if (m % 12 === 0 || m === n) {
      chartData.push({
        year: `Yr ${Math.ceil(m/12)}`,
        principal: Math.round(Math.max(0, bal)),
        paid: Math.round(loanAmt - Math.max(0, bal)),
      })
    }
  }

  const hint = `Your monthly mortgage payment is ${fmt(pi)} (P&I). With taxes and insurance, total monthly cost is ${fmt(totalMonthly)}. Over ${termYrs} years you pay ${fmt(totalInt)} in interest — ${((totalInt/loanAmt)*100).toFixed(0)}% of the loan amount.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Mortgage Details</div>
          <SliderInput label="Home Price"            hint="Purchase price"        value={price}     min={50000}  max={2000000} step={5000}  prefix="$"  onChange={setPrice} />
          <SliderInput label="Down Payment"          hint="% of home price"       value={down}      min={3}      max={50}      step={0.5}   suffix="%"  onChange={setDown} />
          <SliderInput label="Annual Interest Rate"  hint="Fixed rate"            value={rate}      min={1}      max={20}      step={0.125} suffix="%"  onChange={setRate} />
          <SliderInput label="Loan Term"             hint="Years"                 value={termYrs}   min={5}      max={30}      step={5}     suffix="yrs" onChange={setTermYrs} />
          <SliderInput label="Monthly Property Tax"  hint="Estimate"              value={tax}       min={0}      max={2000}    step={25}    prefix="$"  onChange={setTax} />
          <SliderInput label="Monthly Insurance"     hint="Homeowner's insurance" value={insurance} min={0}      max={500}     step={10}    prefix="$"  onChange={setInsurance} />

          <FormulaCard
            formula={`M = P × r(1+r)^n / ((1+r)^n − 1)\nTotal = M + Tax + Insurance + PMI`}
            variables={[
              { symbol: 'M', meaning: 'Monthly principal & interest payment' },
              { symbol: 'P', meaning: 'Loan amount (price − down payment)' },
              { symbol: 'r', meaning: 'Monthly interest rate (annual ÷ 12)' },
              { symbol: 'n', meaning: 'Total payments (years × 12)' },
            ]}
            explanation="Your monthly mortgage payment covers principal reduction and interest on the outstanding balance. PMI (Private Mortgage Insurance) applies when your down payment is less than 20% and is estimated at 0.5% of the loan per year."
          />
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Total Monthly Payment" value={Math.round(totalMonthly)} formatter={fmt}
            sub={`P&I: ${fmt(pi)} · Tax: ${fmt(tax)} · Insurance: ${fmt(insurance)}${pmi > 0 ? ` · PMI: ${fmt(pmi)}` : ''}`}
          />
          <BreakdownTable title="Loan Summary" rows={[
            { label: 'Home Price',          value: fmt(price) },
            { label: `Down Payment (${down}%)`, value: fmt(price * down / 100), color: '#10b981' },
            { label: 'Loan Amount',         value: fmt(loanAmt) },
            { label: 'Monthly P&I',         value: fmt(pi),       color: '#6366f1', bold: true },
            { label: 'Total Interest',      value: fmt(totalInt), color: '#ef4444' },
            { label: 'Total Cost',          value: fmt(totalPaid + tax*n + insurance*n), color: '#6366f1', highlight: true, bold: true },
          ]} />
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Amortization</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData.filter((_,i)=>i%2===0||i===chartData.length-1)} margin={{top:0,right:0,bottom:0,left:0}}>
                <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis hide/>
                <Tooltip formatter={v=>[fmtK(v)]} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:'8px',fontSize:'11px'}}/>
                <Area type="monotone" dataKey="paid"      stroke="#10b981" fill="#10b98125" strokeWidth={2} name="Equity Built"/>
                <Area type="monotone" dataKey="principal" stroke="#6366f1" fill="#6366f115" strokeWidth={2} name="Remaining Balance"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
