import { useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt  = n => '$' + Math.round(Math.max(0, n)).toLocaleString()
const fmtK = n => n >= 1000 ? '$' + (n/1000).toFixed(0) + 'k' : fmt(n)

const FREQ_OPTIONS = [
  { label: 'Annually',  n: 1   },
  { label: 'Quarterly', n: 4   },
  { label: 'Monthly',   n: 12  },
  { label: 'Daily',     n: 365 },
]

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState(10000)
  const [rate,      setRate]      = useState(7)
  const [years,     setYears]     = useState(10)
  const [monthly,   setMonthly]   = useState(200)
  const [freqIdx,   setFreqIdx]   = useState(2) // Monthly
  const [calculated, setCalculated] = useState(false)

  const n = FREQ_OPTIONS[freqIdx].n

  const compute = useCallback(() => {
    const r = rate / 100
    const factor = Math.pow(1 + r / n, n * years)
    const fromPrincipal = principal * factor
    const fromMonthly   = r > 0 ? monthly * (factor - 1) / (r / n) : monthly * n * years
    const total         = fromPrincipal + fromMonthly
    const totalContribs = monthly * 12 * years
    const interest      = Math.max(0, total - principal - totalContribs)
    return { total, totalContribs, interest, fromPrincipal }
  }, [principal, rate, years, monthly, n])

  const { total, totalContribs, interest } = compute()

  // Chart data — yearly snapshots
  const chartData = Array.from({ length: Math.min(years, 20) }, (_, i) => {
    const yr = Math.round((i + 1) * years / Math.min(years, 20))
    const r = rate / 100
    const f = Math.pow(1 + r / n, n * yr)
    const t = principal * f + (r > 0 ? monthly * (f - 1) / (r / n) : monthly * n * yr)
    return { year: `Yr ${yr}`, value: Math.round(t) }
  })

  const doublingYrs = rate > 0 ? (72 / rate).toFixed(1) : '∞'
  const hint = `At ${rate}% your money doubles in ~${doublingYrs} years (Rule of 72). Adding $${monthly}/month contributes $${Math.round(totalContribs).toLocaleString()} extra to your final balance.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Enter Your Values</div>

          <SliderInput label="Principal Amount" hint="Starting investment"
            value={principal} min={500} max={100000} step={500}
            prefix="$" onChange={setPrincipal} />

          <SliderInput label="Annual Interest Rate" hint="% per year"
            value={rate} min={0.5} max={20} step={0.5}
            suffix="%" onChange={setRate} />

          <SliderInput label="Time Period" hint="Number of years"
            value={years} min={1} max={40} step={1}
            suffix="yrs" onChange={setYears} />

          <SliderInput label="Monthly Contribution" hint="Optional top-up"
            value={monthly} min={0} max={2000} step={50}
            prefix="$" onChange={setMonthly} />

          {/* Frequency selector */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '9px' }}>
              Compounding Frequency
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FREQ_OPTIONS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setFreqIdx(i)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: '1.5px solid',
                    borderColor: freqIdx === i ? '#6366f1' : 'var(--border)',
                    background: freqIdx === i ? '#6366f1' : 'var(--bg-raised)',
                    color: freqIdx === i ? '#fff' : 'var(--text-2)',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.12s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="ci-calc-btn" onClick={() => setCalculated(true)}>
              Calculate →
            </button>
            <button className="ci-reset-btn" onClick={() => {
              setPrincipal(10000); setRate(7); setYears(10); setMonthly(200); setFreqIdx(2); setCalculated(false)
            }}>
              Reset
            </button>
          </div>

          <FormulaCard
            formula={`A = P(1 + r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)]`}
            variables={[
              { symbol: 'P', meaning: 'Principal (starting amount)' },
              { symbol: 'r', meaning: 'Annual interest rate (decimal)' },
              { symbol: 'n', meaning: 'Compounding periods per year' },
              { symbol: 't', meaning: 'Time in years' },
              { symbol: 'PMT', meaning: 'Monthly contribution' },
            ]}
            explanation="Compound interest earns interest on your interest — not just your original deposit. The more frequently it compounds and the longer the time period, the more dramatic the growth. This is why starting early matters so much more than the amount."
          />

          <style>{`
            .inputs-title { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 18px; padding-bottom: 8px; border-bottom: 0.5px solid var(--border); }
            .ci-calc-btn { flex: 1; padding: 13px; border-radius: 10px; border: none; background: #6366f1; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.12s; }
            .ci-calc-btn:hover { background: #4f46e5; }
            .ci-reset-btn { padding: 13px 18px; border-radius: 10px; border: 1.5px solid var(--border-2); background: var(--bg-raised); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.12s; }
            .ci-reset-btn:hover { border-color: #ef4444; color: #ef4444; }
          `}</style>
        </>
      }

      right={
        <>
          <ResultHero
            label="Final Balance"
            value={Math.round(total)}
            formatter={fmt}
            sub={`After ${years} years at ${rate}% compounded ${FREQ_OPTIONS[freqIdx].label.toLowerCase()}`}
          />

          <BreakdownTable
            title="Breakdown"
            rows={[
              { label: 'Initial Principal',   value: fmt(principal),     color: '#6366f1' },
              { label: 'Total Contributions', value: fmt(totalContribs), color: '#3b82f6' },
              { label: 'Interest Earned',     value: fmt(interest),      color: '#10b981' },
              { label: 'Total Balance',       value: fmt(total),         color: '#6366f1', bold: true, highlight: true },
            ]}
          />

          {/* Growth chart */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
              Growth Over Time
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={v => [fmtK(v), 'Balance']}
                  contentStyle={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
