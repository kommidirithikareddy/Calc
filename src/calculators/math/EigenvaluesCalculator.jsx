import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n, d = 6) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}
const parseCell = v => {
    const n = Number(v)
    return Number.isNaN(n) ? 0 : n
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

export default function EigenvaluesCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('4')
    const [b, setB] = useState('2')
    const [c, setCVal] = useState('1')
    const [d, setD] = useState('3')

    const result = useMemo(() => {
        const A = parseCell(a)
        const B = parseCell(b)
        const Cc = parseCell(c)
        const D = parseCell(d)
        const trace = A + D
        const det = A * D - B * Cc
        const disc = trace * trace - 4 * det
        if (disc < 0) {
            return { valid: true, real: false, A, B, Cc, D, trace, det, disc }
        }
        const l1 = (trace + Math.sqrt(disc)) / 2
        const l2 = (trace - Math.sqrt(disc)) / 2
        return { valid: true, real: true, A, B, Cc, D, trace, det, disc, l1, l2 }
    }, [a, b, c, d])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>λ² − (trace)λ + det = 0</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    For a <b>2×2 matrix</b>, eigenvalues are found by solving the characteristic equation.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">2×2 Matrix Input</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {[[a, setA], [b, setB], [c, setCVal], [d, setD]].map(([val, set], i) => (
                                <input key={i} value={val} onChange={e => set(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            ))}
                        </div>
                    </>
                }
                right={
                    result.real ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Eigenvalues</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginTop: 10 }}>λ₁ = {fmt(result.l1)}</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginTop: 8 }}>λ₂ = {fmt(result.l2)}</div>
                            </div>
                            <AIHintCard hint={`The eigenvalues come from the trace and determinant of the matrix.`} />
                        </>
                    ) : (
                        <>
                            <Card title="Output">
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Complex eigenvalues</div>
                                <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>The discriminant is negative, so the matrix does not have two real eigenvalues.</div>
                            </Card>
                            <AIHintCard hint={`A negative discriminant means the eigenvalues are complex.`} />
                        </>
                    )
                }
            />

            <Card title="Step-by-Step Solution" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the trace</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>trace = a + d = {fmt(result.trace)}</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the determinant</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>det = ad − bc = {fmt(result.det)}</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Solve the characteristic equation</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>λ² − ({fmt(result.trace)})λ + {fmt(result.det)} = 0</div>
                    </div>
                </div>
            </Card>

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Eigenvalues tell how a matrix stretches or compresses along special directions. Those special directions are called eigenvectors.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>[[4,2],[1,3]]</b> has real eigenvalues.</div>
                    <div><b>Rotation-type matrices</b> can produce complex eigenvalues.</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Eigenvalues are extremely important in linear algebra, differential equations, stability analysis, vibrations, quantum mechanics, and machine learning. This calculator focuses on the 2×2 case so the idea stays approachable.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is an eigenvalue?', a: 'It is a number that tells how much a special vector is stretched by a matrix.' },
                { q: 'Why use trace and determinant?', a: 'For 2×2 matrices, they make the characteristic equation simple to solve.' },
                { q: 'Can eigenvalues be complex?', a: 'Yes. Some matrices do not have real eigenvalues.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
