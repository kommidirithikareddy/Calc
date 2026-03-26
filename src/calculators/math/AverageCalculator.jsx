import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(Number(n).toFixed(8)).toString()

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
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '13px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: 12,
          textAlign: 'left'
        }}
      >
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
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                flexShrink: 0,
                background: i === steps.length - 1 ? color : color + '18',
                border: `1.5px solid ${color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: i === steps.length - 1 ? '#fff' : color
              }}
            >
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: i === steps.length - 1 ? 700 : 500,
                  background: 'var(--bg-raised)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}`
                }}
              >
                {s.math}
              </div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}

        {steps.length > 2 && (
          <button
            onClick={() => setExp(e => !e)}
            style={{
              padding: '9px',
              borderRadius: 9,
              border: `1px solid ${color}30`,
              background: color + '08',
              color,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {exp ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

function MathInput({ label, value, onChange, hint, color, unit, type = 'number', placeholder }) {
  const [f, setF] = useState(false)

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: 44,
          border: `1.5px solid ${f ? color : 'var(--border-2)'}`,
          borderRadius: 9,
          overflow: 'hidden',
          background: 'var(--bg-card)',
          transition: 'border-color .15s'
        }}
      >
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '0 14px',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text)',
            outline: 'none',
            fontFamily: "'Space Grotesk',sans-serif"
          }}
        />
        {unit && <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderLeft: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>{unit}</div>}
      </div>
    </div>
  )
}

function FormulaCard({ formula, desc, color }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${color}12,${color}06)`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 20px', marginBottom: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Formula</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{formula}</div>
      {desc && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{desc}</div>}
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

function ExampleChip({ value, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--border-2)',
        background: 'var(--bg-raised)',
        cursor: 'pointer',
        textAlign: 'left',
        minHeight: 62
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)' }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.35 }}>{label}</span>
    </button>
  )
}

function MeaningCard({ mean, median, mode, range, count, color }) {
  if (mean == null || median == null) return null

  const diff = Math.abs(Number(mean) - Number(median))

  let shapeText = 'Your data looks fairly balanced.'
  if (diff >= 5) shapeText = 'Your data may be strongly skewed because the mean and median are far apart.'
  else if (diff >= 2) shapeText = 'Your data may be a little skewed because the mean and median are not very close.'

  const modeText =
    !mode || mode.length === 0
      ? 'There is no clear most common value.'
      : mode.length > 3
        ? 'Many values repeat with the same frequency.'
        : `The most common value${mode.length > 1 ? 's are' : ' is'} ${mode.join(', ')}.`

  return (
    <div style={{ background: `linear-gradient(135deg, ${color}10, ${color}04)`, border: `1px solid ${color}28`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
        What does this answer mean?
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
        If these numbers were shared equally, each value would become about{' '}
        <span style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{fmt(mean)}</span>.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>MIDDLE VALUE</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Median is <b style={{ color: '#10b981' }}>{fmt(median)}</b>, so half the values are below it and half are above it.
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>DATA SPREAD</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Range is <b style={{ color: '#8b5cf6' }}>{fmt(range)}</b>, which shows how spread out your values are.
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 10, border: '0.5px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
        <b style={{ color: 'var(--text)' }}>Simple summary:</b> You entered {count} numbers. {shapeText} {modeText}
      </div>
    </div>
  )
}

function EqualShareVisual({ nums, mean, color }) {
  if (!nums?.length || mean == null) return null

  const max = Math.max(...nums, mean)
  const display = nums.slice(0, 8)

  return (
    <Sec title="See it visually" sub="Equal sharing idea">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Original values
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 120 }}>
            {display.map((n, i) => {
              const h = 28 + (n / (max || 1)) * 72
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: h,
                      borderRadius: '10px 10px 6px 6px',
                      background: `linear-gradient(180deg, ${color}, ${color}aa)`,
                      border: `1px solid ${color}50`,
                      minWidth: 24
                    }}
                  />
                  <div style={{ fontSize: 11, marginTop: 8, color: 'var(--text-2)', fontWeight: 600 }}>{fmt(n)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            If shared equally
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 120 }}>
            {display.map((_, i) => {
              const h = 28 + (mean / (max || 1)) * 72
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: h,
                      borderRadius: '10px 10px 6px 6px',
                      background: 'linear-gradient(180deg, #10b981, #10b981bb)',
                      border: '1px solid #10b98150',
                      minWidth: 24
                    }}
                  />
                  <div style={{ fontSize: 11, marginTop: 8, color: '#10b981', fontWeight: 700 }}>{fmt(mean)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 The mean is the <b>equal-share value</b>. Imagine moving amount from taller bars to shorter bars until they all become the same height.
        </div>
      </div>
    </Sec>
  )
}

function OutlierImpactCard({ nums, color }) {
  if (!nums || nums.length < 3) return null

  const baseMean = nums.reduce((s, n) => s + n, 0) / nums.length
  const sortedBase = [...nums].sort((a, b) => a - b)
  const baseMedian =
    sortedBase.length % 2 === 0
      ? (sortedBase[sortedBase.length / 2 - 1] + sortedBase[sortedBase.length / 2]) / 2
      : sortedBase[Math.floor(sortedBase.length / 2)]

  const biggest = Math.max(...nums)
  const outlier = biggest + Math.max(10, Math.round(Math.abs(biggest) * 1.5) || 10)
  const withOutlier = [...nums, outlier]

  const outlierMean = withOutlier.reduce((s, n) => s + n, 0) / withOutlier.length
  const sortedOutlier = [...withOutlier].sort((a, b) => a - b)
  const outlierMedian =
    sortedOutlier.length % 2 === 0
      ? (sortedOutlier[sortedOutlier.length / 2 - 1] + sortedOutlier[sortedOutlier.length / 2]) / 2
      : sortedOutlier[Math.floor(sortedOutlier.length / 2)]

  const meanShift = outlierMean - baseMean
  const medianShift = outlierMedian - baseMedian

  return (
    <Sec title="Outlier impact" sub="Why mean and median behave differently">
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
        An <b>outlier</b> is a value much bigger or smaller than the rest. Below, one large value is added to your dataset so you can see which measure changes more.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: color + '08', border: `1px solid ${color}25` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>ORIGINAL DATA</div>
          <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}>{nums.join(', ')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Mean: <b style={{ color }}>{fmt(baseMean)}</b><br />
            Median: <b style={{ color: '#10b981' }}>{fmt(baseMedian)}</b>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#ef444408', border: '1px solid #ef444425' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>WITH OUTLIER ADDED</div>
          <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}>{withOutlier.join(', ')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            Mean: <b style={{ color: '#ef4444' }}>{fmt(outlierMean)}</b><br />
            Median: <b style={{ color: '#10b981' }}>{fmt(outlierMedian)}</b>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${color}25` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>CHANGE IN MEAN</div>
          <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>+{fmt(meanShift)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>The mean moves more because it uses every value directly.</div>
        </div>

        <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid #10b98125' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>CHANGE IN MEDIAN</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk', sans-serif" }}>{fmt(medianShift)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>The median usually changes less.</div>
        </div>
      </div>
    </Sec>
  )
}

