import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const ACTIVITY_LEVELS = [
  { label: 'Sedentary',       desc: 'Little or no exercise',          factor: 1.2   },
  { label: 'Lightly Active',  desc: 'Exercise 1-3 days/week',         factor: 1.375 },
  { label: 'Moderately Active',desc: 'Exercise 3-5 days/week',        factor: 1.55  },
  { label: 'Very Active',     desc: 'Hard exercise 6-7 days/week',    factor: 1.725 },
  { label: 'Extra Active',    desc: 'Very hard exercise + physical job', factor: 1.9 },
]

const GOALS = [
  { label: 'Lose Weight Fast', delta: -500, color: '#ef4444' },
  { label: 'Lose Weight',      delta: -250, color: '#f97316' },
  { label: 'Maintain',         delta: 0,    color: '#10b981' },
  { label: 'Gain Muscle',      delta: 250,  color: '#3b82f6' },
  { label: 'Gain Fast',        delta: 500,  color: '#6366f1' },
]

export default function TDEECalculator() {
  const [age,      setAge]      = useState(28)
  const [sex,      setSex]      = useState('male')
  const [weight,   setWeight]   = useState(75)   // kg
  const [height,   setHeight]   = useState(175)  // cm
  const [actIdx,   setActIdx]   = useState(1)
  const [unit,     setUnit]     = useState('metric')

  // Convert if imperial
  const wKg = unit === 'metric' ? weight : weight * 0.453592
  const hCm = unit === 'metric' ? height : height * 2.54

  // Mifflin-St Jeor BMR
  const bmr = sex === 'male'
    ? 10 * wKg + 6.25 * hCm - 5 * age + 5
    : 10 * wKg + 6.25 * hCm - 5 * age - 161

  const tdee = bmr * ACTIVITY_LEVELS[actIdx].factor

  const hint = `Your TDEE is ${Math.round(tdee)} calories/day. To lose 0.5 kg/week, eat ${Math.round(tdee - 500)} cal/day. To gain muscle, eat ${Math.round(tdee + 250)} cal/day. Your BMR (at complete rest) is ${Math.round(bmr)} cal.`

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Your Details</div>

          {/* Units */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Units</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['metric','imperial'].map(u => (
                <button key={u} onClick={() => setUnit(u)} style={{ padding: '7px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: '1.5px solid', borderColor: unit===u ? '#10b981' : 'var(--border)', background: unit===u ? '#10b981' : 'var(--bg-raised)', color: unit===u ? '#fff' : 'var(--text-2)', cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize' }}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Sex */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Sex</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['male','female'].map(s => (
                <button key={s} onClick={() => setSex(s)} style={{ padding: '7px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: '1.5px solid', borderColor: sex===s ? '#10b981' : 'var(--border)', background: sex===s ? '#10b981' : 'var(--bg-raised)', color: sex===s ? '#fff' : 'var(--text-2)', cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric fields */}
          {[
            { label: 'Age', val: age, set: setAge, min: 15, max: 100, suffix: 'yrs' },
            { label: unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)', val: weight, set: setWeight, min: 30, max: 300, suffix: unit==='metric'?'kg':'lbs' },
            { label: unit === 'metric' ? 'Height (cm)' : 'Height (in)',  val: height, set: setHeight, min: 100, max: 250, suffix: unit==='metric'?'cm':'in' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '7px' }}>{f.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={f.val} min={f.min} max={f.max} onChange={e => f.set(+e.target.value)}
                  style={{ width: '110px', border: '1.5px solid var(--border)', borderRadius: '9px', padding: '9px 12px', fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{f.suffix}</span>
              </div>
            </div>
          ))}

          {/* Activity level */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '9px' }}>Activity Level</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ACTIVITY_LEVELS.map((a, i) => (
                <button key={a.label} onClick={() => setActIdx(i)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 13px', borderRadius: '9px',
                  border: '1.5px solid', borderColor: actIdx===i ? '#10b981' : 'var(--border)',
                  background: actIdx===i ? '#d1fae5' : 'var(--bg-raised)',
                  cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'left',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: actIdx===i ? '#10b981' : 'var(--border-2)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: actIdx===i ? '#059669' : 'var(--text)' }}>{a.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{a.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-3)' }}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>

          <FormulaCard
            formula={`BMR (male)   = 10×W + 6.25×H − 5×A + 5\nBMR (female) = 10×W + 6.25×H − 5×A − 161\nTDEE = BMR × Activity Factor`}
            variables={[
              { symbol: 'W', meaning: 'Weight in kg' },
              { symbol: 'H', meaning: 'Height in cm' },
              { symbol: 'A', meaning: 'Age in years' },
            ]}
            explanation="TDEE (Total Daily Energy Expenditure) is the total calories you burn each day including exercise and daily activity. It starts with BMR (Basal Metabolic Rate — calories burned at rest) and multiplies by an activity factor. Eat at your TDEE to maintain weight, below to lose, above to gain."
          />
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          <ResultHero label="Daily TDEE" value={Math.round(tdee)} formatter={n => n.toLocaleString() + ' cal'} sub={`BMR: ${Math.round(bmr)} cal · Activity: ×${ACTIVITY_LEVELS[actIdx].factor}`} color="#10b981" />

          <BreakdownTable title="Calorie Targets by Goal" rows={
            GOALS.map(g => ({ label: g.label, value: Math.round(tdee + g.delta).toLocaleString() + ' cal', color: g.color, bold: g.delta === 0, highlight: g.delta === 0 }))
          } />

          {/* Macro suggestions at maintenance */}
          <BreakdownTable title="Suggested Macros (Maintenance)" rows={[
            { label: 'Protein (25%)',     value: Math.round(tdee * 0.25 / 4) + 'g',  color: '#3b82f6' },
            { label: 'Carbohydrates (45%)',value: Math.round(tdee * 0.45 / 4) + 'g', color: '#f59e0b' },
            { label: 'Fat (30%)',          value: Math.round(tdee * 0.30 / 9) + 'g', color: '#10b981' },
          ]} />

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
