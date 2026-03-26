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

export default function LaplaceTransformCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [fn, setFn] = useState('1')
    const [a, setA] = useState('2')
    const [n, setN] = useState('2')

    const result = useMemo(() => {
        const A = Number(a)
        const N = Math.max(0, Math.floor(Number(n)))

        const map = {
            '1': { f: '1', F: '1 / s', rule: 'L{1} = 1/s' },
            't': { f: 't', F: '1 / s²', rule: 'L{t} = 1/s²' },
            't^n': { f: `t^${N}`, F: `${factorial(N)} / s^${N + 1}`, rule: 'L{t^n} = n! / s^(n+1)' },
            'e^(at)': { f: `e^(${A}t)`, F: `1 / (s - ${A})`, rule: 'L{e^(at)} = 1/(s-a)' },
            'sin(at)': { f: `sin(${A}t)`, F: `${A} / (s² + ${A * A})`, rule: 'L{sin(at)} = a/(s²+a²)' },
            'cos(at)': { f: `cos(${A}t)`, F: `s / (s² + ${A * A})`, rule: 'L{cos(at)} = s/(s²+a²)' },
            'sinh(at)': { f: `sinh(${A}t)`, F: `${A} / (s² - ${A * A})`, rule: 'L{sinh(at)} = a/(s²-a²)' },
            'cosh(at)': { f: `cosh(${A}t)`, F: `s / (s² - ${A * A})`, rule: 'L{cosh(at)} = s/(s²-a²)' },
        }

        return { valid: true, ...map[fn], A, N }
    }, [fn, a, n])

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>L{`{f(t)}`} = ∫₀^∞ e^(-st) f(t) dt</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    The Laplace transform changes a time-domain function into an s-domain expression.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Function Input</div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Choose function</label>
                            <select value={fn} onChange={e => setFn(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }}>
                                <option value="1">1</option>
                                <option value="t">t</option>
                                <option value="t^n">t^n</option>
                                <option value="e^(at)">e^(at)</option>
                                <option value="sin(at)">sin(at)</option>
                                <option value="cos(at)">cos(at)</option>
                                <option value="sinh(at)">sinh(at)</option>
                                <option value="cosh(at)">cosh(at)</option>
                            </select>
                        </div>
                        {(fn === 'e^(at)' || fn === 'sin(at)' || fn === 'cos(at)' || fn === 'sinh(at)' || fn === 'cosh(at)') ? (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>a</label>
                                <input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} />
                            </div>
                        ) : null}
                        {fn === 't^n' ? (
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
                            <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Laplace Transform</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginTop: 10 }}>L{`{${result.f}}`} = {result.F}</div>
                        </div>
                        <AIHintCard hint={result.rule} />
                    </>
                }
            />

            <Card title="Step-by-Step Understanding" color={C}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Choose the standard form</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Recognize the function as one of the common Laplace transform patterns.</div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Apply the standard rule</div>
                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.rule}</div>
                    </div>
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>L{`{1}`}</b> = 1/s</div>
                    <div><b>L{`{e^(2t)}`}</b> = 1/(s−2)</div>
                    <div><b>L{`{sin(3t)}`}</b> = 3/(s²+9)</div>
                    <div><b>L{`{t²}`}</b> = 2/s³</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Laplace transforms are used to solve differential equations, analyze circuits, process signals, and simplify systems problems by turning derivatives into algebraic expressions in the s-domain.
                </div>
            </Card>

            <FAQ items={[
                { q: 'Why is the Laplace transform useful?', a: 'It converts difficult differential equations into easier algebraic equations.' },
                { q: 'What is the s-domain?', a: 'It is the transformed domain used in Laplace analysis.' },
                { q: 'Do I need to integrate by hand every time?', a: 'Usually no. Most classroom work uses standard transform tables and rules.' },
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
