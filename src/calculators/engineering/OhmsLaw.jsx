import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6)  return (val/1e6).toFixed(4) + ' M' + unit
  if (abs >= 1e3)  return (val/1e3).toFixed(4) + ' k' + unit
  if (abs >= 1)    return val.toFixed(4) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(4) + ' m' + unit
  if (abs >= 1e-6) return (val*1e6).toFixed(4) + ' μ' + unit
  return val.toExponential(3) + ' ' + unit
}

const SOLVE_FOR = ['Voltage (V)', 'Current (I)', 'Resistance (R)', 'Power (P)']

export default function OhmsLaw() {
  const [solveFor, setSolveFor] = useState(0)
  const [vals, setVals] = useState({ V: '', I: '', R: '', P: '' })

  function setVal(k, v) { setVals(prev => ({ ...prev, [k]: v })) }
  const n = k => parseFloat(vals[k]) || null

  // Compute the unknown
  let V = n('V'), I = n('I'), R = n('R'), P = n('P')
  let result = null, resultUnit = '', resultLabel = ''

  if (solveFor === 0) { // Solve V
    if (I && R)       { result = I * R;          resultUnit = 'V'; resultLabel = 'Voltage' }
    else if (P && I)  { result = P / I;           resultUnit = 'V'; resultLabel = 'Voltage' }
    else if (P && R)  { result = Math.sqrt(P*R);  resultUnit = 'V'; resultLabel = 'Voltage' }
  } else if (solveFor === 1) { // Solve I
    if (V && R)       { result = V / R;           resultUnit = 'A'; resultLabel = 'Current' }
    else if (P && V)  { result = P / V;           resultUnit = 'A'; resultLabel = 'Current' }
    else if (P && R)  { result = Math.sqrt(P/R);  resultUnit = 'A'; resultLabel = 'Current' }
  } else if (solveFor === 2) { // Solve R
    if (V && I)       { result = V / I;           resultUnit = 'Ω'; resultLabel = 'Resistance' }
    else if (V && P)  { result = (V*V) / P;       resultUnit = 'Ω'; resultLabel = 'Resistance' }
    else if (P && I)  { result = P / (I*I);       resultUnit = 'Ω'; resultLabel = 'Resistance' }
  } else { // Solve P
    if (V && I)       { result = V * I;           resultUnit = 'W'; resultLabel = 'Power' }
    else if (V && R)  { result = (V*V) / R;       resultUnit = 'W'; resultLabel = 'Power' }
    else if (I && R)  { result = I*I * R;         resultUnit = 'W'; resultLabel = 'Power' }
  }

  // Derive all 4 from result
  let dV = V, dI = I, dR = R, dP = P
  if (result !== null) {
    if (solveFor === 0) dV = result
    if (solveFor === 1) dI = result
    if (solveFor === 2) dR = result
    if (solveFor === 3) dP = result
    if (!dP && dV && dI) dP = dV * dI
    if (!dP && dV && dR) dP = dV*dV/dR
    if (!dP && dI && dR) dP = dI*dI*dR
  }

  const hint = result !== null
    ? `${resultLabel}: ${fmtSI(result, resultUnit)}. ${dP ? `Power dissipated: ${fmtSI(dP, 'W')}.` : ''} This follows Ohm's Law: V = I × R.`
    : 'Enter any two known values to solve for the remaining quantities.'

  const inputs = [
    { key: 'V', label: 'Voltage',    unit: 'V', color: '#f59e0b' },
    { key: 'I', label: 'Current',    unit: 'A', color: '#3b82f6' },
    { key: 'R', label: 'Resistance', unit: 'Ω', color: '#6366f1' },
    { key: 'P', label: 'Power',      unit: 'W', color: '#10b981' },
  ]

  return (
    <CalcShell
      left={
        <>
          <div className="inputs-title">Solve For</div>

          {/* Solve for selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '22px' }}>
            {SOLVE_FOR.map((label, i) => (
              <button key={label} onClick={() => setSolveFor(i)} style={{
                padding: '9px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 500,
                border: '1.5px solid', borderColor: solveFor===i ? '#f59e0b' : 'var(--border)',
                background: solveFor===i ? '#fef3c7' : 'var(--bg-raised)',
                color: solveFor===i ? '#d97706' : 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'DM Sans',
              }}>{label}</button>
            ))}
          </div>

          {/* Known value inputs */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enter 2 Known Values
          </div>
          {inputs.filter(f => f.key !== ['V','I','R','P'][solveFor]).map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: f.color + '25', color: f.color, fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.key}</span>
                {f.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" value={vals[f.key]} onChange={e => setVal(f.key, e.target.value)} placeholder="Enter value"
                  style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '9px', padding: '10px 14px', fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans', color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', maxWidth: '180px' }}
                  onFocus={e => e.target.style.borderColor = f.color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <span style={{ fontSize: '14px', fontWeight: 700, color: f.color }}>{f.unit}</span>
              </div>
            </div>
          ))}

          <button onClick={() => setVals({ V: '', I: '', R: '', P: '' })}
            style={{ padding: '10px 18px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans' }}>
            Clear All
          </button>

          <FormulaCard
            formula={`V = I × R\nI = V / R\nR = V / I\nP = V × I = I² × R = V²/R`}
            variables={[
              { symbol: 'V', meaning: 'Voltage in Volts (V)' },
              { symbol: 'I', meaning: 'Current in Amperes (A)' },
              { symbol: 'R', meaning: 'Resistance in Ohms (Ω)' },
              { symbol: 'P', meaning: 'Power in Watts (W)' },
            ]}
            explanation="Ohm's Law states that the current through a conductor between two points is proportional to the voltage across those points. The constant of proportionality is the resistance. Power is the rate of energy transfer and can be derived from any two of the three electrical quantities."
          />
          <style>{`.inputs-title{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:18px;padding-bottom:8px;border-bottom:.5px solid var(--border)}`}</style>
        </>
      }
      right={
        <>
          {result !== null ? (
            <div style={{ background: `linear-gradient(135deg, #f59e0b, #d97706)`, borderRadius: '14px', padding: '22px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>{resultLabel}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '6px' }}>{fmtSI(result, resultUnit)}</div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '0.5px dashed var(--border)', borderRadius: '14px', padding: '40px 24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              Enter 2 known values to calculate the unknown
            </div>
          )}

          {result !== null && (
            <BreakdownTable title="All Values" rows={[
              { label: 'Voltage (V)',    value: fmtSI(dV, 'V'), color: '#f59e0b' },
              { label: 'Current (I)',    value: fmtSI(dI, 'A'), color: '#3b82f6' },
              { label: 'Resistance (R)', value: fmtSI(dR, 'Ω'), color: '#6366f1' },
              { label: 'Power (P)',      value: fmtSI(dP, 'W'), color: '#10b981' },
            ]} />
          )}

          {/* Visual circuit diagram */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Ohm's Law Triangle</div>
            <svg width="160" height="140" viewBox="0 0 160 140" style={{ display: 'block', margin: '0 auto' }}>
              {/* Triangle */}
              <polygon points="80,10 155,130 5,130" fill="none" stroke="var(--border-2)" strokeWidth="1.5"/>
              {/* V at top */}
              <circle cx="80" cy="10" r="14" fill="#fef3c7"/>
              <text x="80" y="15" textAnchor="middle" fontSize="13" fontWeight="800" fill="#d97706">V</text>
              {/* I bottom left */}
              <circle cx="20" cy="130" r="14" fill="#dbeafe"/>
              <text x="20" y="135" textAnchor="middle" fontSize="13" fontWeight="800" fill="#2563eb">I</text>
              {/* R bottom right */}
              <circle cx="140" cy="130" r="14" fill="#e0e7ff"/>
              <text x="140" y="135" textAnchor="middle" fontSize="13" fontWeight="800" fill="#4338ca">R</text>
              {/* Labels */}
              <text x="45" y="78" textAnchor="middle" fontSize="9" fill="var(--text-3)" transform="rotate(-55,45,78)">V = I×R</text>
              <text x="115" y="78" textAnchor="middle" fontSize="9" fill="var(--text-3)" transform="rotate(55,115,78)">I = V/R</text>
              <text x="80" y="125" textAnchor="middle" fontSize="9" fill="var(--text-3)">R = V/I</text>
            </svg>
          </div>

          <AIHintCard hint={hint} />
        </>
      }
    />
  )
}
