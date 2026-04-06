import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function evalFn(expr, x) {
  try {
    const clean = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![a-zA-Z])/g, 'Math.E')
    // eslint-disable-next-line no-new-func
    return Function('x', `"use strict"; return (${clean})`)(x)
  } catch { return NaN }
}

function numericalLimit(expr, a, side) {
  const deltas = [1e-4, 1e-6, 1e-8, 1e-10]
  const vals = deltas.map(d => {
    const x = side === 'left' ? a - d : side === 'right' ? a + d : a + d
    return evalFn(expr, x)
  }).filter(v => isFinite(v))
  if (vals.length < 2) return null
  // Check convergence
  const last = vals[vals.length - 1]
  const prev = vals[vals.length - 2]
  if (Math.abs(last - prev) < 1e-4 * (1 + Math.abs(last))) return last
  return null
}

const EXAMPLES = [
  { label: 'sin(x)/x at 0', expr: 'sin(x)/x', a: '0' },
  { label: '(x²-1)/(x-1) at 1', expr: '(x^2-1)/(x-1)', a: '1' },
  { label: '(1+1/x)^x at ∞', expr: '(1+1/x)^x', a: 'Infinity' },
  { label: '|x|/x at 0', expr: 'abs(x)/x', a: '0' },
  { label: 'sin(1/x) at 0', expr: 'sin(1/x)', a: '0' },
  { label: 'x·ln(x) at 0+', expr: 'x*ln(x)', a: '0', side: 'right' },
]

