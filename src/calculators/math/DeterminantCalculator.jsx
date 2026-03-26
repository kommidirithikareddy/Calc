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

export default function DeterminantCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('1')
    const [b, setB] = useState('2')
    const [c, setCVal] = useState('3')
    const [d, setD] = useState('4')

    const result = useMemo(() => {
        const A = parseCell(a)
        const B = parseCell(b)
        const Cc = parseCell(c)
        const D = parseCell(d)
        const det = A * D - B * Cc
        return { valid: true, A, B, Cc, D, det }
    }, [a, b, c, d])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>det(A) = ad − bc</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    For a <b>2×2 matrix</b>, the determinant tells an important property of the matrix, including whether it is invertible.
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
                    <>
                        <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                            <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Determinant</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, marginTop: 10 }}>{fmt(result.det)}</div>
                        </div>
                        <AIHintCard hint={result.det === 0 ? 'The determinant is zero, so this matrix is singular and not invertible.' : 'The determinant is non-zero, so this matrix is invertible.'} />
                    </>
                }
            />

            <Card title="Step-by-Step Solution" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Multiply the main diagonal</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.A)} × {fmt(result.D)} = {fmt(result.A * result.D)}</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Multiply the other diagonal</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.B)} × {fmt(result.Cc)} = {fmt(result.B * result.Cc)}</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Subtract</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.A * result.D)} − {fmt(result.B * result.Cc)} = {fmt(result.det)}</div>
                    </div>
                </div>
            </Card>

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The determinant can be thought of as a scaling factor for area in 2D transformations. If the determinant is zero, the transformation collapses area and loses information.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>[[1,2],[3,4]]</b> → determinant = 1×4 − 2×3 = -2</div>
                    <div><b>[[2,4],[1,2]]</b> → determinant = 0, so the rows are dependent</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Determinants are used in matrix inversion, systems of equations, geometry, coordinate transformations, and higher linear algebra. This calculator makes the basic 2×2 idea easy to understand visually and numerically.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What does determinant zero mean?', a: 'It means the matrix is singular and does not have an inverse.' },
                { q: 'Why is determinant important?', a: 'It helps describe scaling, orientation, and invertibility.' },
                { q: 'Can determinant be negative?', a: 'Yes. A negative determinant often means orientation is reversed.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
