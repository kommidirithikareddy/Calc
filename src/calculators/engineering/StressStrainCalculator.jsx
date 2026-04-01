import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const MATERIALS = [
  { name: 'Structural Steel', E: 200e9, fy: 250e6, fu: 400e6, color: '#6366f1' },
  { name: 'Aluminum 6061', E: 69e9, fy: 276e6, fu: 310e6, color: '#3b82f6' },
  { name: 'Concrete (C30)', E: 30e9, fy: 30e6, fu: 30e6, color: '#78716c' },
  { name: 'Copper', E: 117e9, fy: 70e6, fu: 220e6, color: '#f97316' },
  { name: 'Titanium', E: 116e9, fy: 880e6, fu: 950e6, color: '#10b981' },
  { name: 'Nylon', E: 3e9, fy: 45e6, fu: 75e6, color: '#8b5cf6' },
]

const LOAD_TYPES = [
  { id: 'tension', label: 'Tension', icon: '↔️' },
  { id: 'compression', label: 'Compression', icon: '⬅️➡️' },
  { id: 'shear', label: 'Shear', icon: '↕️' },
]

const FAQ = [
  { q: 'What is the difference between stress and strain?', a: 'Stress (σ) is the internal force per unit area within a material: σ = F/A, measured in Pascals (Pa). Strain (ε) is the resulting deformation per unit length: ε = ΔL/L, dimensionless. They are related by Young\'s modulus: E = σ/ε. Stress is the cause; strain is the effect.' },
  { q: 'What is yield strength vs ultimate tensile strength?', a: 'Yield strength (σy) is the stress at which a material begins to deform permanently — the elastic limit. Below yield, the material springs back; above it, permanent deformation occurs. Ultimate tensile strength (UTS) is the maximum stress before fracture. Design codes typically require stress < σy/safety factor.' },
  { q: 'What is factor of safety?', a: 'Factor of safety (FoS) = Material strength / Applied stress. FoS = 1.0 means right at the limit — any overload causes failure. Buildings typically use FoS of 1.5–3.0. Aerospace may use 1.25–1.5 (weight-critical). Pressure vessels use 4.0 or higher. A higher FoS means more conservative, heavier, but safer design.' },
  { q: 'What is shear stress?', a: 'Shear stress (τ) acts parallel to the cross-section, unlike normal stress which acts perpendicular. Formula: τ = V/A (average shear) or τ = F/A for direct shear. Shear modulus G = E / (2(1+ν)) relates shear stress to shear strain. Bolts and welds typically fail in shear.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function StressStrainCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [force, setForce] = useState(10000)
  const [width, setWidth] = useState(50)
  const [height, setHeight] = useState(50)
  const [origLen, setOrigLen] = useState(1000)
  const [matIdx, setMatIdx] = useState(0)
  const [loadType, setLoadType] = useState('tension')
  const [fos, setFos] = useState(2)
  const [openFaq, setOpenFaq] = useState(null)

  const mat = MATERIALS[matIdx]
  const area = (width / 1000) * (height / 1000) // m²
  const normalStress = force / area
  const shearStress = loadType === 'shear' ? force / area : null
  const stress = loadType === 'shear' ? shearStress : normalStress
  const strain = mat.E > 0 ? normalStress / mat.E : 0
  const deltaL = strain * origLen // mm
  const poissonsRatio = 0.3
  const lateralStrain = -poissonsRatio * strain
  const actualFoS = mat.fy / normalStress
  const allowableStress = mat.fy / fos
  const isOk = normalStress < allowableStress
  const utilization = normalStress / allowableStress * 100

  const hint = `σ = ${(normalStress/1e6).toFixed(2)} MPa, ε = ${(strain*1e6).toFixed(1)} με. FoS = ${actualFoS.toFixed(2)}. ${isOk ? 'PASS — within allowable stress.' : 'FAIL — exceeds allowable stress!'}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Stress & Strain</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>σ = F/A · ε = ΔL/L · E = σ/ε</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ padding: '8px 14px', background: isOk ? '#d1fae5' : '#fee2e2', borderRadius: 10, textAlign: 'center', border: `1px solid ${isOk ? '#10b981' : '#ef4444'}30` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: isOk ? '#10b981' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{(normalStress/1e6).toFixed(2)} MPa</div>
            <div style={{ fontSize: 10, color: isOk ? '#065f46' : '#b91c1c', fontWeight: 600 }}>{isOk ? '✓ PASS' : '✗ FAIL'}</div>
          </div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Load type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {LOAD_TYPES.map(lt => (
                <button key={lt.id} onClick={() => setLoadType(lt.id)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${loadType === lt.id ? C : 'var(--border-2)'}`, background: loadType === lt.id ? C + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: loadType === lt.id ? 700 : 500, color: loadType === lt.id ? C : 'var(--text-2)', cursor: 'pointer' }}>
                  {lt.icon} {lt.label}
                </button>
              ))}
            </div>
          </div>

          {[['Applied force (N)', force, setForce, 1], ['Cross-section width (mm)', width, setWidth, 1], ['Cross-section height (mm)', height, setHeight, 1], ['Original length (mm)', origLen, setOrigLen, 1]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Material</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MATERIALS.map((m, i) => (
                <button key={i} onClick={() => setMatIdx(i)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${matIdx === i ? m.color : 'var(--border-2)'}`, background: matIdx === i ? m.color + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: matIdx === i ? 700 : 500, color: matIdx === i ? m.color : 'var(--text)' }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>E={m.E/1e9}GPa</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Design factor of safety: {fos}</label>
            <input type="range" min="1" max="5" step="0.1" value={fos} onChange={e => setFos(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}

        right={<>
          <div style={{ padding: '14px 16px', background: isOk ? '#d1fae5' : '#fee2e2', borderRadius: 12, border: `1px solid ${isOk ? '#10b981' : '#ef4444'}30`, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isOk ? '#065f46' : '#b91c1c', marginBottom: 6 }}>UTILIZATION: {utilization.toFixed(1)}%</div>
            <div style={{ height: 10, background: isOk ? '#a7f3d0' : '#fca5a5', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(utilization, 100)}%`, background: isOk ? '#10b981' : '#ef4444', borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 11, color: isOk ? '#065f46' : '#b91c1c', marginTop: 5 }}>
              {isOk ? `✓ ${(100 - utilization).toFixed(1)}% reserve capacity` : `✗ Exceeds allowable by ${(utilization - 100).toFixed(1)}%`}
            </div>
          </div>

          <BreakdownTable title="Results" rows={[
            { label: 'Cross-section area', value: `${(area * 1e6).toFixed(1)} mm²` },
            { label: 'Normal stress (σ)', value: `${(normalStress/1e6).toFixed(3)} MPa`, bold: true, highlight: true, color: isOk ? '#10b981' : '#ef4444' },
            { label: 'Axial strain (ε)', value: `${(strain * 1e6).toFixed(2)} με` },
            { label: 'Elongation (ΔL)', value: `${deltaL.toFixed(4)} mm` },
            { label: 'Lateral strain', value: `${(lateralStrain * 1e6).toFixed(2)} με` },
            { label: 'Young\'s modulus (E)', value: `${mat.E/1e9} GPa` },
            { label: 'Yield strength', value: `${mat.fy/1e6} MPa` },
            { label: 'Actual FoS', value: actualFoS.toFixed(2) },
            { label: 'Allowable stress', value: `${(allowableStress/1e6).toFixed(2)} MPa` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Material properties comparison" sub="Common engineering materials">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Material', 'E (GPa)', 'σy (MPa)', 'UTS (MPa)', 'Density'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {MATERIALS.map((m, i) => (
                <tr key={i} style={{ background: matIdx === i ? C + '08' : 'transparent', cursor: 'pointer' }} onClick={() => setMatIdx(i)}>
                  <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: matIdx === i ? 700 : 400, color: matIdx === i ? m.color : 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                      {m.name}
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: C, fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)', fontWeight: 700 }}>{m.E/1e9}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{m.fy/1e6}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{m.fu/1e6}</td>
                  <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Stress-strain diagram" sub="Idealized elastic-plastic behavior">
        <svg viewBox="0 0 320 180" style={{ width: '100%', maxWidth: 320 }}>
          <line x1="40" y1="160" x2="300" y2="160" stroke="var(--border-2)" strokeWidth="1"/>
          <line x1="40" y1="20" x2="40" y2="160" stroke="var(--border-2)" strokeWidth="1"/>
          <text x="170" y="175" textAnchor="middle" fontSize="10" fill="var(--text-3)">Strain (ε)</text>
          <text x="15" y="95" textAnchor="middle" fontSize="10" fill="var(--text-3)" transform="rotate(-90,15,95)">Stress (σ)</text>
          <polyline points="40,160 120,60 150,55 280,55" fill="none" stroke={C} strokeWidth="2"/>
          <circle cx="120" cy="60" r="4" fill={C}/>
          <text x="120" y="52" textAnchor="middle" fontSize="9" fill={C}>σy</text>
          <line x1="40" y1="55" x2="280" y2="55" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3"/>
          <text x="285" y="58" fontSize="9" fill="#ef4444">UTS</text>
          {/* Current stress point */}
          {normalStress < mat.fy && (
            <>
              <line x1={40 + Math.min(strain * 1e6 * 200, 80)} y1="160" x2={40 + Math.min(strain * 1e6 * 200, 80)} y2={160 - Math.min(normalStress/mat.fy * 100, 100)} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,2"/>
              <circle cx={40 + Math.min(strain * 1e6 * 200, 80)} cy={160 - Math.min(normalStress/mat.fy * 100, 100)} r="5" fill="#3b82f6"/>
              <text x={40 + Math.min(strain * 1e6 * 200, 80)} y={155 - Math.min(normalStress/mat.fy * 100, 100)} fontSize="9" fill="#3b82f6" textAnchor="middle">You</text>
            </>
          )}
        </svg>
      </Sec>

      <FormulaCard
        formula={'σ = F / A (normal stress)\nτ = V / A (shear stress)\nε = ΔL / L (strain)\nE = σ / ε (Young\'s modulus)\nFoS = σy / σ_applied'}
        variables={[
          { symbol: 'σ', meaning: 'Normal stress (Pa or MPa)' },
          { symbol: 'F', meaning: 'Applied force (N)' },
          { symbol: 'A', meaning: 'Cross-sectional area (m²)' },
          { symbol: 'ε', meaning: 'Strain (dimensionless)' },
          { symbol: 'E', meaning: 'Young\'s modulus (Pa)' },
        ]}
        explanation="Stress is force per unit area; strain is the deformation per unit length. Young's modulus (elastic modulus) is the slope of the stress-strain curve in the elastic region. Design requires that applied stress stays well below yield strength, with margin defined by the factor of safety."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
