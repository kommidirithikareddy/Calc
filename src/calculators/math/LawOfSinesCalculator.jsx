import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const PI = Math.PI
const fmt = (n, d = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}
const toRad = deg => (deg * PI) / 180
const toDeg = rad => (rad * 180) / PI

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

export default function LawOfSinesCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('10')
    const [A, setBigA] = useState('30')
    const [B, setBigB] = useState('45')

    const result = useMemo(() => {
        const sideA = Number(a)
        const angleA = Number(A)
        const angleB = Number(B)
        if ([sideA, angleA, angleB].some(v => Number.isNaN(v))) return { valid: false }
        if (sideA <= 0) return { valid: false, message: 'Side a must be positive.' }
        if (angleA <= 0 || angleB <= 0 || angleA + angleB >= 180) return { valid: false, message: 'Angles must be positive and add to less than 180°.' }

        const angleC = 180 - angleA - angleB
        const sideB = (sideA * Math.sin(toRad(angleB))) / Math.sin(toRad(angleA))
        const sideC = (sideA * Math.sin(toRad(angleC))) / Math.sin(toRad(angleA))
        return { valid: true, sideA, angleA, angleB, angleC, sideB, sideC }
    }, [a, A, B])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>a / sin A = b / sin B = c / sin C</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The Law of Sines helps solve triangles when you know one side-angle pair and another angle or side.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Triangle Input</div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Side a</label><input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle A (degrees)</label><input value={A} onChange={e => setBigA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle B (degrees)</label><input value={B} onChange={e => setBigB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Solved Triangle</div>
                                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.9 }}>
                                    Angle C = {fmt(result.angleC)}°<br />
                                    Side b = {fmt(result.sideB)}<br />
                                    Side c = {fmt(result.sideC)}
                                </div>
                            </div>
                            <AIHintCard hint={`Using the known pair a and A, the calculator finds the missing angle and sides using the Law of Sines.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message || 'Enter valid values.'}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Solution" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the third angle</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>C = 180° - A - B = {fmt(result.angleC)}°</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find side b</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>b = a × sin(B) / sin(A) = {fmt(result.sideB)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find side c</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>c = a × sin(C) / sin(A) = {fmt(result.sideC)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Meaning" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    In any triangle, the larger angle faces the longer side. The Law of Sines compares each side with the sine of its opposite angle.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div>If a = 10, A = 30°, and B = 45°, then C = 105°.</div>
                    <div>Then the other sides can be found using side/sine ratios.</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The Law of Sines is especially useful for non-right triangles in surveying, navigation, engineering drawing, and geometry problems.
                </div>
            </Card>

            <FAQ items={[
                { q: 'When should I use the Law of Sines?', a: 'Use it when you know an angle-side opposite pair and another angle or side.' },
                { q: 'Can I use it in any triangle?', a: 'Yes, but it is most helpful when the given information fits a side-angle opposite pair pattern.' },
                { q: 'Why must angles add to less than 180 before finding the third?', a: 'Because all three triangle angles together must equal exactly 180°.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
