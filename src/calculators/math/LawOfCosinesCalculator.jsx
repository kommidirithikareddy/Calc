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

export default function LawOfCosinesCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [b, setB] = useState('7')
    const [c, setCVal] = useState('9')
    const [A, setA] = useState('60')

    const result = useMemo(() => {
        const sideB = Number(b)
        const sideC = Number(c)
        const angleA = Number(A)
        if ([sideB, sideC, angleA].some(v => Number.isNaN(v))) return { valid: false }
        if (sideB <= 0 || sideC <= 0) return { valid: false, message: 'Sides must be positive.' }
        if (angleA <= 0 || angleA >= 180) return { valid: false, message: 'Angle A must be between 0° and 180°.' }

        const sideA = Math.sqrt(sideB * sideB + sideC * sideC - 2 * sideB * sideC * Math.cos(toRad(angleA)))
        return { valid: true, sideB, sideC, angleA, sideA }
    }, [b, c, A])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>a² = b² + c² - 2bc cos A</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The Law of Cosines helps find a missing side or angle in any triangle. It is especially useful when you know two sides and the included angle.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Triangle Input</div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Side b</label><input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Side c</label><input value={c} onChange={e => setCVal(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Included Angle A (degrees)</label><input value={A} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Missing Side</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, marginTop: 10 }}>a = {fmt(result.sideA)}</div>
                            </div>
                            <AIHintCard hint={`With sides b and c and included angle A, the Law of Cosines gives the opposite side a.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message || 'Enter valid values.'}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Solution" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Square the known sides</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>b² = {fmt(result.sideB * result.sideB)}, c² = {fmt(result.sideC * result.sideC)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Use cosine of the included angle</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>cos({fmt(result.angleA)}°) = {fmt(Math.cos(toRad(result.angleA)))}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Compute the missing side</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>a = √(b² + c² - 2bc cos A) = {fmt(result.sideA)}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Meaning" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The Law of Cosines is like the Pythagorean theorem for any triangle. In fact, if angle A is 90°, then cos 90° = 0, and the formula becomes a² = b² + c².
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div>If b = 7, c = 9, and A = 60°, then a can be found directly.</div>
                    <div>It works very well for SAS triangle problems.</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The Law of Cosines is used in surveying, navigation, geometry, robotics, mechanical layout, and many engineering problems involving oblique triangles.
                </div>
            </Card>

            <FAQ items={[
                { q: 'When should I use the Law of Cosines?', a: 'Use it when you know two sides and the included angle, or all three sides and want an angle.' },
                { q: 'How is it related to the Pythagorean theorem?', a: 'It becomes the Pythagorean theorem when the angle is 90°.' },
                { q: 'Can I use it for non-right triangles?', a: 'Yes. That is exactly what it is designed for.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
