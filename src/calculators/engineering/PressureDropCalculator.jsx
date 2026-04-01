import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const FLUIDS = [
  { name: 'Water (20°C)', density: 998.2, viscosity: 1.002e-3 },
  { name: 'Water (60°C)', density: 983.2, viscosity: 0.467e-3 },
  { name: 'Air (20°C)',   density: 1.204,  viscosity: 1.81e-5  },
  { name: 'Glycol 50%',  density: 1065,   viscosity: 6.5e-3   },
]

const ROUGHNESS = [
  { material: 'Commercial steel', eps: 0.046 },
  { material: 'Galvanized steel', eps: 0.15  },
  { material: 'Cast iron',        eps: 0.26  },
  { material: 'Concrete',         eps: 1.0   },
  { material: 'PVC / drawn tubing',eps: 0.0015 },
  { material: 'Copper',           eps: 0.0015 },
]

const FAQ = [
  { q: 'What is the Darcy-Weisbach equation?', a: 'ΔP = f × (L/D) × (ρv²/2). It is the most accurate general formula for pipe pressure drop. The Moody friction factor f depends on Reynolds number (flow regime) and relative pipe roughness (ε/D). For laminar flow, f = 64/Re. For turbulent flow, the Colebrook equation gives f.' },
  { q: 'What is the Colebrook equation?', a: 'The Colebrook equation (1939) is the industry standard for turbulent friction factor: 1/√f = -2log(ε/(3.7D) + 2.51/(Re√f)). It is implicit (f appears on both sides) and requires iteration. The explicit Swamee-Jain approximation f = 0.25/[log(ε/(3.7D) + 5.74/Re⁰·⁹)]² is accurate within 3%.' },
  { q: 'How do I account for fittings and valves?', a: 'Fittings add resistance using either the K-factor method (ΔP = K × ρv²/2) or the equivalent length method (L_eq = K × D/f). Add all fitting losses to the straight pipe loss. Common K values: 90° elbow 0.9, gate valve fully open 0.2, ball valve fully open 0.05, globe valve fully open 10.' },
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

function moodyFriction(Re, epsD) {
  if (Re < 2300) return 64 / Re
  // Swamee-Jain explicit approximation
  return 0.25 / Math.pow(Math.log10(epsD / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2)
}

export default function PressureDropCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [diameter, setDiameter] = useState(50)
  const [length, setLength] = useState(100)
  const [velocity, setVelocity] = useState(1.5)
  const [fluidIdx, setFluidIdx] = useState(0)
  const [matIdx, setMatIdx] = useState(0)
  const [kFittings, setKFittings] = useState(5)
  const [openFaq, setOpenFaq] = useState(null)

  const fluid = FLUIDS[fluidIdx]
  const mat = ROUGHNESS[matIdx]
  const D = diameter / 1000
  const eps = mat.eps / 1000 // convert mm to m
  const epsD = eps / D
  const Re = fluid.density * velocity * D / fluid.viscosity
  const f = moodyFriction(Re, epsD)
  const q = 0.5 * fluid.density * velocity * velocity // dynamic pressure
  const dpPipe = f * (length / D) * q
  const dpFittings = kFittings * q
  const dpTotal = dpPipe + dpFittings
  const dpBar = dpTotal / 1e5
  const dpPsi = dpTotal / 6894.76
  const dpHead = dpTotal / (fluid.density * 9.81)

  const hint = `ΔP = ${(dpTotal/1000).toFixed(2)} kPa (${dpBar.toFixed(3)} bar). Re=${Re.toFixed(0)}, f=${f.toFixed(5)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Darcy-Weisbach Pressure Drop</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>ΔP = f × (L/D) × (ρv²/2)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{(dpTotal/1000).toFixed(2)} kPa</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{dpBar.toFixed(3)} bar · {dpPsi.toFixed(2)} psi</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Pipe inner diameter (mm)', diameter, setDiameter, 1], ['Pipe length (m)', length, setLength, 0.1], ['Flow velocity (m/s)', velocity, setVelocity, 0.01]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step="any" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Fluid</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {FLUIDS.map((fl, i) => (
                <button key={i} onClick={() => setFluidIdx(i)} style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${fluidIdx === i ? C : 'var(--border-2)'}`, background: fluidIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: fluidIdx === i ? 700 : 500, color: fluidIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{fl.name}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Pipe material</label>
            <select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {ROUGHNESS.map((r, i) => <option key={i} value={i}>{r.material} (ε={r.eps}mm)</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Fittings K factor (total)</label>
            <input type="number" step="0.5" value={kFittings} onChange={e => setKFittings(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Pressure drop results" rows={[
            { label: 'Pipe ΔP', value: `${(dpPipe/1000).toFixed(2)} kPa` },
            { label: 'Fittings ΔP', value: `${(dpFittings/1000).toFixed(2)} kPa` },
            { label: 'Total ΔP (kPa)', value: `${(dpTotal/1000).toFixed(2)} kPa`, bold: true, highlight: true, color: C },
            { label: 'Total ΔP (bar)', value: `${dpBar.toFixed(4)} bar` },
            { label: 'Total ΔP (psi)', value: `${dpPsi.toFixed(3)} psi` },
            { label: 'Head loss (m)', value: `${dpHead.toFixed(3)} m` },
            { label: 'Reynolds number', value: Re.toFixed(0) },
            { label: 'Friction factor f', value: f.toFixed(5) },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Fitting K-factor reference" sub="Add these up for total fittings loss">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[['90° elbow (standard)', 0.9], ['45° elbow', 0.4], ['Gate valve (open)', 0.2], ['Ball valve (open)', 0.05], ['Globe valve (open)', 10], ['Check valve', 2.5], ['Tee (branch flow)', 1.8], ['Tee (straight)', 0.4], ['Sudden enlargement', 1.0], ['Sudden contraction', 0.5]].map(([name, k], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-raised)', borderRadius: 7, border: '0.5px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text)' }}>{name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>K={k}</span>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'ΔP = f × (L/D) × (ρv²/2)\nf = 64/Re (laminar)\n1/√f = -2log(ε/3.7D + 2.51/Re√f)\nHead loss = ΔP / (ρg)'}
        variables={[
          { symbol: 'f', meaning: 'Darcy friction factor' },
          { symbol: 'L', meaning: 'Pipe length (m)' },
          { symbol: 'D', meaning: 'Pipe inner diameter (m)' },
          { symbol: 'ε', meaning: 'Pipe roughness (m)' },
          { symbol: 'ρ', meaning: 'Fluid density (kg/m³)' },
        ]}
        explanation="The Darcy-Weisbach equation is the most accurate pipe friction formula. The friction factor f depends on Reynolds number and surface roughness via the Colebrook equation. Add fitting losses using K-factors: ΔP_fittings = K × ρv²/2."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
