import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n, d = 6) => {
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

function Field({ label, value, onChange, placeholder }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{label}</label>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                inputMode="decimal"
                style={{
                    width: '100%',
                    border: '1.5px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: 'var(--text)',
                    background: 'var(--bg)'
                }}
            />
        </div>
    )
}

function FormulaCard({ formula, meaning }) {
    return (
        <Card title="Formula Card">
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{formula}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>{meaning}</div>
        </Card>
    )
}

function ResultHero({ title, value, subtitle, color = '#7c3aed' }) {
    return (
        <div style={{ background: `linear-gradient(135deg, ${color}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>{title}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, lineHeight: 1.1, margin: '8px 0' }}>{value}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{subtitle}</div>
        </div>
    )
}

function StepList({ steps }) {
    return (
        <Card title="Step-by-Step Solution">
            <div style={{ display: 'grid', gap: 12 }}>
                {steps.map((s, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Step {i + 1}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, color: 'var(--text-2)' }}>{s.math}</div>
                        {s.note ? <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)' }}>{s.note}</div> : null}
                    </div>
                ))}
            </div>
        </Card>
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

export default function LinearEquationCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('2')
    const [b, setB] = useState('3')
    const [c, setC] = useState('11')

    const result = useMemo(() => {
        const A = Number(a)
        const B = Number(b)
        const CC = Number(c)
        if ([A, B, CC].some(v => Number.isNaN(v))) {
            return { valid: false, message: 'Enter valid numbers.' }
        }
        if (A === 0) {
            if (B === CC) return { valid: true, special: true, answer: 'Infinite solutions', subtitle: 'Both sides are the same.' }
            return { valid: true, special: true, answer: 'No solution', subtitle: 'A constant cannot equal a different constant.' }
        }
        const x = (CC - B) / A
        return {
            valid: true,
            x,
            answer: `x = ${fmt(x)}`,
            subtitle: `For ${fmt(A)}x + ${fmt(B)} = ${fmt(CC)}`,
            steps: [
                { label: 'Start with the equation', math: `${fmt(A)}x + ${fmt(B)} = ${fmt(CC)}` },
                { label: 'Move the constant term to the other side', math: `${fmt(A)}x = ${fmt(CC)} - ${fmt(B)} = ${fmt(CC - B)}` },
                { label: 'Divide both sides by the coefficient of x', math: `x = ${fmt(CC - B)} / ${fmt(A)} = ${fmt(x)}` },
                { label: 'Check the answer', math: `${fmt(A)}(${fmt(x)}) + ${fmt(B)} = ${fmt(A * x + B)}`, note: `${fmt(A * x + B)} matches the right side.` },
            ],
        }
    }, [a, b, c])

    const equationText = `${a || 'a'}x + ${b || 'b'} = ${c || 'c'}`

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <FormulaCard formula="ax + b = c" meaning="To solve a linear equation, isolate x. First move the constant term, then divide by the coefficient of x." />

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Enter Coefficients</div>
                        <Field label="a (coefficient of x)" value={a} onChange={setA} placeholder="Example: 2" />
                        <Field label="b (constant on left side)" value={b} onChange={setB} placeholder="Example: 3" />
                        <Field label="c (right side)" value={c} onChange={setC} placeholder="Example: 11" />
                        <Card title="Equation Preview" color={C}>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{equationText}</div>
                            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>
                                This solver handles equations of the form <b>ax + b = c</b>.
                            </div>
                        </Card>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <ResultHero title="Solution" value={result.answer} subtitle={result.subtitle} color={C} />
                            <AIHintCard hint={result.special ? result.subtitle : `Solve by moving ${fmt(Number(b))} to the right side and dividing by ${fmt(Number(a))}.`} />
                        </>
                    ) : (
                        <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message}</div></Card>
                    )
                }
            />

            {result.valid && !result.special ? <StepList steps={result.steps} /> : null}

            <Card title="Visual Understanding" color={C}>
                <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                        Think of the equation as a balance scale. Whatever you do to one side, you must do to the other side. That keeps the equation balanced.
                    </div>
                    <div style={{ border: '1px dashed var(--border)', borderRadius: 16, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', marginBottom: 8 }}>LEFT SIDE</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{a}x + {b}</div>
                            </div>
                            <div style={{ fontSize: 26, color: 'var(--text-3)', fontWeight: 800 }}>=</div>
                            <div style={{ flex: 1, minWidth: 220, textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-3)', marginBottom: 8 }}>RIGHT SIDE</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{c}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>Example 1:</b> 2x + 3 = 11 → 2x = 8 → x = 4</div>
                    <div><b>Example 2:</b> 5x - 10 = 20 → 5x = 30 → x = 6</div>
                    <div><b>Example 3:</b> -3x + 9 = 0 → -3x = -9 → x = 3</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    A linear equation is one where the variable has power 1 only. The goal is to isolate the unknown. This calculator is useful for school algebra, quick homework checks, interview prep, and anyone learning how equations work step by step.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What is a linear equation?', a: 'It is an equation in which the variable is raised only to the first power, such as 2x + 3 = 11.' },
                { q: 'Why do we move b to the other side?', a: 'Because we want x by itself. Subtracting b from both sides keeps the equation balanced.' },
                { q: 'What if a = 0?', a: 'Then the equation is no longer a standard linear equation in x. It may have no solution or infinitely many solutions.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
