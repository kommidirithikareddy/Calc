import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is mechanical work?', a: 'Work = Force × Distance × cos(θ), where θ is the angle between force and displacement. Only the component of force in the direction of motion does work. Lifting a box upward while walking sideways — only the upward force does work against gravity, not the sideward force.' },
  { q: 'What is the work-energy theorem?', a: 'The net work done on an object equals its change in kinetic energy: W_net = ΔKE = ½mv² − ½mv₀². This is one of the most powerful principles in physics — it lets you calculate speed changes without knowing the detailed motion, just the net work done.' },
  { q: 'What is power?', a: 'Power is the rate of doing work: P = W/t (average power) or P = F·v (instantaneous power). Unit is watts (W) = J/s. 1 horsepower = 745.7W. High power doesn\'t mean high force — a car engine can do enormous work slowly (high force, low speed) or quickly (moderate force, high speed).' },
  { q: 'What is efficiency?', a: 'Mechanical efficiency = useful output work / total input work × 100%. A pulley system with 85% efficiency converts 85% of input work to useful lifting work; 15% is lost to friction and heat. No real machine is 100% efficient. Efficiency < 1 is mandated by the second law of thermodynamics.' },
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

export default function WorkCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [force, setForce] = useState(500)
  const [distance, setDistance] = useState(10)
  const [angle, setAngle] = useState(0)
  const [time, setTime] = useState(5)
  const [efficiency, setEfficiency] = useState(85)
  const [openFaq, setOpenFaq] = useState(null)

  const theta = angle * Math.PI / 180
  const work = force * distance * Math.cos(theta)
  const power = work / time
  const power_kW = power / 1000
  const power_hp = power / 745.699
  const usefulWork = work * (efficiency / 100)
  const lossWork = work - usefulWork
  const work_ftlb = work * 0.737562
  const work_BTU = work / 1055.06
  const work_kWh = work / 3600000

  const hint = `W = ${work.toFixed(2)} J at ${angle}°. P = ${power.toFixed(2)} W = ${power_hp.toFixed(3)} HP. Useful work = ${usefulWork.toFixed(2)} J (${efficiency}% efficiency).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Mechanical Work & Power</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>W = F·d·cos(θ) · P = W/t</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Work', v: `${work.toFixed(1)} J` }, { l: 'Power', v: `${power.toFixed(1)} W` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          {[['Applied force (N)', force, setForce, 0.001], ['Distance (m)', distance, setDistance, 0.001], ['Time (s)', time, setTime, 0.001]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step="any" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Force angle to displacement: {angle}°</label>
            <input type="range" min="0" max="180" value={angle} onChange={e => setAngle(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
              <span>0° (max work)</span><span>90° (no work)</span><span>180° (negative)</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Mechanical efficiency: {efficiency}%</label>
            <input type="range" min="1" max="100" value={efficiency} onChange={e => setEfficiency(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}

        right={<>
          <BreakdownTable title="Work & power results" rows={[
            { label: 'Work (J)', value: `${work.toFixed(3)} J`, bold: true, highlight: true, color: C },
            { label: 'Work (ft·lb)', value: `${work_ftlb.toFixed(3)} ft·lb` },
            { label: 'Work (BTU)', value: `${work_BTU.toFixed(6)} BTU` },
            { label: 'Work (kWh)', value: `${work_kWh.toExponential(3)} kWh` },
            { label: 'Power (W)', value: `${power.toFixed(3)} W` },
            { label: 'Power (kW)', value: `${power_kW.toFixed(4)} kW` },
            { label: 'Power (HP)', value: `${power_hp.toFixed(4)} HP` },
            { label: 'Useful work', value: `${usefulWork.toFixed(3)} J (${efficiency}%)` },
            { label: 'Loss (friction/heat)', value: `${lossWork.toFixed(3)} J` },
          ]} />

          {/* Angle effect visualization */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Work = F × d × cos({angle}°) = {Math.cos(theta).toFixed(3)} × {force} × {distance}</div>
            <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(0, Math.cos(theta) * 100)}%`, background: Math.cos(theta) < 0 ? '#ef4444' : C, borderRadius: 6, transition: 'width .3s' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
              {Math.cos(theta) >= 0 ? `Positive work (cos${angle}° = ${Math.cos(theta).toFixed(3)})` : `Negative work — force opposes motion!`}
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Work & energy examples">
        {[['Lifting 50 kg by 2 m', 50 * 9.81 * 2], ['Pushing car 100 m with 200 N', 200 * 100], ['Compressing spring 0.1 m with 500 N', 500 * 0.1 * 0.5], ['Electric motor 1 kW × 1 hour', 3600000]].map(([desc, W], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{desc}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{W >= 1000 ? (W/1000).toFixed(2) + ' kJ' : W.toFixed(1) + ' J'}</span>
          </div>
        ))}
      </Sec>

      <FormulaCard
        formula={'W = F × d × cos(θ)\nP = W / t = F × v\nη = W_out / W_in × 100%\nΔKE = ½mv² − ½mv₀² = W_net'}
        variables={[
          { symbol: 'W', meaning: 'Work done (Joules = N·m)' },
          { symbol: 'F', meaning: 'Applied force (N)' },
          { symbol: 'd', meaning: 'Displacement (m)' },
          { symbol: 'θ', meaning: 'Angle between force and displacement' },
          { symbol: 'P', meaning: 'Power (Watts = J/s)' },
          { symbol: 'η', meaning: 'Mechanical efficiency (%)' },
        ]}
        explanation="Work is only done when a force causes displacement in the direction of the force. At 90°, no work is done (e.g., carrying a bag horizontally — you push upward, move sideways). Negative work means the force opposes motion. The work-energy theorem connects work to kinetic energy change."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
