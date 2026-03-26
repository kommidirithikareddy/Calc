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

function buildPoints(a, b, c, xMin, xMax, step) {
    const pts = []
    for (let x = xMin; x <= xMax + 1e-9; x += step) {
        const y = a * x * x + b * x + c
        pts.push({ x, y })
    }
    return pts
}

export default function GraphingCalculator({ category }) {
    const C = category?.color || '#7c3aed'
    const [a, setA] = useState('1')
    const [b, setB] = useState('-2')
    const [c, setC] = useState('-3')
    const [xMin, setXMin] = useState('-5')
    const [xMax, setXMax] = useState('5')

    const result = useMemo(() => {
        const A = Number(a), B = Number(b), CC = Number(c), xmin = Number(xMin), xmax = Number(xMax)
        if ([A, B, CC, xmin, xmax].some(v => Number.isNaN(v))) return { valid: false }
        if (xmin >= xmax) return { valid: false, message: 'x-min must be less than x-max.' }

        const points = buildPoints(A, B, CC, xmin, xmax, (xmax - xmin) / 20)
        const yIntercept = CC
        const vertexX = A !== 0 ? -B / (2 * A) : null
        const vertexY = A !== 0 ? A * vertexX * vertexX + B * vertexX + CC : null
        const D = B * B - 4 * A * CC
        let roots = []
        if (A !== 0 && D >= 0) {
            roots = [(-B + Math.sqrt(D)) / (2 * A), (-B - Math.sqrt(D)) / (2 * A)]
        } else if (A === 0 && B !== 0) {
            roots = [-CC / B]
        }

        const yValues = points.map(p => p.y)
        const yMin = Math.min(...yValues)
        const yMax = Math.max(...yValues)
        return { valid: true, A, B, CC, xmin, xmax, points, yIntercept, vertexX, vertexY, roots, yMin, yMax }
    }, [a, b, c, xMin, xMax])

    const plotW = 520
    const plotH = 260

    const xToPx = x => ((x - result.xmin) / (result.xmax - result.xmin)) * plotW
    const yToPx = y => plotH - ((y - result.yMin) / (result.yMax - result.yMin || 1)) * plotH

    const path = result.valid
        ? result.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(p.x)} ${yToPx(p.y)}`).join(' ')
        : ''

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Card title="Formula Card" color={C}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>y = ax² + bx + c</div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-2)' }}>
                    This calculator graphs a quadratic function and helps learners see roots, the y-intercept, and the vertex.
                </div>
            </Card>

            <CalcShell
                left={
                    <>
                        <div className="inputs-title">Quadratic Graph Input</div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>a</label><input value={a} onChange={e => setA(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>b</label><input value={b} onChange={e => setB(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>c</label><input value={c} onChange={e => setC(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>x-min</label><input value={xMin} onChange={e => setXMin(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>x-max</label><input value={xMax} onChange={e => setXMax(e.target.value)} style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)', background: 'var(--bg)' }} /></div>
                        </div>
                    </>
                }
                right={
                    result.valid ? (
                        <>
                            <div style={{ background: `linear-gradient(135deg, ${C}, #2563eb)`, color: '#fff', borderRadius: 16, padding: 22 }}>
                                <div style={{ fontSize: 11, opacity: .75, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Key Features</div>
                                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.9 }}>
                                    y-intercept = {fmt(result.yIntercept)}<br />
                                    vertex = {result.vertexX !== null ? `(${fmt(result.vertexX)}, ${fmt(result.vertexY)})` : '—'}<br />
                                    roots = {result.roots.length ? result.roots.map(v => fmt(v)).join(', ') : 'No real roots'}
                                </div>
                            </div>
                            <AIHintCard hint={`This graph shows how changing a, b, and c changes the shape and position of the parabola.`} />
                        </>
                    ) : <Card title="Output"><div style={{ color: 'var(--text-3)' }}>{result.message || 'Enter valid values.'}</div></Card>
                }
            />

            {result.valid ? (
                <Card title="Graph Visualization" color={C}>
                    <div style={{ overflowX: 'auto' }}>
                        <svg width={plotW} height={plotH} viewBox={`0 0 ${plotW} ${plotH}`} style={{ maxWidth: '100%', borderRadius: 16, background: 'var(--bg)' }}>
                            <line x1="0" y1={result.yMin <= 0 && result.yMax >= 0 ? yToPx(0) : plotH} x2={plotW} y2={result.yMin <= 0 && result.yMax >= 0 ? yToPx(0) : plotH} stroke="currentColor" opacity="0.2" />
                            <line x1={result.xmin <= 0 && result.xmax >= 0 ? xToPx(0) : 0} y1="0" x2={result.xmin <= 0 && result.xmax >= 0 ? xToPx(0) : 0} y2={plotH} stroke="currentColor" opacity="0.2" />
                            <path d={path} fill="none" stroke="currentColor" strokeWidth="3" />
                            {result.roots.map((root, i) => (
                                <circle key={i} cx={xToPx(root)} cy={result.yMin <= 0 && result.yMax >= 0 ? yToPx(0) : plotH} r="4" fill="currentColor" />
                            ))}
                            {result.vertexX !== null ? <circle cx={xToPx(result.vertexX)} cy={yToPx(result.vertexY)} r="4.5" fill="currentColor" /> : null}
                        </svg>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>
                        The curve is sampled from x = {fmt(result.xmin)} to x = {fmt(result.xmax)}.
                    </div>
                </Card>
            ) : null}

            {result.valid ? (
                <Card title="Step-by-Step Interpretation" color={C}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>y-intercept</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Set x = 0, so y = c = {fmt(result.yIntercept)}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Vertex</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.vertexX !== null ? `x = -b / 2a = ${fmt(result.vertexX)}, and y = ${fmt(result.vertexY)}` : 'A linear expression has no parabola vertex.'}</div>
                        </div>
                        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Roots</div>
                            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{result.roots.length ? `The graph crosses the x-axis at x = ${result.roots.map(v => fmt(v)).join(' and ')}` : 'This graph has no real x-intercepts in the real plane.'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            <Card title="Examples" color={C}>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                    <div><b>y = x² - 2x - 3</b> has roots 3 and -1</div>
                    <div><b>y = x²</b> has vertex at (0, 0)</div>
                    <div><b>y = -x² + 4</b> opens downward because a is negative</div>
                </div>
            </Card>

            <Card title="Explanation" color={C}>
                <div style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-2)' }}>
                    Graphing helps students move from equations to visual thinking. This calculator focuses on quadratics because they are one of the most important graph families in school algebra and early higher mathematics.
                </div>
            </Card>

            <FAQ items={[
                { q: 'What does a do in a quadratic?', a: 'It controls whether the parabola opens upward or downward and how wide or narrow it is.' },
                { q: 'What is the vertex?', a: 'The vertex is the turning point of the parabola.' },
                { q: 'What are roots?', a: 'Roots are the x-values where the graph touches or crosses the x-axis.' },
            ]} />

            <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </div>
    )
}
