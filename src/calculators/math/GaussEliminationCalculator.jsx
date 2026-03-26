import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => (Number.isFinite(n) ? Number(n.toFixed(6)) : '—')

function Card({ title, children }) {
    return <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>{children}</div>
}

export default function GaussEliminationCalculator() {
    const [a, setA] = useState('1'); const [b, setB] = useState('1'); const [c, setC] = useState('2')
    const [d, setD] = useState('2'); const [e, setE] = useState('3'); const [f, setF] = useState('5')

    const result = useMemo(() => {
        const A = +a, B = +b, C = +c, D = +d, E = +e, F = +f
        const det = A * E - B * D
        if (det === 0) return { valid: false }
        const x = (C * E - B * F) / det
        const y = (A * F - C * D) / det
        return { valid: true, x, y }
    }, [a, b, c, d, e, f])

    return (
        <div>
            <CalcShell
                left={<>
                    <input value={a} onChange={e => setA(e.target.value)} />
                    <input value={b} onChange={e => setB(e.target.value)} />
                    <input value={c} onChange={e => setC(e.target.value)} />
                    <input value={d} onChange={e => setD(e.target.value)} />
                    <input value={e} onChange={e => setE(e.target.value)} />
                    <input value={f} onChange={e => setF(e.target.value)} />
                </>}
                right={<div>
                    {result.valid ? `x=${fmt(result.x)}, y=${fmt(result.y)}` : 'No unique solution'}
                </div>}
            />
        </div>
    )
}
