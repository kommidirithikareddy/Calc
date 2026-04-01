import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const FLUIDS = [
  { name: 'Water (20°C)', density: 998.2, viscosity: 1.002e-3, color: '#3b82f6' },
  { name: 'Water (60°C)', density: 983.2, viscosity: 0.467e-3, color: '#3b82f6' },
  { name: 'Air (20°C)',   density: 1.204,  viscosity: 1.81e-5,  color: '#9ca3af' },
  { name: 'Oil (SAE 10)', density: 870,    viscosity: 65e-3,    color: '#d97706' },
  { name: 'Oil (SAE 30)', density: 880,    viscosity: 100e-3,   color: '#d97706' },
  { name: 'Glycol (50%)', density: 1065,   viscosity: 6.5e-3,   color: '#10b981' },
  { name: 'Mercury',      density: 13534,  viscosity: 1.53e-3,  color: '#6366f1' },
]

const FAQ = [
  { q: 'What does the Reynolds number tell you?', a: 'Reynolds number (Re) predicts whether flow is laminar (smooth, Re < 2300), transitional (2300–4000), or turbulent (Re > 4000). This determines the friction factor for pressure drop calculations, heat transfer coefficients, and mixing behavior. It is arguably the most important dimensionless number in fluid mechanics.' },
  { q: 'Why does turbulent flow matter in engineering?', a: 'Turbulent flow increases pressure drop (more pumping energy needed), but also increases heat and mass transfer (better mixing). Heat exchangers deliberately operate in turbulent regime for efficiency. Pipe designers must account for the much higher friction factors in turbulent flow vs laminar.' },
  { q: 'What is kinematic viscosity?', a: 'Kinematic viscosity ν = μ/ρ (dynamic viscosity / density), measured in m²/s (or cSt — centistokes). It appears directly in the Reynolds number formula: Re = vD/ν. Water at 20°C has ν = 1.004×10⁻⁶ m²/s (1.004 cSt). Motor oil is ~100 times more viscous.' },
  { q: 'How does temperature affect the Reynolds number?', a: 'Increasing temperature decreases viscosity (for liquids) which increases Re — making turbulent flow more likely. For water at 20°C, ν = 1 cSt; at 80°C, ν ≈ 0.36 cSt — flow at the same velocity is nearly 3× more turbulent. This is why hot water systems need different hydraulic design.' },
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

export default function ReynoldsNumberCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [velocity, setVelocity] = useState(1.5)
  const [diameter, setDiameter] = useState(50)
  const [fluidIdx, setFluidIdx] = useState(0)
  const [customDensity, setCustomDensity] = useState(998.2)
  const [customViscosity, setCustomViscosity] = useState(1.002e-3)
  const [useCustom, setUseCustom] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const fluid = useCustom ? { name: 'Custom', density: customDensity, viscosity: customViscosity, color: C } : FLUIDS[fluidIdx]
  const D = diameter / 1000
  const Re = (fluid.density * velocity * D) / fluid.viscosity
  const kinViscosity = fluid.viscosity / fluid.density

  const regime = Re < 2300 ? { label: 'Laminar', color: '#10b981', bg: '#d1fae5', desc: 'Smooth, orderly flow. Fluid flows in parallel layers. Low mixing and heat transfer.' }
    : Re < 4000 ? { label: 'Transitional', color: '#f59e0b', bg: '#fef3c7', desc: 'Unstable flow switching between laminar and turbulent. Unpredictable in this range.' }
    : { label: 'Turbulent', color: '#ef4444', bg: '#fee2e2', desc: 'Chaotic, irregular flow with mixing and eddies. Higher pressure drop but better heat transfer.' }

  // Darcy friction factor
  const f = Re < 2300 ? 64 / Re : 0.316 * Math.pow(Re, -0.25) // Blasius for smooth pipes

  const hint = `Re = ${Re.toFixed(0)} — ${regime.label} flow. Fluid: ${fluid.name}, v=${velocity}m/s, D=${diameter}mm. Friction factor f=${f.toFixed(5)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Reynolds Number</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Re = ρvD / μ = vD / ν</div>
        </div>
        <div style={{ padding: '10px 18px', background: regime.bg, borderRadius: 10, textAlign: 'right', border: `1px solid ${regime.color}30` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: regime.color, fontFamily: "'Space Grotesk',sans-serif" }}>{Re.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: regime.color, fontWeight: 700 }}>{regime.label}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Flow velocity (m/s)', velocity, setVelocity, 0.001, 100], ['Pipe/hydraulic diameter (mm)', diameter, setDiameter, 1, 5000]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step="0.01" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Fluid</label>
              <button onClick={() => setUseCustom(!useCustom)}
                style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${useCustom ? C : 'var(--border-2)'}`, background: useCustom ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: useCustom ? C : 'var(--text-2)', cursor: 'pointer' }}>Custom</button>
            </div>
            {!useCustom ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {FLUIDS.map((fl, i) => (
                  <button key={i} onClick={() => setFluidIdx(i)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${fluidIdx === i ? fl.color : 'var(--border-2)'}`, background: fluidIdx === i ? fl.color + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 12, fontWeight: fluidIdx === i ? 700 : 500, color: fluidIdx === i ? fl.color : 'var(--text)' }}>{fl.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{fl.viscosity.toExponential(2)} Pa·s</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {[['Density (kg/m³)', customDensity, setCustomDensity], ['Dynamic viscosity (Pa·s)', customViscosity, setCustomViscosity]].map(([l, v, set]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input type="number" step="any" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </>
            )}
          </div>
        </>}
        right={<>
          <div style={{ background: regime.bg, border: `1.5px solid ${regime.color}40`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: regime.color, fontFamily: "'Space Grotesk',sans-serif" }}>Re = {Re.toFixed(0)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: regime.color, marginTop: 4 }}>{regime.label} Flow</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '8px 0 0', fontFamily: "'DM Sans',sans-serif" }}>{regime.desc}</p>
          </div>

          {/* Re scale visualization */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Flow regime scale</div>
            <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'linear-gradient(to right, #10b981, #f59e0b 30%, #ef4444 50%, #dc2626)', marginBottom: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)' }}>
              <span>0</span><span>2300 Laminar</span><span>4000</span><span>10⁵+</span>
            </div>
          </div>

          <BreakdownTable title="Derived values" rows={[
            { label: 'Reynolds number', value: Re.toFixed(0), bold: true, highlight: true, color: regime.color },
            { label: 'Flow regime', value: regime.label },
            { label: 'Darcy friction factor', value: f.toFixed(5) },
            { label: 'Kinematic viscosity', value: kinViscosity.toExponential(3) + ' m²/s' },
            { label: 'Density', value: `${fluid.density} kg/m³` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Re vs friction factor" sub="Moody diagram summary">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ label: 'Laminar (Re < 2300)', f: `f = 64/Re = ${(64/Math.max(Re,100)).toFixed(4)}`, color: '#10b981' },
            { label: 'Turbulent smooth (Blasius)', f: `f = 0.316·Re⁻⁰·²⁵ = ${(0.316*Math.pow(Math.max(Re,4001),-0.25)).toFixed(4)}`, color: '#ef4444' },
            { label: 'Turbulent (Colebrook-White)', f: 'Requires pipe roughness ε', color: '#6366f1' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 13px', borderRadius: 9, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, fontFamily: "'Space Grotesk',sans-serif" }}>{r.f}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Re = ρ × v × D / μ\nRe = v × D / ν\nν = μ / ρ\nLaminar: Re < 2300\nTurbulent: Re > 4000'}
        variables={[
          { symbol: 'Re', meaning: 'Reynolds number (dimensionless)' },
          { symbol: 'ρ', meaning: 'Fluid density (kg/m³)' },
          { symbol: 'v', meaning: 'Mean flow velocity (m/s)' },
          { symbol: 'D', meaning: 'Hydraulic diameter (m)' },
          { symbol: 'μ', meaning: 'Dynamic viscosity (Pa·s)' },
          { symbol: 'ν', meaning: 'Kinematic viscosity = μ/ρ (m²/s)' },
        ]}
        explanation="Reynolds number is the ratio of inertial forces to viscous forces. At low Re, viscous forces dominate and flow is laminar. At high Re, inertial forces dominate and flow becomes turbulent. The transition zone (2300–4000) is unpredictable and avoided in critical applications."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
