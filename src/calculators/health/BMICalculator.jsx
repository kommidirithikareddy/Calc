import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const BMI_CATEGORIES = [
  { label: 'Severe Thinness',   min: 0,    max: 16,   color: '#3b82f6', bg: '#dbeafe' },
  { label: 'Moderate Thinness', min: 16,   max: 17,   color: '#60a5fa', bg: '#eff6ff' },
  { label: 'Mild Thinness',     min: 17,   max: 18.5, color: '#93c5fd', bg: '#f0f9ff' },
  { label: 'Normal',            min: 18.5, max: 25,   color: '#10b981', bg: '#d1fae5' },
  { label: 'Overweight',        min: 25,   max: 30,   color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Obese Class I',     min: 30,   max: 35,   color: '#f97316', bg: '#ffedd5' },
  { label: 'Obese Class II',    min: 35,   max: 40,   color: '#ef4444', bg: '#fee2e2' },
  { label: 'Obese Class III',   min: 40,   max: Infinity, color: '#b91c1c', bg: '#fee2e2' },
]

function getCategory(bmi) {
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[0]
}

function BMIGauge({ bmi }) {
  // Gauge spans BMI 10–45
  const minBMI = 10, maxBMI = 45
  const clampedBMI = Math.min(maxBMI, Math.max(minBMI, bmi))
  const pct = (clampedBMI - minBMI) / (maxBMI - minBMI)
  const angle = -135 + pct * 270 // -135deg to +135deg
  const cat = getCategory(bmi)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: '160px', height: '90px', overflow: 'hidden' }}>
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background arc segments */}
          {[
            { color: '#3b82f6', start: 0,   end: 0.12 },
            { color: '#60a5fa', start: 0.12, end: 0.18 },
            { color: '#93c5fd', start: 0.18, end: 0.24 },
            { color: '#10b981', start: 0.24, end: 0.44 },
            { color: '#f59e0b', start: 0.44, end: 0.61 },
            { color: '#f97316', start: 0.61, end: 0.72 },
            { color: '#ef4444', start: 0.72, end: 0.83 },
            { color: '#b91c1c', start: 0.83, end: 1   },
          ].map((seg, i) => {
            const startA = (-135 + seg.start * 270) * Math.PI / 180
            const endA   = (-135 + seg.end   * 270) * Math.PI / 180
            const r = 70
            const x1 = 80 + r * Math.cos(startA), y1 = 80 + r * Math.sin(startA)
            const x2 = 80 + r * Math.cos(endA),   y2 = 80 + r * Math.sin(endA)
            const largeArc = seg.end - seg.start > 0.5 ? 1 : 0
            return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke={seg.color} strokeWidth="12" strokeLinecap="round"/>
          })}
          {/* Needle */}
          <g transform={`rotate(${angle}, 80, 80)`}>
            <line x1="80" y1="80" x2="80" y2="18" stroke={cat.color} strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="80" cy="80" r="5" fill={cat.color}/>
          </g>
        </svg>
      </div>

      {/* BMI value + category */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: cat.color, letterSpacing: '-1px', lineHeight: 1 }}>
          {bmi.toFixed(1)}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: cat.color, marginTop: '4px' }}>
          {cat.label}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '3px' }}>
          kg/m²
        </div>
      </div>
    </div>
  )
}

