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

export default function FirstOrderODESolverCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [k, setK] = useState('0.5')
    const [x0, setX0] = useState('0')
    const [y0, setY0] = useState('2')
    const [x, setX] = useState('3')

    const result = useMemo(() => {
        const K = Number(k)
        const X0 = Number(x0)
        const Y0 = Number(y0)
        const X = Number(x)
        if ([K, X0, Y0, X].some(v => Number.isNaN(v))) return { valid: false }

        const Cc = Y0 / Math.exp(K * X0)
        const y = Cc * Math.exp(K * X)
        const growthType = K > 0 ? 'growth' : K < 0 ? 'decay' : 'constant'
        const points = Array.from({ length: 6 }, (_, i) => {
            const xx = X0 + i * ((X - X0) / 5 || 1)
            return { x: xx, y: Cc * Math.exp(K * xx) }
        })

        return { valid: true, K, X0, Y0, X, Cc, y, growthType, points }
    }, [k, x0, y0, x])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>dy/dx = ky</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>y = Ce^(kx)</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    This is the most common first-order differential equation for exponential growth and decay.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">ODE Input</div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>k</label><input value={k} onChange={e => setK(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Initial x₀</label><input value={x0} onChange={e => setX0(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Initial y(x₀)</label><input value={y0} onChange={e => setY0(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Evaluate at x</label><input value={x} onChange={e => setX(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Solution</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 10 }}>y(x) = {fmt(result.Cc)}e^({fmt(result.K)}x)</div>
                                <div style={{ fontSize: 15, marginTop: 10 }}>y({fmt(result.X)}) = {fmt(result.y)}</div>
                            </div>
                            <AIHintCard hint={`This ODE gives exponential ${result.growthType}. With the initial condition applied, the constant becomes ${fmt(result.Cc)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid inputs.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Solution" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>General solution</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>For dy/dx = ky, the general solution is y = Ce^(kx).</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Use the initial condition</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>y({fmt(result.X0)}) = {fmt(result.Y0)} gives C = {fmt(result.Y0)} / e^({fmt(result.K)}×{fmt(result.X0)}) = {fmt(result.Cc)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Evaluate the solution</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>y({fmt(result.X)}) = {fmt(result.Cc)}e^({fmt(result.K)}×{fmt(result.X)}) = {fmt(result.y)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {result.valid ? (
                <Card title="Visual Understanding" color={C}>
                    <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)', marginBottom: 12 }}>
                        This equation models situations where the rate of change is proportional to the amount already present.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                        {result.points.map((p, i) => (
                            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, textAlign: 'center', background: 'var(--bg)' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>x = {fmt(p.x)}</div>
                                <div style={{ marginTop: 6, fontWeight: 800, color: 'var(--text)' }}>y = {fmt(p.y)}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            ) : null}

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>Population growth:</b> dy/dx = 0.2y</div>
                    <div><b>Radioactive decay:</b> dy/dx = -0.3y</div>
                    <div><b>Cooling-type simplified models:</b> change proportional to amount</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    First-order ODEs appear in growth, decay, finance, biology, and engineering. This calculator focuses on the most important classroom-ready exponential case so learners can clearly see the relationship between differential equations and exponentials.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What does dy/dx = ky mean?', a: 'It means the rate of change of y is proportional to y itself.' },
                { q: 'Why is the solution exponential?', a: 'Because exponential functions are exactly the functions whose derivative is proportional to themselves.' },
                { q: 'What happens if k is negative?', a: 'The solution decays instead of grows.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
