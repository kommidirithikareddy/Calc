import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(Number(n).toFixed(8)).toString()
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }

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

function MeaningCard({ mode, dec, simpN, simpD, fracN, fracD, decResult, pct, color, isTerminating }) {
  return (
    <Sec title="What does this answer mean?" sub="Simple explanation">
      {mode === 'decToFrac' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
            The decimal <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(dec)}</span> means the same amount as the fraction{' '}
            <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{simpN}/{simpD}</span>.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>AS A FRACTION</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                This means <b style={{ color }}>{simpN}</b> parts out of <b style={{ color }}>{simpD}</b> equal parts.
              </div>
            </div>

            <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>AS A PERCENT</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                It is also <b style={{ color: '#f59e0b' }}>{pct}</b>, which means that much out of 100.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
            The fraction <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{fracN}/{fracD}</span> becomes the decimal{' '}
            <span style={{ color: '#10b981', fontFamily: "'Space Grotesk',sans-serif" }}>{decResult}</span>.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>DIVISION IDEA</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                A fraction is just division: <b>{fracN} ÷ {fracD}</b>.
              </div>
            </div>

            <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>DECIMAL TYPE</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                {isTerminating
                  ? <>This decimal <b style={{ color: '#10b981' }}>ends exactly</b>.</>
                  : <>This decimal <b style={{ color: '#ef4444' }}>repeats forever</b>.</>}
              </div>
            </div>
          </div>
        </div>
      )}
    </Sec>
  )
}

