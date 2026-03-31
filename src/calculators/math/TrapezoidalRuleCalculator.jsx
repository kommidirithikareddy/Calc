import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(8)).toString()

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

function Inp({ label, value, onChange, color, hint }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          onFocus={() => sf(true)} onBlur={() => sf(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
      </div>
    </div>
  )
}

// Numerical exact using Simpson's 1000 steps
function exactIntegral(f, a, b) {
  const n = 1000; const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (h / 3) * s
}

function trapezoidalRule(f, a, b, n) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += 2 * f(a + i * h)
  return (h / 2) * s
}

const FUNCTIONS = [
  { id: 'x2', label: 'x²', icon: 'x²', f: x => x * x, fStr: 'x²' },
  { id: 'sin', label: 'sin(x)', icon: 'sin', f: x => Math.sin(x), fStr: 'sin(x)' },
  { id: 'exp', label: 'eˣ', icon: 'eˣ', f: x => Math.exp(x), fStr: 'eˣ' },
  { id: 'inv', label: '1/x', icon: '1/x', f: x => 1 / x, fStr: '1/x' },
  { id: 'sqrt', label: '√x', icon: '√x', f: x => Math.sqrt(Math.max(0, x)), fStr: '√x' },
]

const FAQ = [
  { q: 'What is the Trapezoidal Rule?', a: 'The Trapezoidal Rule approximates ∫ₐᵇf(x)dx by connecting adjacent points on the curve with straight lines (trapezoids) instead of rectangles. Each trapezoid has area h·(f(xᵢ)+f(xᵢ₊₁))/2. Summing all trapezoids gives the composite formula: h/2·[f(x₀)+2f(x₁)+...+2f(xₙ₋₁)+f(xₙ)].' },
  { q: 'How does it compare to the Riemann (rectangle) methods?', a: 'The Trapezoidal Rule is more accurate than left or right Riemann sums because it accounts for both endpoints of each subinterval. It is equivalent to averaging the left and right Riemann sums. The error is O(h²) — halving the number of subintervals reduces error by 4×. Midpoint rule has the same O(h²) rate but smaller error constant.' },
  { q: 'What is the error in the Trapezoidal Rule?', a: 'The error is bounded by: |E| ≤ (b−a)³/(12n²) × max|f″(x)|. This tells you: wider interval → more error, more subintervals → less error, more curved function (larger f″) → more error. Double n → error drops by 4×. This O(h²) convergence means it needs about 3× fewer intervals than left/right Riemann sums for the same accuracy.' },
  { q: "What is Richardson extrapolation?", a: "Richardson extrapolation combines two trapezoidal approximations T(h) and T(h/2) to eliminate the leading error term: T_better = (4T(h/2) − T(h))/3. This gives a higher-order method — and it's exactly Simpson's Rule! So Simpson's Rule can be derived from the Trapezoidal Rule via Richardson extrapolation." },
  { q: 'When is the Trapezoidal Rule exact?', a: 'The Trapezoidal Rule is exact (zero error) for linear functions (straight lines), because a straight line is its own trapezoid. For quadratic functions, there is always some error. Compare: Simpson\'s Rule is exact for cubics, which is why it is preferred over the Trapezoidal Rule when the function is smooth.' },
]

