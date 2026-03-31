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

function exactIntegral(f, a, b) {
  const n = 2000; const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (h / 3) * s
}

function simpsonsRule(f, a, b, n) {
  // n must be even
  const N = n % 2 === 0 ? n : n + 1
  const h = (b - a) / N
  let s = f(a) + f(b)
  for (let i = 1; i < N; i++) s += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (h / 3) * s
}

function trapezoidalRule(f, a, b, n) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += 2 * f(a + i * h)
  return (h / 2) * s
}

const FUNCTIONS = [
  { id: 'x3', label: 'x³', icon: 'x³', f: x => x * x * x, fStr: 'x³' },
  { id: 'sin', label: 'sin(x)', icon: 'sin', f: x => Math.sin(x), fStr: 'sin(x)' },
  { id: 'exp', label: 'eˣ', icon: 'eˣ', f: x => Math.exp(x), fStr: 'eˣ' },
  { id: 'x2', label: 'x²', icon: 'x²', f: x => x * x, fStr: 'x²' },
  { id: 'sqrt', label: '√x', icon: '√x', f: x => Math.sqrt(Math.max(0, x)), fStr: '√x' },
]

const FAQ = [
  { q: "What is Simpson's Rule?", a: "Simpson's Rule approximates each pair of subintervals with a parabola (quadratic) instead of a straight line (trapezoidal) or flat rectangle (Riemann). It uses the formula: S = h/3·[f₀+4f₁+2f₂+4f₃+...+4fₙ₋₁+fₙ]. The weights alternate 1, 4, 2, 4, 2, ..., 4, 1, hence requiring an even number of subintervals." },
  { q: "Why is Simpson's Rule so accurate?", a: "Simpson's Rule is exact for polynomials up to degree 3 (cubics), even though it's derived by fitting parabolas (degree 2). This 'superconvergence' happens because the errors from odd and even terms cancel. The error is O(h⁴) — halving h reduces error by 16×, compared to 4× for the trapezoidal rule." },
  { q: "Why does n have to be even?", a: "Simpson's Rule applies a parabola over each pair of subintervals — taking 3 points at a time: (x₀,x₁,x₂), (x₂,x₃,x₄), etc. This requires an even number of subintervals so every pair can be completed. If n is odd, use n+1 subintervals or apply Simpson's 3/8 rule to the last three." },
  { q: "What is Simpson's 3/8 Rule?", a: "An alternative that fits cubics (4 points at a time) instead of parabolas. Formula: 3h/8·[f₀+3f₁+3f₂+2f₃+3f₄+...+f_n]. Still O(h⁴) accuracy. The 1/3 rule (standard) is more commonly used; the 3/8 rule is useful when n is divisible by 3." },
  { q: "When should I use Simpson's vs Trapezoidal?", a: "For smooth functions, Simpson's Rule is almost always better — it achieves the same accuracy as trapezoidal with far fewer subintervals. The trapezoidal rule is preferred when: function is not smooth (discontinuities), data is given at fixed points, or a guaranteed conservative error bound is needed. In practice, adaptive quadrature (like Gaussian quadrature) is used for best efficiency." },
]

