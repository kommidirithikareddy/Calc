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

export default function TrigCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [angle, setAngle] = useState('30')
    const [unit, setUnit] = useState('deg')

    const result = useMemo(() => {
        const a = Number(angle)
        if (Number.isNaN(a)) return { valid: false }
        const rad = unit === 'deg' ? toRad(a) : a
        const deg = unit === 'deg' ? a : toDeg(a)
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const tan = Math.abs(Math.cos(rad)) < 1e-12 ? null : Math.tan(rad)
        return { valid: true, a, rad, deg, sin, cos, tan }
    }, [angle, unit])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>sin θ, cos θ, tan θ</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    These are the three main trigonometric functions. In a right triangle:
                    <br /><b>sin θ = opposite / hypotenuse</b>
                    <br /><b>cos θ = adjacent / hypotenuse</b>
                    <br /><b>tan θ = opposite / adjacent</b>
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Angle Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle value</label>
                            <input value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle unit</label>
                            <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="deg">Degrees</option>
                                <option value="rad">Radians</option>
                            </select>
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Trig Values</div>
                                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.9 }}>
                                    sin = {fmt(result.sin)}<br />
                                    cos = {fmt(result.cos)}<br />
                                    tan = {result.tan === null ? 'Undefined' : fmt(result.tan)}
                                </div>
                            </div>
                            <AIHintCard hint={`For angle ${fmt(result.deg)}°, the trig values are sin ${fmt(result.sin)}, cos ${fmt(result.cos)}, and tan ${result.tan === null ? 'undefined' : fmt(result.tan)}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter a valid angle.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Convert angle if needed</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{unit === 'deg' ? `${fmt(result.deg)}° = ${fmt(result.rad)} rad` : `${fmt(result.rad)} rad = ${fmt(result.deg)}°`}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Evaluate functions</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
                                sin(θ) = {fmt(result.sin)}<br />
                                cos(θ) = {fmt(result.cos)}<br />
                                tan(θ) = {result.tan === null ? 'Undefined because cos(θ) = 0' : fmt(result.tan)}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Triangle Meaning" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    In a right triangle, pick one angle θ. Then:
                    <br />- opposite side is across from θ
                    <br />- adjacent side is next to θ
                    <br />- hypotenuse is the longest side
                </div>
            </Card>

            <Card title="Common Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>30°:</b> sin = 0.5, cos ≈ 0.866, tan ≈ 0.577</div>
                    <div><b>45°:</b> sin ≈ 0.707, cos ≈ 0.707, tan = 1</div>
                    <div><b>60°:</b> sin ≈ 0.866, cos = 0.5, tan ≈ 1.732</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Trigonometric functions are used in triangles, waves, circles, physics, engineering, architecture, and graphics. This calculator helps students quickly connect an angle to its three main trig values.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why is tan sometimes undefined?', a: 'Because tan θ = sin θ / cos θ. If cos θ = 0, division is not possible.' },
                { q: 'Should I use degrees or radians?', a: 'Both are correct. Degrees are common in school geometry, while radians are heavily used in higher mathematics.' },
                { q: 'Can trig values be negative?', a: 'Yes. It depends on the angle and which quadrant it lies in.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
