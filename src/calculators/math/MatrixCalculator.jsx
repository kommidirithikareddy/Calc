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

function MatrixGrid({ label, values, setValues }) {
    return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {values.map((row, i) => row.map((cell, j) => (
                    <input
                        key={`${i}-${j}`}
                        value={cell}
                        onChange={e => {
                            const next = values.map(r => [...r])
                            next[i][j] = e.target.value
                            setValues(next)
                        }}
                        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}
                    />
                )))}
            </div>
        </div>
    )
}

function renderMatrix(M) {
    return (
        <div style={{ display: 'inline-grid', gap: 8 }}>
            {M.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                    {row.map((v, j) => (
                        <div key={j} style={{ minWidth: 56, textAlign: 'center', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)' }}>
                            {fmt(v)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default function MatrixCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [operation, setOperation] = useState('add')
    const [A, setA] = useState([['1', '2'], ['3', '4']])
    const [B, setB] = useState([['5', '6'], ['7', '8']])

    const result = useMemo(() => {
        const mA = A.map(r => r.map(parseCell))
        const mB = B.map(r => r.map(parseCell))

        let matrix = null
        if (operation === 'add') {
            matrix = mA.map((row, i) => row.map((v, j) => v + mB[i][j]))
        } else if (operation === 'subtract') {
            matrix = mA.map((row, i) => row.map((v, j) => v - mB[i][j]))
        } else {
            matrix = [
                [mA[0][0] * mB[0][0] + mA[0][1] * mB[1][0], mA[0][0] * mB[0][1] + mA[0][1] * mB[1][1]],
                [mA[1][0] * mB[0][0] + mA[1][1] * mB[1][0], mA[1][0] * mB[0][1] + mA[1][1] * mB[1][1]],
            ]
        }

        return { valid: true, mA, mB, matrix }
    }, [A, B, operation])

    const opLabel = operation === 'add' ? 'A + B' : operation === 'subtract' ? 'A − B' : 'A × B'

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{opLabel}</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    This calculator performs basic matrix operations for <b>2×2 matrices</b>: addition, subtraction, and multiplication.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Matrix Operation Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Operation</label>
                            <select value={operation} onChange={e => setOperation(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="add">Addition</option>
                                <option value="subtract">Subtraction</option>
                                <option value="multiply">Multiplication</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <MatrixGrid label="Matrix A" values={A} setValues={setA} />
                            <MatrixGrid label="Matrix B" values={B} setValues={setB} />
                        </div>
                    </>
                }
                right={
                    <>
                        <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                            <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Result Matrix</div>
                            <div style={{ marginTop: 12 }}>{renderMatrix(result.matrix)}</div>
                        </div>
                        <AIHintCard hint={`This calculator shows how two matrices combine through ${operation}.`} />
                    </>
                }
            />

            <Card title="Step-by-Step Understanding" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    {operation === 'add' || operation === 'subtract' ? (
                        <>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Compare matching positions</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>For addition and subtraction, combine entries that sit in the same row and same column.</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Example first entry</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                                    {operation === 'add'
                                        ? `${fmt(result.mA[0][0])} + ${fmt(result.mB[0][0])} = ${fmt(result.matrix[0][0])}`
                                        : `${fmt(result.mA[0][0])} - ${fmt(result.mB[0][0])} = ${fmt(result.matrix[0][0])}`}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Multiply row by column</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Each result entry comes from multiplying across one row of A and down one column of B.</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Example first entry</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                                    ({fmt(result.mA[0][0])} × {fmt(result.mB[0][0])}) + ({fmt(result.mA[0][1])} × {fmt(result.mB[1][0])}) = {fmt(result.matrix[0][0])}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    A matrix is a rectangular table of numbers. Linear algebra uses matrices to describe transformations, systems of equations, data tables, and many engineering computations.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>Addition:</b> [[1,2],[3,4]] + [[5,6],[7,8]] = [[6,8],[10,12]]</div>
                    <div><b>Multiplication:</b> [[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Matrix operations are foundational in algebra, physics, graphics, machine learning, robotics, economics, and differential equations. This calculator gives students a simple way to understand the rules behind the operations.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Can I add any two matrices?', a: 'Only if they have the same dimensions.' },
                { q: 'Is matrix multiplication the same as normal multiplication?', a: 'No. It follows a row-by-column rule and order matters.' },
                { q: 'Why does order matter in multiplication?', a: 'Because A × B is not always the same as B × A.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