export default function TrapezoidalRuleCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('x2')
  const [lo, setLo] = useState(0)
  const [hi, setHi] = useState(3)
  const [n, setN] = useState(8)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]
  const N = Math.max(1, Math.min(50, Math.round(n)))
  const h = (hi - lo) / N
  const trapResult = trapezoidalRule(fn.f, lo, hi, N)
  const exact = exactIntegral(fn.f, lo, hi)
  const error = Math.abs(exact - trapResult)
  const relError = Math.abs(exact) > 1e-10 ? error / Math.abs(exact) * 100 : 0

  // Trapezoid data
  const xPts = Array.from({ length: N + 1 }, (_, i) => lo + i * h)
  const yPts = xPts.map(x => fn.f(x))

  // Subinterval values for table
  const subIntervals = xPts.slice(0, -1).map((x, i) => ({
    i, xL: x, xR: xPts[i + 1], yL: yPts[i], yR: yPts[i + 1],
    area: h * (yPts[i] + yPts[i + 1]) / 2
  }))

  // SVG
  const W = 260, H = 150
  const allY = yPts.filter(isFinite)
  const yMin = Math.min(...allY, 0), yMax = Math.max(...allY, 0.1)
  const toSx = x => ((x - lo) / Math.max(hi - lo, 0.001)) * (W - 20) + 10
  const toSy = y => H - 10 - ((y - yMin) / Math.max(yMax - yMin, 0.001)) * (H - 25)
  const zeroY = Math.max(5, Math.min(H - 5, toSy(0)))

  // Curve points
  const curvePts = []
  for (let i = 0; i <= 80; i++) {
    const xi = lo + (i / 80) * (hi - lo)
    const yi = fn.f(xi)
    if (isFinite(yi)) curvePts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }

  // Convergence table data
  const convData = [2, 4, 8, 16, 32, 50].map(k => ({
    n: k, trap: trapezoidalRule(fn.f, lo, hi, k),
    err: Math.abs(exact - trapezoidalRule(fn.f, lo, hi, k))
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Trapezoidal Rule</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>T = h/2 · [f(x₀) + 2f(x₁) + ... + 2f(xₙ₋₁) + f(xₙ)]</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>h = (b−a)/n · Area approximated by trapezoids</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>∫{lo}^{hi} {fn.fStr} dx ≈</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(trapResult)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>n={N} · exact≈{fmt(exact)}</div>
        </div>
      </div>

      {/* Function selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Select function to integrate</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {FUNCTIONS.map(f => (
            <button key={f.id} onClick={() => setFnId(f.id)}
              style={{ padding: '10px 4px', borderRadius: 10, border: `1.5px solid ${fnId === f.id ? C : 'var(--border-2)'}`, background: fnId === f.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontFamily: "'Space Grotesk',sans-serif", color: fnId === f.id ? C : 'var(--text)', fontWeight: 700 }}>{f.icon}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
            Integration parameters
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp label="Lower limit (a)" value={lo} onChange={setLo} color={C} />
            <Inp label="Upper limit (b)" value={hi} onChange={setHi} color={C} />
          </div>
          <Inp label="Number of subintervals (n)" value={n} onChange={v => setN(Math.max(1, Math.min(50, Math.round(v))))} color={C} hint="1–50" />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Quick n</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[2, 4, 8, 16, 32, 50].map(k => (
                <button key={k} onClick={() => setN(k)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1.5px solid', borderColor: N === k ? C : 'var(--border)', background: N === k ? C : 'var(--bg-raised)', color: N === k ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>{k}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Step size</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>h = ({hi}−{lo})/{N} = {fmt(h)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>Weights: 1, 2, 2, ..., 2, 1 (× h/2)</div>
          </div>

          {/* Error formula */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Error bound formula</div>
            <div style={{ fontSize: 12, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>|E| ≤ (b−a)³ · max|f″| / (12n²)</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Double n → error reduces by 4×</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Integrate →</button>
            <button onClick={() => { setLo(0); setHi(3); setN(8) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>∫{lo}^{hi} {fn.fStr} dx ≈</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(trapResult)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Exact ≈ {fmt(exact)} · Error: {fmt(error)} ({fmt(relError)}%)</div>
          </div>

          {/* Trapezoid visualization */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Trapezoids under f(x) = {fn.fStr}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={zeroY} x2={W - 10} y2={zeroY} stroke="var(--border)" strokeWidth="1" />
              {/* Draw trapezoids */}
              {subIntervals.slice(0, 20).map((sub, i) => {
                const x1 = toSx(sub.xL), x2 = toSx(sub.xR)
                const y1 = Math.max(5, Math.min(H - 5, toSy(sub.yL)))
                const y2 = Math.max(5, Math.min(H - 5, toSy(sub.yR)))
                return (
                  <polygon key={i}
                    points={`${x1},${zeroY} ${x1},${y1} ${x2},${y2} ${x2},${zeroY}`}
                    fill={C + '25'} stroke={C} strokeWidth="0.5" />
                )
              })}
              {curvePts.length > 1 && <polyline points={curvePts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              <text x={14} y={14} fontSize="9" fill={C} fontWeight="700">f(x) = {fn.fStr}</text>
              <text x={14} y={26} fontSize="9" fill={C + 'aa'} fontWeight="700">trapezoids (n={N})</text>
            </svg>
          </div>

          <BreakdownTable title="Results" rows={[
            { label: 'f(x)', value: fn.fStr, highlight: true },
            { label: 'Trapezoidal result', value: fmt(trapResult), bold: true, color: C, highlight: true },
            { label: 'Exact value', value: fmt(exact), color: '#10b981' },
            { label: 'Absolute error', value: fmt(error), color: error < 0.001 ? '#10b981' : '#f59e0b' },
            { label: 'Relative error', value: `${fmt(relError)}%` },
            { label: 'Step size h', value: fmt(h) },
            { label: 'Subintervals n', value: String(N) },
          ]} />
          <AIHintCard hint={`Trapezoidal rule for ∫${lo}^${hi} ${fn.fStr} dx with n=${N}: ≈ ${fmt(trapResult)}. Exact ≈ ${fmt(exact)}, error = ${fmt(error)}. ${error < 0.01 ? 'Excellent accuracy!' : `Try n=${N * 2} to reduce error by ~4×.`}`} color={C} />
        </>}
      />

      {/* Subinterval table */}
      {N <= 12 && (
        <Sec title="Subinterval breakdown" sub={`n=${N} trapezoids`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['i', 'xᵢ', 'xᵢ₊₁', 'f(xᵢ)', 'f(xᵢ₊₁)', 'Weight', 'Area'].map(h => (
                  <th key={h} style={{ padding: '7px 9px', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {subIntervals.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '5px 9px', fontSize: 11, fontWeight: 700, color: C, textAlign: 'right' }}>{i}</td>
                    <td style={{ padding: '5px 9px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s.xL)}</td>
                    <td style={{ padding: '5px 9px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s.xR)}</td>
                    <td style={{ padding: '5px 9px', fontSize: 11, color: 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s.yL)}</td>
                    <td style={{ padding: '5px 9px', fontSize: 11, color: 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s.yR)}</td>
                    <td style={{ padding: '5px 9px', fontSize: 10, color: 'var(--text-3)', textAlign: 'right' }}>{i === 0 || i === N - 1 ? '×1' : '×2'}</td>
                    <td style={{ padding: '5px 9px', fontSize: 11, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s.area)}</td>
                  </tr>
                ))}
                <tr style={{ background: C + '10' }}>
                  <td colSpan={6} style={{ padding: '6px 9px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>Total</td>
                  <td style={{ padding: '6px 9px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(trapResult)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Sec>
      )}

      {/* Convergence table */}
      <Sec title="Convergence — how accuracy improves with n" sub="Error decreases as O(h²)">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['n', 'h', 'Trapezoidal result', 'Error', 'Error ratio'].map(h => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {convData.map(({ n: k, trap: t, err: e }, i) => (
                <tr key={i} style={{ background: k === N ? C + '08' : i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: k === N ? 700 : 400, color: k === N ? C : 'var(--text)', textAlign: 'right' }}>{k} {k === N ? '✓' : ''}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt((hi - lo) / k)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(t)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: e < 0.001 ? '#10b981' : 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(e)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{i > 0 && convData[i - 1].err > 0 ? `≈ ${fmt(e / convData[i - 1].err)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 0' }}>Error ratio should be ~0.25 when doubling n — confirming O(h²) convergence.</p>
      </Sec>

      {/* Comparison */}
      <Sec title="Trapezoidal vs other quadrature rules">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { method: 'Left/Right Riemann', formula: 'h·Σf(xᵢ)', order: 'O(h)', note: 'Rectangles — inaccurate', color: '#ef4444' },
            { method: 'Trapezoidal Rule', formula: 'h/2·[f₀+2f₁+...+2fₙ₋₁+fₙ]', order: 'O(h²)', note: 'Trapezoids — better', color: C },
            { method: "Midpoint Rule", formula: 'h·Σf(xᵢ₊½)', order: 'O(h²)', note: 'Midpoints — same order, smaller constant', color: '#10b981' },
            { method: "Simpson's Rule", formula: 'h/3·[f₀+4f₁+2f₂+...+4fₙ₋₁+fₙ]', order: 'O(h⁴)', note: 'Parabolas — much more accurate', color: '#8b5cf6' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: 10, background: m.color + '08', border: `1px solid ${m.color}25` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.method}</div>
              <div style={{ fontSize: 10, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{m.formula}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Error: {m.order}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Real world */}
      <Sec title="Where the Trapezoidal Rule is used">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '📊', title: 'Data with no formula', desc: 'When you only have data points (e.g. sensor readings), there is no formula to integrate analytically. The trapezoidal rule connects data points directly.', color: C },
            { icon: '💊', title: 'Pharmacokinetics (AUC)', desc: 'Area Under the Curve of drug concentration vs time = total drug exposure. The trapezoidal rule is the standard method in clinical pharmacology.', color: '#10b981' },
            { icon: '⚡', title: 'Signal processing', desc: 'Integrating voltage over time to get charge, or power over time to get energy. The trapezoidal rule handles sampled (discrete) signals.', color: '#f59e0b' },
            { icon: '🌍', title: 'Geographic area', desc: 'Computing land area from irregular boundary coordinates using the Shoelace formula — a generalization of the trapezoidal rule.', color: '#8b5cf6' },
          ].map((rw, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 18 }}>{rw.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.title}</span></div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{rw.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms" sub="Tap to expand">
        {[
          { term: 'Quadrature', def: 'Numerical integration — approximating a definite integral by a weighted sum of function values at chosen points.' },
          { term: 'Step size h', def: 'h = (b−a)/n. The width of each subinterval. Smaller h = more trapezoids = more accuracy.' },
          { term: 'Composite rule', def: 'Applying a basic rule (one trapezoid) repeatedly over many subintervals. The composite trapezoidal rule uses n trapezoids.' },
          { term: 'Order of convergence', def: 'O(h²) means halving h reduces error by 4×. O(h⁴) means halving h reduces error by 16×.' },
          { term: 'Weights', def: 'The multipliers in the formula (1, 2, 2, ..., 2, 1 for trapezoidal). They determine how much each function value contributes.' },
        ].map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setGl(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C, flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span></div>
              <span style={{ fontSize: 16, color: C, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px' }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