function ChallengeCard({ nums, mean, median, color }) {
  const [show, setShow] = useState(false)
  if (!nums || nums.length < 3) return null

  const biggest = Math.max(...nums)
  const extra = biggest + Math.max(8, Math.round(biggest * 0.8) || 8)

  const correct =
    Math.abs((mean ?? 0) - (median ?? 0)) < 1
      ? 'Both are reasonable here because the data looks fairly balanced.'
      : mean > median
        ? 'The data is likely right-skewed, so the median may describe the typical value better.'
        : 'The data may be left-skewed, so checking the median is useful.'

  return (
    <Sec title="Challenge yourself" sub="Quick thinking quiz">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75 }}>
          Suppose one more number is added to your dataset:
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                padding: '9px 12px',
                display: 'inline-block',
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: '0.5px solid var(--border)',
                fontWeight: 700,
                color,
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              + {extra}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 24, width: 46, height: 46, borderRadius: '50%', background: color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          🧠
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          'The mean will change more',
          'The median will change more',
          'Both will always change equally',
          'Nothing will change'
        ].map((option, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            {String.fromCharCode(65 + i)}. {option}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShow(v => !v)}
        style={{
          padding: '10px 14px',
          borderRadius: 9,
          border: `1px solid ${color}30`,
          background: color + '10',
          color,
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        {show ? 'Hide answer' : 'Reveal answer'}
      </button>

      {show && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 8 }}>
            ✅ <b style={{ color: 'var(--text)' }}>Correct answer:</b> The <b>mean</b> will usually change more.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
            {correct}
          </div>
        </div>
      )}
    </Sec>
  )
}

