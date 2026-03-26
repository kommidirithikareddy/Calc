import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const PI = Math.PI
const fmt = (n, d = 10) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)) || !Number.isFinite(Number(n))) return '—'
    return parseFloat(Number(n).toFixed(d)).toString()
}
const degToRad = deg => (deg * PI) / 180
const radToDeg = rad => (rad * 180) / PI

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

export default function AngleConverterCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [mode, setMode] = useState('deg-to-rad')
    const [value, setValue] = useState('180')

    const result = useMemo(() => {
        const v = Number(value)
        if (Number.isNaN(v)) return { valid: false }
        return mode === 'deg-to-rad'
            ? { valid: true, input: v, output: degToRad(v), from: 'degrees', to: 'radians' }
            : { valid: true, input: v, output: radToDeg(v), from: 'radians', to: 'degrees' }
    }, [mode, value])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Radians = Degrees × π / 180</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Degrees = Radians × 180 / π</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>Use these two formulas to convert between degrees and radians.</div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Angle Conversion Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Conversion mode</label>
                            <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="deg-to-rad">Degrees to Radians</option>
                                <option value="rad-to-deg">Radians to Degrees</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Enter value</label>
                            <input value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Converted Value</div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, marginTop: 10 }}>{fmt(result.output)}</div>
                                <div style={{ fontSize: 14, marginTop: 8 }}>{result.to}</div>
                            </div>
                            <AIHintCard hint={`${fmt(result.input)} ${result.from} equals ${fmt(result.output)} ${result.to}.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>Enter a valid angle.</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Step-by-Step Conversion" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Start with the input</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.input)} {result.from}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Apply the correct formula</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{mode === 'deg-to-rad' ? 'Multiply by π/180' : 'Multiply by 180/π'}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Final result</div>
                            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: 'var(--text-2)' }}>{fmt(result.output)} {result.to}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Common Conversions" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>180° = π rad</b></div>
                    <div><b>90° = π/2 rad</b></div>
                    <div><b>45° = π/4 rad</b></div>
                    <div><b>2π rad = 360°</b></div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Degrees are common in school geometry and daily use. Radians are the natural unit in higher mathematics, physics, and calculus. Students should be comfortable switching between both.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is a radian?', a: 'A radian is an angle measure based on the circle radius. A full circle is 2π radians.' },
                { q: 'Why do mathematicians like radians?', a: 'Because many formulas in calculus and trigonometry become simpler and more natural in radians.' },
                { q: 'Do calculators use radians or degrees?', a: 'It depends on the mode. Many scientific calculators let you choose.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
