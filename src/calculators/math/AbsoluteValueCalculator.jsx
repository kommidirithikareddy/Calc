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

export default function AbsoluteValueCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [value, setValue] = useState('-12.5')

    const result = useMemo(() => {
        const n = Number(value)
        if (Number.isNaN(n)) return { valid: false }
        return {
            valid: true,
            n,
            abs: Math.abs(n),
            sign: n < 0 ? 'negative' : n > 0 ? 'positive' : 'zero',
            distance: Math.abs(n),
        }
    }, [value])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>|x|</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    Absolute value means the <b>distance from zero</b> on the number line, so it is never negative.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Absolute Value Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Enter a number</label>
                            <input value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Absolute Value</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>{fmt(result.abs)}</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>|{fmt(result.n)}|</div>
                            </div>
                            <AIHintCard hint={`The number ${fmt(result.n)} is ${result.sign}, but its distance from 0 is ${fmt(result.abs)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter a valid number.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Identify the number</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>x = {fmt(result.n)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find distance from 0</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Distance = {fmt(result.distance)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Final answer</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>|{fmt(result.n)}| = {fmt(result.abs)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                {result.valid ? (
                    <div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 14 }}>
                            On a number line, absolute value tells how far the number is from zero, ignoring direction.
                        </div>
                        <div style={{ border: '1px dashed var(--border)', borderRadius: 16, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Negative side</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>0</div>
                                <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Positive side</div>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.n)} is {fmt(result.distance)} units away from 0.</div>
                        </div>
                    </div>
                ) : <div style={{ color: 'var(--text-3)' }}>Enter a valid number to see the interpretation.</div>}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>|5| = 5</b></div>
                    <div><b>|-5| = 5</b></div>
                    <div><b>|0| = 0</b></div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Absolute value is a basic but very important concept in algebra, geometry, distance problems, error analysis, optimization, and advanced mathematics. It is one of the earliest ideas students meet and one of the most useful later on.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Can absolute value be negative?', a: 'No. It represents distance from zero, and distance cannot be negative.' },
                { q: 'Why is |-7| equal to 7?', a: 'Because -7 is 7 units away from zero on the number line.' },
                { q: 'What is |0|?', a: 'It is 0, because zero is already at zero distance from itself.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
