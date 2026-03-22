import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt2 = n => '$' + Math.abs(n).toFixed(2)

const TIP_PRESETS = [10, 15, 18, 20, 25]

export default function TipCalculator() {
  const [bill,    setBill]    = useState(50)
  const [tip,     setTip]     = useState(18)
  const [people,  setPeople]  = useState(2)

  const tipAmt   = bill * tip / 100
  const total    = bill + tipAmt
  const perPerson = total / people
  const tipPerPerson = tipAmt / people

  const hint = `A ${tip}% tip on $${bill.toFixed(2)} is ${fmt2(tipAmt)}. Split ${people} ways that's ${fmt2(perPerson)} each (including ${fmt2(tipPerPerson)} tip per person).`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Bill Details</div>

          <SliderInput label="Bill Amount" hint="Before tax"
            value={bill} min={1} max={500} step={1}
            prefix="$" onChange={setBill} />

          {/* Tip % with presets */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Tip Percentage</label>
              <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Custom or select preset</span>
            </div>
            {/* Preset buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {TIP_PRESETS.map(p => (
                <button key={p} onClick={() => setTip(p)} style={{
                  padding: '6px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  border: '1.5px solid', borderColor: tip === p ? '#ec4899' : 'var(--border)',
                  background: tip === p ? '#ec4899' : 'var(--bg-raised)',
                  color: tip === p ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s',
                }}>
                  {p}%
                </button>
              ))}
            </div>
            <SliderInput label="" value={tip} min={0} max={50} step={1}
              suffix="%" onChange={setTip} />
          </div>

          <SliderInput label="Number of People" hint="Split equally"
            value={people} min={1} max={20} step={1}
            onChange={setPeople} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#ec4899', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Calculate →
            </button>
            <button onClick={() => { setBill(50); setTip(18); setPeople(2) }}
              style={{ padding: '13px 18px', borderRadius: '10px', border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Reset
            </button>
          </div>
          <style>{`.inputs-title { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 18px; padding-bottom: 8px; border-bottom: 0.5px solid var(--border); }`}</style>
        </>
      }

      right={
        <>
          <ResultHero
            label={people > 1 ? 'Per Person' : 'Total with Tip'}
            value={Math.round(perPerson * 100) / 100}
            formatter={fmt2}
            sub={people > 1 ? `Split ${people} ways · ${fmt2(total)} total` : `Tip: ${fmt2(tipAmt)}`}
            color="#ec4899"
          />

          <BreakdownTable title="Bill Breakdown" rows={[
            { label: 'Bill (before tip)',   value: fmt2(bill),       color: '#6366f1' },
            { label: `Tip (${tip}%)`,       value: fmt2(tipAmt),     color: '#ec4899' },
            { label: 'Total',               value: fmt2(total),      color: '#ec4899', bold: true },
            ...(people > 1 ? [
              { label: '─────────────', value: '' },
              { label: 'Bill per person',   value: fmt2(bill / people) },
              { label: 'Tip per person',    value: fmt2(tipPerPerson),  color: '#ec4899' },
              { label: 'Total per person',  value: fmt2(perPerson),     color: '#ec4899', bold: true, highlight: true },
            ] : []),
          ]} />

          {/* Quick comparison — all tip %s */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '11px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>
              Quick Comparison
            </div>
            {TIP_PRESETS.map(p => {
              const t = bill * p / 100
              const tot = bill + t
              const pp  = tot / people
              return (
                <div key={p} onClick={() => setTip(p)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 14px', borderBottom: '0.5px solid var(--border)',
                  cursor: 'pointer', transition: 'background 0.1s',
                  background: tip === p ? '#fce7f3' : undefined,
                }}>
                  <span style={{ fontSize: '12px', color: tip===p ? '#db2777' : 'var(--text-2)', fontWeight: tip===p ? 700 : 400 }}>{p}% tip</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: tip===p ? '#db2777' : 'var(--text)' }}>{fmt2(tot)}</div>
                    {people > 1 && <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{fmt2(pp)}/person</div>}
                  </div>
                </div>
              )
            })}
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