function FractionStrip({ mode, dec, fracN, fracD, simpN, simpD, color }) {
  const denominator = mode === 'decToFrac' ? simpD : fracD
  const numerator = mode === 'decToFrac' ? simpN : fracN

  if (!denominator || denominator <= 0 || denominator > 20) return null

  return (
    <Sec title="See it visually" sub="Fraction strip">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          This strip shows <b>{numerator}/{denominator}</b> as shaded parts of one whole.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${denominator}, 1fr)`, gap: 6 }}>
          {Array.from({ length: denominator }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 38,
                borderRadius: 8,
                background: i < numerator ? color : 'var(--bg-raised)',
                border: `1px solid ${i < numerator ? color + '55' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: i < numerator ? '#fff' : 'var(--text-3)'
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${color}25`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>FRACTION</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{numerator}/{denominator}</div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid #10b98125', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>DECIMAL</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk',sans-serif" }}>
              {mode === 'decToFrac' ? fmt(dec) : fmt(numerator / denominator)}
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid #f59e0b25', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>PERCENT</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', fontFamily: "'Space Grotesk',sans-serif" }}>
              {fmt((numerator / denominator) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </Sec>
  )
}

function NumberLineVisual({ mode, dec, fracN, fracD, color }) {
  const val = mode === 'decToFrac' ? clamp(Number(dec) || 0, 0, 1) : clamp((fracD !== 0 ? fracN / fracD : 0), 0, 1)
  const pctPos = val * 100

  return (
    <Sec title="Position on number line" sub="From 0 to 1">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative', height: 24, margin: '2px 8px' }}>
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 4, background: 'var(--border)', borderRadius: 3 }} />
          <div style={{ position: 'absolute', top: 4, left: `${pctPos}%`, transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', padding: '0 4px' }}>
          <span>0</span><span>0.25</span><span>0.5</span><span>0.75</span><span>1</span>
        </div>

        <div style={{ textAlign: 'center', padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          <b style={{ color }}>{fmt(val)}</b> means the value is <b>{(val * 100).toFixed(1)}%</b> of the distance from 0 to 1.
        </div>
      </div>
    </Sec>
  )
}

export default function DecimalFractionConverter({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [mode, setMode] = useState('decToFrac')
  const [dec, setDec] = useState(0.375)
  const [fracN, setFracN] = useState(3)
  const [fracD, setFracD] = useState(8)
  const [openFaq, setOpenFaq] = useState(null)

  const decToFrac = (d) => {
    const tolerance = 1e-10
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = d
    for (let i = 0; i < 50; i++) {
      const a = Math.floor(b), aux = h1
      h1 = a * h1 + h2
      h2 = aux
      const aux2 = k1
      k1 = a * k1 + k2
      k2 = aux2
      if (Math.abs(d - h1 / k1) < tolerance) break
      b = 1 / (b - a)
    }
    return { n: h1, d: k1 }
  }

  const result = mode === 'decToFrac' ? decToFrac(Number(dec) || 0) : { n: fracN, d: fracD }
  const decResult = mode === 'fracToDec'
    ? ((fracD !== 0) ? (fracN / fracD).toFixed(10).replace(/\.?0+$/, '') : 'undefined')
    : String(dec)

  const isTerminating = mode === 'fracToDec' && fracD !== 0 && (() => {
    let d2 = Math.abs(fracD), g = gcd(Math.abs(fracN || 1), d2)
    d2 = d2 / g
    while (d2 % 2 === 0) d2 = Math.floor(d2 / 2)
    while (d2 % 5 === 0) d2 = Math.floor(d2 / 5)
    return d2 === 1
  })()

  const pct = mode === 'decToFrac'
    ? ((Number(dec) || 0) * 100).toFixed(6).replace(/\.?0+$/, '') + '%'
    : (fracD !== 0 ? (fracN / fracD * 100).toFixed(6).replace(/\.?0+$/, '') + '%' : '—')

  const g = gcd(Math.abs(result.n), Math.abs(result.d))
  const simpN = result.n / g
  const simpD = result.d / g

  const steps = mode === 'decToFrac' ? [
    { label: 'Start with the decimal', math: String(Number(dec) || 0) },
    { label: 'Count decimal places', math: String(Number(dec) || 0).includes('.') ? `${String(Number(dec) || 0).split('.')[1].length} decimal places` : '0 decimal places', note: 'This tells us the initial denominator (10^n)' },
    { label: 'Write as fraction', math: `${String(Number(dec) || 0).replace('.', '')} / 10^${String(Number(dec) || 0).includes('.') ? String(Number(dec) || 0).split('.')[1].length : 0}`, note: 'Move decimal right by multiplying top and bottom by 10^n' },
    { label: 'Simplify', math: `GCD(${result.n},${result.d}) = ${g} → ${simpN}/${simpD}`, note: 'Divide both by GCD' },
    { label: 'Result', math: `${Number(dec)} = ${simpN}/${simpD}`, note: `Verify: ${simpN} ÷ ${simpD} = ${fmt(simpN / simpD)}` },
  ] : [
    { label: 'Write the fraction', math: `${fracN}/${fracD}`, note: 'Divide numerator by denominator' },
    { label: 'Perform division', math: `${fracN} ÷ ${fracD} = ${decResult}`, note: isTerminating ? 'This is a terminating decimal' : 'This is a recurring decimal — it repeats forever' },
    { label: 'As percentage', math: `${decResult} × 100 = ${pct}` },
  ]

  const COMMON = [
    { n: 1, d: 2, dec: '0.5', pct: '50%' }, { n: 1, d: 3, dec: '0.333...', pct: '33.33%' }, { n: 1, d: 4, dec: '0.25', pct: '25%' },
    { n: 3, d: 4, dec: '0.75', pct: '75%' }, { n: 1, d: 5, dec: '0.2', pct: '20%' }, { n: 2, d: 3, dec: '0.666...', pct: '66.67%' },
    { n: 1, d: 8, dec: '0.125', pct: '12.5%' }, { n: 5, d: 8, dec: '0.625', pct: '62.5%' }, { n: 1, d: 6, dec: '0.1666...', pct: '16.67%' },
    { n: 7, d: 8, dec: '0.875', pct: '87.5%' }, { n: 3, d: 5, dec: '0.6', pct: '60%' }, { n: 4, d: 5, dec: '0.8', pct: '80%' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaCard
        formula="fraction = n/d    decimal = n ÷ d    percentage = (n/d) × 100"
        desc="Three ways to express the same rational number"
        color={C}
      />

      <CalcShell
        left={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[
                  { v: 'decToFrac', l: 'Decimal → Fraction' },
                  { v: 'fracToDec', l: 'Fraction → Decimal' }
                ].map(m => (
                  <button
                    key={m.v}
                    onClick={() => setMode(m.v)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 9,
                      border: `1.5px solid ${mode === m.v ? C : 'var(--border-2)'}`,
                      background: mode === m.v ? C + '12' : 'var(--bg-raised)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: mode === m.v ? 700 : 500,
                      color: mode === m.v ? C : 'var(--text)'
                    }}
                  >
                    {m.l}
                  </button>
                ))}
              </div>

              {mode === 'decToFrac' ? (
                <MathInput label="Decimal" value={dec} onChange={setDec} hint="e.g. 0.375" color={C} />
              ) : (
                <>
                  <MathInput label="Numerator" value={fracN} onChange={setFracN} hint="top number" color={C} />
                  <MathInput label="Denominator" value={fracD} onChange={v => setFracD(v === 0 ? 1 : v)} hint="bottom number (≠ 0)" color={C} />
                </>
              )}

              <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {COMMON.slice(0, 4).map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (mode === 'decToFrac') setDec(r.n / r.d)
                      else { setFracN(r.n); setFracD(r.d) }
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-2)',
                      background: 'var(--bg-raised)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 12,
                      color: 'var(--text)',
                      fontFamily: "'DM Sans',sans-serif",
                      lineHeight: 1.45
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C + '60'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{r.n}/{r.d}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{r.dec} • {r.pct}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        right={
          <>
            <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Result</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'Fraction', val: mode === 'decToFrac' ? `${simpN}/${simpD}` : `${fracN}/${fracD}`, color: C },
                  { label: 'Decimal', val: mode === 'decToFrac' ? String(dec) : decResult, color: '#10b981' },
                  { label: 'Percentage', val: pct, color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '10px', background: 'var(--bg-raised)', borderRadius: 9, border: `1px solid ${s.color}25`, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                💡 {mode === 'decToFrac'
                  ? `${fmt(dec)} can be written as ${simpN}/${simpD}, and that is the same value in fraction form.`
                  : isTerminating
                    ? `${fracN}/${fracD} is a terminating decimal — the division ends exactly.`
                    : `${fracN}/${fracD} is a recurring decimal — the digits repeat infinitely.`}
              </div>
            </div>

            <BreakdownTable
              title="Quick summary"
              rows={[
                { label: 'Fraction', value: mode === 'decToFrac' ? `${simpN}/${simpD}` : `${fracN}/${fracD}`, bold: true, highlight: true, color: C },
                { label: 'Decimal', value: mode === 'decToFrac' ? String(dec) : decResult, color: '#10b981' },
                { label: 'Percentage', value: pct, color: '#f59e0b' },
                { label: 'Simplified form', value: `${simpN}/${simpD}` },
                { label: 'Decimal type', value: mode === 'fracToDec' ? (isTerminating ? 'Terminating' : 'Recurring') : '—' }
              ]}
            />

            <AIHintCard hint={mode === 'decToFrac' ? `${dec} = ${simpN}/${simpD} = ${pct}` : `${fracN}/${fracD} = ${decResult} = ${pct}`} />
          </>
        }
      />

      <MeaningCard
        mode={mode}
        dec={dec}
        simpN={simpN}
        simpD={simpD}
        fracN={fracN}
        fracD={fracD}
        decResult={decResult}
        pct={pct}
        color={C}
        isTerminating={isTerminating}
      />

      <FractionStrip
        mode={mode}
        dec={dec}
        fracN={fracN}
        fracD={fracD}
        simpN={simpN}
        simpD={simpD}
        color={C}
      />

      <NumberLineVisual
        mode={mode}
        dec={dec}
        fracN={fracN}
        fracD={fracD}
        color={C}
      />

      <StepsCard steps={steps} color={C} />

      <Sec title="Common conversions" sub="Click to understand patterns">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                {['Fraction', 'Decimal', '%', 'Type'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '0.5px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMON.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    if (mode === 'decToFrac') setDec(r.n / r.d)
                    else { setFracN(r.n); setFracD(r.d) }
                  }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = C + '08'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.n}/{r.d}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--text-2)' }}>{r.dec}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--text-2)' }}>{r.pct}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11.5, color: 'var(--text-3)' }}>
                    {r.dec.includes('...') ? 'Recurring' : 'Terminating'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Terminating vs recurring decimals">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              title: 'Terminating decimals',
              desc: 'End after a finite number of digits. A fraction n/d in simplest form terminates if d has no prime factors other than 2 and 5.',
              examples: ['1/2 = 0.5', '1/4 = 0.25', '3/8 = 0.375', '1/5 = 0.2', '1/16 = 0.0625'],
              color: C
            },
            {
              title: 'Recurring (repeating) decimals',
              desc: 'Never terminate — the digits repeat in a cycle. Fractions whose denominators contain primes other than 2 and 5 will recur.',
              examples: ['1/3 = 0.333...', '1/6 = 0.1666...', '1/7 = 0.142857...', '1/9 = 0.111...', '1/12 = 0.08333...'],
              color: '#10b981'
            }
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: s.color + '08', border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.title}</div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 8px' }}>{s.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {s.examples.map((e, j) => (
                  <div key={j} style={{ padding: '3px 10px', borderRadius: 20, background: s.color + '15', fontSize: 11, fontWeight: 600, color: s.color }}>{e}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="⚠️ Common mistakes">
        <MistakesList items={[
          'Thinking 0.333... is not exactly equal to 1/3 — it is',
          'Rounding recurring decimals too early and treating them as exact',
          'Forgetting that every terminating decimal can be written as a fraction'
        ]} />
      </Sec>

      <Sec title="Frequently asked questions">
        {[
          {
            q: 'Is 0.999... exactly equal to 1?',
            a: 'Yes. Mathematically they are identical. Let x = 0.999..., then 10x = 9.999..., subtracting gives 9x = 9, so x = 1.'
          },
          {
            q: 'Why do some decimals repeat forever?',
            a: 'A fraction repeats when its denominator, in simplest form, contains prime factors other than 2 or 5. Base 10 only works exactly with denominators built from 2s and 5s.'
          }
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>
    </div>
  )
}