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

export default function ExponentialGrowthDecayCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [mode, setMode] = useState('growth')
    const [initial, setInitial] = useState('1000')
    const [rate, setRate] = useState('8')
    const [time, setTime] = useState('5')

    const result = useMemo(() => {
        const P = Number(initial)
        const r = Number(rate) / 100
        const t = Number(time)
        if ([P, r, t].some(v => Number.isNaN(v))) return { valid: false }
        const factor = mode === 'growth' ? 1 + r : 1 - r
        if (factor <= 0) return { valid: false, message: 'For decay, rate must be less than 100%.' }
        const finalValue = P * Math.pow(factor, t)
        const change = finalValue - P
        const timeline = Array.from({ length: Math.max(1, Math.min(10, Math.floor(t) + 1)) }, (_, i) => ({
            step: i,
            value: P * Math.pow(factor, i)
        }))
        return { valid: true, P, r, t, factor, finalValue, change, timeline }
    }, [mode, initial, rate, time])

    const formula = mode === 'growth' ? 'A = P(1 + r)^t' : 'A = P(1 - r)^t'

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{formula}</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    Exponential {mode} means the amount changes by the same percentage again and again over time.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Growth / Decay Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Mode</label>
                            <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="growth">Growth</option>
                                <option value="decay">Decay</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Initial amount (P)</label>
                            <input value={initial} onChange={e => setInitial(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Rate (%) per period</label>
                            <input value={rate} onChange={e => setRate(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Time periods (t)</label>
                            <input value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Final Amount</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, marginTop: 10 }}>{fmt(result.finalValue)}</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>Net change = {fmt(result.change)}</div>
                            </div>
                            <AIHintCard hint={`Starting from ${fmt(result.P)}, after ${fmt(result.t)} periods at ${fmt(result.r * 100)}% ${mode}, the result is ${fmt(result.finalValue)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message || 'Enter valid values.'}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Convert percent to decimal</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.r * 100)}% = {fmt(result.r)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the multiplier</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{mode === 'growth' ? '1 + r' : '1 - r'} = {fmt(result.factor)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Apply the formula</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>A = {fmt(result.P)} × ({fmt(result.factor)})^{fmt(result.t)} = {fmt(result.finalValue)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Growth Path" color={C}>
                {result.valid ? (
                    <div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 14 }}>
                            Each box below shows the amount after each period.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
                            {result.timeline.map(item => (
                                <div key={item.step} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 10, background: 'var(--bg)', textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>t = {item.step}</div>
                                    <div style={{ fontWeight: 800, color: 'var(--text)' }}>{fmt(item.value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>Growth:</b> $1000 at 10% for 3 years → 1000 × 1.1³ = 1331</div>
                    <div><b>Decay:</b> 500 bacteria samples decreasing by 20% per hour → 500 × 0.8^t</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Exponential growth and decay appear in population models, investments, inflation, radioactive decay, biology, and machine learning curves. This calculator makes the repeated-percent idea easy to see.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is exponential growth?', a: 'It means a quantity increases by the same percentage over equal time intervals.' },
                { q: 'What is exponential decay?', a: 'It means a quantity decreases by the same percentage over equal time intervals.' },
                { q: 'Why is it not just addition?', a: 'Because each new change is based on the updated amount, not the original amount only.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}