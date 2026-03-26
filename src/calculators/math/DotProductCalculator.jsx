import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'

export default function DotProductCalculator() {
    const [a, setA] = useState(['1', '2', '3'])
    const [b, setB] = useState(['4', '5', '6'])

    const result = useMemo(() => {
        const A = a.map(Number); const B = b.map(Number)
        return A.reduce((sum, v, i) => sum + v * B[i], 0)
    }, [a, b])

    return (
        <CalcShell
            left={<>
                {a.map((v, i) => (<input key={i} value={v} onChange={e => { const n = [...a]; n[i] = e.target.value; setA(n) }} />))}
                {b.map((v, i) => (<input key={i} value={v} onChange={e => { const n = [...b]; n[i] = e.target.value; setB(n) }} />))}
            </>}
            right={<div>Dot Product = {result}</div>}
        />
    )
}
