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

export default function ComplexNumbersCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('3')
    const [b, setB] = useState('4')
    const [c, setC] = useState('1')
    const [d, setD] = useState('2')

    const result = useMemo(() => {
        const A = Number(a), B = Number(b), CC = Number(c), D = Number(d)
        if ([A, B, CC, D].some(v => Number.isNaN(v))) return { valid: false }

        const add = { re: A + CC, im: B + D }
        const sub = { re: A - CC, im: B - D }
        const mul = { re: A * CC - B * D, im: A * D + B * CC }
        const denom = CC * CC + D * D
        const div = denom === 0 ? null : {
            re: (A * CC + B * D) / denom,
            im: (B * CC - A * D) / denom,
        }
        const mag1 = Math.sqrt(A * A + B * B)
        const mag2 = Math.sqrt(CC * CC + D * D)

        return { valid: true, z1: { re: A, im: B }, z2: { re: CC, im: D }, add, sub, mul, div, mag1, mag2 }
    }, [a, b, c, d])

    const show = z => `${fmt(z.re)} ${z.im >= 0 ? '+' : '-'} ${fmt(Math.abs(z.im))}i`

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>z = a + bi</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    A complex number has a <b>real part</b> and an <b>imaginary part</b>. Here, <b>i² = -1</b>.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">First Complex Number</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Real part (a)</label>
                            <input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Imaginary coefficient (b)</label>
                            <input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>

                        <div className="inputs-title" style={{ marginTop: 8 }}>Second Complex Number</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Real part (c)</label>
                            <input value={c} onChange={e => setC(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Imaginary coefficient (d)</label>
                            <input value={d} onChange={e => setD(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Main Results</div>
                                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.9 }}>
                                    z₁ + z₂ = {show(result.add)}<br />
                                    z₁ − z₂ = {show(result.sub)}<br />
                                    z₁ × z₂ = {show(result.mul)}
                                </div>
                            </div>
                            <AIHintCard hint={`Complex numbers combine real and imaginary parts. Addition/subtraction combine like parts, while multiplication uses i² = -1.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter valid values.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Detailed Operations" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Addition</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>({show(result.z1)}) + ({show(result.z2)}) = {show(result.add)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Subtraction</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>({show(result.z1)}) − ({show(result.z2)}) = {show(result.sub)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Multiplication</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>({show(result.z1)})({show(result.z2)}) = {show(result.mul)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Division</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.div ? `${show(result.z1)} ÷ ${show(result.z2)} = ${show(result.div)}` : 'Division undefined because the second complex number is 0 + 0i.'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Visual Interpretation" color={C}>
                {result.valid ? (
                    <div>
                        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 14 }}>
                            Complex numbers can be shown as points on the complex plane: the horizontal axis is the real part and the vertical axis is the imaginary part.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>z₁</div>
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Point ({fmt(result.z1.re)}, {fmt(result.z1.im)})</div>
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Magnitude = {fmt(result.mag1)}</div>
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>z₂</div>
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Point ({fmt(result.z2.re)}, {fmt(result.z2.im)})</div>
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Magnitude = {fmt(result.mag2)}</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>(3 + 4i) + (1 + 2i) = 4 + 6i</b></div>
                    <div><b>(3 + 4i)(1 + 2i) = -5 + 10i</b></div>
                    <div><b>|3 + 4i| = 5</b></div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Complex numbers are used in algebra, signal processing, electrical engineering, control systems, physics, and quantum mechanics. This calculator introduces them in a simple coordinate-style way so learners can understand both the idea and the arithmetic.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is i?', a: 'i is the imaginary unit, defined by i² = -1.' },
                { q: 'Why do we need complex numbers?', a: 'They help solve equations like x² + 1 = 0, which have no real-number solutions.' },
                { q: 'What is magnitude?', a: 'Magnitude is the distance of the complex number from the origin on the complex plane.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
