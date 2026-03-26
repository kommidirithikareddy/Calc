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

export default function SecondOrderODESolverCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('1')
    const [b, setB] = useState('4')
    const [c, setCVal] = useState('4')

    const result = useMemo(() => {
        const A = Number(a)
        const B = Number(b)
        const Cc = Number(c)
        if ([A, B, Cc].some(v => Number.isNaN(v)) || A === 0) return { valid: false }

        const disc = B * B - 4 * A * Cc
        if (disc > 0) {
            const r1 = (-B + Math.sqrt(disc)) / (2 * A)
            const r2 = (-B - Math.sqrt(disc)) / (2 * A)
            return { valid: true, type: 'distinct', A, B, Cc, disc, r1, r2 }
        }
        if (disc === 0) {
            const r = -B / (2 * A)
            return { valid: true, type: 'repeated', A, B, Cc, disc, r }
        }
        const alpha = -B / (2 * A)
        const beta = Math.sqrt(-disc) / (2 * A)
        return { valid: true, type: 'complex', A, B, Cc, disc, alpha, beta }
    }, [a, b, c])

    const solutionText = !result.valid
        ? '—'
        : result.type === 'distinct'
            ? `y = C₁e^(${fmt(result.r1)}x) + C₂e^(${fmt(result.r2)}x)`
            : result.type === 'repeated'
                ? `y = (C₁ + C₂x)e^(${fmt(result.r)}x)`
                : `y = e^(${fmt(result.alpha)}x)[C₁ cos(${fmt(result.beta)}x) + C₂ sin(${fmt(result.beta)}x)]`

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>ay'' + by' + cy = 0</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>ar² + br + c = 0</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    Solve the characteristic equation first. Its roots determine the form of the solution.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">ODE Coefficients</div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>a</label><input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>b</label><input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>c</label><input value={c} onChange={e => setCVal(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>General Solution</div>
                                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.6, marginTop: 10 }}>{solutionText}</div>
                            </div>
                            <AIHintCard hint={`The discriminant is ${fmt(result.disc)}, so the equation has ${result.type} roots.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid coefficients. Also, a cannot be 0.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Solution" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Build the characteristic equation</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.A)}r² + {fmt(result.B)}r + {fmt(result.Cc)} = 0</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Compute the discriminant</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Δ = b² − 4ac = {fmt(result.disc)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Choose the correct solution form</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                                {result.type === 'distinct' && 'Two distinct real roots → y = C₁e^(r₁x) + C₂e^(r₂x)'}
                                {result.type === 'repeated' && 'Repeated root → y = (C₁ + C₂x)e^(rx)'}
                                {result.type === 'complex' && 'Complex roots → y = e^(αx)[C₁ cos(βx) + C₂ sin(βx)]'}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Second-order ODEs often model spring motion, oscillations, damping, vibrations, and electrical circuits. The discriminant helps tell whether the motion is overdamped, critically damped, or oscillatory.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>y'' - 5y' + 6y = 0</b> → distinct roots</div>
                    <div><b>y'' + 4y' + 4y = 0</b> → repeated root</div>
                    <div><b>y'' + 2y' + 5y = 0</b> → complex roots</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    This calculator focuses on the most important classroom form of second-order ODEs: constant-coefficient homogeneous equations. It is a perfect bridge between algebra, exponentials, trigonometry, and differential equations.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why do we use the characteristic equation?', a: 'Because exponentials turn derivatives into algebraic factors, which makes the differential equation easier to solve.' },
                { q: 'What do complex roots mean?', a: 'They lead to oscillating solutions involving sine and cosine.' },
                { q: 'What is a repeated root?', a: 'It means the quadratic characteristic equation has one root appearing twice.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
