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

export default function SequenceCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [type, setType] = useState('arithmetic')
    const [a1, setA1] = useState('2')
    const [d, setD] = useState('3')
    const [r, setR] = useState('2')
    const [n, setN] = useState('6')

    const result = useMemo(() => {
        const first = Number(a1)
        const diff = Number(d)
        const ratio = Number(r)
        const termIndex = Math.max(1, Math.floor(Number(n)))
        if ([first, diff, ratio, termIndex].some(v => Number.isNaN(v))) return { valid: false }

        if (type === 'arithmetic') {
            const nth = first + (termIndex - 1) * diff
            const terms = Array.from({ length: termIndex }, (_, i) => first + i * diff)
            const sum = (termIndex / 2) * (2 * first + (termIndex - 1) * diff)
            return { valid: true, type, first, step: diff, termIndex, nth, terms, sum }
        }

        const nth = first * Math.pow(ratio, termIndex - 1)
        const terms = Array.from({ length: termIndex }, (_, i) => first * Math.pow(ratio, i))
        const sum = ratio === 1 ? first * termIndex : first * (1 - Math.pow(ratio, termIndex)) / (1 - ratio)
        return { valid: true, type, first, step: ratio, termIndex, nth, terms, sum }
    }, [type, a1, d, r, n])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                {type === 'arithmetic' ? (
                    <>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>aₙ = a₁ + (n − 1)d</div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>Arithmetic sequences add the same difference each time.</div>
                    </>
                ) : (
                    <>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>aₙ = a₁rⁿ⁻¹</div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>Geometric sequences multiply by the same ratio each time.</div>
                    </>
                )}
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Sequence Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Sequence type</label>
                            <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="arithmetic">Arithmetic</option>
                                <option value="geometric">Geometric</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>First term (a₁)</label>
                            <input value={a1} onChange={e => setA1(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        {type === 'arithmetic' ? (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Common difference (d)</label>
                                <input value={d} onChange={e => setD(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Common ratio (r)</label>
                                <input value={r} onChange={e => setR(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            </div>
                        )}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>n (term number)</label>
                            <input value={n} onChange={e => setN(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Nth Term</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>{fmt(result.nth)}</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>Sum of first {result.termIndex} terms = {fmt(result.sum)}</div>
                            </div>
                            <AIHintCard hint={`This ${result.type} sequence has nth term ${fmt(result.nth)} and first ${result.termIndex} terms sum to ${fmt(result.sum)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid values.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Type</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.type === 'arithmetic' ? 'Each term changes by adding the same difference.' : 'Each term changes by multiplying by the same ratio.'}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>First few terms</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{result.terms.map(v => fmt(v)).join(', ')}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Nth term</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>aₙ = {fmt(result.nth)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                {result.valid ? (
                    <div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 14 }}>
                            Below are the first {result.termIndex} terms. This helps students see the pattern clearly.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 10 }}>
                            {result.terms.map((term, i) => (
                                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, textAlign: 'center', background: 'var(--bg)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>a{i + 1}</div>
                                    <div style={{ fontWeight: 800, color: 'var(--text)' }}>{fmt(term)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>Arithmetic:</b> 2, 5, 8, 11, ... has difference 3</div>
                    <div><b>Geometric:</b> 3, 6, 12, 24, ... has ratio 2</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Sequences appear in school algebra, finance, computer science, recurrence relations, modeling, and calculus preparation. This calculator lets students learn both arithmetic and geometric sequences with one clear interface.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is an arithmetic sequence?', a: 'It is a sequence where the same number is added each time.' },
                { q: 'What is a geometric sequence?', a: 'It is a sequence where each term is multiplied by the same ratio.' },
                { q: 'Why are sequences important?', a: 'They help describe patterns, growth, repeated changes, and mathematical relationships.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
