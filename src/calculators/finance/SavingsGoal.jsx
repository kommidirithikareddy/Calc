import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt = n => '$' + Math.round(Math.max(0,n)).toLocaleString()
const fmtK = n => n >= 1000 ? '$'+(n/1000).toFixed(0)+'k' : fmt(n)

export default function SavingsGoal() {
  const [goal,     setGoal]     = useState(20000)
  const [current,  setCurrent]  = useState(2000)
  const [rate,     setRate]     = useState(4)
  const [months,   setMonths]   = useState(24)

  const r = rate / 100 / 12
  const remaining = Math.max(0, goal - current)

  // Monthly saving needed using FV of annuity formula
  let monthly = 0
  if (r === 0) {
    monthly = remaining / months
  } else {
    const factor = (Math.pow(1 + r, months) - 1) / r
    const growthOnCurrent = current * Math.pow(1 + r, months)
    monthly = Math.max(0, (goal - growthOnCurrent) / factor)
  }

  // Time to reach goal with a fixed monthly (for comparison)
  const fixedMonthly = monthly

  // Chart data
  const chartData = Array.from({ length: Math.min(months, 24) }, (_, i) => {
    const m = Math.round((i + 1) * months / Math.min(months, 24))
    const v = r === 0
      ? current + fixedMonthly * m
      : current * Math.pow(1+r,m) + fixedMonthly * (Math.pow(1+r,m)-1)/r
    return { month: m > 12 ? `Yr ${Math.ceil(m/12)}` : `M${m}`, value: Math.round(Math.min(v, goal * 1.05)) }
  })

  const totalSaved   = fixedMonthly * months
  const interestEarned = goal - current - totalSaved

  const hint = `Save ${fmt(monthly)}/month for ${months} months to reach your ${fmt(goal)} goal. You'll contribute ${fmt(totalSaved)} and earn ${fmt(Math.max(0,interestEarned))} in interest.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Your Savings Goal</div>
          <SliderInput label="Goal Amount" hint="Target savings" value={goal} min={500} max={500000} step={500} prefix="$" onChange={setGoal} />
          <SliderInput label="Current Savings" hint="Already saved" value={current} min={0} max={goal} step={100} prefix="$" onChange={setCurrent} />
          <SliderInput label="Annual Interest Rate" hint="Expected return" value={rate} min={0} max={15} step={0.25} suffix="%" onChange={setRate} />
          <SliderInput label="Time to Reach Goal" hint="Months" value={months} min={1} max={360} step={1} suffix="mo" onChange={setMonths} />

          <FormulaCard
            formula={`PMT = (Goal − PV×(1+r)^n) / ((1+r)^n − 1) / r`}
            variables={[
              { symbol: 'PMT',  meaning: 'Required monthly saving' },
              { symbol: 'Goal', meaning: 'Target amount' },
              { symbol: 'PV',   meaning: 'Current savings (present value)' },
              { symbol: 'r',    meaning: 'Monthly interest rate' },
              { symbol: 'n',    meaning: 'Number of months' },
            ]}
            explanation="This formula solves for the monthly payment needed so that your existing savings plus regular contributions plus interest exactly equal your goal at the end of the period. It accounts for compound interest on both your existing balance and new contributions."
          />
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Monthly Saving Needed" value={Math.round(monthly)} formatter={fmt}
            sub={`To reach ${fmt(goal)} in ${months} months`} color="#10b981" />

          <BreakdownTable title="Savings Plan" rows={[
            { label: 'Goal Amount',        value: fmt(goal) },
            { label: 'Already Saved',      value: fmt(current),                         color: '#10b981' },
            { label: 'Still Needed',       value: fmt(remaining) },
            { label: 'Monthly Saving',     value: fmt(monthly),                         color: '#10b981', bold: true },
            { label: 'Total Contributions',value: fmt(totalSaved) },
            { label: 'Interest Earned',    value: fmt(Math.max(0, interestEarned)),      color: '#10b981' },
          ]} />

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Savings Progress</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide />
                <Tooltip formatter={v => [fmtK(v), 'Balance']} contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
