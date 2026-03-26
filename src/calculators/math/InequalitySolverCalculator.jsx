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

export default function InequalitySolverCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('3')
    const [b, setB] = useState('2')
    const [c, setC] = useState('11')
    const [op, setOp] = useState('>')

    const result = useMemo(() => {
        const A = Number(a)
        const B = Number(b)
        const CC = Number(c)
        if ([A, B, CC].some(v => Number.isNaN(v))) return { valid: false }

        if (A === 0) {
            const left = B
            const truth = op === '>' ? left > CC : op === '>=' ? left >= CC : op === '<' ? left < CC : left <= CC
            return {
                valid: true,
                special: true,
                solution: truth ? 'All real numbers' : 'No solution',
                note: 'Because there is no x term, the inequality becomes a constant comparison.'
            }
        }

        const boundary = (CC - B) / A
        const flip = A < 0
        const finalOp = flip
            ? op === '>' ? '<' : op === '<' ? '>' : op === '>=' ? '<=' : '>='
            : op

        return { valid: true, A, B, CC, boundary, flip, finalOp }
    }, [a, b, c, op])

    const signLabel = result.valid && !result.special
        ? `x ${result.finalOp} ${fmt(result.boundary)}`
        : result.solution

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>ax + b {op} c</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    Solve inequalities like equations, but remember one special rule: <b>if you divide or multiply by a negative number, the inequality sign flips.</b>
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Inequality Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>a</label>
                            <input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>b</label>
                            <input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Inequality sign</label>
                            <select value={op} onChange={e => setOp(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value=">">&gt;</option>
                                <option value=">=">&gt;=</option>
                                <option value="<">&lt;</option>
                                <option value="<=">&lt;=</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>c</label>
                            <input value={c} onChange={e => setC(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Solution Set</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginTop: 10 }}>{signLabel}</div>
                            </div>
                            <AIHintCard hint={result.special ? result.note : result.flip ? 'The sign flipped because you divided by a negative number.' : 'The sign stayed the same because you divided by a positive number.'} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid numbers.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Solution" color={C}>
                    {result.special ? (
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>{result.note}</div>
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Start</div>
                                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.A)}x + {fmt(result.B)} {op} {fmt(result.CC)}</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Move the constant</div>
                                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.A)}x {op} {fmt(result.CC - result.B)}</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Divide by the coefficient</div>
                                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>x {result.finalOp} {fmt(result.boundary)}</div>
                                {result.flip ? <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-3)' }}>The sign flipped because the coefficient was negative.</div> : null}
                            </div>
                        </div>
                    )}
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 12 }}>
                    An inequality does not always give one number. It often gives a range of numbers on a number line.
                </div>
                {result.valid && !result.special ? (
                    <div style={{ border: '1px dashed var(--border)', borderRadius: 16, padding: 16 }}>
                        <div style={{ fontSize: 14, color: 'var(--text)' }}>Boundary point: <b>{fmt(result.boundary)}</b></div>
                        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-2)' }}>The solution is {signLabel}.</div>
                    </div>
                ) : null}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>3x + 2 &gt; 11</b> gives <b>x &gt; 3</b></div>
                    <div><b>-2x + 4 ≤ 10</b> gives <b>x ≥ -3</b> because the sign flips</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Inequalities are used in algebra, optimization, engineering constraints, economics, and computer science. This version is designed to teach the biggest idea clearly: solving is like equations, except you must watch for sign reversal with negative division.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why does the sign flip with a negative?', a: 'Multiplying or dividing by a negative reverses the order of numbers on the number line.' },
                { q: 'Can inequalities have many answers?', a: 'Yes. Most inequalities describe a whole interval or range of values.' },
                { q: 'What is the boundary point?', a: 'It is the value where the inequality changes, usually found by solving the matching equation.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
