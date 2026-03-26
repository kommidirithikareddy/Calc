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

function Field({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        inputMode="decimal"
        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}
      />
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

export default function QuadraticSolverCalculator({ category }) {
  const C = category?.color || '#7c3aed'
  const [a, setA] = useState('1')
  const [b, setB] = useState('-3')
  const [c, setC] = useState('2')

  const result = useMemo(() => {
    const A = Number(a)
    const B = Number(b)
    const CC = Number(c)
    if ([A, B, CC].some(v => Number.isNaN(v))) return { valid: false }
    if (A === 0) return { valid: true, special: 'Not quadratic', message: 'When a = 0, this becomes a linear equation.' }
    const D = B * B - 4 * A * CC
    if (D > 0) {
      const x1 = (-B + Math.sqrt(D)) / (2 * A)
      const x2 = (-B - Math.sqrt(D)) / (2 * A)
      return { valid: true, D, kind: 'Two real roots', x1, x2 }
    }
    if (D === 0) {
      const x = -B / (2 * A)
      return { valid: true, D, kind: 'One repeated real root', x1: x, x2: x }
    }
    const real = -B / (2 * A)
    const imag = Math.sqrt(-D) / (2 * A)
    return { valid: true, D, kind: 'Two complex roots', real, imag }
  }, [a, b, c])

  const equation = `${a || 'a'}x² ${Number(b) >= 0 ? '+' : '-'} ${fmt(Math.abs(Number(b) || 0))}x ${Number(c) >= 0 ? '+' : '-'} ${fmt(Math.abs(Number(c) || 0))} = 0`

  const steps = result.valid && !result.special ? [
    { label: 'Write the quadratic formula', math: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { label: 'Find the discriminant', math: `D = b² - 4ac = (${fmt(Number(b))})² - 4(${fmt(Number(a))})(${fmt(Number(c))}) = ${fmt(result.D)}` },
    { label: 'Interpret the discriminant', math: `D = ${fmt(result.D)}`, note: result.D > 0 ? 'Positive discriminant means 2 real roots.' : result.D === 0 ? 'Zero discriminant means 1 repeated real root.' : 'Negative discriminant means 2 complex roots.' },
  ] : []

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Card title="Formula Card" color={C}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>x = (-b ± √(b² - 4ac)) / 2a</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
          Use the quadratic formula to solve equations in the form <b>ax² + bx + c = 0</b>.
        </div>
      </Card>

      <CalcShell
        left={
          <>
            <div className="inputs-title">Enter Quadratic Coefficients</div>
            <Field label="a" value={a} onChange={setA} />
            <Field label="b" value={b} onChange={setB} />
            <Field label="c" value={c} onChange={setC} />
            <Card title="Equation Preview" color={C}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{equation}</div>
            </Card>
          </>
        }
        right={
          result.valid ? (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Roots</div>
                {result.special ? (
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>{result.message}</div>
                ) : result.kind === 'Two complex roots' ? (
                  <>
                    <div style={{ fontSize: 15, marginTop: 10 }}>{result.kind}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginTop: 8 }}>x₁ = {fmt(result.real)} + {fmt(result.imag)}i</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginTop: 8 }}>x₂ = {fmt(result.real)} - {fmt(result.imag)}i</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 15, marginTop: 10 }}>{result.kind}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginTop: 8 }}>x₁ = {fmt(result.x1)}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginTop: 8 }}>x₂ = {fmt(result.x2)}</div>
                  </>
                )}
              </div>
              <AIHintCard hint={result.special ? result.message : `The discriminant is ${fmt(result.D)}, so this equation has ${result.kind.toLowerCase()}.`} />
            </>
          ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid numbers.</div></Card>
        }
      />

      {steps.length ? (
        <Card title="Step-by-Step Solution" color={C}>
          <div style={{ display: 'grid', gap: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{s.math}</div>
                {s.note ? <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-3)' }}>{s.note}</div> : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card title="Visual Interpretation" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 14 }}>
          A quadratic graph is a parabola. The roots are the x-values where the graph meets the x-axis.
        </div>
        <div style={{ border: '1px dashed var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 800, color: 'var(--text)' }}>D &gt; 0</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>Parabola cuts the x-axis at two points.</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 800, color: 'var(--text)' }}>D = 0</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>Parabola just touches the x-axis once.</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 800, color: 'var(--text)' }}>D &lt; 0</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>Parabola does not cross the x-axis in real numbers.</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Examples" color={C}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
          <div><b>x² - 3x + 2 = 0</b> gives roots 1 and 2.</div>
          <div><b>x² - 2x + 1 = 0</b> gives one repeated root 1.</div>
          <div><b>x² + 4x + 5 = 0</b> gives complex roots -2 ± i.</div>
        </div>
      </Card>

      <Card title="Explanation" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          Quadratic equations appear in algebra, projectile motion, optimization, geometry, engineering, and physics. This calculator is built to make the topic simple for beginners while still showing the full discriminant logic needed in higher studies.
        </div>
      </Card>

      <FAQ items={[
        { q: 'What is the discriminant?', a: 'The discriminant is b² − 4ac. It tells you the nature of the roots.' },
        { q: 'Can a quadratic have one root?', a: 'Yes. When the discriminant is zero, both roots are equal, so there is one repeated real root.' },
        { q: 'What are complex roots?', a: 'They are roots involving i = √(-1). They appear when the discriminant is negative.' },
      ]} />

      <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
    </div>
  )
}
