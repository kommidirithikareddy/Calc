import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(n.toFixed(4)).toString()
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

const MODES = [
  { v: 'change', label: '% change between two values', color: '#3b82f6', formula: '% Change = ((New − Old) / |Old|) × 100' },
  { v: 'increase', label: 'Find new value after % increase', color: '#10b981', formula: 'New = Old × (1 + Rate/100)' },
  { v: 'decrease', label: 'Find new value after % decrease', color: '#ef4444', formula: 'New = Old × (1 − Rate/100)' },
  { v: 'original', label: 'Find original before % change', color: '#f59e0b', formula: 'Original = New / (1 ± Rate/100)' },
]

function compute(mode, old, newVal, rate, dir) {
  if (mode === 'change') {
    if (old === 0) return { result: 0, change: 0, steps: [], error: 'Original value cannot be zero' }
    const chg = newVal - old
    const pct = (chg / Math.abs(old)) * 100
    const isInc = chg >= 0
    return {
      result: pct,
      change: chg,
      isIncrease: isInc,
      error: null,
      steps: [
        { label: 'Identify values', math: `Old = ${old},  New = ${newVal}`, note: 'Always compare the new value with the old value' },
        { label: 'Find the difference', math: `Difference = ${newVal} − ${old} = ${chg}`, note: chg >= 0 ? 'Positive means increase' : 'Negative means decrease' },
        { label: 'Divide by the original', math: `${chg} ÷ |${old}| = ${fmt(chg / Math.abs(old))}`, note: 'The original value is the base for comparison' },
        { label: 'Multiply by 100', math: `${fmt(chg / Math.abs(old))} × 100 = ${fmt(pct)}%`, note: 'This changes the decimal into a percentage' },
        { label: 'Result', math: `${fmt(Math.abs(pct))}% ${isInc ? 'increase' : 'decrease'}`, note: isInc ? `The value went up by ${fmt(Math.abs(pct))}%` : `The value went down by ${fmt(Math.abs(pct))}%` },
      ]
    }
  }

  if (mode === 'increase') {
    const r = old * (1 + rate / 100)
    return {
      result: r,
      change: r - old,
      isIncrease: true,
      error: null,
      steps: [
        { label: 'Write the formula', math: `New = Old × (1 + Rate/100)` },
        { label: 'Convert rate', math: `1 + ${rate}/100 = ${fmt(1 + rate / 100)}`, note: `${rate}% becomes ${fmt(rate / 100)} as a decimal` },
        { label: 'Multiply', math: `${old} × ${fmt(1 + rate / 100)} = ${fmt(r)}` },
        { label: 'Increase amount', math: `Increase = ${fmt(r)} − ${old} = ${fmt(r - old)}` },
      ]
    }
  }

  if (mode === 'decrease') {
    const r = old * (1 - rate / 100)
    return {
      result: r,
      change: r - old,
      isIncrease: false,
      error: null,
      steps: [
        { label: 'Write the formula', math: `New = Old × (1 − Rate/100)` },
        { label: 'Convert rate', math: `1 − ${rate}/100 = ${fmt(1 - rate / 100)}`, note: `This multiplier removes ${rate}% from the original` },
        { label: 'Multiply', math: `${old} × ${fmt(1 - rate / 100)} = ${fmt(r)}` },
        { label: 'Decrease amount', math: `Decrease = ${old} − ${fmt(r)} = ${fmt(old - r)}` },
      ]
    }
  }

  if (mode === 'original') {
    const mult = dir === 'increase' ? 1 + rate / 100 : 1 - rate / 100
    const r = newVal / mult
    return {
      result: r,
      change: newVal - r,
      isIncrease: dir === 'increase',
      error: null,
      steps: [
        { label: 'Write the formula', math: `Original = New ÷ (1 ${dir === 'increase' ? '+' : '−'} Rate/100)` },
        { label: 'Calculate multiplier', math: `1 ${dir === 'increase' ? '+' : '−'} ${rate}/100 = ${fmt(mult)}` },
        { label: 'Divide', math: `${newVal} ÷ ${fmt(mult)} = ${fmt(r)}` },
        { label: 'Verify', math: `${fmt(r)} × ${fmt(mult)} = ${fmt(r * mult)} ✓` },
      ]
    }
  }

  return { result: 0, steps: [], error: null }
}

