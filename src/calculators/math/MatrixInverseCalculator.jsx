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

function renderMatrix(M) {
    return (
        <div style={{ display: 'inline-grid', gap: 8 }}>
            {M.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                    {row.map((v, j) => (
                        <div key={j} style={{ minWidth: 64, textAlign: 'center', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)' }}>
                            {fmt(v)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default function MatrixInverseCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('4')
    const [b, setB] = useState('7')
    const [c, setCVal] = useState('2')
    const [d, setD] = useState('6')

    const result = useMemo(() => {
        const A = parseCell(a)
        const B = parseCell(b)
        const Cc = parseCell(c)
        const D = parseCell(d)
        const det = A * D - B * Cc
        if (det === 0) {
            return { valid: true, invertible: false, A, B, Cc, D, det }
        }
        const inverse = [
            [D / det, -B / det],
            [-Cc / det, A / det],
        ]
        return { valid: true, invertible: true, A, B, Cc, D, det, inverse }
    }, [a, b, c, d])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>A⁻¹ = (1 / det(A)) × [[d, -b], [-c, a]]</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    This is the inverse formula for a <b>2×2 matrix</b>. A matrix only has an inverse when its determinant is not zero.
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
                    result.invertible ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Inverse Matrix</div>
                                <div style={{ marginTop: 12 }}>{renderMatrix(result.inverse)}</div>
                            </div>
                            <AIHintCard hint={`Because the determinant is ${fmt(result.det)}, this matrix is invertible.`} />
                        </>
                    ) : (
                        <>
                            <Card title="Output">
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>No inverse exists</div>
                                <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>The determinant is 0, so the matrix is singular.</div>
                            </Card>
                            <AIHintCard hint={`A determinant of 0 means the inverse does not exist.`} />
                        </>
                    )
                }
            />

            <Card title="Step-by-Step Solution" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the determinant</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>det(A) = {fmt(result.A)}×{fmt(result.D)} − {fmt(result.B)}×{fmt(result.Cc)} = {fmt(result.det)}</div>
                    </div>
                    {result.invertible ? (
                        <>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Swap and change signs</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Swap a and d, then change the signs of b and c.</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Divide by determinant</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Multiply the whole swapped matrix by 1 / {fmt(result.det)}.</div>
                            </div>
                        </>
                    ) : null}
                </div>
            </Card>

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The inverse matrix “undoes” the effect of the original matrix. It is like division for matrices, though the actual rule is more special than ordinary numbers.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>[[4,7],[2,6]]</b> has determinant 10, so it has an inverse.</div>
                    <div><b>[[2,4],[1,2]]</b> has determinant 0, so it does not.</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Matrix inverses are used in solving systems of equations, computer graphics, control systems, and engineering models. This calculator focuses on the 2×2 case so learners can clearly understand the pattern.
                </div>
            </Card>

            <FAQ items={[
                { q: 'When does a matrix have an inverse?', a: 'When its determinant is not zero.' },
                { q: 'Why do we swap a and d?', a: 'That is part of the special 2×2 inverse rule.' },
                { q: 'What does a singular matrix mean?', a: 'It means the matrix cannot be inverted.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
