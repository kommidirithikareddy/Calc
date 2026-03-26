import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n, d = 8) => {
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

export default function ExponentCalculator({ category }) {
  const C = category?.color || '#7c3aed'
  const [base, setBase] = useState('2')
  const [power, setPower] = useState('5')

  const result = useMemo(() => {
    const b = Number(base)
    const p = Number(power)
    if (Number.isNaN(b) || Number.isNaN(p)) return { valid: false }
    const value = Math.pow(b, p)
    const isIntegerPower = Number.isInteger(p) && Math.abs(p) <= 12
    const repeated = isIntegerPower
      ? (p === 0 ? '1' : Array.from({ length: Math.abs(p) }, () => `${fmt(b)}`).join(' × '))
      : null
    return { valid: true, b, p, value, repeated }
  }, [base, power])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <Card title="Formula Card" color={C}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>aⁿ</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
          Exponents tell how many times a base is multiplied by itself. For example, 2³ = 2 × 2 × 2 = 8.
        </div>
      </Card>

      <CalcShell
        left={
          <>
            <div className="inputs-title">Exponent Input</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Base</label>
              <input value={base} onChange={e => setBase(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Exponent</label>
              <input value={power} onChange={e => setPower(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
            </div>
          </>
        }
        right={
          result.valid ? (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Result</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>{fmt(result.value)}</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>{fmt(result.b)}^{fmt(result.p)}</div>
              </div>
              <AIHintCard hint={`${fmt(result.b)} raised to the power ${fmt(result.p)} equals ${fmt(result.value)}.`} />
            </>
          ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid numbers.</div></Card>
        }
      />

      {result.valid ? (
        <Card title="Step-by-Step Understanding" color={C}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Meaning of the exponent</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>{fmt(result.b)}^{fmt(result.p)} means multiplying {fmt(result.b)} by itself {fmt(result.p)} times when the exponent is a positive integer.</div>
            </div>
            {result.repeated ? (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Expanded form</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>
                  {result.p >= 0 ? result.repeated : `1 / (${result.repeated})`}
                </div>
              </div>
            ) : null}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Final value</div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.b)}^{fmt(result.p)} = {fmt(result.value)}</div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card title="Exponent Rules" color={C}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
          <div><b>a^m × a^n = a^(m+n)</b></div>
          <div><b>a^m / a^n = a^(m−n)</b> for a ≠ 0</div>
          <div><b>(a^m)^n = a^(mn)</b></div>
          <div><b>a^0 = 1</b> for a ≠ 0</div>
          <div><b>a^(−n) = 1 / a^n</b></div>
        </div>
      </Card>

      <Card title="Visual Understanding" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          Exponents are repeated multiplication. They are used everywhere: compound growth, scientific notation, algebraic simplification, area and volume formulas, and advanced calculus models.
        </div>
      </Card>

      <Card title="Examples" color={C}>
        <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
          <div><b>2⁵ = 32</b></div>
          <div><b>10³ = 1000</b></div>
          <div><b>5⁰ = 1</b></div>
          <div><b>2⁻³ = 1/8 = 0.125</b></div>
        </div>
      </Card>

      <Card title="Explanation" color={C}>
        <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
          This calculator is intentionally simple and educational. Younger students can use it to learn repeated multiplication, while advanced learners can use it to verify negative, fractional, or large powers quickly.
        </div>
      </Card>

      <FAQ items={[
        { q: 'What is the base?', a: 'The base is the number being multiplied by itself.' },
        { q: 'What is the exponent?', a: 'The exponent tells how many times the base is used as a factor.' },
        { q: 'What does a negative exponent mean?', a: 'A negative exponent means take the reciprocal. For example, 2^-3 = 1/2^3 = 1/8.' },
      ]} />

      <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
    </div>
  )
}