const REAL_WORLD = [
  { icon: '📉', field: 'Stock Market', desc: 'If a share drops from ₹500 to ₹420, the percentage decrease is 16%. This tells you the loss compared with the original price.', example: '₹500 → ₹420 = −16%', color: '#ef4444' },
  { icon: '🏠', field: 'Property Prices', desc: 'A house going from ₹40L to ₹55L has risen by 37.5%. This makes price growth easier to compare.', example: '₹40L → ₹55L = +37.5%', color: '#10b981' },
  { icon: '📊', field: 'Business Revenue', desc: 'Companies report percentage growth to compare performance across years and sizes.', example: '₹2Cr → ₹2.4Cr = +20%', color: '#3b82f6' },
  { icon: '🎓', field: 'Exam Scores', desc: 'If marks rise from 62 to 74, the improvement is 19.4%, which says more than just +12 marks.', example: '62 → 74 = +19.4%', color: '#f59e0b' },
  { icon: '💰', field: 'Inflation', desc: 'If an item price rises from ₹80 to ₹88, that is 10% inflation.', example: '₹80 → ₹88 = +10%', color: '#ec4899' },
  { icon: '🛒', field: 'Discounts', desc: 'A price drop from ₹2000 to ₹1500 means a 25% discount.', example: '₹2000 → ₹1500 = −25%', color: '#8b5cf6' },
]

const MISTAKES = [
  'Dividing by the new value instead of the old value',
  'Thinking a 50% increase and 50% decrease always cancel out',
  'Confusing percentage change with percentage point change',
  'Getting the sign wrong — a decrease from 100 to 80 is −20%, not +20%',
]

const GLOSSARY = [
  { term: 'Percentage change', def: 'The relative change between an old and new value, expressed as a percentage of the original.' },
  { term: 'Original value', def: 'The starting point you are measuring change from. This is the denominator in the formula.' },
  { term: 'Absolute change', def: 'The raw difference: New − Old.' },
  { term: 'Relative change', def: 'How much something changed compared with its starting size.' },
  { term: 'Percentage point', def: 'The direct arithmetic difference between two percentages.' },
  { term: 'Multiplier', def: 'The number you multiply by. A 20% increase uses 1.20. A 15% decrease uses 0.85.' },
]

