import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt  = n => '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtP = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%'

export default function ROICalculator() {
  const [cost,    setCost]    = useState(10000)
  const [returns, setReturns] = useState(13500)
  const [years,   setYears]   = useState(1)

  const netProfit    = returns - cost
  const roi          = cost > 0 ? (netProfit / cost) * 100 : 0
  const annualisedRoi = years > 0 ? (Math.pow(1 + roi / 100, 1 / years) - 1) * 100 : roi
  const roiColor     = roi >= 0 ? '#10b981' : '#ef4444'

  const hint = roi >= 0
    ? `Your ROI of ${roi.toFixed(2)}% means every $1 invested returned $${(1 + roi/100).toFixed(2)}. Annualised over ${years} year${years>1?'s':''} that's ${annualisedRoi.toFixed(2)}% per year.`
    : `Your investment lost ${Math.abs(roi).toFixed(2)}% of its value. You lost ${fmt(Math.abs(netProfit))} on a ${fmt(cost)} investment.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Investment Details</div>

          {[
            { label: 'Initial Investment Cost', hint: 'Total amount invested', val: cost, set: setCost, prefix: '$', min: 1, max: 1000000, step: 100 },
            { label: 'Final Value / Returns',   hint: 'Total value received',  val: returns, set: setReturns, prefix: '$', min: 0, max: 2000000, step: 100 },
            { label: 'Time Period',             hint: 'For annualised ROI',    val: years, set: setYears, suffix: 'yrs', min: 0.1, max: 30, step: 0.5 },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{f.label}</label>
                <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{f.hint}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {f.prefix && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)' }}>{f.prefix}</span>}
                <input type="number" value={f.val} min={f.min} max={f.max} step={f.step}
                  onChange={e => f.set(parseFloat(e.target.value) || 0)}
                  style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '9px', padding: '10px 14px', fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', transition: 'border-color 0.12s' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                {f.suffix && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)' }}>{f.suffix}</span>}
              </div>
            </div>
          ))}

          <FormulaCard
            formula={`ROI = (Net Profit / Cost) × 100\nAnnualised ROI = ((1 + ROI/100)^(1/years) − 1) × 100`}
            variables={[
              { symbol: 'Net Profit', meaning: 'Final Value − Initial Cost' },
              { symbol: 'Cost',       meaning: 'Initial investment amount' },
              { symbol: 'years',      meaning: 'Holding period in years' },
            ]}
            explanation="ROI measures investment efficiency as a percentage of the original cost. Annualised ROI adjusts for the holding period so you can compare investments held for different durations on a level playing field."
          />
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Return on Investment" value={Math.round(Math.abs(roi) * 100) / 100}
            formatter={n => (roi >= 0 ? '+' : '-') + n.toFixed(2) + '%'}
            sub={`Net ${roi >= 0 ? 'profit' : 'loss'}: ${fmt(Math.abs(netProfit))}`}
            color={roi >= 0 ? '#10b981' : '#ef4444'}
          />

          <BreakdownTable title="Investment Summary" rows={[
            { label: 'Initial Cost',      value: fmt(cost) },
            { label: 'Final Value',       value: fmt(returns) },
            { label: 'Net Profit / Loss', value: (netProfit >= 0 ? '+' : '') + fmt(netProfit), color: roiColor },
            { label: 'ROI',               value: fmtP(roi),            color: roiColor, bold: true, highlight: true },
            { label: `Annualised ROI (${years}yr${years>1?'s':''})`, value: fmtP(annualisedRoi), color: roiColor },
          ]} />

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
