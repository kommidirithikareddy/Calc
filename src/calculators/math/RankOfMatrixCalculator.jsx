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

function rowRank2x2(A, B, Cc, D) {
    const rows = [[A, B], [Cc, D]]
    const nonZeroRows = rows.filter(r => !(r[0] === 0 && r[1] === 0))
    if (nonZeroRows.length === 0) return 0
    const det = A * D - B * Cc
    if (det !== 0) return 2
    return 1
}

export default function RankOfMatrixCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('1')
    const [b, setB] = useState('2')
    const [c, setCVal] = useState('2')
    const [d, setD] = useState('4')

    const result = useMemo(() => {
        const A = parseCell(a)
        const B = parseCell(b)
        const Cc = parseCell(c)
        const D = parseCell(d)
        const rank = rowRank2x2(A, B, Cc, D)
        return { valid: true, A, B, Cc, D, rank, det: A * D - B * Cc }
    }, [a, b, c, d])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Rank = number of independent rows or columns</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The rank of a matrix tells how much independent information it contains.
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
                            <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Rank</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, marginTop: 10 }}>{fmt(result.rank)}</div>
                        </div>
                        <AIHintCard hint={`The rank shows how many rows or columns are linearly independent.`} />
                    </>
                }
            />

            <Card title="Step-by-Step Understanding" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Check for zero rows</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>If every row is zero, the rank is 0.</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Check determinant</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>det = {fmt(result.det)}. For a 2×2 matrix, a non-zero determinant means full rank 2.</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Final rank</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>This matrix has rank {fmt(result.rank)}.</div>
                    </div>
                </div>
            </Card>

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Rank tells whether rows or columns repeat the same information. If one row is just a multiple of another row, the matrix loses independence and the rank drops.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>[[1,2],[3,4]]</b> has rank 2</div>
                    <div><b>[[1,2],[2,4]]</b> has rank 1 because the second row is a multiple of the first</div>
                    <div><b>[[0,0],[0,0]]</b> has rank 0</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Rank is important in solving systems of equations, understanding linear dependence, dimensionality, data compression, and machine learning. This calculator keeps the 2×2 case intuitive and easy to interpret.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What does rank 2 mean?', a: 'It means both rows or columns are independent.' },
                { q: 'What does rank 1 mean?', a: 'It means one row or column depends on the other.' },
                { q: 'Why is rank useful?', a: 'It tells how much unique information a matrix contains.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