export default function SimpsonsRuleCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('x3')
  const [lo, setLo] = useState(0)
  const [hi, setHi] = useState(3)
  const [n, setN] = useState(8)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]
  const N = Math.max(2, Math.min(50, Math.round(n) % 2 === 0 ? Math.round(n) : Math.round(n) + 1))
  const h = (hi - lo) / N
  const simpResult = simpsonsRule(fn.f, lo, hi, N)
  const trapResult = trapezoidalRule(fn.f, lo, hi, N)
  const exact = exactIntegral(fn.f, lo, hi)
  const simpError = Math.abs(exact - simpResult)
  const trapError = Math.abs(exact - trapResult)
  const improvement = trapError > 0 ? trapError / Math.max(simpError, 1e-15) : '∞'

  // Subintervals
  const xPts = Array.from({ length: N + 1 }, (_, i) => lo + i * h)
  const yPts = xPts.map(x => fn.f(x))

  // SVG
  const W = 260, H = 150
  const allY = yPts.filter(isFinite)
  const yMin = Math.min(...allY, 0), yMax = Math.max(...allY, 0.1)
  const toSx = x => ((x - lo) / Math.max(hi - lo, 0.001)) * (W - 20) + 10
  const toSy = y => H - 10 - ((y - yMin) / Math.max(yMax - yMin, 0.001)) * (H - 25)
  const zeroY = Math.max(5, Math.min(H - 5, toSy(0)))

  const curvePts = []
  for (let i = 0; i <= 80; i++) {
    const xi = lo + (i / 80) * (hi - lo)
    const yi = fn.f(xi)
    if (isFinite(yi)) curvePts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }

  // Draw parabolas for pairs
  const parabolaGroups = []
  for (let i = 0; i < N; i += 2) {
    const x0 = xPts[i], x1 = xPts[i + 1], x2 = xPts[i + 2]
    const y0 = yPts[i], y1 = yPts[i + 1], y2 = yPts[i + 2]
    const pts = []
    for (let j = 0; j <= 20; j++) {
      const t = j / 20
      const xi = x0 + t * (x2 - x0)
      // Lagrange interpolation through 3 points
      const L0 = ((xi - x1) * (xi - x2)) / ((x0 - x1) * (x0 - x2))
      const L1 = ((xi - x0) * (xi - x2)) / ((x1 - x0) * (x1 - x2))
      const L2 = ((xi - x0) * (xi - x1)) / ((x2 - x0) * (x2 - x1))
      const yi = y0 * L0 + y1 * L1 + y2 * L2
      pts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
    }
    parabolaGroups.push({ pts, xL: x0, xR: x2 })
  }

  // Convergence
  const convData = [2, 4, 8, 16, 32].map(k => {
    const kn = k % 2 === 0 ? k : k + 1
    return { n: kn, simp: simpsonsRule(fn.f, lo, hi, kn), trap: trapezoidalRule(fn.f, lo, hi, kn) }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Simpson's Rule — O(h⁴) accuracy</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>S = h/3·[f₀ + 4f₁ + 2f₂ + 4f₃ + ... + 4fₙ₋₁ + fₙ]</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Weights: 1, 4, 2, 4, 2, ..., 4, 1 · n must be even</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>∫{lo}^{hi} {fn.fStr} dx ≈</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(simpResult)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>error: {fmt(simpError)}</div>
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
          <Inp label="Subintervals (n, must be even)" value={n} onChange={v => setN(Math.max(2, Math.round(v)))} color={C} hint="auto-rounds to even" />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Quick n (even numbers)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[2, 4, 8, 16, 32, 50].map(k => (
                <button key={k} onClick={() => setN(k)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1.5px solid', borderColor: N === k ? C : 'var(--border)', background: N === k ? C : 'var(--bg-raised)', color: N === k ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>{k}</button>
              ))}
            </div>
          </div>

          {/* Weight pattern */}
          <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Simpson weight pattern (n={N})</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>
              1, {Array.from({ length: N - 1 }, (_, i) => i % 2 === 0 ? 4 : 2).join(', ')}, 1
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>h = {fmt(h)} · h/3 = {fmt(h / 3)}</div>
          </div>

          {/* Error formula */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Error bound</div>
            <div style={{ fontSize: 12, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>|E| ≤ (b−a)⁵ · max|f⁴| / (180n⁴)</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Double n → error drops by 16×</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Integrate →</button>
            <button onClick={() => { setLo(0); setHi(3); setN(8) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>∫{lo}^{hi} {fn.fStr} dx ≈</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(simpResult)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
              Exact ≈ {fmt(exact)} · Error: {fmt(simpError)}
              {typeof improvement === 'number' && improvement > 1 && ` · ${fmt(improvement)}× better than trapezoidal`}
            </div>
          </div>

          {/* Parabola visualization */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Parabolic segments under f(x) = {fn.fStr}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={zeroY} x2={W - 10} y2={zeroY} stroke="var(--border)" strokeWidth="1" />
              {/* Parabola fills */}
              {parabolaGroups.slice(0, 10).map((pg, i) => (
                <polygon key={i}
                  points={`${toSx(pg.xL)},${zeroY} ${pg.pts.join(' ')} ${toSx(pg.xR)},${zeroY}`}
                  fill={i % 2 === 0 ? C + '30' : C + '18'} stroke="none" />
              ))}
              {/* Parabola curves */}
              {parabolaGroups.slice(0, 10).map((pg, i) => (
                <polyline key={`c${i}`} points={pg.pts.join(' ')} fill="none" stroke={C + '80'} strokeWidth="1.5" />
              ))}
              {curvePts.length > 1 && <polyline points={curvePts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              {/* Node points */}
              {xPts.slice(0, 20).map((x, i) => (
                <circle key={i} cx={toSx(x)} cy={Math.max(5, Math.min(H - 5, toSy(fn.f(x))))} r={3}
                  fill={i % 2 === 0 ? C : '#ef4444'} />
              ))}
              <text x={14} y={14} fontSize="9" fill={C} fontWeight="700">f(x)</text>
              <text x={14} y={26} fontSize="8" fill="#ef4444">● midpoints (×4)</text>
            </svg>
          </div>

          <BreakdownTable title="Results" rows={[
            { label: 'f(x)', value: fn.fStr, highlight: true },
            { label: "Simpson's result", value: fmt(simpResult), bold: true, color: C, highlight: true },
            { label: 'Exact value', value: fmt(exact), color: '#10b981' },
            { label: "Simpson's error", value: fmt(simpError), color: simpError < 0.0001 ? '#10b981' : '#f59e0b' },
            { label: 'Trapezoidal error', value: fmt(trapError), color: 'var(--text-3)' },
            { label: 'Simpson improvement', value: `${typeof improvement === 'number' ? fmt(improvement) : '∞'}×`, color: C, note: 'vs trapezoidal' },
            { label: 'Subintervals n', value: String(N) },
          ]} />
          <AIHintCard hint={`Simpson's Rule for ∫${lo}^${hi} ${fn.fStr} dx ≈ ${fmt(simpResult)}. Error = ${fmt(simpError)}, vs trapezoidal error = ${fmt(trapError)}. Simpson is ${typeof improvement === 'number' ? fmt(improvement) + '×' : '∞×'} more accurate with the same n.`} color={C} />
        </>}
      />

      {/* Comparison table */}
      <Sec title="Simpson's vs Trapezoidal — accuracy comparison" sub={`n=${N} subintervals, same computation`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['n', "Simpson's", 'Trapezoidal', 'Exact', 'Simp error', 'Trap error', 'Ratio'].map(h => (
                <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {convData.map(({ n: k, simp: s, trap: t }, i) => {
                const se = Math.abs(exact - s), te = Math.abs(exact - t)
                return (
                  <tr key={i} style={{ background: k === N ? C + '08' : i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: k === N ? 700 : 400, color: k === N ? C : 'var(--text)', textAlign: 'right' }}>{k}{k === N ? '✓' : ''}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(s)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(t)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, color: '#10b981', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(exact)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, color: se < 0.001 ? '#10b981' : 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(se)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(te)}</td>
                    <td style={{ padding: '7px 10px', fontSize: 11, color: C, textAlign: 'right' }}>{te > 0 ? `${fmt(te / Math.max(se, 1e-15))}×` : '∞×'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 0' }}>
          "Ratio" = trapezoidal error ÷ Simpson's error — shows how many times more accurate Simpson's is.
          As n doubles, Simpson's error drops by ~16× while trapezoidal drops by only ~4×.
        </p>
      </Sec>

      {/* Why parabolas are so good */}
      <Sec title="Why parabolas give O(h⁴) accuracy" sub="The math behind Simpson's superconvergence">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 14 }}>
          The Trapezoidal Rule fits a straight line through 2 points (exact for degree ≤1). Simpson's fits a parabola through 3 points (exact for degree ≤2). But due to a remarkable cancellation of odd error terms, it turns out Simpson's Rule is also exact for degree 3 polynomials — giving O(h⁴) accuracy from a degree-2 approximation.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { method: 'Trapezoidal', shape: 'Straight line', exact: 'Degree ≤ 1', error: 'O(h²)', color: '#10b981' },
            { method: "Simpson's 1/3", shape: 'Parabola (quad)', exact: 'Degree ≤ 3 ✨', error: 'O(h⁴)', color: C },
            { method: "Simpson's 3/8", shape: 'Cubic', exact: 'Degree ≤ 3', error: 'O(h⁴)', color: '#8b5cf6' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: 10, background: m.color + '08', border: `1px solid ${m.color}25`, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.method}</div>
              <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 3 }}>{m.shape}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>Exact for: {m.exact}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: m.color }}>Error: {m.error}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Real world */}
      <Sec title="Where Simpson's Rule is used in practice">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🚀', title: 'Orbital mechanics', desc: "NASA's numerical integration of satellite orbits uses high-order quadrature rules similar to Simpson's for high accuracy with few function evaluations.", color: C },
            { icon: '🌊', title: 'Naval architecture', desc: "Bonjean curves and Simpson's Rule are used in ship design to compute waterplane areas and hydrostatic properties from station measurements.", color: '#10b981' },
            { icon: '💊', title: 'PK/PD modelling', desc: "Like the trapezoidal rule, Simpson's Rule is used for AUC computation in pharmacokinetics — but it's preferred when data density allows.", color: '#f59e0b' },
            { icon: '🏗️', title: 'Structural loads', desc: 'Beam bending moments and distributed load integrals use numerical methods. Simpson\'s Rule is standard in civil engineering textbooks for these calculations.', color: '#8b5cf6' },
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
          { term: "Simpson's 1/3 Rule", def: 'Standard Simpson: h/3·[f₀+4f₁+2f₂+...+4fₙ₋₁+fₙ]. Weights: 1,4,2,4,...,4,1. n must be even.' },
          { term: 'Quadratic interpolation', def: 'Fitting a parabola through 3 points. Simpson\'s Rule integrates this parabola analytically over each pair of subintervals.' },
          { term: 'O(h⁴) convergence', def: 'Halving h (doubling n) reduces error by 16×. This is 4 times better than the O(h²) trapezoidal rule.' },
          { term: 'Richardson extrapolation', def: 'Combining two trapezoidal approximations T(h) and T(h/2) to get (4T(h/2)−T(h))/3 — which equals Simpson\'s Rule.' },
          { term: 'Gaussian quadrature', def: 'An even higher-order method that chooses optimal node positions, not just equally-spaced. Used when maximum accuracy per function evaluation is needed.' },
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
