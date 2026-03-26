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

export default function LogarithmCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [base, setBase] = useState('10')
    const [value, setValue] = useState('1000')

    const result = useMemo(() => {
        const b = Number(base)
        const v = Number(value)
        if (Number.isNaN(b) || Number.isNaN(v)) return { valid: false, message: 'Enter valid numbers.' }
        if (b <= 0 || b === 1) return { valid: false, message: 'Base must be positive and not equal to 1.' }
        if (v <= 0) return { valid: false, message: 'Logarithm input must be greater than 0.' }

        const logVal = Math.log(v) / Math.log(b)
        const check = Math.pow(b, logVal)
        return { valid: true, b, v, logVal, check }
    }, [base, value])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>logᵦ(x) = y ⟺ bʸ = x</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    A logarithm answers the question: <b>"To what power must the base be raised to get the value?"</b>
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Logarithm Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Base (b)</label>
                            <input value={base} onChange={e => setBase(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Value (x)</label>
                            <input value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Result</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>{fmt(result.logVal)}</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>log₍{fmt(result.b)}₎({fmt(result.v)})</div>
                            </div>
                            <AIHintCard hint={`log base ${fmt(result.b)} of ${fmt(result.v)} is ${fmt(result.logVal)} because ${fmt(result.b)}^${fmt(result.logVal)} ≈ ${fmt(result.check)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Rewrite in exponent form</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>log₍{fmt(result.b)}₎({fmt(result.v)}) = y means {fmt(result.b)}^y = {fmt(result.v)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the exponent</div>
                            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>We find the exponent y such that the base raised to y gives the input value.</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Check the answer</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.b)}^{fmt(result.logVal)} ≈ {fmt(result.check)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Exponents and logarithms are inverse operations. If multiplication and division are opposites, then exponents and logarithms are opposites too.
                </div>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><b>Exponent form</b><div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>10³ = 1000</div></div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}><b>Log form</b><div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>log₁₀(1000) = 3</div></div>
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>log₁₀(100) = 2</b> because 10² = 100</div>
                    <div><b>log₂(8) = 3</b> because 2³ = 8</div>
                    <div><b>log₅(1) = 0</b> because any valid base to the power 0 equals 1</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Logarithms are used in algebra, pH calculations, earthquake scales, sound intensity, growth and decay models, information theory, and advanced mathematics. This version explains logs in a very simple way while still being correct for higher-level study.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Can the base be 1?', a: 'No. If the base is 1, then 1 to any power is always 1, so logarithms would not work properly.' },
                { q: 'Can the input be negative?', a: 'No. In real-number logarithms, the input must be greater than 0.' },
                { q: 'Why are logs useful?', a: 'They help solve equations with exponents and model many real-world scales and growth processes.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