const FAQ = [
  { q: 'Why does a 50% increase followed by a 50% decrease not cancel out?', a: 'Because the base changes. 100 → 150 after a 50% increase. Then 150 → 75 after a 50% decrease. The second percentage is taken from a different base.' },
  { q: 'What is the difference between percentage change and percentage difference?', a: 'Percentage change uses a clear original value. Percentage difference compares two values without choosing one as the starting point.' },
  { q: 'How do I reverse a percentage change to find the original?', a: 'Use the “Find original” mode. Divide the final value by the percentage multiplier, such as 1.20 or 0.85.' },
  { q: 'What does a negative percentage change mean?', a: 'It means the value decreased. For example, −15% means the new value is 15% below the original.' },
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
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function StepsCard({ steps, color }) {
  const [exp, setExp] = useState(false)
  if (!steps || !steps.length) return null
  const vis = exp ? steps : steps.slice(0, 2)

  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step working</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vis.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: i === steps.length - 1 ? color : color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === steps.length - 1 ? '#fff' : color }}>
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div style={{ fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", fontWeight: i === steps.length - 1 ? 700 : 500, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}` }}>
                {s.math}
              </div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}
        {steps.length > 2 && (
          <button onClick={() => setExp(e => !e)} style={{ padding: '9px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '08', color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {exp ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

function MathInput({ label, value, onChange, hint, color, unit }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', transition: 'border-color .15s' }}>
        <input type="number" value={value} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
        {unit && <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderLeft: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>{unit}</div>}
      </div>
    </div>
  )
}

function FormulaBanner({ formula, color }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${color}12,${color}06)`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 20px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Formula</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{formula}</div>
    </div>
  )
}

function WhatIsThisCard({ color }) {
  return (
    <Sec title="What is percentage change?" sub="Start here if the topic feels confusing">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}22`, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.75 }}>
          Percentage change tells you <b>how much something increased or decreased compared with where it started</b>.
          <br /><br />
          It does not just ask, “How much changed?”
          <br />
          It asks, “How big was that change compared with the original value?”
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '12px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>ABSOLUTE CHANGE</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              New − Old
              <br />
              Example: 120 − 100 = 20
            </div>
          </div>

          <div style={{ padding: '12px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>PERCENTAGE CHANGE</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              (Change ÷ Old) × 100
              <br />
              Example: (20 ÷ 100) × 100 = 20%
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 13px', background: '#f59e0b10', borderRadius: 9, border: '1px solid #f59e0b25', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 Same change, different percentage:
          <br />
          100 → 120 is +20%
          <br />
          500 → 520 is only +4%
        </div>
      </div>
    </Sec>
  )
}

function WhyUseItCard({ color }) {
  return (
    <Sec title="Why do people use percentage change?" sub="Why it matters">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { title: 'Better comparison', text: 'It helps compare changes across values of different sizes.', c: color },
          { title: 'Used everywhere', text: 'Finance, shopping, business, science, marks, inflation, and investing all use it.', c: '#10b981' },
          { title: 'Shows direction', text: 'It tells whether something went up or down.', c: '#ef4444' },
          { title: 'Quick interpretation', text: 'A single percentage often explains the trend faster than raw numbers.', c: '#8b5cf6' },
        ].map((x, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: x.c + '08', border: `1px solid ${x.c}25` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: x.c, marginBottom: 6 }}>{x.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{x.text}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function WhichModeCard({ color }) {
  return (
    <Sec title="Which mode should I use?" sub="Pick the right one quickly">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { t: '% change between two values', d: 'Use this when you know the starting value and the ending value.', c: '#3b82f6' },
          { t: 'Find new value after % increase', d: 'Use this when something grows by a known percentage.', c: '#10b981' },
          { t: 'Find new value after % decrease', d: 'Use this when something falls by a known percentage.', c: '#ef4444' },
          { t: 'Find original before % change', d: 'Use this when you know the final value and want to work backwards.', c: '#f59e0b' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: m.c + '08', border: `1px solid ${m.c}25` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: m.c, marginBottom: 6 }}>{m.t}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{m.d}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function QuickRulesCard({ color }) {
  return (
    <Sec title="Quick rules to remember" sub="These make the topic easier">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'Increase means the new value is bigger than the old value.',
          'Decrease means the new value is smaller than the old value.',
          'For percentage change, always divide by the original value.',
          'A 20% increase uses multiplier 1.20.',
          'A 20% decrease uses multiplier 0.80.',
          'Working backward means divide by the multiplier, not subtract the percentage again.'
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <span style={{ color, fontWeight: 700 }}>✓</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{r}</span>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function InterpretationCard({ mode, result, change, isIncrease, old, newVal, rate, dir, color }) {
  let text = ''
  if (mode === 'change') {
    text = `This means the value moved from ${old} to ${newVal}, which is a ${fmt(Math.abs(result))}% ${isIncrease ? 'increase' : 'decrease'}.`
  } else if (mode === 'increase') {
    text = `A ${rate}% increase on ${old} gives ${fmt(result)}.`
  } else if (mode === 'decrease') {
    text = `A ${rate}% decrease on ${old} gives ${fmt(result)}.`
  } else {
    text = `If ${newVal} is the value after a ${rate}% ${dir}, the original value was ${fmt(result)}.`
  }

  return (
    <Sec title="How to read this answer" sub="Plain-English interpretation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}22`, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
          {text}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${color}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Direction</div>
            <div style={{ fontSize: 15, fontWeight: 700, color }}>{isIncrease ? 'Increase' : 'Decrease'}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid #10b98122', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Absolute change</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>{fmt(Math.abs(change || 0))}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid #f59e0b22', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Percent view</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>{mode === 'change' ? `${fmt(Math.abs(result))}%` : `${fmt(rate)}%`}</div>
          </div>
        </div>
      </div>
    </Sec>
  )
}

function ReverseTrapCard() {
  return (
    <Sec title="A common trap" sub="Why percentage up and percentage down are tricky">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#10b98108', border: '1px solid #10b98125' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>50% increase</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
            100 → 150
            <br />
            because 100 × 1.50 = 150
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#ef444408', border: '1px solid #ef444425' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>Then 50% decrease</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
            150 → 75
            <br />
            because 150 × 0.50 = 75
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '10px 13px', background: '#f59e0b10', borderRadius: 9, border: '1px solid #f59e0b25', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
        Same percentage, different base. That is why equal percentage up and down do not usually cancel.
      </div>
    </Sec>
  )
}

function PercentVsPointsCard({ color }) {
  return (
    <Sec title="Percentage change vs percentage points" sub="These are not the same">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}22`, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Suppose an interest rate goes from <b>5%</b> to <b>8%</b>.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 5 }}>PERCENTAGE POINT CHANGE</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              8% − 5% = <b>3 percentage points</b>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 5 }}>PERCENTAGE CHANGE</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              ((8 − 5) ÷ 5) × 100 = <b>60%</b>
            </div>
          </div>
        </div>
      </div>
    </Sec>
  )
}

function BeforeAfterMeaningCard({ old, newVal, color }) {
  if (old === '' || newVal === '') return null
  const abs = newVal - old
  return (
    <Sec title="Before vs after meaning" sub="Understand the two numbers first">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}22` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 5 }}>BEFORE</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{old}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>This is the starting value.</div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#10b98108', border: '1px solid #10b98122' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 5 }}>AFTER</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{newVal}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>This is the ending value.</div>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
        Raw difference = <b>{newVal}</b> − <b>{old}</b> = <b>{fmt(abs)}</b>
      </div>
    </Sec>
  )
}

function RealWorldGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {REAL_WORLD.map((rw, i) => (
        <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 18 }}>{rw.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.field}</span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '0 0 7px', fontFamily: "'DM Sans',sans-serif" }}>{rw.desc}</p>
          <div style={{ fontSize: 10, fontWeight: 600, color: rw.color, padding: '3px 8px', background: rw.color + '15', borderRadius: 6, display: 'inline-block' }}>{rw.example}</div>
        </div>
      ))}
    </div>
  )
}