export default function AverageCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [input, setInput] = useState('4, 7, 13, 2, 1')
  const [openFaq, setOpenFaq] = useState(null)

  const nums = input.split(/[\s,;]+/).map(Number).filter(n => !isNaN(n) && n !== '')
  const sorted = [...nums].sort((a, b) => a - b)
  const mean = nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : null
  const median = nums.length
    ? (nums.length % 2 === 0
      ? (sorted[nums.length / 2 - 1] + sorted[nums.length / 2]) / 2
      : sorted[Math.floor(nums.length / 2)])
    : null

  const modeMap = {}
  nums.forEach(n => { modeMap[n] = (modeMap[n] || 0) + 1 })
  const maxFreq = Math.max(...Object.values(modeMap || { 0: 0 }))
  const mode = Object.entries(modeMap).filter(([, f]) => f === maxFreq).map(([n]) => Number(n))
  const range = nums.length ? sorted[sorted.length - 1] - sorted[0] : null
  const sum = nums.reduce((s, n) => s + n, 0)

  const steps = [
    { label: 'List the numbers', math: nums.join(', '), note: `${nums.length} numbers entered` },
    { label: 'Sum all values', math: `${nums.join(' + ')} = ${sum}`, note: 'Add every number together' },
    { label: 'Count the values', math: `Count = ${nums.length}` },
    { label: 'Calculate mean', math: `Mean = ${sum} ÷ ${nums.length} = ${fmt(mean)}`, note: 'Divide sum by count' },
    { label: 'Sort for median', math: `Sorted: ${sorted.join(', ')}`, note: 'Arrange from smallest to largest' },
    {
      label: 'Find median',
      math: nums.length % 2 === 0
        ? `Median = (${sorted[nums.length / 2 - 1]} + ${sorted[nums.length / 2]}) ÷ 2 = ${fmt(median)}`
        : `Median = middle value = ${fmt(median)}`,
      note: nums.length % 2 === 0 ? 'Even count: average the two middle values' : 'Odd count: take the middle value'
    },
    {
      label: 'Result',
      math: `Mean = ${fmt(mean)}, Median = ${fmt(median)}, Mode = ${mode.join(', ')}`,
      note: mode.length === nums.length ? 'No repeating values — every number could be considered the mode' : 'Most frequently occurring value(s)'
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaCard
        formula="Mean = Σx / n    Median = middle value    Mode = most frequent"
        desc="Three different ways to describe the centre of a dataset"
        color={C}
      />

      <CalcShell
        left={
          <div style={{ alignSelf: 'flex-start', height: 'fit-content' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '0.5px solid var(--border)',
                borderRadius: 14,
                padding: '16px 18px',
                height: 'fit-content'
              }}
            >
              <MathInput
                label="Enter numbers (comma or space separated)"
                value={input}
                onChange={setInput}
                type="text"
                placeholder="e.g. 4, 7, 13, 2, 1"
                color={C}
                hint={`${nums.length} numbers entered`}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>
                  Accepts commas, spaces, or semicolons
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 20,
                    background: C + '10',
                    border: `1px solid ${C}20`,
                    fontSize: 10,
                    fontWeight: 700,
                    color: C
                  }}
                >
                  {nums.length} values
                </div>
              </div>

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Quick examples
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <ExampleChip value="1, 2, 3, 4, 5" label="Simple sequence" onClick={() => setInput('1, 2, 3, 4, 5')} color={C} />
                  <ExampleChip value="10, 20, 30, 40, 50" label="Multiples of 10" onClick={() => setInput('10, 20, 30, 40, 50')} color={C} />
                  <ExampleChip value="23, 45, 12, 67, 34, 23, 56" label="Exam scores" onClick={() => setInput('23, 45, 12, 67, 34, 23, 56')} color={C} />
                  <ExampleChip value="2, 4, 4, 4, 5, 5, 7, 9" label="Clear mode" onClick={() => setInput('2, 4, 4, 4, 5, 5, 7, 9')} color={C} />
                </div>
              </div>
            </div>
          </div>
        }
        right={
          <>
            {nums.length === 0 ? (
              <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Enter numbers above to calculate</div>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    {[
                      { label: 'Mean', val: fmt(mean), color: C, note: 'Arithmetic average' },
                      { label: 'Median', val: fmt(median), color: '#10b981', note: 'Middle value' },
                      { label: 'Mode', val: mode.length === nums.length ? 'No mode' : mode.join(', '), color: '#f59e0b', note: 'Most frequent' },
                      { label: 'Range', val: fmt(range), color: '#8b5cf6', note: `${sorted[0]} to ${sorted[sorted.length - 1]}` }
                    ].map((s, i) => (
                      <div key={i} style={{ padding: '12px', background: 'var(--bg-raised)', borderRadius: 10, border: `1px solid ${s.color}25` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{s.note}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    💡 {Math.abs((mean || 0) - (median || 0)) < 0.5
                      ? 'Mean and median are close — your data is roughly symmetric.'
                      : 'Mean and median differ — your data may be skewed or contain outliers.'}
                  </div>
                </div>

                {nums.length > 0 && nums.length <= 20 && (
                  <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Dot plot</div>
                    {(() => {
                      const mn = Math.min(...nums)
                      const mx = Math.max(...nums)
                      const W = 260
                      const padX = 20
                      const toX = v => padX + ((v - mn) / (mx - mn || 1)) * (W - 2 * padX)

                      return (
                        <svg viewBox={`0 0 ${W} 60`} width="100%" style={{ display: 'block' }}>
                          <line x1={padX} y1={40} x2={W - padX} y2={40} stroke="var(--border)" strokeWidth="1.5" />
                          {nums.map((n, i) => <circle key={i} cx={toX(n)} cy={32} r="5" fill={C} opacity="0.75" />)}
                          <circle cx={toX(mean)} cy={40} r="4" fill="#10b981" strokeWidth="2" stroke="#fff" />
                          <text x={toX(mean)} y={55} textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="700">mean</text>
                          <text x={padX} y={52} fontSize="8" fill="var(--text-3)">{mn}</text>
                          <text x={W - padX} y={52} textAnchor="end" fontSize="8" fill="var(--text-3)">{mx}</text>
                        </svg>
                      )
                    })()}
                  </div>
                )}

                <BreakdownTable
                  title="Full summary"
                  rows={[
                    { label: 'Mean', value: fmt(mean), bold: true, highlight: true, color: C },
                    { label: 'Median', value: fmt(median), color: '#10b981' },
                    { label: 'Mode', value: mode.length === nums.length ? 'No mode' : mode.join(', '), color: '#f59e0b' },
                    { label: 'Range', value: fmt(range) },
                    { label: 'Sum', value: String(sum) },
                    { label: 'Count', value: String(nums.length) },
                    { label: 'Min', value: String(sorted[0]) },
                    { label: 'Max', value: String(sorted[sorted.length - 1]) }
                  ]}
                />

                <AIHintCard hint={`Data: ${input} → Mean: ${fmt(mean)}, Median: ${fmt(median)}, Mode: ${mode.join(', ')}, Range: ${fmt(range)}`} />
              </>
            )}
          </>
        }
      />

      {nums.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MeaningCard
            mean={mean}
            median={median}
            mode={mode.length === nums.length ? [] : mode}
            range={range}
            count={nums.length}
            color={C}
          />

          <EqualShareVisual nums={nums} mean={mean} color={C} />

          <StepsCard steps={steps} color={C} />

          <OutlierImpactCard nums={nums} color={C} />

          <ChallengeCard nums={nums} mean={mean} median={median} color={C} />
        </div>
      )}

      <Sec title="Mean, median, mode — which should you use?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              m: 'Mean',
              when: 'Most of the time — when data is symmetric and has no extreme outliers',
              avoid: 'When data is heavily skewed',
              ex: 'Average test score in a class',
              color: C
            },
            {
              m: 'Median',
              when: 'When data is skewed or has outliers',
              avoid: 'When the exact sum matters',
              ex: 'Median house price',
              color: '#10b981'
            },
            {
              m: 'Mode',
              when: 'When you want the most common value',
              avoid: 'When every value is unique',
              ex: 'Most popular shoe size',
              color: '#f59e0b'
            }
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: s.color + '08', border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.m}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 2 }}>USE WHEN</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.when}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 2 }}>AVOID WHEN</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.avoid}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: s.color, fontWeight: 600 }}>Example: {s.ex}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="⚠️ Common mistakes">
        <MistakesList
          items={[
            'Using the mean when data has outliers — the median is more robust',
            'Confusing median calculation for even vs odd datasets',
            'Saying there is no mode when values repeat equally'
          ]}
        />
      </Sec>

      <Sec title="Frequently asked questions">
        {[
          {
            q: 'Why is the median sometimes better than the mean?',
            a: 'Because the mean is pulled by extreme values. The median gives a better picture of the typical value when outliers exist.'
          },
          {
            q: 'What does it mean when mean is greater than median?',
            a: 'Usually the data is right-skewed, which means some large values are pulling the mean upward.'
          },
          {
            q: 'Can a dataset have more than one mode?',
            a: 'Yes. A dataset can be bimodal or multimodal when more than one value appears most often.'
          }
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>
    </div>
  )
}