import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n, d = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}

const factorial = n => {
    let r = 1
    for (let i = 2; i <= n; i++) r *= i
    return r
}

const nCr = (n, r) => factorial(n) / (factorial(r) * factorial(n - r))

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

export default function BinomialTheoremCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('x')
    const [b, setB] = useState('y')
    const [n, setN] = useState('4')

    const result = useMemo(() => {
        const N = Math.floor(Number(n))
        if (Number.isNaN(N) || N < 0 || N > 12) return { valid: false }

        const terms = Array.from({ length: N + 1 }, (_, k) => {
            const coeff = nCr(N, k)
            const aPow = N - k
            const bPow = k
            const left = aPow === 0 ? '' : aPow === 1 ? a : `${a}^${aPow}`
            const right = bPow === 0 ? '' : bPow === 1 ? b : `${b}^${bPow}`
            const vars = [left, right].filter(Boolean).join(' ')
            return {
                k,
                coeff,
                text: `${coeff}${vars ? ' · ' + vars : ''}`
            }
        })

        const expansion = terms.map((t, i) => `${i === 0 ? '' : '+ '}${t.text}`).join(' ')
        return { valid: true, N, terms, expansion }
    }, [a, b, n])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>(a + b)ⁿ = Σ [nCk · aⁿ⁻ᵏ · bᵏ]</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The binomial theorem helps expand powers like <b>(a + b)ⁿ</b> using combinations.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Binomial Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>First term (a)</label>
                            <input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Second term (b)</label>
                            <input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Power (n)</label>
                            <input value={n} onChange={e => setN(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>Keep n between 0 and 12 for clean educational expansion.</div>
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Expansion</div>
                                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10, lineHeight: 1.6 }}>({a} + {b})^{result.N}</div>
                                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.8 }}>{result.expansion}</div>
                            </div>
                            <AIHintCard hint={`The coefficients come from combinations nCk. For n = ${result.N}, there are ${result.N + 1} terms in the expansion.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter a whole number n from 0 to 12.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Coefficients" color={C}>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {result.terms.map((term, i) => (
                            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Term {i + 1}</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
                                    k = {term.k}, coefficient = {term.coeff}<br />
                                    term = {term.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)', marginBottom: 12 }}>
                    The powers of the first term go down, while the powers of the second term go up. The coefficients follow Pascal’s Triangle.
                </div>
                {result.valid ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                        {result.terms.map((term, i) => (
                            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, textAlign: 'center', background: 'var(--bg)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>C({result.N},{i})</div>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{term.coeff}</div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>(x + y)² = x² + 2xy + y²</b></div>
                    <div><b>(x + y)³ = x³ + 3x²y + 3xy² + y³</b></div>
                    <div><b>(a + b)⁴</b> has coefficients 1, 4, 6, 4, 1</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The binomial theorem connects algebra, combinations, Pascal’s Triangle, probability, and advanced expansion methods. This version keeps the idea visual and understandable while still being mathematically correct.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is a binomial?', a: 'A binomial is an expression with two terms, like x + y.' },
                { q: 'Why do coefficients look like Pascal’s Triangle?', a: 'Because the combination values nCk match the rows of Pascal’s Triangle.' },
                { q: 'How many terms are in (a + b)^n?', a: 'There are n + 1 terms.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
