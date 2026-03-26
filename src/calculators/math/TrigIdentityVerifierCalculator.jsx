import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const PI = Math.PI
const fmt = (n, d = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}
const toRad = deg => (deg * PI) / 180

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

const identities = {
    pythagorean: {
        title: 'sin²θ + cos²θ = 1',
        left: r => r.sin * r.sin + r.cos * r.cos,
        right: () => 1,
        explain: 'This is the most famous trig identity. It comes from the unit circle and the Pythagorean theorem.'
    },
    tan: {
        title: 'tanθ = sinθ / cosθ',
        left: r => r.tan,
        right: r => Math.abs(r.cos) < 1e-12 ? null : r.sin / r.cos,
        explain: 'Tangent can be rewritten as sine divided by cosine.'
    },
    sec: {
        title: 'sec²θ = 1 + tan²θ',
        left: r => Math.abs(r.cos) < 1e-12 ? null : 1 / (r.cos * r.cos),
        right: r => r.tan === null ? null : 1 + r.tan * r.tan,
        explain: 'This is the tangent-secant version of the Pythagorean identity.'
    },
    csc: {
        title: 'csc²θ = 1 + cot²θ',
        left: r => Math.abs(r.sin) < 1e-12 ? null : 1 / (r.sin * r.sin),
        right: r => Math.abs(r.tan) < 1e-12 || r.tan === null ? null : 1 + 1 / (r.tan * r.tan),
        explain: 'This identity connects cosecant and cotangent.'
    }
}

export default function TrigIdentityVerifierCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [identityKey, setIdentityKey] = useState('pythagorean')
    const [angle, setAngle] = useState('45')

    const result = useMemo(() => {
        const deg = Number(angle)
        if (Number.isNaN(deg)) return { valid: false, message: 'Enter a valid angle.' }
        const rad = toRad(deg)
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const tan = Math.abs(cos) < 1e-12 ? null : Math.tan(rad)
        const record = { deg, rad, sin, cos, tan }
        const identity = identities[identityKey]
        const left = identity.left(record)
        const right = identity.right(record)
        if (left === null || right === null || !Number.isFinite(left) || !Number.isFinite(right)) {
            return {
                valid: true,
                deg,
                identity,
                left,
                right,
                comparable: false,
                message: 'This identity cannot be numerically checked at this angle because one side is undefined.'
            }
        }
        const diff = Math.abs(left - right)
        return {
            valid: true,
            deg,
            identity,
            sin,
            cos,
            tan,
            left,
            right,
            diff,
            comparable: true,
            verified: diff < 1e-8
        }
    }, [identityKey, angle])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{identities[identityKey].title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>{identities[identityKey].explain}</div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Identity Check Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Choose identity</label>
                            <select value={identityKey} onChange={e => setIdentityKey(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="pythagorean">sin²θ + cos²θ = 1</option>
                                <option value="tan">tanθ = sinθ / cosθ</option>
                                <option value="sec">sec²θ = 1 + tan²θ</option>
                                <option value="csc">csc²θ = 1 + cot²θ</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Angle (degrees)</label>
                            <input value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Verification Result</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 10 }}>
                                    {result.comparable ? (result.verified ? 'Verified' : 'Not equal') : 'Undefined here'}
                                </div>
                                <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.8 }}>
                                    Left side = {result.left === null ? 'Undefined' : fmt(result.left)}<br />
                                    Right side = {result.right === null ? 'Undefined' : fmt(result.right)}
                                </div>
                            </div>
                            <AIHintCard hint={result.comparable ? `At ${fmt(result.deg)}°, both sides are numerically ${result.verified ? 'equal' : 'not equal'} within rounding tolerance.` : result.message} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Check" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Compute trig values</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
                                sin θ = {fmt(Math.sin(toRad(Number(angle))))}<br />
                                cos θ = {fmt(Math.cos(toRad(Number(angle))))}<br />
                                tan θ = {Math.abs(Math.cos(toRad(Number(angle)))) < 1e-12 ? 'Undefined' : fmt(Math.tan(toRad(Number(angle))))}
                            </div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Evaluate both sides</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                                Left side = {result.left === null ? 'Undefined' : fmt(result.left)}<br />
                                Right side = {result.right === null ? 'Undefined' : fmt(result.right)}
                            </div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Conclusion</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                                {result.comparable
                                    ? result.verified
                                        ? 'The identity is numerically confirmed at this angle.'
                                        : 'The two sides are not matching numerically.'
                                    : result.message}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    A trig identity is like an algebra identity. It means two expressions are equal wherever both sides are defined. This calculator checks them numerically for a chosen angle so learners can build intuition.
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>At 45°</b>, sin²θ + cos²θ = 0.5 + 0.5 = 1</div>
                    <div><b>At 30°</b>, tanθ = sinθ / cosθ</div>
                    <div><b>At 90°</b>, tan and sec-related checks may become undefined</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Trig identities are used in simplification, equation solving, calculus, signal analysis, physics, and engineering. This verifier is built as a learning tool so students can see identities working with real numeric angles.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is a trig identity?', a: 'It is an equation involving trig functions that stays true for all angles where both sides are defined.' },
                { q: 'Why might an identity be undefined at some angles?', a: 'Because some trig functions involve division, and division by zero is undefined.' },
                { q: 'Does numerical verification prove the identity forever?', a: 'No. It only checks one angle numerically, but it helps students understand how the identity behaves.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
