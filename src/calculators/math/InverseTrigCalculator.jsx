import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const PI = Math.PI
const fmt = (n, d = 8) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}
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

export default function InverseTrigCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [fn, setFn] = useState('asin')
    const [value, setValue] = useState('0.5')

    const result = useMemo(() => {
        const v = Number(value)
        if (Number.isNaN(v)) return { valid: false, message: 'Enter a valid number.' }

        if ((fn === 'asin' || fn === 'acos') && (v < -1 || v > 1)) {
            return { valid: false, message: 'For arcsin and arccos, input must be between -1 and 1.' }
        }

        const rad = fn === 'asin' ? Math.asin(v) : fn === 'acos' ? Math.acos(v) : Math.atan(v)
        return { valid: true, v, rad, deg: toDeg(rad) }
    }, [fn, value])

    const fnLabel = fn === 'asin' ? 'sin⁻¹' : fn === 'acos' ? 'cos⁻¹' : 'tan⁻¹'

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{fnLabel}(x)</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    Inverse trigonometric functions work backward. Instead of giving an angle and asking for a trig value, they give a trig value and ask for the angle.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Inverse Trig Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Function</label>
                            <select value={fn} onChange={e => setFn(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="asin">arcsin / sin⁻¹</option>
                                <option value="acos">arccos / cos⁻¹</option>
                                <option value="atan">arctan / tan⁻¹</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Input value</label>
                            <input value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Angle Output</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, marginTop: 10 }}>{fmt(result.deg)}°</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>{fmt(result.rad)} rad</div>
                            </div>
                            <AIHintCard hint={`${fnLabel}(${fmt(result.v)}) gives an angle of ${fmt(result.deg)}°.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Understanding the Result" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Backward thinking</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>You entered a trig value, and the calculator returned the angle that creates that value.</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Angle in two units</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.deg)}° = {fmt(result.rad)} radians</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Common Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>sin⁻¹(0.5) = 30°</b></div>
                    <div><b>cos⁻¹(0.5) = 60°</b></div>
                    <div><b>tan⁻¹(1) = 45°</b></div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Inverse trig functions are useful when you know side ratios and need the angle. They are used in triangles, navigation, slope calculations, engineering, and advanced calculus.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why is arcsin limited to -1 to 1?', a: 'Because sine values in real numbers can never go below -1 or above 1.' },
                { q: 'Why do inverse trig functions give one main angle?', a: 'Because calculators return the principal value, which is the standard chosen answer.' },
                { q: 'Can more than one angle have the same sine?', a: 'Yes. But inverse trig returns the main reference answer.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}