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

const referenceAngles = [
    { deg: 0, radLabel: '0' },
    { deg: 30, radLabel: 'π/6' },
    { deg: 45, radLabel: 'π/4' },
    { deg: 60, radLabel: 'π/3' },
    { deg: 90, radLabel: 'π/2' },
    { deg: 120, radLabel: '2π/3' },
    { deg: 135, radLabel: '3π/4' },
    { deg: 150, radLabel: '5π/6' },
    { deg: 180, radLabel: 'π' },
    { deg: 210, radLabel: '7π/6' },
    { deg: 225, radLabel: '5π/4' },
    { deg: 240, radLabel: '4π/3' },
    { deg: 270, radLabel: '3π/2' },
    { deg: 300, radLabel: '5π/3' },
    { deg: 315, radLabel: '7π/4' },
    { deg: 330, radLabel: '11π/6' },
    { deg: 360, radLabel: '2π' },
]

function approxMatchDegree(d) {
    return referenceAngles.find(item => Math.abs(item.deg - d) < 0.5) || null
}

export default function UnitCircleReferenceCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [mode, setMode] = useState('deg')
    const [angle, setAngle] = useState('45')

    const result = useMemo(() => {
        const raw = Number(angle)
        if (Number.isNaN(raw)) return { valid: false, message: 'Enter a valid angle.' }

        const deg = mode === 'deg' ? raw : toDeg(raw)
        const rad = mode === 'deg' ? toRad(raw) : raw
        const normalized = ((deg % 360) + 360) % 360
        const sin = Math.sin(toRad(normalized))
        const cos = Math.cos(toRad(normalized))
        const tan = Math.abs(cos) < 1e-12 ? null : Math.tan(toRad(normalized))

        let quadrant = 'Axis'
        if (normalized > 0 && normalized < 90) quadrant = 'Quadrant I'
        else if (normalized > 90 && normalized < 180) quadrant = 'Quadrant II'
        else if (normalized > 180 && normalized < 270) quadrant = 'Quadrant III'
        else if (normalized > 270 && normalized < 360) quadrant = 'Quadrant IV'

        const reference = normalized <= 90
            ? normalized
            : normalized <= 180
                ? 180 - normalized
                : normalized <= 270
                    ? normalized - 180
                    : 360 - normalized

        const standard = approxMatchDegree(normalized)

        return {
            valid: true,
            raw,
            deg,
            rad,
            normalized,
            sin,
            cos,
            tan,
            quadrant,
            reference,
            standard,
            x: cos,
            y: sin,
        }
    }, [angle, mode])

    const size = 260
    const center = size / 2
    const radius = 92
    const px = result.valid ? center + result.x * radius : center
    const py = result.valid ? center - result.y * radius : center

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>(cos θ, sin θ)</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    On the unit circle, every angle corresponds to a point. The x-coordinate is <b>cos θ</b> and the y-coordinate is <b>sin θ</b>.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Unit Circle Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle unit</label>
                            <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="deg">Degrees</option>
                                <option value="rad">Radians</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle value</label>
                            <input value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <Card title="Common Unit Circle Angles" color={C}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                                {referenceAngles.slice(0, 8).map((a, i) => <div key={i}>{a.deg}° = {a.radLabel}</div>)}
                            </div>
                        </Card>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Unit Circle Point</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginTop: 10 }}>
                                    ({fmt(result.x)}, {fmt(result.y)})
                                </div>
                                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.8 }}>
                                    sin = {fmt(result.sin)}<br />
                                    cos = {fmt(result.cos)}<br />
                                    tan = {result.tan === null ? 'Undefined' : fmt(result.tan)}
                                </div>
                            </div>
                            <AIHintCard hint={`On the unit circle, angle ${fmt(result.normalized)}° lands at (${fmt(result.x)}, ${fmt(result.y)}), so cos is x and sin is y.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Visual Unit Circle" color={C}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '100%' }}>
                            <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" opacity="0.25" strokeWidth="2" />
                            <line x1={center} y1="16" x2={center} y2={size - 16} stroke="currentColor" opacity="0.2" />
                            <line x1="16" y1={center} x2={size - 16} y2={center} stroke="currentColor" opacity="0.2" />
                            <line x1={center} y1={center} x2={px} y2={py} stroke="currentColor" strokeWidth="2.5" />
                            <circle cx={px} cy={py} r="5" fill="currentColor" />
                            <text x={px + 8} y={py - 8} fontSize="12" fill="currentColor">({fmt(result.x, 3)}, {fmt(result.y, 3)})</text>
                        </svg>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
                        Quadrant: <b>{result.quadrant}</b><br />
                        Reference angle: <b>{fmt(result.reference)}°</b><br />
                        {result.standard ? <>Standard angle match: <b>{result.standard.deg}° = {result.standard.radLabel}</b></> : <>This is not one of the common exact-reference angles.</>}
                    </div>
                </Card>
            ) : null}

            {result.valid ? (
                <Card title="Step-by-Step Understanding" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Normalize the angle</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Equivalent angle between 0° and 360°: {fmt(result.normalized)}°</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Find the point on the circle</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>(x, y) = (cos θ, sin θ) = ({fmt(result.x)}, {fmt(result.y)})</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Use the point to read trig values</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>cos θ = x, sin θ = y, tan θ = y/x when x ≠ 0</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>0°</b> → (1, 0)</div>
                    <div><b>90°</b> → (0, 1)</div>
                    <div><b>180°</b> → (-1, 0)</div>
                    <div><b>270°</b> → (0, -1)</div>
                    <div><b>45°</b> → (√2/2, √2/2) approximately (0.707, 0.707)</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    The unit circle is one of the most important ideas in trigonometry because it connects angles, coordinates, sine, cosine, tangent, and graphing. Once students understand the unit circle, many trig topics become much easier.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why is it called the unit circle?', a: 'Because the radius is exactly 1 unit.' },
                { q: 'Why do cosine and sine become coordinates?', a: 'On a circle of radius 1, the horizontal coordinate is cos θ and the vertical coordinate is sin θ.' },
                { q: 'What is a reference angle?', a: 'It is the smallest positive angle between the terminal side and the x-axis.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
