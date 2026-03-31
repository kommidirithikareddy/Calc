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

const FUNCTIONS = [
  { id: 'cubic', label: 'x³−x−2', icon: 'x³−x−2', f: x => x * x * x - x - 2, df: x => 3 * x * x - 1, fStr: 'x³ − x − 2', dfStr: "3x² − 1" },
  { id: 'cos', label: 'cos(x)−x', icon: 'cos−x', f: x => Math.cos(x) - x, df: x => -Math.sin(x) - 1, fStr: 'cos(x) − x', dfStr: '−sin(x) − 1' },
  { id: 'exp', label: 'eˣ−3x', icon: 'eˣ−3x', f: x => Math.exp(x) - 3 * x, df: x => Math.exp(x) - 3, fStr: 'eˣ − 3x', dfStr: 'eˣ − 3' },
  { id: 'sqrt2', label: 'x²−2', icon: 'x²−2', f: x => x * x - 2, df: x => 2 * x, fStr: 'x² − 2', dfStr: '2x' },
  { id: 'sin', label: 'x−sin(x)−0.5', icon: 'x−sin−0.5', f: x => x - Math.sin(x) - 0.5, df: x => 1 - Math.cos(x), fStr: 'x − sin(x) − 0.5', dfStr: '1 − cos(x)' },
]

const FAQ = [
  { q: 'What is Newton-Raphson?', a: 'Newton-Raphson is a root-finding method that uses the tangent line approximation. Starting from guess x₀, draw the tangent to f at x₀ — where it hits the x-axis is the next guess x₁. Repeat. The formula is xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). It converges quadratically — doubling the number of correct decimal digits each step.' },
  { q: 'Why does it converge so fast?', a: "Newton-Raphson has quadratic convergence: the error at each step is proportional to the square of the previous error. If you have 3 correct digits, next step you'll have ~6, then ~12. This is much faster than bisection's linear convergence (one extra bit per step). The price is needing f′ and starting close to the root." },
  { q: 'When does Newton-Raphson fail?', a: "It fails when: f′(xₙ)=0 (division by zero), the initial guess is far from the root and the function is nonlinear, there are multiple roots and you converge to the wrong one, or the function is oscillatory. Starting near an inflection point where f′ is small causes wild jumps. Always verify convergence by checking |f(root)| ≈ 0." },
  { q: 'What is the geometric interpretation?', a: "Each iteration draws the tangent line to the curve at the current point (xₙ, f(xₙ)). The tangent line has slope f′(xₙ). Its x-intercept — where the tangent line crosses the x-axis — becomes the next estimate. This is why a good initial guess matters: if you're on the wrong 'side' of a curve, the tangent points away from the root." },
  { q: 'How is Newton-Raphson used in practice?', a: "It is ubiquitous: GPS receivers use it to solve position equations. CPUs use it to compute 1/x and √x in hardware. Machine learning uses the Newton step in second-order optimizers. Most scientific computing libraries use Newton-Raphson variants at their core. The sqrt() function in most programming languages uses Newton-Raphson." },
]

