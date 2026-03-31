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

// Function library
const FUNCTIONS = [
  { id: 'cubic', label: 'x³−x−2', icon: 'x³−x−2', f: x => x * x * x - x - 2, fStr: 'x³ − x − 2' },
  { id: 'cos', label: 'cos(x)−x', icon: 'cos−x', f: x => Math.cos(x) - x, fStr: 'cos(x) − x' },
  { id: 'exp', label: 'eˣ−3x', icon: 'eˣ−3x', f: x => Math.exp(x) - 3 * x, fStr: 'eˣ − 3x' },
  { id: 'poly', label: 'x²−2', icon: 'x²−2', f: x => x * x - 2, fStr: 'x² − 2 (= √2)' },
  { id: 'sin', label: 'sin(x)', icon: 'sin(x)', f: x => Math.sin(x), fStr: 'sin(x)' },
]

const FAQ = [
  { q: 'What is the Bisection Method?', a: 'The Bisection Method finds a root of f(x)=0 by repeatedly halving an interval [a,b] where f(a) and f(b) have opposite signs. By the Intermediate Value Theorem, a root must exist in this interval. Each iteration halves the interval, doubling precision — it converges slowly but always reliably.' },
  { q: 'Why does it require f(a)·f(b) < 0?', a: 'If f(a) and f(b) have opposite signs, the function must cross zero somewhere between a and b (by IVT). If they have the same sign, there might be 0 or 2 roots in the interval — we cannot be sure. The sign change is a necessary guarantee of at least one root.' },
  { q: 'How many iterations do I need?', a: 'To achieve accuracy ε, you need at least n = ⌈log₂((b−a)/ε)⌉ iterations. For an interval of width 1 and accuracy 10⁻⁶, that is about 20 iterations. Bisection adds roughly one decimal digit of precision every 3.32 iterations (since log₁₀2 ≈ 0.301).' },
  { q: 'How does bisection compare to Newton-Raphson?', a: "Bisection: slow (linear convergence), always works, no derivative needed. Newton-Raphson: fast (quadratic convergence — doubles correct digits each step), but needs derivative and may fail to converge. Bisection is the 'safe' method; Newton-Raphson is the 'fast' method. In practice, hybrid methods like Brent's combine both." },
  { q: 'What is the Intermediate Value Theorem?', a: "IVT states: if f is continuous on [a,b] and f(a) and f(b) have opposite signs, then there exists at least one c in (a,b) where f(c)=0. The bisection method is a constructive proof of the IVT — it doesn't just prove a root exists, it finds it." },
]

