import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

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

export default function InverseLaplaceTransformCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [form, setForm] = useState('1/s')
    const [a, setA] = useState('2')
    const [n, setN] = useState('2')

    const result = useMemo(() => {
        const A = Number(a)
        const N = Math.max(1, Math.floor(Number(n)))

        const map = {
            '1/s': { F: '1 / s', f: '1', rule: 'L⁻¹{1/s} = 1' },
            '1/s^n': { F: `1 / s^${N}`, f: `t^${N - 1} / ${(factorial(N - 1))}`, rule: 'L⁻¹{1/s^n} = t^(n-1)/(n-1)!' },
            '1/(s-a)': { F: `1 / (s - ${A})`, f: `e^(${A}t)`, rule: 'L⁻¹{1/(s-a)} = e^(at)' },
            'a/(s^2+a^2)': { F: `${A} / (s² + ${A * A})`, f: `sin(${A}t)`, rule: 'L⁻¹{a/(s²+a²)} = sin(at)' },
            's/(s^2+a^2)': { F: `s / (s² + ${A * A})`, f: `cos(${A}t)`, rule: 'L⁻¹{s/(s²+a²)} = cos(at)' },
            'a/(s^2-a^2)': { F: `${A} / (s² - ${A * A})`, f: `sinh(${A}t)`, rule: 'L⁻¹{a/(s²-a²)} = sinh(at)' },
            's/(s^2-a^2)': { F: `s / (s² - ${A * A})`, f: `cosh(${A}t)`, rule: 'L⁻¹{s/(s²-a²)} = cosh(at)' },
        }

        return { valid: true, ...map[form], A, N }
    }, [form, a, n])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>L⁻¹{`{F(s)}`} = f(t)</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The inverse Laplace transform converts an s-domain expression back into a time-domain function.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">s-Domain Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Choose expression</label>
                            <select value={form} onChange={e => setForm(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="1/s">1/s</option>
                                <option value="1/s^n">1/s^n</option>
                                <option value="1/(s-a)">1/(s-a)</option>
                                <option value="a/(s^2+a^2)">a/(s²+a²)</option>
                                <option value="s/(s^2+a^2)">s/(s²+a²)</option>
                                <option value="a/(s^2-a^2)">a/(s²-a²)</option>
                                <option value="s/(s^2-a^2)">s/(s²-a²)</option>
                            </select>
                        </div>
                        {(form === '1/(s-a)' || form === 'a/(s^2+a^2)' || form === 's/(s^2+a^2)' || form === 'a/(s^2-a^2)' || form === 's/(s^2-a^2)') ? (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>a</label>
                                <input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            </div>
                        ) : null}
                        {form === '1/s^n' ? (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>n</label>
                                <input value={n} onChange={e => setN(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            </div>
                        ) : null}
                    </>
                }
                right={
                    <>
                        <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                            <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Inverse Laplace</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 10 }}>L⁻¹{`{${result.F}}`} = {result.f}</div>
                        </div>
                        <AIHintCard hint={result.rule} />
                    </>
                }
            />

            <Card title="Step-by-Step Understanding" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Recognize the standard pattern</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Match the s-domain expression to a common inverse Laplace table entry.</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Apply the inverse rule</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.rule}</div>
                    </div>
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>L⁻¹{`{1/s}`}</b> = 1</div>
                    <div><b>L⁻¹{`{1/(s-2)}`}</b> = e^(2t)</div>
                    <div><b>L⁻¹{`{3/(s²+9)}`}</b> = sin(3t)</div>
                    <div><b>L⁻¹{`{s/(s²+9)}`}</b> = cos(3t)</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Inverse Laplace transforms are essential when solving ODEs in the Laplace domain. Once the algebra is done in s, inverse Laplace brings the answer back to time t.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why use inverse Laplace?', a: 'Because after solving an equation in the s-domain, you need to return to the original time-domain function.' },
                { q: 'Is inverse Laplace just table matching?', a: 'Very often in coursework and engineering practice, yes—plus algebraic simplification like partial fractions.' },
                { q: 'What is the connection to ODEs?', a: 'Laplace turns differential equations into algebraic equations, and inverse Laplace brings the solution back.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}

function factorial(n) {
    let r = 1
    for (let i = 2; i <= n; i++) r *= i
    return r
}
