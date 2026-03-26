import { useMemo, useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'

export default function VectorMagnitudeCalculator() {
    const [v, setV] = useState(['3', '4', '0'])

    const result = useMemo(() => {
        const arr = v.map(Number)
        const mag = Math.sqrt(arr.reduce((s, x) => s + x * x, 0))
        const unit = arr.map(x => mag === 0 ? 0 : x / mag)
        return { mag, unit }
    }, [v])

    return (
        <CalcShell
            left={<>
                {v.map((val, i) => (<input key={i} value={val} onChange={e => { const n = [...v]; n[i] = e.target.value; setV(n) }} />))}
            </>}
            right={<div>
                Magnitude = {result.mag}
                <br />
                Unit Vector = [{result.unit.map(n => n.toFixed(3)).join(', ')}]
            </div>}
        />
    )
}
