import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n, d = 6) => {
  if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
  return parseFloat(Number(n).toFixed(d)).toString()
}

function Card({ title, children, color = '#7c3aed' }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

function FAQ({ items }) {
  return (
    <Card title="FAQs">
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((item, idx) => (
          <div key={idx}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>{item.a}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function evalPoly(coeffs, x) {
  return coeffs.reduce((acc, c) => acc * x + c, 0)
}

function derivativeCoeffs(coeffs) {
  const n = coeffs.length - 1
  return coeffs.slice(0, -1).map((c, i) => c * (n - i))
}

export default function PolynomialRootsCalculator({ category }) {
  const C = category?.color || '#7c3aed'
  const [coeffInput, setCoeffInput] = useState('1, -6, 11, -6')
  const [guess, setGuess] = useState('1.5')
  const [iterations, setIterations] = useState('8')

  const result = useMemo(() => {
    const coeffs = coeffInput.split(/[,\s]+/).map(Number).filter(v => !Number.isNaN(v))
    const x0 = Number(guess)
    const n = Math.max(1, Math.floor(Number(iterations)))
    if (coeffs.length < 2 || Number.isNaN(x0) || Number.isNaN(n)) return { valid: false }
    const dCoeffs = derivativeCoeffs(coeffs)
    let x = x0
    const steps = []
    for (let i = 0; i < n; i++) {
      const fx = evalPoly(coeffs, x)
      const fpx = evalPoly(dCoeffs, x)
      if (fpx === 0) {
        steps.push({ x, fx, fpx, note: 'Derivative became zero. Newton method stopped.' })
        break
      }
      const next = x - fx / fpx
      steps.push({ x, fx, fpx, next })
      x = next
    }
    return { valid: true, coeffs, root: x, steps }
  }, [coeffInput, guess, iterations])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Card title="Formula Card" color={C}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>xₙ₊₁ = xₙ - f(xₙ) / f'(xₙ)</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
          This calculator uses <b>Newton's Method</b> to estimate a root of a polynomial. Enter coefficients from highest power to constant.
        </div>
      </Card>

      <CalcShell
        left={
          <>
            <div className="inputs-title">Polynomial Input</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Coefficients</label>
              <input value={coeffInput} onChange={e => setCoeffInput(e.target.value)} placeholder="Example: 1, -6, 11, -6" style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>For x³ - 6x² + 11x - 6, enter: 1, -6, 11, -6</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Initial Guess</label>
              <input value={guess} onChange={e => setGuess(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Iterations</label>
              <input value={iterations} onChange={e => setIterations(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
            </div>
          </>
        }
        right={
          result.valid ? (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Estimated Root</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>x ≈ {fmt(result.root)}</div>
              </div>
              <AIHintCard hint={`Using Newton's method, the estimate converged to ${fmt(result.root)} from the starting guess ${fmt(Number(guess))}.`} />
            </>
          ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid coefficients, guess and iterations.</div></Card>
        }
      />

      {result.valid ? (
        <Card title="Step-by-Step Iterations" color={C}>
          <div style={{ display: 'grid', gap: 10 }}>
            {result.steps.map((s, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Iteration {i + 1}</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
                  xₙ = {fmt(s.x)}<br />
                  f(xₙ) = {fmt(s.fx)}<br />
                  f'(xₙ) = {fmt(s.fpx)}<br />
                  {s.next !== undefined ? <>xₙ₊₁ = {fmt(s.next)}</> : s.note}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card title="Visual Explanation" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          Newton's method starts with a guess, draws the tangent line, and uses where that tangent crosses the x-axis as the next better guess. Repeating this often gets very close to an actual root.
        </div>
      </Card>

      <Card title="Examples" color={C}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
          <div><b>x³ - 6x² + 11x - 6</b> has roots 1, 2, and 3.</div>
          <div>If you start near 1.5, Newton's method often converges to either 1 or 2 depending on the path.</div>
        </div>
      </Card>

      <Card title="Important Note" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          This is a numerical root finder, not a symbolic algebra system. It estimates one root at a time and depends on the starting guess. That makes it great for teaching numerical methods and for practical approximation work.
        </div>
      </Card>

      <FAQ items={[
        { q: 'What are polynomial roots?', a: 'They are values of x that make the polynomial equal to zero.' },
        { q: 'Why do I need an initial guess?', a: 'Newton’s method is iterative. It needs a starting point and then improves it step by step.' },
        { q: 'Can different guesses give different roots?', a: 'Yes. For polynomials with many roots, different starting guesses can converge to different roots.' },
      ]} />

      <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
    </div>
  )
}