const FAQ = [
  { q: 'What is a limit?', a: 'A limit describes the value a function approaches as the input approaches some value — without necessarily reaching it. lim(x→a) f(x) = L means that f(x) can be made arbitrarily close to L by making x close enough to a. The function need not be defined at a itself (e.g., sin(x)/x at x=0).' },
  { q: 'What is the difference between left and right limits?', a: 'The left-hand limit lim(x→a⁻) approaches from values smaller than a. The right-hand limit lim(x→a⁺) approaches from values larger than a. For the two-sided limit to exist, both must equal the same value. If they differ, the limit does not exist — like |x|/x at x=0 (left=-1, right=+1).' },
  { q: 'What does L\'Hôpital\'s Rule do?', a: 'L\'Hôpital\'s Rule handles 0/0 and ∞/∞ indeterminate forms. If lim f(x)/g(x) gives 0/0 or ∞/∞, then lim f(x)/g(x) = lim f\'(x)/g\'(x). Example: lim sin(x)/x at x=0 → lim cos(x)/1 = 1. Apply repeatedly if still indeterminate.' },
  { q: 'How is this limit calculator computing the result?', a: 'This calculator uses numerical evaluation: it evaluates f(x) at points increasingly close to a (10⁻⁴, 10⁻⁶, 10⁻⁸, 10⁻¹⁰ away from a) and checks if the values converge. This works for most elementary functions but cannot prove limits symbolically or handle oscillating functions like sin(1/x) at 0.' },
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

export default function LimitCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [expr, setExpr] = useState('sin(x)/x')
  const [aStr, setAStr] = useState('0')
  const [side, setSide] = useState('both')
  const [openFaq, setOpenFaq] = useState(null)

  const a = aStr === 'Infinity' ? Infinity : aStr === '-Infinity' ? -Infinity : parseFloat(aStr)
  const isInfinity = !isFinite(a)

  const leftLim = !isInfinity ? numericalLimit(expr, a, 'left') : numericalLimit(expr, 1e12, 'right')
  const rightLim = !isInfinity ? numericalLimit(expr, a, 'right') : numericalLimit(expr, 1e12, 'right')
  const twoSided = side === 'both'
    ? (leftLim !== null && rightLim !== null && Math.abs(leftLim - rightLim) < 1e-4 ? leftLim : null)
    : side === 'left' ? leftLim : rightLim

  const limitExists = twoSided !== null
  const directVal = !isInfinity ? evalFn(expr, a) : null

  const approach = [1e-2, 1e-4, 1e-6].map(d => ({
    xLeft: isInfinity ? 1e10 : a - d,
    xRight: isInfinity ? 1e12 : a + d,
    yLeft: isFinite(isInfinity ? 1e10 : a - d) ? evalFn(expr, isInfinity ? 1e10 : a - d) : NaN,
    yRight: isFinite(isInfinity ? 1e12 : a + d) ? evalFn(expr, isInfinity ? 1e12 : a + d) : NaN,
    d,
  }))

  const fmt = v => v === null ? '—' : isFinite(v) ? parseFloat(v.toFixed(8)).toString() : v > 0 ? '+∞' : '-∞'
  const hint = limitExists
    ? `lim(x→${aStr}) ${expr} = ${fmt(twoSided)}`
    : `Limit does not exist (left=${fmt(leftLim)}, right=${fmt(rightLim)})`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Limit Calculator</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>lim<sub style={{ fontSize: 13 }}>x→{aStr}</sub> f(x)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {limitExists ? (
            <div style={{ padding: '10px 18px', background: '#d1fae5', borderRadius: 10, border: '1px solid #10b98130' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#065f46', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(twoSided)}</div>
              <div style={{ fontSize: 11, color: '#065f46' }}>limit exists</div>
            </div>
          ) : (
            <div style={{ padding: '10px 18px', background: '#fee2e2', borderRadius: 10, border: '1px solid #ef444430' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#b91c1c' }}>Does Not Exist</div>
              <div style={{ fontSize: 11, color: '#b91c1c' }}>left ≠ right</div>
            </div>
          )}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Function f(x)</label>
            <input value={expr} onChange={e => setExpr(e.target.value)} placeholder="e.g. sin(x)/x"
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Approach point (a)</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              {['0', '1', '-1', 'Infinity', '-Infinity'].map(v => (
                <button key={v} onClick={() => setAStr(v)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${aStr === v ? C : 'var(--border-2)'}`, background: aStr === v ? C + '12' : 'var(--bg-raised)', fontSize: 12, color: aStr === v ? C : 'var(--text)', fontWeight: aStr === v ? 700 : 400, cursor: 'pointer' }}>{v === 'Infinity' ? '+∞' : v === '-Infinity' ? '-∞' : v}</button>
              ))}
            </div>
            <input value={aStr} onChange={e => setAStr(e.target.value)} placeholder="e.g. 0, 1, Infinity"
              style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 8, padding: '0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Direction</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['both', 'Two-sided'], ['left', 'Left (x→a⁻)'], ['right', 'Right (x→a⁺)']].map(([v, l]) => (
                <button key={v} onClick={() => setSide(v)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${side === v ? C : 'var(--border-2)'}`, background: side === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: side === v ? 700 : 400, color: side === v ? C : 'var(--text)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Classic examples</div>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => { setExpr(ex.expr); setAStr(ex.a); if (ex.side) setSide(ex.side) }}
                style={{ display: 'block', width: '100%', padding: '7px 12px', marginBottom: 5, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: 'var(--text)' }}>
                {ex.label}
              </button>
            ))}
          </div>
        </>}

        right={<>
          <BreakdownTable title="Limit results" rows={[
            { label: 'Two-sided limit', value: fmt(twoSided), bold: true, highlight: true, color: limitExists ? '#10b981' : '#ef4444' },
            { label: 'Left limit (x→a⁻)', value: fmt(leftLim) },
            { label: 'Right limit (x→a⁺)', value: fmt(rightLim) },
            { label: 'f(a) direct value', value: directVal !== null && isFinite(directVal) ? parseFloat(directVal.toFixed(8)).toString() : 'undefined' },
            { label: 'Limit exists?', value: limitExists ? 'Yes ✓' : 'No ✗', color: limitExists ? '#10b981' : '#ef4444' },
          ]} />

          {/* Approach table */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Numerical approach (δ → 0)</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['δ', 'x = a − δ', 'f(a−δ)', 'x = a + δ', 'f(a+δ)'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: 'var(--text-3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approach.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{row.d}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)', fontSize: 10 }}>{isInfinity ? '—' : fmt(row.xLeft)}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: C, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{isFinite(row.yLeft) ? parseFloat(row.yLeft.toFixed(6)) : '∞'}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)', fontSize: 10 }}>{isInfinity ? '—' : fmt(row.xRight)}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: '#ef4444', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{isFinite(row.yRight) ? parseFloat(row.yRight.toFixed(6)) : '∞'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Limit laws */}
      <Sec title="Fundamental limit laws" sub="Building blocks for all limits">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { law: 'Sum rule', formula: 'lim[f+g] = lim f + lim g', color: C },
            { law: 'Product rule', formula: 'lim[f·g] = lim f × lim g', color: '#10b981' },
            { law: 'Quotient rule', formula: 'lim[f/g] = lim f / lim g (g≠0)', color: '#f59e0b' },
            { law: 'Power rule', formula: 'lim[fⁿ] = (lim f)ⁿ', color: '#ef4444' },
            { law: 'Squeeze theorem', formula: 'g≤f≤h, lim g=lim h=L → lim f=L', color: '#8b5cf6' },
            { law: "L'Hôpital", formula: '0/0 or ∞/∞: lim f/g = lim f\'/g\'', color: '#6366f1' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.law}</div>
              <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.formula}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'lim(x→a) f(x) = L\nmeans: ∀ε>0, ∃δ>0 such that\n|x − a| < δ → |f(x) − L| < ε\nLeft limit: x→a⁻ (x < a)\nRight limit: x→a⁺ (x > a)'}
        variables={[
          { symbol: 'lim', meaning: 'Limit — the value approached' },
          { symbol: 'a', meaning: 'The approach point (x gets close to a)' },
          { symbol: 'L', meaning: 'The limit value' },
          { symbol: 'ε, δ', meaning: 'Epsilon-delta formal definition' },
        ]}
        explanation="A limit describes what value f(x) approaches as x gets arbitrarily close to a — not what f(a) equals. The function need not be defined at a. The formal epsilon-delta definition says: for any desired precision ε, there exists a neighborhood δ around a within which f stays within ε of L."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
