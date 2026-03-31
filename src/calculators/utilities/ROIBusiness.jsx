import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is a good ROI for a business investment?', a: 'ROI benchmarks vary widely by industry and risk. A safe investment like a savings account yields 4–5%. S&P 500 averages ~10%/year historically. A small business investment might target 15–30%. Startups may aim for 10× or more over several years to justify the risk. Always compare against alternatives.' },
  { q: 'What is the difference between ROI and IRR?', a: 'ROI (Return on Investment) is simple: total return as a % of cost. It ignores timing. IRR (Internal Rate of Return) accounts for when cash flows occur — money received sooner is worth more than money received later. For investments spanning multiple years, IRR is more accurate than simple ROI.' },
  { q: 'How do I calculate annualized ROI?', a: 'Annualized ROI = ((1 + ROI) ^ (1/years)) − 1. This normalizes returns across different holding periods. A 50% total ROI over 3 years = (1.5^(1/3)) − 1 = 14.5% per year. This calculator does the annualization automatically.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function ROIBusiness({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [investment, setInvestment] = useState(50000)
  const [returns, setReturns] = useState(75000)
  const [months, setMonths] = useState(24)
  const [openFaq, setOpenFaq] = useState(null)

  const netReturn = returns - investment
  const roi = investment > 0 ? netReturn / investment * 100 : 0
  const years = months / 12
  const annualizedRoi = years > 0 ? (Math.pow(1 + roi / 100, 1 / years) - 1) * 100 : 0
  const spComparison = Math.pow(1.10, years) * investment

  const roiColor = roi >= 20 ? '#10b981' : roi >= 10 ? '#3b82f6' : roi >= 0 ? '#f59e0b' : '#ef4444'
  const hint = `Investment $${investment.toLocaleString()}, returns $${returns.toLocaleString()}: ROI ${roi.toFixed(1)}%, annualized ${annualizedRoi.toFixed(1)}%/yr.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>ROI Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>ROI = (Returns − Investment) ÷ Investment × 100</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: roiColor, fontFamily: "'Space Grotesk',sans-serif" }}>{roi.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>total ROI</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Initial investment ($)', investment, setInvestment], ['Total returns ($)', returns, setReturns]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Time period: {months} months ({years.toFixed(1)} years)</label>
            <input type="range" min="1" max="120" step="1" value={months} onChange={e => setMonths(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[6, 12, 24, 36, 60].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  style={{ flex: 1, padding: '5px', borderRadius: 7, border: `1px solid ${months === m ? C : 'var(--border-2)'}`, background: months === m ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: months === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{m}mo</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${roiColor}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ l: 'Net return', v: `$${netReturn.toLocaleString()}`, c: netReturn >= 0 ? '#10b981' : '#ef4444' }, { l: 'Total ROI', v: `${roi.toFixed(1)}%`, c: roiColor }, { l: 'Annualized ROI', v: `${annualizedRoi.toFixed(1)}%/yr`, c: C }, { l: 'S&P 500 equiv.', v: `$${spComparison.toFixed(0)}` }].map((m, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: annualizedRoi > 10 ? '#d1fae520' : '#fef3c720', borderRadius: 9, border: `1px solid ${annualizedRoi > 10 ? '#10b98130' : '#f59e0b30'}`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
              {annualizedRoi >= 15 ? '✅ Beats typical stock market returns — strong investment.' : annualizedRoi >= 10 ? '📈 Comparable to stock market returns — solid performance.' : annualizedRoi >= 0 ? '⚠️ Below market average — consider alternatives.' : '❌ Negative ROI — loss on investment.'}
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
