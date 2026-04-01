import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function Sec({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

const MATERIALS = [
  { name: 'Steel', rho: 7850 }, { name: 'Aluminum', rho: 2700 }, { name: 'Copper', rho: 8960 },
  { name: 'Cast iron', rho: 7200 }, { name: 'Titanium', rho: 4500 }, { name: 'Brass', rho: 8500 },
  { name: 'Concrete', rho: 2400 }, { name: 'Water', rho: 1000 }, { name: 'Air (20°C)', rho: 1.204 },
  { name: 'Oak wood', rho: 750 }, { name: 'PVC', rho: 1380 }, { name: 'HDPE', rho: 960 },
  { name: 'Glass', rho: 2500 }, { name: 'Rubber', rho: 1200 }, { name: 'Lead', rho: 11340 },
]
const SOLVE = ['Density (ρ)', 'Mass (m)', 'Volume (V)']
const FAQ = [
  { q: 'What is density?', a: 'Density (ρ = m/V) is mass per unit volume in kg/m³ (SI) or lb/ft³ (imperial). It determines how heavy an object is for its size. Engineers use density for weight estimation, buoyancy calculations, and material selection. Steel is ~7850 kg/m³ vs aluminum at ~2700 kg/m³ — aluminum is 65% lighter.' },
  { q: 'How do I convert between kg/m³ and g/cm³?', a: '1 g/cm³ = 1000 kg/m³. Water = 1 g/cm³ = 1000 kg/m³. Steel = 7.85 g/cm³ = 7850 kg/m³. Lb/ft³: divide kg/m³ by 16.018. So steel = 490 lb/ft³.' },
  { q: 'What is specific gravity?', a: 'Specific gravity (SG) = density of material / density of water (1000 kg/m³). SG is dimensionless. Steel SG = 7.85. A material with SG < 1 floats in water. SG > 1 sinks. Same as relative density.' },
]
export default function MaterialDensityCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [rho, setRho] = useState(7850)
  const [mass, setMass] = useState(78.5)
  const [volume, setVolume] = useState(0.01)
  const [matIdx, setMatIdx] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  let density, m, v
  if (solveIdx === 0) { m = mass; v = volume; density = m / v }
  else if (solveIdx === 1) { density = rho; v = volume; m = density * v }
  else { density = rho; m = mass; v = m / density }

  const sg = density / 1000
  const mat = MATERIALS[matIdx]

  const hint = `ρ=${density.toFixed(0)} kg/m³, m=${m.toFixed(3)} kg, V=${v.toFixed(5)} m³. SG=${sg.toFixed(3)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Material Density</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>ρ = m / V</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Density', v: `${density.toFixed(0)} kg/m³` }, { l: 'SG', v: sg.toFixed(3) }].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{item.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>
      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SOLVE.map((s, i) => (
                <button key={i} onClick={() => setSolveIdx(i)} style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${solveIdx === i ? C : 'var(--border-2)'}`, background: solveIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
              ))}
            </div>
          </div>
          {solveIdx !== 0 && (<div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Density ρ (kg/m³)</label>
            <input type="number" value={rho} onChange={e => setRho(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>)}
          {solveIdx !== 1 && (<div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Mass m (kg)</label>
            <input type="number" step="any" value={mass} onChange={e => setMass(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>)}
          {solveIdx !== 2 && (<div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Volume V (m³)</label>
            <input type="number" step="any" value={volume} onChange={e => setVolume(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>)}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Material presets</label>
            <select value={matIdx} onChange={e => { setMatIdx(+e.target.value); setRho(MATERIALS[+e.target.value].rho) }} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name} ({m.rho} kg/m³)</option>)}
            </select>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Results" rows={[
            { label: 'Density ρ', value: `${density.toFixed(0)} kg/m³`, bold: true, highlight: true, color: C },
            { label: 'Density (g/cm³)', value: (density/1000).toFixed(3) },
            { label: 'Density (lb/ft³)', value: (density/16.018).toFixed(2) },
            { label: 'Mass m', value: `${m.toFixed(4)} kg` },
            { label: 'Volume V', value: `${v.toFixed(6)} m³` },
            { label: 'Specific gravity', value: sg.toFixed(4) },
            { label: 'Floats in water?', value: sg < 1 ? '✓ Yes (SG<1)' : '✗ No (SG>1)' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Common material densities">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {MATERIALS.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '5px 8px', borderRadius: 7, background: i === matIdx ? C + '10' : 'transparent' }} onClick={() => { setMatIdx(i); setRho(m.rho) }}>
              <span style={{ fontSize: 12, color: 'var(--text)', minWidth: 140 }}>{m.name}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${Math.min(100, m.rho / 11340 * 100)}%`, background: i === matIdx ? C : '#9ca3af', borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C, minWidth: 80, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{m.rho.toLocaleString()} kg/m³</span>
            </div>
          ))}
        </div>
      </Sec>
      <FormulaCard formula={"ρ = m / V\nm = ρ × V\nV = m / ρ\nSG = ρ / ρ_water"} variables={[{ symbol: 'ρ', meaning: 'Density (kg/m³)' }, { symbol: 'm', meaning: 'Mass (kg)' }, { symbol: 'V', meaning: 'Volume (m³)' }]} explanation="Density is a fundamental material property. The triangle formula ρ = m/V lets you solve for any one variable given the other two. Specific gravity (SG) compares to water density — materials with SG<1 float." />
      <Sec title="Frequently asked questions">{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</Sec>
    </div>
  )
}