export default function BMICalculator() {
  const [unit, setUnit]     = useState('metric') // 'metric' | 'imperial'
  const [heightCm, setHCm]  = useState(170)
  const [heightFt, setHFt]  = useState(5)
  const [heightIn, setHIn]  = useState(7)
  const [weight, setWeight] = useState(70)
  const [weightLb, setWLb]  = useState(154)
  const [age,    setAge]    = useState(25)
  const [sex,    setSex]    = useState('male')
  const [showResult, setShowResult] = useState(false)

  // Compute BMI
  let bmi = 0
  let heightM = 0
  if (unit === 'metric') {
    heightM = heightCm / 100
    bmi = weight / (heightM * heightM)
  } else {
    const totalIn = heightFt * 12 + heightIn
    bmi = (weightLb / (totalIn * totalIn)) * 703
    heightM = totalIn * 0.0254
  }
  bmi = isNaN(bmi) || !isFinite(bmi) ? 0 : bmi

  const cat = getCategory(bmi)
  const weightKg = unit === 'metric' ? weight : weightLb * 0.453592

  // Healthy weight range for height
  const minHealthy = (18.5 * heightM * heightM).toFixed(1)
  const maxHealthy = (25   * heightM * heightM).toFixed(1)
  const minHealthyLb = (minHealthy * 2.20462).toFixed(1)
  const maxHealthyLb = (maxHealthy * 2.20462).toFixed(1)

  // BMI Prime
  const bmiPrime = (bmi / 25).toFixed(2)

  const hint = bmi > 0
    ? `Your BMI of ${bmi.toFixed(1)} places you in the "${cat.label}" category. A healthy BMI range is 18.5–25. Your healthy weight range for your height is ${unit === 'metric' ? `${minHealthy}–${maxHealthy} kg` : `${minHealthyLb}–${maxHealthyLb} lbs`}.`
    : null

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Enter Your Details</div>

          {/* Unit toggle */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '9px' }}>Units</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['metric','imperial'].map(u => (
                <button key={u} onClick={() => setUnit(u)} style={{
                  padding: '7px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  border: '1.5px solid', borderColor: unit===u ? '#10b981' : 'var(--border)',
                  background: unit===u ? '#10b981' : 'var(--bg-raised)',
                  color: unit===u ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s', textTransform: 'capitalize'
                }}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Age</label>
            <input type="number" value={age} min={2} max={120} onChange={e => setAge(+e.target.value)}
              style={{ width: '90px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
            />
          </div>

          {/* Sex */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '9px' }}>Sex</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['male','female'].map(s => (
                <button key={s} onClick={() => setSex(s)} style={{
                  padding: '7px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  border: '1.5px solid', borderColor: sex===s ? '#10b981' : 'var(--border)',
                  background: sex===s ? '#10b981' : 'var(--bg-raised)',
                  color: sex===s ? '#fff' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s', textTransform: 'capitalize'
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
              Height {unit === 'metric' ? '(cm)' : '(ft / in)'}
            </label>
            {unit === 'metric' ? (
              <input type="number" value={heightCm} min={50} max={250}
                onChange={e => setHCm(+e.target.value)}
                style={{ width: '100px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
              />
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="number" value={heightFt} min={1} max={8} onChange={e => setHFt(+e.target.value)}
                  style={{ width: '70px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>ft</span>
                <input type="number" value={heightIn} min={0} max={11} onChange={e => setHIn(+e.target.value)}
                  style={{ width: '70px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>in</span>
              </div>
            )}
          </div>

          {/* Weight */}
          <div style={{ marginBottom: '26px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
              Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
            </label>
            {unit === 'metric' ? (
              <input type="number" value={weight} min={10} max={400}
                onChange={e => setWeight(+e.target.value)}
                style={{ width: '100px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
              />
            ) : (
              <input type="number" value={weightLb} min={20} max={880}
                onChange={e => setWLb(+e.target.value)}
                style={{ width: '100px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowResult(true)} style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.12s' }}>
              Calculate BMI →
            </button>
            <button onClick={() => { setHCm(170); setWeight(70); setHFt(5); setHIn(7); setWLb(154); setAge(25); setShowResult(false) }}
              style={{ padding: '13px 18px', borderRadius: '10px', border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Reset
            </button>
          </div>

          <FormulaCard
            formula={`BMI = weight (kg) / height² (m²)\nBMI = 703 × weight (lbs) / height² (in²)  [Imperial]`}
            explanation="BMI (Body Mass Index) is a screening tool that uses height and weight to estimate body composition. It is calculated by dividing weight in kilograms by height in metres squared. While widely used, BMI does not directly measure body fat and may not be accurate for athletes, elderly people, or children."
            variables={[
              { symbol: 'weight', meaning: 'in kilograms (or lbs for imperial)' },
              { symbol: 'height', meaning: 'in metres (or inches for imperial)' },
            ]}
          />

          <style>{`.inputs-title { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 18px; padding-bottom: 8px; border-bottom: 0.5px solid var(--border); }`}</style>
        </>
      }

      right={
        <>
          {/* BMI Gauge */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BMIGauge bmi={bmi} />
          </div>

          <BreakdownTable
            title="Your Results"
            rows={[
              { label: 'BMI',          value: bmi.toFixed(1) + ' kg/m²', color: cat.color, bold: true, highlight: true },
              { label: 'Category',     value: cat.label,                  color: cat.color },
              { label: 'BMI Prime',    value: bmiPrime },
              { label: 'Healthy range',value: unit === 'metric' ? `${minHealthy}–${maxHealthy} kg` : `${minHealthyLb}–${maxHealthyLb} lbs` },
            ]}
          />

          {/* WHO Classification table */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '11px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>
              WHO BMI Classification
            </div>
            {BMI_CATEGORIES.map(c => (
              <div key={c.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 14px', borderBottom: '0.5px solid var(--border)',
                background: bmi >= c.min && bmi < c.max ? c.bg : undefined,
              }}>
                <span style={{ fontSize: '11px', color: bmi >= c.min && bmi < c.max ? c.color : 'var(--text-2)', fontWeight: bmi >= c.min && bmi < c.max ? 700 : 400 }}>
                  {c.label}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                  {c.max === Infinity ? `≥ ${c.min}` : `${c.min}–${c.max}`}
                </span>
              </div>
            ))}
          </div>

          {hint && <AIHintCard hint={hint} />}
        </>
      }
    />
  )
}
