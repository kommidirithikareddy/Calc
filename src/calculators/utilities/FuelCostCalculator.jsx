import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import SliderInput from '../../components/calculator/SliderInput'

const fmt2 = n => '$' + Math.max(0,n).toFixed(2)
const fmt  = n => '$' + Math.round(Math.max(0,n)).toLocaleString()

export default function FuelCostCalculator() {
  const [unit,      setUnit]      = useState('imperial') // imperial | metric
  const [distance,  setDistance]  = useState(300)
  const [economy,   setEconomy]   = useState(30)   // mpg or L/100km
  const [fuelPrice, setFuelPrice] = useState(3.50) // per gallon or per litre

  // Calculate
  let fuelUsed, cost
  if (unit === 'imperial') {
    fuelUsed = distance / economy          // gallons
    cost     = fuelUsed * fuelPrice
  } else {
    fuelUsed = (economy / 100) * distance  // litres
    cost     = fuelUsed * fuelPrice
  }

  const costPerMile = unit === 'imperial' ? cost / distance : cost / distance
  const annualCost  = cost * (15000 / distance)  // assume 15k miles/yr

  const hint = `Your ${distance} ${unit==='imperial'?'mile':'km'} trip uses ${fuelUsed.toFixed(1)} ${unit==='imperial'?'gallons':'litres'} of fuel costing ${fmt2(cost)}. That's ${fmt2(costPerMile)} per ${unit==='imperial'?'mile':'km'}.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Trip Details</div>

          {/* Unit toggle */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Units</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[{val:'imperial',label:'Miles / MPG / $/gal'},{val:'metric',label:'Km / L/100km / $/L'}].map(u => (
                <button key={u.val} onClick={() => setUnit(u.val)} style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                  border: '1.5px solid', borderColor: unit===u.val ? '#ec4899' : 'var(--border)',
                  background: unit===u.val ? '#ec4899' : 'var(--bg-raised)',
                  color: unit===u.val ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'DM Sans',
                }}>{u.label}</button>
              ))}
            </div>
          </div>

          <SliderInput label={`Distance (${unit==='imperial'?'miles':'km'})`} hint="Trip distance"
            value={distance} min={1} max={5000} step={10} suffix={unit==='imperial'?'mi':'km'} onChange={setDistance} />

          <SliderInput
            label={unit==='imperial' ? 'Fuel Economy (MPG)' : 'Fuel Economy (L/100km)'}
            hint="Vehicle efficiency"
            value={economy} min={unit==='imperial'?5:3} max={unit==='imperial'?60:20} step={0.5}
            suffix={unit==='imperial'?'mpg':'L/100'} onChange={setEconomy} />

          <SliderInput
            label={`Fuel Price (per ${unit==='imperial'?'gallon':'litre'})`}
            hint="Current pump price"
            value={fuelPrice} min={0.5} max={unit==='imperial'?8:3} step={0.01}
            prefix="$" onChange={setFuelPrice} />

          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Trip Fuel Cost" value={Math.round(cost * 100) / 100} formatter={fmt2} sub={`${distance} ${unit==='imperial'?'miles':'km'} · ${fuelUsed.toFixed(1)} ${unit==='imperial'?'gal':'L'} used`} color="#ec4899" />

          <BreakdownTable title="Trip Breakdown" rows={[
            { label: 'Distance',         value: `${distance} ${unit==='imperial'?'miles':'km'}` },
            { label: 'Fuel Used',        value: `${fuelUsed.toFixed(2)} ${unit==='imperial'?'gallons':'litres'}` },
            { label: 'Fuel Price',       value: `${fmt2(fuelPrice)}/${unit==='imperial'?'gal':'L'}` },
            { label: 'Total Cost',       value: fmt2(cost), color: '#ec4899', bold: true, highlight: true },
            { label: `Cost per ${unit==='imperial'?'Mile':'Km'}`, value: fmt2(costPerMile) },
            { label: 'Est. Annual Cost', value: fmt(annualCost), color: '#f97316' },
          ]} />

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