export default function NewtonRaphsonCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('cubic')
  const [x0, setX0] = useState(1.5)
  const [maxIter, setMaxIter] = useState(15)
  const [tol, setTol] = useState(0.000001)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]

  // Run Newton-Raphson
  const iterations = []
  let x = x0
  let converged = false
  let diverged = false

  for (let i = 1; i <= Math.min(maxIter, 25); i++) {
    const fx = fn.f(x)
    const dfx = fn.df(x)
    if (Math.abs(dfx) < 1e-12) { diverged = true; break }
    const xNew = x - fx / dfx
    const error = Math.abs(xNew - x)
    iterations.push({ iter: i, x, fx, dfx, xNew, error })
    if (error < tol || Math.abs(fn.f(xNew)) < tol) { x = xNew; converged = true; break }
    x = xNew
    if (!isFinite(x) || Math.abs(x) > 1e10) { diverged = true; break }
  }

  const root = converged && iterations.length > 0 ? iterations[iterations.length - 1].xNew : null

  // SVG
  const W = 260, H = 155
  const xRange = root !== null ? [Math.min(x0, root) - 1, Math.max(x0, root) + 1] : [x0 - 2, x0 + 2]
  const ys = []
  for (let i = 0; i <= 80; i++) { const xi = xRange[0] + (i / 80) * (xRange[1] - xRange[0]); const y = fn.f(xi); if (isFinite(y)) ys.push(y) }
  const yMin = Math.min(...ys, -0.5), yMax = Math.max(...ys, 0.5)
  const toSx = x => ((x - xRange[0]) / (xRange[1] - xRange[0])) * (W - 20) + 10
  const toSy = y => H - 15 - ((y - yMin) / (Math.max(yMax - yMin, 0.1))) * (H - 30)
  const pts = []
  for (let i = 0; i <= 80; i++) {
    const xi = xRange[0] + (i / 80) * (xRange[1] - xRange[0])
    const yi = fn.f(xi)
    if (isFinite(yi)) pts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }
  const zeroY = Math.max(5, Math.min(H - 5, toSy(0)))
  // Draw first few tangent lines
  const tangentLines = iterations.slice(0, 4).map(it => {
    const x1 = xRange[0], x2 = xRange[1]
    const y1 = it.fx + it.dfx * (x1 - it.x), y2 = it.fx + it.dfx * (x2 - it.x)
    return { x1: toSx(x1), y1: Math.max(5, Math.min(H - 5, toSy(y1))), x2: toSx(x2), y2: Math.max(5, Math.min(H - 5, toSy(y2))) }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Newton-Raphson Method</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Tangent line intersection — quadratic convergence</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Root</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: converged ? C : diverged ? '#ef4444' : '#f59e0b', fontFamily: "'Space Grotesk',sans-serif" }}>
            {root !== null ? fmt(root) : diverged ? 'Diverged' : 'No convergence'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{converged ? `${iterations.length} iterations` : diverged ? 'try different x₀' : ''}</div>
        </div>
      </div>

      {/* Function selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Select function f(x)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {FUNCTIONS.map(f => (
            <button key={f.id} onClick={() => setFnId(f.id)}
              style={{ padding: '9px 4px', borderRadius: 10, border: `1.5px solid ${fnId === f.id ? C : 'var(--border-2)'}`, background: fnId === f.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontFamily: "'Space Grotesk',sans-serif", color: fnId === f.id ? C : 'var(--text)', fontWeight: 700 }}>{f.icon}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
            Parameters
          </div>
          <div style={{ padding: '10px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C }}>f(x) = {fn.fStr}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C, marginTop: 3 }}>f′(x) = {fn.dfStr}</div>
          </div>

          <Inp label="Initial guess (x₀)" value={x0} onChange={setX0} color={C} hint="closer to root = faster" />
          <Inp label="Max iterations" value={maxIter} onChange={v => setMaxIter(Math.max(1, Math.min(25, Math.round(v))))} color={C} hint="1–25" />
          <Inp label="Tolerance (ε)" value={tol} onChange={setTol} color={C} hint="stop when |xₙ₊₁−xₙ| < ε" />

          {/* First iteration preview */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>First iteration preview</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.8 }}>
              <div>f(x₀) = f({x0}) = <strong style={{ color: C }}>{fmt(fn.f(x0))}</strong></div>
              <div>f′(x₀) = f′({x0}) = <strong style={{ color: C }}>{fmt(fn.df(x0))}</strong></div>
              <div>x₁ = {x0} − {fmt(fn.f(x0))} / {fmt(fn.df(x0))} = <strong style={{ color: C }}>{fmt(x0 - fn.f(x0) / fn.df(x0))}</strong></div>
            </div>
          </div>

          {/* Quadratic convergence explainer */}
          <div style={{ padding: '12px 14px', background: '#10b98108', borderRadius: 10, border: '1px solid #10b98125', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>⚡ Quadratic convergence</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>Each step squares the error. If error = 0.01 now → 0.0001 → 0.00000001. Digits of precision double every iteration — dramatically faster than bisection.</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Find Root →</button>
            <button onClick={() => { setX0(1.5); setMaxIter(15); setTol(0.000001) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Root</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: converged ? C : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>
              {root !== null ? fmt(root) : diverged ? 'Diverged' : '—'}
            </div>
            {root !== null && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>f({fmt(root)}) = {fmt(fn.f(root))} · {iterations.length} iterations</div>}
          </div>

          {/* Tangent lines SVG */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Tangent line iterations</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={zeroY} x2={W - 10} y2={zeroY} stroke="var(--border)" strokeWidth="1" />
              {tangentLines.map((tl, i) => (
                <line key={i} x1={tl.x1} y1={tl.y1} x2={tl.x2} y2={tl.y2}
                  stroke={`rgba(${i === 0 ? '239,68,68' : i === 1 ? '245,158,11' : i === 2 ? '16,185,129' : '99,102,241'},0.7)`}
                  strokeWidth="1.5" strokeDasharray={i > 0 ? '4,3' : 'none'} />
              ))}
              {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              {iterations.slice(0, 5).map((it, i) => (
                <circle key={i} cx={toSx(it.x)} cy={Math.max(5, Math.min(H - 5, toSy(it.fx)))} r={4} fill={i === 0 ? '#ef4444' : C} stroke="#fff" strokeWidth="1.5" />
              ))}
              {root !== null && <circle cx={toSx(root)} cy={zeroY} r={6} fill={C} stroke="#fff" strokeWidth="2" />}
              <text x={14} y={14} fontSize="8" fill={C} fontWeight="700">f(x)</text>
              <text x={14} y={26} fontSize="8" fill="#ef4444" fontWeight="700">tangents</text>
            </svg>
          </div>

          <BreakdownTable title="Convergence Summary" rows={[
            { label: 'Function f(x)', value: fn.fStr, highlight: true },
            { label: "Derivative f′(x)", value: fn.dfStr },
            { label: 'Initial guess x₀', value: fmt(x0) },
            { label: 'Root found', value: root !== null ? fmt(root) : '—', bold: true, color: C },
            { label: 'f(root)', value: root !== null ? fmt(fn.f(root)) : '—', color: '#10b981' },
            { label: 'Iterations', value: String(iterations.length), highlight: true },
            { label: 'Status', value: converged ? 'Converged ✓' : diverged ? 'Diverged ✗' : 'Max iters reached', color: converged ? '#10b981' : '#ef4444' },
          ]} />
          <AIHintCard hint={root !== null ? `Root ≈ ${fmt(root)} found in just ${iterations.length} iterations — quadratic convergence! f(root) = ${fmt(fn.f(root))} ≈ 0 ✓` : `Newton-Raphson ${diverged ? 'diverged' : 'did not converge'}. Try a different initial guess closer to the root.`} color={C} />
        </>}
      />

      {/* Iteration table */}
      {iterations.length > 0 && (
        <Sec title="Iteration table" sub={`Quadratic convergence — error decreases as error²`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr>{['n', 'xₙ', 'f(xₙ)', "f′(xₙ)", 'xₙ₊₁', '|error|'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {iterations.map((it, i) => (
                  <tr key={i} style={{ background: i === iterations.length - 1 ? C + '08' : i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>{it.iter}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.x)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: Math.abs(it.fx) < 0.001 ? '#10b981' : 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.fx)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.dfx)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.xNew)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: it.error < tol * 10 ? '#10b981' : 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.error)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sec>
      )}

      {/* Quadratic convergence visual */}
      {iterations.length > 2 && (
        <Sec title="Quadratic convergence — error halves squared each step">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(iterations.length, 6)},1fr)`, gap: 8, marginBottom: 14 }}>
            {iterations.slice(0, 6).map((it, i) => {
              const logErr = it.error > 0 ? Math.max(0, -Math.log10(it.error)) : 12
              const maxLog = iterations[0].error > 0 ? Math.max(0, -Math.log10(iterations[0].error)) : 1
              const h = Math.min(100, (logErr / Math.max(maxLog + 6, 6)) * 100)
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                    <div style={{ width: '70%', background: C, borderRadius: '4px 4px 0 0', height: `${h}%`, minHeight: 4, transition: 'height .4s' }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C }}>n={it.iter}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{fmt(it.error)}</div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
            Notice how the number of correct digits roughly doubles with each Newton-Raphson step — this is quadratic convergence. Bisection would need 3× more iterations to reach the same precision.
          </p>
        </Sec>
      )}

      {/* Geometric interpretation */}
      <Sec title="Geometric interpretation — why it works">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 14 }}>
          Each Newton-Raphson step constructs the tangent line to the curve at the current point (xₙ, f(xₙ)). The tangent line has equation y − f(xₙ) = f′(xₙ)(x − xₙ). Setting y=0 and solving gives xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { step: 'Step 1', desc: 'Evaluate f(xₙ) and f′(xₙ) at current guess', color: '#ef4444' },
            { step: 'Step 2', desc: 'Draw tangent line through (xₙ, f(xₙ)) with slope f′(xₙ)', color: '#f59e0b' },
            { step: 'Step 3', desc: 'Find where tangent line crosses x-axis: xₙ₊₁', color: '#10b981' },
            { step: 'Step 4', desc: 'Repeat until |xₙ₊₁ − xₙ| < tolerance', color: C },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: s.color + '08', border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.step}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Computing √2 example */}
      <Sec title="Classic example — computing √2 with Newton-Raphson" sub="f(x) = x² − 2">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 12 }}>
          To find √2, solve x²=2, i.e. f(x) = x²−2 = 0. Newton's formula becomes xₙ₊₁ = xₙ − (xₙ²−2)/(2xₙ) = (xₙ + 2/xₙ)/2 — the average of xₙ and 2/xₙ.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['n', 'xₙ', 'xₙ²', 'error from √2'].map(h => (<th key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>))}</tr></thead>
            <tbody>
              {(() => {
                const rows = []; let xv = 1.5
                for (let i = 0; i < 6; i++) {
                  const xv2 = xv * xv
                  rows.push(<tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '7px 12px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>{i + 1}</td>
                    <td style={{ padding: '7px 12px', fontSize: 12, color: 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(xv)}</td>
                    <td style={{ padding: '7px 12px', fontSize: 12, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(xv2)}</td>
                    <td style={{ padding: '7px 12px', fontSize: 12, color: Math.abs(xv - Math.SQRT2) < 1e-6 ? '#10b981' : 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(Math.abs(xv - Math.SQRT2))}</td>
                  </tr>)
                  xv = (xv + 2 / xv) / 2
                }
                return rows
              })()}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 0' }}>√2 = {Math.SQRT2.toFixed(10)}... Notice how the error drops from 0.08 → 0.002 → 0.000002 — squaring each time.</p>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms" sub="Tap to expand">
        {[
          { term: 'Newton-Raphson', def: 'An iterative root-finding method using tangent lines. Formula: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).' },
          { term: 'Quadratic convergence', def: 'Error at each step ≈ (previous error)². Correct digits roughly double per iteration.' },
          { term: 'Tangent line', def: 'A line touching the curve at one point with the same slope. Newton-Raphson uses where each tangent crosses the x-axis.' },
          { term: 'Divergence', def: "When iterations don't approach the root — they oscillate or grow. Happens with bad initial guess or near flat regions." },
          { term: 'Local convergence', def: 'Newton-Raphson only guaranteed to converge if starting close to the root. Unlike bisection which has global guarantees.' },
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
