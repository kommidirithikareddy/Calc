import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function Section({ title, children, color = '#3b82f6' }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, color, borderBottom: '0.5px solid var(--border)', background: color + '10' }}>
        {title}
      </div>
      <div style={{ padding: '16px 14px' }}>{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, prefix, suffix, placeholder }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {prefix && <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600, minWidth: '14px' }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', maxWidth: '140px' }}
      />
      {suffix && <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600 }}>{suffix}</span>}
    </div>
  )
}

export default function PercentageCalculator() {
  // Type 1 — What is X% of Y?
  const [p1x, setP1x] = useState(''); const [p1y, setP1y] = useState('')
  const r1 = p1x && p1y ? ((+p1x / 100) * +p1y).toFixed(4) : null
  const r1clean = r1 ? parseFloat(r1) : null

  // Type 2 — X is what % of Y?
  const [p2x, setP2x] = useState(''); const [p2y, setP2y] = useState('')
  const r2 = p2x && p2y && +p2y !== 0 ? ((+p2x / +p2y) * 100).toFixed(4) : null

  // Type 3 — Percentage change from X to Y
  const [p3x, setP3x] = useState(''); const [p3y, setP3y] = useState('')
  const r3 = p3x && p3y && +p3x !== 0 ? (((+p3y - +p3x) / Math.abs(+p3x)) * 100).toFixed(4) : null
  const r3num = r3 ? parseFloat(r3) : null
  const r3color = r3num > 0 ? '#10b981' : r3num < 0 ? '#ef4444' : 'var(--text)'

  const hint = r1clean
    ? `${p1x}% of ${p1y} = ${r1clean}. Quick mental math: ${p1x}% of any number is that number divided by ${(100/+p1x).toFixed(0)}.`
    : 'Enter values in any section — results update instantly as you type.'

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left — 3 calculator types */}
        <div>
          <div className="inputs-title">Choose a Calculation Type</div>

          {/* Type 1 */}
          <Section title="Type 1 — What is X% of Y?" color="#3b82f6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <NumInput value={p1x} onChange={setP1x} suffix="% of" placeholder="25" />
              <NumInput value={p1y} onChange={setP1y} prefix="" placeholder="200" />
            </div>
            {r1 && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#dbeafe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 500 }}>Result</span>
                <span style={{ fontSize: '22px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#3b82f6' }}>{r1clean}</span>
              </div>
            )}
          </Section>

          {/* Type 2 */}
          <Section title="Type 2 — X is what % of Y?" color="#6366f1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <NumInput value={p2x} onChange={setP2x} placeholder="50" suffix="is what % of" />
              <NumInput value={p2y} onChange={setP2y} placeholder="200" />
            </div>
            {r2 && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: 500 }}>Result</span>
                <span style={{ fontSize: '22px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#6366f1' }}>{parseFloat(r2)}%</span>
              </div>
            )}
          </Section>

          {/* Type 3 */}
          <Section title="Type 3 — Percentage Change" color="#10b981">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>From</div>
                <NumInput value={p3x} onChange={setP3x} placeholder="100" />
              </div>
              <div style={{ marginTop: '16px', fontSize: '18px', color: 'var(--text-3)' }}>→</div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px' }}>To</div>
                <NumInput value={p3y} onChange={setP3y} placeholder="125" />
              </div>
            </div>
            {r3 && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: r3num >= 0 ? '#d1fae5' : '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: r3color, fontWeight: 500 }}>
                  {r3num > 0 ? '▲ Increase' : r3num < 0 ? '▼ Decrease' : 'No change'}
                </span>
                <span style={{ fontSize: '22px', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: r3color }}>
                  {r3num > 0 ? '+' : ''}{parseFloat(r3)}%
                </span>
              </div>
            )}
          </Section>

          <FormulaCard
            formula={`Type 1: result = (X/100) × Y\nType 2: result = (X/Y) × 100\nType 3: result = ((Y-X)/|X|) × 100`}
            explanation="Percentage means 'per hundred'. Type 1 finds a fraction of a value. Type 2 expresses a proportion as a percentage. Type 3 measures relative change between two values — positive means increase, negative means decrease."
          />
          <style>{`.inputs-title { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 18px; padding-bottom: 8px; border-bottom: 0.5px solid var(--border); }`}</style>
        </div>

        {/* Right — live summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {r1 && <BreakdownTable title="Type 1 Result" rows={[
            { label: `${p1x}% of ${p1y}`, value: String(r1clean), color: '#3b82f6', bold: true, highlight: true },
          ]} />}

          {r2 && <BreakdownTable title="Type 2 Result" rows={[
            { label: `${p2x} is __% of ${p2y}`, value: parseFloat(r2) + '%', color: '#6366f1', bold: true, highlight: true },
          ]} />}

          {r3 && <BreakdownTable title="Type 3 Result" rows={[
            { label: 'Original value',  value: p3x },
            { label: 'New value',       value: p3y },
            { label: 'Change',          value: (r3num > 0 ? '+' : '') + parseFloat(r3) + '%', color: r3color, bold: true, highlight: true },
          ]} />}

          {!r1 && !r2 && !r3 && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px dashed var(--border)', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              Enter values on the left to see results here
            </div>
          )}

          <AIHintCard hint={hint} />
        </div>
      </div>
    </>
  )
}
