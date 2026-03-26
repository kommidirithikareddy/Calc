import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'

export default function CrossProductCalculator() {
    const [a, setA] = useState(['1', '2', '3'])
    const [b, setB] = useState(['4', '5', '6'])

    const result = useMemo(() => {
        const A = a.map(Number); const B = b.map(Number)
        return [
            A[1] * B[2] - A[2] * B[1],
            A[2] * B[0] - A[0] * B[2],
            A[0] * B[1] - A[1] * B[0]
        ]
    }, [a, b])

    return (
        <CalcShell
            left={<>
                {a.map((v, i) => (<input key={i} value={v} onChange={e => { const n = [...a]; n[i] = e.target.value; setA(n) }} />))}
                {b.map((v, i) => (<input key={i} value={v} onChange={e => { const n = [...b]; n[i] = e.target.value; setB(n) }} />))}
            </>}
            right={<div>Cross Product = [{result.join(', ')}]</div>}
        />
    )
}