function MistakesList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 9, background: '#fee2e210', border: '0.5px solid #ef444420' }}>
          <span style={{ fontSize: 14, flexShrink: 0, color: '#ef4444', fontWeight: 700 }}>✗</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{m}</span>
        </div>
      ))}
    </div>
  )
}

export default function PercentageChangeCalculator({ meta, category }) {
  const catColor = category?.color || '#3b82f6'
  const [mode, setMode] = useState('change')
  const [old, setOld] = useState(200)
  const [newVal, setNewVal] = useState(250)
  const [rate, setRate] = useState(20)
  const [dir, setDir] = useState('increase')
  const [openFaq, setOpenFaq] = useState(null)
  const [openGloss, setOpenGloss] = useState(null)

  const modeObj = MODES.find(m => m.v === mode) || MODES[0]
  const { result, change, isIncrease, steps, error } = compute(mode, Number(old) || 0, Number(newVal) || 0, Number(rate) || 0, dir)
  const resultColor = isIncrease ? '#10b981' : '#ef4444'
  const hint = `${modeObj.label}: Old=${old}, New=${newVal}, Rate=${rate}% → ${fmt(result)}`

  const barOld = mode === 'change' ? Number(old) || 0 : mode === 'original' ? Number(result) || 0 : Number(old) || 0
  const barNew = mode === 'change' ? Number(newVal) || 0 : mode === 'original' ? Number(newVal) || 0 : Number(result) || 0
  const barMax = Math.max(barOld, barNew, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaBanner formula={modeObj.formula} color={catColor} />

      <CalcShell
        left={
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Mode</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {MODES.map(m => (
                <button key={m.v} onClick={() => setMode(m.v)} style={{ padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${mode === m.v ? m.color : 'var(--border-2)'}`, background: mode === m.v ? m.color + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: mode === m.v ? 700 : 500, color: mode === m.v ? m.color : 'var(--text)' }}>{m.label}</div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
              {mode === 'change' && (
                <>
                  <MathInput label="Original / old value" value={old} onChange={setOld} color={catColor} />
                  <MathInput label="New value" value={newVal} onChange={setNewVal} color={catColor} />
                </>
              )}

              {(mode === 'increase' || mode === 'decrease') && (
                <>
                  <MathInput label="Original value" value={old} onChange={setOld} color={catColor} />
                  <MathInput label="Percentage rate" value={rate} onChange={setRate} unit="%" color={catColor} />
                </>
              )}

              {mode === 'original' && (
                <>
                  <MathInput label="New (final) value" value={newVal} onChange={setNewVal} color={catColor} />
                  <MathInput label="Percentage rate" value={rate} onChange={setRate} unit="%" color={catColor} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Direction of change</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {['increase', 'decrease'].map(d => (
                      <button key={d} onClick={() => setDir(d)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1.5px solid ${dir === d ? catColor : 'var(--border-2)'}`, background: dir === d ? catColor + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: dir === d ? 700 : 500, color: dir === d ? catColor : 'var(--text-2)', cursor: 'pointer' }}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>🎯 Quick examples</div>
              {[
                { old: 100, newVal: 120, rate: 20, label: '100 → 120 (20% up)' },
                { old: 500, newVal: 400, rate: 20, label: '₹500 → ₹400 (−20%)' },
                { old: 50, newVal: 75, rate: 50, label: '50 → 75 (50% up)' },
                { old: 1000, newVal: 850, rate: 15, label: '₹1000 → ₹850 (−15%)' }
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setOld(ex.old); setNewVal(ex.newVal); setRate(ex.rate); setMode('change') }}
                  style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', marginBottom: 6, fontSize: 12, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = catColor + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </>
        }
        right={
          <>
            {error ? (
              <div style={{ background: '#fee2e2', border: '1px solid #ef444430', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>⚠ {error}</div>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${resultColor}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Result</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 52, fontWeight: 700, color: resultColor, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>
                      {mode === 'change' ? (isIncrease ? '+' : '') + fmt(result) + '%' : fmt(result)}
                    </div>
                    {mode === 'change' && <div style={{ padding: '4px 12px', borderRadius: 20, background: resultColor + '18', border: `1px solid ${resultColor}35`, fontSize: 12, fontWeight: 700, color: resultColor, marginBottom: 8 }}>{isIncrease ? 'Increase' : 'Decrease'}</div>}
                  </div>
                  <div style={{ padding: '10px 13px', background: resultColor + '08', borderRadius: 9, border: `1px solid ${resultColor}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    💡 {mode === 'change' && `The value ${isIncrease ? 'increased' : 'decreased'} by ${fmt(Math.abs(result))}% — an absolute change of ${fmt(Math.abs(change || 0))}.`}
                    {mode === 'increase' && `After a ${rate}% increase, ${old} becomes ${fmt(result)}. The increase amount is ${fmt(result - old)}.`}
                    {mode === 'decrease' && `After a ${rate}% decrease, ${old} becomes ${fmt(result)}. The decrease amount is ${fmt(old - result)}.`}
                    {mode === 'original' && `If ${newVal} is the value after a ${rate}% ${dir}, the original was ${fmt(result)}.`}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>Before vs after</div>
                  {[{ label: 'Before', val: barOld, color: catColor }, { label: 'After', val: barNew, color: resultColor }].map((b, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-2)' }}>{b.label}</span>
                        <span style={{ fontWeight: 700, color: b.color }}>{fmt(b.val)}</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${clamp((b.val / barMax) * 100, 2, 100)}%`, background: b.color, borderRadius: 5, transition: 'width .5s' }} />
                      </div>
                    </div>
                  ))}
                  {change !== undefined && <div style={{ marginTop: 8, padding: '8px 12px', background: resultColor + '08', borderRadius: 8, fontSize: 12, color: resultColor, fontWeight: 600 }}>{(change || 0) >= 0 ? '+' : ''}{fmt(change || 0)} absolute change ({(change || 0) >= 0 ? '+' : ''}{fmt(result)}{mode === 'change' ? '%' : ''})</div>}
                </div>

                <BreakdownTable
                  title="Summary"
                  rows={[
                    { label: 'Result', value: mode === 'change' ? `${fmt(result)}%` : fmt(result), bold: true, highlight: true, color: resultColor },
                    mode === 'change' ? { label: 'Absolute change', value: fmt(change || 0) } : { label: 'Rate used', value: `${rate}%` },
                    { label: 'Direction', value: isIncrease ? 'Increase' : 'Decrease', color: resultColor },
                  ]}
                />

                <AIHintCard hint={hint} />
              </>
            )}
          </>
        }
      />

      <WhatIsThisCard color={catColor} />
      <WhyUseItCard color={catColor} />
      <WhichModeCard color={catColor} />
      <QuickRulesCard color={catColor} />

      {mode === 'change' && !error && <BeforeAfterMeaningCard old={old} newVal={newVal} color={catColor} />}

      {!error && (
        <>
          <InterpretationCard mode={mode} result={result} change={change} isIncrease={isIncrease} old={old} newVal={newVal} rate={rate} dir={dir} color={catColor} />
          <ReverseTrapCard />
          <PercentVsPointsCard color={catColor} />
          <StepsCard steps={steps} color={catColor} />
        </>
      )}

      <Sec title="Where percentage change is used in real life">
        <RealWorldGrid />
      </Sec>

      <Sec title="⚠️ Common mistakes to avoid">
        <MistakesList items={MISTAKES} />
      </Sec>

      <Sec title="Key terms explained" sub="Tap to expand">
        {GLOSSARY.map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setOpenGloss(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span>
              </div>
              <span style={{ fontSize: 16, color: catColor, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={catColor} />
        ))}
      </Sec>
    </div>
  )
}