export default function BisectionCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('cubic')
  const [aVal, setAVal] = useState(1)
  const [bVal, setBVal] = useState(2)
  const [maxIter, setMaxIter] = useState(20)
  const [tol, setTol] = useState(0.000001)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]

  // Run bisection
  const iterations = []
  let a = aVal, b = bVal
  const fa0 = fn.f(a), fb0 = fn.f(b)
  const validInterval = fa0 * fb0 < 0

  if (validInterval) {
    for (let i = 1; i <= Math.min(maxIter, 30); i++) {
      const mid = (a + b) / 2
      const fmid = fn.f(mid)
      const fa = fn.f(a)
      iterations.push({ iter: i, a: a, b: b, mid, fa, fb: fn.f(b), fmid, error: (b - a) / 2 })
      if (Math.abs(fmid) < tol || (b - a) / 2 < tol) break
      if (fa * fmid < 0) b = mid
      else a = mid
    }
  }

  const root = iterations.length > 0 ? iterations[iterations.length - 1].mid : null
  const finalError = iterations.length > 0 ? iterations[iterations.length - 1].error : null
  const converged = root !== null && Math.abs(fn.f(root)) < tol * 100

  // SVG plot
  const W = 260, H = 150
  const xMin = aVal - 0.5, xMax = bVal + 0.5
  const pts = []
  const ys = []
  for (let i = 0; i <= 80; i++) { const xi = xMin + (i / 80) * (xMax - xMin); ys.push(fn.f(xi)) }
  const yMin = Math.min(...ys.filter(isFinite)), yMax = Math.max(...ys.filter(isFinite))
  const toSx = x => ((x - xMin) / (xMax - xMin)) * (W - 20) + 10
  const toSy = y => H - 15 - ((y - yMin) / (Math.max(yMax - yMin, 0.1))) * (H - 30)
  for (let i = 0; i <= 80; i++) {
    const xi = xMin + (i / 80) * (xMax - xMin)
    const yi = fn.f(xi)
    if (isFinite(yi)) pts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }
  const zeroY = Math.max(5, Math.min(H - 5, toSy(0)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Bisection Method — Root Finding</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>c = (a + b) / 2</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Halve the interval each iteration until f(c) ≈ 0</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Root</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: converged ? C : validInterval ? '#f59e0b' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>
            {root !== null ? fmt(root) : validInterval ? '...' : 'Invalid'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{converged ? `after ${iterations.length} iters` : validInterval ? 'running...' : 'f(a)·f(b) > 0'}</div>
        </div>
      </div>

      {/* Function selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Select function f(x)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {FUNCTIONS.map(f => (
            <button key={f.id} onClick={() => setFnId(f.id)}
              style={{ padding: '10px 4px', borderRadius: 10, border: `1.5px solid ${fnId === f.id ? C : 'var(--border-2)'}`, background: fnId === f.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", color: fnId === f.id ? C : 'var(--text)', fontWeight: 700 }}>{f.icon}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
            Parameters for f(x) = {fn.fStr}
          </div>
          <Inp label="Left endpoint (a)" value={aVal} onChange={setAVal} color={C} hint="f(a) and f(b) must have opposite signs" />
          <Inp label="Right endpoint (b)" value={bVal} onChange={setBVal} color={C} />
          <Inp label="Max iterations" value={maxIter} onChange={v => setMaxIter(Math.max(1, Math.min(30, Math.round(v))))} color={C} hint="1–30" />
          <Inp label="Tolerance (ε)" value={tol} onChange={setTol} color={C} hint="stop when interval < ε" />

          {/* Interval check */}
          <div style={{ padding: '12px 14px', background: validInterval ? '#10b98110' : '#ef444410', borderRadius: 10, border: `1px solid ${validInterval ? '#10b98130' : '#ef444430'}`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: validInterval ? '#10b981' : '#ef4444', marginBottom: 6 }}>
              {validInterval ? '✓ Valid interval — root guaranteed' : '✗ Invalid — f(a) and f(b) must have opposite signs'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['f(a)', fn.f(aVal)], ['f(b)', fn.f(bVal)]].map(([lbl, v]) => (
                <div key={lbl} style={{ padding: '6px 10px', background: 'var(--bg-raised)', borderRadius: 7 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{lbl} = f({lbl === 'f(a)' ? aVal : bVal})</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: v > 0 ? C : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How bisection works */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>How it works</div>
            {[
              ['1. Compute midpoint', 'c = (a + b) / 2'],
              ['2. Evaluate f(c)', 'Check sign'],
              ['3. Update interval', 'f(a)·f(c)<0 → b=c, else a=c'],
              ['4. Repeat', 'Until |b−a| < ε'],
            ].map(([step, desc]) => (
              <div key={step} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C, minWidth: 90 }}>{step}</span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: "'Space Grotesk',sans-serif" }}>{desc}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Find Root →</button>
            <button onClick={() => { setAVal(1); setBVal(2); setMaxIter(20); setTol(0.000001) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          {/* Root result */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Root of f(x) = {fn.fStr}</div>
            <div style={{ fontSize: 38, fontWeight: 700, color: converged ? C : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>
              {root !== null ? fmt(root) : 'Invalid interval'}
            </div>
            {root !== null && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
              f({fmt(root)}) = {fmt(fn.f(root))} · Error ≤ {fmt(finalError)} · {iterations.length} iterations
            </div>}
          </div>

          {/* Function + root SVG */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>f(x) = {fn.fStr}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={zeroY} x2={W - 10} y2={zeroY} stroke="var(--border)" strokeWidth="1" />
              {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              {/* bracket markers */}
              <line x1={toSx(aVal)} y1={zeroY - 6} x2={toSx(aVal)} y2={zeroY + 6} stroke="#10b981" strokeWidth="2" />
              <line x1={toSx(bVal)} y1={zeroY - 6} x2={toSx(bVal)} y2={zeroY + 6} stroke="#10b981" strokeWidth="2" />
              <text x={toSx(aVal)} y={zeroY - 10} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="700">a</text>
              <text x={toSx(bVal)} y={zeroY - 10} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="700">b</text>
              {root !== null && <circle cx={toSx(root)} cy={zeroY} r={6} fill={C} stroke="#fff" strokeWidth="2" />}
              {root !== null && <text x={toSx(root)} y={zeroY + 18} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">root</text>}
            </svg>
          </div>

          <BreakdownTable title="Convergence Summary" rows={[
            { label: 'Function', value: fn.fStr, highlight: true },
            { label: 'Initial interval', value: `[${aVal}, ${bVal}]` },
            { label: 'Root found', value: root !== null ? fmt(root) : '—', bold: true, color: C },
            { label: 'f(root)', value: root !== null ? fmt(fn.f(root)) : '—', color: Math.abs(fn.f(root || 0)) < tol * 100 ? '#10b981' : '#f59e0b' },
            { label: 'Iterations', value: String(iterations.length) },
            { label: 'Final error', value: finalError !== null ? fmt(finalError) : '—', highlight: true },
            { label: 'Converged?', value: converged ? 'Yes ✓' : 'No ✗', color: converged ? '#10b981' : '#ef4444' },
          ]} />
          <AIHintCard hint={root !== null ? `Root of ${fn.fStr} ≈ ${fmt(root)} found after ${iterations.length} iterations. f(root) = ${fmt(fn.f(root))} ≈ 0 ✓. Error ≤ ${fmt(finalError)}.` : 'Ensure f(a) and f(b) have opposite signs to guarantee a root exists in the interval.'} color={C} />
        </>}
      />

      {/* Iteration table */}
      {iterations.length > 0 && (
        <Sec title="Iteration table" sub={`${iterations.length} steps to convergence`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr>{['n', 'a', 'b', 'c = (a+b)/2', 'f(c)', 'Error'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'right', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {iterations.slice(0, 15).map((it, i) => (
                  <tr key={i} style={{ background: i === iterations.length - 1 ? C + '08' : i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>{it.iter}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.a)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-2)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.b)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.mid)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: Math.abs(it.fmid) < 0.001 ? '#10b981' : 'var(--text)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.fmid)}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-3)', textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(it.error)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {iterations.length > 15 && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 0 0', textAlign: 'center' }}>Showing first 15 of {iterations.length} iterations</p>}
        </Sec>
      )}

      {/* Error convergence visual */}
      {iterations.length > 1 && (
        <Sec title="Error convergence" sub="Halves every iteration">
          <svg viewBox="0 0 280 100" width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8, marginBottom: 12 }}>
            <line x1={10} y1={90} x2={270} y2={90} stroke="var(--border)" strokeWidth="1" />
            <line x1={10} y1={10} x2={10} y2={90} stroke="var(--border)" strokeWidth="1" />
            {iterations.map((it, i) => {
              const px = 10 + (i / (iterations.length - 1)) * 255
              const logErr = Math.log10(Math.max(it.error, 1e-12))
              const logMax = Math.log10(Math.max(iterations[0].error, 1e-12))
              const logMin = Math.log10(1e-8)
              const py = 10 + ((logErr - logMax) / (logMin - logMax)) * 76
              return (
                <g key={i}>
                  {i > 0 && (
                    <line
                      x1={10 + ((i - 1) / (iterations.length - 1)) * 255}
                      y1={10 + ((Math.log10(Math.max(iterations[i - 1].error, 1e-12)) - logMax) / (logMin - logMax)) * 76}
                      x2={px} y2={Math.max(12, Math.min(88, py))}
                      stroke={C} strokeWidth="2" />
                  )}
                  <circle cx={px} cy={Math.max(12, Math.min(88, py))} r={3} fill={C} />
                </g>
              )
            })}
            <text x={14} y={18} fontSize="8" fill="var(--text-3)">high error</text>
            <text x={14} y={88} fontSize="8" fill="var(--text-3)">low error</text>
            <text x={140} y={100} textAnchor="middle" fontSize="8" fill="var(--text-3)">iterations</text>
          </svg>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
            Each iteration halves the error. Starting from interval width {fmt(Math.abs(bVal - aVal))}, after {iterations.length} iterations the error is ≤ {fmt(finalError)}. Bisection converges at a rate of one bit of precision per iteration.
          </p>
        </Sec>
      )}

      {/* Comparison with other methods */}
      <Sec title="Root-finding methods compared">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Method', 'Convergence rate', 'Requirements', 'Reliability'].map(h => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[
                { method: 'Bisection', rate: 'Linear (×½ each step)', req: 'f continuous, sign change', rel: '⭐⭐⭐ Always converges', color: C },
                { method: 'Newton-Raphson', rate: 'Quadratic (doubles digits)', req: 'f differentiable, good guess', rel: '⭐⭐ May diverge', color: '#10b981' },
                { method: 'Secant Method', rate: 'Superlinear (×1.618)', req: 'Two initial guesses', rel: '⭐⭐ Usually converges', color: '#f59e0b' },
                { method: "Brent's Method", rate: 'Superlinear to quadratic', req: 'Sign change bracket', rel: '⭐⭐⭐ Best of both worlds', color: '#8b5cf6' },
              ].map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: m.color, borderBottom: '0.5px solid var(--border)' }}>{m.method}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.rate}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{m.req}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>{m.rel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Real world */}
      <Sec title="Where root-finding is used in practice">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🏗️', title: 'Structural engineering', desc: 'Finding where stress equals yield strength — the root of stress(x)−yield=0 tells you the exact failure point.', color: C },
            { icon: '💰', title: 'Finance — IRR', desc: 'Internal Rate of Return = root of NPV=0. No closed-form solution exists, so numerical methods are essential.', color: '#10b981' },
            { icon: '⚗️', title: 'Chemical equilibrium', desc: 'Equilibrium concentrations satisfy K = [products]/[reactants] — solving these often requires root-finding.', color: '#f59e0b' },
            { icon: '🎮', title: 'Game physics', desc: 'Collision detection finds when distance(t)=0. Root-finding on time gives the exact moment of impact.', color: '#8b5cf6' },
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
          { term: 'Root / Zero', def: 'A value x where f(x) = 0. Geometrically, where the curve crosses the x-axis.' },
          { term: 'Bracketing', def: 'Enclosing a root between two points where the function has opposite signs. Bisection uses bracketing.' },
          { term: 'Convergence rate', def: 'How fast the error decreases per iteration. Linear: error × constant. Quadratic: error².' },
          { term: 'Tolerance (ε)', def: 'The acceptable error threshold. The algorithm stops when the interval width or |f(c)| is below ε.' },
          { term: 'Intermediate Value Theorem', def: 'If f is continuous and f(a)·f(b) < 0, there exists c in (a,b) with f(c) = 0.' },
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
