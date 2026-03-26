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
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} inputMode="decimal" style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
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

export default function SystemsEquationsCalculator({ category }) {
  const C = category?.color || '#7c3aed'
  const [a1, setA1] = useState('2')
  const [b1, setB1] = useState('1')
  const [c1, setC1] = useState('7')
  const [a2, setA2] = useState('1')
  const [b2, setB2] = useState('-1')
  const [c2, setC2] = useState('1')

  const result = useMemo(() => {
    const A1 = Number(a1), B1 = Number(b1), C1 = Number(c1)
    const A2 = Number(a2), B2 = Number(b2), C2 = Number(c2)
    if ([A1, B1, C1, A2, B2, C2].some(v => Number.isNaN(v))) return { valid: false }
    const det = A1 * B2 - A2 * B1
    if (det === 0) return { valid: true, special: true, det, message: 'No unique solution', subtitle: 'The lines may be parallel or the same line.' }
    const x = (C1 * B2 - C2 * B1) / det
    const y = (A1 * C2 - A2 * C1) / det
    return { valid: true, det, x, y }
  }, [a1, b1, c1, a2, b2, c2])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Card title="Formula Card" color={C}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>a₁x + b₁y = c₁ &nbsp;&nbsp; and &nbsp;&nbsp; a₂x + b₂y = c₂</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
          A system of equations asks for the values of variables that satisfy both equations at the same time.
        </div>
      </Card>

      <CalcShell
        left={
          <>
            <div className="inputs-title">Equation 1</div>
            <Field label="a₁" value={a1} onChange={setA1} />
            <Field label="b₁" value={b1} onChange={setB1} />
            <Field label="c₁" value={c1} onChange={setC1} />

            <div className="inputs-title" style={{ marginTop: 8 }}>Equation 2</div>
            <Field label="a₂" value={a2} onChange={setA2} />
            <Field label="b₂" value={b2} onChange={setB2} />
            <Field label="c₂" value={c2} onChange={setC2} />

            <Card title="Equation Preview" color={C}>
              <div style={{ display: 'grid', gap: 10, fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                <div>{a1}x + {b1}y = {c1}</div>
                <div>{a2}x + {b2}y = {c2}</div>
              </div>
            </Card>
          </>
        }
        right={
          result.valid ? (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Solution</div>
                {result.special ? (
                  <>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginTop: 10 }}>{result.message}</div>
                    <div style={{ fontSize: 14, marginTop: 8 }}>{result.subtitle}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 10 }}>x = {fmt(result.x)}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 8 }}>y = {fmt(result.y)}</div>
                    <div style={{ fontSize: 14, marginTop: 10 }}>Determinant = {fmt(result.det)}</div>
                  </>
                )}
              </div>
              <AIHintCard hint={result.special ? result.subtitle : `The two lines meet at (${fmt(result.x)}, ${fmt(result.y)}).`} />
            </>
          ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid numbers.</div></Card>
        }
      />

      {result.valid ? (
        <Card title="Step-by-Step Solution" color={C}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 1</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Compute the determinant</div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>D = a₁b₂ - a₂b₁ = ({fmt(Number(a1))})({fmt(Number(b2))}) - ({fmt(Number(a2))})({fmt(Number(b1))}) = {fmt(result.det)}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 2</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Interpret the determinant</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>{result.det === 0 ? 'Since D = 0, there is no unique intersection point.' : 'Since D ≠ 0, the system has one unique solution.'}</div>
            </div>
            {!result.special ? (
              <>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 3</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Find x</div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>x = (c₁b₂ - c₂b₁) / D = {fmt(result.x)}</div>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step 4</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Find y</div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>y = (a₁c₂ - a₂c₁) / D = {fmt(result.y)}</div>
                </div>
              </>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card title="Visual Understanding" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
          Each linear equation represents a line. Solving the system means finding where the two lines intersect.
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><b>One intersection</b><div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>One unique solution.</div></div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><b>Parallel lines</b><div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>No solution.</div></div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><b>Same line</b><div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Infinitely many solutions.</div></div>
        </div>
      </Card>

      <Card title="Examples" color={C}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
          <div><b>2x + y = 7</b> and <b>x - y = 1</b> gives <b>x = 8/3</b>, <b>y = 5/3</b>.</div>
          <div><b>x + y = 4</b> and <b>x - y = 2</b> gives <b>x = 3</b>, <b>y = 1</b>.</div>
        </div>
      </Card>

      <Card title="Explanation" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          Systems of equations appear in algebra, optimization, economics, linear programming foundations, electrical circuits, and many engineering models. This version keeps the UI simple while still teaching determinant-based solving clearly.
        </div>
      </Card>

      <FAQ items={[
        { q: 'What does determinant mean here?', a: 'It helps us check whether the system has one unique solution. If the determinant is zero, the system does not have a unique solution.' },
        { q: 'Can a system have no solution?', a: 'Yes. That happens when the lines are parallel and never meet.' },
        { q: 'Can a system have infinitely many solutions?', a: 'Yes. That happens when both equations represent the same line.' },
      ]} />

      <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
    </div>
  )
}
